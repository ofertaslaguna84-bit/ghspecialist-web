(function () {
  var cfg = typeof window !== 'undefined' && window.GH_SITE_CONFIG;
  var id = cfg && cfg.ga4MeasurementId;
  if (!id || typeof id !== 'string') {
    return;
  }
  id = id.trim();
  if (!id || id.indexOf('G-') !== 0) {
    return;
  }

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;

  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
  document.head.appendChild(s);

  gtag('js', new Date());
  gtag('config', id);
})();
