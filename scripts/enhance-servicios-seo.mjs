#!/usr/bin/env node
/** Añade BreadcrumbList + FAQPage JSON-LD a páginas de servicios. */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SITE = 'https://ghspecialist.com';

const SERVICE_FAQS = {
  'chatbot-ia-whatsapp.html': {
    name: 'Chatbot IA WhatsApp',
    faqs: [
      ['¿Cuánto cuesta un chatbot IA para WhatsApp en México?', 'Desde $12,000 MXN + IVA, pago único. Incluye configuración, integración WhatsApp Business y capacitación básica.'],
      ['¿Cuánto tarda implementar un chatbot?', 'Entre 7 y 14 días para un chatbot de ventas o atención. Proyectos complejos pueden tomar 3–4 semanas.'],
      ['¿El chatbot funciona 24/7?', 'Sí. Responde automáticamente fuera de horario, califica prospectos y agenda citas sin intervención humana.'],
    ],
  },
  'crm-kommo.html': {
    name: 'CRM Kommo',
    faqs: [
      ['¿Qué es Kommo CRM?', 'Kommo es un CRM conversacional líder para WhatsApp e Instagram con agente de IA integrado para ventas.'],
      ['¿GH Specialist es partner de Kommo?', 'Sí, somos Gold Partner oficial. Implementamos, configuramos pipeline y capacitamos a tu equipo.'],
      ['¿Kommo incluye automatizaciones de WhatsApp?', 'Sí. SalesBot, pipelines, respuestas automáticas e integración con WhatsApp Business API.'],
    ],
  },
  'automatizacion-total.html': {
    name: 'Automatización Total',
    faqs: [
      ['¿Qué incluye la automatización total con IA?', 'Diagnóstico, chatbots, CRM, flujos n8n/Make, integraciones y capacitación para digitalizar ventas y operaciones.'],
      ['¿Para qué tipo de empresas es?', 'PYMEs y medianas empresas en México: inmobiliarias, constructoras, clínicas, agencias y servicios B2B.'],
      ['¿Cuál es el ROI esperado?', 'Clientes reportan recuperación de inversión en 3–6 meses por ahorro en nómina y más ventas cerradas.'],
    ],
  },
  'agentes-omnicanal.html': {
    name: 'Agentes Omnicanal',
    faqs: [
      ['¿Qué es un agente omnicanal con IA?', 'Un asistente que atiende WhatsApp, Instagram, web y email desde un solo cerebro, con contexto unificado del cliente.'],
      ['¿Se integra con mi CRM?', 'Sí. Kommo, HubSpot y CRMs vía API o Zapier/Make.'],
      ['¿Puede transferir a un humano?', 'Sí. Detecta cuándo escalar la conversación a un vendedor en vivo.'],
    ],
  },
  'web-seo-blog-ia.html': {
    name: 'Web SEO y Blog IA',
    faqs: [
      ['¿Incluyen SEO en el sitio web?', 'Sí. Meta tags, schema.org, sitemap, velocidad, blog optimizado y estrategia de contenidos con IA.'],
      ['¿Publican artículos automáticamente?', 'Configuramos blog con generación asistida por IA, revisión humana y publicación optimizada para Google.'],
      ['¿Funciona en GitHub Pages o WordPress?', 'Trabajamos con sitios estáticos, Next.js, WordPress y landing pages en Wix migradas a stack propio.'],
    ],
  },
  'cien-automatizado.html': {
    name: '100% Automatizado',
    faqs: [
      ['¿Qué significa 100% automatizado?', 'Prospecto entra por WhatsApp o web, la IA califica, agenda, da seguimiento y notifica a ventas sin captura manual.'],
      ['¿Necesito contratar menos personal?', 'Reduce tareas repetitivas; tu equipo se enfoca en cerrar ventas, no en copiar datos.'],
      ['¿Incluye reportes?', 'Sí. Dashboards de conversión, tiempo de respuesta y leads por canal.'],
    ],
  },
  'growth-difusiones.html': {
    name: 'Growth y Difusiones',
    faqs: [
      ['¿Qué son difusiones con IA en WhatsApp?', 'Campañas masivas segmentadas por WhatsApp Business API con personalización y cumplimiento de políticas Meta.'],
      ['¿Es spam?', 'No. Solo contactos que optaron recibir mensajes, con plantillas aprobadas por Meta.'],
      ['¿Pueden reactivar prospectos fríos?', 'Sí. Secuencias automáticas para leads que no respondieron en 30–90 días.'],
    ],
  },
  'pauta-omnicanal.html': {
    name: 'Pauta Omnicanal',
    faqs: [
      ['¿Gestionan Facebook e Instagram Ads?', 'Sí. Campañas de generación de leads conectadas a chatbot y CRM para no perder ningún prospecto.'],
      ['¿El chatbot recibe leads de los anuncios?', 'Sí. Click-to-WhatsApp y formularios integrados al flujo de ventas automatizado.'],
      ['¿Reportan ROI de pauta?', 'Sí. Costo por lead, conversión a cita y venta cerrada en un solo tablero.'],
    ],
  },
  'proyectos-medida.html': {
    name: 'Proyectos a Medida',
    faqs: [
      ['¿Qué tipo de proyectos custom hacen?', 'Integraciones ERP, APIs propias, bots especializados, dashboards y automatizaciones n8n a medida.'],
      ['¿Trabajan con empresas fuera de México?', 'Sí. México y LATAM, español e inglés.'],
      ['¿Cómo empiezo?', 'Agenda un diagnóstico gratuito de 30 minutos en calendly.com/ghspecialist.'],
    ],
  },
};

function buildExtraSchema(file, cfg) {
  const url = `${SITE}/servicios/${file}`;
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Servicios', item: `${SITE}/#servicios` },
      { '@type': 'ListItem', position: 3, name: cfg.name, item: url },
    ],
  };
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: cfg.faqs.map(([q, a]) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
  return `\n<script type="application/ld+json">${JSON.stringify(breadcrumb)}</script>\n<script type="application/ld+json">${JSON.stringify(faq)}</script>`;
}

async function main() {
  const dir = join(ROOT, 'servicios');
  const files = await readdir(dir);
  for (const file of files.filter((f) => f.endsWith('.html'))) {
    const cfg = SERVICE_FAQS[file];
    if (!cfg) continue;
    const path = join(dir, file);
    let html = await readFile(path, 'utf8');
    if (html.includes('"@type":"FAQPage"') || html.includes('"@type": "FAQPage"')) {
      console.log(`  skip ${file} (ya tiene FAQ)`);
      continue;
    }
    const extra = buildExtraSchema(file, cfg);
    const svcIdx = html.indexOf('"@type":"Service"');
    if (svcIdx === -1) {
      console.warn(`  ⚠ no Service schema in ${file}`);
      continue;
    }
    const endScript = html.indexOf('</script>', svcIdx);
    if (endScript === -1) {
      console.warn(`  ⚠ no closing script in ${file}`);
      continue;
    }
    html = html.slice(0, endScript + 9) + extra + html.slice(endScript + 9);
    await writeFile(path, html, 'utf8');
    console.log(`✓ ${file}`);
  }
}

main();
