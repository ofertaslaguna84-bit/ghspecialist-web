#!/usr/bin/env node
/**
 * Genera sitemap.xml y blog/feed.xml para ghspecialist.com
 * Ejecutar: node scripts/generate-seo.mjs
 */
import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SITE = 'https://ghspecialist.com';
const BLOG_EXCLUDE = new Set(['_template.html', 'index.html']);

/** Ciudades USA retiradas del SEO — nunca deben entrar al sitemap aunque exista la carpeta. */
const BLOCKED_CITY_SLUGS = new Set([
  'los-angeles', 'houston', 'miami', 'san-antonio', 'chicago', 'phoenix', 'dallas',
  'el-paso', 'san-diego', 'austin', 'las-vegas', 'orlando', 'nueva-york', 'fresno',
  'albuquerque', 'mcallen', 'sacramento', 'denver', 'san-jose', 'tampa',
]);

const USA_BLOG_SLUG_RE =
  /(?:^|\/)(?:.*-usa(?:-|\.|$)|.*-estados-unidos|.*-dallas-texas|.*-hispana(?:-|\.|$)|.*-latinas-usa)/i;

async function loadMexicoCitySlugs() {
  const cities = JSON.parse(await readFile(join(ROOT, 'data/seo-cities.json'), 'utf8'));
  return new Set(
    cities
      .filter((c) => !c.legacyUrl && (c.country || 'MX') === 'MX' && !BLOCKED_CITY_SLUGS.has(c.slug))
      .map((c) => c.slug)
  );
}

function isBlockedCitySlug(slug) {
  return BLOCKED_CITY_SLUGS.has(slug);
}

function isNonMexicoBlog(file, html) {
  if (/data-market=["']usa["']/i.test(html)) return true;
  if (/content=["'][^"']*noindex/i.test(html)) return true;
  if (USA_BLOG_SLUG_RE.test(file)) return true;
  const title = extractTitle(html).toLowerCase();
  const desc = extractMeta(html, 'description').toLowerCase();
  if (/\bee\.?\s*uu\.?\b|estados unidos|comunidad hispana en ee\.uu|empresas latinas en usa|small business usa|dallas, texas/i.test(`${title} ${desc}`)) {
    return true;
  }
  return false;
}

const SITEMAP_URLS = [
  { path: 'index.html', loc: `${SITE}/`, priority: '1.0' },
  { path: 'blog/index.html', loc: `${SITE}/blog/`, priority: '0.9' },
  { path: 'ciudades/index.html', loc: `${SITE}/ciudades/`, priority: '0.9' },
  { path: 'servicios/index.html', loc: `${SITE}/servicios/`, priority: '0.9' },
  { path: 'torreon/index.html', loc: `${SITE}/torreon/`, priority: '0.85' },
  { path: 'chatbot-whatsapp-torreon.html', loc: `${SITE}/chatbot-whatsapp-torreon.html`, priority: '0.85' },
  { path: 'agencia-ia-la-laguna.html', loc: `${SITE}/agencia-ia-la-laguna.html`, priority: '0.85' },
  { path: 'automatizacion-gomez-palacio.html', loc: `${SITE}/automatizacion-gomez-palacio.html`, priority: '0.85' },
  { path: 'sobre-pedro.html', loc: `${SITE}/sobre-pedro.html`, priority: '0.7' },
];

function isRedirectPage(html, fileUrl) {
  if (/http-equiv=["']refresh["']/i.test(html)) return true;
  if (/content=["']noindex/i.test(html)) return true;
  const canonical = extractCanonical(html);
  return canonical && canonical !== fileUrl;
}

function formatDate(d) {
  return d.toISOString().slice(0, 10);
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function fileLastMod(filePath) {
  const s = await stat(filePath);
  return formatDate(s.mtime);
}

function extractMeta(html, name) {
  const re = new RegExp(
    `<meta\\s+(?:name|property)=["']${name}["']\\s+content=["']([^"']*)["']`,
    'i'
  );
  const m = html.match(re);
  return m ? m[1] : '';
}

function extractTitle(html) {
  const m = html.match(/<title>([^<]*)<\/title>/i);
  return m ? m[1].trim() : '';
}

function extractCanonical(html) {
  const m = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']*)["']/i);
  return m ? m[1].trim() : '';
}

function extractDatePublished(html) {
  const m = html.match(/"datePublished"\s*:\s*"([^"]+)"/);
  if (m) return m[1];
  const m2 = html.match(/property=["']article:published_time["']\s+content=["']([^"']+)["']/i);
  return m2 ? m2[1].slice(0, 10) : null;
}

function validateBlogArticle(file, html) {
  const warnings = [];
  const required = ['description', 'og:title', 'og:description', 'og:image', 'twitter:card'];
  for (const key of required) {
    const val = extractMeta(html, key);
    if (!val) warnings.push(`  ⚠ ${file}: falta meta "${key}"`);
  }
  if (!html.includes('"@type":"Article"') && !html.includes('"@type": "Article"')) {
    warnings.push(`  ⚠ ${file}: falta JSON-LD Article`);
  }
  if (!html.includes('BreadcrumbList')) {
    warnings.push(`  ⚠ ${file}: falta JSON-LD BreadcrumbList`);
  }
  return warnings;
}

async function collectBlogArticles() {
  const dir = join(ROOT, 'blog');
  const files = await readdir(dir);
  const articles = [];

  for (const f of files.filter((x) => x.endsWith('.html') && !BLOG_EXCLUDE.has(x))) {
    const full = join(dir, f);
    const html = await readFile(full, 'utf8');
    const fileUrl = `${SITE}/blog/${f}`;
    if (isRedirectPage(html, fileUrl)) continue;
    if (isNonMexicoBlog(f, html)) continue;
    const slug = f.replace(/\.html$/, '');
    articles.push({
      file: f,
      full,
      html,
      slug,
      title: extractTitle(html),
      description: extractMeta(html, 'description'),
      canonical: extractCanonical(html) || `${SITE}/blog/${f}`,
      datePublished: extractDatePublished(html),
      lastmod: await fileLastMod(full),
    });
  }

  articles.sort((a, b) => (b.datePublished || b.lastmod).localeCompare(a.datePublished || a.lastmod));
  return articles;
}

async function collectCiudades(mexicoSlugs) {
  const dir = join(ROOT, 'ciudades');
  const entries = [];
  let subdirs;
  try {
    subdirs = await readdir(dir, { withFileTypes: true });
  } catch {
    return entries;
  }
  for (const d of subdirs.filter((x) => x.isDirectory())) {
    if (!mexicoSlugs.has(d.name) || isBlockedCitySlug(d.name)) continue;
    const rel = `ciudades/${d.name}/index.html`;
    const full = join(ROOT, rel);
    try {
      entries.push({
        path: rel,
        loc: `${SITE}/ciudades/${d.name}/`,
        priority: '0.85',
        lastmod: await fileLastMod(full),
      });
    } catch {
      /* noop */
    }
  }
  return entries.sort((a, b) => a.loc.localeCompare(b.loc));
}

async function collectServicioCiudad(mexicoSlugs) {
  const entries = [];
  let services;
  let cities;
  try {
    services = JSON.parse(await readFile(join(ROOT, 'data/seo-services.json'), 'utf8'));
    cities = JSON.parse(await readFile(join(ROOT, 'data/seo-cities.json'), 'utf8')).filter(
      (c) => !c.legacyUrl && (c.country || 'MX') === 'MX' && mexicoSlugs.has(c.slug)
    );
  } catch {
    return entries;
  }
  for (const svc of services) {
    for (const city of cities) {
      const rel = `servicios/${svc.slug}/${city.slug}/index.html`;
      const full = join(ROOT, rel);
      try {
        entries.push({
          path: rel,
          loc: `${SITE}/servicios/${svc.slug}/${city.slug}/`,
          priority: '0.88',
          lastmod: await fileLastMod(full),
        });
      } catch {
        /* noop */
      }
    }
  }
  return entries.sort((a, b) => a.loc.localeCompare(b.loc));
}

async function collectServicios() {
  const dir = join(ROOT, 'servicios');
  const files = await readdir(dir);
  const entries = [];

  for (const f of files.filter((x) => x.endsWith('.html') && x !== 'index.html')) {
    const full = join(dir, f);
    entries.push({
      path: `servicios/${f}`,
      loc: `${SITE}/servicios/${f}`,
      priority: '0.8',
      lastmod: await fileLastMod(full),
    });
  }

  return entries.sort((a, b) => a.loc.localeCompare(b.loc));
}

async function generateSitemap(blogArticles, servicios, ciudades, servicioCiudad) {
  const urls = [];

  for (const entry of SITEMAP_URLS) {
    const full = join(ROOT, entry.path);
    urls.push({
      loc: entry.loc,
      lastmod: await fileLastMod(full),
      priority: entry.priority,
    });
  }

  for (const city of ciudades) {
    urls.push({
      loc: city.loc,
      lastmod: city.lastmod,
      priority: city.priority,
    });
  }

  for (const sc of servicioCiudad) {
    urls.push({
      loc: sc.loc,
      lastmod: sc.lastmod,
      priority: sc.priority,
    });
  }

  for (const art of blogArticles) {
    urls.push({
      loc: art.canonical,
      lastmod: art.lastmod,
      priority: '0.8',
    });
  }

  for (const svc of servicios) {
    urls.push({
      loc: svc.loc,
      lastmod: svc.lastmod,
      priority: svc.priority,
    });
  }

  const body = urls
    .map(
      (u) =>
        `  <url><loc>${escapeXml(u.loc)}</loc><lastmod>${u.lastmod}</lastmod><priority>${u.priority}</priority></url>`
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;

  await writeFile(join(ROOT, 'sitemap.xml'), xml, 'utf8');
  console.log(`✓ sitemap.xml — ${urls.length} URLs (solo México)`);
  return urls;
}

function assertMexicoOnlySitemap(urls) {
  const bad = urls.filter((u) => {
    const loc = u.loc.toLowerCase();
    if (BLOCKED_CITY_SLUGS.has(loc.match(/\/ciudades\/([^/]+)\//)?.[1] || '')) return true;
    if (BLOCKED_CITY_SLUGS.has(loc.match(/\/servicios\/[^/]+\/([^/]+)\//)?.[1] || '')) return true;
    if (USA_BLOG_SLUG_RE.test(loc)) return true;
    if (/\/blog\/[^/]*(estados-unidos|hispanas-usa|latinas-usa|dallas-texas|small-business-usa)/i.test(loc)) return true;
    return false;
  });
  if (bad.length) {
    console.error('✗ sitemap contiene URLs fuera de México:');
    bad.forEach((u) => console.error('  -', u.loc));
    process.exit(1);
  }
}

async function generateRss(articles) {
  const items = articles
    .map((a) => {
      const pubDate = a.datePublished
        ? new Date(a.datePublished).toUTCString()
        : new Date(a.lastmod).toUTCString();
      return `    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${escapeXml(a.canonical)}</link>
      <guid isPermaLink="true">${escapeXml(a.canonical)}</guid>
      <description>${escapeXml(a.description)}</description>
      <pubDate>${pubDate}</pubDate>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Blog GH Specialist — Automatización IA para Empresas México</title>
    <link>${SITE}/blog/</link>
    <description>Artículos y guías sobre automatización con IA, chatbots WhatsApp, CRM Kommo y transformación digital para empresas en México.</description>
    <language>es-mx</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE}/blog/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;

  await writeFile(join(ROOT, 'blog/feed.xml'), xml, 'utf8');
  console.log(`✓ blog/feed.xml — ${articles.length} artículos`);
}

function cleanHeadline(title) {
  return title.replace(/\s*\|\s*GH Specialist\s*$/i, '').trim();
}

async function updateBlogIndexSchema(articles) {
  const indexPath = join(ROOT, 'blog/index.html');
  let html = await readFile(indexPath, 'utf8');
  const blogPost = articles.map((a) => ({
    '@type': 'BlogPosting',
    headline: cleanHeadline(a.title),
    url: a.canonical,
    datePublished: a.datePublished || a.lastmod,
  }));
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Blog GH Specialist',
    description: 'Artículos sobre automatización con IA para empresas en México',
    url: `${SITE}/blog/`,
    publisher: {
      '@type': 'Organization',
      name: 'GH Specialist',
      logo: { '@type': 'ImageObject', url: `${SITE}/logo-gh-1200.png` },
    },
    blogPost,
  };
  const newScript = `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
  const re = /<script type="application\/ld\+json">\{"@context":"https:\/\/schema\.org","@type":"Blog"[\s\S]*?<\/script>/;
  if (!re.test(html)) {
    console.warn('⚠ No se encontró schema Blog en blog/index.html');
    return;
  }
  html = html.replace(re, newScript);
  await writeFile(indexPath, html, 'utf8');
  console.log(`✓ blog/index.html schema — ${blogPost.length} artículos`);
}

async function main() {
  const mexicoSlugs = await loadMexicoCitySlugs();
  const blogArticles = await collectBlogArticles();
  const servicios = await collectServicios();
  const ciudades = await collectCiudades(mexicoSlugs);
  const servicioCiudad = await collectServicioCiudad(mexicoSlugs);

  const sitemapUrls = await generateSitemap(blogArticles, servicios, ciudades, servicioCiudad);
  assertMexicoOnlySitemap(sitemapUrls);
  await generateRss(blogArticles);
  await updateBlogIndexSchema(blogArticles);

  const warnings = [];
  for (const art of blogArticles) {
    warnings.push(...validateBlogArticle(relative(ROOT, art.full), art.html));
  }

  if (warnings.length) {
    console.warn('\nAdvertencias SEO en artículos del blog:');
    warnings.forEach((w) => console.warn(w));
  } else {
    console.log('✓ Todos los artículos pasan validación SEO mínima');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
