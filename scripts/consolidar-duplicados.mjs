#!/usr/bin/env node
/**
 * Consolida articulos duplicados del blog.
 *
 * Historia: el lote de ciudades se saltaba el detector de duplicados y cada
 * corrida creaba una copia (-v2, -v3...) con el MISMO titulo y h1, cada una
 * con canonical apuntandose a si misma. Ocho copias de "seo con ia cdmx"
 * peleandose la misma keyword: Google reparte la fuerza y no rankea ninguna.
 *
 * Que hace: agrupa por tema, elige una version ganadora, y en las demas pone
 * el canonical apuntando a la ganadora. NO borra archivos -- una URL viva con
 * canonical conserva los enlaces que ya tenga y le dice a Google cual cuenta.
 * Ademas saca a las perdedoras del sitemap para no pedir que se indexen.
 *
 * Uso:
 *   node scripts/consolidar-duplicados.mjs           # solo reporta (dry-run)
 *   node scripts/consolidar-duplicados.mjs --aplicar # escribe los cambios
 */
import { readFile, writeFile } from 'node:fs/promises';
import { readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://ghspecialist.com';
const APLICAR = process.argv.includes('--aplicar');

const MESES_ES =
  'enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre';

function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Misma normalizacion que usa blog-generate.mjs para detectar el tema. */
function temaKey(titulo) {
  let k = slugify(titulo || '');
  k = k.replace(/-gh-specialist.*$/, '');
  k = k.replace(new RegExp(`-(${MESES_ES})(-\\d{4})?`, 'g'), '');
  k = k.replace(/-\d{4}/g, '');
  k = k.replace(/-v\d+$/, '');
  k = k.replace(
    /-(guia|guias|domine-google|domina-google|esencial|completa|completo|actualizada|actualizado|paso-a-paso)/g,
    '',
  );
  k = k.replace(/-mexico.*$/, '');
  return k.replace(/-+/g, '-').replace(/^-|-$/g, '');
}

function contarPalabras(html) {
  const cuerpo = html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<[^>]*>/g, ' ');
  return cuerpo.split(/\s+/).filter(Boolean).length;
}

const articulos = readdirSync(join(ROOT, 'blog')).filter(
  (f) => f.endsWith('.html') && f !== 'index.html',
);

const porTema = new Map();
for (const archivo of articulos) {
  const html = await readFile(join(ROOT, 'blog', archivo), 'utf8');
  const titulo = html.match(/<title>([^<]*)<\/title>/i)?.[1] || '';
  const modificado = html.match(/"dateModified"\s*:\s*"([0-9-]{10})"/)?.[1] || '0000-00-00';
  const publicado = html.match(/"datePublished"\s*:\s*"([0-9-]{10})"/)?.[1] || modificado;
  const clave = temaKey(titulo);
  if (!clave) continue;
  if (!porTema.has(clave)) porTema.set(clave, []);
  porTema.get(clave).push({ archivo, titulo, modificado, publicado, palabras: contarPalabras(html) });
}

const grupos = [...porTema.entries()]
  .filter(([, v]) => v.length > 1)
  .sort((a, b) => b[1].length - a[1].length);

if (!grupos.length) {
  console.log('No hay duplicados. Nada que consolidar.');
  process.exit(0);
}

// Gana la version mas reciente; si empatan, la que tenga mas contenido.
// La idea es conservar la que Google ya tiene mas fresca y mejor servida.
const perdedoras = new Map(); // archivo -> archivo ganador
let totalSobrando = 0;

console.log(`\n${'='.repeat(70)}`);
console.log(APLICAR ? 'CONSOLIDANDO DUPLICADOS' : 'REPORTE (dry-run, no se escribe nada)');
console.log('='.repeat(70));

for (const [clave, versiones] of grupos) {
  const ordenadas = [...versiones].sort(
    (a, b) => b.modificado.localeCompare(a.modificado) || b.palabras - a.palabras,
  );
  const [gana, ...pierden] = ordenadas;
  totalSobrando += pierden.length;

  console.log(`\n■ ${clave}  (${versiones.length} versiones)`);
  console.log(`   GANA    ${gana.archivo}  [${gana.modificado}, ${gana.palabras} palabras]`);
  for (const p of pierden) {
    console.log(`   apunta  ${p.archivo}  [${p.modificado}, ${p.palabras} palabras]`);
    perdedoras.set(p.archivo, gana.archivo);
  }
}

console.log(`\n${'-'.repeat(70)}`);
console.log(`Temas con duplicados: ${grupos.length}`);
console.log(`Paginas que pasan a apuntar a otra: ${totalSobrando}`);
console.log(`Paginas que quedan como canonicas: ${grupos.length}`);

if (!APLICAR) {
  console.log('\nEsto fue un dry-run. Para aplicarlo:');
  console.log('  node scripts/consolidar-duplicados.mjs --aplicar\n');
  process.exit(0);
}

// --- Aplicar: canonical de la perdedora -> ganadora ---
let tocados = 0;
for (const [archivo, ganadora] of perdedoras) {
  const ruta = join(ROOT, 'blog', archivo);
  let html = await readFile(ruta, 'utf8');
  const destino = `${SITE}/blog/${ganadora}`;

  const antes = html;
  html = html.replace(
    /<link rel="canonical" href="[^"]*">/i,
    `<link rel="canonical" href="${destino}">`,
  );
  // og:url tambien debe apuntar a la canonica, si no manda señal contraria.
  html = html.replace(
    /<meta property="og:url" content="[^"]*">/i,
    `<meta property="og:url" content="${destino}">`,
  );
  // El @id del schema es otra señal de identidad de la pagina.
  html = html.replace(
    /("mainEntityOfPage"\s*:\s*\{[^}]*"@id"\s*:\s*")[^"]*(")/,
    `$1${destino}$2`,
  );

  if (html !== antes) {
    await writeFile(ruta, html, 'utf8');
    tocados++;
  } else {
    console.warn(`  ⚠ sin cambios en ${archivo} (no se encontro el canonical)`);
  }
}
console.log(`\n✓ ${tocados} archivos actualizados con canonical hacia su version buena`);

// --- Sacar las perdedoras del sitemap ---
const rutaSitemap = join(ROOT, 'sitemap.xml');
try {
  const sitemap = await readFile(rutaSitemap, 'utf8');
  const bloques = sitemap.match(/<url>[\s\S]*?<\/url>/g) || [];
  let quitados = 0;
  let nuevo = sitemap;
  for (const bloque of bloques) {
    const loc = bloque.match(/<loc>([^<]*)<\/loc>/)?.[1] || '';
    const nombre = loc.split('/blog/')[1];
    if (nombre && perdedoras.has(nombre)) {
      nuevo = nuevo.replace(bloque, '');
      quitados++;
    }
  }
  nuevo = nuevo.replace(/\n{3,}/g, '\n');
  await writeFile(rutaSitemap, nuevo, 'utf8');
  console.log(`✓ ${quitados} URLs duplicadas fuera del sitemap`);
} catch (e) {
  console.warn('⚠ no se pudo tocar el sitemap:', e.message);
}

console.log('\nListo. Revisa con git diff antes de publicar.\n');
