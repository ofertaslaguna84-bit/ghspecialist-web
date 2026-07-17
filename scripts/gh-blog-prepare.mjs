/**
 * Prepara generación: TU tema manda; Google Suggest solo aporta 2–5 keywords para el texto.
 */
import { pickNextValidatedTopic } from './gh-blog-validated-keywords.mjs';
import { suggestPhrasesForUserInput } from './gh-blog-google-suggest.mjs';
import { pickSeoKeywordsForArticle } from './gh-blog-keywords-pick.mjs';
import { resolveTopicInputAsync } from './gh-blog-topic-resolve.mjs';
import {
  gatherIndexingKeywords,
  INDEXING_REGIONS,
  INDEXING_REGIONS_USA,
} from './gh-blog-indexing-keywords.mjs';

/** @returns {'mx'|'usa'} */
export function parseBlogMarket(value) {
  const m = String(value || 'mx').trim().toLowerCase();
  return m === 'usa' || m === 'us' ? 'usa' : 'mx';
}

function normalize(s) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * @param {string} userInput
 * @param {'mx'|'usa'} [market]
 */
export async function prepareBlogGeneration(userInput, market = 'mx') {
  const trimmed = userInput.trim();
  const resolved = await resolveTopicInputAsync(trimmed);
  const suggestions = await suggestPhrasesForUserInput(trimmed, market);
  const seoKeywords = pickSeoKeywordsForArticle(trimmed, suggestions, 5);
  const indexingKeywords = await gatherIndexingKeywords(trimmed, seoKeywords, market);

  return {
    market,
    topic: resolved.topic,
    userTopic: resolved.userInput,
    seoKeywords: seoKeywords.length ? seoKeywords : [resolved.topic.phrase],
    indexingKeywords,
    contentBrief: resolved.contentBrief,
    autoCorrected: resolved.autoCorrected,
    message: resolved.message,
  };
}

/**
 * Tema automático (campo vacío) — catálogo rotativo por mercado.
 * @param {string[]} haystack
 * @param {'mx'|'usa'} [market]
 */
export function prepareBlogAuto(haystack, market = 'mx') {
  const topic = pickNextValidatedTopic(haystack, { market });
  const regionsList = market === 'usa' ? INDEXING_REGIONS_USA : INDEXING_REGIONS;
  const indexingKeywords = {
    intro:
      market === 'usa'
        ? 'Indexación alineada al tema USA (comunidad hispana):'
        : 'Indexación alineada al tema del catálogo:',
    enArticulo: [topic.phrase],
    regions: regionsList.map(({ id, label, suffix }) => ({
      id,
      region: label,
      query: `${topic.phrase} ${suffix}`,
      keywords: [`${topic.phrase} ${suffix}`],
    })),
  };
  return {
    market,
    topic,
    userTopic: topic.phrase,
    seoKeywords: [topic.phrase],
    indexingKeywords,
    contentBrief: undefined,
    autoCorrected: false,
    message: `Tema automático (${market.toUpperCase()}): «${topic.phrase}».`,
  };
}
