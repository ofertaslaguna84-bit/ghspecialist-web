#!/usr/bin/env node
/**
 * Noticias de IA del día para el blog diario.
 *
 * Junta lo último de las últimas 72 h (Google Noticias en español e inglés,
 * Hacker News y, si existe, data/x-trends.json que deja Hermes con lo que se
 * mueve en X), descarta lo que ya cubrimos y regresa los candidatos ordenados
 * por relevancia. El blog los baja a "qué gana una pyme con esto".
 *
 * Uso directo (prueba): node scripts/gh-blog-news.mjs
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const COVERED_PATH = join(ROOT, 'data', 'news-covered.json');
const X_TRENDS_PATH = join(ROOT, 'data', 'x-trends.json');
const MAX_AGE_H = 72;

// Lo que le importa a GH: modelos, agentes y herramientas que una pyme puede usar ya.
const WEIGHTS = [
  [/\bclaude\b|anthropic/i, 5],
  [/deepseek/i, 5],
  [/\bhermes\b|nous research/i, 4],
  [/\bskills?\b|agent sdk|claude code|mcp\b/i, 4],
  [/agente?s? de ia|ai agents?|agentic/i, 4],
  [/openai|chatgpt|gpt-\d/i, 3],
  [/gemini|google ai/i, 3],
  [/grok|xai/i, 2],
  [/qwen|llama|mistral/i, 2],
  [/whatsapp|kommo|crm|pymes?|small business|automatiza/i, 3],
  [/seo|geo\b|b[uú]squeda|search/i, 2],
  [/lanza|launch|release|nuevo modelo|new model|presenta|anuncia|announces/i, 2],
];

const GOOGLE_QUERIES = [
  ['Claude Anthropic', 'es-419', 'MX'],
  ['DeepSeek', 'es-419', 'MX'],
  ['agentes de inteligencia artificial empresas', 'es-419', 'MX'],
  ['OpenAI ChatGPT nuevo', 'es-419', 'MX'],
  ['Anthropic Claude launch', 'en-US', 'US'],
  ['DeepSeek model release', 'en-US', 'US'],
  ['Nous Research Hermes', 'en-US', 'US'],
  ['AI agents small business', 'en-US', 'US'],
];

function decode(s = '') {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tag(xml, name) {
  const m = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'i'));
  return m ? decode(m[1]) : '';
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (GH Specialist blog bot)' },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

async function googleNews([q, hl, gl]) {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(q + ' when:3d')}&hl=${hl}&gl=${gl}&ceid=${gl}:${hl.split('-')[0]}`;
  const xml = await fetchText(url);
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 10).map(([, it]) => ({
    title: tag(it, 'title').replace(/\s+-\s+[^-]+$/, ''),
    source: tag(it, 'source') || 'Google Noticias',
    link: tag(it, 'link'),
    date: new Date(tag(it, 'pubDate')).toISOString(),
    summary: tag(it, 'description').slice(0, 400),
    origin: 'google-news',
  }));
}

async function hackerNews() {
  const since = Math.floor(Date.now() / 1000) - MAX_AGE_H * 3600;
  const url = `https://hn.algolia.com/api/v1/search?tags=story&numericFilters=created_at_i>${since},points>80&query=AI&hitsPerPage=30`;
  const data = JSON.parse(await fetchText(url));
  return (data.hits || []).map((h) => ({
    title: h.title,
    source: 'Hacker News',
    link: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
    date: new Date(h.created_at_i * 1000).toISOString(),
    summary: `${h.points} puntos, ${h.num_comments} comentarios en Hacker News`,
    origin: 'hn',
    boost: Math.min(4, Math.floor(h.points / 150)),
  }));
}

async function xTrends() {
  try {
    const data = JSON.parse(await readFile(X_TRENDS_PATH, 'utf8'));
    return (data.items || []).map((i) => ({ ...i, origin: 'x', boost: 3 }));
  } catch {
    return [];
  }
}

function keyOf(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .slice(0, 8)
    .sort()
    .join(' ');
}

function similar(a, b) {
  const A = new Set(a.split(' ')), B = new Set(b.split(' '));
  const inter = [...A].filter((w) => B.has(w)).length;
  return inter / Math.max(1, Math.min(A.size, B.size)) >= 0.5;
}

export async function loadCovered() {
  try {
    return JSON.parse(await readFile(COVERED_PATH, 'utf8'));
  } catch {
    return { items: [] };
  }
}

export async function markCovered(item, slug) {
  const covered = await loadCovered();
  covered.items.unshift({ key: keyOf(item.title), title: item.title, link: item.link, slug, at: new Date().toISOString() });
  covered.items = covered.items.slice(0, 400);
  await writeFile(COVERED_PATH, JSON.stringify(covered, null, 2) + '\n', 'utf8');
}

function score(item) {
  const text = `${item.title} ${item.summary}`;
  let s = item.boost || 0;
  for (const [re, w] of WEIGHTS) if (re.test(text)) s += w;
  const ageH = (Date.now() - new Date(item.date).getTime()) / 3600000;
  s += Math.max(0, 3 - ageH / 24); // más fresco, más arriba
  return s;
}

/** Candidatos de hoy, ya sin repetidos ni cubiertos, del más fuerte al más débil. */
export async function getNewsCandidates() {
  const jobs = [...GOOGLE_QUERIES.map(googleNews), hackerNews(), xTrends()];
  const results = await Promise.allSettled(jobs);
  const all = [];
  for (const r of results) {
    if (r.status === 'fulfilled') all.push(...r.value);
    else console.warn(`⚠ fuente de noticias falló: ${String(r.reason).slice(0, 120)}`);
  }
  const covered = (await loadCovered()).items.map((i) => i.key);
  const seen = [];
  const fresh = all.filter((i) => {
    if (!i.title || !i.date || Number.isNaN(new Date(i.date).getTime())) return false;
    if ((Date.now() - new Date(i.date).getTime()) / 3600000 > MAX_AGE_H) return false;
    const k = keyOf(i.title);
    if (!k || covered.some((c) => similar(c, k)) || seen.some((c) => similar(c, k))) return false;
    seen.push(k);
    return true;
  });
  return fresh
    .map((i) => ({ ...i, score: score(i) }))
    .filter((i) => i.score >= 6)
    .sort((a, b) => b.score - a.score);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const list = await getNewsCandidates();
  for (const i of list.slice(0, 10)) console.log(`${i.score.toFixed(1)} | ${i.origin} | ${i.date.slice(0, 10)} | ${i.title}`);
  console.log(`\n${list.length} candidatos`);
}
