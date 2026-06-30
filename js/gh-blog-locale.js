/**
 * GH Specialist — Blog i18n (ES/EN), sincronizado con gh_lang de gh-locale.js
 */
(function () {
  var STORAGE_KEY = 'gh_lang';
  var I18N_BASE = '../data/blog-i18n/';

  var UI = {
    es: {
      backHome: '← Ir al inicio',
      backBlog: '← Volver al blog',
      home: 'Inicio',
      blog: 'Blog',
      readMore: 'Leer artículo →',
      minRead: 'min lectura',
      by: 'Por',
      related: 'Artículos relacionados',
      ctaCal: '📅 Agendar diagnóstico gratuito →',
      ctaWa: '📱 WhatsApp →',
      figCap: 'Imagen generada con IA · GH Specialist',
      indexLabel: 'Blog GH Specialist · SEO + IA',
      indexH1: 'Automatización IA para<br>Empresas en México',
      indexSub:
        'Guías y artículos optimizados para buscadores. ¿Quieres un blog así en tu sitio? <a href="../servicios/web-seo-blog-ia.html" style="color:var(--p);font-weight:700">Web + SEO + Blog IA →</a>',
      ctaBlogH2: '¿Quieres un blog que posicione en Google?',
      ctaBlogP: 'Implementamos Web + SEO + Blog IA para tu empresa. Publicación automática y optimización incluida.',
      ctaBlogBtn: 'Ver servicio Web + SEO →',
      translating: 'Cargando versión en inglés…',
      noEn: 'Este artículo está en español. Estamos preparando la traducción al inglés.',
      langLabel: 'Idioma',
    },
    en: {
      backHome: '← Back to home',
      backBlog: '← Back to blog',
      home: 'Home',
      blog: 'Blog',
      readMore: 'Read article →',
      minRead: 'min read',
      by: 'By',
      related: 'Related articles',
      ctaCal: '📅 Book a free diagnostic →',
      ctaWa: '📱 WhatsApp →',
      figCap: 'AI-generated image · GH Specialist',
      indexLabel: 'GH Specialist Blog · SEO + AI',
      indexH1: 'AI Automation for<br>Businesses in Mexico',
      indexSub:
        'SEO-optimized guides and articles. Want a blog like this on your site? <a href="../servicios/web-seo-blog-ia.html" style="color:var(--p);font-weight:700">Web + SEO + AI Blog →</a>',
      ctaBlogH2: 'Want a blog that ranks on Google?',
      ctaBlogP: 'We implement Web + SEO + AI Blog for your company. Auto publishing and optimization included.',
      ctaBlogBtn: 'View Web + SEO service →',
      translating: 'Loading English version…',
      noEn: 'This article is in Spanish. English translation is being prepared.',
      langLabel: 'Language',
    },
  };

  var state = { lang: 'es', slug: null, snapshot: null, enCache: null };

  function t(key) {
    var pack = UI[state.lang] || UI.es;
    return pack[key] !== undefined ? pack[key] : UI.es[key] || key;
  }

  function getLang() {
    try {
      var s = localStorage.getItem(STORAGE_KEY);
      if (s === 'en' || s === 'es') return s;
    } catch (e) {}
    return 'es';
  }

  function setLang(lang) {
    if (lang !== 'es' && lang !== 'en') return;
    state.lang = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {}
    applyAll();
    document.querySelectorAll('.hdr-lang-btn').forEach(function (btn) {
      var on = btn.getAttribute('data-gh-lang') === lang;
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  function articleSlug() {
    if (state.slug) return state.slug;
    var p = location.pathname.replace(/\\/g, '/');
    var m = p.match(/\/blog\/([^/]+)\.html$/i);
    if (m) state.slug = m[1].replace(/\.html$/, '');
    return state.slug;
  }

  function isIndex() {
    return /\/blog\/?(index\.html)?$/.test(location.pathname.replace(/\\/g, '/'));
  }

  function snapshotArticle() {
    if (state.snapshot || !articleSlug()) return;
    var art = document.querySelector('article.art');
    if (!art) return;
    var body = art.querySelector('.gh-article-body');
    state.snapshot = {
      title: document.title,
      h1: art.querySelector('h1') ? art.querySelector('h1').innerHTML : '',
      label: art.querySelector('.art-label') ? art.querySelector('.art-label').textContent : '',
      meta: art.querySelector('.art-meta') ? art.querySelector('.art-meta').innerHTML : '',
      bodyHtml: body ? body.innerHTML : '',
      breadcrumb: document.querySelector('.bc') ? document.querySelector('.bc').innerHTML : '',
      ctaH3: art.querySelector('.cta-art h3') ? art.querySelector('.cta-art h3').textContent : '',
      ctaP: art.querySelector('.cta-art p') ? art.querySelector('.cta-art p').textContent : '',
      relatedH3: art.querySelector('.related h3') ? art.querySelector('.related h3').textContent : '',
      figCap: art.querySelector('.art-hero figcaption') ? art.querySelector('.art-hero figcaption').textContent : '',
    };
  }

  function restoreSpanish() {
    if (!state.snapshot) return;
    var s = state.snapshot;
    var art = document.querySelector('article.art');
    if (!art) return;
    document.title = s.title;
    var h1 = art.querySelector('h1');
    if (h1) h1.innerHTML = s.h1;
    var lab = art.querySelector('.art-label');
    if (lab) lab.textContent = s.label;
    var meta = art.querySelector('.art-meta');
    if (meta) meta.innerHTML = s.meta;
    var body = art.querySelector('.gh-article-body');
    if (body) body.innerHTML = s.bodyHtml;
    var bc = document.querySelector('.bc');
    if (bc) bc.innerHTML = s.breadcrumb;
    var ctaH3 = art.querySelector('.cta-art h3');
    if (ctaH3) ctaH3.textContent = s.ctaH3;
    var ctaP = art.querySelector('.cta-art p');
    if (ctaP) ctaP.textContent = s.ctaP;
    var rel = art.querySelector('.related h3');
    if (rel) rel.textContent = s.relatedH3;
    var fig = art.querySelector('.art-hero figcaption');
    if (fig) fig.textContent = s.figCap;
    document.documentElement.lang = 'es';
    removeNotice();
  }

  function showNotice(msg) {
    removeNotice();
    var art = document.querySelector('article.art');
    if (!art) return;
    var n = document.createElement('p');
    n.id = 'gh-blog-i18n-notice';
    n.style.cssText =
      'font-size:14px;color:#666;background:#F3EFFF;border:1px solid #ddd;padding:12px 16px;border-radius:8px;margin-bottom:20px';
    n.textContent = msg;
    art.insertBefore(n, art.firstChild);
  }

  function removeNotice() {
    var n = document.getElementById('gh-blog-i18n-notice');
    if (n) n.remove();
  }

  async function loadEnJson(slug) {
    if (state.enCache && state.enCache.slug === slug) return state.enCache.data;
    try {
      var r = await fetch(I18N_BASE + slug + '.en.json', { cache: 'default' });
      if (!r.ok) return null;
      var data = await r.json();
      state.enCache = { slug: slug, data: data };
      return data;
    } catch (e) {
      return null;
    }
  }

  function applyEnArticle(data) {
    var art = document.querySelector('article.art');
    if (!art || !data) return;
    if (data.title) document.title = data.title;
    if (data.h1) {
      var h1 = art.querySelector('h1');
      if (h1) h1.textContent = data.h1;
    }
    if (data.label) {
      var lab = art.querySelector('.art-label');
      if (lab) lab.textContent = data.label;
    }
    if (data.meta) {
      var meta = art.querySelector('.art-meta');
      if (meta) meta.innerHTML = data.meta;
    }
    if (data.html) {
      var body = art.querySelector('.gh-article-body');
      if (body) body.innerHTML = data.html;
    }
    if (data.breadcrumb) {
      var bc = document.querySelector('.bc');
      if (bc) bc.innerHTML = data.breadcrumb;
    }
    if (data.ctaTitle) {
      var c = art.querySelector('.cta-art h3');
      if (c) c.textContent = data.ctaTitle;
    }
    if (data.ctaText) {
      var p = art.querySelector('.cta-art p');
      if (p) p.textContent = data.ctaText;
    }
    if (data.relatedTitle) {
      var r = art.querySelector('.related h3');
      if (r) r.textContent = data.relatedTitle;
    }
    if (data.figCaption) {
      var f = art.querySelector('.art-hero figcaption');
      if (f) f.textContent = data.figCaption;
    }
    document.documentElement.lang = 'en';
    removeNotice();
  }

  async function applyArticleLang() {
    snapshotArticle();
    if (state.lang === 'es') {
      restoreSpanish();
      return;
    }
    var slug = articleSlug();
    if (!slug) return;
    showNotice(t('translating'));
    var data = await loadEnJson(slug);
    if (data) {
      applyEnArticle(data);
    } else {
      showNotice(t('noEn'));
      applyChrome();
    }
  }

  function applyChrome() {
    var back = document.querySelector('.hdr a.back');
    if (back) {
      back.textContent = isIndex() ? t('backHome') : t('backBlog');
    }
    document.querySelectorAll('.cta-art a').forEach(function (a, i) {
      if (i === 0) a.textContent = t('ctaCal');
      else if (a.href && a.href.indexOf('wa.me') !== -1) a.textContent = t('ctaWa');
    });
    if (isIndex()) {
      var label = document.querySelector('.hero-blog .label');
      if (label) label.textContent = t('indexLabel');
      var h1 = document.querySelector('.hero-blog h1');
      if (h1) h1.innerHTML = t('indexH1');
      var sub = document.querySelector('.hero-blog p');
      if (sub) sub.innerHTML = t('indexSub');
      var ctaH2 = document.querySelector('.cta-blog h2');
      if (ctaH2) ctaH2.textContent = t('ctaBlogH2');
      var ctaP = document.querySelector('.cta-blog p');
      if (ctaP) ctaP.textContent = t('ctaBlogP');
      var ctaA = document.querySelector('.cta-blog a');
      if (ctaA) ctaA.textContent = t('ctaBlogBtn');
      document.querySelectorAll('.card-read').forEach(function (el) {
        el.textContent = t('readMore');
      });
    }
    document.documentElement.lang = state.lang;
  }

  async function applyAll() {
    applyChrome();
    if (isIndex()) {
      await applyIndexManifest();
      return;
    }
    if (articleSlug()) await applyArticleLang();
  }

  function snapshotIndexCards() {
    document.querySelectorAll('.blog-grid a.card').forEach(function (card) {
      var h2 = card.querySelector('h2');
      var p = card.querySelector('.card-body p');
      var tag = card.querySelector('.card-tag');
      if (h2 && !h2.dataset.ghEs) h2.dataset.ghEs = h2.textContent;
      if (p && !p.dataset.ghEs) p.dataset.ghEs = p.textContent;
      if (tag && !tag.dataset.ghEs) tag.dataset.ghEs = tag.textContent;
    });
  }

  function restoreIndexCards() {
    document.querySelectorAll('.blog-grid a.card').forEach(function (card) {
      var h2 = card.querySelector('h2');
      var p = card.querySelector('.card-body p');
      var tag = card.querySelector('.card-tag');
      if (h2 && h2.dataset.ghEs) h2.textContent = h2.dataset.ghEs;
      if (p && p.dataset.ghEs) p.textContent = p.dataset.ghEs;
      if (tag && tag.dataset.ghEs) tag.textContent = tag.dataset.ghEs;
    });
  }

  async function applyIndexManifest() {
    snapshotIndexCards();
    if (state.lang === 'es') {
      restoreIndexCards();
      return;
    }
    try {
      var r = await fetch(I18N_BASE + '_manifest.en.json');
      if (!r.ok) return;
      var manifest = await r.json();
      document.querySelectorAll('.blog-grid a.card').forEach(function (card) {
        var href = card.getAttribute('href') || '';
        var slug = href.replace(/\.html$/, '');
        var m = manifest[slug];
        if (!m) return;
        var h2 = card.querySelector('h2');
        var p = card.querySelector('.card-body p');
        var tag = card.querySelector('.card-tag');
        if (h2 && m.title) h2.textContent = m.title;
        if (p && m.excerpt) p.textContent = m.excerpt;
        if (tag && m.tag) tag.textContent = m.tag;
      });
    } catch (e) {}
  }

  function injectLangSwitcher() {
    if (document.getElementById('gh-blog-lang')) return;
    var hdr = document.querySelector('.hdr');
    if (!hdr) return;
    var wrap = document.createElement('div');
    wrap.className = 'hdr-lang';
    wrap.id = 'gh-blog-lang';
    wrap.setAttribute('role', 'group');
    wrap.setAttribute('aria-label', t('langLabel'));
    wrap.innerHTML =
      '<button type="button" class="hdr-lang-btn' +
      (state.lang === 'es' ? ' active' : '') +
      '" data-gh-lang="es" aria-pressed="' +
      (state.lang === 'es' ? 'true' : 'false') +
      '">ES</button><button type="button" class="hdr-lang-btn' +
      (state.lang === 'en' ? ' active' : '') +
      '" data-gh-lang="en" aria-pressed="' +
      (state.lang === 'en' ? 'true' : 'false') +
      '">EN</button>';
    hdr.appendChild(wrap);
  }

  function injectStyles() {
    if (document.getElementById('gh-blog-locale-css')) return;
    var st = document.createElement('style');
    st.id = 'gh-blog-locale-css';
    st.textContent =
      '.hdr{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}.hdr-lang{display:flex;border:1px solid var(--border,#E8E8E8);border-radius:8px;overflow:hidden;flex-shrink:0}.hdr-lang-btn{background:#fff;padding:6px 11px;font-size:12px;font-weight:700;cursor:pointer;border:none;color:var(--ink3,#888);font-family:inherit;line-height:1}.hdr-lang-btn.active{background:#F3EFFF;color:#7C4DFF}';
    document.head.appendChild(st);
  }

  function init() {
    state.lang = getLang();
    injectStyles();
    injectLangSwitcher();
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.hdr-lang-btn');
      if (!btn) return;
      setLang(btn.getAttribute('data-gh-lang'));
    });
    window.addEventListener('storage', function (e) {
      if (e.key === STORAGE_KEY && (e.newValue === 'es' || e.newValue === 'en')) {
        state.lang = e.newValue;
        applyAll();
      }
    });
    applyAll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
