#!/usr/bin/env node
/**
 * Matriz servicio×ciudad (patrón Adestajo) → /servicios/{servicio}/{ciudad}/
 * Ejecutar: node scripts/generate-servicio-ciudad-pages.mjs
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SITE = 'https://ghspecialist.com';
const CALENDAR = 'https://calendar.app.google/rz32YjLinKvYWUTT9';

const cities = JSON.parse(readFileSync(join(ROOT, 'data/seo-cities.json'), 'utf8')).filter(
  (c) => !c.legacyUrl
);
const services = JSON.parse(readFileSync(join(ROOT, 'data/seo-services.json'), 'utf8'));

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function waText(svc, city) {
  return encodeURIComponent(`Hola Pedro, quiero ${svc.short} en ${city.name}`);
}

function buildPage(svc, city, allCities, allServices) {
  const url = `${SITE}/servicios/${svc.slug}/${city.slug}/`;
  const depth = '../../../';
  const title = `${svc.short} en ${city.name}, ${city.state} | GH Specialist`;
  const description = `${svc.desc} Para empresas en ${city.name}, ${city.state}. Desde $${Number(svc.price).toLocaleString('es-MX')} MXN + IVA. Diagnóstico gratuito GH Specialist.`;

  const otherCities = allCities
    .filter((c) => c.slug !== city.slug)
    .slice(0, 6)
    .map(
      (c) =>
        `<a href="${depth}servicios/${svc.slug}/${c.slug}/">${esc(svc.short)} ${esc(c.name)}</a>`
    )
    .join('\n        ');

  const otherServices = allServices
    .filter((s) => s.slug !== svc.slug)
    .slice(0, 4)
    .map(
      (s) =>
        `<a href="${depth}servicios/${s.slug}/${city.slug}/">${esc(s.short)} ${esc(city.name)}</a>`
    )
    .join('\n        ');

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `${svc.name} en ${city.name}`,
    provider: { '@type': 'Organization', name: 'GH Specialist', telephone: '+528712638082' },
    description: svc.desc,
    areaServed: { '@type': 'City', name: city.name, containedInPlace: { '@type': 'State', name: city.state } },
    offers: { '@type': 'Offer', priceCurrency: 'MXN', price: svc.price, description: `Desde $${svc.price} MXN + IVA` },
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Servicios', item: `${SITE}/servicios/` },
      { '@type': 'ListItem', position: 3, name: svc.name, item: `${SITE}/servicios/${svc.file}` },
      { '@type': 'ListItem', position: 4, name: city.name, item: url },
    ],
  };

  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `¿Cuánto cuesta ${svc.short.toLowerCase()} en ${city.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Desde $${Number(svc.price).toLocaleString('es-MX')} MXN + IVA. Incluye implementación, capacitación y soporte inicial. Diagnóstico gratuito con GH Specialist.`,
        },
      },
      {
        '@type': 'Question',
        name: `¿Atienden empresas en ${city.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Sí. Implementamos ${svc.name.toLowerCase()} para empresas en ${city.name}, ${city.state} y todo México. Operación remota o presencial.`,
        },
      },
    ],
  };

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" href="${depth}favicon.png" type="image/png">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="keywords" content="${esc(svc.short.toLowerCase())} ${esc(city.name.toLowerCase())}, ${esc(svc.slug.replace(/-/g, ' '))} ${esc(city.state.toLowerCase())}, automatizar whatsapp ${esc(city.name.toLowerCase())}, ia empresas ${esc(city.name.toLowerCase())}">
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:image" content="${SITE}/${city.hero}">
  <meta property="og:locale" content="es_MX">
  <script src="${depth}js/gh-site-config.js"></script>
  <script src="${depth}js/gh-analytics.js" async></script>
  <script type="application/ld+json">${JSON.stringify(schema)}</script>
  <script type="application/ld+json">${JSON.stringify(breadcrumb)}</script>
  <script type="application/ld+json">${JSON.stringify(faq)}</script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
    :root{--p:#7C4DFF;--ink:#111;--ink3:#666;--border:#E8E8E8;--bg2:#FAFAFA}
    body{font-family:'Inter',sans-serif;color:var(--ink);line-height:1.6}
    a{text-decoration:none;color:inherit}
    .w{max-width:960px;margin:0 auto;padding:0 24px}
    .hdr{padding:16px 0;border-bottom:1px solid var(--border)}
    .hdr-inner{display:flex;justify-content:space-between;align-items:center;max-width:960px;margin:0 auto;padding:0 24px}
    .hdr-logo{height:26px}
    .hero{padding:72px 0 48px;background:linear-gradient(rgba(0,0,0,.6),rgba(0,0,0,.5)),url('${depth}${city.hero}') center/cover;color:#fff}
    .hero h1{font-size:clamp(28px,4vw,44px);font-weight:900;line-height:1.08;margin-bottom:14px}
    .hero h1 em{font-style:normal;color:#c4b5fd}
    .hero p{opacity:.92;max-width:560px;margin-bottom:22px;font-size:16px}
    .btn{display:inline-flex;padding:12px 22px;border-radius:8px;background:var(--p);color:#fff;font-weight:700;font-size:14px;margin-right:8px}
    .btn-wa{background:#25D366}
    .sec{padding:48px 0}
    .sec-gray{background:var(--bg2)}
    .label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--p);margin-bottom:8px;display:block}
    .title{font-size:clamp(22px,3vw,32px);font-weight:800;margin-bottom:12px}
    .prose p{color:var(--ink3);margin-bottom:14px;font-size:15px;line-height:1.75}
    .prose a{color:var(--p);font-weight:600}
    .price{font-size:32px;font-weight:900;color:var(--p);margin:16px 0 8px}
    .links{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}
    .links a{padding:8px 14px;border:1.5px solid var(--border);border-radius:8px;font-size:12px;font-weight:600;color:var(--p);background:#fff}
    .footer{text-align:center;padding:28px;font-size:12px;color:#999;border-top:1px solid var(--border)}
    .footer a{color:var(--p);font-weight:600}
  </style>
</head>
<body>
  <header class="hdr">
    <div class="hdr-inner">
      <a href="${depth}"><img src="${depth}2.png" alt="GH Specialist" class="hdr-logo"></a>
      <a href="${CALENDAR}" class="btn">Agendar</a>
    </div>
  </header>
  <section class="hero">
    <div class="w">
      <span class="label">${esc(city.kicker)}</span>
      <h1>${esc(svc.short)} en <em>${esc(city.name)}</em></h1>
      <p>${esc(svc.desc)} Implementación para empresas en ${esc(city.name)} y ${esc(city.state)}.</p>
      <a href="${CALENDAR}" class="btn">Diagnóstico gratuito</a>
      <a href="https://wa.me/528712638082?text=${waText(svc, city)}" class="btn btn-wa">WhatsApp</a>
    </div>
  </section>
  <section class="sec">
    <div class="w prose">
      <span class="label">${esc(svc.name)} · ${esc(city.name)}</span>
      <h2 class="title">Implementación en ${esc(city.name)}</h2>
      <p>${esc(city.intro)}</p>
      <p>GH Specialist implementa ${esc(svc.name.toLowerCase())} para PYMES en ${esc(city.name)}: ${esc(city.industries)}. Gold Partner Kommo · base en Torreón · cobertura nacional.</p>
      <div class="price">Desde $${Number(svc.price).toLocaleString('es-MX')} MXN + IVA</div>
      <p><a href="${depth}servicios/${svc.file}">Ver servicio completo →</a> · <a href="${depth}ciudades/${city.slug}/">Más sobre ${esc(city.name)} →</a></p>
    </div>
  </section>
  <section class="sec sec-gray">
    <div class="w">
      <span class="label">Más ciudades</span>
      <h2 class="title">${esc(svc.short)} en otras ciudades</h2>
      <div class="links">${otherCities}</div>
    </div>
  </section>
  <section class="sec">
    <div class="w">
      <span class="label">${esc(city.name)}</span>
      <h2 class="title">Otros servicios en ${esc(city.name)}</h2>
      <div class="links">${otherServices}</div>
      <p style="margin-top:16px;font-size:13px"><a href="${depth}ciudades/" style="color:var(--p);font-weight:700">Ver todas las ciudades →</a></p>
    </div>
  </section>
  <footer class="footer">
    <p>© 2026 GH Specialist · <a href="${depth}">Inicio</a> · <a href="${depth}servicios/">Servicios</a> · <a href="${depth}blog/">Blog</a></p>
  </footer>
</body>
</html>
`;
}

async function main() {
  let count = 0;
  for (const svc of services) {
    for (const city of cities) {
      const dir = join(ROOT, 'servicios', svc.slug, city.slug);
      await mkdir(dir, { recursive: true });
      await writeFile(join(dir, 'index.html'), buildPage(svc, city, cities, services), 'utf8');
      count += 1;
    }
  }
  console.log(`✓ servicio×ciudad — ${count} páginas (${services.length} servicios × ${cities.length} ciudades)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
