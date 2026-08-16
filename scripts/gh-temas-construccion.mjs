/**
 * Temas de blog para constructoras y desarrolladoras.
 *
 * Se ponen AL PRINCIPIO del catalogo porque pickNextValidatedTopic recorre la
 * lista en orden y devuelve el primero que no este cubierto: asi el blog diario
 * escribe de esto durante meses antes de volver a lo generico.
 *
 * Dos perfiles distintos, con dolores distintos:
 *  - CONSTRUCTORA: le falta gente en obra, no sabe como va el avance, persigue
 *    subcontratistas.
 *  - DESARROLLADORA: tiene que vender las casas y no perder al comprador entre
 *    la primera pregunta y la firma.
 */
export const TEMAS_CONSTRUCCION = [
  // --- Constructora: mano de obra (el dolor #1, y donde GH tiene caso real) ---
  { phrase: 'como reclutar personal de obra rapido', category: 'Automatización' },
  { phrase: 'software para reclutar personal de obra', category: 'Automatización' },
  { phrase: 'como contratar albañiles y destajistas', category: 'Consejos' },
  { phrase: 'contratar cuadrillas para obra', category: 'Consejos' },
  { phrase: 'automatizar reclutamiento de personal de obra', category: 'Automatización' },
  { phrase: 'falta de mano de obra en construccion', category: 'Consejos' },
  { phrase: 'como filtrar candidatos de obra con ia', category: 'IA' },
  { phrase: 'reclutamiento por whatsapp para constructoras', category: 'WhatsApp' },

  // --- Constructora: operacion de obra ---
  { phrase: 'crm para constructoras mexico', category: 'CRM' },
  { phrase: 'automatizacion para empresas constructoras', category: 'Automatización' },
  { phrase: 'inteligencia artificial para constructoras', category: 'IA' },
  { phrase: 'control de avance de obra digital', category: 'Automatización' },
  { phrase: 'reportes de obra automaticos', category: 'Automatización' },
  { phrase: 'seguimiento de subcontratistas por whatsapp', category: 'WhatsApp' },
  { phrase: 'chatbot para constructoras', category: 'Chatbots' },
  { phrase: 'digitalizacion de empresas constructoras', category: 'Automatización' },
  { phrase: 'como controlar destajos en obra', category: 'Consejos' },

  // --- Desarrolladora: vender la vivienda ---
  { phrase: 'crm inmobiliario mexico', category: 'CRM' },
  { phrase: 'crm para desarrolladoras de vivienda', category: 'CRM' },
  { phrase: 'como dar seguimiento a leads inmobiliarios', category: 'CRM' },
  { phrase: 'whatsapp para inmobiliarias', category: 'WhatsApp' },
  { phrase: 'chatbot para inmobiliarias mexico', category: 'Chatbots' },
  { phrase: 'como vender casas por whatsapp', category: 'WhatsApp' },
  { phrase: 'automatizar ventas de vivienda', category: 'Automatización' },
  { phrase: 'calificar leads inmobiliarios con ia', category: 'IA' },
  { phrase: 'agendar citas en casa muestra automatico', category: 'Automatización' },
  { phrase: 'como no perder leads inmobiliarios', category: 'Consejos' },
  { phrase: 'embudo de ventas inmobiliario', category: 'CRM' },
  { phrase: 'seguimiento de prospectos de vivienda', category: 'CRM' },
  { phrase: 'ia para desarrolladoras inmobiliarias', category: 'IA' },
  { phrase: 'postventa de vivienda automatizada', category: 'Automatización' },
  { phrase: 'leads de vivienda infonavit', category: 'Consejos' },

  // --- Credito: saber quien puede comprar antes de la visita ---
  { phrase: 'precalificacion de credito para vivienda', category: 'Automatización' },
  { phrase: 'como saber si un cliente califica para credito', category: 'Consejos' },
  { phrase: 'credito para construccion de casa', category: 'Consejos' },
  { phrase: 'credito puente para desarrolladoras', category: 'Consejos' },
  { phrase: 'casas sin enganche como funciona', category: 'Consejos' },
  { phrase: 'filtrar compradores que no califican', category: 'IA' },
  { phrase: 'cuanto gana para que le presten infonavit', category: 'Consejos' },

  // --- Venta del desarrollo ---
  { phrase: 'como vender un desarrollo de vivienda rapido', category: 'Consejos' },
  { phrase: 'renders 3d para vender sobre plano', category: 'Consejos' },
  { phrase: 'visita virtual para desarrollos de vivienda', category: 'Automatización' },
  { phrase: 'campañas de facebook para vender casas', category: 'SEO' },
  { phrase: 'agendar visitas a casa muestra por whatsapp', category: 'WhatsApp' },
  { phrase: 'panel de avance de ventas inmobiliarias', category: 'CRM' },

  // --- SEO / captacion para el gremio ---
  { phrase: 'seo para constructoras', category: 'SEO' },
  { phrase: 'seo para inmobiliarias mexico', category: 'SEO' },
  { phrase: 'marketing digital para constructoras', category: 'SEO' },
  { phrase: 'marketing para desarrolladoras inmobiliarias', category: 'SEO' },
  { phrase: 'como conseguir clientes para constructora', category: 'Consejos' },
];
