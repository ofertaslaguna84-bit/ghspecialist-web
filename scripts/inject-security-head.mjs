#!/usr/bin/env node
/**
 * Inserta meta CSP + Referrer-Policy en todas las páginas HTML.
 * Ejecutar: node scripts/inject-security-head.mjs
 */
import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { injectSecurityHead } from './lib/security-head-snippet.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

async function walkHtml(dir, out = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules') continue;
      await walkHtml(full, out);
    } else if (entry.name.endsWith('.html')) {
      out.push(full);
    }
  }
  return out;
}

async function main() {
  const files = await walkHtml(ROOT);
  let updated = 0;
  for (const file of files) {
    const html = await readFile(file, 'utf8');
    const next = injectSecurityHead(html);
    if (next !== html) {
      await writeFile(file, next, 'utf8');
      updated += 1;
    }
  }
  console.log(`Security meta: ${updated} archivo(s) actualizado(s) de ${files.length}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
