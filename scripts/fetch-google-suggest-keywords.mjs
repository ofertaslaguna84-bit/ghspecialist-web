#!/usr/bin/env node
/**
 * Consulta autocompletado Google MX (hl=es, gl=mx) para ampliar VALIDATED_BLOG_TOPICS.
 * Uso: node scripts/fetch-google-suggest-keywords.mjs
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const KEYWORDS_FILE = join(ROOT, 'scripts/gh-blog-validated-keywords.mjs');

const SEEDS = [
  'chatbot whatsapp negocios mexico',
  'automatizar negocio con inteligencia artificial',
  'crm kommo whatsapp',
  'agente ia whatsapp',
  'como posicionar pagina google mexico',
  'chatbot whatsapp precio',
  'automatizacion whatsapp pymes',
  'inteligencia artificial empresas mexico',
  'embudo ventas whatsapp',
  'atencion cliente chatbot',
  'inteligencia artificial torreon',
  'chatbot torreon',
  'automatizacion torreon',
  'agencia inteligencia artificial',
];

async function suggest(q) {
  const url =
    'https://suggestqueries.google.com/complete/search?' +
    new URLSearchParams({ client: 'firefox', q, hl: 'es', gl: 'mx' });
  const res = await fetch(url);
  const buf = Buffer.from(await res.arrayBuffer());
  const text = buf.toString('latin1');
  const data = JSON.parse(text);
  return data[1] || [];
}

const existing = readFileSync(KEYWORDS_FILE, 'utf8').toLowerCase();
const found = new Set();

for (const seed of SEEDS) {
  const items = await suggest(seed);
  for (const s of items) {
    const low = s.toLowerCase();
    if (low.length < 12) continue;
    if (
      /colombia|chile|argentina|españa|puerto rico|perú|paraguay|guatemala|venezuela|ingl[eé]s|pelicula|juego|famosos|restaurante|receta|noticias/.test(
        low
      )
    ) {
      continue;
    }
    if (!/whatsapp|chatbot|kommo|crm|automatiz|inteligencia|google|seo|agente|embudo|pyme|negocio|ia\b/.test(low)) {
      continue;
    }
    found.add(low);
  }
  await new Promise((r) => setTimeout(r, 200));
}

console.log('=== Sugerencias Google MX (nicho GH) ===\n');
for (const s of [...found].sort()) {
  const inFile = existing.includes(s.replace(/ñ/g, 'n').slice(0, 22));
  console.log(inFile ? '  [ya]' : '  [+] ', s);
}
