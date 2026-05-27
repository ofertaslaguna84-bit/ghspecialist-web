#!/usr/bin/env node
/**
 * Recorta artículos HTML ya publicados al límite de palabras.
 * Uso: node scripts/trim-blog-articles.mjs
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  countWordsInHtml,
  trimContentHtmlToMaxWords,
  readTimeFromWordCount,
} from './gh-blog-article-length.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const BLOG = join(ROOT, 'blog');

async function trimFile(file) {
  const html = await readFile(file, 'utf8');
  let m = html.match(
    /(<figure class="art-hero">[\s\S]*?<\/figure>\s*)([\s\S]*?)(\s*<div class="cta-art">)/
  );
  if (!m) {
    m = html.match(
      /(<div class="art-meta">[\s\S]*?<\/div>\s*)([\s\S]*?)(\s*<div class="cta-art">)/
    );
  }
  if (!m) {
    console.log('  skip (sin cuerpo):', file);
    return;
  }

  const before = countWordsInHtml(m[2]);
  if (before <= 1000) {
    console.log(`  ok ${before} palabras:`, file);
    return;
  }

  const trimmed = trimContentHtmlToMaxWords(m[2]);
  const after = countWordsInHtml(trimmed);
  const readMin = readTimeFromWordCount(after);

  let out = html.replace(m[0], `${m[1]}${trimmed}${m[3]}`);
  out = out.replace(
    /(<div class="art-meta">[\s\S]*?·\s*)\d+(\s*min lectura<\/div>)/,
    `$1${readMin}$2`
  );
  out = out.replace(
    /(<span class="card-meta">[\s\S]*?·\s*)\d+(\s*min<\/span>)/,
    `$1${readMin}$2`
  );

  await writeFile(file, out, 'utf8');
  console.log(`  ✂ ${before} → ${after} palabras (${readMin} min):`, file);
}

const files = await readdir(BLOG);
for (const f of files) {
  if (!f.endsWith('.html') || f === 'index.html' || f.startsWith('_')) continue;
  await trimFile(join(BLOG, f));
}
console.log('Listo.');
