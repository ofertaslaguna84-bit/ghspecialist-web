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
