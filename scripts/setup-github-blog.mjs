#!/usr/bin/env node
/**
 * Configura todo el blog one-click (secrets GitHub + token en Vercel Adestajo + push).
 * Uso: GITHUB_TOKEN=ghp_... node scripts/setup-github-blog.mjs
 */
import { readFile } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const OWNER = 'ofertaslaguna84-bit';
const REPO = 'ghspecialist-web';
const BLOG_SECRET = 'Grupo84p';
const ADESTAJO_DIR = '/Users/pedro/Projects/adestajo';

const GITHUB_TOKEN = (process.env.GITHUB_TOKEN || '').trim();
if (!GITHUB_TOKEN) {
  console.error('Falta GITHUB_TOKEN (PAT con scopes repo + workflow)');
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${GITHUB_TOKEN}`,
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
};

async function gh(path, opts = {}) {
  const res = await fetch(`https://api.github.com${path}`, { ...opts, headers: { ...headers, ...opts.headers } });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  if (!res.ok) throw new Error(`${path} → ${res.status}: ${(data.message || text).slice(0, 200)}`);
  return data;
}

async function readAdestajoEnv() {
  const envPath = `${ADESTAJO_DIR}/.env.vercel.local`;
  const raw = await readFile(envPath, 'utf8');
  const get = (key) => {
    const m = raw.match(new RegExp(`${key}="([^"]+)"`));
    return m ? m[1] : '';
  };
  return {
    anthropic: get('ANTHROPIC_API_KEY'),
    gemini: get('GEMINI_API_KEY') || (await readFile(`${ADESTAJO_DIR}/.env.local`, 'utf8').then((r) => r.match(/GEMINI_API_KEY="([^"]+)"/)?.[1] || '').catch(() => '')),
    openai: get('OPENAI_API_KEY') || (await readFile(`${ADESTAJO_DIR}/.env.local`, 'utf8').then((r) => r.match(/OPENAI_API_KEY="([^"]+)"/)?.[1] || '').catch(() => '')),
  };
}

async function setSecret(name, value) {
  const sodium = require('libsodium-wrappers');
  await sodium.ready;
  const { key, key_id } = await gh(`/repos/${OWNER}/${REPO}/actions/secrets/public-key`);
  const encryptedBytes = sodium.crypto_box_seal(Buffer.from(value), Buffer.from(key, 'base64'));
  await gh(`/repos/${OWNER}/${REPO}/actions/secrets/${name}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ encrypted_value: Buffer.from(encryptedBytes).toString('base64'), key_id }),
  });
  console.log(`✓ Secret GitHub: ${name}`);
}

function vercelEnvAdd(name, value) {
  for (const env of ['production', 'preview', 'development']) {
    try {
      execSync(`printf '%s' ${JSON.stringify(value)} | vercel env add ${name} ${env} --force`, {
        cwd: ADESTAJO_DIR,
        stdio: 'pipe',
        env: { ...process.env, VERCEL_TOKEN: process.env.VERCEL_TOKEN },
      });
      console.log(`✓ Vercel env ${name} (${env})`);
    } catch (e) {
      console.warn(`  Vercel ${name} ${env}:`, (e.stderr || e.message || '').toString().slice(0, 120));
    }
  }
}

async function main() {
  const user = await gh('/user');
  console.log(`✓ GitHub: ${user.login}`);

  const keys = await readAdestajoEnv();
  if (keys.anthropic) await setSecret('ANTHROPIC_API_KEY', keys.anthropic);
  if (keys.gemini) await setSecret('GEMINI_API_KEY', keys.gemini);
  if (keys.openai) await setSecret('OPENAI_API_KEY', keys.openai);
  if (!keys.gemini && !keys.openai && !keys.anthropic) {
    throw new Error('No hay API keys de IA en Adestajo');
  }
  await setSecret('BLOG_GENERATE_SECRET', BLOG_SECRET);

  vercelEnvAdd('GHSPECIALIST_GITHUB_TOKEN', GITHUB_TOKEN);
  vercelEnvAdd('GHSPECIALIST_BLOG_SECRET', BLOG_SECRET);

  execSync(`git push https://x-access-token:${GITHUB_TOKEN}@github.com/${OWNER}/${REPO}.git main`, {
    cwd: ROOT,
    stdio: 'inherit',
  });
  console.log('✓ Push ghspecialist-web');

  execSync('npx vercel --prod --yes', { cwd: ADESTAJO_DIR, stdio: 'inherit' });
  console.log('\n✅ Listo → https://ghspecialist.com/panel/ → Generar artículo');
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
