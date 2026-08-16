/**
 * Titles reescritos a mano para los 14 articulos que pasaban de 60 caracteres.
 *
 * No se pueden acortar con una regla: cortar por programa deja titulos mochos
 * y le quita a Google la informacion del tema. Hay que reescribirlos, y eso es
 * lo que esta aqui.
 *
 * Criterios: bajo 60 caracteres, que arranque con la palabra que la gente
 * busca, sin "Guia Completa" (relleno que se come el espacio util), y sin el
 * año cuando no aporta. Se corrigen tambien las faltas de ortografia que
 * traian ("Record" por "Récord", "artifical" por "artificial").
 *
 * El h1 se deja aparte: puede ser mas largo y mas conversacional, porque lo
 * lee una persona y no compite por espacio en el buscador.
 */
export const TITULOS_REESCRITOS = {
  'agente-ia-vs-humano-mexico.html': {
    title: 'Agente de IA vs. humano: ¿quién atiende mejor?',
    h1: 'Agente de IA vs. humano: ¿quién contesta mejor a tus clientes?',
  },
  'capacitaciones-ia-al-por-mayor-mineria-construccion-industria.html': {
    title: 'Capacitaciones de IA para minería y construcción',
    h1: 'Capacitaciones de IA al por mayor para minería, construcción e industria',
  },
  'chatbot-whatsapp-business-ia.html': {
    title: 'Chatbot para WhatsApp Business: cómo crear uno',
    h1: 'Chatbot para WhatsApp Business: cómo crear uno con IA',
  },
  'chatbot-whatsapp-negocios-mexico.html': {
    title: 'Chatbot de WhatsApp para negocios en México',
    h1: 'Chatbot de WhatsApp para negocios en México',
  },
  'chatbot-whatsapp-ventas-mexico-2026.html': {
    title: 'Chatbot de WhatsApp para vender en México',
    h1: 'Chatbot de WhatsApp para ventas: el futuro de la atención al cliente',
  },
  'como-automatizar-negocio-inteligencia-artificial.html': {
    title: 'Cómo automatizar tu negocio con IA',
    h1: 'Cómo automatizar tu negocio con inteligencia artificial',
  },
  'como-le-vendo-la-ia-a-mis-clientes-y-por-que-nun-mayo-2026.html': {
    title: 'Cómo le vendo la IA a mis clientes',
    h1: 'Cómo le vendo la IA a mis clientes (y por qué nunca les hablo de tecnología)',
  },
  'como-posicionar-pagina-google-mexico-2026.html': {
    title: 'Cómo posicionar tu página en Google en México',
    h1: 'Cómo posicionar tu página en Google (SEO México)',
  },
  'como-reducir-nomina-con-ia.html': {
    title: 'Cómo reducir la nómina con IA en México',
    h1: 'Cómo reducir la nómina con inteligencia artificial en México',
  },
  'como-usar-la-ia-para-que-me-vean-empresas-del-pa-mayo-2026.html': {
    title: 'IA para que te vean las empresas del parque industrial',
    h1: 'Cómo usar la IA para que te vean las empresas del parque industrial',
  },
  'cuanto-cuesta-posicionar-pagina-google-mexico-2026.html': {
    title: '¿Cuánto cuesta posicionar tu página en Google?',
    h1: '¿Cuánto cuesta posicionar mi página en Google en México?',
  },
  'cuanto-cuesta-un-agente-de-inteligencia-artifici-junio-2026.html': {
    title: '¿Cuánto cuesta un agente de IA en México?',
    h1: '¿Cuánto cuesta un agente de inteligencia artificial en México?',
  },
  'record-en-inversion-extranjera-y-como-hacer-que--mayo-2026.html': {
    title: 'Récord de inversión extranjera: cómo aparecer en Google',
    h1: 'Récord en inversión extranjera y cómo hacer que tu empresa salga en Google',
  },
  'whats-app-y-agenda-con-inteligencia-artifical-to-mayo-2026.html': {
    title: 'WhatsApp y agenda con IA en Torreón y Monterrey',
    h1: 'WhatsApp y agenda con inteligencia artificial en Torreón y Monterrey',
  },
};
