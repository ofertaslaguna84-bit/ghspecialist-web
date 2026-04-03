/**
 * Aviso de visitas (estilo “Wix me avisa”) vía ntfy.sh — notificación al móvil.
 *
 * 1) Instala la app ntfy (Android/iOS) o abre https://ntfy.sh en el navegador.
 * 2) Elige un nombre de tema largo y difícil de adivinar (ej. ghspec_x7k9m2_visitas).
 * 3) Suscríbete a ese tema en la app.
 * 4) Pon el mismo nombre en window.GH_VISITOR_NOTIFY.ntfyTopic abajo en index.html.
 *
 * Tema vacío = desactivado. Solo se envía 1 aviso por sesión del navegador (no spamea al recargar).
 * Opcional: ntfyToken si usas “Access control” en tu instancia ntfy.
 */
(function () {
  try {
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('gh_visit_ntfy_v1')) {
      return;
    }
  } catch (e) {
    return;
  }

  var cfg = window.GH_VISITOR_NOTIFY || {};
  var topic = (cfg.ntfyTopic || cfg.topic || '').trim();
  if (!topic) {
    return;
  }

  var server = (cfg.ntfyServer || 'https://ntfy.sh').replace(/\/$/, '');
  var title = cfg.title || 'Visita en tu web';
  var path = (typeof location !== 'undefined' ? location.pathname + location.search : '/') || '/';
  var ref = '';
  try {
    ref = document.referrer ? ' · ref: ' + document.referrer.slice(0, 120) : '';
  } catch (e2) {}
  var body =
    path +
    ' · ' +
    new Date().toISOString() +
    (navigator.language ? ' · ' + navigator.language : '') +
    ref;

  var headers = {
    Title: title,
    Tags: 'eyes'
  };
  if (cfg.ntfyToken || cfg.token) {
    headers.Authorization = 'Bearer ' + (cfg.ntfyToken || cfg.token);
  }

  var url = server + '/' + encodeURIComponent(topic);

  function markSent() {
    try {
      sessionStorage.setItem('gh_visit_ntfy_v1', '1');
    } catch (e3) {}
  }

  if (typeof fetch !== 'undefined') {
    fetch(url, {
      method: 'POST',
      body: body,
      headers: headers,
      mode: 'cors',
      keepalive: true
    })
      .then(function (res) {
        if (res && res.ok) {
          markSent();
        }
      })
      .catch(function () {});
  }
})();
