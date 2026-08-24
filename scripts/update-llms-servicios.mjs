#!/usr/bin/env node
/**
 * Reescribe el bloque "## Servicios" de llms.txt desde data/seo-services.json,
 * con precio y plazo. Esos dos datos son lo que un buscador de IA cita cuando
 * alguien pregunta "cuánto cuesta X en México".
 * Ejecutar: node scripts/update-llms-servicios.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SITE = 'https://ghspecialist.com';
const services = JSON.parse(readFileSync(join(ROOT, 'data/seo-services.json'), 'utf8'));

const mxn = (n) => `$${Number(n).toLocaleString('es-MX')} MXN + IVA`;

const bloque = [
  '## Servicios (precio de arranque y plazo)\n\nPrecios "desde": el final depende del tamaño de la operación y de cuántos sistemas haya que conectar. Mismo precio en todas las ciudades. Diagnóstico sin costo.',
  ...services.map((s) =>
    [
      `### ${s.name}`,
      `- Página: ${SITE}/servicios/${s.file}`,
      `- Desde: ${mxn(s.price)}`,
      `- Plazo de implementación: ${s.entrega}`,
      `- Para quién: ${s.paraQuien}`,
      `- Incluye: ${s.incluye.join('; ')}`,
      `- No incluye: ${s.noIncluye.join('; ')}`,
      `- Se conecta con: ${s.integraciones.join(', ')}`,
      `- Por ciudad: ${SITE}/servicios/${s.slug}/{ciudad}/`,
    ].join('\n')
  ),
].join('\n\n');

const path = join(ROOT, 'llms.txt');
const txt = readFileSync(path, 'utf8');

// Reemplaza desde "## Servicios" hasta el siguiente encabezado de nivel 2.
const re = /^## Servicios.*?(?=^## )/ms;
if (!re.test(txt)) {
  console.error('No encontré el bloque "## Servicios" en llms.txt');
  process.exit(1);
}
writeFileSync(path, txt.replace(re, bloque + '\n\n'), 'utf8');
console.log(`✓ llms.txt — bloque de servicios actualizado (${services.length} servicios con precio y plazo)`);
