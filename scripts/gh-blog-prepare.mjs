/**
 * Prepara generación: TU tema manda; Google Suggest solo aporta 2–5 keywords para el texto.
 */
import { pickNextValidatedTopic, topicFromPhrase } from './gh-blog-validated-keywords.mjs';
import { suggestPhrasesForUserInput } from './gh-blog-google-suggest.mjs';
import { pickSeoKeywordsForArticle } from './gh-blog-keywords-pick.mjs';
import {
  gatherIndexingKeywords,
  INDEXING_REGIONS,
} from './gh-blog-indexing-keywords.mjs';

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
 */
export async function prepareBlogGeneration(userInput) {
  const trimmed = userInput.trim();
  const suggestions = await suggestPhrasesForUserInput(trimmed);
  const seoKeywords = pickSeoKeywordsForArticle(trimmed, suggestions, 5);
  const indexingKeywords = await gatherIndexingKeywords(trimmed, seoKeywords);
  const phrase = normalize(trimmed);

  return {
    topic: topicFromPhrase(phrase),
    userTopic: trimmed,
    seoKeywords,
    indexingKeywords,
    contentBrief: undefined,
    autoCorrected: false,
    message: `Tema del artículo: «${trimmed}». Keywords en el texto: ${seoKeywords.join(' · ')}`,
  };
}

/**
 * Tema automático (campo vacío) — sigue usando catálogo rotativo.
 * @param {string[]} haystack
 */
export function prepareBlogAuto(haystack) {
  const topic = pickNextValidatedTopic(haystack);
  const indexingKeywords = {
    intro: 'Indexación alineada al tema del catálogo:',
    enArticulo: [topic.phrase],
    regions: INDEXING_REGIONS.map(({ id, label, suffix }) => ({
      id,
      region: label,
      query: `${topic.phrase} ${suffix}`,
      keywords: [`${topic.phrase} ${suffix}`],
    })),
  };
  return {
    topic,
    userTopic: topic.phrase,
    seoKeywords: [topic.phrase],
    indexingKeywords,
    contentBrief: undefined,
    autoCorrected: false,
    message: `Tema automático del catálogo: «${topic.phrase}».`,
  };
}
