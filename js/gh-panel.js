/**
 * Panel interno GH Specialist — Analytics, Formspree, blog one-click (GitHub Actions + Claude).
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

  function ghHeaders(pat) {
    return {
      Authorization: 'Bearer ' + pat,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    };
  }

  function sleep(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  function setBlogStatus(type, html) {
    var box = $('blog-status');
    if (!box) return;
    box.hidden = false;
    box.className = 'blog-status blog-status--' + (type || 'info');
    box.innerHTML = html;
  }

  function hideBlogStatus() {
    var box = $('blog-status');
    if (box) {
      box.hidden = true;
      box.innerHTML = '';
    }
  }

  function fetchResultJson(owner, repo, branch) {
    var url =
      'https://raw.githubusercontent.com/' +
      owner +
      '/' +
      repo +
      '/' +
      (branch || 'main') +
      '/blog-generate-result.json?t=' +
      Date.now();
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error('no result');
      return r.json();
    });
  }

  function pollBlogWorkflow(startedAt, owner, repo, pat) {
    var deadline = Date.now() + 8 * 60 * 1000;
    var wf =
      'https://api.github.com/repos/' +
      owner +
      '/' +
      repo +
      '/actions/workflows/blog-generate.yml/runs?per_page=8';

    function tick() {
      if (Date.now() > deadline) {
        return Promise.reject(new Error('timeout'));
      }
      return fetch(wf, { headers: ghHeaders(pat) })
        .then(function (r) {
          return r.json().then(function (data) {
            if (!r.ok) throw new Error((data && data.message) || 'GitHub API');
            return data;
          });
        })
        .then(function (data) {
          var runs = data.workflow_runs || [];
          var run = null;
          for (var i = 0; i < runs.length; i++) {
            if (new Date(runs[i].created_at).getTime() >= startedAt - 5000) {
              run = runs[i];
              break;
            }
          }
          if (!run) return sleep(12000).then(tick);
          if (run.status !== 'completed') {
            setBlogStatus(
              'info',
              '<strong>Generando artículo…</strong> La IA está escribiendo y publicando (2–4 min). Estado: <em>' +
                run.status +
                '</em>'
            );
            return sleep(12000).then(tick);
          }
          if (run.conclusion !== 'success') {
            return Promise.reject(new Error('El workflow falló: ' + (run.conclusion || 'error')));
          }
          return fetchResultJson(owner, repo, 'main');
        });
    }
    return tick();
  }

  function initBlogGenerate() {
    var gen = $('btn-blog-generate');
    var topicEl = $('blog-topic');
    var kwEl = $('blog-keywords');
    if (!gen) return;

    var owner = (C.githubOwner || 'ofertaslaguna84-bit').trim();
    var repo = (C.githubRepo || 'ghspecialist-web').trim();
    var pat = (C.githubDispatchPat || '').trim();
    var setupEl = $('blog-setup-hint');
    if (setupEl) setupEl.hidden = !!pat;

    gen.addEventListener('click', function () {
      if (gen.disabled) return;
      hideBlogStatus();

      if (!pat) {
        setBlogStatus(
          'err',
          '<strong>Falta configurar el token.</strong> Pega <code>githubDispatchPat</code> en <code>js/gh-site-config.js</code> (PAT con Actions + Contents) y sube el cambio. También necesitas los secrets <code>ANTHROPIC_API_KEY</code> y <code>BLOG_GENERATE_SECRET</code> en GitHub.'
        );
        return;
      }

      var topic = topicEl ? (topicEl.value || '').trim() : '';
      var keywords = kwEl ? (kwEl.value || '').trim() : '';
      var startedAt = Date.now();

      gen.disabled = true;
      gen.textContent = 'Generando…';
      setBlogStatus(
        'info',
        '<strong>Enviando a GitHub…</strong> Se generará el HTML, se actualizará el blog y el sitio se publicará solo.'
      );

      fetch('https://api.github.com/repos/' + owner + '/' + repo + '/dispatches', {
        method: 'POST',
        headers: Object.assign({ 'Content-Type': 'application/json' }, ghHeaders(pat)),
        body: JSON.stringify({
          event_type: 'blog_generate',
          client_payload: {
            secret: PASS,
            topic: topic,
            keywords: keywords
          }
        })
      })
        .then(function (r) {
          if (r.status === 204) return;
          return r.json().then(function (data) {
            throw new Error((data && data.message) || 'No se pudo disparar el workflow');
          });
        })
        .then(function () {
          setBlogStatus(
            'info',
            '<strong>Generando artículo…</strong> Claude está escribiendo y publicando (2–4 min).'
          );
          return pollBlogWorkflow(startedAt, owner, repo, pat);
        })
        .then(function (result) {
          if (topicEl) topicEl.value = '';
          if (kwEl) kwEl.value = '';
          var url = (result && result.url) || 'https://ghspecialist.com/blog/';
          var title = (result && result.title) || 'Artículo nuevo';
          setBlogStatus(
            'ok',
            '<p class="blog-status-title">Artículo publicado</p><p>' +
              title +
              '</p><a href="' +
              url +
              '" target="_blank" rel="noopener">Ver artículo →</a> · <a href="https://ghspecialist.com/blog/" target="_blank" rel="noopener">Ver blog</a>'
          );
        })
        .catch(function (err) {
          var msg = (err && err.message) || String(err);
          if (msg === 'timeout') {
            setBlogStatus(
              'warn',
              '<strong>Tarda más de lo normal.</strong> Revisa <a href="https://github.com/' +
                owner +
                '/' +
                repo +
                '/actions" target="_blank" rel="noopener">GitHub Actions</a> y el blog en unos minutos.'
            );
          } else {
            setBlogStatus('err', '<strong>Error:</strong> ' + msg);
          }
        })
        .finally(function () {
          gen.disabled = false;
          gen.textContent = 'Generar artículo';
        });
    });

    if (topicEl) {
      topicEl.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey && !gen.disabled) {
          e.preventDefault();
          gen.click();
        }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    fillLinks();
    initAnalyticsEmbed();
    initLeadsEmbed();
    initBlogGenerate();
    bindGate();
    bindSalir();
    checkAuth();
  });
})();
