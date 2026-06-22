/**
 * IndexNow + ping sitemap — avisa a buscadores de URLs nuevas/actualizadas.
 */
const SITE = 'https://ghspecialist.com';
const HOST = 'ghspecialist.com';
export const INDEXNOW_KEY =
  process.env.INDEXNOW_KEY || 'f7e2a9b1c4d6e8f1029384756acdef0123';

const INDEXNOW_ENDPOINTS = [
  'https://api.indexnow.org/indexnow',
  'https://www.bing.com/indexnow',
  'https://yandex.com/indexnow',
];

async function postIndexNow(urlList, endpoint) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: HOST,
      key: INDEXNOW_KEY,
      keyLocation: `${SITE}/${INDEXNOW_KEY}.txt`,
      urlList,
    }),
  });
  const label = endpoint.replace(/^https?:\/\/([^/]+).*/, '$1');
  if (!res.ok) console.warn(`[indexnow] ${label}`, res.status, (await res.text()).slice(0, 80));
  else console.log(`[indexnow] ${label}`, res.status, `(${urlList.length} URLs)`);
}

export async function pingSearchEngines(paths) {
  if (!paths?.length) return;

  const urls = paths
    .map((p) => (p.startsWith('http') ? p : `${SITE}${p.startsWith('/') ? p : `/${p}`}`))
    .filter((u) => u.includes(HOST));

  if (!urls.length) return;

  const batchSize = 10;
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    for (const endpoint of INDEXNOW_ENDPOINTS) {
      try {
        await postIndexNow(batch, endpoint);
      } catch (e) {
        console.warn('[indexnow]', endpoint, e.message);
      }
    }
  }

  try {
    const g = await fetch(
      `https://www.google.com/ping?sitemap=${encodeURIComponent(`${SITE}/sitemap.xml`)}`
    );
    console.log('[sitemap] google ping', g.status);
  } catch (e) {
    console.warn('[sitemap] google ping', e.message);
  }

  console.log(`✓ Indexación solicitada: ${urls.length} URL(s)`);
}

const PRIORITY_PATHS = [
  '/',
  '/ciudades/',
  '/servicios/',
  '/blog/',
  '/torreon/',
  '/ciudades/monterrey/',
  '/ciudades/cdmx/',
  '/ciudades/guadalajara/',
  '/ciudades/queretaro/',
  '/chatbot-whatsapp-torreon.html',
  '/agencia-ia-la-laguna.html',
  '/automatizacion-gomez-palacio.html',
  '/servicios/chatbot-ia-whatsapp.html',
  '/servicios/crm-kommo.html',
  '/servicios/automatizacion-total.html',
  '/servicios/web-seo-blog-ia.html',
  '/servicios/agentes-omnicanal.html',
  '/sitemap.xml',
];

async function pathsFromSitemap(root) {
  const { readFile } = await import('node:fs/promises');
  const { join, dirname } = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const base = root || join(dirname(fileURLToPath(import.meta.url)), '..');
  const xml = await readFile(join(base, 'sitemap.xml'), 'utf8');
  const paths = [];
  for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/gi)) {
    const loc = m[1].trim();
    if (!loc.includes(HOST)) continue;
    paths.push(loc.replace(SITE, '') || '/');
  }
  return paths;
}

/** CLI: node scripts/indexnow.mjs [--sitemap|--latest N] [/ruta] */
async function cliMain() {
  const { readdir } = await import('node:fs/promises');
  const { join, dirname } = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const paths = new Set(PRIORITY_PATHS);
  const argv = process.argv.slice(2);
  let useSitemap = false;

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--sitemap' || a === '--all') {
      useSitemap = true;
    } else if (a === '--latest') {
      const n = Number(argv[++i] || 5);
      const blogDir = join(root, 'blog');
      const files = (await readdir(blogDir))
        .filter((f) => f.endsWith('.html') && f !== 'index.html')
        .sort()
        .reverse()
        .slice(0, n);
      for (const f of files) paths.add(`/blog/${f}`);
    } else if (a.startsWith('/')) {
      paths.add(a);
    }
  }

  if (useSitemap) {
    paths.clear();
    for (const p of await pathsFromSitemap(root)) paths.add(p);
    paths.add('/sitemap.xml');
  }

  const list = [...paths];
  console.log(`→ Indexando ${list.length} URL(s)…`);
  await pingSearchEngines(list);
}

const isCli =
  process.argv[1] &&
  (process.argv[1].endsWith('indexnow.mjs') || process.argv[1].includes('indexnow'));
if (isCli) {
  cliMain().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
