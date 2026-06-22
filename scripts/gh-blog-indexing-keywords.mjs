/**
 * Keywords de indexación por región (Google Suggest) según el tema del post.
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

export const INDEXING_REGIONS_USA = [
  { id: 'usa', label: 'Estados Unidos (comunidad hispana)', suffix: 'usa' },
  { id: 'houston', label: 'Houston, Texas', suffix: 'houston' },
  { id: 'los-angeles', label: 'Los Ángeles, California', suffix: 'los angeles' },
  { id: 'miami', label: 'Miami, Florida', suffix: 'miami' },
  { id: 'dallas', label: 'Dallas, Texas', suffix: 'dallas' },
  { id: 'chicago', label: 'Chicago, Illinois', suffix: 'chicago' },
  { id: 'phoenix', label: 'Phoenix, Arizona', suffix: 'phoenix' },
  { id: 'san-antonio', label: 'San Antonio, Texas', suffix: 'san antonio' },
];

function normalize(s) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** @param {typeof INDEXING_REGIONS} regions */
export function stripGeoFromTopic(userTopic, regions = INDEXING_REGIONS) {
  let n = normalize(userTopic);
  for (const { suffix } of regions) {
    if (suffix === 'mexico' || suffix === 'usa') continue;
    n = n.replace(new RegExp(`\\b${suffix.replace(/\s+/g, '\\s+')}\\b`, 'g'), ' ');
  }
  n = n.replace(/\bmexico\b/g, ' ').replace(/\bestados unidos\b/g, ' ').replace(/\busa\b/g, ' ').replace(/\s+/g, ' ').trim();
  return n || normalize(userTopic);
}

/**
 * @param {string} userTopic
 * @param {string[]} [articleKeywords]
 * @param {'mx'|'usa'} [market]
 */
export async function gatherIndexingKeywords(userTopic, articleKeywords, market = 'mx') {
  const trimmed = userTopic.trim();
  const regionsList = market === 'usa' ? INDEXING_REGIONS_USA : INDEXING_REGIONS;
  const base = stripGeoFromTopic(trimmed, regionsList);
  const enArticulo =
    articleKeywords?.length > 0
      ? articleKeywords
      : pickSeoKeywordsForArticle(
          trimmed,
          await suggestPhrasesForUserInput(trimmed, market),
          5
        );

  const regions = [];
  for (const { id, label, suffix } of regionsList) {
    const query = `${base} ${suffix}`.replace(/\s+/g, ' ').trim();
    const suggestions = await suggestPhrasesForUserInput(query, market);
    const keywords = pickSeoKeywordsForArticle(query, suggestions, 3);
    regions.push({ id, region: label, query, keywords });
    await new Promise((r) => setTimeout(r, 120));
  }

  const intro =
    market === 'usa'
      ? 'Vamos a indexar búsquedas que hace la comunidad hispana en Google USA (Suggest gl=us), alineadas a tu post:'
      : 'Vamos a indexar búsquedas como las que la gente hace en Google (Suggest México), alineadas a tu post:';

  return { intro, enArticulo, regions };
}
