#!/usr/bin/env node
/**
 * Genera landings nacionales /ciudades/{slug}/ y hub /ciudades/
 * Ejecutar: node scripts/generate-city-pages.mjs
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SITE = 'https://ghspecialist.com';
const CALENDAR = 'https://calendar.app.google/rz32YjLinKvYWUTT9';

const SERVICES = [
  { slug: 'chatbot-ia-whatsapp.html', title: 'Chatbot IA WhatsApp', desc: 'Atención y ventas 24/7 por WhatsApp.' },
  { slug: 'crm-kommo.html', title: 'CRM Kommo', desc: 'Pipeline de ventas integrado con WhatsApp.' },
  { slug: 'automatizacion-total.html', title: 'Automatización total', desc: 'Procesos comerciales sin trabajo manual.' },
  { slug: 'web-seo-blog-ia.html', title: 'Web + SEO + Blog IA', desc: 'Posicionamiento en Google con contenido automático.' },
  { slug: 'agentes-omnicanal.html', title: 'Agentes omnicanal', desc: 'IA en WhatsApp, web y redes.' },
];

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function waText(city) {
  return encodeURIComponent(`Hola Pedro, quiero automatizar mi negocio con IA en ${city.name}`);
}

function buildCityPage(city, allCities) {
  if (city.legacyUrl) return null;
  const url = `${SITE}/ciudades/${city.slug}/`;
  const heroPath = `../../${city.hero}`;
  const title = `Automatización con IA en ${city.name} | Chatbots WhatsApp | GH Specialist`;
  const description = `Chatbots WhatsApp, CRM Kommo y agentes de IA para empresas en ${city.name}, ${city.state}. Implementación en México desde $12,000 MXN. Diagnóstico gratuito.`;

  const localBusiness = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: `GH Specialist — ${city.name}`,
    description: `Automatización con inteligencia artificial para empresas en ${city.name}, ${city.state}. Chatbots WhatsApp, CRM Kommo y agentes IA.`,
    url,
    telephone: '+528712638082',
    priceRange: '$$',
    image: `${SITE}/${city.hero}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: city.name,
      addressRegion: city.state,
      addressCountry: 'MX',
    },
    geo: { '@type': 'GeoCoordinates', latitude: city.lat, longitude: city.lng },
    areaServed: [{ '@type': 'City', name: city.name }, { '@type': 'Country', name: 'México' }],
    founder: {
      '@type': 'Person',
      name: 'Pedro Luis Díaz Velázquez',
      url: `${SITE}/sobre-pedro.html`,
    },
    sameAs: [
      'https://www.instagram.com/ghspecialist26/',
      'https://www.tiktok.com/@ghspecialist',
      'https://linkedin.com/in/pedroluisdiaz',
    ],
  };

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `Automatización con IA en ${city.name}`,
    provider: {
      '@type': 'Organization',
      name: 'GH Specialist',
      telephone: '+528712638082',
    },
    description: `Servicios de IA para empresas en ${city.name}: chatbots WhatsApp, CRM Kommo, automatización y SEO.`,
    areaServed: { '@type': 'City', name: city.name },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'MXN',
      price: '12000',
      description: 'Desde $12,000 MXN + IVA',
    },
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Ciudades', item: `${SITE}/ciudades/` },
      { '@type': 'ListItem', position: 3, name: city.name, item: url },
    ],
  };

  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `¿GH Specialist atiende empresas en ${city.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Sí. Implementamos chatbots WhatsApp, CRM Kommo y automatización con IA para empresas en ${city.name}, ${city.state} y todo México. Diagnóstico gratuito por videollamada o presencial cuando aplica.`,
        },
      },
      {
        '@type': 'Question',
        name: `¿Cuánto cuesta un chatbot IA en ${city.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Desde $12,000 MXN + IVA, pago único. Incluye configuración, integración WhatsApp Business y capacitación.',
        },
      },
      {
        '@type': 'Question',
        name: `¿Trabajan solo en ${city.name} o en todo México?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Atendemos empresas en todo México y LATAM de forma remota. GH Specialist tiene base en Torreón, Coahuila, y operación 100% digital a nivel nacional.',
        },
      },
    ],
  };

  const otherCities = allCities
    .filter((c) => c.slug !== city.slug)
    .slice(0, 8)
    .map((c) => {
      const href = c.legacyUrl || `../${c.slug}/`;
      return `<a href="${href}">${esc(c.name)}</a>`;
    })
    .join('\n        ');

  const serviceCards = SERVICES.map(
    (s) => `<div class="card">
          <h3>${esc(s.title)}</h3>
          <p>${esc(s.desc)}</p>
          <a href="../../servicios/${s.slug}">Ver servicio →</a>
        </div>`
  ).join('\n        ');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" href="../../favicon.png" type="image/png">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="keywords" content="automatización IA ${esc(city.name)}, chatbot WhatsApp ${esc(city.name)}, inteligencia artificial ${esc(city.state)}, CRM Kommo ${esc(city.name)}, agentes IA México">
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:image" content="${SITE}/${city.hero}">
  <meta property="og:locale" content="es_MX">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <script src="../../js/gh-site-config.js"></script>
  <script src="../../js/gh-analytics.js" async></script>
  <script type="application/ld+json">${JSON.stringify(localBusiness)}</script>
  <script type="application/ld+json">${JSON.stringify(serviceSchema)}</script>
  <script type="application/ld+json">${JSON.stringify(breadcrumb)}</script>
  <script type="application/ld+json">${JSON.stringify(faq)}</script>
  <style>
    *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
    :root{--p:#7C4DFF;--p2:#5C35CC;--ink:#111;--ink3:#666;--border:#E8E8E8;--bg2:#FAFAFA}
    body{font-family:'Inter',sans-serif;color:var(--ink);line-height:1.6;-webkit-font-smoothing:antialiased}
    a{text-decoration:none;color:inherit}
    .w{max-width:1080px;margin:0 auto;padding:0 28px}
    .hdr{position:fixed;top:0;width:100%;z-index:100;background:rgba(255,255,255,.97);backdrop-filter:blur(12px);border-bottom:1px solid var(--border)}
    .hdr-inner{display:flex;align-items:center;justify-content:space-between;height:64px;max-width:1080px;margin:0 auto;padding:0 28px}
    .hdr-logo{height:28px}
    .hdr-nav{display:flex;gap:8px;align-items:center}
    .hdr-nav a{font-size:13px;font-weight:500;padding:6px 12px;border-radius:6px;color:var(--ink3)}
    .hdr-nav a:hover{color:var(--p);background:#F3EFFF}
    .btn{display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;background:var(--p);color:#fff}
    .btn:hover{background:var(--p2)}
    .btn-wa{background:#25D366}
    .hero{padding:120px 0 80px;background:linear-gradient(rgba(0,0,0,.55),rgba(0,0,0,.45)),url('${heroPath}') center/cover;color:#fff}
    .kicker{display:inline-block;background:rgba(124,77,255,.35);border:1px solid rgba(167,139,250,.5);padding:5px 14px;border-radius:100px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:16px}
    .hero h1{font-size:clamp(32px,4vw,52px);font-weight:900;line-height:1.05;margin-bottom:20px;letter-spacing:-.03em}
    .hero h1 em{font-style:normal;color:#a78bfa}
    .hero p{font-size:17px;opacity:.9;max-width:600px;margin-bottom:28px}
    .hero-btns{display:flex;gap:12px;flex-wrap:wrap}
    .sec{padding:72px 0}
    .sec-gray{background:var(--bg2)}
    .label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--p);margin-bottom:10px;display:block}
    .title{font-size:clamp(24px,3vw,36px);font-weight:800;letter-spacing:-.02em;margin-bottom:12px}
    .prose{max-width:720px}
    .prose p{font-size:15px;color:var(--ink3);margin-bottom:16px;line-height:1.75}
    .prose a{color:var(--p);font-weight:600}
    .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;margin-top:32px}
    .card{border:1.5px solid var(--border);border-radius:12px;padding:24px;background:#fff}
    .card h3{font-size:16px;font-weight:700;margin-bottom:8px}
    .card p{font-size:14px;color:var(--ink3)}
    .card a{color:var(--p);font-weight:600;font-size:13px;margin-top:12px;display:inline-block}
    .local-links{display:flex;flex-wrap:wrap;gap:10px;margin-top:24px}
    .local-links a{display:inline-block;padding:8px 16px;border:1.5px solid var(--border);border-radius:8px;font-size:13px;font-weight:600;color:var(--p);background:#fff}
    .local-links a:hover{background:var(--bg2)}
    .cta{text-align:center;padding:64px 28px;background:linear-gradient(135deg,#7C4DFF,#5C35CC);color:#fff;border-radius:16px;margin:0 28px 80px;max-width:1024px;margin-left:auto;margin-right:auto}
    .cta h2{font-size:clamp(22px,3vw,32px);margin-bottom:12px}
    .cta p{opacity:.9;margin-bottom:24px}
    .cta-btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
    .footer{text-align:center;padding:32px;font-size:12px;color:#999;border-top:1px solid var(--border)}
    .footer-links{display:flex;flex-wrap:wrap;gap:8px 16px;justify-content:center;margin-top:10px}
    .footer-links a{color:var(--p)}
    @media(max-width:640px){.hero-btns{flex-direction:column}.hero-btns .btn{width:100%;justify-content:center}.hdr-nav{display:none}}
  </style>
</head>
<body>
  <header class="hdr">
    <div class="hdr-inner">
      <a href="../../"><img src="../../2.png" alt="GH Specialist" class="hdr-logo"></a>
      <nav class="hdr-nav">
        <a href="../../servicios/">Servicios</a>
        <a href="../../ciudades/">Ciudades</a>
        <a href="../../blog/">Blog</a>
        <a href="../../sobre-pedro.html">Sobre Pedro</a>
        <a href="${CALENDAR}" class="btn" style="padding:8px 16px;font-size:13px">Agendar</a>
      </nav>
    </div>
  </header>

  <section class="hero">
    <div class="w">
      <span class="kicker">${esc(city.kicker)}</span>
      <h1>Automatización con IA en <em>${esc(city.name)}</em></h1>
      <p>Chatbots WhatsApp, CRM Kommo y agentes de inteligencia artificial para empresas en ${esc(city.name)} y ${esc(city.state)}. Operación nacional desde GH Specialist — diagnóstico gratuito.</p>
      <div class="hero-btns">
        <a href="${CALENDAR}" class="btn">🗓️ Diagnóstico gratuito</a>
        <a href="https://wa.me/528712638082?text=${waText(city)}" class="btn btn-wa">WhatsApp directo</a>
      </div>
    </div>
  </section>

  <section class="sec">
    <div class="w">
      <span class="label">${esc(city.name)} · ${esc(city.state)}</span>
      <h2 class="title">IA y WhatsApp para negocios en ${esc(city.name)}</h2>
      <div class="prose">
        <p>${esc(city.intro)}</p>
        <p>Sectores que atendemos en ${esc(city.name)}: ${esc(city.industries)}. Implementamos chatbots que califican prospectos, integran Kommo CRM y publican contenido SEO — todo desde México, sin contratar más personal de ventas.</p>
        <p>GH Specialist es agencia de automatización con IA a nivel nacional. Fundada por Pedro Luis Díaz Velázquez (Gold Partner Kommo), con base en Torreón y clientes en Monterrey, CDMX, Guadalajara, Querétaro y todo el país.</p>
      </div>
    </div>
  </section>

  <section class="sec sec-gray">
    <div class="w">
      <span class="label">Servicios en ${esc(city.name)}</span>
      <h2 class="title">Qué implementamos en tu empresa</h2>
      <div class="grid">
        ${serviceCards}
      </div>
    </div>
  </section>

  <section class="sec">
    <div class="w">
      <span class="label">Cobertura nacional</span>
      <h2 class="title">También operamos en otras ciudades de México</h2>
      <div class="local-links">
        ${otherCities}
        <a href="../">Ver todas las ciudades →</a>
      </div>
    </div>
  </section>

  <div class="cta">
    <h2>¿Listo para automatizar en ${esc(city.name)}?</h2>
    <p>Diagnóstico gratuito de 30 minutos. Te decimos qué implementar primero.</p>
    <div class="cta-btns">
      <a href="${CALENDAR}" class="btn">Agendar diagnóstico</a>
      <a href="https://wa.me/528712638082?text=${waText(city)}" class="btn btn-wa">WhatsApp</a>
    </div>
  </div>

  <footer class="footer">
    <p>© 2026 GH Specialist · <a href="../../">ghspecialist.com</a></p>
    <div class="footer-links">
      <a href="../../servicios/chatbot-ia-whatsapp.html">Chatbot WhatsApp</a>
      <a href="../../blog/">Blog</a>
      <a href="../../torreon/">Torreón</a>
      <a href="../">Ciudades México</a>
    </div>
  </footer>
</body>
</html>
`;
}

function buildHubPage(cities) {
  const url = `${SITE}/ciudades/`;
  const cards = cities
    .map((c) => {
      const href = c.legacyUrl ? `..${c.legacyUrl}` : `./${c.slug}/`;
      return `<a href="${href}" class="city-card">
        <div class="city-bg" style="background-image:url('../${c.hero}')"></div>
        <div class="city-overlay"></div>
        <div class="city-body">
          <h2>${esc(c.name)}</h2>
          <p>${esc(c.state)}</p>
        </div>
      </a>`;
    })
    .join('\n      ');

  const itemList = cities.map((c, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: c.name,
    item: c.legacyUrl ? `${SITE}${c.legacyUrl}` : `${SITE}/ciudades/${c.slug}/`,
  }));

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Automatización con IA en México — Ciudades',
    description: 'GH Specialist atiende empresas en Monterrey, CDMX, Guadalajara, Querétaro, Torreón y todo México con chatbots WhatsApp e IA.',
    url,
    inLanguage: 'es-MX',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: itemList,
    },
  };

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" href="../favicon.png" type="image/png">
  <title>Automatización con IA en México — Ciudades | GH Specialist</title>
  <meta name="description" content="Chatbots WhatsApp, CRM Kommo y agentes IA para empresas en Monterrey, CDMX, Guadalajara, Querétaro, Torreón y todo México. Cobertura nacional GH Specialist.">
  <meta name="keywords" content="automatización IA México, chatbot WhatsApp Monterrey, IA CDMX, agentes IA Guadalajara, inteligencia artificial empresas México">
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="Automatización IA en México — Ciudades | GH Specialist">
  <meta property="og:description" content="Cobertura nacional: chatbots WhatsApp e IA para PYMES en las principales ciudades de México.">
  <meta property="og:image" content="${SITE}/hero-cdmx.png">
  <meta property="og:locale" content="es_MX">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <script src="../js/gh-site-config.js"></script>
  <script src="../js/gh-analytics.js" async></script>
  <script type="application/ld+json">${JSON.stringify(schema)}</script>
  <style>
    *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
    :root{--p:#7C4DFF;--p2:#5C35CC;--ink:#111;--ink3:#666;--border:#E8E8E8;--bg2:#FAFAFA}
    body{font-family:'Inter',sans-serif;color:var(--ink);line-height:1.6}
    a{text-decoration:none;color:inherit}
    .w{max-width:1080px;margin:0 auto;padding:0 28px}
    .hdr{padding:20px 0;border-bottom:1px solid var(--border)}
    .hdr-inner{display:flex;align-items:center;justify-content:space-between;max-width:1080px;margin:0 auto;padding:0 28px}
    .hdr-logo{height:28px}
    .hero{padding:64px 0 48px;text-align:center}
    .hero h1{font-size:clamp(28px,4vw,44px);font-weight:900;letter-spacing:-.03em;margin-bottom:12px}
    .hero p{font-size:17px;color:var(--ink3);max-width:640px;margin:0 auto 24px}
    .btn{display:inline-flex;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;background:var(--p);color:#fff}
    .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px;padding:0 28px 64px;max-width:1080px;margin:0 auto}
    .city-card{position:relative;border-radius:12px;overflow:hidden;aspect-ratio:4/3;border:1px solid var(--border)}
    .city-bg{position:absolute;inset:0;background-size:cover;background-position:center;transition:transform .3s}
    .city-card:hover .city-bg{transform:scale(1.05)}
    .city-overlay{position:absolute;inset:0;background:linear-gradient(transparent 30%,rgba(0,0,0,.75))}
    .city-body{position:absolute;bottom:0;left:0;right:0;padding:16px;color:#fff}
    .city-body h2{font-size:18px;font-weight:800}
    .city-body p{font-size:12px;opacity:.85}
    .footer{text-align:center;padding:32px;font-size:12px;color:#999;border-top:1px solid var(--border)}
    .footer a{color:var(--p);font-weight:600}
  </style>
</head>
<body>
  <header class="hdr">
    <div class="hdr-inner">
      <a href="../"><img src="../2.png" alt="GH Specialist" class="hdr-logo"></a>
      <a href="${CALENDAR}" class="btn">Agendar diagnóstico</a>
    </div>
  </header>
  <section class="hero">
    <div class="w">
      <h1>Automatización con IA en <span style="color:var(--p)">todo México</span></h1>
      <p>Chatbots WhatsApp, CRM Kommo y agentes de inteligencia artificial para empresas en las principales ciudades. Operación 100% digital — implementación remota o presencial.</p>
      <a href="${CALENDAR}" class="btn">Diagnóstico gratuito →</a>
    </div>
  </section>
  <div class="grid">
      ${cards}
  </div>
  <footer class="footer">
    <p>© 2026 GH Specialist · <a href="../">Inicio</a> · <a href="../servicios/">Servicios</a> · <a href="../blog/">Blog</a></p>
  </footer>
</body>
</html>
`;
}

async function main() {
  const raw = await readFile(join(ROOT, 'data/seo-cities.json'), 'utf8');
  const cities = JSON.parse(raw);
  const hubDir = join(ROOT, 'ciudades');
  await mkdir(hubDir, { recursive: true });

  let generated = 0;
  for (const city of cities) {
    const html = buildCityPage(city, cities);
    if (!html) continue;
    const dir = join(hubDir, city.slug);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, 'index.html'), html, 'utf8');
    generated += 1;
    console.log(`✓ ciudades/${city.slug}/`);
  }

  await writeFile(join(hubDir, 'index.html'), buildHubPage(cities), 'utf8');
  console.log(`✓ ciudades/index.html (hub) — ${generated} landings + ${cities.length} en índice`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
