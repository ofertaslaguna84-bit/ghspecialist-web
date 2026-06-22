/**
 * Carga API keys de IA desde Adestajo (.env.local) si no están en process.env.
 * Misma fuente que usa el panel/blog de GH vía GitHub Actions secrets.
 */
import { readFile } from 'node:fs/promises';

const ADESTAJO = '/Users/pedro/Projects/adestajo';

export async function loadAiEnv() {
  for (const file of ['.env.local', '.env.vercel.local']) {
    try {
      const raw = await readFile(`${ADESTAJO}/${file}`, 'utf8');
      for (const line of raw.split('\n')) {
        const m = line.match(/^([A-Z0-9_]+)=("([^"]*)"|([^\s#]+))/);
        if (!m) continue;
        const key = m[1];
        const val = (m[3] ?? m[4] ?? '').trim();
        if (val && !process.env[key]) process.env[key] = val;
      }
    } catch {
      /* ignore */
    }
  }
}
