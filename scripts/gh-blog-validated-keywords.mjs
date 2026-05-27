/**
 * Temas de blog con frases alineadas a Google Suggest México.
 * Lista: data/gh-blog-topics.json — ampliar: node scripts/fetch-google-suggest-keywords.mjs
 */
import topicsJson from '../data/gh-blog-topics.json' with { type: 'json' };
import { inferBlogCategory } from './gh-blog-google-suggest.mjs';

/** @typedef {{ phrase: string, category: 'Chatbots'|'WhatsApp'|'Automatización'|'CRM'|'SEO'|'IA'|'Consejos' }} ValidatedKeywordTopic */

/** @type {ValidatedKeywordTopic[]} */
export const VALIDATED_BLOG_TOPICS = topicsJson;

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
 * @param {{ category?: ValidatedKeywordTopic['category'] }} [options]
 */
export function pickNextValidatedTopic(existingSlugsAndTitles, options) {
  const haystack = existingSlugsAndTitles.map(normalizePhrase).join(' ');
  const pool = options?.category
    ? VALIDATED_BLOG_TOPICS.filter((t) => t.category === options.category)
    : VALIDATED_BLOG_TOPICS;

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
 * @returns {ValidatedKeywordTopic|undefined}
 */
export function findValidatedTopic(phrase) {
  const n = normalizePhrase(phrase);
  return VALIDATED_BLOG_TOPICS.find((t) => normalizePhrase(t.phrase) === n);
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
