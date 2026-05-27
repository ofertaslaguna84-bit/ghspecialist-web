/**
 * Preview de tema en panel (misma lógica que scripts/gh-blog-topic-resolve.mjs).
 */
(function (global) {
  var VALIDATED_BLOG_TOPICS = [
    { phrase: 'chatbot whatsapp negocios mexico', category: 'Chatbots' },
    { phrase: 'chatbot whatsapp para empresas', category: 'Chatbots' },
    { phrase: 'chatbot con inteligencia artificial', category: 'Chatbots' },
    { phrase: 'chatbot whatsapp precio', category: 'Chatbots' },
    { phrase: 'atencion cliente chatbot', category: 'Chatbots' },
    { phrase: 'como automatizar mi negocio con ia', category: 'Automatización' },
    { phrase: 'automatizar negocio con inteligencia artificial', category: 'Automatización' },
    { phrase: 'automatizacion whatsapp pymes', category: 'Automatización' },
    { phrase: 'automatizacion de ventas whatsapp', category: 'Automatización' },
    { phrase: 'inteligencia artificial empresas mexico', category: 'IA' },
    { phrase: 'inteligencia artificial para pymes mexico', category: 'IA' },
    { phrase: 'agente de ia para whatsapp', category: 'IA' },
    { phrase: 'agente ia whatsapp', category: 'IA' },
    { phrase: 'crm kommo que es', category: 'CRM' },
    { phrase: 'crm kommo whatsapp', category: 'CRM' },
    { phrase: 'embudo ventas whatsapp', category: 'WhatsApp' },
    { phrase: 'whatsapp business api mexico', category: 'WhatsApp' },
    { phrase: 'como posicionar mi pagina en google mexico', category: 'SEO' },
    { phrase: 'como posicionar pagina google mexico', category: 'SEO' },
  ];

  var SERVICE_ALIASES = {
    chatbot: ['chatbot', 'bot', 'asistente virtual', 'asistente'],
    whatsapp: ['whatsapp', 'wsp', 'wa', 'business api', 'whats app'],
    crm: ['crm', 'kommo', 'pipedrive', 'hubspot'],
    ia: ['ia', 'inteligencia artificial', 'automatiz', 'automatizar', ' ai '],
    seo: ['seo', 'posicionar', 'posicionamiento', 'google', 'ranking'],
    agente: ['agente', 'agentes'],
    ventas: ['embudo', 'ventas', 'vender', 'cerrar ventas'],
    pyme: ['pyme', 'pymes', 'negocio', 'empresa', 'empresas'],
  };

  var SERVICE_LABELS = {
    chatbot: 'chatbot',
    whatsapp: 'WhatsApp',
    crm: 'CRM Kommo',
    ia: 'automatización con IA',
    seo: 'SEO en Google',
    agente: 'agente de IA',
    ventas: 'embudo de ventas',
    pyme: 'PYMEs',
  };

  function normalize(s) {
    return s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[,;/|+&]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function findValidatedTopic(phrase) {
    var n = normalize(phrase);
    for (var i = 0; i < VALIDATED_BLOG_TOPICS.length; i++) {
      if (normalize(VALIDATED_BLOG_TOPICS[i].phrase) === n) return VALIDATED_BLOG_TOPICS[i];
    }
    return null;
  }

  function tokenize(s) {
    return normalize(s).split(' ').filter(function (w) {
      return w.length > 2;
    });
  }

  function detectServices(input) {
    var n = ' ' + normalize(input) + ' ';
    var found = [];
    Object.keys(SERVICE_ALIASES).forEach(function (service) {
      var aliases = SERVICE_ALIASES[service];
      for (var j = 0; j < aliases.length; j++) {
        var a = normalize(aliases[j]);
        if (n.indexOf(' ' + a + ' ') >= 0 || n.indexOf(a) >= 0) {
          found.push(service);
          break;
        }
      }
    });
    return found;
  }

  function scoreTopic(input, topic) {
    var inputTokens = tokenize(input);
    var set = {};
    inputTokens.forEach(function (t) {
      set[t] = true;
    });
    var phraseTokens = tokenize(topic.phrase);
    var score = 0;
    var phraseNorm = normalize(topic.phrase);
    var services = detectServices(input);

    phraseTokens.forEach(function (t) {
      if (set[t]) score += 3;
    });

    if (services.indexOf('chatbot') >= 0 && phraseNorm.indexOf('chatbot') >= 0) score += 4;
    if (services.indexOf('whatsapp') >= 0 && phraseNorm.indexOf('whatsapp') >= 0) score += 4;
    if (services.indexOf('crm') >= 0 && (phraseNorm.indexOf('crm') >= 0 || phraseNorm.indexOf('kommo') >= 0)) score += 4;
    if (services.indexOf('ia') >= 0 && (phraseNorm.indexOf('ia') >= 0 || phraseNorm.indexOf('inteligencia') >= 0)) score += 4;
    if (services.indexOf('seo') >= 0 && (phraseNorm.indexOf('google') >= 0 || phraseNorm.indexOf('posicionar') >= 0)) score += 5;

    return score;
  }

  function pickAnchorForComparative(input, services) {
    if (services.indexOf('seo') >= 0) {
      var seo = findValidatedTopic('como posicionar mi pagina en google mexico');
      if (seo) return seo;
    }
    if (services.indexOf('chatbot') >= 0 && services.indexOf('whatsapp') >= 0) {
      var cw = findValidatedTopic('chatbot whatsapp para empresas');
      if (cw) return cw;
    }
    var ranked = VALIDATED_BLOG_TOPICS.map(function (t) {
      return { t: t, score: scoreTopic(input, t) };
    }).sort(function (a, b) {
      return b.score - a.score;
    });
    return ranked[0] ? ranked[0].t : VALIDATED_BLOG_TOPICS[0];
  }

  function resolveTopicInput(userInput) {
    var trimmed = (userInput || '').trim();
    var exact = findValidatedTopic(trimmed);
    if (exact) {
      return {
        topic: exact,
        userInput: trimmed,
        autoCorrected: false,
        message: 'Frase validada en Google MX.',
        suggestions: [],
      };
    }

    var services = detectServices(trimmed);
    if (services.length >= 2) {
      var topic = pickAnchorForComparative(trimmed, services);
      var labels = services
        .map(function (s) {
          return SERVICE_LABELS[s] || s;
        })
        .join(', ');
      return {
        topic: topic,
        userInput: trimmed,
        autoCorrected: true,
        message:
          'Entendí comparativa de: ' +
          labels +
          '. SEO ancla: «' +
          topic.phrase +
          '». El artículo incluirá tabla comparativa.',
        suggestions: [
          'chatbot whatsapp para empresas',
          'crm kommo whatsapp',
          'como automatizar mi negocio con ia',
          'como posicionar mi pagina en google mexico',
        ],
        contentBrief: true,
      };
    }

    var ranked = VALIDATED_BLOG_TOPICS.map(function (t) {
      return { t: t, score: scoreTopic(trimmed, t) };
    })
      .filter(function (x) {
        return x.score > 0;
      })
      .sort(function (a, b) {
        return b.score - a.score;
      });

    var suggestions = ranked.slice(0, 5).map(function (x) {
      return x.t.phrase;
    });
    var best = ranked[0];

    if (best && best.score >= 4) {
      return {
        topic: best.t,
        userInput: trimmed,
        autoCorrected: true,
        message: 'Corregido automáticamente a: «' + best.t.phrase + '»',
        suggestions: suggestions,
      };
    }

    var fallback = best ? best.t : VALIDATED_BLOG_TOPICS[0];
    return {
      topic: fallback,
      userInput: trimmed,
      autoCorrected: true,
      message: best
        ? 'Aproximado a: «' + fallback.phrase + '». Si no es lo que buscas, elige una sugerencia.'
        : 'No encontré coincidencia clara. Usando tema similar.',
      suggestions: suggestions.length ? suggestions : VALIDATED_BLOG_TOPICS.slice(0, 5).map(function (t) {
        return t.phrase;
      }),
    };
  }

  function previewTopicInput(userInput) {
    if (!(userInput || '').trim()) {
      return {
        exact: true,
        resolvedPhrase: '',
        message: 'Vacío = el sistema elige el siguiente tema validado automáticamente.',
        suggestions: [],
        willExpandContent: false,
      };
    }
    var r = resolveTopicInput(userInput);
    return {
      exact: !r.autoCorrected,
      resolvedPhrase: r.topic.phrase,
      message: r.message,
      suggestions: r.suggestions,
      willExpandContent: Boolean(r.contentBrief),
    };
  }

  function fetchRemotePreview(input) {
    var base = ((global.GH_SITE_CONFIG && global.GH_SITE_CONFIG.blogApiBase) || 'https://adestajo.com.mx').replace(
      /\/$/,
      ''
    );
    return fetch(base + '/api/ghspecialist/suggest-topic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: input }),
    })
      .then(function (res) {
        if (!res.ok) throw new Error('API ' + res.status);
        return res.json();
      });
  }

  global.GH_BlogTopic = {
    previewTopicInput: previewTopicInput,
    resolveTopicInput: resolveTopicInput,
    fetchPreview: function (input) {
      return fetchRemotePreview(input).catch(function () {
        return previewTopicInput(input);
      });
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
