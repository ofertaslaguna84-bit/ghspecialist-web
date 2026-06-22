/**
 * Temas de blog con frases alineadas a Google Suggest (MX o USA hispano).
 * MX: data/gh-blog-topics.json · USA: data/gh-blog-topics-usa.json
 */
import topicsMx from '../data/gh-blog-topics.json' with { type: 'json' };
import topicsUsa from '../data/gh-blog-topics-usa.json' with { type: 'json' };
import { inferBlogCategory } from './gh-blog-google-suggest.mjs';

/** @typedef {{ phrase: string, category: 'Chatbots'|'WhatsApp'|'Automatización'|'CRM'|'SEO'|'IA'|'Consejos' }} ValidatedKeywordTopic */

/** @type {ValidatedKeywordTopic[]} */
export const VALIDATED_BLOG_TOPICS = topicsMx;

/** @type {ValidatedKeywordTopic[]} */
export const VALIDATED_BLOG_TOPICS_USA = topicsUsa;

/** @param {'mx'|'usa'} [market] */
export function getTopicsForMarket(market = 'mx') {
  return market === 'usa' ? VALIDATED_BLOG_TOPICS_USA : VALIDATED_BLOG_TOPICS;
}

function normalizePhrase(s) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function topicKeys(phrase) {
  return normalizePhrase(phrase)
    .split(' ')
    .filter((w) => w.length > 3 || w === 'ia' || w === 'seo' || w === 'crm')
    .slice(0, 5);
}

/**
 * @param {string[]} existingSlugsAndTitles
 * @param {{ category?: ValidatedKeywordTopic['category'], market?: 'mx'|'usa' }} [options]
 */
export function pickNextValidatedTopic(existingSlugsAndTitles, options) {
  const haystack = existingSlugsAndTitles.map(normalizePhrase).join(' ');
  const catalog = getTopicsForMarket(options?.market || 'mx');
  const pool = options?.category
    ? catalog.filter((t) => t.category === options.category)
    : catalog;

  for (const topic of pool) {
    const keys = topicKeys(topic.phrase);
    if (keys.length < 2) continue;
    const matched = keys.filter((k) => haystack.includes(k)).length;
    const needed = Math.min(2, keys.length);
    if (matched < needed) return topic;
  }

  const uncovered = pool.filter((topic) => {
    const keys = topicKeys(topic.phrase);
    const matched = keys.filter((k) => haystack.includes(k)).length;
    return matched < Math.min(2, keys.length);
  });
  const pickFrom = uncovered.length ? uncovered : pool;
  return pickFrom[Math.floor(Math.random() * pickFrom.length)];
}

export function isValidatedPhrase(phrase) {
  return findValidatedTopic(phrase) !== undefined;
}

/**
 * @param {string} phrase
 * @param {'mx'|'usa'} [market]
 * @returns {ValidatedKeywordTopic|undefined}
 */
export function findValidatedTopic(phrase, market) {
  const n = normalizePhrase(phrase);
  const catalogs = market ? [getTopicsForMarket(market)] : [VALIDATED_BLOG_TOPICS, VALIDATED_BLOG_TOPICS_USA];
  for (const catalog of catalogs) {
    const hit = catalog.find((t) => normalizePhrase(t.phrase) === n);
    if (hit) return hit;
  }
  return undefined;
}

/**
 * Tema para generar (lista fija o frase nueva validada por nicho / Suggest).
 * @param {string} phrase
 * @returns {ValidatedKeywordTopic}
 */
export function topicFromPhrase(phrase) {
  const existing = findValidatedTopic(phrase);
  if (existing) return existing;
  const normalized = normalizePhrase(phrase);
  return {
    phrase: normalized,
    category: inferBlogCategory(normalized),
  };
}
