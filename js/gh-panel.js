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

  var GH_TOKEN_KEY = 'gh_panel_github_token';

  function ghOwner() {
    return (C.githubOwner || 'ofertaslaguna84-bit').trim();
  }

  function ghRepo() {
    return (C.githubRepo || 'ghspecialist-web').trim();
  }

  function apiBase() {
    return ((C.blogApiBase || 'https://adestajo.com.mx') + '').replace(/\/$/, '');
  }

  function getGithubToken() {
    try {
      var t = sessionStorage.getItem(GH_TOKEN_KEY) || '';
      if (t) return t.trim();
    } catch (e) {}
    return ((C.githubWorkflowToken || '') + '').trim();
  }

  function saveGithubToken(token) {
    try {
      sessionStorage.setItem(GH_TOKEN_KEY, (token || '').trim());
    } catch (e) {}
  }

  function ghHeaders(token) {
    return {
      Authorization: 'Bearer ' + token,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };
  }

  function showGithubTokenBox(show) {
    var box = $('blog-token-wrap');
    if (box) box.hidden = !show;
  }

  function markGithubTokenSaved() {
    var ok = $('blog-token-ok');
    if (ok) ok.hidden = false;
    showGithubTokenBox(true);
  }

  function initGithubTokenUi() {
    var saveBtn = $('btn-save-github-token');
    var input = $('blog-github-token');
    if (getGithubToken()) markGithubTokenSaved();
    if (saveBtn && input) {
      saveBtn.addEventListener('click', function () {
        var t = (input.value || '').trim();
        if (!t) return;
        saveGithubToken(t);
        input.value = '';
        markGithubTokenSaved();
        setBlogStatus('ok', '<strong>Token GitHub guardado.</strong> Ya puedes generar o borrar artículos.');
      });
    }
    checkAdestajoHealth();
  }

  function checkAdestajoHealth() {
    return fetch(apiBase() + '/api/ghspecialist/blog-list?secret=' + encodeURIComponent(PASS))
      .then(function (r) {
        if (r.ok) return true;
        showGithubTokenBox(true);
        return false;
      })
      .catch(function () {
        showGithubTokenBox(true);
        return false;
      });
  }

  function parseBlogIndexHtml(html) {
    var articles = [];
    var re = /<a href="([^"]+\.html)" class="card">([\s\S]*?)<\/a>/g;
    var m;
    while ((m = re.exec(html)) !== null) {
      var slug = m[1];
      var block = m[2];
      if (slug === 'index.html' || slug.indexOf('_') === 0) continue;
      var titleM = block.match(/<h2>([^<]*)<\/h2>/);
      var dateM = block.match(/<div class="card-meta">\s*<span>\s*([^·<]+)/);
      articles.push({
        slug: slug,
        title: titleM ? titleM[1].trim() : slug,
        date: dateM ? dateM[1].trim() : '',
        url: 'https://ghspecialist.com/blog/' + slug,
      });
    }
    return articles;
  }

  function extractArticleFields(html) {
    var title = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1] || '';
    title = title.replace(/<[^>]+>/g, '').trim();
    var description = (html.match(/<meta name="description" content="([^"]*)"/i) || [])[1] || '';
    var datePub =
      (html.match(/"datePublished"\s*:\s*"([^"]+)"/) || [])[1] ||
      (html.match(/<meta property="article:published_time" content="([^"]+)"/i) || [])[1] ||
      '';
    var dateLabel = datePub
      ? new Date(datePub).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
      : '';
    var start = html.match(/<div class="art-meta">[\s\S]*?<\/div>\s*/i);
    var bodyHtml = '';
    if (start) {
      var startIdx = start.index + start[0].length;
      var endIdx = html.length;
      ['<div class="cta-art">', '<section class="related"'].forEach(function (mark) {
        var p = html.indexOf(mark, startIdx);
        if (p !== -1 && p < endIdx) endIdx = p;
      });
      bodyHtml = html.slice(startIdx, endIdx).trim();
    }
    var excerpt = (html.match(/<meta name="description" content="([^"]*)"/i) || [])[1] || '';
    return { title: title, description: description, dateLabel: dateLabel, datePub: datePub, bodyHtml: bodyHtml, excerpt: excerpt };
  }

  function triggerBlogSave(payload) {
    return dispatchGithub('blog_save', Object.assign({ secret: PASS }, payload)).then(function (startedAt) {
      return { startedAt: startedAt, via: 'github' };
    });
  }

  function dispatchGithub(eventType, payload) {
    var token = getGithubToken();
    if (!token) {
      showGithubTokenBox(true);
      return Promise.reject(new Error('Falta token GitHub. Pégalo arriba (Adestajo no responde).'));
    }
    return fetch(
      'https://api.github.com/repos/' + ghOwner() + '/' + ghRepo() + '/dispatches',
      {
        method: 'POST',
        headers: Object.assign({}, ghHeaders(token), { 'Content-Type': 'application/json' }),
        body: JSON.stringify({ event_type: eventType, client_payload: payload }),
      }
    )      .then(function (r) {
        if (r.status === 204) return Date.now();
        return r.text().then(function (raw) {
          throw new Error('GitHub ' + r.status + ': ' + raw.slice(0, 200));
        });
      })
      .catch(function (err) {
        if (err && err.message && err.message.indexOf('GitHub') === 0) throw err;
        throw new Error('No se pudo contactar GitHub. Revisa el token.');
      });
  }

  function fetchRawJson(path) {
    return fetch(
      'https://raw.githubusercontent.com/' +
        ghOwner() +
        '/' +
        ghRepo() +
        '/main/' +
        path +
        '?t=' +
        Date.now(),
      { cache: 'no-store' }
    ).then(function (r) {
      if (!r.ok) return null;
      return r.json();
    });
  }

  function pollGithubWorkflow(workflowFile, startedAt, mode, expectedSlug) {
    var token = getGithubToken();
    if (!token) return Promise.reject(new Error('Falta token GitHub'));
    var deadline = Date.now() + 8 * 60 * 1000;
    var resultFile =
      mode === 'delete'
        ? 'blog-delete-result.json'
        : mode === 'save'
          ? 'blog-save-result.json'
          : 'blog-generate-result.json';

    function tick() {
      if (Date.now() > deadline) return Promise.reject(new Error('timeout'));
      return fetch(
        'https://api.github.com/repos/' +
          ghOwner() +
          '/' +
          ghRepo() +
          '/actions/workflows/' +
          workflowFile +
          '/runs?per_page=10',
        { headers: ghHeaders(token) }
      )
        .then(function (r) {
          return r.json().then(function (data) {
            if (!r.ok) throw new Error((data && data.message) || 'GitHub error');
            return data;
          });
        })
        .then(function (data) {
          var runs = data.workflow_runs || [];
          var run = runs.find(function (r) {
            return new Date(r.created_at).getTime() >= startedAt - 5000;
          });
          if (!run) {
            setBlogStatus('info', '<strong>Esperando workflow…</strong>');
            return sleep(12000).then(tick);
          }
          if (run.status !== 'completed') {
            var msg =
              mode === 'delete'
                ? '<strong>Eliminando artículo…</strong> (1–2 min)'
                : '<strong>Generando artículo…</strong> (2–4 min)';
            setBlogStatus('info', msg);
            return sleep(12000).then(tick);
          }
          if (run.conclusion !== 'success') {
            throw new Error('Workflow falló: ' + run.conclusion);
          }
          return fetchRawJson(resultFile).then(function (result) {
            if (mode === 'delete') {
              if (result && result.ok && result.deleted && result.slug) {
                if (expectedSlug && result.slug !== expectedSlug) {
                  return sleep(8000).then(tick);
                }
                return { type: 'deleted', data: result };
              }
            } else if (mode === 'save') {
              if (result && result.ok && result.saved && result.slug) {
                if (expectedSlug && result.slug !== expectedSlug) {
                  return sleep(8000).then(tick);
                }
                return { type: 'saved', data: result };
              }
            } else if (result && result.ok && result.url) {
              return { type: 'article', data: result };
            }
            return sleep(8000).then(tick);
          });
        });
    }
    return tick();
  }

  function triggerBlogGenerate(topic, keywords) {
    var payload = { secret: PASS, topic: topic, keywords: keywords };
    return fetch(apiBase() + '/api/ghspecialist/blog-trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(function (r) {
        return r.json().then(function (data) {
          if (!r.ok || !data.ok) throw new Error((data && data.error) || 'Adestajo no respondió');
          return { startedAt: data.startedAt || Date.now(), via: 'adestajo' };
        });
      })
      .catch(function () {
        return dispatchGithub('blog_generate', payload).then(function (startedAt) {
          return { startedAt: startedAt, via: 'github' };
        });
      });
  }

  function triggerBlogDelete(slug) {
    var payload = { secret: PASS, slug: slug };
    return fetch(apiBase() + '/api/ghspecialist/blog-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(function (r) {
        return r.json().then(function (data) {
          if (!r.ok || !data.ok) throw new Error((data && data.error) || 'Adestajo no respondió');
          return { startedAt: data.startedAt || Date.now(), via: 'adestajo' };
        });
      })
      .catch(function () {
        return dispatchGithub('blog_delete', payload).then(function (startedAt) {
          return { startedAt: startedAt, via: 'github' };
        });
      });
  }

  function waitBlogJob(startedAt, mode, slug, via) {
    if (via === 'github') {
      var wf =
        mode === 'delete' ? 'blog-delete.yml' : mode === 'save' ? 'blog-save.yml' : 'blog-generate.yml';
      return pollGithubWorkflow(wf, startedAt, mode, slug);
    }
    return pollBlogStatusAdestajo(startedAt, mode, slug);
  }

  function pollBlogStatusAdestajo(startedAt, mode, slug) {
    var deadline = Date.now() + 8 * 60 * 1000;
    var base = apiBase();
    var url =
      base +
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
        var dateLine = a.date ? '<div class="blog-item-date">Publicado: ' + a.date + '</div>' : '';
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
          dateLine +
          '</div>' +
          '<div class="blog-item-actions">' +
          '<button type="button" class="btn-edit" data-slug="' +
          slug.replace(/"/g, '&quot;') +
          '">Editar</button>' +
          '<button type="button" class="btn-del" data-slug="' +
          slug.replace(/"/g, '&quot;') +
          '">Borrar</button>' +
          '</div>' +
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
    list.querySelectorAll('.btn-edit').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var slug = btn.getAttribute('data-slug');
        if (slug) openBlogEdit(slug, btn);
      });
    });
  }

  function openBlogEdit(slug, btn) {
    var modal = $('blog-edit-modal');
    if (!modal) return;
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Cargando…';
    }
    fetch('../blog/' + slug + '?t=' + Date.now(), { cache: 'no-store' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.text();
      })
      .then(function (html) {
        var fields = extractArticleFields(html);
        var slugEl = $('blog-edit-slug');
        var dateEl = $('blog-edit-date');
        var titleEl = $('blog-edit-title-input');
        var descEl = $('blog-edit-desc');
        var excerptEl = $('blog-edit-excerpt');
        var bodyEl = $('blog-edit-body');
        if (slugEl) slugEl.value = slug;
        if (dateEl) {
          dateEl.textContent = fields.dateLabel
            ? 'Publicado: ' + fields.dateLabel + ' · ' + slug
            : slug;
        }
        if (titleEl) titleEl.value = fields.title;
        if (descEl) descEl.value = fields.description;
        if (excerptEl) excerptEl.value = fields.excerpt;
        if (bodyEl) bodyEl.value = fields.bodyHtml;
        modal.hidden = false;
      })
      .catch(function (err) {
        setBlogStatus('err', '<strong>Error al abrir editor:</strong> ' + ((err && err.message) || String(err)));
      })
      .finally(function () {
        if (btn) {
          btn.disabled = false;
          btn.textContent = 'Editar';
        }
      });
  }

  function closeBlogEdit() {
    var modal = $('blog-edit-modal');
    if (modal) modal.hidden = true;
  }

  function saveBlogEdit() {
    var slug = ($('blog-edit-slug') && $('blog-edit-slug').value) || '';
    var title = ($('blog-edit-title-input') && $('blog-edit-title-input').value) || '';
    var description = ($('blog-edit-desc') && $('blog-edit-desc').value) || '';
    var cardExcerpt = ($('blog-edit-excerpt') && $('blog-edit-excerpt').value) || description;
    var bodyHtml = ($('blog-edit-body') && $('blog-edit-body').value) || '';
    var saveBtn = $('blog-edit-save');

    if (!slug || !title.trim() || !description.trim() || !bodyHtml.trim()) {
      setBlogStatus('err', '<strong>Faltan campos</strong> — título, descripción y contenido son obligatorios.');
      return;
    }

    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.textContent = 'Guardando…';
    }
    closeBlogEdit();
    setBlogStatus('info', '<strong>Guardando cambios…</strong> ' + slug);

    triggerBlogSave({
      slug: slug,
      title: title.trim(),
      description: description.trim(),
      bodyHtml: bodyHtml.trim(),
      cardExcerpt: cardExcerpt.trim(),
    })
      .then(function (job) {
        return waitBlogJob(job.startedAt, 'save', slug, job.via);
      })
      .then(function (result) {
        setBlogStatus(
          'ok',
          '<p class="blog-status-title">Artículo actualizado</p><p>' +
            (result.data.title || slug) +
            '</p><a href="https://ghspecialist.com/blog/' +
            slug +
            '" target="_blank" rel="noopener">Ver artículo →</a>'
        );
        loadBlogList();
      })
      .catch(function (err) {
        var msg = (err && err.message) || String(err);
        setBlogStatus('err', '<strong>Error al guardar:</strong> ' + msg);
        showGithubTokenBox(true);
      })
      .finally(function () {
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.textContent = 'Guardar cambios';
        }
      });
  }

  function initBlogEditModal() {
    var cancel = $('blog-edit-cancel');
    var save = $('blog-edit-save');
    var modal = $('blog-edit-modal');
    if (cancel) cancel.addEventListener('click', closeBlogEdit);
    if (save) save.addEventListener('click', saveBlogEdit);
    if (modal) {
      modal.addEventListener('click', function (e) {
        if (e.target === modal) closeBlogEdit();
      });
    }
  }

  function loadBlogList() {
    var list = $('blog-list');
    var refresh = $('btn-blog-refresh');
    if (list) list.innerHTML = '<p class="blog-list-loading">Cargando artículos…</p>';
    if (refresh) refresh.disabled = true;

    return fetch('../blog/index.html?t=' + Date.now(), { cache: 'no-store' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.text();
      })
      .then(function (html) {
        renderBlogList(parseBlogIndexHtml(html));
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

    var allDel = document.querySelectorAll('.btn-del');
    allDel.forEach(function (b) {
      b.disabled = true;
    });
    if (btn) btn.textContent = 'Borrando…';
    hideBlogStatus();
    setBlogStatus('info', '<strong>Eliminando…</strong> ' + slug);

    triggerBlogDelete(slug)
      .then(function (job) {
        return waitBlogJob(job.startedAt, 'delete', slug, job.via);
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
          showGithubTokenBox(true);
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

    gen.addEventListener('click', function () {
      if (gen.disabled) return;
      hideBlogStatus();

      var topic = topicEl ? (topicEl.value || '').trim() : '';
      var keywords = kwEl ? (kwEl.value || '').trim() : '';

      gen.disabled = true;
      gen.textContent = 'Generando…';
      setBlogStatus(
        'info',
        '<strong>Iniciando…</strong> IA + publicación automática en ghspecialist.com'
      );

      triggerBlogGenerate(topic, keywords)
        .then(function (job) {
          return waitBlogJob(job.startedAt, 'generate', '', job.via);
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
            showGithubTokenBox(true);
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
    initGithubTokenUi();
    initBlogEditModal();
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
