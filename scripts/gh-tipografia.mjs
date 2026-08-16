/**
 * Tipografia de titulares: como se escriben los titles, h1 y descriptions.
 *
 * Vive aparte porque lo usan dos lados y tienen que coincidir: el generador
 * (para los articulos nuevos) y el script de arreglo (para los ya publicados).
 * Si se separan, los nuevos vuelven a salir con los errores viejos.
 */

/** Se muestran ~60 caracteres del title en Google antes de cortarlo. */
export const MAX_TITLE = 60;
/** Y ~160 de la description. */
export const MAX_DESC = 155;

const MESES =
  'enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre';

/** Nombres propios y siglas que la IA suele escribir mal. */
const REEMPLAZOS = [
  [/\bSeo\b/g, 'SEO'],
  [/\bseo\b/g, 'SEO'],
  [/\bCdmx\b/gi, 'CDMX'],
  [/\bIa\b/g, 'IA'],
  [/\bWhats\s*app\b/gi, 'WhatsApp'],
  [/\bWhatsapp\b/g, 'WhatsApp'],
  [/\bwhatsapp\b/g, 'WhatsApp'],
  [/\bMexico\b/g, 'México'],
  [/\bmexico\b/g, 'México'],
  [/\bPymes\b/g, 'PyMEs'],
  [/\bpymes\b/g, 'PyMEs'],
  [/\bCrm\b/g, 'CRM'],
  [/\bTorreon\b/g, 'Torreón'],
  [/\btorreon\b/g, 'Torreón'],
  [/\bGomez Palacio\b/gi, 'Gómez Palacio'],
  [/\bMerida\b/g, 'Mérida'],
  [/\bLeon\b/g, 'León'],
];

/** Palabras que la IA escribe sin acento una y otra vez. */
const ACENTOS = [
  [/\bcapacitacion\b/gi, 'capacitación'],
  [/\bconstruccion\b/gi, 'construcción'],
  [/\bautomatizacion\b/gi, 'automatización'],
  [/\bautomatica\b/gi, 'automática'],
  [/\bautomaticas\b/gi, 'automáticas'],
  [/\bautomaticos\b/gi, 'automáticos'],
  [/\batencion\b/gi, 'atención'],
  [/\bgestion\b/gi, 'gestión'],
  [/\bproduccion\b/gi, 'producción'],
  [/\badministracion\b/gi, 'administración'],
  [/\bcomunicacion\b/gi, 'comunicación'],
  [/\bintegracion\b/gi, 'integración'],
  [/\bgeneracion\b/gi, 'generación'],
  [/\boptimizacion\b/gi, 'optimización'],
  [/\bfacturacion\b/gi, 'facturación'],
  [/\blogistica\b/gi, 'logística'],
  // Estas cuatro se agregaron porque salen de verdad en los titles del blog,
  // no por adivinar: medicos(1), clinica(1), pagina(2), paginas(1).
  [/\bmedicos\b/gi, 'médicos'],
  [/\bmedico\b/gi, 'médico'],
  [/\bclinicas\b/gi, 'clínicas'],
  [/\bclinica\b/gi, 'clínica'],
  [/\bpaginas\b/gi, 'páginas'],
  [/\bpagina\b/gi, 'página'],
  [/\bnegocios? mas\b/gi, (m) => m.replace(/mas/i, 'más')],
];

/** Respeta la mayuscula inicial al meter el acento. */
function conAcentos(texto) {
  let t = texto;
  for (const [re, rep] of ACENTOS) {
    t = t.replace(re, (match) => {
      const nuevo = typeof rep === 'function' ? rep(match) : rep;
      return match[0] === match[0].toUpperCase()
        ? nuevo[0].toUpperCase() + nuevo.slice(1)
        : nuevo;
    });
  }
  return t;
}

/** Siglas, nombres propios y acentos. No toca la estructura. */
export function normalizarTexto(texto) {
  if (!texto) return texto;
  let t = String(texto);
  for (const [re, rep] of REEMPLAZOS) t = t.replace(re, rep);
  t = conAcentos(t);
  return t.replace(/\s+/g, ' ').trim();
}

/**
 * El tema, sin la coletilla de fecha ni la marca.
 * "Seo con IA cdmx | guía agosto 2026 | GH Specialist" -> "SEO con IA CDMX"
 */
export function soloTema(title) {
  let t = normalizarTexto(title);
  t = t.replace(/\s*\|\s*GH Specialist\s*$/i, '');
  t = t.replace(new RegExp(`\\s*\\|\\s*(gu[ií]a\\s+)?(${MESES})\\s+\\d{4}\\s*$`, 'i'), '');
  // Tambien "| Guía 2026", sin mes: las paginas escritas a mano lo usan asi.
  t = t.replace(/\s*\|\s*gu[ií]a\s+\d{4}\s*$/i, '');
  t = t.replace(/\s*\|\s*\d{4}\s*$/, '');
  t = t.replace(/\s*\|\s*gu[ií]a\s*$/i, '');
  return t.replace(/\s*\|\s*$/, '').trim();
}

/**
 * Title para Google: tema + fecha, sin la marca.
 *
 * La marca se quita a proposito: " | GH Specialist" se come 16 de los ~60
 * caracteres visibles y no ayuda a que le den clic a un articulo de blog.
 * Si aun asi no cabe la fecha, se deja solo el tema.
 */
export function armarTitle(title, mesAnio) {
  const tema = soloTema(title);
  const fecha = mesAnio || sacarMesAnio(title);
  if (fecha) {
    const conFecha = `${tema} | ${fecha}`;
    if (conFecha.length <= MAX_TITLE) return conFecha;
  }
  if (tema.length <= MAX_TITLE) return tema;
  // Si el tema trae subtitulo ("Titulo | La forma mas eficiente"), cortar en
  // el pipe da un title entero y legible.
  const antesDelPipe = tema.split('|')[0].trim();
  if (antesDelPipe && antesDelPipe.length <= MAX_TITLE) return antesDelPipe;
  // Sin punto de corte natural se devuelve completo, a proposito. Truncarlo
  // con "…" no gana nada: Google ya recorta lo que muestra, pero usa el title
  // entero para entender de que va la pagina. Cortarlo aqui solo le quita
  // informacion y deja un titulo mocho. Estos hay que reescribirlos a mano.
  return tema;
}

/**
 * H1 para la persona: el tema, sin fecha.
 * Si queda un subtitulo real, se separa con raya en vez de pipe -- el pipe es
 * de titulares de buscador, no de algo que alguien vaya a leer.
 */
export function armarH1(title) {
  return soloTema(title)
    .replace(/\s*\|\s*/g, ' — ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function sacarMesAnio(texto) {
  const m = String(texto || '').match(new RegExp(`(${MESES})\\s+(\\d{4})`, 'i'));
  if (!m) return '';
  return `${m[1][0].toUpperCase()}${m[1].slice(1).toLowerCase()} ${m[2]}`;
}

/** Description dentro de lo que Google muestra, cortada en palabra entera. */
export function armarDescription(desc) {
  const d = normalizarTexto(desc);
  if (d.length <= MAX_DESC) return d;
  const cortada = d.slice(0, MAX_DESC).replace(/[\s,;:]+\S*$/, '').trim();
  return cortada.replace(/[.,;:]$/, '') + '…';
}
