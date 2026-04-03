/**
 * GH Specialist — idioma manual (ES/EN) + moneda por IP (solo MX → MXN; resto → USD).
 */
(function () {
  var STORAGE_KEY = 'gh_lang';
  var RATE = 17.2;
  var PRICES = { starter: 12000, business: 35000, enterprise: 120000 };

  var state = {
    lang: 'es',
    currency: 'MXN'
  };

  function mxnToUsd(mxn) {
    return Math.round(mxn / RATE);
  }

  function fmtMxnNum(n) {
    return n.toLocaleString('es-MX');
  }

  function fmtUsdNum(n) {
    return n.toLocaleString('en-US');
  }

  var T = {
    es: {
      'meta.title': 'GH Specialist — Automatiza tu Negocio con IA | Pedro Luis Díaz Velázquez',
      'meta.desc': 'Automatización IA para empresas LATAM. Chatbots WhatsApp, CRM Kommo, agentes omnicanal, marketing digital. Consulta gratis con Pedro Luis Díaz Velázquez.',
      'nav.servicios': 'Servicios',
      'nav.como': 'Cómo funciona',
      'nav.pedro': 'Pedro',
      'nav.resultados': 'Resultados',
      'nav.precios': 'Precios',
      'nav.blog': 'Blog',
      'nav.whatsapp': 'WhatsApp',
      'nav.agendar': 'Agendar diagnóstico',
      'badge.prices': 'Precios en MXN',
      'badge.prices_usd': 'Precios en USD',
      'embudo.title': 'Mira cómo la IA mueve tus clientes por el embudo. Automáticamente.',
      'embudo.sub': 'Tu pipeline de ventas operando solo, las 24 horas',
      'embudo.cta': 'Agendar diagnóstico',
      'book.label': 'Diagnóstico sin costo',
      'book.title': 'Primero validamos que el proyecto encaje',
      'book.h3': 'Cuéntanos tu perfil',
      'book.note': 'Filtramos curiosos y priorizamos equipos con nómina y proyecto reales.',
      'book.nombre': 'Nombre *',
      'book.email': 'Correo *',
      'book.wa': 'WhatsApp (lada + número) *',
      'book.pais': 'País *',
      'book.estado': 'Estado *',
      'book.nomina': '¿Cuánto pagan al mes en nómina (aprox.)? *',
      'book.quiero': '¿Qué te gustaría instalar? * (marca uno o más)',
      'book.proyecto_usd': '¿En qué rango está el proyecto (USD) todo incluido? *',
      'book.hint_nomina': 'Si tu nómina está en USD (EE. UU.), elige la banda equivalente a tu nómina mensual total.',
      'book.hint_proyecto': 'Incluye licencias y alcance acordado; no es solo “mensualidad”.',
      'book.submit': 'Continuar',
      'book.cal_hint':
        'Justo debajo del formulario está el calendario de Google: ahí eliges fecha y hora. El cuestionario nos ayuda a preparar la reunión.',
      'book.direct': '¿Ya pasaste este filtro? Abrir agenda Google directo',
      'book.placeholder.nombre': 'Tu nombre',
      'book.placeholder.email': 'correo@empresa.com',
      'book.placeholder.wa': 'Ej. +52… o +1…',
      'book.opt.selecciona': 'Selecciona',
      'book.opt.elige_estado': 'Elige estado',
      'book.opt.primero_pais': 'Primero elige país',
      'book.opt.mexico': 'México',
      'book.opt.usa': 'Estados Unidos',
      'pricing.label': 'Precios transparentes',
      'pricing.title': 'Inversión que se paga sola',
      'plan.starter.foot': 'pago único · sin mensualidades',
      'plan.business.foot': 'pago único · soporte 3 meses',
      'plan.enterprise.foot': 'pago único · soporte 12 meses',
      'plan.btn.starter': 'Quiero este plan',
      'plan.btn.business': 'Empezar ahora',
      'plan.btn.enterprise': 'Quiero Enterprise',
      'plan.footer_hint': '¿No sabes cuál es el tuyo? Cuéntanos sobre tu empresa →',
      'strip2': '¿Tu empresa no está en la lista? No importa. Trabajamos con empresas de todo México.',
      'strip2.btn': '🗓️ Agenda tu diagnóstico',
      'contact.label': 'Contáctanos',
      'contact.h2': 'Agenda tu diagnóstico gratuito',
      'contact.p': 'Sin compromisos. En 30 minutos te decimos exactamente qué necesita tu empresa y cuánto puedes ahorrar con IA.',
      'cta.h2': '¿Tu empresa sigue operando<br>como en 2015?',
      'cta.p': 'Cada día sin automatización es dinero dejado en la mesa. El diagnóstico es gratis. La transformación, invaluable.',
      'cta.btn1': '🗓️ Diagnóstico gratis ahora',
      'cta.btn2': 'Escribir por WhatsApp',
      'blogseo.label': 'Contenido SEO con IA',
      'blogseo.title': 'Blog con IA para posicionar en Google',
      'blogseo.desc': 'Guías y artículos para automatizar tu negocio. Publicamos contenido pensado para SEO; si quieres el mismo sistema en tu web, lo implementamos.',
      'blogseo.btn': 'Ver blog',
      'blogseo.btn2': 'Web + SEO + Blog IA',
      'footer.tagline': 'Automatizamos empresas en México y LATAM con IA. Chatbots, CRM, marketing y transformación digital.',
      'reject.p1': 'Por ahora no abrimos agenda para este rango por aquí. <strong>Si tu inversión total del proyecto es menor a USD $1,500</strong> (todo incluido), escríbenos por WhatsApp y vemos si hay otra opción.',
      'reject.wa': 'WhatsApp →',
      'cal.title': 'Elige fecha y hora',
      'cal.sub': 'Aquí abajo está el calendario de Google: usa los botones para elegir día y horario disponibles.',
      'cal.fallback': 'Si no carga el calendario aquí (bloqueo del navegador), abre la misma agenda en una pestaña nueva.',
      'cal.btn': 'Abrir agenda en Google',
      'strip1.btn1': '🗓️ Agendar diagnóstico',
      'strip1.btn2': 'WhatsApp directo',
      'mega.c1t': 'Chatbot IA WhatsApp',
      'mega.c1d': 'Vende 24/7 en automático',
      'mega.c2t': 'Agentes IA Omnicanal',
      'mega.c2d': 'WhatsApp, IG, email, web',
      'mega.c3t': 'CRM Kommo',
      'mega.c3d': 'Pipeline + automatizaciones',
      'mega.c4t': 'Web + SEO + Blog IA',
      'mega.c4d': 'Contenido que posiciona solo',
      'mega.c5t': 'Automatización Total',
      'mega.c5d': 'Conecta todos tus sistemas',
      'mega.c6t': 'Growth + Difusiones',
      'mega.c6d': 'Campañas masivas con IA',
      'mega.c7t': 'Pauta Omnicanal',
      'mega.c7d': 'Ads en todas las plataformas',
      'mega.c8t': '100% Automatizado',
      'mega.c8d': 'Tu empresa opera sola',
      'mega.c9t': 'Proyectos a Medida',
      'mega.c9d': 'Soluciones personalizadas',
      'chat.label': 'Chatbot IA en acción',
      'chat.h2': 'Tu bot atiende, califica y cierra.<br>Tú duermes.',
      'chat.p': 'Selecciona tu industria y ve cómo la IA conversa con tus clientes — califica, informa, agenda y cierra ventas sin intervención humana.',
      'chat.demo': 'Ver demo real en WhatsApp →',
      'trusted.label': 'Clientes activos',
      'trusted.title': 'Empresas que ya operan con IA',
      'analisis.label': 'Oferta especial',
      'analisis.title': 'Pide tu análisis de mercado gratuito',
      'analisis.sub': 'Al contratar, te decimos exactamente qué hace tu competencia, cómo está posicionada y cómo mejoramos todo lo que tiene ella.',
      'analisis.btn1': 'Agendar diagnóstico',
      'analisis.btn2': 'Hablar por WhatsApp',
      'analisis.li1': 'Análisis completo de tu competencia',
      'analisis.li2': 'Mapa de posicionamiento digital',
      'analisis.li3': 'Plan de acción personalizado con IA',
      'plan.footer_q': '💡 ¿No sabes cuál es el tuyo? ',
      'plan.footer_a': 'Cuéntanos sobre tu empresa →',
      'contact.form_h3': 'Cuéntanos sobre tu empresa',
      'contact.form_p': 'Te respondemos en menos de 2 horas en días hábiles.',
      'contact.c_wa_t': 'WhatsApp directo',
      'contact.c_wa_s': '+52 871 263 8082 · Respuesta en minutos',
      'contact.c_cal_t': 'Agenda una videollamada',
      'contact.c_cal_s': 'Google Calendar · Elige fecha y hora',
      'contact.c_em_t': 'Email',
      'contact.btn_send': 'Enviar por WhatsApp →'
    },
    en: {
      'meta.title': 'GH Specialist — Automate Your Business with AI | Pedro Luis Díaz Velázquez',
      'meta.desc': 'AI automation for LATAM companies. WhatsApp chatbots, Kommo CRM, omnichannel agents, digital marketing. Free consultation with Pedro Luis Díaz Velázquez.',
      'nav.servicios': 'Services',
      'nav.como': 'How it works',
      'nav.pedro': 'Pedro',
      'nav.resultados': 'Results',
      'nav.precios': 'Pricing',
      'nav.blog': 'Blog',
      'nav.whatsapp': 'WhatsApp',
      'nav.agendar': 'Book a diagnostic',
      'badge.prices': 'Prices in MXN',
      'badge.prices_usd': 'Prices in USD',
      'embudo.title': 'See how AI moves your leads through the funnel. Automatically.',
      'embudo.sub': 'Your sales pipeline running on its own, 24/7',
      'embudo.cta': 'Book a diagnostic',
      'book.label': 'Free diagnostic',
      'book.title': 'First we validate the project is a fit',
      'book.h3': 'Tell us about your profile',
      'book.note': 'We filter tire-kickers and prioritize teams with real payroll and projects.',
      'book.nombre': 'Name *',
      'book.email': 'Email *',
      'book.wa': 'WhatsApp (country code + number) *',
      'book.pais': 'Country *',
      'book.estado': 'State *',
      'book.nomina': 'Approx. monthly payroll? *',
      'book.quiero': 'What would you like to install? * (one or more)',
      'book.proyecto_usd': 'Project range (USD) all-in? *',
      'book.hint_nomina': 'If your payroll is in USD (U.S.), pick the band that matches your total monthly payroll.',
      'book.hint_proyecto': 'Includes licenses and agreed scope; not just “monthly fee”.',
      'book.submit': 'Continue',
      'book.cal_hint':
        'Below the form you’ll find the Google calendar to pick date and time. The questionnaire helps us prepare the call.',
      'book.direct': 'Already passed this step? Open Google Calendar directly',
      'book.placeholder.nombre': 'Your name',
      'book.placeholder.email': 'you@company.com',
      'book.placeholder.wa': 'e.g. +52… or +1…',
      'book.opt.selecciona': 'Choose',
      'book.opt.elige_estado': 'Choose state',
      'book.opt.primero_pais': 'Choose country first',
      'book.opt.mexico': 'Mexico',
      'book.opt.usa': 'United States',
      'pricing.label': 'Transparent pricing',
      'pricing.title': 'Investment that pays for itself',
      'plan.starter.foot': 'one-time · no monthly fees',
      'plan.business.foot': 'one-time · 3 months support',
      'plan.enterprise.foot': 'one-time · 12 months support',
      'plan.btn.starter': 'I want this plan',
      'plan.btn.business': 'Get started',
      'plan.btn.enterprise': 'Enterprise',
      'plan.footer_hint': 'Not sure which fits? Tell us about your company →',
      'strip2': 'Not on the list? We still work with companies across Mexico.',
      'strip2.btn': '🗓️ Book your diagnostic',
      'contact.label': 'Contact',
      'contact.h2': 'Book your free diagnostic',
      'contact.p': 'No obligation. In 30 minutes we tell you what your company needs and how much you can save with AI.',
      'cta.h2': 'Is your company still running<br>like it’s 2015?',
      'cta.p': 'Every day without automation is money left on the table. The diagnostic is free. Transformation is invaluable.',
      'cta.btn1': '🗓️ Free diagnostic now',
      'cta.btn2': 'Message on WhatsApp',
      'blogseo.label': 'AI content for SEO',
      'blogseo.title': 'AI blog to rank on Google',
      'blogseo.desc': 'Guides and articles to automate your business. We publish SEO-focused content; if you want the same system on your site, we implement it.',
      'blogseo.btn': 'Read the blog',
      'blogseo.btn2': 'Web + SEO + AI blog',
      'footer.tagline': 'We automate companies in Mexico and LATAM with AI. Chatbots, CRM, marketing, and digital transformation.',
      'reject.p1': 'We don’t open the calendar here for this range yet. <strong>If your all-in project is under USD $1,500</strong> (all-in), message us on WhatsApp and we’ll see if there’s another option.',
      'reject.wa': 'WhatsApp →',
      'cal.title': 'Pick date and time',
      'cal.sub': 'Below is the Google calendar: use the controls to pick an available slot.',
      'cal.fallback': 'If the calendar doesn’t load here (browser blocking), open the same booking in a new tab.',
      'cal.btn': 'Open Google calendar',
      'strip1.btn1': '🗓️ Book a diagnostic',
      'strip1.btn2': 'WhatsApp',
      'mega.c1t': 'AI WhatsApp chatbot',
      'mega.c1d': 'Sell 24/7 on autopilot',
      'mega.c2t': 'Omnichannel AI agents',
      'mega.c2d': 'WhatsApp, IG, email, web',
      'mega.c3t': 'Kommo CRM',
      'mega.c3d': 'Pipeline + automations',
      'mega.c4t': 'Web + SEO + AI blog',
      'mega.c4d': 'Content that ranks on its own',
      'mega.c5t': 'Full automation',
      'mega.c5d': 'Connect all your systems',
      'mega.c6t': 'Growth + broadcasts',
      'mega.c6d': 'Mass campaigns with AI',
      'mega.c7t': 'Omnichannel paid media',
      'mega.c7d': 'Ads across platforms',
      'mega.c8t': '100% automated',
      'mega.c8d': 'Your company runs itself',
      'mega.c9t': 'Custom projects',
      'mega.c9d': 'Tailored solutions',
      'chat.label': 'AI chatbot in action',
      'chat.h2': 'Your bot qualifies and closes.<br>You sleep.',
      'chat.p': 'Pick an industry and see how AI chats with your leads — qualify, inform, book, and close without human hand-holding.',
      'chat.demo': 'See a real demo on WhatsApp →',
      'trusted.label': 'Active clients',
      'trusted.title': 'Companies already running on AI',
      'analisis.label': 'Special offer',
      'analisis.title': 'Get a free market analysis',
      'analisis.sub': 'When you hire us, we show exactly what your competitors do, how they’re positioned, and how we improve on all of it.',
      'analisis.btn1': 'Book a diagnostic',
      'analisis.btn2': 'Chat on WhatsApp',
      'analisis.li1': 'Full competitor analysis',
      'analisis.li2': 'Digital positioning map',
      'analisis.li3': 'Personalized AI action plan',
      'plan.footer_q': '💡 Not sure which fits? ',
      'plan.footer_a': 'Tell us about your company →',
      'contact.form_h3': 'Tell us about your company',
      'contact.form_p': 'We reply in under 2 hours on business days.',
      'contact.c_wa_t': 'WhatsApp',
      'contact.c_wa_s': '+52 871 263 8082 · Replies in minutes',
      'contact.c_cal_t': 'Book a video call',
      'contact.c_cal_s': 'Google Calendar · Pick date and time',
      'contact.c_em_t': 'Email',
      'contact.btn_send': 'Send via WhatsApp →'
    }
  };

  var ERR = {
    es: {
      nombre: 'Escribe tu nombre.',
      email: 'Correo no válido.',
      pais: 'Selecciona país.',
      estado: 'Selecciona estado.',
      nomina: 'Selecciona rango de nómina.',
      quiero: 'Marca al menos una opción de lo que quieres instalar.',
      proyecto_usd: 'Selecciona el rango del proyecto en USD.'
    },
    en: {
      nombre: 'Enter your name.',
      email: 'Invalid email.',
      pais: 'Select country.',
      estado: 'Select state.',
      nomina: 'Select payroll range.',
      quiero: 'Check at least one thing you want to install.',
      proyecto_usd: 'Select the project range in USD.'
    }
  };

  function t(key) {
    var L = T[state.lang] || T.es;
    return (L[key] !== undefined ? L[key] : T.es[key]) || key;
  }

  function renderEmbudoLine() {
    var el = document.getElementById('gh-embudo-line');
    if (!el) return;
    var mxn = PRICES.starter;
    var usd = mxnToUsd(mxn);
    if (state.lang === 'es') {
      if (state.currency === 'MXN') {
        el.innerHTML = 'Automatiza tus mensajes desde <strong>$' + fmtMxnNum(mxn) + '</strong> <span class="iva">+ IVA</span>';
      } else {
        el.innerHTML = 'Automatiza tus mensajes desde <strong>$' + fmtUsdNum(usd) + ' USD</strong> <span class="iva">(pago único)</span>';
      }
    } else {
      if (state.currency === 'MXN') {
        el.innerHTML = 'Automate your messages from <strong>$' + fmtMxnNum(mxn) + ' MXN</strong> <span class="iva">+ VAT</span>';
      } else {
        el.innerHTML = 'Automate your messages from <strong>$' + fmtUsdNum(usd) + ' USD</strong> <span class="iva">(one-time)</span>';
      }
    }
  }

  function renderEmbudoSub() {
    var el = document.getElementById('gh-embudo-sub');
    if (!el) return;
    el.textContent = state.lang === 'es' ? 'No incluye licencia de Kommo.' : 'Kommo license not included.';
  }

  function renderStrip1() {
    var el = document.getElementById('gh-strip-1');
    if (!el) return;
    var u = mxnToUsd(PRICES.starter);
    var line;
    if (state.lang === 'es') {
      line = state.currency === 'MXN'
        ? 'Automatiza tus mensajes desde $12,000 + IVA · sin licencia Kommo · Diagnóstico gratis.'
        : 'Automatiza tus mensajes desde $' + fmtUsdNum(u) + ' USD · sin licencia Kommo · Diagnóstico gratis.';
    } else {
      line = state.currency === 'MXN'
        ? 'Automate your messages from $12,000 MXN + VAT · Kommo license not included · Free diagnostic.'
        : 'Automate your messages from $' + fmtUsdNum(u) + ' USD · Kommo license not included · Free diagnostic.';
    }
    el.textContent = line;
  }

  function renderBookLead() {
    var el = document.getElementById('gh-book-lead');
    if (!el) return;
    var mxn = PRICES.starter;
    var usd1500 = 'USD $1,500';
    var chatbotEs;
    var chatbotEn;
    if (state.currency === 'MXN') {
      chatbotEs = 'Chatbots desde <strong>$' + fmtMxnNum(mxn) + ' + IVA</strong> en México (Kommo no incluido salvo que se cotice aparte).';
      chatbotEn = 'Chatbots from <strong>$' + fmtMxnNum(mxn) + ' MXN + VAT</strong> in Mexico (Kommo not included unless quoted separately).';
    } else {
      chatbotEs = 'Chatbots desde <strong>$' + fmtUsdNum(mxnToUsd(mxn)) + ' USD</strong> (pago único; Kommo no incluido salvo que se cotice aparte).';
      chatbotEn = 'Chatbots from <strong>$' + fmtUsdNum(mxnToUsd(mxn)) + ' USD</strong> (one-time; Kommo not included unless quoted separately).';
    }
    if (state.lang === 'es') {
      el.innerHTML = 'Trabajamos con empresas en <strong>México y Estados Unidos</strong>. Los proyectos de implementación arrancan desde <strong>' + usd1500 + ' en adelante (todo incluido: licencias y entregables acordados)</strong>. ' + chatbotEs;
    } else {
      el.innerHTML = 'We work with companies in <strong>Mexico and the United States</strong>. Implementation projects start at <strong>' + usd1500 + ' and up (all-in: licenses and agreed deliverables)</strong>. ' + chatbotEn;
    }
  }

  function renderPricingSub() {
    var el = document.getElementById('gh-pricing-sub');
    if (!el) return;
    var lo = mxnToUsd(8000);
    var hi = mxnToUsd(15000);
    if (state.lang === 'es') {
      el.textContent = state.currency === 'MXN'
        ? 'Un empleado cuesta $8K–$15K/mes. Nuestros sistemas trabajan 24/7 desde el primer mes.'
        : 'Un empleado cuesta unos $' + lo + '–$' + hi + '/mes. Nuestros sistemas trabajan 24/7 desde el primer mes.';
    } else {
      el.textContent = state.currency === 'MXN'
        ? 'One employee costs $8K–$15K MXN/month. Our systems run 24/7 from month one.'
        : 'One employee costs about $' + lo + '–$' + hi + '/mo. Our systems run 24/7 from month one.';
    }
  }

  function setPlanPrice(el, mxnAmount) {
    if (!el) return;
    if (state.currency === 'MXN') {
      el.innerHTML = '<sup>$</sup>' + fmtMxnNum(mxnAmount);
    } else {
      el.innerHTML = '<sup>$</sup>' + fmtUsdNum(mxnToUsd(mxnAmount)) + '<span class="plan-usd"> USD</span>';
    }
  }

  function waPlanMessage(planName, mxnAmount) {
    var u = mxnToUsd(mxnAmount);
    if (state.lang === 'es') {
      return state.currency === 'MXN'
        ? 'Hola, me interesa el plan ' + planName + ' de $' + fmtMxnNum(mxnAmount)
        : 'Hola, me interesa el plan ' + planName + ' de $' + fmtUsdNum(u) + ' USD';
    }
    return state.currency === 'MXN'
      ? 'Hi, I\'m interested in the ' + planName + ' plan at $' + fmtMxnNum(mxnAmount) + ' MXN'
      : 'Hi, I\'m interested in the ' + planName + ' plan at $' + fmtUsdNum(u) + ' USD';
  }

  function updatePlanWaLinks() {
    document.querySelectorAll('a[data-gh-wa-plan]').forEach(function (a) {
      var plan = a.getAttribute('data-gh-wa-plan');
      var mxn = parseInt(a.getAttribute('data-mxn') || '0', 10);
      if (!plan || !mxn) return;
      a.href = 'https://wa.me/528712638082?text=' + encodeURIComponent(waPlanMessage(plan, mxn));
    });
  }

  function applyDataI18n() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (!key) return;
      el.textContent = t(key);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-placeholder');
      if (key) el.setAttribute('placeholder', t(key));
    });
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-html');
      if (key) el.innerHTML = t(key);
    });
  }

  function applyMeta() {
    var title = t('meta.title');
    document.title = title;
    var mt = document.querySelector('meta[name="description"]');
    if (mt) mt.setAttribute('content', t('meta.desc'));
    document.documentElement.lang = state.lang;
  }

  function applyHeaderLinks() {
    var hdrWa = document.getElementById('hdr-wa-link');
    if (hdrWa) {
      var msg = state.lang === 'es'
        ? 'Hola, quiero agendar un diagnóstico gratuito'
        : 'Hi, I want to book a free diagnostic';
      hdrWa.href = 'https://wa.me/528712638082?text=' + encodeURIComponent(msg);
    }
    var ctaWa = document.getElementById('cta-wa-link');
    if (ctaWa) {
      var msg2 = state.lang === 'es'
        ? 'Hola Pedro, quiero automatizar mi empresa'
        : 'Hi Pedro, I want to automate my company';
      ctaWa.href = 'https://wa.me/528712638082?text=' + encodeURIComponent(msg2);
    }
  }

  function applyCurrencyBadge() {
    var b = document.getElementById('currency-badge');
    if (!b) return;
    b.textContent = state.currency === 'MXN' ? t('badge.prices') : t('badge.prices_usd');
    b.title = state.lang === 'es' ? 'Según tu ubicación (IP)' : 'Based on your location (IP)';
  }

  function renderReject() {
    var rej = document.getElementById('book-reject');
    if (!rej) return;
    var p = rej.querySelector('p');
    if (p) p.innerHTML = t('reject.p1');
    var wa = document.getElementById('book-reject-wa');
    if (wa) {
      wa.textContent = t('reject.wa');
      var msg =
        state.lang === 'es'
          ? 'Hola Pedro, mi proyecto total es menor a USD $1,500 todo incluido; quiero ver si hay opciones.'
          : 'Hi Pedro, my all-in project is under USD $1,500; I want to see if there are options.';
      wa.href = 'https://wa.me/528712638082?text=' + encodeURIComponent(msg);
    }
  }

  function renderBookSelectOptions() {
    var sel = document.getElementById('gh-pais');
    if (sel) {
      var opt0 = sel.querySelector('option[value=""]');
      if (opt0) opt0.textContent = t('book.opt.selecciona');
      var oMx = sel.querySelector('option[value="MX"]');
      var oUs = sel.querySelector('option[value="US"]');
      if (oMx) oMx.textContent = t('book.opt.mexico');
      if (oUs) oUs.textContent = t('book.opt.usa');
    }
    var nom = document.getElementById('gh-nomina');
    if (nom) {
      var mapEs = {
        '': 'Selecciona',
        banda_s: 'Hasta ~$300,000 MXN/mes (~USD $17k) o equivalente',
        banda_m: '$300,000 – $1,200,000 MXN/mes (~USD $17k–$70k)',
        banda_l: '$1.2M – $4M MXN/mes o ~USD $70k–$250k/mes',
        banda_xl: 'Más de $4M MXN/mes o operación mayor en USD'
      };
      var mapEn = {
        '': 'Choose',
        banda_s: 'Up to ~$300,000 MXN/mo (~USD $17k) or equivalent',
        banda_m: '$300,000 – $1,200,000 MXN/mo (~USD $17k–$70k)',
        banda_l: '$1.2M – $4M MXN/mo or ~USD $70k–$250k/mo',
        banda_xl: 'Over $4M MXN/mo or larger USD operation'
      };
      var nm = state.lang === 'es' ? mapEs : mapEn;
      nom.querySelectorAll('option').forEach(function (o) {
        if (nm[o.value] !== undefined) o.textContent = nm[o.value];
      });
    }
    var usdSel = document.getElementById('gh-usd');
    if (usdSel) {
      var mapUsdEs = {
        '': 'Selecciona',
        menos1500: 'Menos de USD $1,500 (todo incluido)',
        '1500-5000': 'USD $1,500 – $5,000',
        '5000-15000': 'USD $5,000 – $15,000',
        '15000-50000': 'USD $15,000 – $50,000',
        mas50000: 'Más de USD $50,000'
      };
      var mapUsdEn = {
        '': 'Choose',
        menos1500: 'Under USD $1,500 (all-in)',
        '1500-5000': 'USD $1,500 – $5,000',
        '5000-15000': 'USD $5,000 – $15,000',
        '15000-50000': 'USD $15,000 – $50,000',
        mas50000: 'Over USD $50,000'
      };
      var um = state.lang === 'es' ? mapUsdEs : mapUsdEn;
      usdSel.querySelectorAll('option').forEach(function (o) {
        if (um[o.value] !== undefined) o.textContent = um[o.value];
      });
    }
  }

  function renderBookChecks() {
    var wrap = document.getElementById('gh-quiero-wrap');
    if (!wrap) return;
    var labelsEs = {
      chatbot_whatsapp: 'Chatbot / WhatsApp IA',
      crm_kommo: 'CRM Kommo',
      agentes_omnicanal: 'Agentes omnicanal',
      web_seo: 'Web + SEO + blog IA',
      pauta_publicidad: 'Pauta / publicidad',
      automatizacion_total: 'Automatización total',
      varios_definir: 'Varios / lo definimos en la llamada'
    };
    var labelsEn = {
      chatbot_whatsapp: 'Chatbot / WhatsApp AI',
      crm_kommo: 'Kommo CRM',
      agentes_omnicanal: 'Omnichannel agents',
      web_seo: 'Web + SEO + AI blog',
      pauta_publicidad: 'Paid media / ads',
      automatizacion_total: 'Full automation',
      varios_definir: 'Several / we define on the call'
    };
    var L = state.lang === 'es' ? labelsEs : labelsEn;
    wrap.querySelectorAll('label').forEach(function (lab) {
      var inp = lab.querySelector('input[type="checkbox"]');
      if (!inp) return;
      var v = inp.value;
      var text = L[v] || '';
      lab.innerHTML = '';
      lab.appendChild(inp);
      lab.appendChild(document.createTextNode(' ' + text));
    });
  }

  function refreshCalendarCopy() {
    var BOOKING_URL = 'https://calendar.app.google/Ay2yA84WLXLZhPJN9';
    var title = document.querySelector('.book-cal-head-title');
    var sub = document.querySelector('.book-cal-head-sub');
    if (title) title.textContent = t('cal.title');
    if (sub) sub.textContent = t('cal.sub');
    document.querySelectorAll('.book-cal-fallback').forEach(function (fb) {
      fb.innerHTML =
        t('cal.fallback') +
        '<br><a href="' +
        BOOKING_URL +
        '" target="_blank" rel="noopener" class="btn btn-p btn-sm">' +
        t('cal.btn') +
        '</a>';
    });
  }

  function renderBookDirect() {
    var el = document.getElementById('gh-book-direct');
    if (!el) return;
    var url = 'https://calendar.app.google/Ay2yA84WLXLZhPJN9';
    if (state.lang === 'es') {
      el.innerHTML =
        '¿Ya pasaste este filtro? <a href="' +
        url +
        '" target="_blank" rel="noopener" style="color:var(--p);font-weight:600">Abrir agenda Google directo</a>';
    } else {
      el.innerHTML =
        'Already passed this step? <a href="' +
        url +
        '" target="_blank" rel="noopener" style="color:var(--p);font-weight:600">Open Google Calendar directly</a>';
    }
  }

  function renderAll() {
    applyMeta();
    applyDataI18n();
    applyCurrencyBadge();
    applyHeaderLinks();
    renderEmbudoLine();
    renderEmbudoSub();
    renderStrip1();
    renderBookLead();
    renderPricingSub();
    setPlanPrice(document.getElementById('gh-price-starter'), PRICES.starter);
    setPlanPrice(document.getElementById('gh-price-business'), PRICES.business);
    setPlanPrice(document.getElementById('gh-price-enterprise'), PRICES.enterprise);
    updatePlanWaLinks();
    renderReject();
    renderBookSelectOptions();
    renderBookChecks();
    renderBookDirect();
    refreshCalendarCopy();

    document.querySelectorAll('.hdr-lang-btn').forEach(function (btn) {
      var isActive = btn.getAttribute('data-gh-lang') === state.lang;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    window.dispatchEvent(new CustomEvent('gh-localechange', { detail: { lang: state.lang, currency: state.currency } }));

    window.__ghLocaleState = state;
    window.__ghT = t;
    window.__ghLocaleErr = function (key) {
      var pack = ERR[state.lang] || ERR.es;
      return pack[key] || ERR.es[key] || '';
    };
  }

  function setLang(lang) {
    if (lang !== 'es' && lang !== 'en') return;
    state.lang = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {}
    renderAll();
  }

  async function detectCurrency() {
    try {
      var ctrl = new AbortController();
      var id = setTimeout(function () {
        try {
          ctrl.abort();
        } catch (e) {}
      }, 4500);
      var r = await fetch('https://ipapi.co/json/', { signal: ctrl.signal, headers: { Accept: 'application/json' } });
      clearTimeout(id);
      var j = await r.json();
      return j && j.country_code === 'MX' ? 'MXN' : 'USD';
    } catch (e) {
      return 'MXN';
    }
  }

  function init() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'es' || saved === 'en') state.lang = saved;
    } catch (e) {}

    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.hdr-lang-btn');
      if (!btn) return;
      var lang = btn.getAttribute('data-gh-lang');
      if (lang) setLang(lang);
    });

    detectCurrency().then(function (cur) {
      state.currency = cur;
      renderAll();
    });

    renderAll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
