#!/usr/bin/env node
/**
 * Páginas noindex en rutas USA que Google aún tiene indexadas.
 * No van al sitemap; al re-rastrear, Google recibe señal explícita de salida del índice.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SITE = 'https://ghspecialist.com';
const HUB = `${SITE}/ciudades/`;

const BLOCKED_CITY_SLUGS = [
  'los-angeles', 'houston', 'miami', 'san-antonio', 'chicago', 'phoenix', 'dallas',
  'el-paso', 'san-diego', 'austin', 'las-vegas', 'orlando', 'nueva-york', 'fresno',
  'albuquerque', 'mcallen', 'sacramento', 'denver', 'san-jose', 'tampa',
];

function retiredHtml(title) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, follow">
  <link rel="canonical" href="${HUB}">
  <meta http-equiv="refresh" content="0;url=${HUB}">
  <title>${title}</title>
</head>
<body>
  <p>GH Specialist opera en México. <a href="${HUB}">Ver ciudades →</a></p>
</body>
</html>
`;
}

async function main() {
  const services = JSON.parse(await readFile(join(ROOT, 'data/seo-services.json'), 'utf8'));
  let count = 0;

  for (const city of BLOCKED_CITY_SLUGS) {
    const dir = join(ROOT, 'ciudades', city);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, 'index.html'), retiredHtml('Contenido movido — GH Specialist México'), 'utf8');
    count += 1;

    for (const svc of services) {
      const sdir = join(ROOT, 'servicios', svc.slug, city);
      await mkdir(sdir, { recursive: true });
      await writeFile(
        join(sdir, 'index.html'),
        retiredHtml(`${svc.name} — solo México | GH Specialist`),
        'utf8'
      );
      count += 1;
    }
  }

  const disallow = BLOCKED_CITY_SLUGS.flatMap((c) => [
    `Disallow: /ciudades/${c}/`,
    ...services.map((s) => `Disallow: /servicios/${s.slug}/${c}/`),
  ]).join('\n');

  const robots = `User-agent: *
Allow: /
Sitemap: ${SITE}/sitemap.xml

# Rutas USA retiradas (solo México en SEO)
${disallow}

# llms.txt — contexto para asistentes IA
# ${SITE}/llms.txt
Disallow: /drafts/
Disallow: /panel/
Disallow: /landing/
Disallow: /docs-wix/
`;

  await writeFile(join(ROOT, 'robots.txt'), robots, 'utf8');
  console.log(`✓ ${count} páginas USA retiradas (noindex) + robots.txt actualizado`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
