#!/usr/bin/env node
/**
 * Genera un artículo de blog con Claude (Anthropic), escribe HTML, actualiza blog/index.html y sitemap/RSS.
 * Uso local: BLOG_TOPIC="..." ANTHROPIC_API_KEY=sk-ant-... node scripts/blog-generate.mjs
 * CI: secrets ANTHROPIC_API_KEY + BLOG_GENERATE_SECRET; client_payload.secret debe coincidir.
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SITE = 'https://ghspecialist.com';

const HERO_CARDS = [
  { img: '../fotos/slide2_img2.png', city: 'México', og: `${SITE}/fotos/slide2_img2.png` },
  { img: '../hero-torreon.jpg', city: 'Torreón', og: `${SITE}/hero-torreon.jpg` },
  { img: '../hero-guadalajara.jpg', city: 'Guadalajara', og: `${SITE}/hero-guadalajara.jpg` },
  { img: '../hero-queretaro.jpg', city: 'Querétaro', og: `${SITE}/hero-queretaro.jpg` },
  { img: '../hero-chihuahua.jpg', city: 'Chihuahua', og: `${SITE}/hero-chihuahua.jpg` },
];

const AUTO_TOPICS = [
  'cómo automatizar tu negocio con inteligencia artificial en México 2026',
  'chatbot WhatsApp Business con IA para empresas en México',
  'CRM Kommo para vender por WhatsApp guía para PYMEs',
  'agentes de IA para empresas en México casos de uso',
  'cómo reducir costos operativos con automatización IA',
  'WhatsApp marketing con IA para aumentar ventas en México',
  'embudo de ventas automatizado con IA paso a paso',
  'IA para inmobiliarias automatizar citas y prospectos',
  'automatización IA para constructoras en México',
  'ROI de la inteligencia artificial en negocios mexicanos',
];

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

async function callClaude(prompt, apiKey) {
  const model = (process.env.CLAUDE_MODEL || 'claude-3-5-haiku-20241022').trim();
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: 8192,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  const raw = await res.text();
  if (!res.ok) {
    throw new Error(`Anthropic ${res.status}: ${raw.slice(0, 300)}`);
  }
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error('Anthropic: respuesta no JSON');
  }
  const text = data.content?.find((c) => c.type === 'text')?.text;
  if (!text) throw new Error('Claude no devolvió texto');
  return text;
}

function buildPrompt(topic, keywords, existingSlugs) {
  const slugList = existingSlugs.map((s) => s.replace('.html', '')).join(', ');
  return `Eres redactor SEO senior para GH Specialist (automatización con IA, chatbots WhatsApp, CRM Kommo, México y LATAM).

Escribe UN artículo en español de México sobre: ${topic}
${keywords ? `Palabras clave / ángulo: ${keywords}` : ''}

Artículos ya publicados (enlaza 2-3 si encajan): ${slugList}

Servicios para enlazar cuando aplique:
- /servicios/chatbot-ia-whatsapp.html
- /servicios/crm-kommo.html
- /servicios/automatizacion-total.html
- /servicios/web-seo-blog-ia.html
- /servicios/agentes-omnicanal.html

REGLAS:
- 1.500–2.200 palabras en content_html (HTML: p, h2, h3, ul, ol, li, strong, a — sin h1)
- 3–5 enlaces internos a blog o servicios (href relativos ../servicios/... o slug.html)
- Tono profesional para dueños de negocio
- CTAs naturales a Calendly y WhatsApp +528712638082
- slug único, kebab-case, sin acentos, termina en -mexico o -2026 si encaja

Responde SOLO JSON (sin markdown):
{
  "title": "Título SEO (sin | GH Specialist)",
  "slug": "slug-articulo-mexico-2026",
  "description": "meta description max 155 chars",
  "og_title": "Título corto para redes",
  "og_description": "Descripción OG max 120 chars",
  "category_tag": "Chatbots · WhatsApp",
  "category_label": "Blog · Categoría",
  "breadcrumb_title": "Título corto breadcrumb",
  "read_time": 8,
  "card_excerpt": "Resumen 1-2 líneas para listado del blog",
  "card_city_label": "Etiqueta corta ciudad o tema",
  "content_html": "<p>...</p><h2>...</h2>...",
  "related": [
    {"slug": "otro-articulo.html", "title": "...", "desc": "..."},
    {"slug": "...", "title": "...", "desc": "..."}
  ]
}`;
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
    .art-meta{font-size:13px;color:var(--ink);margin-bottom:40px;padding-bottom:24px;border-bottom:1px solid var(--border)}
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
  <div class="art-meta">Por <strong>Pedro Luis Díaz Velázquez</strong> · GH Specialist · ${dateDisplay} · ${article.read_time || 8} min lectura</div>
  ${article.content_html}
  <div class="cta-art">
    <h3>¿Quieres automatizar tu negocio con IA?</h3>
    <p>Diagnóstico gratuito de 30 minutos. Te decimos qué implementar primero.</p>
    <a href="https://calendly.com/ghspecialist" target="_blank" rel="noopener">📅 Agendar diagnóstico →</a>
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
          <span>${dateShort} · ${article.read_time || 8} min</span>
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

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('Falta ANTHROPIC_API_KEY en secrets del repo');
    process.exit(1);
  }

  const topic =
    (process.env.BLOG_TOPIC || '').trim() ||
    AUTO_TOPICS[Math.floor(Math.random() * AUTO_TOPICS.length)];
  const keywords = (process.env.BLOG_KEYWORDS || '').trim();

  const existing = await listExistingArticles();
  const raw = await callClaude(buildPrompt(topic, keywords, existing), apiKey);
  const parsed = extractJsonObject(raw.replace(/```json\s*/gi, '').replace(/```/g, ''));

  if (!parsed.slug) parsed.slug = slugify(parsed.title || topic);
  parsed.slug = slugify(parsed.slug);
  if (!parsed.slug.endsWith('.html')) parsed.slug += '.html';

  const filePath = join(ROOT, 'blog', parsed.slug);
  if (existing.includes(parsed.slug)) {
    parsed.slug = parsed.slug.replace('.html', '') + '-' + Date.now().toString(36) + '.html';
  }

  const hero = HERO_CARDS[Math.floor(Math.random() * HERO_CARDS.length)];
  const dateIso = new Date().toISOString().slice(0, 10);

  const html = buildArticleHtml(parsed, dateIso, hero);
  await writeFile(join(ROOT, 'blog', parsed.slug), html, 'utf8');
  await insertCardInIndex(buildCard(parsed, dateIso, hero));

  execSync('node scripts/generate-seo.mjs', { cwd: ROOT, stdio: 'inherit' });

  const outPath = join(ROOT, 'blog-generate-result.json');
  await writeFile(
    outPath,
    JSON.stringify({
      ok: true,
      title: parsed.title,
      slug: parsed.slug,
      url: `${SITE}/blog/${parsed.slug}`,
    }),
    'utf8'
  );
  console.log(`✓ Artículo publicado: ${parsed.slug}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
