/**
 * Preview de tema en panel — misma lógica que scripts/gh-blog-topic-resolve.mjs (local primero).
 */
(function (global) {
  var VALIDATED_BLOG_TOPICS = [
    {
      "phrase": "chatbot whatsapp negocios mexico",
      "category": "Chatbots"
    },
    {
      "phrase": "chatbot whatsapp para empresas",
      "category": "Chatbots"
    },
    {
      "phrase": "chatbot con inteligencia artificial",
      "category": "Chatbots"
    },
    {
      "phrase": "chatbot whatsapp precio",
      "category": "Chatbots"
    },
    {
      "phrase": "precio chatbot whatsapp",
      "category": "Chatbots"
    },
    {
      "phrase": "precio chatbot con ia",
      "category": "Chatbots"
    },
    {
      "phrase": "chatbot whatsapp business precio",
      "category": "Chatbots"
    },
    {
      "phrase": "atencion cliente chatbot",
      "category": "Chatbots"
    },
    {
      "phrase": "atencion al cliente chatbot",
      "category": "Chatbots"
    },
    {
      "phrase": "chatbot atencion al cliente whatsapp",
      "category": "Chatbots"
    },
    {
      "phrase": "bot whatsapp para empresas",
      "category": "Chatbots"
    },
    {
      "phrase": "como crear chatbot whatsapp",
      "category": "Chatbots"
    },
    {
      "phrase": "asistente virtual whatsapp empresas",
      "category": "Chatbots"
    },
    {
      "phrase": "chatbot inmobiliaria whatsapp",
      "category": "Chatbots"
    },
    {
      "phrase": "chatbot torreon",
      "category": "Chatbots"
    },
    {
      "phrase": "chatbot monterrey",
      "category": "Chatbots"
    },
    {
      "phrase": "automatizacion de servicio al cliente",
      "category": "Automatización"
    },
    {
      "phrase": "automatizacion atencion al cliente",
      "category": "Automatización"
    },
    {
      "phrase": "automatizar ventas por whatsapp",
      "category": "Automatización"
    },
    {
      "phrase": "automatizacion de ventas whatsapp",
      "category": "Automatización"
    },
    {
      "phrase": "automatizacion whatsapp pymes",
      "category": "Automatización"
    },
    {
      "phrase": "respuestas automaticas whatsapp",
      "category": "Automatización"
    },
    {
      "phrase": "respuestas automaticas whatsapp ia",
      "category": "Automatización"
    },
    {
      "phrase": "respuestas automaticas whatsapp business",
      "category": "Automatización"
    },
    {
      "phrase": "como automatizar mi negocio con ia",
      "category": "Automatización"
    },
    {
      "phrase": "automatizar negocio con inteligencia artificial",
      "category": "Automatización"
    },
    {
      "phrase": "automatizacion recursos humanos",
      "category": "Automatización"
    },
    {
      "phrase": "automatizacion torreon",
      "category": "Automatización"
    },
    {
      "phrase": "automatizacion monterrey",
      "category": "Automatización"
    },
    {
      "phrase": "agencia automatizacion whatsapp mexico",
      "category": "Automatización"
    },
    {
      "phrase": "inteligencia artificial empresas mexico",
      "category": "IA"
    },
    {
      "phrase": "inteligencia artificial para pymes mexico",
      "category": "IA"
    },
    {
      "phrase": "inteligencia artificial pymes",
      "category": "IA"
    },
    {
      "phrase": "inteligencia artificial torreon",
      "category": "IA"
    },
    {
      "phrase": "inteligencia artificial monterrey",
      "category": "IA"
    },
    {
      "phrase": "agencia inteligencia artificial mexico",
      "category": "IA"
    },
    {
      "phrase": "consultoria inteligencia artificial mexico",
      "category": "IA"
    },
    {
      "phrase": "transformacion digital pymes",
      "category": "IA"
    },
    {
      "phrase": "ia para ventas whatsapp",
      "category": "IA"
    },
    {
      "phrase": "agente de ia para whatsapp",
      "category": "IA"
    },
    {
      "phrase": "agente ia whatsapp",
      "category": "IA"
    },
    {
      "phrase": "agente de ia por whatsapp",
      "category": "IA"
    },
    {
      "phrase": "agente de ventas ia whatsapp",
      "category": "IA"
    },
    {
      "phrase": "agente ia whatsapp business",
      "category": "IA"
    },
    {
      "phrase": "crear agente ia en whatsapp",
      "category": "IA"
    },
    {
      "phrase": "crm kommo que es",
      "category": "CRM"
    },
    {
      "phrase": "crm kommo whatsapp",
      "category": "CRM"
    },
    {
      "phrase": "kommo crm whatsapp",
      "category": "CRM"
    },
    {
      "phrase": "kommo crm para whatsapp",
      "category": "CRM"
    },
    {
      "phrase": "kommo crm whatsapp api",
      "category": "CRM"
    },
    {
      "phrase": "kommo crm whatsapp business",
      "category": "CRM"
    },
    {
      "phrase": "kommo crm como funciona",
      "category": "CRM"
    },
    {
      "phrase": "kommo crm precios",
      "category": "CRM"
    },
    {
      "phrase": "integracion crm whatsapp",
      "category": "CRM"
    },
    {
      "phrase": "software crm whatsapp mexico",
      "category": "CRM"
    },
    {
      "phrase": "embudo ventas whatsapp",
      "category": "WhatsApp"
    },
    {
      "phrase": "embudo de ventas whatsapp",
      "category": "WhatsApp"
    },
    {
      "phrase": "whatsapp business api mexico",
      "category": "WhatsApp"
    },
    {
      "phrase": "whatsapp business api como funciona",
      "category": "WhatsApp"
    },
    {
      "phrase": "whatsapp business api costo",
      "category": "WhatsApp"
    },
    {
      "phrase": "whatsapp business api precios",
      "category": "WhatsApp"
    },
    {
      "phrase": "servicio al cliente whatsapp",
      "category": "WhatsApp"
    },
    {
      "phrase": "servicio al cliente whatsapp business",
      "category": "WhatsApp"
    },
    {
      "phrase": "marketing whatsapp pymes",
      "category": "WhatsApp"
    },
    {
      "phrase": "como posicionar mi pagina en google mexico",
      "category": "SEO"
    },
    {
      "phrase": "como posicionar pagina google mexico",
      "category": "SEO"
    },
    {
      "phrase": "posicionar pagina en google",
      "category": "SEO"
    },
    {
      "phrase": "posicionar negocio en google maps",
      "category": "SEO"
    },
    {
      "phrase": "posicionar en google maps",
      "category": "SEO"
    },
    {
      "phrase": "seo para pymes mexico",
      "category": "SEO"
    },
    {
      "phrase": "cuanto cuesta posicionar pagina google mexico",
      "category": "SEO"
    },
    {
      "phrase": "seo con ia",
      "category": "SEO"
    },
    {
      "phrase": "seo inteligencia artificial",
      "category": "SEO"
    },
    {
      "phrase": "hacer seo con ia",
      "category": "SEO"
    },
    {
      "phrase": "agencia seo con ia",
      "category": "SEO"
    },
    {
      "phrase": "posicionamiento seo con ia",
      "category": "SEO"
    },
    {
      "phrase": "seo local con ia",
      "category": "SEO"
    },
    {
      "phrase": "crear contenido con ia",
      "category": "SEO"
    },
    {
      "phrase": "crear contenido con ia para youtube",
      "category": "SEO"
    },
    {
      "phrase": "marketing digital con ia",
      "category": "IA"
    },
    {
      "phrase": "crear videos con ia",
      "category": "IA"
    },
    {
      "phrase": "videos con inteligencia artificial",
      "category": "IA"
    },
    {
      "phrase": "video marketing con ia",
      "category": "IA"
    },
    {
      "phrase": "generar videos ia",
      "category": "IA"
    },
    {
      "phrase": "crear videos con ia a partir de texto",
      "category": "IA"
    },
    {
      "phrase": "growth hacking que es",
      "category": "Consejos"
    },
    {
      "phrase": "growth hacking mexico",
      "category": "Consejos"
    },
    {
      "phrase": "growth hacking empresa",
      "category": "Consejos"
    },
    {
      "phrase": "growth hacking estrategias",
      "category": "Consejos"
    },
    {
      "phrase": "growth hacking marketing que es",
      "category": "Consejos"
    },
    {
      "phrase": "growth hacking y marketing digital",
      "category": "Consejos"
    },
    {
      "phrase": "recursos humanos torreon",
      "category": "Consejos"
    }
  ];

  var CITY_ALIASES = {
    torreon: ['torreon', 'torreón', 'la laguna', 'laguna', 'gomez palacio', 'gómez palacio', 'lerdo'],
    monterrey: ['monterrey', 'nuevo leon', 'nuevo león'],
    cdmx: ['cdmx', 'ciudad de mexico', 'ciudad de méxico', 'df'],
    guadalajara: ['guadalajara', 'jalisco'],
    queretaro: ['queretaro', 'querétaro'],
    chihuahua: ['chihuahua'],
  };

  var CITY_LABELS = {
    torreon: 'Torreón y La Laguna',
    monterrey: 'Monterrey',
    cdmx: 'CDMX',
    guadalajara: 'Guadalajara',
    queretaro: 'Querétaro',
    chihuahua: 'Chihuahua',
  };

  var SERVICE_ALIASES = {
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
    ],
  };

  var SERVICE_LABELS = {
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
    return normalize(s).split(' ').filter(function (w) {
      return w.length > 2 || w === 'ia' || w === 'seo' || w === 'crm';
    });
  }

  function findValidatedTopic(phrase) {
    var n = normalize(phrase);
    for (var i = 0; i < VALIDATED_BLOG_TOPICS.length; i++) {
      if (normalize(VALIDATED_BLOG_TOPICS[i].phrase) === n) return VALIDATED_BLOG_TOPICS[i];
    }
    return null;
  }

  function findNearValidatedTopic(input) {
    var n = normalize(input);
    var best;
    var bestScore = 0;
    for (var i = 0; i < VALIDATED_BLOG_TOPICS.length; i++) {
      var t = VALIDATED_BLOG_TOPICS[i];
      var p = normalize(t.phrase);
      if (p === n) return t;
      var inputTokens = tokenize(input);
      var phraseTokens = tokenize(t.phrase);
      var overlap = 0;
      for (var j = 0; j < phraseTokens.length; j++) {
        if (inputTokens.indexOf(phraseTokens[j]) >= 0) overlap++;
      }
      var ratio = overlap / Math.max(phraseTokens.length, 1);
      if (ratio >= 0.55 && overlap >= 2 && ratio > bestScore) {
        bestScore = ratio;
        best = t;
      }
    }
    return best;
  }

  function detectCity(input) {
    var n = normalize(input);
    var keys = Object.keys(CITY_ALIASES);
    for (var i = 0; i < keys.length; i++) {
      var city = keys[i];
      var aliases = CITY_ALIASES[city];
      for (var j = 0; j < aliases.length; j++) {
        if (n.indexOf(normalize(aliases[j])) >= 0) return city;
      }
    }
    return null;
  }

  function hasIaOrAgencyIntent(input) {
    var n = normalize(input);
    return (
      /\bia\b/.test(n) ||
      n.indexOf('inteligencia artificial') >= 0 ||
      n.indexOf('automatiz') >= 0 ||
      n.indexOf('agencia') >= 0 ||
      n.indexOf('agente') >= 0 ||
      n.indexOf('chatbot') >= 0
    );
  }

  function detectCustomerServiceIntent(input) {
    var n = normalize(input);
    return (
      n.indexOf('servicio al cliente') >= 0 ||
      n.indexOf('atencion al cliente') >= 0 ||
      n.indexOf('atencion cliente') >= 0 ||
      n.indexOf('soporte al cliente') >= 0 ||
      (n.indexOf('cliente') >= 0 && (n.indexOf('automatiz') >= 0 || n.indexOf('chatbot') >= 0))
    );
  }

  function detectRhIntent(input) {
    var n = normalize(input);
    return (
      n.indexOf('recursos humanos') >= 0 ||
      /\brh\b/.test(n) ||
      n.indexOf('nomina') >= 0 ||
      n.indexOf('reclutamiento') >= 0 ||
      n.indexOf('capital humano') >= 0 ||
      (n.indexOf('especializada') >= 0 && n.indexOf('humanos') >= 0)
    );
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
    if (n.indexOf('agencia') >= 0 && found.indexOf('ia') < 0) found.push('ia');
    return found;
  }

  function topicsForCity(city) {
    return VALIDATED_BLOG_TOPICS.filter(function (t) {
      return normalize(t.phrase).indexOf(city) >= 0;
    });
  }

  function scoreTopic(input, topic) {
    var set = {};
    tokenize(input).forEach(function (t) {
      set[t] = true;
    });
    var score = 0;
    tokenize(topic.phrase).forEach(function (t) {
      if (set[t]) score += 3;
    });
    var phraseNorm = normalize(topic.phrase);
    var services = detectServices(input);
    var city = detectCity(input);

    var rh = detectRhIntent(input);
    var ia = hasIaOrAgencyIntent(input);
    if (city) {
      if (phraseNorm.indexOf(city) >= 0) {
        if (rh && phraseNorm.indexOf('recursos humanos') >= 0) score += 14;
        else if (
          ia &&
          (phraseNorm.indexOf('inteligencia') >= 0 || phraseNorm.indexOf('chatbot') >= 0)
        ) {
          score += 12;
        }
      } else if (rh || ia) score -= 8;
    }
    if (rh && phraseNorm.indexOf('recursos humanos') >= 0) score += 8;
    var cs = detectCustomerServiceIntent(input);
    if (cs) {
      if (phraseNorm.indexOf('servicio') >= 0 && phraseNorm.indexOf('cliente') >= 0) score += 16;
      if (phraseNorm.indexOf('atencion') >= 0 && phraseNorm.indexOf('cliente') >= 0) score += 14;
      if (phraseNorm.indexOf('inteligencia artificial') >= 0 && phraseNorm.indexOf('cliente') < 0) score -= 10;
    }
    if (services.indexOf('chatbot') >= 0 && phraseNorm.indexOf('chatbot') >= 0) score += 4;
    if (services.indexOf('whatsapp') >= 0 && phraseNorm.indexOf('whatsapp') >= 0) score += 4;
    if (services.indexOf('crm') >= 0 && (phraseNorm.indexOf('crm') >= 0 || phraseNorm.indexOf('kommo') >= 0)) score += 4;
    if (
      (services.indexOf('ia') >= 0 || services.indexOf('agencia') >= 0) &&
      phraseNorm.indexOf('inteligencia') >= 0
    ) {
      score += 5;
    }
    if (services.indexOf('seo') >= 0 && (phraseNorm.indexOf('google') >= 0 || phraseNorm.indexOf('posicionar') >= 0)) {
      score += 5;
    }
    return score;
  }

  function pickValidatedTopicForCity(city, input, services) {
    var local = topicsForCity(city);
    if (!local.length) return findValidatedTopic('inteligencia artificial empresas mexico') || VALIDATED_BLOG_TOPICS[0];
    if (services.indexOf('chatbot') >= 0) {
      for (var i = 0; i < local.length; i++) {
        if (normalize(local[i].phrase).indexOf('chatbot') >= 0) return local[i];
      }
    }
    for (var j = 0; j < local.length; j++) {
      if (normalize(local[j].phrase).indexOf('inteligencia artificial') >= 0) return local[j];
    }
    var ranked = local
      .map(function (t) {
        return { t: t, score: scoreTopic(input, t) };
      })
      .sort(function (a, b) {
        return b.score - a.score;
      });
    return ranked[0] ? ranked[0].t : local[0];
  }

  function pickAnchorForComparative(input, services) {
    var city = detectCity(input);
    if (city && hasIaOrAgencyIntent(input)) {
      return pickValidatedTopicForCity(city, input, services);
    }
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

    var near = findNearValidatedTopic(trimmed);
    if (near) {
      return {
        topic: near,
        userInput: trimmed,
        autoCorrected: normalize(trimmed) !== normalize(near.phrase),
        message:
          normalize(trimmed) === normalize(near.phrase)
            ? 'Frase validada en Google MX.'
            : 'Ajustado a frase del catálogo: «' + near.phrase + '»',
        suggestions: [],
      };
    }

    var city = detectCity(trimmed);
    var services = detectServices(trimmed);

    if (detectCustomerServiceIntent(trimmed)) {
      var csTopic = findValidatedTopic('automatizacion de servicio al cliente') || VALIDATED_BLOG_TOPICS[0];
      if (normalize(trimmed).indexOf('whatsapp') >= 0) {
        csTopic = findValidatedTopic('chatbot atencion al cliente whatsapp') || csTopic;
      }
      return {
        topic: csTopic,
        userInput: trimmed,
        autoCorrected: normalize(trimmed) !== normalize(csTopic.phrase),
        message:
          'Entendí automatización de servicio y atención al cliente. Frase SEO Google MX: «' +
          csTopic.phrase +
          '».',
        suggestions: [
          'automatizacion de servicio al cliente',
          'automatizacion atencion al cliente',
          'chatbot atencion al cliente whatsapp',
          'atencion cliente chatbot',
        ],
        contentBrief: true,
      };
    }

    if (detectRhIntent(trimmed)) {
      var rhTopic = findValidatedTopic('recursos humanos torreon') || VALIDATED_BLOG_TOPICS[0];
      if (normalize(trimmed).indexOf('automatiz') >= 0) {
        rhTopic = findValidatedTopic('automatizacion recursos humanos') || rhTopic;
      }
      var rhPlace = city ? CITY_LABELS[city] || city : 'México';
      return {
        topic: rhTopic,
        userInput: trimmed,
        autoCorrected: true,
        message:
          'Entendí recursos humanos en ' + rhPlace + '. Frase SEO Google MX: «' + rhTopic.phrase + '».',
        suggestions: ['recursos humanos torreon', 'automatizacion recursos humanos'],
        contentBrief: true,
      };
    }

    if (city && hasIaOrAgencyIntent(trimmed)) {
      var localTopic = pickValidatedTopicForCity(city, trimmed, services);
      var cityLabel = CITY_LABELS[city] || city;
      var localSuggestions = topicsForCity(city).map(function (t) {
        return t.phrase;
      });
      return {
        topic: localTopic,
        userInput: trimmed,
        autoCorrected: true,
        message:
          'Entendí servicios/agencia de IA en ' +
          cityLabel +
          '. Frase SEO Google MX: «' +
          localTopic.phrase +
          '».',
        suggestions: localSuggestions.length ? localSuggestions : ['inteligencia artificial torreon', 'chatbot torreon'],
        contentBrief: true,
      };
    }

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

    var suggestions = ranked.slice(0, 8).map(function (x) {
      return x.t.phrase;
    });
    var best = ranked[0];

    if (best && best.score >= 2) {
      return {
        topic: best.t,
        userInput: trimmed,
        autoCorrected: normalize(trimmed) !== normalize(best.t.phrase),
        message:
          normalize(trimmed) === normalize(best.t.phrase)
            ? 'Frase validada en Google MX.'
            : 'Mejor coincidencia en catálogo: «' + best.t.phrase + '»',
        suggestions: suggestions,
      };
    }

    if (isGhBlogUserIntent(trimmed)) {
      var customPhrase = normalize(trimmed);
      return {
        topic: { phrase: customPhrase, category: 'Consejos' },
        userInput: trimmed,
        autoCorrected: false,
        message:
          'Se publicará con tu frase (no hace falta catálogo): «' + customPhrase + '».',
        suggestions: suggestions,
        contentBrief: true,
      };
    }

    var fallback = best ? best.t : VALIDATED_BLOG_TOPICS[0];
    return {
      topic: fallback,
      userInput: trimmed,
      autoCorrected: true,
      message: best
        ? 'Aproximado a: «' + fallback.phrase + '». Al publicar, el servidor consulta Google Suggest MX.'
        : 'No encontré coincidencia clara. Al publicar se busca en Google Suggest MX.',
      suggestions: suggestions.length
        ? suggestions
        : VALIDATED_BLOG_TOPICS.slice(0, 8).map(function (t) {
            return t.phrase;
          }),
    };
  }

  function isGhBlogUserIntent(input) {
    var n = normalize(input);
    if (n.length < 8) return false;
    return /whatsapp|chatbot|kommo|crm|automatiz|inteligencia|google|seo|agente|embudo|pyme|negocio|ia\b|ventas|cliente|marketing|video|contenido|growth|hacking|competencia|analisis|estrategia|youtube|tiktok|instagram|digital/.test(
      n
    );
  }

  function previewTopicInput(userInput) {
    if (!(userInput || '').trim()) {
      return {
        exact: true,
        resolvedPhrase: '',
        message: 'Vacío = el sistema elige el siguiente tema del catálogo automáticamente.',
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

  global.GH_BlogTopic = {
    previewTopicInput: previewTopicInput,
    resolveTopicInput: resolveTopicInput,
    fetchPreview: function (input) {
      return Promise.resolve(previewTopicInput(input));
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
