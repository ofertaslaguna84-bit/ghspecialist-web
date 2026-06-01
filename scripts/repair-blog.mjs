#!/usr/bin/env node
/**
 * Repara rutas de imágenes, enlaces internos y footer del blog.
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const BLOG = join(ROOT, 'blog');

function fixInternalLinks(html) {
  return html.replace(/href="([a-z0-9][a-z0-9-]*)"/gi, (match, slug) => {
    if (slug.includes('.') || slug === 'index') return match;
    return `href="${slug}.html"`;
  });
}

function fixArticleHtml(html) {
  let out = html;
  out = out.replace(/src="\.\.\/blog\/img\//g, 'src="img/');
  out = out.replace(/content="\.\.\/blog\/img\//g, 'content="img/');
  out = fixInternalLinks(out);
  return out;
}

function fixIndexHtml(html) {
  let out = html;
  out = out.replace(/url\('\.\.\/blog\/img\//g, "url('/blog/img/");
  return out;
}

const FOOTER_CSS = `    .ftr{padding:32px 32px 40px;text-align:center;font-size:13px;color:var(--ink3);line-height:1.7}
    .ftr-local{margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid var(--border)}
    .ftr-local strong{display:block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--ink);margin-bottom:8px;opacity:.65}
    .ftr-local-links{display:flex;flex-wrap:wrap;gap:8px 16px;justify-content:center}
    .ftr-local-links a{color:var(--p);font-weight:600;font-size:12px}
    .ftr-copy{font-size:13px;color:var(--ink3);margin:0}
    .ftr-copy a{color:var(--p)}`;

const FOOTER_HTML = `<footer class="ftr">
  <div class="ftr-local">
    <strong>Cobertura local</strong>
    <div class="ftr-local-links">
      <a href="../torreon/">Torreón</a>
      <a href="../chatbot-whatsapp-torreon.html">Chatbot WhatsApp Torreón</a>
      <a href="../agencia-ia-la-laguna.html">Agencia IA La Laguna</a>
      <a href="../automatizacion-gomez-palacio.html">Automatización Gómez Palacio</a>
    </div>
  </div>
  <p class="ftr-copy">© 2026 GH Specialist · <a href="https://ghspecialist.com">ghspecialist.com</a> · <a href="https://www.instagram.com/ghspecialist26/" target="_blank" rel="noopener">Instagram</a> · <a href="https://www.tiktok.com/@ghspecialist" target="_blank" rel="noopener">TikTok</a> · Pedro Luis Díaz Velázquez · +52 871 263 8082</p>
</footer>`;

async function repairIndex() {
  const path = join(BLOG, 'index.html');
  let html = await readFile(path, 'utf8');
  html = fixIndexHtml(html);
  html = html.replace(
    /\.ftr\{border-top:1px solid var\(--border\);padding:24px 32px;text-align:center;font-size:13px;color:var\(--ink\)\}/,
    FOOTER_CSS.trim()
  );
  html = html.replace(/<div class="ftr">[\s\S]*?<\/div>\s*(?=<\/body>)/, FOOTER_HTML + '\n\n');
  await writeFile(path, html, 'utf8');
  console.log('✓ blog/index.html');
}

async function main() {
  const files = await readdir(BLOG);
  let n = 0;
  for (const f of files) {
    if (!f.endsWith('.html') || f.startsWith('_') || f === 'index.html') continue;
    const path = join(BLOG, f);
    const raw = await readFile(path, 'utf8');
    const fixed = fixArticleHtml(raw);
    if (fixed !== raw) {
      await writeFile(path, fixed, 'utf8');
      n++;
    }
  }
  console.log(`✓ ${n} artículos (imágenes + enlaces)`);
  await repairIndex();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
