#!/usr/bin/env node
/**
 * Mete los videos de data/videos.json en sus páginas de servicio:
 *  - reemplaza el visual del hero por el <video> (poster + subtítulos + controles)
 *  - agrega sección "Lo que dice el video" (transcripción visible, para SEO y GEO)
 *  - agrega VideoObject (JSON-LD) y og:video en el <head>
 * Es idempotente: todo lo que inyecta va entre marcadores gh-video y se reemplaza al volver a correr.
 * Ejecutar: node scripts/inject-videos.mjs
 */
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SITE = 'https://ghspecialist.com';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const isoDur = (sec) => `PT${Math.floor(sec / 60)}M${Math.round(sec % 60)}S`;
const minTxt = (sec) => (sec < 60 ? `${Math.round(sec)} s` : `${Math.floor(sec / 60)} min ${Math.round(sec % 60)} s`);

function stripBlock(html, name) {
  const re = new RegExp(`\\s*<!-- gh-video:${name}:start -->[\\s\\S]*?<!-- gh-video:${name}:end -->`, 'g');
  return html.replace(re, '');
}

/** Devuelve [inicio, fin) del <div class="svc-hero-visual ..."> completo (con cierre), o null. */
function findHeroVisual(html) {
  const start = html.search(/<div class="svc-hero-visual[^"]*"[^>]*>/);
  if (start < 0) return null;
  const tagRe = /<div\b[^>]*>|<\/div>/g;
  tagRe.lastIndex = start;
  let depth = 0;
  let m;
  while ((m = tagRe.exec(html))) {
    depth += m[0].startsWith('</') ? -1 : 1;
    if (depth === 0) return [start, tagRe.lastIndex];
  }
  return null;
}

function videoBlock(v) {
  const rel = '../videos/';
  return `<!-- gh-video:hero:start -->
<div class="svc-hero-visual has-video">
        <video class="svc-video" controls playsinline preload="metadata" poster="${rel}${v.slug}.jpg" width="1280" height="720" aria-label="${esc(v.title)}">
          <source src="${rel}${v.slug}.mp4" type="video/mp4">
          <track kind="captions" srclang="es" label="Español" src="${rel}${v.slug}.vtt" default>
          Tu navegador no reproduce video. <a href="${rel}${v.slug}.mp4">Descarga el video</a>.
        </video>
        <div class="svc-video-cap">▶ ${minTxt(v.duration)} · ${esc(v.caption)}</div>
      </div>
<!-- gh-video:hero:end -->`;
}

function transcriptBlock(v) {
  const paras = v.transcript
    .split(/\n\s*\n/)
    .map((p) => `<p>${esc(p.trim())}</p>`)
    .join('\n          ');
  return `<!-- gh-video:transcript:start -->
  <section class="sec sec-gray" id="video">
    <div class="w">
      <div class="fi">
        <span class="label">En ${minTxt(v.duration)}</span>
        <h2 class="title">${esc(v.h2)}</h2>
        <p class="sub-text">${esc(v.intro)}</p>
      </div>
      <div class="video-transcript fi fi-d1">
        <div class="video-transcript-head">Transcripción del video "${esc(v.title)}"</div>
        <div class="video-transcript-body">
          ${paras}
        </div>
      </div>
    </div>
  </section>
<!-- gh-video:transcript:end -->`;
}

function headBlock(v) {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: v.title,
    description: v.description,
    thumbnailUrl: [`${SITE}/videos/${v.slug}.jpg`],
    uploadDate: v.uploadDate,
    duration: isoDur(v.duration),
    contentUrl: `${SITE}/videos/${v.slug}.mp4`,
    inLanguage: 'es-MX',
    isFamilyFriendly: true,
    transcript: v.transcript.replace(/\s+/g, ' ').trim(),
    publisher: { '@type': 'Organization', name: 'GH Specialist', url: SITE, logo: { '@type': 'ImageObject', url: `${SITE}/logo-gh.webp` } },
    mainEntityOfPage: `${SITE}/${v.page}`,
  };
  return `<!-- gh-video:head:start -->
  <meta property="og:video" content="${SITE}/videos/${v.slug}.mp4">
  <meta property="og:video:type" content="video/mp4">
  <meta property="og:video:width" content="1280">
  <meta property="og:video:height" content="720">
  <script type="application/ld+json">${JSON.stringify(ld)}</script>
<!-- gh-video:head:end -->`;
}

const CSS = `<!-- gh-video:css:start -->
  <style>
    .svc-hero-visual.has-video{padding:0;background:#000;border-color:rgba(255,255,255,.25);box-shadow:0 20px 60px rgba(0,0,0,.45)}
    .svc-video{display:block;width:100%;height:auto;aspect-ratio:16/9;background:#000}
    .svc-video-cap{font-size:12px;font-weight:600;color:rgba(255,255,255,.85);padding:10px 14px;background:#120B2E}
    .video-transcript{margin-top:28px;border:1.5px solid var(--border);border-radius:var(--r);background:#fff;overflow:hidden}
    .video-transcript-head{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--p);padding:12px 20px;border-bottom:1px solid var(--border);background:var(--p-light)}
    .video-transcript-body{padding:18px 20px;columns:2;column-gap:36px}
    .video-transcript-body p{font-size:14.5px;line-height:1.7;color:var(--ink2);margin-bottom:12px;break-inside:avoid}
    @media(max-width:860px){.svc-hero-visual.has-video{display:block;margin-top:8px}.video-transcript-body{columns:1}}
  </style>
<!-- gh-video:css:end -->`;

/* ---------- modo landing: sin menú, video protagonista, un solo CTA repetido, barra fija en móvil ---------- */
const WA_SVG = '<svg viewBox="0 0 24 24" fill="#fff" width="18" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.553 4.123 1.522 5.858L0 24l6.338-1.498A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.897 0-3.668-.508-5.194-1.396l-.371-.221-3.764.89.946-3.658-.243-.393A9.935 9.935 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>';

const LANDING_CSS = `<!-- gh-video:landing-css:start -->
  <style>
    /* landing: menú fuera, un solo camino */
    .hdr-nav,.breadcrumb{display:none!important}
    .svc-hero .w{display:block!important;max-width:1040px;margin:0 auto;text-align:center}
    .svc-hero h1{font-size:clamp(30px,4.6vw,54px);max-width:900px;margin-left:auto;margin-right:auto}
    .svc-hero-sub{max-width:760px;margin-left:auto;margin-right:auto}
    .svc-hero-btns{justify-content:center}
    .svc-kicker{justify-content:center}
    .svc-hero-visual.has-video{display:block!important;width:100%;max-width:1040px;margin:34px auto 0;transform:none!important}
    .land-cta{margin:0 auto;max-width:1120px;padding:0 24px}
    .land-cta-box{background:linear-gradient(135deg,#120B2E,#2a1a6e 60%,#7B61FF);color:#fff;border-radius:18px;padding:34px 36px;display:flex;align-items:center;justify-content:space-between;gap:24px;flex-wrap:wrap;margin:8px 0 56px;box-shadow:0 18px 50px rgba(18,11,46,.25)}
    .land-cta-box h3{font-size:22px;line-height:1.25;margin:0 0 6px;color:#fff}
    .land-cta-box p{margin:0;color:rgba(255,255,255,.8);font-size:15px;max-width:620px}
    .land-cta-btn{display:inline-flex;align-items:center;gap:10px;background:#25D366;color:#fff!important;font-weight:700;padding:15px 24px;border-radius:999px;text-decoration:none;white-space:nowrap;font-size:16px;box-shadow:0 8px 24px rgba(37,211,102,.35)}
    .land-cta-btn:hover{background:#1fb858}
    .land-sticky{display:none}
    @media(max-width:860px){
      .land-cta-box{padding:26px 22px;margin-bottom:40px}
      .hdr-inner{padding:0 14px;height:60px}.hdr-inner .btn{padding:7px 11px;font-size:12.5px;border-radius:8px}.hdr-logo{height:50px;max-width:62vw;object-fit:contain}
    }
  </style>
<!-- gh-video:landing-css:end -->`;

function ctaBlock(v, wa) {
  return `<!-- gh-video:cta:start -->
  <div class="land-cta"><div class="land-cta-box fi">
    <div><h3>${esc(v.cta_title)}</h3><p>${esc(v.cta_text)}</p></div>
    <a class="land-cta-btn" href="${wa}" target="_blank" rel="noopener">${WA_SVG} Escríbeme por WhatsApp</a>
  </div></div>
<!-- gh-video:cta:end -->`;
}

function stickyBlock(wa) {
  return `<!-- gh-video:sticky:start -->
  <div class="land-sticky"><a class="land-cta-btn" href="${wa}" target="_blank" rel="noopener">${WA_SVG} Escríbeme por WhatsApp</a></div>
<!-- gh-video:sticky:end -->`;
}

function applyLanding(html, v) {
  for (const b of ['landing-css', 'cta', 'sticky']) html = stripBlock(html, b);
  const wa = (html.match(/https:\/\/wa\.me\/[^"']+/) || ['https://wa.me/528712638082'])[0];
  // CTA después de cada segunda sección (sin contar hero ni la del video)
  const secRe = /<section class="sec(?: [^"]*)?"(?: id="([^"]*)")?>[\s\S]*?<\/section>/g;
  let i = 0;
  // 23 oct 2026 (Pedro): solo la burbuja flotante de WhatsApp; sin cajas CTA ni barra fija
  html = html.replace('</head>', `${LANDING_CSS}\n</head>`);
  return html;
}

async function inject(v) {
  const file = join(ROOT, v.page);
  let html = await readFile(file, 'utf8');
  for (const b of ['transcript', 'head', 'css']) html = stripBlock(html, b);

  const heroRe = /<!-- gh-video:hero:start -->[\s\S]*?<!-- gh-video:hero:end -->/;
  if (heroRe.test(html)) {
    html = html.replace(heroRe, videoBlock(v)); // ya tenía video: solo se reemplaza
  } else {
    const hv = findHeroVisual(html);
    if (!hv) throw new Error(`${v.page}: no encontré .svc-hero-visual`);
    html = html.slice(0, hv[0]) + videoBlock(v) + html.slice(hv[1]);
  }

  // transcripción: justo después del </section> del hero
  const heroEnd = html.indexOf('</section>', html.indexOf('<section class="svc-hero"'));
  if (heroEnd < 0) throw new Error(`${v.page}: no encontré el cierre del hero`);
  const cut = heroEnd + '</section>'.length;
  html = html.slice(0, cut) + '\n\n' + transcriptBlock(v) + html.slice(cut);

  // head: antes de </head>; css después del <style> principal (al final del head también sirve)
  html = html.replace('</head>', `${headBlock(v)}\n${CSS}\n</head>`);

  html = applyLanding(html, v);

  await writeFile(file, html, 'utf8');
  console.log(`✓ ${v.page} ← videos/${v.slug}.mp4 (${isoDur(v.duration)})`);
}

const videos = JSON.parse(await readFile(join(ROOT, 'data/videos.json'), 'utf8'));
for (const v of videos) await inject(v);
