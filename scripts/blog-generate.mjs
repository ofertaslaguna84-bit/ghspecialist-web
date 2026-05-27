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
import { isComparativeBrief } from './gh-blog-topic-resolve.mjs';
import { prepareBlogGeneration, prepareBlogAuto } from './gh-blog-prepare.mjs';
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
  { path: 'hero-torreon.jpg', city: 'Torreón', tags: ['torreon', 'coahuila', 'mexico', 'negocio'] },
  { path: 'hero-guadalajara.jpg', city: 'Guadalajara', tags: ['guadalajara', 'jalisco', 'mexico'] },
  { path: 'hero-queretaro.jpg', city: 'Querétaro', tags: ['queretaro', 'mexico'] },
  { path: 'hero-chihuahua.jpg', city: 'Chihuahua', tags: ['chihuahua', 'mexico'] },
  { path: 'hero-monterrey.png', city: 'Monterrey', tags: ['monterrey', 'nuevo leon', 'mexico'] },
  { path: 'hero-cdmx.png', city: 'CDMX', tags: ['cdmx', 'ciudad de mexico', 'mexico'] },
  { path: 'hero-puebla.png', city: 'Puebla', tags: ['puebla', 'mexico'] },
  { path: 'hero-leon.png', city: 'León', tags: ['leon', 'guanajuato', 'mexico'] },
  { path: 'hero-merida.png', city: 'Mérida', tags: ['merida', 'yucatan', 'mexico'] },
  { path: 'hero-bg.jpg', city: 'México', tags: ['mexico', 'negocio', 'tecnologia'] },
];

function encodeWebPath(relPath) {
  return relPath.split('/').map((p) => encodeURIComponent(p)).join('/');
}

function toHeroAsset(relPath, city, tags) {
  const enc = encodeWebPath(relPath);
  return {
    img: `../${enc}`,
    og: `${SITE}/${enc}`,
    city,
    tags,
    relPath,
    generated: false,
  };
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

async function generateHeroWithGemini(topic, slug, apiKey) {
  const models = ['gemini-2.5-flash-image', 'gemini-2.0-flash-exp-image-generation'];
  const prompts = [
    `Ultra-premium editorial hero photograph for a B2B technology blog in Mexico (${BLOG_YEAR}). Topic: ${topic}.
Cinematic 16:9 wide shot, magazine cover quality, photorealistic, sharp focus, professional studio lighting, subtle purple accent glow (#7C4DFF).
Modern Latin American office, WhatsApp/AI/automation theme when relevant, depth of field, aspirational business mood.
NO text, NO logos, NO watermarks, NO readable UI. Looks like a top Getty Images stock photo.`,
    `Award-winning business photography for blog hero (${BLOG_YEAR}). ${topic}.
High-end commercial photo, futuristic but believable, Mexican enterprise context, purple (#7C4DFF) highlights, clean composition, 16:9, photorealistic, no text or logos.`,
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
          img: `../${enc}`,
          og: `${SITE}/${enc}`,
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

async function resolveHeroImage(topic, keywords, slug) {
  const pool = await discoverImagePool();
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  const tryGemini = process.env.BLOG_GEMINI_IMAGES !== '0' && geminiKey;
  if (tryGemini) {
    const generated = await generateHeroWithGemini(topic, slug, geminiKey);
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
        if (depth === 0) return JSON.parse(text.slice(start, i + 1));
      }
    }
  }
  throw new Error('JSON incompleto en respuesta IA');
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
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 8192,
      temperature: 0.7,
    }),
  });
  const raw = await res.text();
  if (!res.ok) throw new Error(`${label} ${res.status}: ${raw.slice(0, 300)}`);
  const data = JSON.parse(raw);
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error(`${label} sin contenido`);
  return text;
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

async function callGemini(prompt, apiKey, model = 'gemini-2.0-flash') {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 8192, temperature: 0.7 },
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

  const geminiModels = ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-flash'];
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

  if (!deepseek && !qwen && !gemini && !openai) {
    throw new Error(
      'Falta DEEPSEEK_API_KEY o QWEN_API_KEY en GitHub Secrets. Gratis: platform.deepseek.com o dashscope.aliyun.com'
    );
  }
  throw new Error(`Todas las IAs fallaron: ${errors.join(' · ').slice(0, 500)}`);
}

function buildPrompt(plan, freshness, existingSlugs) {
  const { topic, userTopic, seoKeywords, contentBrief } = plan;
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
  const keywordBlock =
    seoKeywords?.length > 0
      ? `

PALABRAS CLAVE DE BÚSQUEDA (Google Suggest México — integra entre 2 y 5 de forma natural en el artículo: en algún <h2>, párrafos y meta description; NO cambies el tema del artículo):
${seoKeywords.map((k) => `- ${k}`).join('\n')}`
      : '';

  return `Eres redactor SEO senior para GH Specialist (automatización con IA, chatbots WhatsApp, CRM Kommo, México).

Actualidad obligatoria: ${freshness.label} (zona horaria México). Prohibido años anteriores a ${freshness.year}.

TEMA DEL ARTÍCULO (obligatorio — lo que pidió el usuario): "${articleTopic}"
Categoría: ${topic.category}
El título, slug, h1 y enfoque del contenido deben ser sobre ESE tema, no sobre otro del catálogo.
${keywordBlock}
${plan.indexingKeywords?.regions?.length ? `

INDEXACIÓN LOCAL (menciona al menos una vez en el artículo que GH Specialist atiende México; si encaja, una línea sobre Torreón/La Laguna o Monterrey sin inventar datos locales):
${plan.indexingKeywords.regions.map((r) => `- ${r.region}: ${r.keywords.join(', ')}`).join('\n')}` : ''}

Artículos ya publicados (enlaza 2-3 si encajan): ${slugList}

Servicios (enlaces relativos ../servicios/...):
- chatbot-ia-whatsapp.html
- crm-kommo.html
- automatizacion-total.html
- web-seo-blog-ia.html
- agentes-omnicanal.html

REGLAS DE LONGITUD (CRÍTICO — el lector no lee paredes de texto):
- Entre 700 y 1.000 palabras en content_html (NUNCA más de 1.000). Si te pasas, el sistema RECORTA el artículo y borra secciones del final.
- Máximo 4 secciones <h2>; evita <h3> salvo que sea indispensable.
- Párrafos cortos (2–3 líneas). Listas con máximo 5 viñetas.
- Ve al grano: una idea por sección, sin relleno ni repetir lo mismo con otras palabras.
- Tono directo para dueño de PYME ocupado en México.
- read_time en JSON: entero 4, 5 o 6 (minutos de lectura), acorde a la longitud real.

REGLAS SEO:
- 2–4 enlaces internos
- CTAs a Google Calendar (${GOOGLE_CALENDAR_URL}) y WhatsApp +528712638082
- slug kebab-case del TEMA DEL USUARIO, terminar en "-${freshness.slugSuffix}"
- title sobre el TEMA DEL USUARIO y vigencia "${freshness.label}" (ej. "... | guía ${freshness.label}")
- Primer párrafo: mencionar actualización ${freshness.label}
- PROHIBIDO la palabra "leads" (usa contactos, interesados, prospectos)
- PROHIBIDO jerga inventada (B2B leads, funnel anglicismos) salvo WhatsApp/CRM reales
${comparativeNote}

Responde SOLO JSON:
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
  "card_city_label": "México",
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

function buildArticleHtml(article, dateIso, hero) {
  const slug = article.slug.replace(/\.html$/, '');
  const relatedHtml = (article.related || [])
    .slice(0, 3)
    .map(
      (r) =>
        `      <a href="${escapeHtml(r.slug)}" class="related-item"><strong>${escapeHtml(r.title)}</strong><span>${escapeHtml(r.desc)}</span></a>`
    )
    .join('\n');

  const dateDisplay = new Date(dateIso).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" href="../favicon.png" type="image/png">
  <link rel="apple-touch-icon" href="../favicon.png">
  <title>${escapeHtml(article.title)} | GH Specialist</title>
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
    headline: article.title,
    description: article.description,
    image: hero.og,
    author: { '@type': 'Person', name: 'Pedro Luis Díaz Velázquez', url: `${SITE}/sobre-pedro.html` },
    publisher: { '@type': 'Organization', name: 'GH Specialist', logo: { '@type': 'ImageObject', url: `${SITE}/2.png` } },
    datePublished: dateIso,
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
<article class="art">
  <div class="art-label">${escapeHtml(article.category_label)}</div>
  <h1>${escapeHtml(article.title)}</h1>
  <div class="art-meta">Por <strong>Pedro Luis Díaz Velázquez</strong> · GH Specialist · ${dateDisplay} · ${article.read_time || 5} min lectura</div>
  <figure class="art-hero">
    <img src="${hero.img}" alt="${escapeHtml(article.title)}" width="1200" height="630" loading="eager">
    <figcaption>${hero.generated ? 'Imagen hero IA · GH Specialist · ' + BLOG_YEAR : escapeHtml(article.card_city_label || hero.city || 'México')}</figcaption>
  </figure>
  ${article.content_html}
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
<div class="ftr-art">© 2026 GH Specialist · <a href="https://ghspecialist.com">ghspecialist.com</a></div>
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
      <div class="card-img" style="background-image:url('${hero.img}')"><span class="card-city">${escapeHtml(article.card_city_label || hero.city)}</span></div>
      <div class="card-body">
        <span class="card-tag">${escapeHtml(article.category_tag)}</span>
        <h2>${escapeHtml(article.title)}</h2>
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
  const clientSecret = process.env.CLIENT_SECRET || '';
  const expectedSecret = process.env.BLOG_GENERATE_SECRET || '';
  if (expectedSecret && clientSecret !== expectedSecret) {
    console.error('Secret inválido');
    process.exit(1);
  }

  const hasKey =
    process.env.DEEPSEEK_API_KEY ||
    process.env.QWEN_API_KEY ||
    process.env.DASHSCOPE_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.OPENAI_API_KEY;
  if (!hasKey) {
    console.error('Falta DEEPSEEK_API_KEY o QWEN_API_KEY en secrets');
    process.exit(1);
  }

  const userTopic = (process.env.BLOG_TOPIC || '').trim();
  const userKeywords = (process.env.BLOG_KEYWORDS || '').trim();
  const userInput = [userTopic, userKeywords].filter(Boolean).join(' ').trim();

  const existing = await listExistingArticles();
  const haystack = await fetchExistingHaystack(existing);
  const freshness = getBlogFreshness();

  /** @type {import('./gh-blog-prepare.mjs').prepareBlogGeneration extends (...args: any) => Promise<infer R> ? R : never} */
  let plan;

  if (userInput) {
    plan = await prepareBlogGeneration(userInput);
    console.log(`→ Tema usuario: «${plan.userTopic}»`);
    console.log(`→ Keywords SEO: ${plan.seoKeywords.join(' | ')}`);
    if (plan.indexingKeywords?.regions) {
      for (const r of plan.indexingKeywords.regions) {
        console.log(`→ Indexar ${r.region}: ${r.keywords.join(' | ')}`);
      }
    }
  } else {
    plan = prepareBlogAuto(haystack);
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

  const raw = await generateArticleContent(buildPrompt(plan, freshness, existing));
  const parsed = extractJsonObject(raw.replace(/```json\s*/gi, '').replace(/```/g, ''));

  if (!parsed.slug) parsed.slug = slugify(plan.userTopic);
  parsed.slug = slugify(parsed.slug.replace(/\.html$/, ''));
  if (!parsed.slug.endsWith('.html')) parsed.slug += '.html';

  applyFreshnessToArticle(parsed, freshness, plan.userTopic);
  enforceArticleLength(parsed);
  const wordCount = countWordsInHtml(parsed.content_html || '');
  console.log(`→ Longitud: ${wordCount} palabras (máx ${BLOG_MAX_WORDS})`);
  parsed.slug = slugify(parsed.slug.replace(/\.html$/, '')) + '.html';
  if (parsed.related?.length) {
    for (const r of parsed.related) {
      if (r.title) r.title = sanitizeBannedWords(sanitizeStaleYears(r.title, freshness));
      if (r.desc) r.desc = sanitizeBannedWords(sanitizeStaleYears(r.desc, freshness));
    }
  }

  const titleKey = slugify(parsed.title || plan.userTopic)
    .replace(/-mexico.*$/, '')
    .replace(/-mayo-\d{4}$/, '')
    .replace(/-\d{4}$/, '');
  if (!userInput) {
    for (const ex of existing) {
      const exHtml = await readFile(join(ROOT, 'blog', ex), 'utf8');
      const exTitle = exHtml.match(/<title>([^<]*)<\/title>/i)?.[1] || '';
      const exKey = slugify(exTitle).replace(/-mexico.*$/, '').replace(/-2026.*$/, '');
      if (exKey && titleKey && exKey === titleKey) {
        console.error(`Artículo similar ya existe: ${ex}`);
        process.exit(0);
      }
    }
  } else {
    const userSlugBase = slugify(userInput).replace(/-mayo-\d{4}$/, '').slice(0, 48);
    if (userSlugBase) {
      const candidate = `${userSlugBase}-${freshness.slugSuffix}.html`;
      if (!existing.includes(candidate)) parsed.slug = candidate;
    }
  }

  if (existing.includes(parsed.slug)) {
    let n = 2;
    let candidate = `${parsed.slug.replace('.html', '')}-v${n}.html`;
    while (existing.includes(candidate)) {
      n += 1;
      candidate = `${parsed.slug.replace('.html', '')}-v${n}.html`;
    }
    parsed.slug = candidate;
  }

  const hero = await resolveHeroImage(plan.userTopic, '', parsed.slug);
  const dateIso = new Date().toISOString().slice(0, 10);

  const html = buildArticleHtml(parsed, dateIso, hero);
  await writeFile(join(ROOT, 'blog', parsed.slug), html, 'utf8');
  await insertCardInIndex(buildCard(parsed, dateIso, hero));

  execSync('node scripts/generate-seo.mjs', { cwd: ROOT, stdio: 'inherit' });

  await pingSearchEngines([`/blog/${parsed.slug}`, '/blog/', '/sitemap.xml']);

  const outPath = join(ROOT, 'blog-generate-result.json');
  await writeFile(
    outPath,
    JSON.stringify({
      ok: true,
      title: parsed.title,
      slug: parsed.slug,
      url: `${SITE}/blog/${parsed.slug}`,
      resolved: resolveMeta,
      seoKeywords: plan.seoKeywords,
      indexingKeywords: plan.indexingKeywords,
    }),
    'utf8'
  );
  console.log(`✓ Artículo publicado: ${parsed.slug}`);
}

main().catch(async (err) => {
  const msg = err?.message || String(err);
  console.error(msg);
  try {
    const outPath = join(ROOT, 'blog-generate-result.json');
    await writeFile(outPath, JSON.stringify({ ok: false, error: msg.slice(0, 500) }), 'utf8');
  } catch {
    /* noop */
  }
  process.exit(1);
});
