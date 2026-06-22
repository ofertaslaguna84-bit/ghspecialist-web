/**
 * Keywords de indexación por región (Google Suggest MX) según el tema del post.
 */
import { suggestPhrasesForUserInput } from './gh-blog-google-suggest.mjs';
import { pickSeoKeywordsForArticle } from './gh-blog-keywords-pick.mjs';

export const INDEXING_REGIONS = [
  { id: 'mexico', label: 'México (general)', suffix: 'mexico' },
  { id: 'cdmx', label: 'CDMX', suffix: 'cdmx' },
  { id: 'monterrey', label: 'Monterrey', suffix: 'monterrey' },
  { id: 'guadalajara', label: 'Guadalajara', suffix: 'guadalajara' },
  { id: 'queretaro', label: 'Querétaro', suffix: 'queretaro' },
  { id: 'torreon', label: 'Torreón y La Laguna', suffix: 'torreon' },
];

function normalize(s) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Quita ciudad del tema para no repetir "torreon torreon" en la consulta. */
export function stripGeoFromTopic(userTopic) {
  let n = normalize(userTopic);
  for (const { suffix } of INDEXING_REGIONS) {
    if (suffix === 'mexico') continue;
    n = n.replace(new RegExp(`\\b${suffix}\\b`, 'g'), ' ');
  }
  n = n.replace(/\bmexico\b/g, ' ').replace(/\s+/g, ' ').trim();
  return n || normalize(userTopic);
}

/**
 * @param {string} userTopic
 * @param {string[]} [articleKeywords] keywords ya elegidas para el cuerpo
 */
export async function gatherIndexingKeywords(userTopic, articleKeywords) {
  const trimmed = userTopic.trim();
  const base = stripGeoFromTopic(trimmed);
  const enArticulo =
    articleKeywords?.length > 0
      ? articleKeywords
      : pickSeoKeywordsForArticle(
          trimmed,
          await suggestPhrasesForUserInput(trimmed),
          5
        );

  const regions = [];
  for (const { id, label, suffix } of INDEXING_REGIONS) {
    const query = `${base} ${suffix}`.replace(/\s+/g, ' ').trim();
    const suggestions = await suggestPhrasesForUserInput(query);
    const keywords = pickSeoKeywordsForArticle(query, suggestions, 3);
    regions.push({ id, region: label, query, keywords });
    await new Promise((r) => setTimeout(r, 120));
  }

  return {
    intro:
      'Vamos a indexar búsquedas como las que la gente hace en Google (Suggest México), alineadas a tu post:',
    enArticulo,
    regions,
  };
}
