#!/usr/bin/env node
/**
 * Lote: 3 temas Claude × 4 ciudades (Torreón, Monterrey, CDMX, Guadalajara).
 *   node scripts/blog-generate-claude-cities-batch.mjs
 * Filtros opcionales: BLOG_CITY=monterrey · BLOG_CLAUDE_PILLAR=rh|capacitacion|construccion
 */
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadAiEnv } from './gh-load-ai-env.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

const CITIES = [
  { id: 'torreon', label: 'Torreón y La Laguna' },
  { id: 'monterrey', label: 'Monterrey' },
  { id: 'cdmx', label: 'CDMX' },
  { id: 'guadalajara', label: 'Guadalajara' },
];

const PILLARS = [
  { id: 'rh', label: 'Claude · Recursos Humanos', topic: (city) => `claude para recursos humanos ${city}` },
  { id: 'capacitacion', label: 'Claude · Capacitación', topic: (city) => `claude para capacitacion empresas ${city}` },
  { id: 'construccion', label: 'Claude · Construcción', topic: (city) => `claude para construccion ${city}` },
];

const DELAY_MS = Number(process.env.BLOG_BATCH_DELAY_MS || 8000);

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

await loadAiEnv();

const onlyCity = (process.env.BLOG_CITY || '').trim().toLowerCase();
const onlyPillar = (process.env.BLOG_CLAUDE_PILLAR || '').trim().toLowerCase();

const cities = onlyCity ? CITIES.filter((c) => c.id === onlyCity) : CITIES;
const pillars = onlyPillar ? PILLARS.filter((p) => p.id === onlyPillar) : PILLARS;

if (onlyCity && !cities.length) {
  console.error(`Ciudad inválida: ${onlyCity}. Opciones: ${CITIES.map((c) => c.id).join(', ')}`);
  process.exit(1);
}
if (onlyPillar && !pillars.length) {
  console.error(`Pilar inválido: ${onlyPillar}. Opciones: ${PILLARS.map((p) => p.id).join(', ')}`);
  process.exit(1);
}

/** @type {{ city: typeof CITIES[0], pillar: typeof PILLARS[0], topic: string }[]} */
const queue = [];
for (const pillar of pillars) {
  for (const city of cities) {
    queue.push({ city, pillar, topic: pillar.topic(city.id) });
  }
}

console.log(`\n${'='.repeat(60)}`);
console.log(`→ Lote Claude local: ${queue.length} artículo(s)`);
console.log(`${'='.repeat(60)}\n`);

const results = [];

for (let i = 0; i < queue.length; i++) {
  const { city, pillar, topic } = queue[i];
  console.log(`\n[${i + 1}/${queue.length}] ${pillar.label} · ${city.label} — «${topic}»\n`);

  const result = spawnSync('node', ['scripts/blog-generate.mjs'], {
    env: {
      ...process.env,
      BLOG_MARKET: 'mx',
      BLOG_TOPIC: topic,
      BLOG_CITY: city.id,
    },
    cwd: ROOT,
    stdio: 'inherit',
  });

  results.push({ city: city.id, pillar: pillar.id, topic, ok: result.status === 0 });

  if (result.status !== 0) {
    console.error(`✗ Falló: ${pillar.label} · ${city.label}`);
    process.exit(result.status ?? 1);
  }

  if (i < queue.length - 1) {
    console.log(`\n… pausa ${DELAY_MS / 1000}s\n`);
    await sleep(DELAY_MS);
  }
}

console.log(`\n${'='.repeat(60)}`);
console.log('✓ Lote Claude completado:');
for (const r of results) {
  console.log(`  · ${r.pillar} / ${r.city}: ${r.ok ? 'OK' : 'ERROR'} («${r.topic}»)`);
}
console.log(`${'='.repeat(60)}\n`);
