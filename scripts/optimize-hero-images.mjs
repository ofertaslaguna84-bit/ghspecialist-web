#!/usr/bin/env node
/**
 * Convierte hero-*.{jpg,png} → WebP 1600px y actualiza referencias en el repo.
 * Requiere: python3 + Pillow (pip install pillow)
 * Ejecutar: node scripts/optimize-hero-images.mjs
 */
import { readdir, readFile, writeFile, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const MAX_W = 1600;
const QUALITY = 82;

const PY_SCRIPT = join(ROOT, 'scripts', '_optimize_heroes.py');

async function walkHtml(dir, out = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) await walkHtml(full, out);
    else if (/\.(html|json|mjs|js|md)$/.test(entry.name)) out.push(full);
  }
  return out;
}

async function replaceInFiles() {
  const pairs = [
    ['hero-bg.webp', 'hero-bg.webp'],
    ['hero-chihuahua.webp', 'hero-chihuahua.webp'],
    ['hero-guadalajara.webp', 'hero-guadalajara.webp'],
    ['hero-leon.webp', 'hero-leon.webp'],
    ['hero-merida.webp', 'hero-merida.webp'],
    ['hero-monterrey.webp', 'hero-monterrey.webp'],
    ['hero-puebla.webp', 'hero-puebla.webp'],
    ['hero-queretaro.webp', 'hero-queretaro.webp'],
    ['hero-torreon.webp', 'hero-torreon.webp'],
  ];
  const files = await walkHtml(ROOT);
  let changed = 0;
  for (const file of files) {
    let text = await readFile(file, 'utf8');
    let next = text;
    for (const [from, to] of pairs) {
      next = next.split(from).join(to);
    }
    if (next !== text) {
      await writeFile(file, next, 'utf8');
      changed++;
    }
  }
  return changed;
}

async function removeSources() {
  const removed = [];
  for (const name of await readdir(ROOT)) {
    if (!/^hero-.*\.(jpe?g|png)$/i.test(name)) continue;
    await unlink(join(ROOT, name));
    removed.push(name);
  }
  return removed;
}

async function main() {
  execSync(`python3 "${PY_SCRIPT}" "${ROOT}" ${MAX_W} ${QUALITY}`, {
    stdio: 'inherit',
  });
  const changed = await replaceInFiles();
  const removed = await removeSources();
  console.log(`Referencias actualizadas en ${changed} archivo(s).`);
  console.log(`Originales eliminados: ${removed.join(', ') || '(ninguno)'}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
