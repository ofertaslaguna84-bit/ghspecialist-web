#!/usr/bin/env node
/**
 * Páginas de intención comercial desde data/seo-intencion.json:
 *   - tipo "servicio"     → Service + WebPage + BreadcrumbList + FAQPage
 *   - tipo "comparativa"  → WebPage + BreadcrumbList + FAQPage
 *   - tipo "faq"          → WebPage + BreadcrumbList + FAQPage (preguntas por grupos)
 * Ejecutar: node scripts/generate-intent-pages.mjs  (va dentro de `npm run seo:generate`)
 *
 * Igual que en servicio×ciudad, las FAQ visibles y el JSON-LD salen de la misma lista.
 * El hero siempre lleva foto con velo oscuro (nunca un bloque de color liso).
 * dateModified solo cambia cuando cambia el contenido de la página (campo `modified`
 * o, si falta, `published`), para no decirle a Google "actualizado hoy" en cada build.
 */
import { writeFile, mkdir } from 'node:fs/promises';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SITE = 'https://ghspecialist.com';
const CALENDAR = 'https://calendar.app.google/rz32YjLinKvYWUTT9';
const WA = '528712638082';
const AUTOR = 'Pedro Luis Díaz Velázquez';
const TITLE_MAX = 60;
const DESC_MAX = 160;

const { paginas } = JSON.parse(readFileSync(join(ROOT, 'data/seo-intencion.json'), 'utf8'));

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// Texto plano para el JSON-LD (los párrafos del JSON pueden traer <a> y <strong>).
const plain = (s) => String(s ?? '').replace(/<[^>]+>/g, '');

const fechaLarga = (iso) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });

/** Los href del JSON son relativos a la raíz del sitio; aquí se ajustan a la carpeta de la página. */
function rel(depth, href) {
  if (/^(https?:|#|mailto:|tel:)/.test(href)) return href;
  return depth + href;
}

/** Enlaces dentro de párrafos: en el JSON van relativos a la carpeta de la propia página. */
function checkInlineLinks(page, html) {
  const dir = dirname(join(ROOT, page.out));
  for (const m of html.matchAll(/href="([^"#]+)(#[^"]*)?"/g)) {
    const href = m[1];
    if (/^(https?:|mailto:|tel:)/.test(href)) continue;
    const target = join(dir, href.endsWith('/') ? `${href}index.html` : href);
    if (!existsSync(target)) throw new Error(`${page.out}: enlace interno roto → ${href}`);
  }
}

function faqItems(faqs, depth) {
  return faqs
    .map(
      (f) => `        <details class="faq">
          <summary>${esc(f.q)}</summary>
          <div class="faq-a"><p>${esc(f.a)}${f.href ? ` <a href="${rel(depth, f.href)}">${esc(f.link || 'Ver más')} →</a>` : ''}</p></div>
        </details>`
    )
    .join('\n');
}

function seccionHtml(s) {
  const out = [];
  if (s.label) out.push(`      <span class="label">${esc(s.label)}</span>`);
  out.push(`      <h2 class="title">${esc(s.h2)}</h2>`);
  for (const p of s.p || []) out.push(`      <p>${p}</p>`);
  if (s.pasos) {
    out.push(
      `      <ol class="pasos">\n${s.pasos
        .map((p) => `        <li><strong>${esc(p.t)}.</strong> ${esc(p.d)}</li>`)
        .join('\n')}\n      </ol>`
    );
  }
  if (s.cifras) {
    out.push(
      `      <div class="cifras">\n${s.cifras
        .map((c) => `        <div class="cifra"><b>${esc(c.n)}</b><span>${esc(c.t)}</span></div>`)
        .join('\n')}\n      </div>`
    );
  }
  if (s.lista) {
    out.push(`      <ul>\n${s.lista.map((i) => `        <li class="check">${esc(i)}</li>`).join('\n')}\n      </ul>`);
  }
  if (s.tabla) {
    out.push(
      `      <div class="tabla-wrap"><table>\n        <thead><tr>${s.tabla.cols
        .map((c) => `<th>${esc(c)}</th>`)
        .join('')}</tr></thead>\n        <tbody>\n${s.tabla.filas
        .map((f) => `          <tr>${f.map((c, i) => (i === 0 ? `<th scope="row">${esc(c)}</th>` : `<td>${esc(c)}</td>`)).join('')}</tr>`)
        .join('\n')}\n        </tbody>\n      </table></div>`
    );
  }
  for (const p of s.despues || []) out.push(`      <p>${p}</p>`);
  return `  <section class="sec${s.gris ? ' sec-gray' : ''}">
    <div class="w prose">
${out.join('\n')}
    </div>
  </section>`;
}

function buildPage(page) {
  if (page.title.length > TITLE_MAX) throw new Error(`${page.out}: title de ${page.title.length} caracteres (máx ${TITLE_MAX})`);
  if (page.description.length > DESC_MAX)
    throw new Error(`${page.out}: description de ${page.description.length} caracteres (máx ${DESC_MAX})`);
  if (!page.hero || !existsSync(join(ROOT, page.hero))) throw new Error(`${page.out}: falta la foto del hero (${page.hero})`);

  const depth = '../'.repeat(page.out.split('/').length - 1);
  const url = `${SITE}/${page.out}`;
  const modified = page.modified || page.published;
  const enServicios = page.out.startsWith('servicios/');
  const allFaqs = page.grupos ? page.grupos.flatMap((g) => g.faqs) : page.faqs;

  const webpage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    url,
    name: page.title,
    description: page.description,
    inLanguage: 'es-MX',
    datePublished: page.published,
    dateModified: modified,
    isPartOf: { '@type': 'WebSite', name: 'GH Specialist', url: `${SITE}/` },
    author: { '@type': 'Person', name: AUTOR, url: `${SITE}/sobre-pedro.html` },
    publisher: { '@type': 'Organization', name: 'GH Specialist', url: SITE },
  };
  const faqEntities = allFaqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  }));
  const schemas = [];
  if (page.tipo === 'servicio') {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: page.serviceName,
      serviceType: page.serviceType,
      description: page.description,
      url,
      provider: {
        '@type': 'ProfessionalService',
        name: 'GH Specialist',
        url: SITE,
        image: `${SITE}/og-gh.jpg`,
        telephone: '+528712638082',
        founder: { '@type': 'Person', name: AUTOR },
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Torreón',
          addressRegion: 'Coahuila',
          addressCountry: 'MX',
        },
      },
      areaServed: { '@type': 'Country', name: 'México' },
      audience: { '@type': 'BusinessAudience', audienceType: page.audience },
    });
  }
  schemas.push(webpage);
  schemas.push({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqEntities });
  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE}/` },
      ...(enServicios ? [{ '@type': 'ListItem', position: 2, name: 'Servicios', item: `${SITE}/servicios/` }] : []),
      { '@type': 'ListItem', position: enServicios ? 3 : 2, name: page.crumb, item: url },
    ],
  });

  const wa = `https://wa.me/${WA}?text=${encodeURIComponent(page.waText)}`;
  const cuerpo = (page.secciones || []).map(seccionHtml).join('\n\n');
  checkInlineLinks(page, cuerpo);

  const faqBlock = page.grupos
    ? page.grupos
        .map(
          (g, i) => `  <section class="sec${i % 2 ? ' sec-gray' : ''}">
    <div class="w">
      <h2 class="title">${esc(g.h2)}</h2>
${faqItems(g.faqs, depth)}
    </div>
  </section>`
        )
        .join('\n\n')
    : `  <section class="sec">
    <div class="w">
      <span class="label">Preguntas frecuentes</span>
      <h2 class="title">${esc(page.faqTitulo || 'Lo que preguntan antes de contratar')}</h2>
${faqItems(page.faqs, depth)}
    </div>
  </section>`;

  const relacionados = page.relacionados
    .map((r) => {
      if (!existsSync(join(ROOT, r.href.endsWith('/') ? `${r.href}index.html` : r.href)))
        throw new Error(`${page.out}: enlace relacionado roto → ${r.href}`);
      return `<a href="${rel(depth, r.href)}">${esc(r.t)}</a>`;
    })
    .join('\n        ');
  for (const f of allFaqs) {
    if (f.href && !existsSync(join(ROOT, f.href.endsWith('/') ? `${f.href}index.html` : f.href)))
      throw new Error(`${page.out}: enlace de FAQ roto → ${f.href}`);
  }

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" href="${depth}favicon.png" type="image/png">
  <title>${esc(page.title)}</title>
  <meta name="description" content="${esc(page.description)}">
  <meta name="keywords" content="${esc(page.keywords)}">
  <meta name="author" content="${esc(AUTOR)}">
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${esc(page.title)}">
  <meta property="og:description" content="${esc(page.description)}">
  <meta property="og:image" content="${SITE}/og-gh.jpg">
  <meta property="og:locale" content="es_MX">
  <meta property="og:site_name" content="GH Specialist">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(page.title)}">
  <meta name="twitter:description" content="${esc(page.description)}">
  <meta name="twitter:image" content="${SITE}/og-gh.jpg">
  <meta property="article:modified_time" content="${modified}">
  <script src="${depth}js/gh-site-config.js"></script>
  <script src="${depth}js/gh-analytics.js" async></script>
${schemas.map((s) => `  <script type="application/ld+json">${JSON.stringify(s)}</script>`).join('\n')}
  <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" onload="this.onload=null;this.rel='stylesheet'"><noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap"></noscript>
  <style>
    *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
    :root{--p:#6D28D9;--ink:#1A1530;--ink3:#555;--border:#E5E0EF;--bg2:#FAFAFA}
    html{overflow-x:hidden}
    body{font-family:'Inter',sans-serif;color:var(--ink);line-height:1.6}
    a{text-decoration:none;color:inherit}
    .w{max-width:960px;margin:0 auto;padding:0 24px}
    .hdr{padding:16px 0;border-bottom:1px solid var(--border)}
    .hdr-inner{display:flex;justify-content:space-between;align-items:center;max-width:960px;margin:0 auto;padding:0 24px}
    .hdr-logo{height:44px;width:auto}
    .crumbs{font-size:12px;color:var(--ink3);padding:12px 0}
    .crumbs a{color:var(--p);font-weight:600}
    .hero{padding:76px 0 52px;background:linear-gradient(rgba(22,14,64,.86),rgba(22,14,64,.72)),url('${depth}${page.hero}') center/cover;color:#fff}
    .hero h1{font-size:clamp(27px,4vw,42px);font-weight:900;line-height:1.1;margin-bottom:14px;max-width:820px;text-shadow:0 1px 12px rgba(0,0,0,.35)}
    .hero p{opacity:.95;max-width:680px;margin-bottom:22px;font-size:16.5px}
    .hero .label{color:#c4b5fd}
    .btn{display:inline-flex;padding:12px 22px;border-radius:8px;background:var(--p);color:#fff;font-weight:700;font-size:14px;margin-right:8px;margin-bottom:8px}
    .btn-wa{background:#25D366}
    .sec{padding:48px 0}
    .sec-gray{background:var(--bg2)}
    .label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--p);margin-bottom:8px;display:block}
    .title{font-size:clamp(22px,3vw,31px);font-weight:800;margin-bottom:14px;line-height:1.2}
    .prose p{color:var(--ink3);margin-bottom:14px;font-size:15.5px;line-height:1.75}
    .prose p strong{color:var(--ink)}
    .prose a,.faq-a a{color:var(--p);font-weight:600}
    .resumen{border-left:4px solid var(--p);background:var(--bg2);padding:18px 20px;border-radius:0 10px 10px 0}
    .resumen p{margin:0;font-size:15.5px;color:var(--ink);line-height:1.7}
    ul,ol{list-style:none;margin-bottom:14px}
    li{font-size:15.5px;color:var(--ink3);padding:7px 0 7px 26px;position:relative;line-height:1.65}
    li.check::before{content:"✓";position:absolute;left:0;color:var(--p);font-weight:900}
    .pasos{counter-reset:paso}
    .pasos li{counter-increment:paso;padding-left:42px;margin-bottom:6px}
    .pasos li::before{content:counter(paso);position:absolute;left:0;top:8px;width:28px;height:28px;border-radius:50%;background:var(--p);color:#fff;font-weight:800;font-size:13px;display:flex;align-items:center;justify-content:center}
    .pasos li strong{color:var(--ink)}
    .cifras{display:grid;gap:14px;grid-template-columns:1fr;margin:20px 0}
    @media(min-width:700px){.cifras{grid-template-columns:repeat(3,1fr)}}
    .cifra{border:1px solid var(--border);border-radius:14px;padding:20px;background:#fff;min-width:0}
    .cifra b{display:block;font-size:34px;font-weight:900;color:var(--p);line-height:1.1;margin-bottom:6px}
    .cifra span{font-size:13.5px;color:var(--ink3);line-height:1.5;display:block}
    .tabla-wrap{overflow-x:auto;margin:6px 0 14px;border:1px solid var(--border);border-radius:12px;background:#fff}
    table{border-collapse:collapse;width:100%;min-width:620px;font-size:14.5px}
    th,td{text-align:left;padding:12px 14px;border-bottom:1px solid var(--border);vertical-align:top;line-height:1.5}
    thead th{background:#F3EEFF;color:var(--p);font-weight:800;font-size:13px}
    tbody th{font-weight:700;color:var(--ink);width:24%}
    td{color:var(--ink3)}
    tbody tr:last-child th,tbody tr:last-child td{border-bottom:0}
    .faq{border-bottom:1px solid var(--border);padding:2px 0}
    .faq summary{cursor:pointer;font-weight:700;font-size:15.5px;padding:15px 0;list-style:none;display:flex;justify-content:space-between;gap:14px;align-items:flex-start}
    .faq summary::-webkit-details-marker{display:none}
    .faq summary::after{content:"+";color:var(--p);font-weight:900;font-size:20px;line-height:1}
    .faq[open] summary::after{content:"–"}
    .faq-a p{color:var(--ink3);font-size:15px;line-height:1.75;padding:0 0 16px}
    .links{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}
    .links a{padding:8px 14px;border:1.5px solid var(--border);border-radius:8px;font-size:12.5px;font-weight:600;color:var(--p);background:#fff}
    .updated{font-size:12.5px;color:#888;padding:22px 0 0}
    .cta{background:linear-gradient(rgba(22,14,64,.9),rgba(22,14,64,.82)),url('${depth}${page.hero}') center/cover;color:#fff;text-align:center;padding:56px 24px}
    .cta h2{font-size:clamp(21px,3vw,28px);font-weight:900;margin:0 auto 10px;max-width:720px;line-height:1.2}
    .cta p{opacity:.92;margin-bottom:20px;font-size:15px}
    .cta .btn{background:#fff;color:var(--p)}
    .cta .btn-wa{background:#25D366;color:#fff}
    .footer{text-align:center;padding:28px;font-size:12px;color:#888;border-top:1px solid var(--border)}
    .footer a{color:var(--p);font-weight:600}
  </style>
</head>
<body>
  <header class="hdr">
    <div class="hdr-inner">
      <a href="${depth || './'}"><img src="${depth}logo-gh.webp" width="900" height="200" alt="GH Specialist" class="hdr-logo" decoding="async"></a>
      <a href="${CALENDAR}" class="btn">Agendar</a>
    </div>
  </header>

  <section class="hero">
    <div class="w">
      <span class="label">${esc(page.kicker)}</span>
      <h1>${esc(page.h1)}</h1>
      <p>${esc(page.sub)}</p>
      <a href="${CALENDAR}" class="btn">Diagnóstico gratuito</a>
      <a href="${wa}" class="btn btn-wa">WhatsApp</a>
    </div>
  </section>

  <div class="w">
    <nav class="crumbs"><a href="${depth || './'}">Inicio</a> › ${enServicios ? `<a href="${depth}servicios/">Servicios</a> › ` : ''}${esc(page.crumb)}</nav>
  </div>

  <section class="sec" style="padding-bottom:8px">
    <div class="w prose">
      <div class="resumen"><p>${esc(page.resumen)}</p></div>
    </div>
  </section>

${cuerpo}

${faqBlock}

  <div class="w"><p class="updated" style="padding-bottom:28px">Actualizado el ${fechaLarga(modified)} · Autor: <a href="${depth}sobre-pedro.html" style="color:var(--p);font-weight:600">${esc(AUTOR)}</a>, GH Specialist</p></div>

  <section class="cta">
    <h2>${esc(page.ctaTitulo)}</h2>
    <p>${esc(page.ctaTexto)}</p>
    <a href="${CALENDAR}" class="btn">Agendar diagnóstico</a>
    <a href="${wa}" class="btn btn-wa">Escribir por WhatsApp</a>
  </section>

  <section class="sec sec-gray">
    <div class="w">
      <span class="label">Sigue leyendo</span>
      <h2 class="title">Relacionado</h2>
      <div class="links">
        ${relacionados}
      </div>
    </div>
  </section>

  <footer class="footer">
    <p>© 2026 GH Specialist · <a href="${depth || './'}">Inicio</a> · <a href="${depth}servicios/">Servicios</a> · <a href="${depth}ciudades/">Ciudades</a> · <a href="${depth}blog/">Blog</a> · <a href="${depth}preguntas-frecuentes.html">Preguntas frecuentes</a> · <a href="${depth}sobre-pedro.html">Sobre Pedro</a></p>
  </footer>
<script src="/js/grabovoi.js" defer></script>
</body>
</html>
`;
}

async function main() {
  const titles = new Set();
  // Dos pasadas: la primera crea los archivos para que los enlaces entre páginas nuevas existan al validar.
  for (const page of paginas) {
    const file = join(ROOT, page.out);
    await mkdir(dirname(file), { recursive: true });
    if (!existsSync(file)) await writeFile(file, '', 'utf8');
  }
  for (const page of paginas) {
    if (titles.has(page.title)) throw new Error(`title repetido: ${page.title}`);
    titles.add(page.title);
    await writeFile(join(ROOT, page.out), buildPage(page), 'utf8');
    console.log(`✓ ${page.out}`);
  }
  console.log(`✓ páginas de intención — ${paginas.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
