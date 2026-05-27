const MESES_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

/** @typedef {{ month: string, year: number, label: string, slugSuffix: string }} BlogFreshness */

/** @param {Date} [date] */
export function getBlogFreshness(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('es-MX', {
    timeZone: 'America/Mexico_City',
    month: 'long',
    year: 'numeric',
  });
  const parts = formatter.formatToParts(date);
  const month = (parts.find((p) => p.type === 'month')?.value ?? 'enero').toLowerCase();
  const year = Number(parts.find((p) => p.type === 'year')?.value ?? date.getFullYear());
  const slugSuffix = `${month}-${year}`
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  return { month, year, label: `${month} ${year}`, slugSuffix };
}

function normalizeForMatch(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/** @param {string} text @param {BlogFreshness} freshness */
function textHasFreshness(text, freshness) {
  const n = normalizeForMatch(text);
  const label = normalizeForMatch(freshness.label);
  if (n.includes(label)) return true;
  for (let y = 2018; y < freshness.year; y++) {
    if (new RegExp(`\\b${y}\\b`).test(n)) return false;
  }
  return n.includes(String(freshness.year)) && MESES_ES.some((m) => n.includes(m));
}

/** @param {string} text @param {BlogFreshness} freshness */
export function sanitizeStaleYears(text, freshness) {
  let out = text;
  for (let y = 2018; y < freshness.year; y++) {
    out = out.replace(new RegExp(`\\ben\\s+${y}\\b`, 'gi'), `en ${freshness.label}`);
    out = out.replace(new RegExp(`\\bdel\\s+${y}\\b`, 'gi'), `de ${freshness.label}`);
    out = out.replace(new RegExp(`\\b${y}\\b`, 'g'), String(freshness.year));
  }
  return out.replace(/\s+/g, ' ').replace(/\s*:\s*$/, '').trim();
}

/** @param {string} phrase */
export function formatValidatedPhraseTitle(phrase) {
  let t = phrase.trim();
  if (/^cuanto/i.test(t)) {
    t = `¿Cuánto${t.slice(6)}`;
  } else if (/^como/i.test(t)) {
    t = `Cómo${t.slice(4)}`;
  } else {
    t = t.charAt(0).toUpperCase() + t.slice(1);
  }
  t = t
    .replace(/\bmexico\b/gi, 'México')
    .replace(/\bwhatsapp\b/gi, 'WhatsApp')
    .replace(/\bia\b/gi, 'IA')
    .replace(/\bkommo\b/gi, 'Kommo')
    .replace(/\bpymes\b/gi, 'PYMEs')
    .replace(/\bpyme\b/gi, 'PYME');
  if (t.startsWith('¿Cuánto') && !t.endsWith('?')) t += '?';
  return t;
}

/** @param {string} phrase @param {BlogFreshness} freshness */
export function buildCanonicalBlogTitle(phrase, freshness) {
  return `${formatValidatedPhraseTitle(phrase)} | guía ${freshness.label}`;
}

/** @param {string} slug @param {string} slugSuffix */
export function applyFreshnessToSlug(slug, slugSuffix) {
  const base = slug.replace(/\.html$/i, '');
  const normalized = base.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (normalized.endsWith(slugSuffix) || normalized.includes(`-${slugSuffix}`)) {
    return `${base}.html`;
  }
  return `${base}-${slugSuffix}.html`;
}

/** Prohibido "leads" en texto público */
export function sanitizeBannedWords(text) {
  if (!text || typeof text !== 'string') return text;
  return text
    .replace(/\bleads\b/gi, 'contactos')
    .replace(/\blead\b/gi, 'contacto');
}

/**
 * @param {Record<string, unknown>} article
 * @param {BlogFreshness} freshness
 * @param {string} phrase
 */
export function applyFreshnessToArticle(article, freshness, phrase) {
  article.title = buildCanonicalBlogTitle(phrase, freshness);

  const fields = [
    'description',
    'og_title',
    'og_description',
    'card_excerpt',
    'content_html',
    'breadcrumb_title',
  ];
  for (const key of fields) {
    if (article[key]) {
      article[key] = sanitizeBannedWords(sanitizeStaleYears(String(article[key]), freshness));
    }
  }

  if (article.description && !textHasFreshness(article.description, freshness)) {
    article.description = sanitizeStaleYears(
      `${article.description} Actualizado ${freshness.label}.`,
      freshness
    ).slice(0, 155);
  }

  if (article.content_html && !textHasFreshness(String(article.content_html).slice(0, 500), freshness)) {
    article.content_html = `<p><strong>Actualizado ${freshness.label}</strong> — guía para empresas en México.</p>${article.content_html}`;
  }

  if (article.slug) {
    const bare = String(article.slug).replace(/\.html$/i, '');
    article.slug = applyFreshnessToSlug(`${bare}.html`, freshness.slugSuffix);
  }
}
