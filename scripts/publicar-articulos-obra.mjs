#!/usr/bin/env node
/**
 * Publica los articulos escritos a mano de gh-articulos-obra.mjs usando la
 * plantilla del sitio (blog/_template.html), para que salgan identicos en
 * estructura a los que genera la IA.
 *
 * Ademas: mete su tarjeta en /blog/ y sus URLs en el sitemap.
 *
 * Uso:
 *   node scripts/publicar-articulos-obra.mjs           # solo reporta
 *   node scripts/publicar-articulos-obra.mjs --aplicar
 */
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ARTICULOS_OBRA } from './gh-articulos-obra.mjs';
import { armarTitle, armarH1, armarDescription } from './gh-tipografia.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://ghspecialist.com';
const APLICAR = process.argv.includes('--aplicar');
const HOY = new Date().toISOString().slice(0, 10);
const HERO = 'hero-torreon.webp';

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function fechaLarga(iso) {
  const [a, m, d] = iso.split('-').map(Number);
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
                 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  return `${d} de ${meses[m - 1]} de ${a}`;
}

function fechaCorta(iso) {
  const [a, m, d] = iso.split('-').map(Number);
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${d} ${meses[m - 1]} ${a}`;
}

const plantilla = await readFile(join(ROOT, 'blog', '_template.html'), 'utf8');

const generados = [];
for (const art of ARTICULOS_OBRA) {
  // Mismas reglas de titulares que el resto del sitio.
  const title = armarTitle(art.title);
  const h1 = armarH1(art.h1 || art.title);
  const description = armarDescription(art.description);

  const relacionadosHtml = (art.relacionados || [])
    .map((r) => `      <a href="${r.slug}" class="related-item"><strong>${esc(r.titulo)}</strong><span>${esc(r.desc)}</span></a>`)
    .join('\n');

  let html = plantilla
    .replaceAll('{{SLUG}}', art.slug)
    .replaceAll('{{TITLE}}', esc(title))
    .replaceAll('{{H1}}', esc(h1))
    .replaceAll('{{SCHEMA_HEADLINE}}', esc(h1))
    .replaceAll('{{BREADCRUMB_TITLE}}', esc(h1))
    .replaceAll('{{DESCRIPTION}}', esc(description))
    .replaceAll('{{OG_TITLE}}', esc(art.ogTitle || h1))
    .replaceAll('{{OG_DESCRIPTION}}', esc(art.ogDescription || description))
    .replaceAll('{{OG_IMAGE}}', `${SITE}/${HERO}`)
    .replaceAll('{{DATE_PUBLISHED}}', HOY)
    .replaceAll('{{DATE_MODIFIED}}', HOY)
    .replaceAll('{{DATE_DISPLAY}}', fechaLarga(HOY))
    .replaceAll('{{READ_TIME}}', String(art.readTime || 5))
    .replaceAll('{{CATEGORY_LABEL}}', esc(art.categoria))
    .replaceAll('{{CTA_TITLE}}', '¿Te falta gente en obra y ya tienes candidatos parados?')
    .replaceAll(
      '{{CTA_TEXT}}',
      'Te reviso el embudo de reclutamiento y te digo cuántos candidatos calificados llevan más de una semana sin que nadie les llame. Sin costo.',
    );

  // El title de la plantilla trae " | GH Specialist" pegado; ya no se usa
  // marca en el title (se come 16 de los ~60 caracteres visibles).
  html = html.replace(/<title>([^<]*) \| GH Specialist<\/title>/, '<title>$1</title>');

  html = html.replace(
    /  <!-- CONTENIDO DEL ARTÍCULO AQUÍ -->/,
    art.contenido.trim(),
  );
  html = html.replace(
    /      <!-- Añadir 2-3 related-item con href, strong \(título\), span \(descripción corta\) -->/,
    relacionadosHtml,
  );

  const quedan = html.match(/\{\{[A-Z_]+\}\}/g);
  if (quedan) {
    console.error(`✗ ${art.slug}: quedaron placeholders sin llenar: ${[...new Set(quedan)].join(', ')}`);
    process.exit(1);
  }

  generados.push({ art, html, title, h1, description });
}

console.log(`\n${'='.repeat(70)}`);
console.log(APLICAR ? 'PUBLICANDO ARTICULOS DE OBRA' : 'REPORTE (dry-run, no se escribe nada)');
console.log('='.repeat(70));
for (const g of generados) {
  const existe = existsSync(join(ROOT, 'blog', `${g.art.slug}.html`));
  console.log(`\n■ ${g.art.slug}.html ${existe ? '(YA EXISTE, se sobrescribe)' : '(nuevo)'}`);
  console.log(`   title (${g.title.length}): ${g.title}`);
  console.log(`   h1          : ${g.h1}`);
  console.log(`   description (${g.description.length}): ${g.description.slice(0, 80)}…`);
  console.log(`   palabras    : ${g.art.contenido.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length}`);
}

if (!APLICAR) {
  console.log('\nDry-run. Para publicarlos:');
  console.log('  node scripts/publicar-articulos-obra.mjs --aplicar\n');
  process.exit(0);
}

for (const g of generados) {
  await writeFile(join(ROOT, 'blog', `${g.art.slug}.html`), g.html, 'utf8');
}
console.log(`\n✓ ${generados.length} articulos escritos en blog/`);

// --- Tarjetas en el indice del blog ---
const rutaIndice = join(ROOT, 'blog', 'index.html');
let indice = await readFile(rutaIndice, 'utf8');
let insertadas = 0;
for (const g of generados) {
  if (indice.includes(`href="${g.art.slug}.html"`)) continue;
  const tarjeta = `
    <a href="${g.art.slug}.html" class="card">
      <div class="card-img" style="background-image:url('/${HERO}')"><span class="card-city">México</span></div>
      <div class="card-body">
        <span class="card-tag">${esc(g.art.categoria)}</span>
        <h2>${esc(g.h1)}</h2>
        <p>${esc(g.art.ogDescription || g.description)}</p>
        <div class="card-meta">
          <span>${fechaCorta(HOY)} · ${g.art.readTime || 5} min</span>
          <span class="card-read">Leer artículo →</span>
        </div>
      </div>
    </a>`;
  // Se mete arriba de la primera tarjeta, que es lo mas reciente.
  const posicion = indice.indexOf('<a href="');
  const anclaGrid = indice.indexOf('class="card"');
  if (anclaGrid === -1 || posicion === -1) {
    console.warn('⚠ no se encontro donde meter la tarjeta en blog/index.html');
    break;
  }
  const inicioTarjeta = indice.lastIndexOf('<a href="', anclaGrid);
  indice = indice.slice(0, inicioTarjeta) + tarjeta.trim() + '\n    ' + indice.slice(inicioTarjeta);
  insertadas++;
}
await writeFile(rutaIndice, indice, 'utf8');
console.log(`✓ ${insertadas} tarjetas insertadas en blog/index.html`);

// --- Sitemap ---
const rutaSitemap = join(ROOT, 'sitemap.xml');
let sitemap = await readFile(rutaSitemap, 'utf8');
let agregadas = 0;
for (const g of generados) {
  const loc = `${SITE}/blog/${g.art.slug}.html`;
  if (sitemap.includes(`<loc>${loc}</loc>`)) continue;
  const entrada = `  <url><loc>${loc}</loc><lastmod>${HOY}</lastmod><priority>0.8</priority></url>\n`;
  sitemap = sitemap.replace('</urlset>', entrada + '</urlset>');
  agregadas++;
}
await writeFile(rutaSitemap, sitemap, 'utf8');
console.log(`✓ ${agregadas} URLs agregadas al sitemap`);
console.log('\nListo. Revisa con git diff antes de publicar.\n');
