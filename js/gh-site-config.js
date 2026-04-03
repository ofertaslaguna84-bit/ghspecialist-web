/**
 * GH Specialist — Analytics + Formspree (un solo archivo para pegar tus IDs).
 *
 * === A) Google Analytics 4 ===
 * 1. https://analytics.google.com → Administrar → Flujos de datos → Web
 * 2. Copia el ID de medición (G-XXXXXXXXXX)
 * 3. Pégalo abajo en ga4MeasurementId
 * 4. Informes → Tiempo real para ver visitas
 *
 * === B) Formspree (correo + panel en formspree.io) ===
 * 1. https://formspree.io → registro → confirma email
 * 2. Crea formulario(s); el ID es la parte final de https://formspree.io/f/XXXXXX
 * 3. formspreeContactId → formulario “Cuéntanos sobre tu empresa” (index.html)
 * 4. formspreeLeadsId → onboarding largo (#gh-book-form)
 * 5. Puedes usar el MISMO XXXXXX en ambos si quieres un solo buzón
 *
 * === C) ntfy (opcional, avisos al móvil al entrar al sitio) ===
 * No va aquí: edita window.GH_VISITOR_NOTIFY.ntfyTopic en index.html, landing, sobre-pedro.
 *
 * === D) Panel interno (/panel/) ===
 * githubRepo → usado para último commit + enlaces a Actions (owner/repo).
 * panelPassword → vacío = panel sin clave. Si pones texto, hay que escribirlo para entrar.
 *   Ojo: en repo público la clave es visible en el código; para más seguridad usa repo privado o Cloudflare Access.
 *
 * analyticsEmbedUrl → URL de informe EMBEBIBLE para ver métricas DENTRO del panel.
 *   No es el link normal de GA: crea un informe en Looker Studio conectado a tu GA4,
 *   luego Archivo → Incorporar informe → copia la URL que empiece por lookerstudio.google.com/embed/...
 *
 * leadsSheetEmbedUrl → (opcional) URL de una hoja de Google publicada (Archivo → Publicar en la web)
 *   para ver lista de suscriptores/leads que tú mantengas en la hoja. El sitio estático no tiene
 *   base de datos de “usuarios registrados”; esto es un atajo visual.
 *
 * Tras editar: git add js/gh-site-config.js && git commit -m "chore: config" && git push origin main
 */
window.GH_SITE_CONFIG = {
  ga4MeasurementId: 'G-76XN5538Y8',
  formspreeLeadsId: '',
  formspreeContactId: '',
  githubRepo: 'ofertaslaguna84-bit/ghspecialist-web',
  panelPassword: 'Grupo84*',
  analyticsEmbedUrl: '',
  leadsSheetEmbedUrl: ''
};
