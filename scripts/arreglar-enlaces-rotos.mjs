#!/usr/bin/env node
/**
 * Arregla enlaces internos que no llevan a ningun lado.
 *
 * De donde salen: la IA que escribe los articulos inventa enlaces. A veces le
 * pega al slug pero le falta el .html, a veces enlaza un servicio como si
 * viviera en la raiz del blog, y a veces se inventa un articulo que no existe.
 * fixInternalBlogLinks() en el generador solo cubre el primer caso y a medias.
 *
 * Que hace, por orden de confianza:
 *  1. Le pone .html al que existe con .html.
 *  2. Manda los servicios a ../servicios/ (los enlazaba desde la raiz).
 *  3. Corrige ../articulos/ -> ../blog/ (esa carpeta nunca existio).
 *  4. Lo que apunta a un articulo que NO existe se convierte en texto plano:
 *     se queda la frase y se quita el enlace. Un enlace roto le dice a Google
 *     que el sitio esta abandonado; una frase sin enlace no le dice nada.
 *
 * Uso:
 *   node scripts/arreglar-enlaces-rotos.mjs           # solo reporta
 *   node scripts/arreglar-enlaces-rotos.mjs --aplicar
 */
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const APLICAR = process.argv.includes('--aplicar');

const SERVICIOS = new Set(
  existsSync(join(ROOT, 'servicios'))
    ? readdirSync(join(ROOT, 'servicios')).filter((f) => f.endsWith('.html'))
    : [],
);

function htmlFiles(dir, acc = []) {
  for (const f of readdirSync(dir)) {
    if (['.git', 'node_modules', '.github'].includes(f)) continue;
    const p = join(dir, f);
    if (statSync(p).isDirectory()) htmlFiles(p, acc);
    else if (f.endsWith('.html')) acc.push(p);
  }
  return acc;
}

function existeDestino(desdeArchivo, url) {
  const limpia = url.split('#')[0].split('?')[0];
  if (!limpia) return true;
  let d = limpia.startsWith('/')
    ? resolve(ROOT, '.' + limpia)
    : resolve(dirname(desdeArchivo), limpia);
  if (!existsSync(d)) return false;
  return statSync(d).isDirectory() ? existsSync(join(d, 'index.html')) : true;
}

/** Devuelve la URL corregida, o null si no hay a donde apuntar. */
function corregir(archivo, url) {
  const base = url.split('#')[0].split('?')[0];
  const nombre = base.split('/').pop();

  // 2) servicio enlazado como si viviera en la raiz o en el blog
  if (SERVICIOS.has(nombre)) {
    const destino = join(ROOT, 'servicios', nombre);
    const rel = relative(dirname(archivo), destino).split('\\').join('/');
    if (existeDestino(archivo, rel)) return rel;
  }

  // 3) ../articulos/ nunca existio; el blog vive en ../blog/
  if (base.includes('/articulos/')) {
    const cand = base.replace('/articulos/', '/blog/');
    if (existeDestino(archivo, cand)) return cand;
  }

  // 1) le falta el .html
  if (!/\.[a-z0-9]{2,4}$/i.test(base)) {
    for (const cand of [base + '.html', base.replace(/\/$/, '') + '.html']) {
      if (existeDestino(archivo, cand)) return cand;
    }
    // el slug puede existir pero colgado del blog
    const enBlog = join(ROOT, 'blog', nombre + '.html');
    if (existsSync(enBlog)) {
      return relative(dirname(archivo), enBlog).split('\\').join('/');
    }
  }

  // el mismo nombre pero en el blog (enlaces relativos mal armados)
  if (nombre.endsWith('.html')) {
    const enBlog = join(ROOT, 'blog', nombre);
    if (existsSync(enBlog) && resolve(dirname(archivo), base) !== enBlog) {
      return relative(dirname(archivo), enBlog).split('\\').join('/');
    }
  }

  return null;
}

const archivos = htmlFiles(ROOT).filter((f) => !f.includes('_template'));
let corregidos = 0;
let desenlazados = 0;
const tocados = new Set();
const muestraFix = [];
const muestraQuita = [];

for (const archivo of archivos) {
  // Los backups no se tocan: existen justamente para quedarse como estaban.
  if (/index-backup|\.bak\.html$/.test(archivo)) continue;

  let html = await readFile(archivo, 'utf8');
  const original = html;

  // Sacar los <script> antes de tocar nada. Dentro de un script hay <a> que
  // son cadenas de JavaScript ("...href=\"' + BOOKING_URL + '\"..."), y
  // reescribirlos rompe el codigo. Se guardan aparte y se reponen al final.
  // El marcador va como comentario HTML y sin espacios: con ` SCRIPT0 `,
  // dos scripts pegados compartian el espacio de en medio, el primer
  // reemplazo se lo comia y el segundo ya no casaba al reponerlo.
  const scripts = [];
  html = html.replace(/<script\b[\s\S]*?<\/script>/gi, (s) => {
    scripts.push(s);
    return `<!--GHSCRIPT${scripts.length - 1}-->`;
  });

  html = html.replace(/<a\b([^>]*?)href="([^"]+)"([^>]*)>([\s\S]*?)<\/a>/gi, (todo, antes, url, despues, texto) => {
    if (/^(https?:|mailto:|tel:|#|data:|javascript:)/.test(url)) return todo;
    if (existeDestino(archivo, url)) return todo;

    const arreglada = corregir(archivo, url);
    if (arreglada) {
      corregidos++;
      if (muestraFix.length < 8) muestraFix.push(`${url}  ->  ${arreglada}`);
      return `<a${antes}href="${arreglada}"${despues}>${texto}</a>`;
    }
    // Sin destino: se queda el texto, se va el enlace.
    desenlazados++;
    if (muestraQuita.length < 8) muestraQuita.push(`${url}  (en ${relative(ROOT, archivo)})`);
    return texto;
  });

  // Reponer los <script> tal cual estaban.
  html = html.replace(/<!--GHSCRIPT(\d+)-->/g, (_m, i) => scripts[Number(i)]);

  if (scripts.some((s) => !html.includes(s))) {
    console.error(`✗ ${relative(ROOT, archivo)}: no se pudieron reponer los <script>, se deja sin tocar`);
    continue;
  }

  if (html !== original) {
    tocados.add(archivo);
    if (APLICAR) await writeFile(archivo, html, 'utf8');
  }
}

console.log(`\n${'='.repeat(70)}`);
console.log(APLICAR ? 'ENLACES ARREGLADOS' : 'REPORTE (dry-run, no se escribe nada)');
console.log('='.repeat(70));
console.log(`\nPaginas revisadas: ${archivos.length}`);
console.log(`Paginas con cambios: ${tocados.size}`);
console.log(`  enlaces redirigidos a su destino real: ${corregidos}`);
console.log(`  enlaces sin destino, convertidos a texto: ${desenlazados}`);
if (muestraFix.length) {
  console.log('\nEjemplos de redireccion:');
  muestraFix.forEach((m) => console.log('  ' + m));
}
if (muestraQuita.length) {
  console.log('\nEjemplos de enlace quitado (el articulo no existe):');
  muestraQuita.forEach((m) => console.log('  ' + m));
}
if (!APLICAR) console.log('\nPara aplicarlo:\n  node scripts/arreglar-enlaces-rotos.mjs --aplicar\n');
