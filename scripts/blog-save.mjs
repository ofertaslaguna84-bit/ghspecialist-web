#!/usr/bin/env node
/**
 * Guarda cambios de un artículo (título, descripción, cuerpo) y actualiza card + SEO.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SITE = 'https://ghspecialist.com';
const BLOG_CURRENT_YEAR = '2026';

function fixOutdatedYears(text) {
  if (!text || typeof text !== 'string') return text;
  return text.replace(/\b202[0-5]\b/g, BLOG_CURRENT_YEAR);
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function extractBody(html) {
  const start = html.match(/<div class="art-meta">[\s\S]*?<\/div>\s*/i);
  if (!start) return { body: '', startIdx: -1, endIdx: -1 };
  const startIdx = start.index + start[0].length;
  const markers = ['<div class="cta-art">', '<section class="related"'];
  let endIdx = html.length;
  for (const m of markers) {
    const p = html.indexOf(m, startIdx);
    if (p !== -1 && p < endIdx) endIdx = p;
  }
  return { body: html.slice(startIdx, endIdx).trim(), startIdx, endIdx };
}

function patchArticleHtml(html, { title, description, bodyHtml }) {
  const today = new Date().toISOString().slice(0, 10);
  let out = html;

  out = out.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(title)} | GH Specialist</title>`);
  out = out.replace(
    /<meta name="description" content="[^"]*"/i,
    `<meta name="description" content="${escapeHtml(description)}"`
  );
  out = out.replace(
    /<meta property="og:title" content="[^"]*"/i,
    `<meta property="og:title" content="${escapeHtml(title)}"`
  );
  out = out.replace(
    /<meta property="og:description" content="[^"]*"/i,
    `<meta property="og:description" content="${escapeHtml(description)}"`
  );
  out = out.replace(
    /<meta name="twitter:title" content="[^"]*"/i,
    `<meta name="twitter:title" content="${escapeHtml(title)}"`
  );
  out = out.replace(
    /<meta name="twitter:description" content="[^"]*"/i,
    `<meta name="twitter:description" content="${escapeHtml(description)}"`
  );
  out = out.replace(/<meta property="article:modified_time" content="[^"]*"/i, `<meta property="article:modified_time" content="${today}"`);

  out = out.replace(/"dateModified"\s*:\s*"[^"]+"/g, `"dateModified":"${today}"`);
  out = out.replace(/"headline"\s*:\s*"[^"]+"/, `"headline":${JSON.stringify(title)}`);
  out = out.replace(/"description"\s*:\s*"[^"]+"/, `"description":${JSON.stringify(description)}`);

  out = out.replace(/<h1[^>]*>[\s\S]*?<\/h1>/i, `<h1>${title}</h1>`);

  const { startIdx, endIdx } = extractBody(out);
  if (startIdx !== -1) {
    out = out.slice(0, startIdx) + '\n\n  ' + bodyHtml.trim() + '\n\n  ' + out.slice(endIdx);
  }

  return out;
}

function patchCardInIndex(html, slug, title, cardExcerpt) {
  const re = new RegExp(
    `(<a href="${escapeRegex(slug)}" class="card">[\\s\\S]*?<h2>)[^<]*(</h2>\\s*<p>)[^<]*(</p>)`,
    'i'
  );
  if (!re.test(html)) return html;
  return html.replace(re, `$1${escapeHtml(title)}$2${escapeHtml(cardExcerpt)}$3`);
}

async function main() {
  const clientSecret = process.env.CLIENT_SECRET || '';
  const expectedSecret = process.env.BLOG_GENERATE_SECRET || '';
  if (expectedSecret && clientSecret !== expectedSecret) {
    console.error('Secret inválido');
    process.exit(1);
  }

  let payload = {};
  try {
    payload = JSON.parse(process.env.BLOG_SAVE_PAYLOAD || '{}');
  } catch {
    console.error('BLOG_SAVE_PAYLOAD inválido');
    process.exit(1);
  }

  const slug = (payload.slug || '').trim();
  const title = (payload.title || '').trim();
  const description = (payload.description || '').trim();
  const bodyHtml = (payload.bodyHtml || '').trim();
  const cardExcerpt = (payload.cardExcerpt || description).trim().slice(0, 220);

  if (!slug || !slug.endsWith('.html') || slug.includes('..') || slug.includes('/')) {
    console.error('slug inválido');
    process.exit(1);
  }
  if (!title || !description || !bodyHtml) {
    console.error('Faltan title, description o bodyHtml');
    process.exit(1);
  }

  title = fixOutdatedYears(title);
  description = fixOutdatedYears(description);
  bodyHtml = fixOutdatedYears(bodyHtml);
  cardExcerpt = fixOutdatedYears(cardExcerpt);

  const filePath = join(ROOT, 'blog', slug);
  let html = await readFile(filePath, 'utf8');
  html = patchArticleHtml(html, { title, description, bodyHtml });
  await writeFile(filePath, html, 'utf8');
  console.log(`✓ artículo actualizado: blog/${slug}`);

  const indexPath = join(ROOT, 'blog/index.html');
  let indexHtml = await readFile(indexPath, 'utf8');
  indexHtml = patchCardInIndex(indexHtml, slug, title, cardExcerpt);
  await writeFile(indexPath, indexHtml, 'utf8');
  console.log('✓ card actualizada en blog/index.html');

  execSync('node scripts/generate-seo.mjs', { cwd: ROOT, stdio: 'inherit' });

  await writeFile(
    join(ROOT, 'blog-save-result.json'),
    JSON.stringify({
      ok: true,
      saved: true,
      slug,
      title,
      url: `${SITE}/blog/${slug}`,
    }),
    'utf8'
  );
  console.log('✓ Guardado completo');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
