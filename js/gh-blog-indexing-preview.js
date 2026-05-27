/**
 * Preview de keywords por región (Google Suggest MX) — mismo criterio que el servidor.
 */
(function (global) {
  var REGIONS = [
    { id: 'mexico', label: 'México (general)', suffix: 'mexico' },
    { id: 'torreon', label: 'Torreón y La Laguna', suffix: 'torreon' },
    { id: 'monterrey', label: 'Monterrey', suffix: 'monterrey' },
  ];

  var SKIP =
    /ine\b|issste|iess\b|msp\b|famisanar|colsubsidio|excel\b|noticias|hospital|\b2026\b|\b2025\b|imprimir|pdf|pasaporte|placas\b|licencia de conducir|para unas\b|imss\b|sat\b|manicurista|plantilla/;

  var NICHE =
    /whatsapp|chatbot|kommo|crm|automatiz|inteligencia|google|seo|agente|embudo|pyme|negocio|\bia\b|ventas|cliente|marketing|video|contenido|citas|agenda|agendar|reserva|calendario|mexico|torreon|monterrey|digital/;

  function normalize(s) {
    return s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function fetchSuggest(q) {
    var url =
      'https://suggestqueries.google.com/complete/search?' +
      new URLSearchParams({ client: 'firefox', q: q, hl: 'es', gl: 'mx' });
    return fetch(url)
      .then(function (res) {
        return res.arrayBuffer();
      })
      .then(function (buf) {
        var text = new TextDecoder('latin1').decode(buf);
        var data = JSON.parse(text);
        return (data[1] || []).map(function (s) {
          return String(s).toLowerCase().trim();
        });
      });
  }

  function pickKeywords(query, suggestions, max) {
    var n = normalize(query);
    var tokens = n.split(' ').filter(function (w) {
      return w.length > 2 || w === 'ia';
    });
    var out = [];
    var seen = {};

    function add(p) {
      if (!p || p.length < 8 || seen[p]) return;
      if (SKIP.test(p) || !NICHE.test(p)) return;
      seen[p] = true;
      out.push(p);
    }

    add(n);
    suggestions.forEach(function (raw) {
      var p = normalize(raw);
      if (SKIP.test(p) || p.length > 90) return;
      var score = 0;
      tokens.forEach(function (tok) {
        if (p.indexOf(tok) >= 0) score += 4;
      });
      if (/whatsapp|chatbot|automatiz|kommo|crm|inteligencia|\bia\b|negocio|pyme/.test(p)) score += 3;
      if (score > 0) add(p);
    });
    if (/cita|agenda|reserva/.test(n)) {
      add('agendar citas whatsapp');
      add('automatizar citas whatsapp');
    }
    return out.slice(0, max);
  }

  function stripGeo(topic) {
    var n = normalize(topic);
    REGIONS.forEach(function (r) {
      if (r.suffix !== 'mexico') n = n.replace(new RegExp('\\b' + r.suffix + '\\b', 'g'), ' ');
    });
    n = n.replace(/\bmexico\b/g, ' ').replace(/\s+/g, ' ').trim();
    return n || normalize(topic);
  }

  function delay(ms) {
    return new Promise(function (r) {
      setTimeout(r, ms);
    });
  }

  function fetchIndexingPreview(userTopic) {
    var trimmed = (userTopic || '').trim();
    if (!trimmed) return Promise.resolve(null);

    var base = stripGeo(trimmed);
    var chain = fetchSuggest(trimmed).then(function (sug) {
      return {
        intro:
          'Vamos a indexar búsquedas como las que la gente hace en Google (Suggest México), alineadas a tu post:',
        enArticulo: pickKeywords(trimmed, sug, 5),
        regions: [],
      };
    });

    REGIONS.forEach(function (reg, i) {
      chain = chain.then(function (acc) {
        var q = (base + ' ' + reg.suffix).replace(/\s+/g, ' ').trim();
        return delay(i ? 150 : 0).then(function () {
          return fetchSuggest(q);
        }).then(function (sug) {
          acc.regions.push({
            id: reg.id,
            region: reg.label,
            query: q,
            keywords: pickKeywords(q, sug, 3),
          });
          return acc;
        });
      });
    });

    return chain;
  }

  global.GH_BlogIndexing = {
    fetchIndexingPreview: fetchIndexingPreview,
    renderIndexingHtml: function (indexing) {
      if (!indexing) return '';
      var html =
        '<div class="blog-indexing">' +
        '<p class="blog-indexing-title"><strong>📍 ' +
        (indexing.intro || 'Keywords para indexar') +
        '</strong></p>';
      if (indexing.enArticulo && indexing.enArticulo.length) {
        html +=
          '<p class="blog-indexing-sub">En el artículo (2–5 frases):</p><ul class="blog-indexing-list">';
        indexing.enArticulo.forEach(function (k) {
          html += '<li>' + k + '</li>';
        });
        html += '</ul>';
      }
      if (indexing.regions && indexing.regions.length) {
        html += '<p class="blog-indexing-sub">Lo que buscan por zona:</p>';
        indexing.regions.forEach(function (r) {
          html +=
            '<div class="blog-indexing-region"><strong>' +
            r.region +
            '</strong><ul class="blog-indexing-list">';
          (r.keywords || []).forEach(function (k) {
            html += '<li>' + k + '</li>';
          });
          html += '</ul></div>';
        });
      }
      html +=
        '<p class="blog-indexing-note">IndexNow + sitemap al publicar. En Google Search Console puedes pedir indexación del URL del post.</p></div>';
      return html;
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
