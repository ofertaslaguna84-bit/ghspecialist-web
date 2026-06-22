#!/usr/bin/env node
/**
 * Genera 2 artículos al día: 1 México + 1 EE.UU. (comunidad hispana).
 * Usado por el cron de GitHub Actions.
 */
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadAiEnv } from './gh-load-ai-env.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

await loadAiEnv();

const MARKETS = [
  { id: 'mx', label: 'México' },
  { id: 'usa', label: 'EE.UU. · comunidad hispana' },
];

for (const { id, label } of MARKETS) {
  console.log(`\n${'='.repeat(60)}\n→ Mercado: ${label} (${id})\n${'='.repeat(60)}\n`);
  const result = spawnSync('node', ['scripts/blog-generate.mjs'], {
    env: { ...process.env, BLOG_MARKET: id },
    cwd: ROOT,
    stdio: 'inherit',
  });
  if (result.status !== 0) {
    console.error(`✗ Falló generación blog (${id})`);
    process.exit(result.status ?? 1);
  }
}

console.log('\n✓ 2 artículos generados: México + EE.UU.');
