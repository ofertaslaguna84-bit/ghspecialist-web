/**
 * fetch con AbortController y timeout (evita requests colgados).
 */
(function (global) {
  function fetchWithTimeout(url, options, timeoutMs) {
    options = options || {};
    timeoutMs = timeoutMs == null ? 10000 : timeoutMs;
    if (typeof AbortController === 'undefined' || typeof fetch === 'undefined') {
      return fetch(url, options);
    }
    var ctrl = new AbortController();
    var timer = setTimeout(function () {
      try {
        ctrl.abort();
      } catch (e) {}
    }, timeoutMs);
    var opts = Object.assign({}, options, { signal: ctrl.signal });
    return fetch(url, opts).finally(function () {
      clearTimeout(timer);
    });
  }
  global.ghFetchWithTimeout = fetchWithTimeout;
})(typeof window !== 'undefined' ? window : globalThis);
