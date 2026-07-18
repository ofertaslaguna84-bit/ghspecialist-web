import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

/** Lee panelPassword de js/gh-site-config.js (fuente de verdad del panel). */
export async function readPanelPassword() {
  const raw = await readFile(`${ROOT}/js/gh-site-config.js`, 'utf8');
  const m = raw.match(/panelPassword:\s*'([^']*)'/);
  return m ? m[1] : '';
}

/** Valida secret del cliente contra GitHub Secret y/o panelPassword del repo. */
export async function assertBlogClientSecret(clientSecret) {
  const fromClient = (clientSecret || '').trim();
  const fromEnv = (process.env.BLOG_GENERATE_SECRET || '').trim();
  const fromPanel = (await readPanelPassword()).trim();

  if (!fromEnv && !fromPanel) return;

  const ok =
    (fromEnv && fromClient === fromEnv) || (fromPanel && fromClient === fromPanel);
  if (!ok) {
    throw new Error(
      'Secret inválido: la clave del panel (panelPassword) debe coincidir con BLOG_GENERATE_SECRET en GitHub Actions.'
    );
  }
}
