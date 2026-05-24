/**
 * Panel interno GH Specialist — Analytics, Formspree, blog (sin GitHub en UI).
 */
(function () {
  var C = window.GH_SITE_CONFIG || {};
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
      } else {
        if (err) err.textContent = 'Clave incorrecta.';
        input.value = '';
        input.focus();
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
    var gaPanel = $('link-ga-panel');
    if (gaPanel) gaPanel.href = 'https://analytics.google.com/';
    var gaLabel = $('ga-id-label');
    if (gaLabel) gaLabel.textContent = ga || '(configura ga4MeasurementId)';

    var fsMain = $('link-fs');
    if (fsMain) {
      var fidMain = (fc || fl || '').trim();
      fsMain.href = fidMain ? 'https://formspree.io/forms/' + fidMain : 'https://formspree.io/forms';
      fsMain.textContent = 'Abrir Formspree';
    }

    var fsSub = $('link-fs-submissions');
    if (fsSub) {
      var subOverride = (C.formspreeSubmissionsUrl || '').trim();
      var fid = (fc || fl || '').trim();
      var subUrl = subOverride;
      if (!subUrl && fid) {
        subUrl = 'https://formspree.io/forms/' + fid;
      }
      if (!subUrl) subUrl = 'https://formspree.io/forms';
      fsSub.href = subUrl;
    }

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
        fsL.textContent = 'Formulario prospectos/onboarding (endpoint /f/' + fl + ')';
        fsL.hidden = false;
      } else fsL.hidden = true;
    }

    var hintFs = $('hint-fs');
    if (hintFs) {
      hintFs.hidden = !!(fc || fl);
    }

    var ls = $('link-site');
    var lb = $('link-blog');
    if (ls) ls.href = 'https://ghspecialist.com/';
    if (lb) lb.href = 'https://ghspecialist.com/blog/';
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
      'REQUISITOS DE CONTENIDO:',
      '- Longitud orientativa: 1.800–2.400 palabras.',
      '- Incluye: meta description (máximo ~155 caracteres), un H1, introducción con gancho, varios H2 y H3, listas con viñetas, conclusiones.',
      '- Tono profesional, claro, orientado a dueños de negocio y directivos en México.',
      '- 3–5 enlaces internos naturales a artículos del blog (ghspecialist.com/blog/) y servicios (ghspecialist.com/servicios/).',
      '- Sección "Artículos relacionados" con 2–3 links al final del artículo.',
      '- CTAs: https://calendly.com/ghspecialist y WhatsApp +528712638082.',
      '- Slug en kebab-case para archivo: blog/[slug].html (ej: mi-tema-mexico-2026.html).',
      '',
      'REQUISITOS SEO TÉCNICOS (usar blog/_template.html como base):',
      '- Bloque <head> completo: title, description, canonical, Open Graph (og:type=article, og:image, og:locale), Twitter Card summary_large_image.',
      '- JSON-LD Article completo (headline, description, image, author, publisher+logo, datePublished, dateModified, mainEntityOfPage).',
      '- JSON-LD BreadcrumbList: Inicio > Blog > Título.',
      '- Breadcrumbs visuales antes del <article>.',
      '- Imagen OG absoluta: https://ghspecialist.com/hero-[ciudad].jpg o fotos/slide2_img2.png.',
      '',
      'DESPUÉS DE REDACTAR:',
      '- Pegar en blog/[slug].html desde _template.html.',
      '- Añadir card en blog/index.html.',
      '- Ejecutar: node scripts/generate-seo.mjs',
      '',
      'Entrega el cuerpo del artículo en HTML limpio (<p>, <h2>, <h3>, <ul>, <li>, <strong>) listo para pegar dentro de <article class="art">.'
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
  });
})();
