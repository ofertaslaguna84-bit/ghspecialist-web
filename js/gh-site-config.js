/**
 * Configuración del sitio — rellena y guarda.
 *
 * 1) Google Analytics 4: crea una propiedad en https://analytics.google.com
 *    Admin → Flujos de datos → Web → copia el ID de medición (G-XXXXXXXXXX).
 *    Las estadísticas las ves en el mismo Analytics (Informes, Tiempo real, etc.).
 *
 * 2) Formspree (contactos + leads por correo y panel): https://formspree.io
 *    Crea una cuenta, añade tu correo, crea un formulario por cada ID abajo
 *    (o usa el mismo ID en ambos si quieres todo en un solo buzón).
 *    En el panel de Formspree ves todos los envíos; también te llegan por email.
 */
window.GH_SITE_CONFIG = {
  ga4MeasurementId: '',
  formspreeLeadsId: '',
  formspreeContactId: ''
};
