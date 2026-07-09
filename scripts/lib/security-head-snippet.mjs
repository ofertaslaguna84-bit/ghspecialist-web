/** Meta tags de seguridad para GitHub Pages (sin cabeceras HTTP personalizadas). */
export const SECURITY_HEAD_MARKER = 'gh-security-meta';

export const SECURITY_HEAD_SNIPPET = `  <meta name="referrer" content="strict-origin-when-cross-origin">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; frame-src https://www.youtube.com https://www.youtube-nocookie.com https://calendar.app.google https://calendar.google.com https://lookerstudio.google.com https://docs.google.com; connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://formspree.io https://ipapi.co https://ntfy.sh; base-uri 'self'; form-action 'self' https://formspree.io">`;

export function hasSecurityHead(html) {
  return html.includes(SECURITY_HEAD_MARKER) || html.includes('Content-Security-Policy');
}

export function injectSecurityHead(html) {
  if (hasSecurityHead(html)) return html;
  const markerLine = `  <!-- ${SECURITY_HEAD_MARKER} -->\n`;
  const block = markerLine + SECURITY_HEAD_SNIPPET + '\n';
  const viewportRe = /(<meta name="viewport"[^>]*>\n?)/i;
  if (viewportRe.test(html)) {
    return html.replace(viewportRe, `$1${block}`);
  }
  const charsetRe = /(<meta charset="[^"]*">\n?)/i;
  if (charsetRe.test(html)) {
    return html.replace(charsetRe, `$1${block}`);
  }
  return html;
}
