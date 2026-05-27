#!/usr/bin/env node
/**
 * Copia data/gh-blog-topics.json → js/gh-blog-topic.js (array VALIDATED_BLOG_TOPICS).
 * Uso: node scripts/sync-blog-topics-panel.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const topics = JSON.parse(readFileSync(join(ROOT, 'data/gh-blog-topics.json'), 'utf8'));
const panelPath = join(ROOT, 'js/gh-blog-topic.js');
const src = readFileSync(panelPath, 'utf8');
const arrayJson = JSON.stringify(topics, null, 2).replace(/\n/g, '\n  ');
const next = src.replace(
  /var VALIDATED_BLOG_TOPICS = \[[\s\S]*?\];/,
  `var VALIDATED_BLOG_TOPICS = ${arrayJson};`
);
if (next === src) {
  console.error('No se encontró VALIDATED_BLOG_TOPICS en js/gh-blog-topic.js');
  process.exit(1);
}
writeFileSync(panelPath, next);
console.log(`OK: ${topics.length} temas → js/gh-blog-topic.js`);
