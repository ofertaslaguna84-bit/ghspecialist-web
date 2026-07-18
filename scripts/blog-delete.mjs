#!/usr/bin/env node
/**
 * Borra un artículo del blog: HTML, card en index, sitemap/RSS, deploy Pages.
 * CI: repository_dispatch blog_delete + secret BLOG_GENERATE_SECRET.
 */
import { readFile, writeFile, unlink, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { assertBlogClientSecret } from './gh-blog-secret.mjs';
import { pingSearchEngines } from './indexnow.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SITE = 'https://ghspecialist.com';

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function removeCardFromIndex(slug) {
  const indexPath = join(ROOT, 'blog/index.html');
  let html = await readFile(indexPath, 'utf8');
  const re = new RegExp(`\\s*<a href="${escapeRegex(slug)}" class="card">[\\s\\S]*?</a>\\s*`, 'g');
  const next = html.replace(re, '\n');
  if (next === html) console.warn(`⚠ card no encontrada en index: ${slug}`);
  await writeFile(indexPath, next, 'utf8');
}

async function removeHeroImages(slug) {
  const base = slug.replace(/\.html$/, '');
  const imgDir = join(ROOT, 'blog/img');
  try {
    const files = await readdir(imgDir);
    for (const f of files.filter((x) => x.startsWith(base))) {
      await unlink(join(imgDir, f));
      console.log(`✓ imagen borrada: blog/img/${f}`);
    }
  } catch {
    /* sin carpeta img */
  }
}

async function main() {
  try {
    await assertBlogClientSecret(process.env.CLIENT_SECRET || '');
  } catch (err) {
    console.error(err.message || 'Secret inválido');
    process.exit(1);
  }

  const slug = (process.env.BLOG_SLUG || '').trim();
  if (!slug || !slug.endsWith('.html') || slug.includes('..') || slug.includes('/')) {
    console.error('BLOG_SLUG inválido (ej. mi-articulo-mexico.html)');
    process.exit(1);
  }
  if (slug === 'index.html' || slug.startsWith('_')) {
    console.error('No se puede borrar ese archivo');
    process.exit(1);
  }

  const filePath = join(ROOT, 'blog', slug);
  let title = slug;
  try {
    const html = await readFile(filePath, 'utf8');
    title = html.match(/<title>([^<]*)<\/title>/i)?.[1]?.trim() || slug;
    await unlink(filePath);
    console.log(`✓ borrado: blog/${slug}`);
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.warn(`⚠ archivo no existe: blog/${slug}`);
    } else throw err;
  }

  await removeCardFromIndex(slug);
  await removeHeroImages(slug);

  execSync('node scripts/generate-seo.mjs', { cwd: ROOT, stdio: 'inherit' });
  await pingSearchEngines(['/blog/', '/sitemap.xml']);

  const outPath = join(ROOT, 'blog-delete-result.json');
  await writeFile(
    outPath,
    JSON.stringify({
      ok: true,
      deleted: true,
      slug,
      title,
      url: `${SITE}/blog/`,
    }),
    'utf8'
  );
  console.log(`✓ Artículo eliminado: ${slug}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
