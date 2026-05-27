/**
 * Temas de blog SOLO con frases validadas en Google Suggest México (hl=es, gl=mx).
 * Ampliar: node scripts/fetch-google-suggest-keywords.mjs
 */

/** @typedef {{ phrase: string, category: 'Chatbots'|'WhatsApp'|'Automatización'|'CRM'|'SEO'|'IA'|'Consejos' }} ValidatedKeywordTopic */

/** @type {ValidatedKeywordTopic[]} */
export const VALIDATED_BLOG_TOPICS = [
  { phrase: 'chatbot whatsapp negocios mexico', category: 'Chatbots' },
  { phrase: 'chatbot whatsapp para empresas', category: 'Chatbots' },
  { phrase: 'chatbot con inteligencia artificial', category: 'Chatbots' },
  { phrase: 'chatbot whatsapp precio', category: 'Chatbots' },
  { phrase: 'atencion cliente chatbot', category: 'Chatbots' },
  { phrase: 'automatizacion de servicio al cliente', category: 'Automatización' },
  { phrase: 'automatizacion atencion al cliente', category: 'Automatización' },
  { phrase: 'chatbot atencion al cliente whatsapp', category: 'Chatbots' },
  { phrase: 'como automatizar mi negocio con ia', category: 'Automatización' },
  { phrase: 'automatizar negocio con inteligencia artificial', category: 'Automatización' },
  { phrase: 'automatizacion whatsapp pymes', category: 'Automatización' },
  { phrase: 'automatizacion de ventas whatsapp', category: 'Automatización' },
  { phrase: 'inteligencia artificial empresas mexico', category: 'IA' },
  { phrase: 'inteligencia artificial para pymes mexico', category: 'IA' },
  { phrase: 'inteligencia artificial torreon', category: 'IA' },
  { phrase: 'chatbot torreon', category: 'Chatbots' },
  { phrase: 'automatizacion torreon', category: 'Automatización' },
  { phrase: 'recursos humanos torreon', category: 'Consejos' },
  { phrase: 'automatizacion recursos humanos', category: 'Automatización' },
  { phrase: 'agente de ia para whatsapp', category: 'IA' },
  { phrase: 'agente ia whatsapp', category: 'IA' },
  { phrase: 'crm kommo que es', category: 'CRM' },
  { phrase: 'crm kommo whatsapp', category: 'CRM' },
  { phrase: 'embudo ventas whatsapp', category: 'WhatsApp' },
  { phrase: 'whatsapp business api mexico', category: 'WhatsApp' },
  { phrase: 'como posicionar mi pagina en google mexico', category: 'SEO' },
  { phrase: 'como posicionar pagina google mexico', category: 'SEO' },
];

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
    .filter((w) => w.length > 4)
    .slice(0, 4);
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
    const covered =
      keys.length >= 2 &&
      keys.filter((k) => haystack.includes(k)).length >= Math.min(3, keys.length);
    if (!covered) return topic;
  }

  return pool[Math.floor(Math.random() * pool.length)];
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
