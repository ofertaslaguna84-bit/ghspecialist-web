/**
 * Prepara generación: TU tema manda; Google Suggest solo aporta 2–5 keywords para el texto.
 */
import { pickNextValidatedTopic, topicFromPhrase } from './gh-blog-validated-keywords.mjs';
import { inferBlogCategory, suggestPhrasesForUserInput } from './gh-blog-google-suggest.mjs';

const SKIP_SUGGEST =
  /ine\b|issste|iess\b|msp\b|famisanar|colsubsidio|excel\b|noticias|gob mx|tramite|salud publica|medicas\b|medicos\b|hospital|seguro popular|\b2026\b|\b2025\b/;

function normalize(s) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * @param {string} userTopic
 * @param {string[]} suggestions
 * @param {number} max
 */
export function pickSeoKeywordsForArticle(userTopic, suggestions, max = 5) {
  const trimmed = userTopic.trim();
  const n = normalize(trimmed);
  const tokens = n.split(' ').filter((w) => w.length > 2 || w === 'ia');
  const out = [];
  const seen = new Set();

  function add(phrase) {
    const p = normalize(phrase);
    if (!p || p.length < 8 || seen.has(p)) return;
    seen.add(p);
    out.push(p);
  }

  add(trimmed);

  const scored = [];
  for (const raw of suggestions) {
    const p = normalize(raw);
    if (SKIP_SUGGEST.test(p) || p.length > 90) continue;
    let score = 0;
    for (const tok of tokens) {
      if (p.includes(tok)) score += 4;
    }
    if (/whatsapp|chatbot|automatiz|kommo|crm|inteligencia|\bia\b|negocio|pyme|google calendar|business api/.test(p)) {
      score += 4;
    }
    if (/imprimir|pdf|excel|plantilla|descargar/.test(p)) score -= 8;
    if (p === n) score += 10;
    if (score > 0) scored.push({ p, score });
  }
  scored.sort((a, b) => b.score - a.score);
  for (const { p } of scored) {
    add(p);
    if (out.length >= max) break;
  }

  if (out.length < 3 && /cita|agenda|reserva|calendario/.test(n)) {
    add('agendar citas whatsapp');
    add('automatizar citas whatsapp');
  }
  while (out.length < 2 && tokens.length) {
    add(`${tokens.slice(0, 3).join(' ')} whatsapp`);
    add(`automatizar ${tokens[0]} con ia`);
    if (out.length >= 2) break;
  }

  return out.slice(0, max);
}

/**
 * @param {string} userInput
 */
export async function prepareBlogGeneration(userInput) {
  const trimmed = userInput.trim();
  const suggestions = await suggestPhrasesForUserInput(trimmed);
  const seoKeywords = pickSeoKeywordsForArticle(trimmed, suggestions, 5);
  const phrase = normalize(trimmed);

  return {
    topic: topicFromPhrase(phrase),
    userTopic: trimmed,
    seoKeywords,
    contentBrief: undefined,
    autoCorrected: false,
    message: `Tema del artículo: «${trimmed}». Keywords Google MX en el texto: ${seoKeywords.join(' · ')}`,
  };
}

/**
 * Tema automático (campo vacío) — sigue usando catálogo rotativo.
 * @param {string[]} haystack
 */
export function prepareBlogAuto(haystack) {
  const topic = pickNextValidatedTopic(haystack);
  return {
    topic,
    userTopic: topic.phrase,
    seoKeywords: [topic.phrase],
    contentBrief: undefined,
    autoCorrected: false,
    message: `Tema automático del catálogo: «${topic.phrase}».`,
  };
}
