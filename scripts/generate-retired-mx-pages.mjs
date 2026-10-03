#!/usr/bin/env node
/**
 * Páginas de México que salieron del SEO local (3 oct 2026): se dejan como
 * redirección (noindex + canonical + refresh) para no perder lo ya posicionado.
 * - servicio×ciudad de servicios sin `porCiudad` en data/seo-services.json → página nacional del servicio
 * - servicio×ciudad y hub de las ciudades retiradas → página nacional / hub de ciudades
 * Las rutas de USA las maneja generate-us-retired-pages.mjs.
 * Ejecutar después de generate-city-pages y generate-servicio-ciudad-pages.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SITE = 'https://ghspecialist.com';

// Ciudades de México que tuvieron páginas y ya no están en data/seo-cities.json.
const CIUDADES_RETIRADAS = ['cancun', 'puebla', 'chihuahua'];

const SECURITY = `  <!-- gh-security-meta -->
  <meta name="referrer" content="strict-origin-when-cross-origin">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; frame-src https://www.youtube.com https://www.youtube-nocookie.com https://calendar.app.google https://calendar.google.com https://lookerstudio.google.com https://docs.google.com; connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://formspree.io https://ipapi.co https://ntfy.sh; base-uri 'self'; form-action 'self' https://formspree.io">`;

function stub(dest, title, texto) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
${SECURITY}
  <meta name="robots" content="noindex, follow">
  <link rel="canonical" href="${dest}">
  <meta http-equiv="refresh" content="0;url=${dest}">
  <title>${title}</title>
</head>
<body>
  <p>Esta página se movió. <a href="${dest}">${texto} →</a></p>
</body>
</html>
`;
}

async function write(rel, html) {
  const dir = join(ROOT, rel);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, 'index.html'), html, 'utf8');
}

async function main() {
  const services = JSON.parse(await readFile(join(ROOT, 'data/seo-services.json'), 'utf8'));
  const activas = JSON.parse(await readFile(join(ROOT, 'data/seo-cities.json'), 'utf8')).map((c) => c.slug);
  let n = 0;

  for (const svc of services) {
    const dest = `${SITE}/servicios/${svc.file}`;
    const html = stub(dest, `${svc.name} | GH Specialist`, `Ir a ${svc.name}`);
    for (const city of [...activas, ...CIUDADES_RETIRADAS]) {
      if (svc.porCiudad && activas.includes(city)) continue;
      const rel = `servicios/${svc.slug}/${city}`;
      // Solo se reemplaza lo que ya existió; no se crean rutas nuevas.
      if (!existsSync(join(ROOT, rel))) continue;
      await write(rel, html);
      n += 1;
    }
  }

  for (const city of CIUDADES_RETIRADAS) {
    await write(`ciudades/${city}`, stub(`${SITE}/ciudades/`, 'Ciudades | GH Specialist', 'Ver ciudades'));
    n += 1;
  }

  console.log(`✓ ${n} páginas de México convertidas en redirección`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
