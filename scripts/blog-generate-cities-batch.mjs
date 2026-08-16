#!/usr/bin/env node
/**
 * Genera 4 artículos SEO locales — Torreón, Monterrey, CDMX y Guadalajara.
 * Usado por workflow blog-generate-cities.yml o manualmente:
 *   node scripts/blog-generate-cities-batch.mjs
 */
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadAiEnv } from './gh-load-ai-env.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

/**
 * Un tema por ciudad, apuntado a constructoras y desarrolladoras.
 *
 * Antes las cuatro pedian "seo con ia {ciudad}": el mismo articulo generico
 * repetido, peleando contra cualquier agencia del pais. Ahora cada plaza pide
 * lo que ahi se busca de verdad, y se alterna el perfil: unas ciudades atacan
 * el dolor de la constructora (mano de obra) y otras el de la desarrolladora
 * (vender la vivienda).
 *
 * @type {{ id: string, label: string, topic: string }[]}
 */
const CITY_SEO_TOPICS = [
  // La Laguna es donde hay obra propia y caso real: va por mano de obra.
  { id: 'torreon', label: 'Torreón y La Laguna', topic: 'reclutar personal de obra en torreon' },
  { id: 'monterrey', label: 'Monterrey', topic: 'crm para constructoras en monterrey' },
  { id: 'cdmx', label: 'CDMX', topic: 'crm inmobiliario para desarrolladoras en cdmx' },
  { id: 'guadalajara', label: 'Guadalajara', topic: 'automatizar ventas de vivienda en guadalajara' },
];

const DELAY_MS = Number(process.env.BLOG_BATCH_DELAY_MS || 8000);

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

await loadAiEnv();

const onlyCity = (process.env.BLOG_CITY || '').trim().toLowerCase();
const queue = onlyCity
  ? CITY_SEO_TOPICS.filter((c) => c.id === onlyCity)
  : CITY_SEO_TOPICS;

if (!queue.length) {
  console.error(`Ciudad no válida: «${onlyCity}». Opciones: ${CITY_SEO_TOPICS.map((c) => c.id).join(', ')}`);
  process.exit(1);
}

console.log(`\n${'='.repeat(60)}`);
console.log(`→ Lote SEO local: ${queue.length} artículo(s)`);
console.log(`${'='.repeat(60)}\n`);

const results = [];

for (let i = 0; i < queue.length; i++) {
  const { id, label, topic } = queue[i];
  console.log(`\n[${i + 1}/${queue.length}] ${label} — «${topic}»\n`);

  const result = spawnSync('node', ['scripts/blog-generate.mjs'], {
    env: {
      ...process.env,
      BLOG_MARKET: 'mx',
      BLOG_TOPIC: topic,
      BLOG_CITY: id,
    },
    cwd: ROOT,
    stdio: 'inherit',
  });

  results.push({ id, label, topic, ok: result.status === 0 });

  if (result.status !== 0) {
    console.error(`✗ Falló generación para ${label}`);
    process.exit(result.status ?? 1);
  }

  if (i < queue.length - 1) {
    console.log(`\n… pausa ${DELAY_MS / 1000}s antes del siguiente artículo\n`);
    await sleep(DELAY_MS);
  }
}

console.log(`\n${'='.repeat(60)}`);
console.log('✓ Lote completado:');
for (const r of results) {
  console.log(`  · ${r.label}: ${r.ok ? 'OK' : 'ERROR'} («${r.topic}»)`);
}
console.log(`${'='.repeat(60)}\n`);
