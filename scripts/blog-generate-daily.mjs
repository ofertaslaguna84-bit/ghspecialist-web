#!/usr/bin/env node
/**
 * Genera 1 artículo al día — mercado México.
 * Usado por el cron de GitHub Actions.
 */
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadAiEnv } from './gh-load-ai-env.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

await loadAiEnv();

console.log(`\n${'='.repeat(60)}\n→ Mercado: México (mx)\n${'='.repeat(60)}\n`);
const result = spawnSync('node', ['scripts/blog-generate.mjs'], {
  env: { ...process.env, BLOG_MARKET: 'mx' },
  cwd: ROOT,
  stdio: 'inherit',
});
if (result.status !== 0) {
  console.error('✗ Falló generación blog (mx)');
  process.exit(result.status ?? 1);
}

console.log('\n✓ Artículo generado: México');
