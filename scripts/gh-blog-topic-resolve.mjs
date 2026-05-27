import {
  VALIDATED_BLOG_TOPICS,
  findValidatedTopic,
} from './gh-blog-validated-keywords.mjs';

/** @typedef {import('./gh-blog-validated-keywords.mjs').ValidatedKeywordTopic} ValidatedKeywordTopic */

/**
 * @typedef {Object} TopicResolveResult
 * @property {ValidatedKeywordTopic} topic
 * @property {string} userInput
 * @property {boolean} autoCorrected
 * @property {string} message
 * @property {string[]} suggestions
 * @property {string} [contentBrief]
 */

const SERVICE_ALIASES = {
  chatbot: ['chatbot', 'bot', 'asistente virtual', 'asistente'],
  whatsapp: ['whatsapp', 'wsp', 'wa', 'business api', 'whats app'],
  crm: ['crm', 'kommo', 'pipedrive', 'hubspot'],
  ia: ['ia', 'inteligencia artificial', 'automatiz', 'automatizar', ' ai '],
  seo: ['seo', 'posicionar', 'posicionamiento', 'google', 'ranking'],
  agente: ['agente', 'agentes'],
  ventas: ['embudo', 'ventas', 'vender', 'cerrar ventas'],
  pyme: ['pyme', 'pymes', 'negocio', 'empresa', 'empresas'],
};

const PAYMENT_ALIASES = ['precio', 'precios', 'costo', 'cuanto', 'cuánto', 'tarifa', 'cotizar'];

function normalize(s) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[,;/|+&]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(s) {
  return normalize(s).split(' ').filter((w) => w.length > 2);
}

/** @param {string} input */
function detectServices(input) {
  const n = ` ${normalize(input)} `;
  const found = [];
  for (const [service, aliases] of Object.entries(SERVICE_ALIASES)) {
    if (aliases.some((a) => n.includes(` ${normalize(a)} `) || n.includes(normalize(a)))) {
      found.push(service);
    }
  }
  return found;
}

function hasPaymentIntent(input) {
  const n = normalize(input);
  return PAYMENT_ALIASES.some((w) => n.includes(w));
}

/** @param {string} input @param {ValidatedKeywordTopic} topic */
function scoreTopic(input, topic) {
  const inputTokens = new Set(tokenize(input));
  const phraseTokens = tokenize(topic.phrase);
  let score = 0;

  for (const t of phraseTokens) {
    if (inputTokens.has(t)) score += 3;
    else if ([...inputTokens].some((i) => i.includes(t) || t.includes(i))) score += 1;
  }

  const services = detectServices(input);
  const phraseNorm = normalize(topic.phrase);

  if (services.includes('chatbot') && phraseNorm.includes('chatbot')) score += 4;
  if (services.includes('whatsapp') && phraseNorm.includes('whatsapp')) score += 4;
  if (services.includes('crm') && (phraseNorm.includes('crm') || phraseNorm.includes('kommo'))) score += 4;
  if (services.includes('ia') && (phraseNorm.includes('ia') || phraseNorm.includes('inteligencia'))) score += 4;
  if (services.includes('seo') && (phraseNorm.includes('google') || phraseNorm.includes('posicionar'))) score += 5;
  if (services.includes('agente') && phraseNorm.includes('agente')) score += 4;
  if (services.includes('ventas') && phraseNorm.includes('ventas')) score += 3;
  if (services.includes('pyme') && (phraseNorm.includes('pyme') || phraseNorm.includes('negocio'))) score += 2;

  if (hasPaymentIntent(input) && phraseNorm.includes('precio')) score += 4;

  if (normalize(input).includes('mexico') && phraseNorm.includes('mexico')) score += 3;

  return score;
}

const SERVICE_LABELS = {
  chatbot: 'chatbot',
  whatsapp: 'WhatsApp',
  crm: 'CRM Kommo',
  ia: 'automatización con IA',
  seo: 'SEO en Google',
  agente: 'agente de IA',
  ventas: 'embudo de ventas',
  pyme: 'PYMEs',
};

/** @param {string[]} services @param {string} input */
function buildComparativeBrief(services, input) {
  const labels = services.map((s) => SERVICE_LABELS[s] ?? s).join(', ');
  const parts = [
    `Guía comparativa para dueños de negocio en México sobre: ${labels}.`,
    'Incluye TABLA MARKDOWN principal con columnas: solución | ideal para | ventajas clave | integración WhatsApp | esfuerzo inicial.',
    'Cada fila debe cubrir un concepto que el usuario mencionó (chatbot, CRM, automatización, SEO, agente IA, etc.).',
    'Cierra con recomendación práctica: qué implementar primero en una PYME mexicana.',
    'Tono consultivo B2B; pesos MXN cuando haya precios; sin jerga inventada (evitar "leads", usar contactos o interesados).',
  ];
  if (normalize(input).includes('kommo')) {
    parts.push('Menciona Kommo como CRM con WhatsApp cuando aplique.');
  }
  return parts.join(' ');
}

/** @param {string} input @param {string[]} services */
function pickAnchorForComparative(input, services) {
  const ranked = VALIDATED_BLOG_TOPICS.map((t) => ({ t, score: scoreTopic(input, t) }))
    .sort((a, b) => b.score - a.score);

  if (services.includes('seo')) {
    const seo = findValidatedTopic('como posicionar mi pagina en google mexico');
    if (seo) return seo;
  }
  if (services.includes('chatbot') && services.includes('whatsapp')) {
    const cw = findValidatedTopic('chatbot whatsapp para empresas');
    if (cw) return cw;
  }
  if (services.includes('crm')) {
    const crm = findValidatedTopic('crm kommo whatsapp') || findValidatedTopic('crm kommo que es');
    if (crm) return crm;
  }
  if (services.includes('ia')) {
    const ia =
      findValidatedTopic('como automatizar mi negocio con ia') ||
      findValidatedTopic('inteligencia artificial para pymes mexico');
    if (ia) return ia;
  }

  return ranked[0]?.t ?? VALIDATED_BLOG_TOPICS[0];
}

/** @param {string} userInput */
export function resolveTopicInput(userInput) {
  const trimmed = userInput.trim();
  const exact = findValidatedTopic(trimmed);
  if (exact) {
    return {
      topic: exact,
      userInput: trimmed,
      autoCorrected: false,
      message: 'Frase validada en Google MX.',
      suggestions: [],
    };
  }

  const services = detectServices(trimmed);
  const multiService = services.length >= 2;

  if (multiService) {
    const topic = pickAnchorForComparative(trimmed, services);
    const labels = services.map((s) => SERVICE_LABELS[s] ?? s).join(', ');
    return {
      topic,
      userInput: trimmed,
      autoCorrected: true,
      message: `Entendí comparativa de: ${labels}. SEO ancla: «${topic.phrase}». El artículo incluirá tabla comparativa.`,
      suggestions: [
        'chatbot whatsapp para empresas',
        'crm kommo whatsapp',
        'como automatizar mi negocio con ia',
        'como posicionar mi pagina en google mexico',
      ],
      contentBrief: buildComparativeBrief(services, trimmed),
    };
  }

  const ranked = VALIDATED_BLOG_TOPICS.map((t) => ({ t, score: scoreTopic(trimmed, t) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  const suggestions = ranked.slice(0, 5).map((x) => x.t.phrase);
  const best = ranked[0];

  if (best && best.score >= 4) {
    return {
      topic: best.t,
      userInput: trimmed,
      autoCorrected: true,
      message: `Corregido automáticamente a: «${best.t.phrase}»`,
      suggestions,
    };
  }

  const fallback =
    best?.t ??
    findValidatedTopic('chatbot whatsapp para empresas') ??
    VALIDATED_BLOG_TOPICS[0];

  return {
    topic: fallback,
    userInput: trimmed,
    autoCorrected: true,
    message: best
      ? `Aproximado a: «${fallback.phrase}». Si no es lo que buscas, elige una sugerencia.`
      : 'No encontré coincidencia clara. Usando tema similar.',
    suggestions: suggestions.length ? suggestions : VALIDATED_BLOG_TOPICS.slice(0, 5).map((t) => t.phrase),
  };
}

/** @param {string} [brief] */
export function isComparativeBrief(brief) {
  return Boolean(brief?.includes('Guía comparativa para dueños de negocio'));
}

/** @param {string} userInput */
export function previewTopicInput(userInput) {
  if (!userInput.trim()) {
    return {
      exact: true,
      resolvedPhrase: '',
      message: 'Vacío = el sistema elige el siguiente tema validado automáticamente.',
      suggestions: [],
      willExpandContent: false,
    };
  }
  const r = resolveTopicInput(userInput);
  return {
    exact: !r.autoCorrected,
    resolvedPhrase: r.topic.phrase,
    message: r.message,
    suggestions: r.suggestions,
    willExpandContent: Boolean(r.contentBrief),
  };
}
