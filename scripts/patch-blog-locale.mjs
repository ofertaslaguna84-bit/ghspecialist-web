#!/usr/bin/env node
/**
 * Añade gh-blog-locale.js y wrapper .gh-article-body a artículos del blog.
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const BLOG = join(ROOT, 'blog');
const SKIP = new Set(['index.html', '_template.html']);

const LOCALE_SCRIPT = '  <script src="../js/gh-blog-locale.js" defer></script>\n';

function wrapArticleBody(html) {
  if (html.includes('gh-article-body')) return html;

  const artOpen = html.indexOf('<article class="art">');
  if (artOpen === -1) return html;

  const ctaIdx = html.indexOf('<div class="cta-art">', artOpen);
  if (ctaIdx === -1) return html;

  const heroEnd = html.indexOf('</figure>', artOpen);
  const bodyStart = heroEnd !== -1 && heroEnd < ctaIdx ? heroEnd + '</figure>'.length : html.indexOf('</div>', html.indexOf('art-meta', artOpen)) + 6;

  const before = html.slice(0, bodyStart);
  const body = html.slice(bodyStart, ctaIdx);
  const after = html.slice(ctaIdx);

  if (!body.trim()) return html;

  return before + '\n  <div class="gh-article-body">' + body + '\n  </div>\n' + after;
}

function injectScript(html) {
  if (html.includes('gh-blog-locale.js')) return html;
  if (html.includes('gh-analytics.js')) {
    return html.replace(
      /<script src="\.\.\/js\/gh-analytics\.js" async><\/script>/,
      (m) => m + '\n' + LOCALE_SCRIPT.trim()
    );
  }
  return html.replace('</head>', LOCALE_SCRIPT + '</head>');
}

async function main() {
  const files = (await readdir(BLOG)).filter((f) => f.endsWith('.html') && !SKIP.has(f));
  let n = 0;
  for (const f of files) {
    const path = join(BLOG, f);
    let html = await readFile(path, 'utf8');
    const orig = html;
    html = wrapArticleBody(html);
    html = injectScript(html);
    if (html !== orig) {
      await writeFile(path, html, 'utf8');
      console.log('✓', f);
      n++;
    }
  }

  // blog index
  const indexPath = join(BLOG, 'index.html');
  let idx = await readFile(indexPath, 'utf8');
  if (!idx.includes('gh-blog-locale.js')) {
    idx = injectScript(idx);
    await writeFile(indexPath, idx, 'utf8');
    console.log('✓ index.html');
    n++;
  }

  // template
  const tplPath = join(BLOG, '_template.html');
  let tpl = await readFile(tplPath, 'utf8');
  let tplChanged = false;
  if (!tpl.includes('gh-article-body')) {
    tpl = tpl.replace(
      '  <!-- CONTENIDO DEL ARTÍCULO AQUÍ -->',
      '  <div class="gh-article-body">\n  <!-- CONTENIDO DEL ARTÍCULO AQUÍ -->\n  </div>'
    );
    tplChanged = true;
  }
  if (!tpl.includes('gh-blog-locale.js')) {
    tpl = injectScript(tpl);
    tplChanged = true;
  }
  if (tplChanged) {
    await writeFile(tplPath, tpl, 'utf8');
    console.log('✓ _template.html');
    n++;
  }

  console.log(`Listo — ${n} archivo(s) actualizados`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
