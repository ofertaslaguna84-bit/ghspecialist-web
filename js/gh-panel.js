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

  document.addEventListener('DOMContentLoaded', function () {
    fillLinks();
    bindGate();
    checkAuth();
    if (!PASS || sessionStorage.getItem(SESSION_KEY) === '1') {
      loadGithub();
    }
  });
})();
