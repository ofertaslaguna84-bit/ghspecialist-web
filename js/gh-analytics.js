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

  // Conversiones. En GA4 se marcan como eventos clave: whatsapp_click,
  // agendar_click, llamada_click y generate_lead (este lo disparan los
  // formularios de la home al enviarse bien, vía window.ghTrack).
  window.ghTrack = function (name, params) {
    var p = params || {};
    p.page_path = location.pathname;
    p.transport_type = 'beacon';
    gtag('event', name, p);
  };

  document.addEventListener(
    'click',
    function (e) {
      var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
      if (!a) return;
      var href = a.getAttribute('href') || '';
      var donde = (a.closest('[id]') || {}).id || '';
      if (/^https?:\/\/(wa\.me|api\.whatsapp\.com|web\.whatsapp\.com)\//i.test(href)) {
        window.ghTrack('whatsapp_click', { link_url: href.split('?')[0], seccion: donde });
      } else if (/^https?:\/\/(calendar\.app\.google|calendar\.google\.com)\//i.test(href)) {
        window.ghTrack('agendar_click', { link_url: href, seccion: donde });
      } else if (/^tel:/i.test(href)) {
        window.ghTrack('llamada_click', { seccion: donde });
      } else if (/^mailto:/i.test(href)) {
        window.ghTrack('email_click', { seccion: donde });
      }
    },
    true
  );
})();
