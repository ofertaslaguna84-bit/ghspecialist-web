#!/usr/bin/env node
/**
 * Genera un artículo de blog con IA (DeepSeek / Qwen primero — baratos).
 * CI: secrets DEEPSEEK_API_KEY y/o QWEN_API_KEY + BLOG_GENERATE_SECRET.
 */
import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { pingSearchEngines } from './indexnow.mjs';
import { assertBlogClientSecret } from './gh-blog-secret.mjs';
import { isComparativeBrief } from './gh-blog-topic-resolve.mjs';
import { prepareBlogGeneration, prepareBlogAuto, parseBlogMarket } from './gh-blog-prepare.mjs';
import { armarTitle, armarH1, armarDescription, normalizarTexto } from './gh-tipografia.mjs';
import {
  getBlogFreshness,
  applyFreshnessToArticle,
  sanitizeBannedWords,
  sanitizeStaleYears,
} from './gh-blog-freshness.mjs';
import {
  enforceArticleLength,
  countWordsInHtml,
  BLOG_MAX_WORDS,
} from './gh-blog-article-length.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SITE = 'https://ghspecialist.com';
const GOOGLE_CALENDAR_URL = 'https://calendar.app.google/rz32YjLinKvYWUTT9';
const BLOG_YEAR = String(getBlogFreshness().year);

const BASE_IMAGES = [
  { path: 'fotos/slide2_img2.png', city: 'México', tags: ['whatsapp', 'chatbot', 'ia', 'automatizacion', 'negocio', 'mexico'] },
  { path: 'fotos/slide1_img0.png', city: 'México', tags: ['ia', 'tecnologia', 'negocio', 'mexico'] },
  { path: 'fotos/slide1_img1.jpg', city: 'México', tags: ['ia', 'tecnologia', 'negocio'] },
  { path: 'fotos/slide2_img3.jpg', city: 'México', tags: ['whatsapp', 'ventas', 'negocio'] },
  { path: 'fotos/slide5_img4.png', city: 'México', tags: ['crm', 'kommo', 'ventas'] },
  { path: 'fotos/slide5_img5.jpg', city: 'México', tags: ['automatizacion', 'ia', 'negocio'] },
  { path: 'hero-torreon.webp', city: 'Torreón', tags: ['torreon', 'coahuila', 'mexico', 'negocio'] },
  { path: 'hero-guadalajara.webp', city: 'Guadalajara', tags: ['guadalajara', 'jalisco', 'mexico'] },
  { path: 'hero-queretaro.webp', city: 'Querétaro', tags: ['queretaro', 'mexico'] },
  { path: 'hero-chihuahua.webp', city: 'Chihuahua', tags: ['chihuahua', 'mexico'] },
  { path: 'hero-monterrey.webp', city: 'Monterrey', tags: ['monterrey', 'nuevo leon', 'mexico'] },
  { path: 'hero-cdmx.webp', city: 'CDMX', tags: ['cdmx', 'ciudad de mexico', 'mexico'] },
  { path: 'hero-puebla.webp', city: 'Puebla', tags: ['puebla', 'mexico'] },
  { path: 'hero-leon.webp', city: 'León', tags: ['leon', 'guanajuato', 'mexico'] },
  { path: 'hero-merida.webp', city: 'Mérida', tags: ['merida', 'yucatan', 'mexico'] },
  { path: 'hero-bg.webp', city: 'México', tags: ['mexico', 'negocio', 'tecnologia'] },
];

function encodeWebPath(relPath) {
  return relPath.split('/').map((p) => encodeURIComponent(p)).join('/');
}

function blogHeroPaths(relPath) {
  const enc = encodeWebPath(relPath);
  const isBlogImg = relPath.startsWith('blog/img/');
  return {
    articleImg: isBlogImg ? relPath.replace(/^blog\/img\//, 'img/') : `../${enc}`,
    cardImg: `/${enc}`,
    og: `${SITE}/${enc}`,
  };
}

function toHeroAsset(relPath, city, tags) {
  return {
    ...blogHeroPaths(relPath),
    city,
    tags,
    relPath,
    generated: false,
  };
}

function normalizeBlogSlug(slug) {
  if (!slug || slug.includes('://') || slug.startsWith('../') || slug.startsWith('/')) return slug;
  const s = String(slug).replace(/^\.\//, '');
  return s.endsWith('.html') ? s : `${s}.html`;
}

function fixInternalBlogLinks(html) {
  return String(html || '').replace(/href="([a-z0-9][a-z0-9-]*)"/gi, (match, slug) => {
    if (slug.includes('.') || slug === 'index') return match;
    return `href="${slug}.html"`;
  });
}

async function discoverImagePool() {
  const pool = BASE_IMAGES.map((i) => toHeroAsset(i.path, i.city, i.tags));
  try {
    const rootFiles = await readdir(ROOT);
    for (const f of rootFiles) {
      if (/^NanoBanana.*\.(png|jpg|webp)$/i.test(f)) {
        pool.push(toHeroAsset(f, 'México', ['ia', 'chatbot', 'whatsapp', 'automatizacion', 'tecnologia', 'negocio']));
      }
    }
  } catch {
    /* noop */
  }
  return pool.length ? pool : [toHeroAsset('fotos/slide2_img2.png', 'México', ['mexico'])];
}

function pickImageForTopic(pool, topic, keywords) {
  const text = `${topic} ${keywords}`.toLowerCase();
  const topicRules = [
    { re: /whatsapp|chatbot|kommo|crm|ventas/, tags: ['whatsapp', 'chatbot', 'ventas', 'crm'] },
    { re: /automatiz|agente|ia|inteligencia/, tags: ['ia', 'automatizacion', 'tecnologia'] },
    { re: /humano|atencion|cliente|servicio/, tags: ['negocio', 'tecnologia', 'ia'] },
  ];
  let best = pool[0];
  let bestScore = -1;
  for (const item of pool) {
    let score = Math.random();
    for (const tag of item.tags) {
      if (text.includes(tag)) score += 3;
    }
    for (const rule of topicRules) {
      if (rule.re.test(text) && rule.tags.some((t) => item.tags.includes(t))) score += 4;
    }
    if (score > bestScore) {
      bestScore = score;
      best = item;
    }
  }
  return best;
}

async function generateHeroWithGemini(topic, slug, apiKey, market = 'mx') {
  const models = ['gemini-2.5-flash-image'];
  const geoContext =
    market === 'usa'
      ? 'Hispanic/Latino small business in the United States, bilingual professional setting, diverse Latin American entrepreneurs'
      : 'Modern Latin American office in Mexico';
  const prompts = [
    `Ultra-premium editorial hero photograph for a B2B technology blog (${BLOG_YEAR}). Topic: ${topic}.
Cinematic 16:9 wide shot, magazine cover quality, photorealistic, sharp focus, professional studio lighting, subtle purple accent glow (#7C4DFF).
${geoContext}, WhatsApp/AI/automation theme when relevant, depth of field, aspirational business mood.
NO text, NO logos, NO watermarks, NO readable UI. Looks like a top Getty Images stock photo.`,
    `Award-winning business photography for blog hero (${BLOG_YEAR}). ${topic}.
High-end commercial photo, futuristic but believable, ${geoContext}, purple (#7C4DFF) highlights, clean composition, 16:9, photorealistic, no text or logos.`,
  ];
  const imgDir = join(ROOT, 'blog', 'img');
  await mkdir(imgDir, { recursive: true });
  const slugBase = slug.replace(/\.html$/, '');

  for (const prompt of prompts) {
    for (const model of models) {
      try {
        console.log(`→ Gemini imagen (${model})…`);
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
            }),
          }
        );
        const raw = await res.text();
        if (!res.ok) throw new Error(`${model} ${res.status}: ${raw.slice(0, 200)}`);
        const data = JSON.parse(raw);
        const parts = data.candidates?.[0]?.content?.parts || [];
        const imgPart = parts.find((p) => p.inlineData?.data || p.inline_data?.data);
        const inline = imgPart?.inlineData || imgPart?.inline_data;
        if (!inline?.data) throw new Error('sin imagen en respuesta');
        const ext = (inline.mimeType || inline.mime_type || 'image/jpeg').includes('png') ? 'png' : 'jpg';
        const finalRel = `blog/img/${slugBase}.${ext}`;
        await writeFile(join(ROOT, finalRel), Buffer.from(inline.data, 'base64'));
        const enc = encodeWebPath(finalRel);
        console.log(`✓ Hero IA generado: ${finalRel}`);
        return {
          ...blogHeroPaths(finalRel),
          city: 'GH Specialist',
          tags: ['generado'],
          relPath: finalRel,
          generated: true,
        };
      } catch (e) {
        console.warn('Gemini imagen:', e.message || e);
      }
    }
  }
  return null;
}

async function resolveHeroImage(topic, keywords, slug, market = 'mx') {
  const pool = await discoverImagePool();
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  const tryGemini = process.env.BLOG_GEMINI_IMAGES !== '0' && geminiKey;
  if (tryGemini) {
    const generated = await generateHeroWithGemini(topic, slug, geminiKey, market);
    if (generated) return generated;
    console.warn('⚠ Gemini no generó imagen; usando foto del sitio como fallback');
  }
  return pickImageForTopic(pool, topic, keywords);
}

function slugify(s) {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

function repairJsonText(text) {
  return text
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/,\s*([}\]])/g, '$1');
}

function extractJsonObject(text) {
  const start = text.indexOf('{');
  if (start === -1) throw new Error('No JSON en respuesta IA');
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === '\\') esc = true;
      else if (c === '"') inStr = false;
    } else {
      if (c === '"') inStr = true;
      else if (c === '{') depth++;
      else if (c === '}') {
        depth--;
        if (depth === 0) {
          const slice = text.slice(start, i + 1);
          try {
            return JSON.parse(slice);
          } catch (e) {
            return JSON.parse(repairJsonText(slice));
          }
        }
      }
    }
  }
  throw new Error('JSON incompleto en respuesta IA');
}

function parseArticleResponse(raw) {
  const cleaned = String(raw || '')
    .replace(/```json\s*/gi, '')
    .replace(/```/g, '')
    .trim();
  return extractJsonObject(cleaned);
}

async function listExistingArticles() {
  const dir = join(ROOT, 'blog');
  const files = await readdir(dir);
  return files.filter((f) => f.endsWith('.html') && f !== 'index.html' && !f.startsWith('_'));
}

async function fetchExistingHaystack(files) {
  const parts = [];
  for (const f of files) {
    parts.push(f.replace('.html', ''));
    try {
      const html = await readFile(join(ROOT, 'blog', f), 'utf8');
      const title = html.match(/<title>([^<]*)<\/title>/i)?.[1] || '';
      if (title) parts.push(title);
    } catch {
      /* noop */
    }
  }
  return parts;
}

async function callChatCompletions(baseUrl, apiKey, model, prompt, label) {
  const url = baseUrl.replace(/\/$/, '') + '/chat/completions';
  const baseBody = {
    model,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 8192,
    temperature: 0.7,
  };
  let lastErr;
  for (const jsonMode of [true, false]) {
    const body = jsonMode ? { ...baseBody, response_format: { type: 'json_object' } } : baseBody;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const raw = await res.text();
    if (!res.ok) {
      if (jsonMode && (raw.includes('response_format') || res.status === 400)) {
        lastErr = new Error(`${label} ${res.status}: ${raw.slice(0, 300)}`);
        continue;
      }
      throw new Error(`${label} ${res.status}: ${raw.slice(0, 300)}`);
    }
    const data = JSON.parse(raw);
    const text = data.choices?.[0]?.message?.content;
    if (!text) throw new Error(`${label} sin contenido`);
    return text;
  }
  throw lastErr || new Error(`${label} falló`);
}

async function callDeepSeek(prompt, apiKey) {
  const base = (process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1').trim();
  const models = (process.env.DEEPSEEK_MODEL || 'deepseek-chat,deepseek-v4-flash').split(',').map((m) => m.trim()).filter(Boolean);
  let lastErr;
  for (const model of models) {
    try {
      return await callChatCompletions(base, apiKey, model, prompt, `DeepSeek(${model})`);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error('DeepSeek falló');
}

async function callQwen(prompt, apiKey) {
  const base = (process.env.QWEN_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1').trim();
  const models = (process.env.QWEN_MODEL || 'qwen-turbo,qwen-plus').split(',').map((m) => m.trim()).filter(Boolean);
  let lastErr;
  for (const model of models) {
    try {
      return await callChatCompletions(base, apiKey, model, prompt, `Qwen(${model})`);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error('Qwen falló');
}

async function callGemini(prompt, apiKey, model = 'gemini-2.5-flash') {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 8192,
        temperature: 0.7,
        responseMimeType: 'application/json',
      },
    }),
  });
  const raw = await res.text();
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${raw.slice(0, 300)}`);
  const data = JSON.parse(raw);
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
  if (!text) throw new Error('Gemini sin contenido');
  return text;
}

async function callOpenAI(prompt, apiKey) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 8192,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    }),
  });
  const raw = await res.text();
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${raw.slice(0, 300)}`);
  const data = JSON.parse(raw);
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('OpenAI sin contenido');
  return text;
}

async function generateArticleContent(prompt) {
  const errors = [];
  const deepseek = process.env.DEEPSEEK_API_KEY?.trim();
  const qwen = (process.env.QWEN_API_KEY || process.env.DASHSCOPE_API_KEY)?.trim();
  const gemini = process.env.GEMINI_API_KEY?.trim();
  const openai = process.env.OPENAI_API_KEY?.trim();

  if (deepseek) {
    try {
      console.log('→ DeepSeek…');
      return await callDeepSeek(prompt, deepseek);
    } catch (e) {
      errors.push(e.message || String(e));
    }
  }

  if (qwen) {
    try {
      console.log('→ Qwen…');
      return await callQwen(prompt, qwen);
    } catch (e) {
      errors.push(e.message || String(e));
    }
  }

  const geminiModels = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-3.5-flash'];
  if (gemini) {
    for (const model of geminiModels) {
      try {
        console.log(`→ Gemini (${model})…`);
        return await callGemini(prompt, gemini, model);
      } catch (e) {
        errors.push(e.message || String(e));
      }
    }
  }

  if (openai) {
    try {
      console.log('→ OpenAI…');
      return await callOpenAI(prompt, openai);
    } catch (e) {
      errors.push(e.message || String(e));
    }
  }

  if (!deepseek && !qwen && !gemini && !openai) {
    throw new Error(
      'Falta DEEPSEEK_API_KEY o QWEN_API_KEY en GitHub Secrets. Gratis: platform.deepseek.com o dashscope.aliyun.com'
    );
  }
  throw new Error(`Todas las IAs fallaron: ${errors.join(' · ').slice(0, 500)}`);
}

function buildPrompt(plan, freshness, existingSlugs) {
  const { topic, userTopic, seoKeywords, contentBrief, market = 'mx' } = plan;
  const isUsa = market === 'usa';
  const articleTopic = userTopic || topic.phrase;
  const slugList = existingSlugs.map((s) => s.replace('.html', '')).join(', ');
  const expansionBlock = contentBrief
    ? `

Contenido ampliado:
${contentBrief}`
    : '';
  const comparativeNote = isComparativeBrief(contentBrief)
    ? '\n- TABLA HTML comparativa breve (table, thead, tbody) con 3–4 filas; celdas cortas'
    : '';
  const suggestLabel = isUsa ? 'Google Suggest USA (comunidad hispana, gl=us)' : 'Google Suggest México';
  const keywordBlock =
    seoKeywords?.length > 0
      ? `

PALABRAS CLAVE DE BÚSQUEDA (${suggestLabel} — integra entre 2 y 5 de forma natural en el artículo: en algún <h2>, párrafos y meta description; NO cambies el tema del artículo):
${seoKeywords.map((k) => `- ${k}`).join('\n')}`
      : '';

  const geoBlock = isUsa
    ? `Eres redactor SEO senior para GH Specialist (automatización con IA, chatbots WhatsApp, CRM Kommo, GoHighLevel/GHL).
AUDIENCIA: empresarios y PYMES de la comunidad hispana/latina en ESTADOS UNIDOS (Texas, California, Florida, etc.).
GH Specialist opera desde México e implementa 100% remoto en español para negocios latinos en USA.
Menciona que atendemos EE.UU. de forma remota; si encaja, cita Houston, Los Ángeles, Miami o Dallas sin inventar datos locales.
Tono: directo para dueño de negocio latino ocupado en USA (español claro, sin spanglish forzado).
card_city_label en JSON: "EE.UU. · Comunidad hispana" (o ciudad USA concreta si el tema la incluye).`
    : `Eres redactor SEO senior para GH Specialist (automatización con IA, chatbots WhatsApp, CRM Kommo, GoHighLevel/GHL, México).

AUDIENCIA PRINCIPAL: CONSTRUCTORAS y DESARROLLADORAS de vivienda en México.
Le escribes a dos perfiles, y sus dolores no son el mismo:
- CONSTRUCTORA (ejecuta obra): no consigue mano de obra — fierreros, cimbreros,
  albañiles, yeseros —, no sabe cómo va el avance real, persigue subcontratistas
  por teléfono y paga destajos sin control fino.
- DESARROLLADORA (vende vivienda): recibe muchos interesados y pierde la mitad
  entre la primera pregunta y la firma; nadie devuelve llamadas a tiempo; el
  seguimiento vive en libretas y WhatsApp sueltos.

Escribe como quien ha estado en obra: usa las palabras del gremio (destajista,
cuadrilla, residente, avance, subcontratista, cimbra, tabique, m2). Nada de
"transforma tu negocio" ni promesas de folleto. Ejemplos concretos con números
redondos y realistas; si no tienes el dato, no lo inventes.

GH Specialist trabaja hoy con desarrolladores de vivienda: automatiza el
reclutamiento de personal de obra y el seguimiento de prospectos. Puede decirse
sin nombrar clientes ni inventar cifras.

Si el tema no es de construcción, escríbelo igual bien para empresa mexicana,
pero el ejemplo que aterrice el punto que sea del gremio cuando se pueda.
Menciona cuando encaje que GH Specialist implementa Kommo y también GoHighLevel
(GHL): embudos, pipelines, SMS, WhatsApp y automatizaciones.
card_city_label en JSON: "México" (o ciudad mexicana si el tema la incluye).`;

  const indexingBlock = plan.indexingKeywords?.regions?.length
    ? isUsa
      ? `

INDEXACIÓN LOCAL USA (menciona al menos una vez que GH Specialist atiende negocios hispanos en EE.UU. de forma remota; enlaza ../ciudades/houston/ o ../ciudades/los-angeles/ si encaja):
${plan.indexingKeywords.regions.map((r) => `- ${r.region}: ${r.keywords.join(', ')}`).join('\n')}`
      : `

INDEXACIÓN LOCAL (menciona al menos una vez en el artículo que GH Specialist atiende México; si encaja, una línea sobre Torreón/La Laguna o Monterrey sin inventar datos locales):
${plan.indexingKeywords.regions.map((r) => `- ${r.region}: ${r.keywords.join(', ')}`).join('\n')}`
    : '';

  return `${geoBlock}

Actualidad obligatoria: ${freshness.label} (zona horaria México). Prohibido años anteriores a ${freshness.year}.

TEMA DEL ARTÍCULO (obligatorio — lo que pidió el usuario): "${articleTopic}"
Mercado SEO: ${isUsa ? 'Estados Unidos · comunidad hispana' : 'México'}
Categoría: ${topic.category}
El título, slug, h1 y enfoque del contenido deben ser sobre ESE tema, no sobre otro del catálogo.
${keywordBlock}
${indexingBlock}

Artículos ya publicados (enlaza 2-3 si encajan): ${slugList}

Servicios (enlaces relativos ../servicios/...):
- constructoras-desarrolladoras.html ← la principal: reclutamiento de obra,
  calificación de prospectos de vivienda, precalificación de crédito, campañas
  por fraccionamiento, renders 3D y panel de avance. Enlázala siempre que el
  artículo hable de obra, vivienda, compradores o crédito.
- chatbot-ia-whatsapp.html
- crm-kommo.html
- automatizacion-total.html
- web-seo-blog-ia.html
- agentes-omnicanal.html
- capacitaciones-ia-empresas.html (minería, construcción e industria)
${isUsa ? '- Enlaza ../ciudades/ (hub) o ../ciudades/houston/ ../ciudades/miami/ si encaja' : `OBLIGATORIO — enlaza UNA página de ciudad si el artículo menciona una plaza:
../torreon/ (Torreón y La Laguna) · ../ciudades/monterrey/ · ../ciudades/cdmx/
../ciudades/guadalajara/ · ../ciudades/saltillo/ · ../ciudades/queretaro/
../ciudades/chihuahua/ · ../ciudades/puebla/ · ../ciudades/leon/
../ciudades/merida/ · ../ciudades/cancun/ · ../ciudades/tijuana/
Si no se menciona ninguna ciudad, enlaza ../ciudades/ (el hub).`}

REGLAS DE LONGITUD (CRÍTICO — el lector no lee paredes de texto):
- Entre 700 y 1.000 palabras en content_html (NUNCA más de 1.000). Si te pasas, el sistema RECORTA el artículo y borra secciones del final.
- Máximo 4 secciones <h2>; evita <h3> salvo que sea indispensable.
- Párrafos cortos (2–3 líneas). Listas con máximo 5 viñetas.
- Ve al grano: una idea por sección, sin relleno ni repetir lo mismo con otras palabras.
- read_time en JSON: entero 4, 5 o 6 (minutos de lectura), acorde a la longitud real.

REGLAS SEO:
- 2–4 enlaces internos
- CTAs a Google Calendar (${GOOGLE_CALENDAR_URL}) y WhatsApp +528712638082
- slug kebab-case del TEMA DEL USUARIO, terminar en "-${freshness.slugSuffix}"
- title sobre el TEMA DEL USUARIO y vigencia "${freshness.label}" (ej. "... | guía ${freshness.label}")
- Primer párrafo: mencionar actualización ${freshness.label}
- PROHIBIDO la palabra "leads" (usa contactos, interesados, prospectos)
- PROHIBIDO jerga inventada (B2B leads, funnel anglicismos) salvo WhatsApp/CRM reales
- JSON válido RFC8259: en content_html usa comillas SIMPLES en atributos HTML (class='x'); escapa " como \\"
${comparativeNote}

Responde SOLO JSON (sin markdown, sin texto fuera del objeto):
{
  "title": "...",
  "slug": "palabras-clave-frase-${freshness.slugSuffix}",
  "description": "max 155 chars con ${freshness.label}",
  "og_title": "...",
  "og_description": "max 120 chars",
  "category_tag": "${topic.category}",
  "category_label": "Blog · ${topic.category}",
  "breadcrumb_title": "título corto",
  "read_time": 5,
  "card_excerpt": "...",
  "card_city_label": "${isUsa ? 'EE.UU. · Comunidad hispana' : 'México'}",
  "content_html": "<p>...</p>",
  "related": [{"slug": "otro.html", "title": "...", "desc": "..."}]
}

Escribe sobre: ${articleTopic}${expansionBlock}`;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const MESES_ES = 'enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre';

/**
 * Reduce un titulo a la llave del TEMA, quitando todo lo que cambia solo:
 * mes, año, la marca, y las muletillas de titular ("guia", "domine google").
 *
 * Ojo con esto: la version anterior quitaba el año pero NO el mes, asi que
 * "seo con ia cdmx | guia agosto 2026" y el mismo articulo de septiembre
 * daban llaves distintas y jamas se reconocian como el mismo tema. Por eso el
 * detector de duplicados no servia ni cuando llegaba a correr.
 */
function temaKey(titulo) {
  let k = slugify(titulo || '');
  k = k.replace(/-gh-specialist.*$/, '');
  k = k.replace(new RegExp(`-(${MESES_ES})(-\\d{4})?`, 'g'), '');
  k = k.replace(/-\d{4}/g, '');
  k = k.replace(/-v\d+$/, '');
  k = k.replace(/-(guia|guias|domine-google|domina-google|esencial|completa|completo|actualizada|actualizado|paso-a-paso)/g, '');
  k = k.replace(/-mexico.*$/, '');
  return k.replace(/-+/g, '-').replace(/^-|-$/g, '');
}

/**
 * Devuelve el nombre del articulo ya publicado que trata el mismo tema, o
 * null. Compara por tema normalizado, no por slug: el slug lleva el mes
 * ("-agosto-2026") y cambia solo, el tema no.
 */
async function buscarArticuloDelMismoTema(existing, titleKey) {
  if (!titleKey) return null;
  const encontrados = [];
  for (const ex of existing) {
    const exHtml = await readFile(join(ROOT, 'blog', ex), 'utf8');
    const exTitle = exHtml.match(/<title>([^<]*)<\/title>/i)?.[1] || '';
    if (temaKey(exTitle) !== titleKey) continue;
    // Una copia consolidada tiene el canonical apuntando a OTRA pagina; la
    // buena se apunta a si misma. Hay que quedarse con la buena: actualizar
    // una copia consolidada seria escribir en la pagina que Google ya ignora.
    const canonical = exHtml.match(/<link rel="canonical" href="([^"]*)"/i)?.[1] || '';
    encontrados.push({ archivo: ex, esCanonica: canonical.endsWith(`/blog/${ex}`) });
  }
  if (!encontrados.length) return null;
  return (encontrados.find((e) => e.esCanonica) || encontrados[0]).archivo;
}

/** datePublished que ya traia el articulo, para no reiniciar su antiguedad. */
async function leerDatePublished(slug, fallbackIso) {
  try {
    const html = await readFile(join(ROOT, 'blog', slug), 'utf8');
    const m = html.match(/"datePublished"\s*:\s*"([0-9]{4}-[0-9]{2}-[0-9]{2})"/);
    return m?.[1] || fallbackIso;
  } catch {
    return fallbackIso;
  }
}

function buildArticleHtml(article, dateIso, hero, market = 'mx', publishedIso = dateIso) {
  const slug = article.slug.replace(/\.html$/, '');
  const relatedHtml = (article.related || [])
    .slice(0, 3)
    .map(
      (r) =>
        `      <a href="${escapeHtml(normalizeBlogSlug(r.slug))}" class="related-item"><strong>${escapeHtml(r.title)}</strong><span>${escapeHtml(r.desc)}</span></a>`
    )
    .join('\n');

  const dateDisplay = new Date(dateIso).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const defaultCity = market === 'usa' ? 'EE.UU. · Comunidad hispana' : 'México';

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" href="../favicon.png" type="image/png">
  <link rel="apple-touch-icon" href="../favicon.png">
  <!-- El title ya viene armado y medido por armarTitle(). No pegarle
       " | GH Specialist" aqui: son 16 de los ~60 caracteres que Google
       muestra, y volveria a pasarse del limite. -->
  <title>${escapeHtml(article.title)}</title>
  <meta name="description" content="${escapeHtml(article.description)}">
  <link rel="canonical" href="${SITE}/blog/${slug}.html">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${SITE}/blog/${slug}.html">
  <meta property="og:title" content="${escapeHtml(article.og_title)}">
  <meta property="og:description" content="${escapeHtml(article.og_description)}">
  <meta property="og:image" content="${hero.og}">
  <meta property="og:locale" content="es_MX">
  <meta property="og:site_name" content="GH Specialist">
  <meta property="article:published_time" content="${dateIso}">
  <meta property="article:modified_time" content="${dateIso}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(article.og_title)}">
  <meta name="twitter:description" content="${escapeHtml(article.og_description)}">
  <meta name="twitter:image" content="${hero.og}">
  <script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.h1 || article.title,
    description: article.description,
    image: hero.og,
    author: { '@type': 'Person', name: 'Pedro Luis Díaz Velázquez', url: `${SITE}/sobre-pedro.html` },
    publisher: { '@type': 'Organization', name: 'GH Specialist', logo: { '@type': 'ImageObject', url: `${SITE}/2.png` } },
    datePublished: publishedIso,
    dateModified: dateIso,
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE}/blog/${slug}.html` },
  })}</script>
  <script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE}/blog/` },
      { '@type': 'ListItem', position: 3, name: article.breadcrumb_title, item: `${SITE}/blog/${slug}.html` },
    ],
  })}</script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <script src="../js/gh-site-config.js"></script>
  <script src="../js/gh-analytics.js" async></script>
  <script src="../js/gh-blog-locale.js" defer></script>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    :root{--p:#7C4DFF;--ink:#111;--ink2:#444;--ink3:#888;--bg:#fff;--bg2:#F7F7F5;--border:#E8E8E8}
    body{font-family:'Inter',sans-serif;color:var(--ink);background:var(--bg);line-height:1.7;-webkit-font-smoothing:antialiased}
    a{color:var(--p);text-decoration:none}a:hover{text-decoration:underline}
    .hdr{padding:16px 32px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;max-width:1100px;margin:0 auto}
    .hdr img{height:28px}.hdr a.back{font-size:13px;color:var(--ink)}
    .bc{max-width:720px;margin:0 auto;padding:20px 32px 0;font-size:13px;color:var(--ink3)}
    .bc a{color:var(--ink3)}.bc a:hover{color:var(--p);text-decoration:none}.bc span{margin:0 6px}
    .art{max-width:720px;margin:0 auto;padding:24px 32px 48px}
    .art-label{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--p);margin-bottom:14px}
    .art h1{font-size:clamp(28px,5vw,46px);font-weight:800;letter-spacing:-.03em;line-height:1.1;margin-bottom:20px}
    .art-meta{font-size:13px;color:var(--ink);margin-bottom:28px;padding-bottom:24px;border-bottom:1px solid var(--border)}
    .art-hero{margin:0 0 32px;border-radius:14px;overflow:hidden;border:1px solid var(--border);background:var(--bg2)}
    .art-hero img{display:block;width:100%;height:auto;max-height:420px;object-fit:cover}
    .art-hero figcaption{font-size:12px;color:var(--ink3);padding:10px 14px;text-align:center}
    .art h2{font-size:24px;font-weight:700;margin:40px 0 14px}.art h3{font-size:18px;font-weight:700;margin:28px 0 10px}
    .art p{margin-bottom:18px;font-size:17px;color:var(--ink2);line-height:1.8}
    .art ul,.art ol{margin:0 0 18px 22px}.art li{font-size:16px;color:var(--ink2);margin-bottom:8px}
    .art strong{color:var(--ink);font-weight:700}
    .cta-art{background:var(--ink);color:#fff;border-radius:16px;padding:40px;text-align:center;margin:48px 0}
    .cta-art h3{font-size:22px;font-weight:800;margin-bottom:10px}
    .cta-art p{color:rgba(255,255,255,.6);margin-bottom:24px;font-size:15px}
    .cta-art a{display:inline-block;background:var(--p);color:#fff;padding:13px 28px;border-radius:8px;font-weight:700;font-size:15px;text-decoration:none;margin:4px}
    .related{margin-top:48px;padding-top:32px;border-top:1px solid var(--border)}
    .related h3{font-size:18px;font-weight:800;margin-bottom:20px}
    .related-grid{display:grid;gap:14px}
    .related-item{display:block;padding:16px 20px;border:1px solid var(--border);border-radius:12px;text-decoration:none}
    .related-item:hover{border-color:var(--p);box-shadow:0 4px 16px rgba(124,77,255,.12)}
    .related-item strong{display:block;font-size:15px;color:var(--ink);margin-bottom:4px}
    .related-item span{font-size:13px;color:var(--ink3)}
    .ftr-art{border-top:1px solid var(--border);padding:24px 32px;text-align:center;font-size:13px;color:var(--ink)}
  </style>
</head>
<body>
<div class="hdr">
  <a href="../index.html"><img src="../2.png" alt="GH Specialist"></a>
  <a href="index.html" class="back">← Volver al blog</a>
</div>
<nav class="bc" aria-label="Breadcrumb"><a href="../index.html">Inicio</a><span>›</span><a href="index.html">Blog</a><span>›</span>${escapeHtml(article.breadcrumb_title)}</nav>
<article class="art" data-market="${market}">
  <div class="art-label">${escapeHtml(article.category_label)}</div>
  <h1>${escapeHtml(article.h1 || article.title)}</h1>
  <div class="art-meta">Por <strong>Pedro Luis Díaz Velázquez</strong> · GH Specialist · ${dateDisplay} · ${article.read_time || 5} min lectura</div>
  <figure class="art-hero">
    <img src="${hero.articleImg}" alt="${escapeHtml(article.h1 || article.title)}" width="1200" height="630" loading="eager">
    <figcaption>${hero.generated ? 'Imagen hero IA · GH Specialist · ' + BLOG_YEAR : escapeHtml(article.card_city_label || hero.city || defaultCity)}</figcaption>
  </figure>
  <div class="gh-article-body">
  ${article.content_html}
  </div>
  <div class="cta-art">
    <h3>¿Quieres automatizar tu negocio con IA?</h3>
    <p>Diagnóstico gratuito de 30 minutos. Te decimos qué implementar primero.</p>
    <a href="https://calendar.app.google/rz32YjLinKvYWUTT9" target="_blank" rel="noopener">📅 Agendar diagnóstico →</a>
    <a href="https://wa.me/528712638082?text=Hola%20Pedro,%20leí%20tu%20artículo%20sobre%20${encodeURIComponent(slug)}" target="_blank" rel="noopener">📱 WhatsApp →</a>
  </div>
  <section class="related" aria-label="Artículos relacionados">
    <h3>Artículos relacionados</h3>
    <div class="related-grid">
${relatedHtml}
    </div>
  </section>
</article>
<div class="ftr-art">© 2026 GH Specialist · <a href="https://ghspecialist.com">ghspecialist.com</a> · <a href="https://www.instagram.com/ghspecialist26/" target="_blank" rel="noopener">Instagram</a> · <a href="https://www.tiktok.com/@ghspecialist" target="_blank" rel="noopener">TikTok</a></div>
</body>
</html>
`;
}

function buildCard(article, dateIso, hero) {
  const slug = article.slug.replace(/\.html$/, '');
  const dateShort = new Date(dateIso).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  return `
    <a href="${slug}.html" class="card">
      <div class="card-img" style="background-image:url('${hero.cardImg}')"><span class="card-city">${escapeHtml(article.card_city_label || hero.city)}</span></div>
      <div class="card-body">
        <span class="card-tag">${escapeHtml(article.category_tag)}</span>
        <h2>${escapeHtml(article.h1 || article.title)}</h2>
        <p>${escapeHtml(article.card_excerpt)}</p>
        <div class="card-meta">
          <span>${dateShort} · ${article.read_time || 5} min</span>
          <span class="card-read">Leer artículo →</span>
        </div>
      </div>
    </a>
`;
}

async function insertCardInIndex(cardHtml) {
  const indexPath = join(ROOT, 'blog/index.html');
  let html = await readFile(indexPath, 'utf8');
  const marker = '<div class="blog-grid">';
  const idx = html.indexOf(marker);
  if (idx === -1) throw new Error('No se encontró blog-grid en blog/index.html');
  const insertAt = idx + marker.length;
  html = html.slice(0, insertAt) + '\n' + cardHtml + html.slice(insertAt);
  await writeFile(indexPath, html, 'utf8');
}

async function main() {
  await assertBlogClientSecret(process.env.CLIENT_SECRET || '');
  const hasKey =
    process.env.DEEPSEEK_API_KEY?.trim() ||
    process.env.QWEN_API_KEY?.trim() ||
    process.env.DASHSCOPE_API_KEY?.trim() ||
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.OPENAI_API_KEY?.trim();
  if (!hasKey) {
    throw new Error(
      'Falta una API key de IA en GitHub Secrets (Settings → Secrets → Actions): GEMINI_API_KEY, OPENAI_API_KEY, DEEPSEEK_API_KEY o QWEN_API_KEY.'
    );
  }

  const userTopic = (process.env.BLOG_TOPIC || '').trim();
  const userKeywords = (process.env.BLOG_KEYWORDS || '').trim();
  const userInput = [userTopic, userKeywords].filter(Boolean).join(' ').trim();
  const market = parseBlogMarket(process.env.BLOG_MARKET);

  const existing = await listExistingArticles();
  const haystack = await fetchExistingHaystack(existing);
  const freshness = getBlogFreshness();

  console.log(`→ Mercado blog: ${market === 'usa' ? 'EE.UU. (comunidad hispana)' : 'México'}`);

  /** @type {import('./gh-blog-prepare.mjs').prepareBlogGeneration extends (...args: any) => Promise<infer R> ? R : never} */
  let plan;

  if (userInput) {
    plan = await prepareBlogGeneration(userInput, market);
    console.log(`→ Tema usuario: «${plan.userTopic}»`);
    console.log(`→ Keywords SEO: ${plan.seoKeywords.join(' | ')}`);
    if (plan.indexingKeywords?.regions) {
      for (const r of plan.indexingKeywords.regions) {
        console.log(`→ Indexar ${r.region}: ${r.keywords.join(' | ')}`);
      }
    }
  } else {
    plan = prepareBlogAuto(haystack, market);
    console.log(`→ Tema automático: «${plan.userTopic}»`);
  }

  const resolveMeta = {
    userInput: plan.userTopic,
    phrase: plan.userTopic,
    seoKeywords: plan.seoKeywords,
    indexingKeywords: plan.indexingKeywords,
    autoCorrected: false,
    message: plan.message,
  };

  const basePrompt = buildPrompt(plan, freshness, existing);
  let parsed;
  let lastParseErr;
  for (let attempt = 1; attempt <= 2; attempt++) {
    const retryNote =
      attempt > 1
        ? '\n\nREINTENTO: el JSON anterior fue inválido. Devuelve un único objeto JSON parseable; content_html con comillas simples en HTML.'
        : '';
    const raw = await generateArticleContent(basePrompt + retryNote);
    try {
      parsed = parseArticleResponse(raw);
      break;
    } catch (e) {
      lastParseErr = e;
      console.warn(`JSON inválido (intento ${attempt}):`, e.message || e);
    }
  }
  if (!parsed) throw lastParseErr || new Error('JSON inválido en respuesta IA');

  if (!parsed.slug) parsed.slug = slugify(plan.userTopic);
  parsed.slug = slugify(parsed.slug.replace(/\.html$/, ''));
  if (!parsed.slug.endsWith('.html')) parsed.slug += '.html';

  applyFreshnessToArticle(parsed, freshness, plan.userTopic);
  enforceArticleLength(parsed);

  // Tipografia de titulares. La IA escribe "Seo con IA cdmx", "Whats app" y
  // titles de 87 caracteres que Google corta a media palabra. Se normaliza
  // aqui, con las mismas reglas que se le aplicaron a los articulos ya
  // publicados (scripts/gh-tipografia.mjs), para que no vuelvan a divergir.
  parsed.h1 = armarH1(parsed.title || '');
  parsed.title = armarTitle(parsed.title || '');
  parsed.description = armarDescription(parsed.description || '');
  if (parsed.og_title) parsed.og_title = normalizarTexto(parsed.og_title);
  if (parsed.og_description) parsed.og_description = normalizarTexto(parsed.og_description);

  const wordCount = countWordsInHtml(parsed.content_html || '');
  console.log(`→ Longitud: ${wordCount} palabras (máx ${BLOG_MAX_WORDS})`);
  parsed.slug = slugify(parsed.slug.replace(/\.html$/, '')) + '.html';
  if (parsed.content_html) parsed.content_html = fixInternalBlogLinks(parsed.content_html);
  if (parsed.related?.length) {
    for (const r of parsed.related) {
      if (r.slug) r.slug = normalizeBlogSlug(r.slug);
      if (r.title) r.title = sanitizeBannedWords(sanitizeStaleYears(r.title, freshness));
      if (r.desc) r.desc = sanitizeBannedWords(sanitizeStaleYears(r.desc, freshness));
    }
  }

  const titleKey = temaKey(parsed.title || plan.userTopic);

  // Buscar si ya hay un articulo del mismo tema.
  //
  // Antes esta busqueda vivia dentro de `if (!userInput)`, o sea que solo
  // corria para el blog diario. El lote de ciudades SI manda tema
  // (BLOG_TOPIC='seo con ia cdmx'), asi que se saltaba el chequeo por
  // completo y cada corrida creaba un -v2, -v3, -v4... con el mismo titulo,
  // el mismo h1 y canonical propio: cinco paginas peleandose la misma
  // keyword. Ahora la busqueda corre siempre.
  const yaExiste = await buscarArticuloDelMismoTema(existing, titleKey);

  if (yaExiste && !userInput) {
    // Blog diario: el tema salio del catalogo. Si ya esta escrito, se sale
    // sin hacer nada y manana toca otro tema.
    console.error(`Artículo similar ya existe: ${yaExiste}`);
    process.exit(0);
  }

  // Si el tema es fijo (lote de ciudades) y ya hay articulo, se ACTUALIZA ese
  // mismo archivo: misma URL, mismo canonical, se conserva datePublished y se
  // mueve dateModified. Refrescar un articulo posicionado vale mas que soltar
  // una copia nueva que compite contra el.
  const actualizando = Boolean(yaExiste && userInput);
  if (actualizando) {
    parsed.slug = yaExiste;
    console.log(`→ Ya existe articulo de este tema: ${yaExiste}. Se ACTUALIZA en vez de duplicar.`);
  } else if (userInput) {
    const userSlugBase = slugify(userInput).replace(/-mayo-\d{4}$/, '').slice(0, 48);
    if (userSlugBase) {
      const candidate = `${userSlugBase}-${freshness.slugSuffix}.html`;
      if (!existing.includes(candidate)) parsed.slug = candidate;
    }
  }

  // Ultimo recurso: mismo slug pero tema distinto (el titulo no empato). Se
  // conserva el sufijo -vN para no pisar un articulo ajeno.
  if (!actualizando && existing.includes(parsed.slug)) {
    let n = 2;
    let candidate = `${parsed.slug.replace('.html', '')}-v${n}.html`;
    while (existing.includes(candidate)) {
      n += 1;
      candidate = `${parsed.slug.replace('.html', '')}-v${n}.html`;
    }
    console.warn(`⚠ Colision de slug con tema distinto, se crea ${candidate}`);
    parsed.slug = candidate;
  }

  const hero = await resolveHeroImage(plan.userTopic, '', parsed.slug, market);
  const dateIso = new Date().toISOString().slice(0, 10);
  // Al actualizar se respeta la fecha original de publicacion.
  const publishedIso = actualizando
    ? await leerDatePublished(parsed.slug, dateIso)
    : dateIso;

  const html = buildArticleHtml(parsed, dateIso, hero, market, publishedIso);
  await writeFile(join(ROOT, 'blog', parsed.slug), html, 'utf8');
  // La tarjeta del indice solo se inserta si el articulo es nuevo; si no,
  // saldria repetida en /blog/.
  if (!actualizando) await insertCardInIndex(buildCard(parsed, dateIso, hero));

  execSync('node scripts/generate-seo.mjs', { cwd: ROOT, stdio: 'inherit' });

  await pingSearchEngines([`/blog/${parsed.slug}`, '/blog/', '/sitemap.xml']);

  const outPath = join(ROOT, 'blog-generate-result.json');
  await writeFile(
    outPath,
    JSON.stringify({
      ok: true,
      title: parsed.title,
      slug: parsed.slug,
      market,
      url: `${SITE}/blog/${parsed.slug}`,
      resolved: resolveMeta,
      seoKeywords: plan.seoKeywords,
      indexingKeywords: plan.indexingKeywords,
      ...blogResultMeta(),
    }),
    'utf8'
  );
  console.log(`✓ Artículo publicado: ${parsed.slug}`);
}

function blogResultMeta() {
  return {
    runId: process.env.GITHUB_RUN_ID || '',
    runUrl: process.env.GITHUB_RUN_ID
      ? `https://github.com/ofertaslaguna84-bit/ghspecialist-web/actions/runs/${process.env.GITHUB_RUN_ID}`
      : '',
  };
}

main().catch(async (err) => {
  const msg = err?.message || String(err);
  console.error(msg);
  try {
    const outPath = join(ROOT, 'blog-generate-result.json');
    await writeFile(
      outPath,
      JSON.stringify({ ok: false, error: msg.slice(0, 500), ...blogResultMeta() }),
      'utf8'
    );
  } catch {
    /* noop */
  }
  process.exit(1);
});
