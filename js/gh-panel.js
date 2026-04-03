/**
 * Panel interno GH Specialist — enlaces + estado deploy (API pública GitHub).
 */
(function () {
  var C = window.GH_SITE_CONFIG || {};
  var REPO = C.githubRepo || 'ofertaslaguna84-bit/ghspecialist-web';
  var PASS = (C.panelPassword || '').trim();
  var SESSION_KEY = 'gh_panel_auth';

  function $(id) {
    return document.getElementById(id);
  }

  function showGate() {
    document.documentElement.classList.add('panel-gated');
  }

  function showPanel() {
    document.documentElement.classList.remove('panel-gated');
    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch (e) {}
  }

  function logout() {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch (e) {}
    var input = $('gate-pass');
    if (input) input.value = '';
    var err = $('gate-err');
    if (err) err.textContent = '';
    if (PASS) {
      document.documentElement.classList.add('panel-gated');
    } else {
      window.location.href = '../index.html';
    }
  }

  function bindSalir() {
    var btn = $('panel-btn-salir');
    if (!btn) return;
    btn.addEventListener('click', function () {
      logout();
    });
  }

  function checkAuth() {
    if (!PASS) {
      document.documentElement.classList.remove('panel-gated');
      return;
    }
    try {
      if (sessionStorage.getItem(SESSION_KEY) === '1') {
        document.documentElement.classList.remove('panel-gated');
        return;
      }
    } catch (e) {}
    document.documentElement.classList.add('panel-gated');
  }

  function bindGate() {
    var form = $('gate-form');
    var err = $('gate-err');
    if (!form) return;
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var input = $('gate-pass');
      if (!input) return;
      if ((input.value || '').trim() === PASS) {
        if (err) err.textContent = '';
        showPanel();
        loadGithub();
      } else {
        if (err) err.textContent = 'Clave incorrecta.';
        input.value = '';
        input.focus();
      }
    });
  }

  function loadGithub() {
    var elSha = $('gh-sha');
    var elDate = $('gh-date');
    var elMsg = $('gh-msg');
    var elErr = $('gh-err');
    var api = 'https://api.github.com/repos/' + REPO + '/commits/main';
    fetch(api, { headers: { Accept: 'application/vnd.github+json' } })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        if (elSha) elSha.textContent = (data.sha || '').slice(0, 7);
        if (elDate && data.commit && data.commit.author) {
          elDate.textContent = data.commit.author.date || '—';
        }
        if (elMsg && data.commit && data.commit.message) {
          elMsg.textContent = (data.commit.message || '').split('\n')[0];
        }
        if (elErr) elErr.textContent = '';
      })
      .catch(function () {
        if (elErr) {
          elErr.textContent =
            'No se pudo leer la API de GitHub (límite o red). Usa el enlace a Actions abajo.';
        }
      });
  }

  function fillLinks() {
    var ga = C.ga4MeasurementId || '';
    var fc = C.formspreeContactId || '';
    var fl = C.formspreeLeadsId || '';

    var gaEl = $('link-ga');
    if (gaEl) {
      gaEl.href = 'https://analytics.google.com/';
      gaEl.textContent = ga ? 'Abrir Analytics (ID: ' + ga + ')' : 'Abrir Google Analytics';
    }
    var gaInline = $('link-ga-inline');
    if (gaInline) gaInline.href = 'https://analytics.google.com/';
    var gaLabel = $('ga-id-label');
    if (gaLabel) gaLabel.textContent = ga || '(configura ga4MeasurementId)';

    var fsMain = $('link-fs');
    if (fsMain) fsMain.href = 'https://formspree.io/login';

    var fsC = $('link-fs-contact');
    if (fsC) {
      if (fc) {
        fsC.href = 'https://formspree.io/f/' + fc;
        fsC.textContent = 'Formulario contacto (endpoint /f/' + fc + ')';
        fsC.hidden = false;
      } else fsC.hidden = true;
    }

    var fsL = $('link-fs-leads');
    if (fsL) {
      if (fl) {
        fsL.href = 'https://formspree.io/f/' + fl;
        fsL.textContent = 'Formulario leads/onboarding (endpoint /f/' + fl + ')';
        fsL.hidden = false;
      } else fsL.hidden = true;
    }

    var hintFs = $('hint-fs');
    if (hintFs) {
      hintFs.hidden = !!(fc || fl);
    }

    var la = $('link-gh-actions');
    var lr = $('link-gh-repo');
    var ls = $('link-site');
    var lb = $('link-blog');
    if (la) la.href = 'https://github.com/' + REPO + '/actions';
    if (lr) lr.href = 'https://github.com/' + REPO;
    if (ls) ls.href = 'https://ghspecialist.com/';
    if (lb) lb.href = 'https://ghspecialist.com/blog/';

    var badge = $('deploy-badge');
    if (badge) {
      badge.src =
        'https://github.com/' + REPO + '/actions/workflows/pages.yml/badge.svg?branch=main';
      badge.alt = 'Estado deploy GitHub Pages';
    }
  }

  function initAnalyticsEmbed() {
    var url = ((window.GH_SITE_CONFIG && window.GH_SITE_CONFIG.analyticsEmbedUrl) || '').trim();
    var ph = $('analytics-embed-placeholder');
    var wrap = $('analytics-embed-frame-wrap');
    var frame = $('analytics-embed-frame');
    if (!frame || !wrap || !ph) return;
    if (url.indexOf('http') === 0) {
      frame.src = url;
      wrap.hidden = false;
      ph.hidden = true;
    } else {
      wrap.hidden = true;
      ph.hidden = false;
    }
  }

  function initLeadsEmbed() {
    var url = ((window.GH_SITE_CONFIG && window.GH_SITE_CONFIG.leadsSheetEmbedUrl) || '').trim();
    var ph = $('leads-embed-placeholder');
    var wrap = $('leads-embed-wrap');
    var frame = $('leads-embed-frame');
    if (!frame || !wrap || !ph) return;
    if (url.indexOf('http') === 0) {
      frame.src = url;
      wrap.hidden = false;
      ph.hidden = true;
    } else {
      wrap.hidden = true;
      ph.hidden = false;
    }
  }

  function buildBlogPrompt(topic, keywords) {
    var t = (topic || '').trim();
    var k = (keywords || '').trim();
    if (!t) return '';
    var lines = [
      'Actúas como redactor SEO senior para GH Specialist, agencia de automatización con inteligencia artificial para empresas en México y LATAM.',
      '',
      'TAREA: Redacta un artículo de blog en español para publicarse en ghspecialist.com/blog/ con este tema:',
      'TEMA / ENFOQUE: ' + t
    ];
    if (k) lines.push('PALABRAS CLAVE O ÁNGULO: ' + k);
    lines.push(
      '',
      'REQUISITOS:',
      '- Longitud orientativa: 1.800–2.400 palabras.',
      '- Incluye: meta description (máximo ~155 caracteres), un H1, introducción con gancho, varios H2 y H3, listas con viñetas donde tenga sentido, conclusiones.',
      '- Tono profesional, claro, orientado a dueños de negocio y directivos.',
      '- Incluye un CTA hacia https://calendly.com/ghspecialist (diagnóstico / agendar llamada).',
      '- Menciona servicios de GH Specialist (IA, WhatsApp, CRM Kommo, automatización) solo si encajan de forma natural con el tema.',
      '- Sugiere un slug de URL en kebab-case (ej: mi-tema-mexico-2026).',
      '- Al final, entrega un bloque JSON-LD schema.org tipo Article listo para el <head> del HTML.',
      '',
      'Entrega el cuerpo del artículo en HTML limpio (<p>, <h2>, <h3>, <ul>, <li>, <strong>) para pegarlo en blog/[slug].html del sitio estático.'
    );
    return lines.join('\n');
  }

  function initBlogPrompt() {
    var out = $('blog-prompt-out');
    var toast = $('blog-toast');
    var gen = $('btn-blog-generate');
    var copy = $('btn-blog-copy');
    var chat = $('btn-blog-chatgpt');
    if (!gen || !out) return;

    gen.addEventListener('click', function () {
      var topic = ($('blog-topic') && $('blog-topic').value) || '';
      var kw = ($('blog-keywords') && $('blog-keywords').value) || '';
      var p = buildBlogPrompt(topic, kw);
      if (!p) {
        out.value = '';
        if (toast) toast.textContent = 'Escribe al menos el tema del artículo.';
        return;
      }
      out.value = p;
      if (toast) toast.textContent = 'Prompt listo. Puedes copiarlo o abrir ChatGPT y pegarlo.';
    });

    if (copy) {
      copy.addEventListener('click', function () {
        var text = (out && out.value) || '';
        if (!text) {
          if (toast) toast.textContent = 'Primero pulsa «Generar prompt».';
          return;
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(
            function () {
              if (toast) toast.textContent = 'Copiado al portapapeles.';
            },
            function () {
              if (toast) toast.textContent = 'No se pudo copiar; selecciona el texto a mano.';
            }
          );
        } else {
          out.select();
          try {
            document.execCommand('copy');
            if (toast) toast.textContent = 'Copiado.';
          } catch (e) {
            if (toast) toast.textContent = 'Selecciona el texto y copia con Ctrl+C.';
          }
        }
      });
    }

    if (chat) {
      chat.addEventListener('click', function () {
        window.open('https://chatgpt.com/', '_blank', 'noopener,noreferrer');
        if (toast) toast.textContent = 'Pestaña abierta: pega el prompt (Ctrl+V) en el chat.';
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    fillLinks();
    initAnalyticsEmbed();
    initLeadsEmbed();
    initBlogPrompt();
    bindGate();
    bindSalir();
    checkAuth();
    if (!PASS || sessionStorage.getItem(SESSION_KEY) === '1') {
      loadGithub();
    }
  });
})();
