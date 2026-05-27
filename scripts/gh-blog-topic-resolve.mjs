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

const SHORT_TOKENS = new Set(['ia', 'seo', 'crm']);

const CITY_ALIASES = {
  torreon: ['torreon', 'torreón', 'la laguna', 'laguna', 'gomez palacio', 'gómez palacio', 'lerdo'],
  monterrey: ['monterrey', 'nuevo leon', 'nuevo león', 'san pedro garza'],
  cdmx: ['cdmx', 'ciudad de mexico', 'ciudad de méxico', 'df', 'cd mx'],
  guadalajara: ['guadalajara', 'jalisco', 'zapopan'],
  queretaro: ['queretaro', 'querétaro'],
  chihuahua: ['chihuahua'],
};

const CITY_LABELS = {
  torreon: 'Torreón y La Laguna',
  monterrey: 'Monterrey',
  cdmx: 'CDMX',
  guadalajara: 'Guadalajara',
  queretaro: 'Querétaro',
  chihuahua: 'Chihuahua',
};

const SERVICE_ALIASES = {
  chatbot: ['chatbot', 'bot', 'asistente virtual', 'asistente'],
  whatsapp: ['whatsapp', 'wsp', 'wa', 'business api', 'whats app'],
  crm: ['crm', 'kommo', 'pipedrive', 'hubspot'],
  ia: ['ia', 'inteligencia artificial', 'automatiz', 'automatizar', ' ai '],
  agencia: ['agencia', 'agencias', 'consultora', 'proveedor de ia', 'empresa de ia', 'servicios de ia'],
  seo: ['seo', 'posicionar', 'posicionamiento', 'google', 'ranking'],
  agente: ['agente', 'agentes'],
  ventas: ['embudo', 'ventas', 'vender', 'cerrar ventas'],
  pyme: ['pyme', 'pymes', 'negocio', 'empresa', 'empresas'],
  atencion: [
    'servicio al cliente',
    'servicio a cliente',
    'atencion al cliente',
    'atencion cliente',
    'soporte al cliente',
    'experiencia del cliente',
    'centro de atencion',
    'customer service',
  ],
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
  return normalize(s)
    .split(' ')
    .filter((w) => w.length > 2 || SHORT_TOKENS.has(w));
}

/** @param {string} input */
function detectCity(input) {
  const n = normalize(input);
  for (const [city, aliases] of Object.entries(CITY_ALIASES)) {
    if (aliases.some((a) => n.includes(normalize(a)))) return city;
  }
  return null;
}

/** @param {string} input */
function hasIaOrAgencyIntent(input) {
  const n = normalize(input);
  return (
    /\bia\b/.test(n) ||
    n.includes('inteligencia artificial') ||
    n.includes('automatiz') ||
    n.includes('agencia') ||
    n.includes('agente') ||
    n.includes('chatbot') ||
    n.includes('gh specialist')
  );
}

/** Servicio / atención al cliente — no mapear a "chatbot con inteligencia artificial" genérico */
function detectCustomerServiceIntent(input) {
  const n = normalize(input);
  return (
    n.includes('servicio al cliente') ||
    n.includes('servicio a cliente') ||
    n.includes('atencion al cliente') ||
    n.includes('atencion cliente') ||
    n.includes('soporte al cliente') ||
    n.includes('experiencia del cliente') ||
    n.includes('centro de atencion') ||
    (n.includes('cliente') && (n.includes('automatiz') || n.includes('chatbot')))
  );
}

/** Si el texto del usuario ya es casi la frase validada */
function findNearValidatedTopic(input) {
  const n = normalize(input);
  let best;
  let bestScore = 0;
  for (const t of VALIDATED_BLOG_TOPICS) {
    const p = normalize(t.phrase);
    if (p === n) return t;
    const inputTokens = tokenize(input);
    const phraseTokens = tokenize(t.phrase);
    let overlap = 0;
    for (const tok of phraseTokens) {
      if (inputTokens.includes(tok)) overlap += 1;
    }
    const ratio = overlap / Math.max(phraseTokens.length, 1);
    if (ratio >= 0.75 && overlap >= 3 && ratio > bestScore) {
      bestScore = ratio;
      best = t;
    }
  }
  return best;
}

/** @param {string} input @param {string[]} services */
function pickAnchorForCustomerService(input, services) {
  const n = normalize(input);
  if (services.includes('whatsapp') || n.includes('whatsapp')) {
    return (
      findValidatedTopic('chatbot atencion al cliente whatsapp') ||
      findValidatedTopic('chatbot whatsapp para empresas') ||
      VALIDATED_BLOG_TOPICS[0]
    );
  }
  if (n.includes('chatbot')) {
    return (
      findValidatedTopic('atencion cliente chatbot') ||
      findValidatedTopic('chatbot atencion al cliente whatsapp') ||
      VALIDATED_BLOG_TOPICS[0]
    );
  }
  return (
    findValidatedTopic('automatizacion de servicio al cliente') ||
    findValidatedTopic('automatizacion atencion al cliente') ||
    findValidatedTopic('atencion cliente chatbot') ||
    VALIDATED_BLOG_TOPICS[0]
  );
}

/** @param {string} userInput */
function buildCustomerServiceBrief(userInput) {
  return [
    `El usuario pidió: «${userInput}».`,
    'Artículo sobre AUTOMATIZACIÓN DE SERVICIO Y ATENCIÓN AL CLIENTE en México (WhatsApp, chatbot, CRM, tiempos de respuesta, escalamiento a humano).',
    'PROHIBIDO centrar el artículo solo en "inteligencia artificial" genérica o un chatbot abstracto sin hablar de servicio al cliente.',
    'Incluye beneficios para PYMEs, métricas (tiempo de respuesta, satisfacción) y CTA a GH Specialist.',
  ].join(' ');
}

/** Recursos humanos / RH — no debe mapearse a IA solo por llevar una ciudad */
function detectRhIntent(input) {
  const n = normalize(input);
  return (
    n.includes('recursos humanos') ||
    /\brh\b/.test(n) ||
    n.includes('nomina') ||
    n.includes('reclutamiento') ||
    n.includes('capital humano') ||
    n.includes('departamento de personal') ||
    (n.includes('especializada') && n.includes('humanos'))
  );
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
  if (n.includes('agencia') && !found.includes('ia')) found.push('ia');
  return [...new Set(found)];
}

function hasPaymentIntent(input) {
  const n = normalize(input);
  return PAYMENT_ALIASES.some((w) => n.includes(w));
}

/** @param {string} city */
function topicsForCity(city) {
  return VALIDATED_BLOG_TOPICS.filter((t) => normalize(t.phrase).includes(city));
}

/** @param {string} city @param {string} input */
function pickValidatedTopicForRh(city, input) {
  if (normalize(input).includes('automatiz') || hasIaOrAgencyIntent(input)) {
    const auto = findValidatedTopic('automatizacion recursos humanos');
    if (auto) return auto;
  }
  if (city === 'torreon') {
    const rh = findValidatedTopic('recursos humanos torreon');
    if (rh) return rh;
  }
  return (
    findValidatedTopic('recursos humanos torreon') ||
    findValidatedTopic('automatizacion recursos humanos') ||
    VALIDATED_BLOG_TOPICS[0]
  );
}

/** @param {string} city @param {string} userInput */
function buildRhBrief(city, userInput) {
  const place = city ? CITY_LABELS[city] ?? city : 'México';
  return [
    `El usuario escribió: «${userInput}». Artículo sobre recursos humanos en ${place}.`,
    'Cubrir lo que pidió (empresas especializadas, vacantes, servicios de RH en la zona). NO convertir el artículo en “agencia de IA” genérica.',
    'Si encaja, una sección breve sobre automatización con IA en procesos de RH (filtro de candidatos, respuestas, onboarding); CTA opcional a GH Specialist.',
  ].join(' ');
}

/** @param {string} city @param {string} input @param {string[]} services */
function pickValidatedTopicForCity(city, input, services) {
  const local = topicsForCity(city);
  if (!local.length) {
    return (
      findValidatedTopic('inteligencia artificial empresas mexico') || VALIDATED_BLOG_TOPICS[0]
    );
  }

  if (detectRhIntent(input)) {
    const rh = local.find((t) => normalize(t.phrase).includes('recursos humanos'));
    if (rh) return rh;
  }

  if (services.includes('chatbot')) {
    const chat = local.find((t) => normalize(t.phrase).includes('chatbot'));
    if (chat) return chat;
  }

  const iaLocal = local.find((t) => normalize(t.phrase).includes('inteligencia artificial'));
  if (iaLocal) return iaLocal;

  const ranked = local
    .map((t) => ({ t, score: scoreTopic(input, t) }))
    .sort((a, b) => b.score - a.score);
  return ranked[0]?.t ?? local[0];
}

/** @param {string} city @param {string} userInput */
function buildLocalBrief(city, userInput) {
  const label = CITY_LABELS[city] ?? city;
  const path = city === 'torreon' ? '/torreon/' : 'https://ghspecialist.com/';
  return [
    `Artículo LOCAL para empresas en ${label}. El usuario escribió: «${userInput}».`,
    'Enfócate en agencia o servicios de IA para negocios (chatbots WhatsApp, CRM Kommo, automatización de ventas y atención), NO en automatización industrial de maquinaria salvo que el usuario lo pida explícitamente.',
    `Menciona GH Specialist como implementador local. CTA a ${path} y WhatsApp +528712638082.`,
    'Incluye 2–3 beneficios concretos para PYMEs de la zona y casos de uso (inmobiliaria, servicios, retail).',
  ].join(' ');
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
  const city = detectCity(input);
  const rh = detectRhIntent(input);
  const ia = hasIaOrAgencyIntent(input);

  if (city) {
    if (phraseNorm.includes(city)) {
      if (rh && phraseNorm.includes('recursos humanos')) score += 14;
      else if (
        ia &&
        (phraseNorm.includes('inteligencia') ||
          phraseNorm.includes('chatbot') ||
          (phraseNorm.includes('automatiz') && !phraseNorm.includes('recursos humanos')))
      ) {
        score += 12;
      } else if (!rh && !ia) score += 1;
    } else if (rh || ia) score -= 8;
  }

  if (rh && phraseNorm.includes('recursos humanos')) score += 8;
  if (rh && phraseNorm.includes('humanos')) score += 4;

  const cs = detectCustomerServiceIntent(input);
  if (cs) {
    if (phraseNorm.includes('servicio') && phraseNorm.includes('cliente')) score += 16;
    if (phraseNorm.includes('atencion') && phraseNorm.includes('cliente')) score += 14;
    if (phraseNorm.includes('atencion') && phraseNorm.includes('cliente') && phraseNorm.includes('chatbot')) score += 4;
    if (
      phraseNorm.includes('inteligencia artificial') &&
      !phraseNorm.includes('cliente') &&
      !phraseNorm.includes('atencion') &&
      !phraseNorm.includes('servicio')
    ) {
      score -= 10;
    }
  }

  if (services.includes('atencion') || cs) {
    if (phraseNorm.includes('atencion') || phraseNorm.includes('servicio')) score += 6;
  }

  if (services.includes('chatbot') && phraseNorm.includes('chatbot')) score += 4;
  if (services.includes('whatsapp') && phraseNorm.includes('whatsapp')) score += 4;
  if (services.includes('crm') && (phraseNorm.includes('crm') || phraseNorm.includes('kommo'))) score += 4;
  if ((services.includes('ia') || services.includes('agencia')) && phraseNorm.includes('inteligencia')) score += 5;
  if (services.includes('ia') && phraseNorm.includes('ia')) score += 3;
  if (services.includes('agencia') && phraseNorm.includes('inteligencia')) score += 4;
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
  agencia: 'agencia de IA',
  seo: 'SEO en Google',
  agente: 'agente de IA',
  ventas: 'embudo de ventas',
  pyme: 'PYMEs',
};

/** @param {string[]} services @param {string} input */
function buildComparativeBrief(services, input) {
  const labels = services.map((s) => SERVICE_LABELS[s] ?? s).join(', ');
  const city = detectCity(input);
  const localNote = city
    ? ` Contexto local: ${CITY_LABELS[city] ?? city}.`
    : '';
  const parts = [
    `Guía comparativa para dueños de negocio en México sobre: ${labels}.${localNote}`,
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
  const city = detectCity(input);
  if (city && hasIaOrAgencyIntent(input)) {
    return pickValidatedTopicForCity(city, input, services);
  }

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
  if (services.includes('ia') || services.includes('agencia')) {
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
      contentBrief: detectCustomerServiceIntent(trimmed)
        ? buildCustomerServiceBrief(trimmed)
        : undefined,
    };
  }

  const near = findNearValidatedTopic(trimmed);
  if (near) {
    return {
      topic: near,
      userInput: trimmed,
      autoCorrected: normalize(trimmed) !== normalize(near.phrase),
      message:
        normalize(trimmed) === normalize(near.phrase)
          ? 'Frase validada en Google MX.'
          : `Ajustado a frase validada: «${near.phrase}»`,
      suggestions: [],
      contentBrief: detectCustomerServiceIntent(trimmed)
        ? buildCustomerServiceBrief(trimmed)
        : undefined,
    };
  }

  const city = detectCity(trimmed);
  const services = detectServices(trimmed);

  if (detectCustomerServiceIntent(trimmed)) {
    const topic = pickAnchorForCustomerService(trimmed, services);
    return {
      topic,
      userInput: trimmed,
      autoCorrected: normalize(trimmed) !== normalize(topic.phrase),
      message: `Entendí automatización de servicio y atención al cliente. Frase SEO Google MX: «${topic.phrase}».`,
      suggestions: [
        'automatizacion de servicio al cliente',
        'automatizacion atencion al cliente',
        'chatbot atencion al cliente whatsapp',
        'atencion cliente chatbot',
      ],
      contentBrief: buildCustomerServiceBrief(trimmed),
    };
  }

  if (detectRhIntent(trimmed)) {
    const topic = pickValidatedTopicForRh(city, trimmed);
    const place = city ? CITY_LABELS[city] ?? city : 'México';
    return {
      topic,
      userInput: trimmed,
      autoCorrected: true,
      message: `Entendí recursos humanos en ${place}. Frase SEO Google MX: «${topic.phrase}».`,
      suggestions: [
        'recursos humanos torreon',
        'automatizacion recursos humanos',
        ...(city === 'torreon' ? [] : ['inteligencia artificial torreon']),
      ],
      contentBrief: buildRhBrief(city, trimmed),
    };
  }

  if (city && hasIaOrAgencyIntent(trimmed)) {
    const topic = pickValidatedTopicForCity(city, trimmed, services);
    const cityLabel = CITY_LABELS[city] ?? city;
    const localSuggestions = topicsForCity(city).map((t) => t.phrase);
    return {
      topic,
      userInput: trimmed,
      autoCorrected: true,
      message: `Entendí servicios/agencia de IA en ${cityLabel}. Frase SEO Google MX: «${topic.phrase}».`,
      suggestions: localSuggestions.length
        ? localSuggestions
        : ['inteligencia artificial torreon', 'chatbot torreon'],
      contentBrief: buildLocalBrief(city, trimmed),
    };
  }

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
    findValidatedTopic('inteligencia artificial para pymes mexico') ??
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
  return Boolean(
    brief?.includes('Guía comparativa para dueños de negocio') ||
      brief?.includes('Artículo LOCAL para empresas') ||
      brief?.includes('recursos humanos en') ||
      brief?.includes('AUTOMATIZACIÓN DE SERVICIO Y ATENCIÓN AL CLIENTE')
  );
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
