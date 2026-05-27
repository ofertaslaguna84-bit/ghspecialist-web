/**
 * Google Suggest México (hl=es, gl=mx) para ampliar temas cuando la lista fija no encaja.
 */

const SKIP_GEO =
  /colombia|chile|argentina|españa|puerto rico|perú|paraguay|guatemala|venezuela|ecuador|buenos aires|rosario|albacete|alicante|canarias|coruña|granada|sevilla|valencia/;

const SKIP_NOISE =
  /pelicula|juego|famosos|receta|noticias|github|n8n\b|gratis\b|curso |portones|calculadora|festival|maestria|ingenieria en|tec monterrey|toluca vs|america vs|empresas ia chinas|empresas ia para invertir|cotizan en bolsa|tesis|pdf\b|libro\b|claro|movistar|tigo|trabajo|personal\b|web\b descargar|download|login|logo|partner|pricing|iniciar sesión|iniciar sesion/;

const NICHE =
  /whatsapp|chatbot|kommo|crm|automatiz|inteligencia|google|seo|agente|embudo|pyme|negocio|negocios|\bia\b|ventas|cliente|business api|asistente|transformacion|digitaliz|posicionar|growth|hacking|video|contenido|marketing|youtube|tiktok|instagram|competencia|analisis|estrategia|conversion|funnel|redes sociales|email marketing|copywriting|publicidad|digital\b/;

/** Texto del usuario relacionado con servicios GH (permite publicar sin estar en catálogo). */
export function isGhBlogUserIntent(input) {
  const n = normalize(input);
  if (n.length < 8) return false;
  return NICHE.test(n);
}

/** @param {string} q */
export async function fetchGoogleSuggestMx(q) {
  const query = String(q || '').trim();
  if (!query) return [];
  const url =
    'https://suggestqueries.google.com/complete/search?' +
    new URLSearchParams({ client: 'firefox', q: query, hl: 'es', gl: 'mx' });
  const res = await fetch(url);
  const text = Buffer.from(await res.arrayBuffer()).toString('latin1');
  const data = JSON.parse(text);
  return (data[1] || []).map((s) => String(s).toLowerCase().trim()).filter(Boolean);
}

/** @param {string} phrase */
export function isGhBlogNichePhrase(phrase) {
  const low = phrase.toLowerCase().trim();
  if (low.length < 10 || low.length > 120) return false;
  if (SKIP_GEO.test(low) || SKIP_NOISE.test(low)) return false;
  return NICHE.test(low);
}

/** @param {string} phrase */
export function inferBlogCategory(phrase) {
  const n = phrase.toLowerCase();
  if (/chatbot|bot whatsapp|asistente virtual/.test(n)) return 'Chatbots';
  if (/whatsapp|wsp|business api|embudo/.test(n)) return 'WhatsApp';
  if (/kommo|\bcrm\b/.test(n)) return 'CRM';
  if (/seo|posicionar|google maps|ranking|contenido con ia|crear contenido/.test(n)) return 'SEO';
  if (/growth|hacking/.test(n)) return 'Consejos';
  if (/video|videos|youtube|tiktok/.test(n)) return 'IA';
  if (/automatiz|respuestas automaticas|respuestas automáticas/.test(n)) return 'Automatización';
  if (/inteligencia|agente|\bia\b|transformacion|digitaliz|agencia/.test(n)) return 'IA';
  return 'Consejos';
}

function normalize(s) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(s) {
  return normalize(s).split(' ').filter((w) => w.length > 2 || w === 'ia' || w === 'seo' || w === 'crm');
}

/**
 * Elige la sugerencia de Google más alineada con lo que escribió el usuario.
 * @param {string} userInput
 * @param {string[]} suggestions
 */
export function pickBestSuggestPhrase(userInput, suggestions) {
  const inputNorm = normalize(userInput);
  const inputTokens = tokenize(userInput);
  let best = '';
  let bestScore = -1;

  for (const raw of suggestions) {
    if (!isGhBlogNichePhrase(raw)) continue;
    const phrase = normalize(raw);
    let score = 0;
    for (const tok of inputTokens) {
      if (phrase.includes(tok)) score += 3;
    }
    if (phrase.includes(inputNorm.slice(0, Math.min(20, inputNorm.length)))) score += 5;
    if (inputNorm.includes(phrase.slice(0, 12))) score += 4;
    if (/\bmexico\b|\btorreon\b|\bmonterrey\b|\bcdmx\b|\bnegocio\b|\bempresa\b|\bpyme/.test(phrase)) {
      score += 2;
    }
    if (score > bestScore) {
      bestScore = score;
      best = phrase;
    }
  }
  if (best) return best;
  for (const raw of suggestions) {
    if (!isGhBlogNichePhrase(raw)) continue;
    const phrase = normalize(raw);
    if (inputTokens.some((tok) => phrase.includes(tok))) return phrase;
  }
  return '';
}

/** @param {string} userInput */
export async function suggestPhrasesForUserInput(userInput) {
  const trimmed = userInput.trim();
  if (!trimmed) return [];
  const primary = await fetchGoogleSuggestMx(trimmed);
  const merged = new Set(primary.filter(isGhBlogNichePhrase));
  const firstWords = trimmed.split(/\s+/).slice(0, 4).join(' ');
  if (firstWords.length >= 8 && firstWords !== trimmed) {
    const extra = await fetchGoogleSuggestMx(firstWords);
    for (const s of extra) {
      if (isGhBlogNichePhrase(s)) merged.add(s.toLowerCase());
    }
  }
  return [...merged];
}
