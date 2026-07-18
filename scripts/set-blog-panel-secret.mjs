#!/usr/bin/env node
/**
 * Sincroniza panelPassword (js/gh-site-config.js) → BLOG_GENERATE_SECRET (GitHub)
 * y GHSPECIALIST_BLOG_SECRET (Vercel / Adestajo).
 *
 * Uso:
 *   GITHUB_TOKEN=ghp_... VERCEL_TOKEN=... node scripts/set-blog-panel-secret.mjs
 */
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const OWNER = 'ofertaslaguna84-bit';
const REPO = 'ghspecialist-web';
const VERCEL_PROJECT = 'adestajo';
const VERCEL_TEAM = process.env.VERCEL_TEAM_ID || '';

const GITHUB_TOKEN = (process.env.GITHUB_TOKEN || '').trim();
const VERCEL_TOKEN = (process.env.VERCEL_TOKEN || '').trim();

async function readPanelPassword() {
  const raw = await readFile(`${ROOT}/js/gh-site-config.js`, 'utf8');
  const m = raw.match(/panelPassword:\s*'([^']*)'/);
  if (!m) throw new Error('No se encontró panelPassword en js/gh-site-config.js');
  return m[1];
}

async function gh(path, opts = {}) {
  const res = await fetch(`https://api.github.com${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(opts.headers || {}),
    },
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  if (!res.ok) throw new Error(`GitHub ${path} → ${res.status}: ${(data.message || text).slice(0, 200)}`);
  return data;
}

async function setGithubSecret(name, value) {
  const sodium = require('libsodium-wrappers');
  await sodium.ready;
  const { key, key_id } = await gh(`/repos/${OWNER}/${REPO}/actions/secrets/public-key`);
  const encryptedBytes = sodium.crypto_box_seal(Buffer.from(value), Buffer.from(key, 'base64'));
  await gh(`/repos/${OWNER}/${REPO}/actions/secrets/${name}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      encrypted_value: Buffer.from(encryptedBytes).toString('base64'),
      key_id,
    }),
  });
  console.log(`✓ GitHub secret: ${name}`);
}

async function vercel(path, opts = {}) {
  const teamQ = VERCEL_TEAM ? `?teamId=${VERCEL_TEAM}` : '';
  const url = `https://api.vercel.com${path}${teamQ}`;
  const res = await fetch(url, {
    ...opts,
    headers: {
      Authorization: `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
    },
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  if (!res.ok) throw new Error(`Vercel ${path} → ${res.status}: ${(data.error?.message || text).slice(0, 200)}`);
  return data;
}

async function findVercelProject() {
  const data = await vercel('/v9/projects');
  const projects = data.projects || [];
  const byName = projects.find((p) => p.name === VERCEL_PROJECT);
  if (byName) return byName;
  const byDomain = projects.find((p) =>
    (p.targets?.production?.alias || []).some((a) => String(a).includes('adestajo.com.mx'))
  );
  if (byDomain) return byDomain;
  throw new Error(`Proyecto Vercel "${VERCEL_PROJECT}" no encontrado (${projects.length} proyectos)`);
}

async function upsertVercelEnv(projectId, name, value) {
  const { envs = [] } = await vercel(`/v9/projects/${projectId}/env`);
  const existing = envs.filter((e) => e.key === name);
  for (const env of existing) {
    await vercel(`/v9/projects/${projectId}/env/${env.id}`, { method: 'DELETE' });
  }
  for (const target of ['production', 'preview', 'development']) {
    await vercel(`/v10/projects/${projectId}/env`, {
      method: 'POST',
      body: JSON.stringify({
        key: name,
        value,
        type: 'encrypted',
        target: [target],
      }),
    });
    console.log(`✓ Vercel env ${name} (${target})`);
  }
}

async function main() {
  const secret = await readPanelPassword();
  if (!secret) {
    console.log('panelPassword vacío — no hay nada que sincronizar');
    return;
  }
  console.log(`→ Sincronizando clave del panel (${secret.length} caracteres)`);

  if (GITHUB_TOKEN) {
    await setGithubSecret('BLOG_GENERATE_SECRET', secret);
  } else {
    console.warn('⚠ Sin GITHUB_TOKEN — omitiendo GitHub secret');
  }

  if (VERCEL_TOKEN) {
    const project = await findVercelProject();
    console.log(`→ Proyecto Vercel: ${project.name} (${project.id})`);
    await upsertVercelEnv(project.id, 'GHSPECIALIST_BLOG_SECRET', secret);
  } else {
    console.warn('⚠ Sin VERCEL_TOKEN — omitiendo Vercel env');
  }

  console.log('\n✅ Listo');
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
