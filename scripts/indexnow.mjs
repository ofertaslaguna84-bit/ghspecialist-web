/**
 * IndexNow + ping sitemap — avisa a buscadores de URLs nuevas/actualizadas.
 */
const SITE = 'https://ghspecialist.com';
const HOST = 'ghspecialist.com';
export const INDEXNOW_KEY =
  process.env.INDEXNOW_KEY || 'f7e2a9b1c4d6e8f1029384756acdef0123';

export async function pingSearchEngines(paths) {
  if (!paths?.length) return;

  const urls = paths
    .map((p) => (p.startsWith('http') ? p : `${SITE}${p.startsWith('/') ? p : `/${p}`}`))
    .filter((u) => u.includes(HOST));

  if (!urls.length) return;

  const tasks = [
    fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: HOST,
        key: INDEXNOW_KEY,
        keyLocation: `${SITE}/${INDEXNOW_KEY}.txt`,
        urlList: urls,
      }),
    }).catch((e) => console.warn('[indexnow]', e.message)),
    fetch(
      `https://www.bing.com/indexnow?url=${encodeURIComponent(urls[0])}&key=${INDEXNOW_KEY}`
    ).catch((e) => console.warn('[indexnow] bing', e.message)),
    fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(`${SITE}/sitemap.xml`)}`).catch(
      (e) => console.warn('[indexnow] google sitemap ping', e.message)
    ),
  ];

  await Promise.allSettled(tasks);
  console.log(`✓ IndexNow: ${urls.length} URL(s) notificadas`);
}

const PRIORITY_PATHS = [
  '/',
  '/blog/',
  '/panel/',
  '/servicios/chatbot-ia-whatsapp.html',
  '/servicios/crm-kommo.html',
  '/servicios/automatizacion-total.html',
  '/servicios/web-seo-blog-ia.html',
  '/servicios/agentes-omnicanal.html',
  '/sitemap.xml',
];

/** CLI: node scripts/indexnow.mjs [--latest N] [/ruta] */
async function cliMain() {
  const { readdir, readFile } = await import('node:fs/promises');
  const { join, dirname } = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const paths = new Set(PRIORITY_PATHS);
  const argv = process.argv.slice(2);

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--latest') {
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

  await pingSearchEngines([...paths]);
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
