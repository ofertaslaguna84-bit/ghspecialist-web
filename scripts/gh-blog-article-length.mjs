/** Límite duro de artículos del blog GH Specialist */

export const BLOG_MAX_WORDS = 1000;
export const BLOG_TARGET_MIN_WORDS = 700;

/** @param {string} html */
export function countWordsInHtml(html) {
  const text = String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) return 0;
  return text.split(' ').filter(Boolean).length;
}

/** @param {string} html */
function splitContentBlocks(html) {
  const blocks = [];
  const re = /<(h2|h3|p|ul|ol)\b[^>]*>[\s\S]*?<\/\1>/gi;
  let m;
  while ((m = re.exec(html))) blocks.push(m[0]);
  if (!blocks.length && html.trim()) blocks.push(html.trim());
  return blocks;
}

/**
 * Recorta HTML del artículo a máximo BLOG_MAX_WORDS (conserva intro + secciones iniciales).
 * @param {string} contentHtml
 */
export function trimContentHtmlToMaxWords(contentHtml, maxWords = BLOG_MAX_WORDS) {
  const blocks = splitContentBlocks(contentHtml);
  if (!blocks.length) return contentHtml;

  const kept = [];
  let words = 0;
  let h2Count = 0;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const blockWords = countWordsInHtml(block);
    const isH2 = /^<h2\b/i.test(block);

    if (isH2) {
      if (h2Count >= 4) continue;
      h2Count += 1;
    }

    if (words === 0 || words + blockWords <= maxWords) {
      kept.push(block);
      words += blockWords;
      continue;
    }

    if (kept.length === 0) {
      kept.push(block);
      words += blockWords;
    }
    break;
  }

  let out = kept.join(' ');
  const finalWords = countWordsInHtml(out);
  if (finalWords > maxWords + 50) {
    out = kept.slice(0, Math.max(1, kept.length - 1)).join(' ');
  }

  return out.trim();
}

/** @param {number} words */
export function readTimeFromWordCount(words) {
  return Math.min(6, Math.max(4, Math.ceil(words / 200)));
}

/**
 * @param {{ content_html?: string, read_time?: number }} article
 */
export function enforceArticleLength(article) {
  if (!article?.content_html) return article;
  const trimmed = trimContentHtmlToMaxWords(article.content_html);
  const words = countWordsInHtml(trimmed);
  article.content_html = trimmed;
  article.read_time = readTimeFromWordCount(words);
  return article;
}
