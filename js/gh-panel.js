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

  function pollBlogStatus(apiBase, startedAt, opts) {
    opts = opts || {};
    var mode = opts.mode || 'generate';
    var slug = opts.slug || '';
    var deadline = Date.now() + 8 * 60 * 1000;
    var url =
      apiBase +
      '/api/ghspecialist/blog-status?secret=' +
      encodeURIComponent(PASS) +
      '&startedAt=' +
      encodeURIComponent(String(startedAt)) +
      '&mode=' +
      encodeURIComponent(mode);
    if (slug) url += '&slug=' + encodeURIComponent(slug);

    function tick() {
      if (Date.now() > deadline) return Promise.reject(new Error('timeout'));
      return fetch(url)
        .then(function (r) {
          return r.json().then(function (data) {
            if (!r.ok) throw new Error((data && data.error) || 'Error de servidor');
            return data;
          });
        })
        .then(function (data) {
          if (data.status === 'done' && data.article) return { type: 'article', data: data.article };
          if (data.status === 'done' && data.deleted) return { type: 'deleted', data: data.deleted };
          if (data.status === 'error') throw new Error(data.error || 'Error en el workflow');
          var msg =
            mode === 'delete'
              ? '<strong>Eliminando artículo…</strong> Borrando archivo y actualizando blog (1–2 min).'
              : '<strong>Generando artículo…</strong> DeepSeek/Qwen escribiendo y publicando (2–4 min).';
          setBlogStatus('info', msg);
          return sleep(12000).then(tick);
        });
    }
    return tick();
  }

  function renderBlogList(articles) {
    var list = $('blog-list');
    if (!list) return;
    if (!articles || !articles.length) {
      list.innerHTML = '<p class="blog-list-empty">No hay artículos en el blog.</p>';
      return;
    }
    list.innerHTML = articles
      .map(function (a) {
        var title = a.title || a.slug;
        var slug = a.slug || '';
        var url = a.url || 'https://ghspecialist.com/blog/' + slug;
        return (
          '<div class="blog-item" data-slug="' +
          slug.replace(/"/g, '&quot;') +
          '">' +
          '<div class="blog-item-main">' +
          '<div class="blog-item-title"><a href="' +
          url +
          '" target="_blank" rel="noopener">' +
          title +
          '</a></div>' +
          '<div class="blog-item-slug">' +
          slug +
          '</div>' +
          '</div>' +
          '<button type="button" class="btn-del" data-slug="' +
          slug.replace(/"/g, '&quot;') +
          '" title="Eliminar artículo">Borrar</button>' +
          '</div>'
        );
      })
      .join('');

    list.querySelectorAll('.btn-del').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var slug = btn.getAttribute('data-slug');
        if (slug) deleteBlogArticle(slug, btn);
      });
    });
  }

  function loadBlogList() {
    var list = $('blog-list');
    var refresh = $('btn-blog-refresh');
    var apiBase = ((C.blogApiBase || 'https://adestajo.com.mx') + '').replace(/\/$/, '');
    if (list) list.innerHTML = '<p class="blog-list-loading">Cargando artículos…</p>';
    if (refresh) refresh.disabled = true;

    return fetch(
      apiBase + '/api/ghspecialist/blog-list?secret=' + encodeURIComponent(PASS)
    )
      .then(function (r) {
        return r.json().then(function (data) {
          if (!r.ok || !data.ok) throw new Error((data && data.error) || 'No se pudo cargar la lista');
          return data.articles || [];
        });
      })
      .then(function (articles) {
        renderBlogList(articles);
      })
      .catch(function (err) {
        if (list) {
          list.innerHTML =
            '<p class="blog-list-empty">Error al cargar: ' +
            ((err && err.message) || String(err)) +
            '. <button type="button" id="blog-list-retry" style="font:inherit;color:var(--p);font-weight:700;background:none;border:none;cursor:pointer">Reintentar</button></p>';
          var retry = $('blog-list-retry');
          if (retry) retry.addEventListener('click', loadBlogList);
        }
      })
      .finally(function () {
        if (refresh) refresh.disabled = false;
      });
  }

  function deleteBlogArticle(slug, btn) {
    if (!slug || !window.confirm('¿Borrar "' + slug + '" del blog? No se puede deshacer.')) return;

    var apiBase = ((C.blogApiBase || 'https://adestajo.com.mx') + '').replace(/\/$/, '');
    var allDel = document.querySelectorAll('.btn-del');
    allDel.forEach(function (b) {
      b.disabled = true;
    });
    if (btn) btn.textContent = 'Borrando…';
    hideBlogStatus();
    setBlogStatus('info', '<strong>Eliminando…</strong> ' + slug);

    fetch(apiBase + '/api/ghspecialist/blog-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: PASS, slug: slug }),
    })
      .then(function (r) {
        return r.json().then(function (data) {
          if (!r.ok || !data.ok) throw new Error((data && data.error) || 'No se pudo iniciar el borrado');
          return data.startedAt || Date.now();
        });
      })
      .then(function (startedAt) {
        return pollBlogStatus(apiBase, startedAt, { mode: 'delete', slug: slug });
      })
      .then(function (result) {
        setBlogStatus(
          'ok',
          '<p class="blog-status-title">Artículo eliminado</p><p>' +
            (result.data.title || result.data.slug || slug) +
            '</p><a href="https://ghspecialist.com/blog/" target="_blank" rel="noopener">Ver blog →</a>'
        );
        return loadBlogList();
      })
      .catch(function (err) {
        var msg = (err && err.message) || String(err);
        if (msg === 'timeout') {
          setBlogStatus(
            'warn',
            '<strong>Tarda más de lo normal.</strong> Recarga la lista en un minuto.'
          );
          loadBlogList();
        } else {
          setBlogStatus('err', '<strong>Error:</strong> ' + msg);
        }
      })
      .finally(function () {
        allDel.forEach(function (b) {
          b.disabled = false;
          b.textContent = 'Borrar';
        });
      });
  }

  function initBlogGenerate() {
    var gen = $('btn-blog-generate');
    var topicEl = $('blog-topic');
    var kwEl = $('blog-keywords');
    if (!gen) return;

    var apiBase = ((C.blogApiBase || 'https://adestajo.com.mx') + '').replace(/\/$/, '');

    gen.addEventListener('click', function () {
      if (gen.disabled) return;
      hideBlogStatus();

      var topic = topicEl ? (topicEl.value || '').trim() : '';
      var keywords = kwEl ? (kwEl.value || '').trim() : '';

      gen.disabled = true;
      gen.textContent = 'Generando…';
      setBlogStatus(
        'info',
        '<strong>Iniciando…</strong> DeepSeek/Qwen + publicación automática en ghspecialist.com'
      );

      fetch(apiBase + '/api/ghspecialist/blog-trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: PASS, topic: topic, keywords: keywords })
      })
        .then(function (r) {
          return r.json().then(function (data) {
            if (!r.ok || !data.ok) {
              throw new Error((data && data.error) || 'No se pudo iniciar la generación');
            }
            return data.startedAt || Date.now();
          });
        })
        .then(function (startedAt) {
          return pollBlogStatus(apiBase, startedAt, { mode: 'generate' });
        })
        .then(function (result) {
          var article = result.data;
          if (topicEl) topicEl.value = '';
          if (kwEl) kwEl.value = '';
          var url = (article && article.url) || 'https://ghspecialist.com/blog/';
          var title = (article && article.title) || 'Artículo nuevo';
          setBlogStatus(
            'ok',
            '<p class="blog-status-title">Artículo publicado</p><p>' +
              title +
              '</p><a href="' +
              url +
              '" target="_blank" rel="noopener">Ver artículo →</a> · <a href="https://ghspecialist.com/blog/" target="_blank" rel="noopener">Ver blog</a>'
          );
          loadBlogList();
        })
        .catch(function (err) {
          var msg = (err && err.message) || String(err);
          if (msg === 'timeout') {
            setBlogStatus(
              'warn',
              '<strong>Tarda más de lo normal.</strong> Revisa el <a href="https://ghspecialist.com/blog/" target="_blank" rel="noopener">blog</a> en unos minutos.'
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

    var refreshBtn = $('btn-blog-refresh');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', function () {
        loadBlogList();
      });
    }

    loadBlogList();
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
