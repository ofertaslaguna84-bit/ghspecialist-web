#!/usr/bin/env node
/**
 * Matriz servicio×ciudad → /servicios/{servicio}/{ciudad}/
 * Ejecutar: node scripts/generate-servicio-ciudad-pages.mjs
 *
 * Las FAQ se construyen UNA sola vez (buildFaqs) y de ahí salen tanto el HTML
 * visible como el JSON-LD. Nunca deben divergir: Google pide que el marcado
 * refleje lo que el usuario ve, y los buscadores de IA solo citan lo visible.
 */
import { writeFile, mkdir } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SITE = 'https://ghspecialist.com';
const CALENDAR = 'https://calendar.app.google/rz32YjLinKvYWUTT9';
const WA = '528712638082';
const AUTOR = 'Pedro Luis Díaz Velázquez';

const HOY = new Date().toISOString().slice(0, 10);
const HOY_LARGO = new Date().toLocaleDateString('es-MX', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const cities = JSON.parse(readFileSync(join(ROOT, 'data/seo-cities.json'), 'utf8')).filter(
  (c) => (c.country || 'MX') === 'MX'
);
const services = JSON.parse(readFileSync(join(ROOT, 'data/seo-services.json'), 'utf8'));

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const mxn = (n) => `$${Number(n).toLocaleString('es-MX')} MXN + IVA`;

function waText(svc, city) {
  return encodeURIComponent(`Hola Pedro, quiero ${svc.short} en ${city.name}`);
}

/**
 * Fuente única de las preguntas frecuentes de la página.
 * Orden: precio → plazo → cobertura local → las propias del servicio → la de la ciudad.
 */
function buildFaqs(svc, city) {
  return [
    {
      q: `¿Cuánto cuesta ${svc.short.toLowerCase()} en ${city.name}?`,
      a: `Desde ${mxn(svc.price)}. El precio final depende del tamaño de tu operación y de cuántos sistemas haya que conectar; se cierra después del diagnóstico, que no tiene costo. En ${city.name} no se cobra distinto que en el resto del país.`,
    },
    {
      q: `¿Cuánto tarda la implementación?`,
      a: `${svc.entrega} en condiciones normales, contadas desde que tenemos los accesos y la información del negocio. Lo que más suele atrasar un proyecto no es el trabajo técnico, es esperar accesos o que se defina quién decide del lado del cliente.`,
    },
    {
      q: `¿Atienden empresas en ${city.name}?`,
      a: `Sí. ${svc.name} para empresas de ${city.name}, ${city.state} y alrededores: ${city.cobertura}. La implementación es remota; las juntas de arranque y la capacitación pueden ser presenciales según la ciudad. GH Specialist tiene su base en Torreón y cobertura en todo México.`,
    },
    ...(svc.faqs || []),
    ...(city.faqLocal ? [city.faqLocal] : []),
  ];
}

function faqHtml(faqs) {
  return faqs
    .map(
      (f) => `        <details class="faq">
          <summary>${esc(f.q)}</summary>
          <div class="faq-a"><p>${esc(f.a)}</p></div>
        </details>`
    )
    .join('\n');
}

function listHtml(items, cls = 'check') {
  return items.map((i) => `<li class="${cls}">${esc(i)}</li>`).join('\n          ');
}

function buildPage(svc, city, allCities, allServices) {
  const url = `${SITE}/servicios/${svc.slug}/${city.slug}/`;
  const depth = '../../../';
  const title = `${svc.short} en ${city.name}, ${city.state} | GH Specialist`;
  const description = `${svc.desc} Para empresas en ${city.name}, ${city.state}. Desde ${mxn(svc.price)}, implementación en ${svc.entrega}. Diagnóstico gratuito GH Specialist.`;

  const faqs = buildFaqs(svc, city);

  // Respuesta corta y citable: es el bloque que un buscador de IA extrae.
  const resumen = `${svc.name} en ${city.name} cuesta desde ${mxn(svc.price)} y se implementa en ${svc.entrega}. Es para ${svc.paraQuien}. Lo implementa GH Specialist, Gold Partner de Kommo con base en Torreón, con cobertura en ${city.cobertura}.`;

  const otherCities = allCities
    .filter((c) => c.slug !== city.slug)
    .map(
      (c) =>
        `<a href="${depth}servicios/${svc.slug}/${c.slug}/">${esc(svc.short)} ${esc(c.name)}</a>`
    )
    .join('\n        ');

  const otherServices = allServices
    .filter((s) => s.slug !== svc.slug)
    .map(
      (s) =>
        `<a href="${depth}servicios/${s.slug}/${city.slug}/">${esc(s.short)} ${esc(city.name)}</a>`
    )
    .join('\n        ');

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `${svc.name} en ${city.name}`,
    serviceType: svc.name,
    provider: {
      '@type': 'Organization',
      name: 'GH Specialist',
      url: SITE,
      telephone: '+528712638082',
      founder: { '@type': 'Person', name: AUTOR },
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Torreón',
        addressRegion: 'Coahuila',
        addressCountry: 'MX',
      },
    },
    description: svc.desc,
    areaServed: {
      '@type': 'City',
      name: city.name,
      containedInPlace: { '@type': 'State', name: city.state },
    },
    audience: { '@type': 'BusinessAudience', audienceType: svc.paraQuien },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'MXN',
      price: svc.price,
      priceSpecification: {
        '@type': 'PriceSpecification',
        minPrice: svc.price,
        priceCurrency: 'MXN',
        valueAddedTaxIncluded: false,
      },
      description: `Desde ${mxn(svc.price)}`,
      availability: 'https://schema.org/InStock',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `Qué incluye ${svc.name}`,
      itemListElement: svc.incluye.map((i) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: i },
      })),
    },
  };

  const webpage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    url,
    name: title,
    description,
    inLanguage: 'es-MX',
    datePublished: '2026-03-01',
    dateModified: HOY,
    isPartOf: { '@type': 'WebSite', name: 'GH Specialist', url: `${SITE}/` },
    about: { '@type': 'Thing', name: `${svc.name} en ${city.name}` },
    author: { '@type': 'Person', name: AUTOR, url: `${SITE}/sobre-pedro.html` },
    publisher: { '@type': 'Organization', name: 'GH Specialist', url: SITE },
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

  // Mismo contenido que el HTML visible de arriba.
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
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
  <meta name="author" content="${esc(AUTOR)}">
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:image" content="${SITE}/${city.hero}">
  <meta property="og:locale" content="es_MX">
  <meta property="article:modified_time" content="${HOY}">
  <script src="${depth}js/gh-site-config.js"></script>
  <script src="${depth}js/gh-analytics.js" async></script>
  <script type="application/ld+json">${JSON.stringify(schema)}</script>
  <script type="application/ld+json">${JSON.stringify(webpage)}</script>
  <script type="application/ld+json">${JSON.stringify(breadcrumb)}</script>
  <script type="application/ld+json">${JSON.stringify(faqSchema)}</script>
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
    .crumbs{font-size:12px;color:var(--ink3);padding:12px 0}
    .crumbs a{color:var(--p);font-weight:600}
    .hero{padding:72px 0 48px;background:linear-gradient(rgba(0,0,0,.62),rgba(0,0,0,.52)),url('${depth}${city.hero}') center/cover;color:#fff}
    .hero h1{font-size:clamp(28px,4vw,44px);font-weight:900;line-height:1.08;margin-bottom:14px}
    .hero h1 em{font-style:normal;color:#c4b5fd}
    .hero p{opacity:.92;max-width:620px;margin-bottom:22px;font-size:16px}
    .btn{display:inline-flex;padding:12px 22px;border-radius:8px;background:var(--p);color:#fff;font-weight:700;font-size:14px;margin-right:8px;margin-bottom:8px}
    .btn-wa{background:#25D366}
    .sec{padding:48px 0}
    .sec-gray{background:var(--bg2)}
    .label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--p);margin-bottom:8px;display:block}
    .title{font-size:clamp(22px,3vw,32px);font-weight:800;margin-bottom:12px}
    h3{font-size:17px;font-weight:800;margin:22px 0 8px}
    .prose p{color:var(--ink3);margin-bottom:14px;font-size:15px;line-height:1.75}
    .prose a{color:var(--p);font-weight:600}
    .resumen{border-left:4px solid var(--p);background:var(--bg2);padding:18px 20px;border-radius:0 10px 10px 0;margin-bottom:26px}
    .resumen p{margin:0;font-size:15.5px;color:var(--ink);line-height:1.7}
    .price{font-size:32px;font-weight:900;color:var(--p);margin:16px 0 4px}
    .price small{display:block;font-size:13px;font-weight:600;color:var(--ink3);margin-top:4px}
    ul{list-style:none;margin-bottom:14px}
    li{font-size:15px;color:var(--ink3);padding:7px 0 7px 26px;position:relative;line-height:1.6}
    li.check::before{content:"✓";position:absolute;left:0;color:var(--p);font-weight:900}
    li.cross::before{content:"×";position:absolute;left:0;color:#bbb;font-weight:900;font-size:17px}
    .grid2{display:grid;gap:28px;grid-template-columns:1fr}
    @media(min-width:760px){.grid2{grid-template-columns:1fr 1fr}}
    .card{border:1px solid var(--border);border-radius:14px;padding:22px;background:#fff}
    .meta{display:flex;flex-wrap:wrap;gap:10px;margin:18px 0}
    .pill{font-size:12px;font-weight:700;padding:7px 13px;border-radius:999px;background:#F3EEFF;color:var(--p)}
    .faq{border-bottom:1px solid var(--border);padding:2px 0}
    .faq summary{cursor:pointer;font-weight:700;font-size:15.5px;padding:15px 0;list-style:none;display:flex;justify-content:space-between;gap:14px;align-items:flex-start}
    .faq summary::-webkit-details-marker{display:none}
    .faq summary::after{content:"+";color:var(--p);font-weight:900;font-size:20px;line-height:1}
    .faq[open] summary::after{content:"–"}
    .faq-a p{color:var(--ink3);font-size:15px;line-height:1.75;padding:0 0 16px}
    .links{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}
    .links a{padding:8px 14px;border:1.5px solid var(--border);border-radius:8px;font-size:12px;font-weight:600;color:var(--p);background:#fff}
    .updated{font-size:12.5px;color:#999;padding:22px 0 0}
    .cta{background:var(--p);color:#fff;text-align:center;padding:52px 24px}
    .cta h2{font-size:clamp(21px,3vw,28px);font-weight:900;margin-bottom:10px}
    .cta p{opacity:.9;margin-bottom:20px;font-size:15px}
    .cta .btn{background:#fff;color:var(--p)}
    .cta .btn-wa{background:#25D366;color:#fff}
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
      <p>${esc(svc.desc)} Implementación para empresas en ${esc(city.name)} y ${esc(city.state)}, en ${esc(svc.entrega)}.</p>
      <a href="${CALENDAR}" class="btn">Diagnóstico gratuito</a>
      <a href="https://wa.me/${WA}?text=${waText(svc, city)}" class="btn btn-wa">WhatsApp</a>
    </div>
  </section>

  <div class="w">
    <nav class="crumbs"><a href="${depth}">Inicio</a> › <a href="${depth}servicios/">Servicios</a> › <a href="${depth}servicios/${svc.file}">${esc(svc.name)}</a> › ${esc(city.name)}</nav>
  </div>

  <section class="sec">
    <div class="w prose">
      <div class="resumen"><p>${esc(resumen)}</p></div>

      <span class="label">El problema</span>
      <h2 class="title">Por qué las empresas de ${esc(city.name)} contratan esto</h2>
      <p>${esc(svc.problema)}</p>
      <p>${esc(city.reto)}</p>

      <h3>Para quién es</h3>
      <p>Este servicio es para ${esc(svc.paraQuien)}.</p>

      <h3>Sectores que más lo piden en ${esc(city.name)}</h3>
      <ul>
          ${listHtml(city.sectores)}
      </ul>
    </div>
  </section>

  <section class="sec sec-gray">
    <div class="w prose">
      <span class="label">Cómo funciona</span>
      <h2 class="title">Qué hacemos exactamente</h2>
      <p>${esc(svc.comoFunciona)}</p>
      <div class="meta">
        <span class="pill">Plazo: ${esc(svc.entrega)}</span>
        <span class="pill">Desde ${esc(mxn(svc.price))}</span>
        <span class="pill">Diagnóstico sin costo</span>
      </div>
      <div class="grid2">
        <div class="card">
          <h3 style="margin-top:0">Qué incluye</h3>
          <ul>
          ${listHtml(svc.incluye)}
          </ul>
        </div>
        <div class="card">
          <h3 style="margin-top:0">Qué no incluye</h3>
          <ul>
          ${listHtml(svc.noIncluye, 'cross')}
          </ul>
          <h3>Se conecta con</h3>
          <p style="font-size:14px;color:var(--ink3);margin:0">${esc(svc.integraciones.join(' · '))}</p>
        </div>
      </div>
    </div>
  </section>

  <section class="sec">
    <div class="w prose">
      <span class="label">Precio</span>
      <h2 class="title">Cuánto cuesta en ${esc(city.name)}</h2>
      <div class="price">Desde ${esc(mxn(svc.price))}<small>Precio de arranque. El final se cierra tras el diagnóstico, según tamaño de la operación y sistemas a conectar.</small></div>
      <p>No cobramos distinto por ciudad: el precio en ${esc(city.name)} es el mismo que en el resto del país. Lo que sí cambia el número es el volumen de mensajes, cuántos usuarios y sucursales entran, y con cuántos sistemas hay que conectarse.</p>
      <p><a href="${depth}servicios/${svc.file}">Ver el servicio completo →</a> · <a href="${depth}ciudades/${city.slug}/">Más sobre ${esc(city.name)} →</a></p>
    </div>
  </section>

  <section class="sec sec-gray">
    <div class="w prose">
      <span class="label">Cobertura</span>
      <h2 class="title">Dónde atendemos</h2>
      <p>${esc(city.cobertura)}. Dentro de ${esc(city.name)} trabajamos con empresas de ${esc(city.zonas)}.</p>
      <p>GH Specialist es Gold Partner de Kommo, con base en Torreón, Coahuila, y cobertura en todo México. Fundada por <a href="${depth}sobre-pedro.html">${esc(AUTOR)}</a>.</p>
    </div>
  </section>

  <section class="sec">
    <div class="w">
      <span class="label">Preguntas frecuentes</span>
      <h2 class="title">${esc(svc.short)} en ${esc(city.name)}: dudas comunes</h2>
${faqHtml(faqs)}
      <p class="updated">Última actualización: ${HOY_LARGO} · Autor: ${esc(AUTOR)}, GH Specialist</p>
    </div>
  </section>

  <section class="cta">
    <h2>¿Lo vemos con tus números?</h2>
    <p>Diagnóstico gratuito para tu empresa en ${esc(city.name)}. Sin compromiso.</p>
    <a href="${CALENDAR}" class="btn">Agendar diagnóstico</a>
    <a href="https://wa.me/${WA}?text=${waText(svc, city)}" class="btn btn-wa">Escribir por WhatsApp</a>
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
    <p>© 2026 GH Specialist · <a href="${depth}">Inicio</a> · <a href="${depth}servicios/">Servicios</a> · <a href="${depth}blog/">Blog</a> · <a href="${depth}sobre-pedro.html">Sobre Pedro</a></p>
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
  console.log(
    `✓ servicio×ciudad — ${count} páginas (${services.length} servicios × ${cities.length} ciudades) · actualizadas ${HOY}`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
