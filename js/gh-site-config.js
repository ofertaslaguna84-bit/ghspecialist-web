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
 * 1. Cuenta creada → entra a https://formspree.io/forms
 * 2. Pulsa + / Add New y crea un formulario (o dos si quieres separar contacto vs onboarding)
 * 3. Copia el ID: es lo que va después de https://formspree.io/f/  (ej. si la URL es .../f/mnqvpzy → ID = mnqvpzy)
 * 4. Pega ese ID abajo en formspreeContactId y formspreeLeadsId (el MISMO en ambos si usas un solo formulario)
 * 5. git commit + push → el sitio empezará a enviar a Formspree; verás envíos en Formspree y en tu correo
 *
 * === C) ntfy (opcional, avisos al móvil al entrar al sitio) ===
 * No va aquí: edita window.GH_VISITOR_NOTIFY.ntfyTopic en index.html, landing, sobre-pedro.
 *
 * === D) Panel interno (/panel/) ===
 * panelPassword → vacío = panel sin clave. Si pones texto, hay que escribirlo para entrar.
 *   Ojo: en repo público la clave es visible en el código; para más seguridad usa repo privado o Cloudflare Access.
 *
 * analyticsEmbedUrl → URL de informe EMBEBIBLE para ver métricas DENTRO del panel.
 *   No es el link normal de GA: crea un informe en Looker Studio conectado a tu GA4,
 *   luego Archivo → Incorporar informe → copia la URL que empiece por lookerstudio.google.com/embed/...
 *
 * leadsSheetEmbedUrl → (opcional) URL de una hoja de Google publicada (Archivo → Publicar en la web)
 *   para ver lista de suscriptores/prospectos que tú mantengas en la hoja. El sitio estático no tiene
 *   base de datos de “usuarios registrados”; esto es un atajo visual.
 *
 * formspreeSubmissionsUrl → (opcional) URL exacta de la pestaña Submissions de tu formulario en Formspree.
 *   Si lo dejas vacío, el panel usa https://formspree.io/forms/TU_ID (mismo ID que /f/...).
 *
 * Tras editar: git add js/gh-site-config.js && git commit -m "chore: config" && git push origin main
 */
window.GH_SITE_CONFIG = {
  ga4MeasurementId: 'G-76XN5538Y8',
  formspreeLeadsId: 'mdaplvzd',
  formspreeContactId: 'mdaplvzd',
  formspreeSubmissionsUrl: '',
  panelPassword: 'Grupo84*',
  analyticsEmbedUrl: '',
  leadsSheetEmbedUrl: ''
};
