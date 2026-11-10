#!/usr/bin/env node
/**
 * Genera /bitacora/ (índice) y /bitacora/<slug>/ (una página por día) a partir de data/bitacora.json.
 * Bitácora de Jarvis: lo que hace la IA de GH Specialist cada día, con horas y costo equivalente.
 * Uso: node scripts/generate-bitacora.mjs
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://ghspecialist.com';
const WA = 'https://wa.me/528712638082?text=Hola%20Pedro%2C%20quiero%20un%20Jarvis%20para%20mi%20empresa';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const CSS = `
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
:root{--p:#6D28D9;--p2:#4C1D95;--ink:#1A1530;--ink3:#666;--border:#E5E0EF;--bg2:#FAFAFA;--dark:#231a52}
body{font-family:'Inter',sans-serif;color:var(--ink);line-height:1.6;-webkit-font-smoothing:antialiased}
a{text-decoration:none;color:inherit}
.w{max-width:1080px;margin:0 auto;padding:0 28px}
.hdr{position:fixed;top:0;width:100%;z-index:100;background:rgba(255,255,255,.97);backdrop-filter:blur(12px);border-bottom:1px solid var(--border)}
.hdr-inner{display:flex;align-items:center;justify-content:space-between;height:64px;max-width:1080px;margin:0 auto;padding:0 28px}
.hdr-logo{height:48px;width:auto}
.hdr-nav{display:flex;gap:8px;align-items:center}
.hdr-nav a{font-size:13px;font-weight:500;padding:6px 12px;border-radius:6px;color:var(--ink3)}
.hdr-nav a:hover{color:var(--p);background:#F1EBFF}
.btn{display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;background:var(--p);color:#fff;border:none;cursor:pointer;font-family:inherit}
.btn:hover{background:var(--p2)}
.btn-wa{background:#25D366}.btn-wa:hover{background:#1da851}
.hero{padding:120px 0 64px;background:var(--dark);color:#fff}
.kicker{display:inline-block;background:rgba(124,77,255,.35);border:1px solid rgba(167,139,250,.5);padding:5px 14px;border-radius:100px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:16px;color:#c4b5fd}
.hero h1{font-size:clamp(30px,4vw,50px);font-weight:900;line-height:1.08;margin-bottom:18px;letter-spacing:-.03em}
.hero p{font-size:17px;opacity:.9;max-width:640px;margin-bottom:24px}
.hero time{display:block;font-size:14px;color:#c4b5fd;margin-bottom:14px}
.sec{padding:56px 0}
.sec-gray{background:var(--bg2)}
.label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--p);margin-bottom:10px;display:block}
.title{font-size:clamp(22px,3vw,32px);font-weight:800;letter-spacing:-.02em;margin-bottom:12px}
.prose{max-width:720px}
.prose p{font-size:15px;color:var(--ink3);margin-bottom:16px;line-height:1.75}
.prose a{color:var(--p);font-weight:600}
.boxes{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-top:28px}
.box{border:1.5px solid var(--border);border-radius:12px;padding:22px 18px;background:#fff;text-align:center}
.box .n{font-size:34px;font-weight:900;letter-spacing:-.02em;color:var(--p2);line-height:1.1}
.box .l{font-size:13px;color:var(--ink3);margin-top:8px}
.box .l b{color:var(--ink)}
.box.hl{background:var(--p);border-color:var(--p);color:#fff}
.box.hl .n,.box.hl .l,.box.hl .l b{color:#fff}
.note{font-size:12.5px;color:#888;margin-top:14px;max-width:760px}
.items{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px;margin-top:28px;counter-reset:it}
.it{border:1.5px solid var(--border);border-radius:12px;padding:16px 18px 16px 48px;background:#fff;position:relative}
.it::before{counter-increment:it;content:counter(it);position:absolute;left:16px;top:16px;width:22px;height:22px;border-radius:50%;background:#F1EBFF;color:var(--p);font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center}
.it h3{font-size:15px;font-weight:700;line-height:1.3}
.it p{font-size:13px;color:var(--ink3);margin-top:4px}
.lamina{margin-top:32px;border:1.5px solid var(--border);border-radius:12px;overflow:hidden;background:var(--dark)}
.lamina img{display:block;width:100%;height:auto}
.lamina figcaption{font-size:12.5px;color:var(--ink3);padding:10px 14px;background:#fff}
.entries{display:grid;gap:20px;margin-top:32px}
.entry{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:0;border:1.5px solid var(--border);border-radius:14px;overflow:hidden;background:#fff}
.entry img{width:100%;height:100%;object-fit:cover;display:block;background:var(--dark)}
.entry .body{padding:24px}
.entry time{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--p)}
.entry h2{font-size:22px;font-weight:800;letter-spacing:-.02em;margin:8px 0 10px;line-height:1.2}
.entry p{font-size:14px;color:var(--ink3);line-height:1.7}
.entry .mini{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0 16px}
.entry .mini span{font-size:12px;font-weight:600;padding:6px 10px;border-radius:100px;background:#F1EBFF;color:var(--p2)}
.entry a.more{color:var(--p);font-weight:700;font-size:14px}
.faq{max-width:720px;margin-top:24px}
.faq details{border:1px solid var(--border);border-radius:10px;padding:16px 20px;margin-bottom:10px;background:#fff}
.faq summary{font-weight:600;cursor:pointer}
.faq p{margin-top:10px;font-size:14px;color:var(--ink3)}
.cta{text-align:center;padding:56px 28px;background:linear-gradient(135deg,#6D28D9,#4C1D95);color:#fff;border-radius:16px;margin:0 auto 72px;max-width:1024px}
.cta h2{font-size:clamp(22px,3vw,32px);margin-bottom:12px}
.cta p{opacity:.9;margin-bottom:24px;max-width:640px;margin-left:auto;margin-right:auto}
.cta-btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
.pager{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:32px;font-size:14px;font-weight:600}
.pager a{color:var(--p)}
.footer{text-align:center;padding:32px;font-size:12px;color:#999;border-top:1px solid var(--border)}
.footer-links{display:flex;flex-wrap:wrap;gap:8px 16px;justify-content:center;margin-top:10px}
.footer-links a{color:var(--p)}
@media(max-width:760px){.entry{grid-template-columns:1fr}.cta{margin:0 16px 56px}}
@media(max-width:640px){.hdr-inner{padding:0 16px}.hdr-nav{gap:4px}.hdr-nav a:not(.btn){display:none}.hdr-nav .btn{padding:8px 12px;font-size:13px}.w{padding:0 16px}}
html,body{overflow-x:hidden}
`;

function head({ title, description, url, image, ld, published, modified }) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!-- gh-security-meta -->
  <meta name="referrer" content="strict-origin-when-cross-origin">
  <link rel="icon" href="/favicon.png" type="image/png">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="${published ? 'article' : 'website'}">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:image" content="${SITE}${image}">
  <meta property="og:locale" content="es_MX">
  ${published ? `<meta property="article:published_time" content="${published}">\n  <meta property="article:modified_time" content="${modified}">` : ''}
  <meta name="twitter:card" content="summary_large_image">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" onload="this.onload=null;this.rel='stylesheet'"><noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap"></noscript>
  <script src="/js/gh-site-config.js"></script>
  <script src="/js/gh-analytics.js" async></script>
  ${ld.map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n  ')}
  <style>${CSS}</style>
</head>
<body>
  <header class="hdr">
    <div class="hdr-inner">
      <a href="/"><img src="/logo-gh.webp" width="900" height="200" alt="GH Specialist" class="hdr-logo" decoding="async"></a>
      <nav class="hdr-nav">
        <a href="/#servicios">Servicios</a>
        <a href="/bitacora/">Bitácora</a>
        <a href="/blog/">Blog</a>
        <a href="/sobre-pedro.html">Sobre Pedro</a>
        <a href="https://calendar.app.google/rz32YjLinKvYWUTT9" class="btn" style="padding:8px 16px;font-size:13px">Agendar</a>
      </nav>
    </div>
  </header>
`;
}

const FOOT = `
  <section class="w">
    <div class="cta">
      <h2>¿Quieres un Jarvis operando tu empresa?</h2>
      <p>Lo implementamos por departamento: ventas, compras, recursos humanos, cobranza, dirección. Empieza con un diagnóstico gratuito de 30 minutos.</p>
      <div class="cta-btns">
        <a href="${WA}" class="btn btn-wa" onclick="window.ghTrack&&ghTrack('whatsapp_click',{place:'bitacora'})">Escribir por WhatsApp</a>
        <a href="https://calendar.app.google/rz32YjLinKvYWUTT9" class="btn" style="background:#fff;color:#4C1D95" onclick="window.ghTrack&&ghTrack('agendar_click',{place:'bitacora'})">Agendar diagnóstico</a>
      </div>
    </div>
  </section>
  <footer class="footer">
    <p><a href="/">GH Specialist</a> · Torreón, Coahuila · <a href="tel:+528712638082">+52 871 263 8082</a></p>
    <div class="footer-links">
      <a href="/bitacora/">Bitácora de Jarvis</a>
      <a href="/blog/">Blog</a>
      <a href="/torreon/">Agencia de IA en Torreón</a>
      <a href="/servicios/capacitaciones-ia-empresas.html">Cursos de IA para empresas</a>
      <a href="/sobre-pedro.html">Sobre Pedro</a>
    </div>
  </footer>
<script src="/js/grabovoi.js" defer></script>
</body>
</html>
`;

const PERSON = { '@type': 'Person', name: 'Pedro Luis Díaz Velázquez', url: `${SITE}/sobre-pedro.html`, jobTitle: 'Director de GH Specialist' };
const ORG = { '@type': 'Organization', name: 'GH Specialist', url: SITE, logo: { '@type': 'ImageObject', url: `${SITE}/logo-gh-1200.png` } };

function entryPage(e, prev, next, modified) {
  const url = `${SITE}/bitacora/${e.slug}/`;
  const title = `${e.title} | Bitácora de Jarvis`;
  const description = `${e.dayLabel}: ${e.items.length} tareas reales hechas por la IA de GH Specialist en un día, equivalentes a ${e.hours} de trabajo humano y ${e.people} personas en nómina. Sin nombres de clientes.`;
  const ld = [
    { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: e.title, description: e.summary, url, mainEntityOfPage: url, image: `${SITE}${e.image}`, datePublished: e.date, dateModified: modified, inLanguage: 'es-MX', author: PERSON, publisher: ORG, isPartOf: { '@type': 'Blog', name: 'Bitácora de Jarvis', url: `${SITE}/bitacora/` }, keywords: ['agente de IA para empresas', 'automatización con IA', 'Claude Code', 'ahorro con inteligencia artificial', 'Torreón'] },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Bitácora de Jarvis', item: `${SITE}/bitacora/` },
      { '@type': 'ListItem', position: 3, name: e.title, item: url },
    ] },
  ];
  const items = e.items.map(([t, s]) => `<li class="it"><h3>${esc(t)}</h3><p>${esc(s)}</p></li>`).join('\n        ');
  return head({ title, description, url, image: e.image, ld, published: e.date, modified }) + `
  <section class="hero">
    <div class="w">
      <span class="kicker">Bitácora de Jarvis · ${esc(e.kicker)}</span>
      <time datetime="${e.date}">${esc(e.dayLabel)}</time>
      <h1>${esc(e.title)}</h1>
      <p>${esc(e.summary)}</p>
      <a href="${WA}" class="btn btn-wa" onclick="window.ghTrack&&ghTrack('whatsapp_click',{place:'bitacora-hero'})">Quiero uno igual en mi empresa</a>
    </div>
  </section>

  <section class="sec">
    <div class="w">
      <span class="label">En números</span>
      <h2 class="title">Lo que costaría hacerlo con personas</h2>
      <div class="boxes">
        <div class="box"><div class="n">${esc(e.hours)}</div><div class="l">de trabajo humano</div></div>
        <div class="box"><div class="n">${esc(e.people)}</div><div class="l">personas en nómina</div></div>
        <div class="box"><div class="n">${esc(e.payroll)}</div><div class="l"><b>al mes en nómina en Torreón</b><br>${esc(e.freelance)} con agencia o freelance, ese día</div></div>
        <div class="box hl"><div class="n">1 día</div><div class="l">Pedro, con Jarvis</div></div>
      </div>
      <p class="note">${esc(e.payrollNote)} Son estimaciones, no cifras medidas; cada tarea se valuó a tarifa de mercado en La Laguna.</p>
    </div>
  </section>

  <section class="sec sec-gray">
    <div class="w">
      <span class="label">${e.items.length} tareas</span>
      <h2 class="title">Qué hizo, una por una</h2>
      <div class="prose"><p>Todas son tareas de operación real de GH Specialist y de las marcas de Pedro: sitios, CRM, facturación, prospección, redes y capacitación. Los clientes no se nombran.</p></div>
      <ol class="items">
        ${items}
      </ol>
      <figure class="lamina">
        <img src="${e.image}" width="1600" height="903" alt="${esc(e.title)}: lámina con las ${e.items.length} tareas y el costo equivalente" loading="lazy" decoding="async">
        <figcaption>Lámina presentada en BNI Torreón con el resumen del día.</figcaption>
      </figure>
      <div class="pager">
        ${prev ? `<a href="/bitacora/${prev.slug}/">← ${esc(prev.dayLabel)}</a>` : '<span></span>'}
        ${next ? `<a href="/bitacora/${next.slug}/">${esc(next.dayLabel)} →</a>` : '<a href="/bitacora/">Ver toda la bitácora →</a>'}
      </div>
    </div>
  </section>

  <section class="sec">
    <div class="w">
      <span class="label">Cómo funciona</span>
      <h2 class="title">¿Qué es Jarvis?</h2>
      <div class="prose">
        <p>Jarvis es el nombre que Pedro le da a su equipo de agentes de IA: un operador que trabaja desde su computadora y su servidor, con acceso a WhatsApp, correo, CRM, facturación y los sitios web. Pedro le pide las cosas en lenguaje normal, por chat, y Jarvis las ejecuta, verifica y reporta.</p>
        <p>Es la misma forma de trabajar que <a href="/servicios/capacitaciones-ia-empresas.html">implementamos en empresas por departamento</a>: primero las tareas repetitivas, después la operación completa. Si quieres ver cómo se vería en tu negocio, <a href="/#agendar-diagnostico">agenda un diagnóstico</a>.</p>
      </div>
    </div>
  </section>
` + FOOT;
}

function indexPage(entries, modified) {
  const url = `${SITE}/bitacora/`;
  const title = 'Bitácora de Jarvis: lo que hace una IA operando una empresa cada día';
  const description = 'Registro diario de lo que hace Jarvis, el equipo de agentes de IA de GH Specialist: tareas reales, horas equivalentes y lo que costaría en nómina en Torreón. Sin nombres de clientes.';
  const totalItems = entries.reduce((a, e) => a + e.items.length, 0);
  const ld = [
    { '@context': 'https://schema.org', '@type': 'Blog', name: 'Bitácora de Jarvis', url, description, inLanguage: 'es-MX', publisher: ORG, author: PERSON, blogPost: entries.map((e) => ({ '@type': 'BlogPosting', headline: e.title, url: `${SITE}/bitacora/${e.slug}/`, datePublished: e.date, image: `${SITE}${e.image}` })) },
    { '@context': 'https://schema.org', '@type': 'WebPage', name: title, url, inLanguage: 'es-MX', datePublished: '2026-11-10', dateModified: modified, author: PERSON },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Bitácora de Jarvis', item: url },
    ] },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: '¿Qué es Jarvis?', acceptedAnswer: { '@type': 'Answer', text: 'Jarvis es el equipo de agentes de IA con el que Pedro Luis Díaz opera GH Specialist y sus otras marcas: trabaja desde su computadora y su servidor con acceso a WhatsApp, correo, CRM, facturación y sitios web, y ejecuta lo que se le pide por chat.' } },
      { '@type': 'Question', name: '¿Las cifras de ahorro son reales?', acceptedAnswer: { '@type': 'Answer', text: 'Las tareas son reales y verificables; las horas y la nómina equivalente son estimaciones a tarifa de mercado en Torreón, no cifras medidas. Por eso se publican como rangos.' } },
      { '@type': 'Question', name: '¿Puede una pyme tener un Jarvis?', acceptedAnswer: { '@type': 'Answer', text: 'Sí. GH Specialist lo implementa por departamento, empezando por las tareas repetitivas (seguimiento a clientes, reportes, facturación, publicaciones) y capacitando al equipo para pedirle cosas a la IA en su trabajo real.' } },
    ] },
  ];
  const cards = entries.map((e) => `
        <article class="entry">
          <a href="/bitacora/${e.slug}/"><img src="${e.image}" width="1600" height="903" alt="${esc(e.title)}" loading="lazy" decoding="async"></a>
          <div class="body">
            <time datetime="${e.date}">${esc(e.dayLabel)}</time>
            <h2><a href="/bitacora/${e.slug}/">${esc(e.title)}</a></h2>
            <p>${esc(e.summary)}</p>
            <div class="mini"><span>${e.items.length} tareas</span><span>${esc(e.hours)} humanas</span><span>${esc(e.people)} personas en nómina</span><span>${esc(e.payroll)}/mes en Torreón</span></div>
            <a class="more" href="/bitacora/${e.slug}/">Ver las ${e.items.length} tareas →</a>
          </div>
        </article>`).join('\n');
  return head({ title, description, url, image: entries[0].image, ld }) + `
  <section class="hero">
    <div class="w">
      <span class="kicker">Bitácora de Jarvis</span>
      <h1>Lo que hace una IA operando una empresa, <em style="font-style:normal;color:#a78bfa">cada día</em></h1>
      <p>Jarvis es el equipo de agentes de IA de GH Specialist. Aquí queda registrado lo que hizo cada día: tareas reales, horas equivalentes y lo que costaría hacerlo con personas en Torreón. ${totalItems} tareas publicadas hasta ahora.</p>
      <a href="${WA}" class="btn btn-wa" onclick="window.ghTrack&&ghTrack('whatsapp_click',{place:'bitacora-index'})">Quiero un Jarvis en mi empresa</a>
    </div>
  </section>

  <section class="sec">
    <div class="w">
      <span class="label">Entradas</span>
      <h2 class="title">Día por día</h2>
      <div class="entries">${cards}
      </div>
    </div>
  </section>

  <section class="sec sec-gray">
    <div class="w">
      <span class="label">Preguntas</span>
      <h2 class="title">Cómo leer esta bitácora</h2>
      <div class="faq">
        <details open><summary>¿Qué es Jarvis?</summary><p>El equipo de agentes de IA con el que Pedro Luis Díaz opera GH Specialist y sus otras marcas. Trabaja desde su computadora y su servidor, con acceso a WhatsApp, correo, CRM, facturación y sitios web, y ejecuta lo que se le pide por chat.</p></details>
        <details><summary>¿Las cifras de ahorro son reales?</summary><p>Las tareas son reales y verificables. Las horas y la nómina equivalente son estimaciones a tarifa de mercado en Torreón, no cifras medidas; por eso van como rangos.</p></details>
        <details><summary>¿Puede una pyme tener un Jarvis?</summary><p>Sí. Lo implementamos por departamento, empezando por lo repetitivo: seguimiento a clientes, reportes, facturación, publicaciones. Y capacitamos al equipo para pedirle cosas a la IA en su trabajo real. <a href="/servicios/capacitaciones-ia-empresas.html" style="color:var(--p);font-weight:600">Ver cursos y niveles</a>.</p></details>
      </div>
    </div>
  </section>
` + FOOT;
}

const data = JSON.parse(await readFile(join(ROOT, 'data/bitacora.json'), 'utf8'));
const entries = [...data.entries].sort((a, b) => b.date.localeCompare(a.date));
const today = new Date().toISOString().slice(0, 10);
await mkdir(join(ROOT, 'bitacora'), { recursive: true });
await writeFile(join(ROOT, 'bitacora/index.html'), indexPage(entries, today));
for (let i = 0; i < entries.length; i++) {
  const e = entries[i];
  const next = entries[i - 1]; // más reciente
  const prev = entries[i + 1]; // más antigua
  await mkdir(join(ROOT, 'bitacora', e.slug), { recursive: true });
  await writeFile(join(ROOT, 'bitacora', e.slug, 'index.html'), entryPage(e, prev, next, today));
}
console.log(`✓ bitacora: índice + ${entries.length} entradas`);
