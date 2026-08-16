#!/usr/bin/env node
/**
 * Arregla title, h1, description y og de los articulos ya publicados.
 *
 * Que arregla:
 *  - Siglas y nombres propios: "Seo con IA cdmx" -> "SEO con IA CDMX",
 *    "Whats app" -> "WhatsApp", "mexico" -> "México".
 *  - Acentos que la IA se come: capacitacion, automatizacion, atencion...
 *  - Titles de mas de 60 caracteres, que Google corta a media palabra. Se
 *    quita " | GH Specialist": son 16 caracteres de los ~60 visibles y a un
 *    articulo de blog no le suman.
 *  - H1 con pipes y fecha ("Tema | guía agosto 2026"). El title es para
 *    Google y el h1 para quien lee; el h1 se queda con el tema y ya.
 *  - Descriptions de mas de 160 caracteres.
 *
 * NO toca el slug ni la URL ni el canonical: cambiar URLs tira lo que ya
 * tengan ganado. Solo cambia lo que se lee.
 *
 * Uso:
 *   node scripts/arreglar-titulos-seo.mjs           # solo reporta
 *   node scripts/arreglar-titulos-seo.mjs --aplicar # escribe
 */
import { readFile, writeFile } from 'node:fs/promises';
import { readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  armarTitle,
  armarH1,
  armarDescription,
  normalizarTexto,
  MAX_TITLE,
  MAX_DESC,
} from './gh-tipografia.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const APLICAR = process.argv.includes('--aplicar');

function escaparAtributo(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function desescapar(s) {
  return String(s)
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

const articulos = readdirSync(join(ROOT, 'blog')).filter(
  (f) => f.endsWith('.html') && f !== 'index.html' && f !== '_template.html',
);

let tocados = 0;
const cambios = { title: 0, h1: 0, desc: 0, og: 0 };
const muestra = [];
const siguenLargos = [];

for (const archivo of articulos) {
  const ruta = join(ROOT, 'blog', archivo);
  let html = await readFile(ruta, 'utf8');
  const original = html;

  const titleViejo = desescapar(html.match(/<title>([^<]*)<\/title>/i)?.[1] || '');
  if (!titleViejo) continue;

  const titleNuevo = armarTitle(titleViejo);
  const h1Nuevo = armarH1(titleViejo);

  if (titleNuevo !== titleViejo) {
    html = html.replace(/<title>[^<]*<\/title>/i, `<title>${escaparAtributo(titleNuevo)}</title>`);
    cambios.title++;
  }
  // No se truncan: se reportan para reescribirlos a mano, que es lo unico
  // que de verdad los arregla.
  if (titleNuevo.length > MAX_TITLE) {
    siguenLargos.push({ archivo, title: titleNuevo });
  }

  // Solo el primer h1, que es el titular del articulo.
  const h1Match = html.match(/(<h1[^>]*>)([\s\S]*?)(<\/h1>)/i);
  if (h1Match) {
    const h1Viejo = desescapar(h1Match[2].replace(/<[^>]*>/g, '').trim());
    if (h1Viejo && h1Nuevo !== h1Viejo) {
      html = html.replace(
        /(<h1[^>]*>)([\s\S]*?)(<\/h1>)/i,
        `$1${escaparAtributo(h1Nuevo)}$3`,
      );
      cambios.h1++;
    }
  }

  const descVieja = desescapar(
    html.match(/<meta name="description" content="([^"]*)"/i)?.[1] || '',
  );
  if (descVieja) {
    const descNueva = armarDescription(descVieja);
    if (descNueva !== descVieja) {
      html = html.replace(
        /<meta name="description" content="[^"]*"/i,
        `<meta name="description" content="${escaparAtributo(descNueva)}"`,
      );
      cambios.desc++;
    }
  }

  // og:title y og:description acompañan al title, no se dejan atras.
  const ogT = desescapar(html.match(/<meta property="og:title" content="([^"]*)"/i)?.[1] || '');
  if (ogT) {
    const ogTNuevo = normalizarTexto(ogT).replace(/\s*\|\s*GH Specialist\s*$/i, '');
    if (ogTNuevo !== ogT) {
      html = html.replace(
        /<meta property="og:title" content="[^"]*"/i,
        `<meta property="og:title" content="${escaparAtributo(ogTNuevo)}"`,
      );
      cambios.og++;
    }
  }
  const ogD = desescapar(
    html.match(/<meta property="og:description" content="([^"]*)"/i)?.[1] || '',
  );
  if (ogD) {
    const ogDNuevo = normalizarTexto(ogD);
    if (ogDNuevo !== ogD) {
      html = html.replace(
        /<meta property="og:description" content="[^"]*"/i,
        `<meta property="og:description" content="${escaparAtributo(ogDNuevo)}"`,
      );
    }
  }

  // El headline del schema tiene que decir lo mismo que el h1.
  html = html.replace(/("headline"\s*:\s*")((?:[^"\\]|\\.)*)(")/i, (m, a, _v, c) => {
    return `${a}${h1Nuevo.replace(/"/g, '\\"')}${c}`;
  });

  if (html !== original) {
    tocados++;
    if (muestra.length < 6 && titleNuevo !== titleViejo) {
      muestra.push({ archivo, titleViejo, titleNuevo, h1Nuevo });
    }
    if (APLICAR) await writeFile(ruta, html, 'utf8');
  }
}

console.log(`\n${'='.repeat(70)}`);
console.log(APLICAR ? 'TITULOS ARREGLADOS' : 'REPORTE (dry-run, no se escribe nada)');
console.log('='.repeat(70));
for (const m of muestra) {
  console.log(`\n■ ${m.archivo}`);
  console.log(`   title antes  (${m.titleViejo.length}): ${m.titleViejo}`);
  console.log(`   title ahora  (${m.titleNuevo.length}): ${m.titleNuevo}`);
  console.log(`   h1    ahora  : ${m.h1Nuevo}`);
}
console.log(`\n${'-'.repeat(70)}`);
console.log(`Articulos revisados: ${articulos.length}`);
console.log(`Articulos con cambios: ${tocados}`);
console.log(`  titles reescritos: ${cambios.title}   (limite ${MAX_TITLE})`);
console.log(`  h1 limpiados: ${cambios.h1}`);
console.log(`  descriptions acortadas: ${cambios.desc}   (limite ${MAX_DESC})`);
console.log(`  og:title ajustados: ${cambios.og}`);

if (siguenLargos.length) {
  console.log(`\n${'-'.repeat(70)}`);
  console.log(`PARA REESCRIBIR A MANO: ${siguenLargos.length} titles pasan de ${MAX_TITLE} caracteres`);
  console.log('Google va a recortarlos al mostrarlos. No se truncan aqui porque');
  console.log('cortarlos solo les quita informacion; hay que acortarlos escribiendo.');
  for (const t of siguenLargos) {
    console.log(`  (${t.title.length}) ${t.title}`);
    console.log(`        ${t.archivo}`);
  }
}

if (!APLICAR) {
  console.log('\nEsto fue un dry-run. Para aplicarlo:');
  console.log('  node scripts/arreglar-titulos-seo.mjs --aplicar\n');
}
