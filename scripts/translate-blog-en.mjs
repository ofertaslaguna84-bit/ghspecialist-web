#!/usr/bin/env node
/**
 * Traduce artículos del blog ES → EN (mismas APIs que blog-generate.mjs).
 * Uso: node scripts/translate-blog-en.mjs [--limit 5] [--slug mi-articulo]
 */
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadAiEnv } from './gh-load-ai-env.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const BLOG = join(ROOT, 'blog');
const OUT = join(ROOT, 'data/blog-i18n');
const SKIP = new Set(['index.html', '_template.html']);

function extractFields(html) {
  const h1 = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1]?.replace(/<[^>]+>/g, '').trim() || '';
  const label = (html.match(/class="art-label"[^>]*>([\s\S]*?)<\//i) || [])[1]?.trim() || '';
  const meta = (html.match(/class="art-meta"[^>]*>([\s\S]*?)<\/div>/i) || [])[1]?.trim() || '';
  const bodyMatch = html.match(/class="gh-article-body"[^>]*>([\s\S]*?)<\/div>\s*\n\s*<div class="cta-art"/i);
  const htmlBody = bodyMatch ? bodyMatch[1].trim() : '';
  const ctaTitle = (html.match(/class="cta-art"[\s\S]*?<h3[^>]*>([\s\S]*?)<\/h3>/i) || [])[1]?.trim() || '';
  const ctaText = (html.match(/class="cta-art"[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/i) || [])[1]?.trim() || '';
  const title = (html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1]?.replace(/\s*\|\s*GH Specialist.*$/i, '').trim() || h1;
  const breadcrumb = (html.match(/<nav class="bc"[\s\S]*?<\/nav>/i) || [])[0] || '';
  const figCaption = (html.match(/class="art-hero"[\s\S]*?<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i) || [])[1]?.trim() || '';
  return { title, h1, label, meta, html: htmlBody, ctaTitle, ctaText, breadcrumb, figCaption };
}

async function callChatCompletions(base, apiKey, model, prompt, label) {
  const res = await fetch(`${base.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 8192,
      temperature: 0.25,
      response_format: { type: 'json_object' },
    }),
  });
  const raw = await res.text();
  if (!res.ok) throw new Error(`${label} ${res.status}: ${raw.slice(0, 200)}`);
  const data = JSON.parse(raw);
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error(`${label} sin contenido`);
  return JSON.parse(text);
}

async function callDeepSeek(prompt, apiKey) {
  const base = (process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1').trim();
  const models = (process.env.DEEPSEEK_MODEL || 'deepseek-chat,deepseek-v4-flash').split(',').map((m) => m.trim()).filter(Boolean);
  let lastErr;
  for (const model of models) {
    try {
      return await callChatCompletions(base, apiKey, model, prompt, `DeepSeek(${model})`);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error('DeepSeek falló');
}

async function callQwen(prompt, apiKey) {
  const base = (process.env.QWEN_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1').trim();
  const models = (process.env.QWEN_MODEL || 'qwen-turbo,qwen-plus').split(',').map((m) => m.trim()).filter(Boolean);
  let lastErr;
  for (const model of models) {
    try {
      return await callChatCompletions(base, apiKey, model, prompt, `Qwen(${model})`);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error('Qwen falló');
}

async function callGemini(prompt, apiKey, model = 'gemini-2.5-flash') {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 8192, temperature: 0.25, responseMimeType: 'application/json' },
    }),
  });
  const raw = await res.text();
  if (!res.ok) throw new Error(`Gemini(${model}) ${res.status}: ${raw.slice(0, 200)}`);
  const data = JSON.parse(raw);
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
  if (!text) throw new Error(`Gemini(${model}) sin contenido`);
  return JSON.parse(text);
}

async function callOpenAI(prompt, apiKey) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 8192,
      temperature: 0.25,
      response_format: { type: 'json_object' },
    }),
  });
  const raw = await res.text();
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${raw.slice(0, 200)}`);
  const data = JSON.parse(raw);
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('OpenAI sin contenido');
  return JSON.parse(text);
}

async function translate(fields) {
  const prompt = `Translate this GH Specialist blog article from Spanish to English for Hispanic businesses in Mexico and the USA.
Keep all HTML tags and href URLs exactly as in the source. Translate visible text and anchor labels only.
Return valid JSON with keys:
title (full page title ending with " | GH Specialist"),
h1, label, meta (HTML string), html (full article body HTML),
ctaTitle, ctaText,
breadcrumb (HTML: <a href="../index.html">Home</a><span>›</span><a href="index.html">Blog</a><span>›</span>Short title),
figCaption, relatedTitle ("Related articles").

Source JSON:
${JSON.stringify(fields)}`;

  const errors = [];
  const deepseek = process.env.DEEPSEEK_API_KEY?.trim();
  const qwen = (process.env.QWEN_API_KEY || process.env.DASHSCOPE_API_KEY)?.trim();
  const gemini = process.env.GEMINI_API_KEY?.trim();
  const openai = process.env.OPENAI_API_KEY?.trim();

  if (deepseek) {
    try {
      console.log('  → DeepSeek…');
      return await callDeepSeek(prompt, deepseek);
    } catch (e) {
      errors.push(e.message);
    }
  }
  if (qwen) {
    try {
      console.log('  → Qwen…');
      return await callQwen(prompt, qwen);
    } catch (e) {
      errors.push(e.message);
    }
  }
  if (gemini) {
    for (const model of ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-3.5-flash']) {
      try {
        console.log(`  → Gemini (${model})…`);
        return await callGemini(prompt, gemini, model);
      } catch (e) {
        errors.push(e.message);
      }
    }
  }
  if (openai) {
    try {
      console.log('  → OpenAI…');
      return await callOpenAI(prompt, openai);
    } catch (e) {
      errors.push(e.message);
    }
  }

  throw new Error(
    errors.length
      ? errors.join(' | ')
      : 'Sin API key — configura en Adestajo .env.local (GEMINI, DEEPSEEK, OPENAI o QWEN)'
  );
}

async function buildManifest() {
  const files = await readdir(OUT);
  const manifest = {};
  for (const f of files) {
    if (!f.endsWith('.en.json') || f.startsWith('_')) continue;
    const slug = f.replace('.en.json', '');
    const data = JSON.parse(await readFile(join(OUT, f), 'utf8'));
    const excerpt = (data.excerpt || data.html || '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 200);
    manifest[slug] = {
      title: data.h1 || data.title?.replace(/\s*\|\s*GH Specialist.*$/i, '') || slug,
      excerpt: excerpt ? excerpt + '…' : '',
      tag: data.label?.replace(/^Blog ·\s*/i, '') || '',
    };
  }
  await writeFile(join(OUT, '_manifest.en.json'), JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`✓ _manifest.en.json (${Object.keys(manifest).length} artículos)`);
}

async function main() {
  await loadAiEnv();

  const args = process.argv.slice(2);
  const limitIdx = args.indexOf('--limit');
  const limit = limitIdx !== -1 ? parseInt(args[limitIdx + 1], 10) : Infinity;
  const slugArg = args.includes('--slug') ? args[args.indexOf('--slug') + 1] : null;
  const force = args.includes('--force');

  const hasKey =
    process.env.DEEPSEEK_API_KEY ||
    process.env.QWEN_API_KEY ||
    process.env.DASHSCOPE_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.OPENAI_API_KEY;
  if (!hasKey) {
    console.error('No hay API key. Revisa /Users/pedro/Projects/adestajo/.env.local');
    process.exit(1);
  }
  console.log('APIs disponibles:', [
    process.env.DEEPSEEK_API_KEY && 'DeepSeek',
    (process.env.QWEN_API_KEY || process.env.DASHSCOPE_API_KEY) && 'Qwen',
    process.env.GEMINI_API_KEY && 'Gemini',
    process.env.OPENAI_API_KEY && 'OpenAI',
  ]
    .filter(Boolean)
    .join(', '));

  await mkdir(OUT, { recursive: true });

  let files = (await readdir(BLOG)).filter((f) => f.endsWith('.html') && !SKIP.has(f));
  if (slugArg) files = files.filter((f) => f.replace('.html', '') === slugArg);

  let done = 0;
  for (const f of files) {
    if (done >= limit) break;
    const slug = f.replace('.html', '');
    const outPath = join(OUT, `${slug}.en.json`);
    if (!force) {
      try {
        await readFile(outPath, 'utf8');
        console.log('· skip', slug);
        continue;
      } catch {
        /* new */
      }
    }

    const html = await readFile(join(BLOG, f), 'utf8');
    const fields = extractFields(html);
    if (!fields.html) {
      console.warn('! sin body', slug);
      continue;
    }

    console.log('→', slug);
    const en = await translate(fields);
    if (!en.title?.includes('GH Specialist')) {
      en.title = (en.title || en.h1 || fields.h1) + ' | GH Specialist';
    }
    en.relatedTitle = en.relatedTitle || 'Related articles';
    await writeFile(outPath, JSON.stringify(en, null, 2), 'utf8');
    console.log('✓', slug);
    done++;
    await new Promise((r) => setTimeout(r, 800));
  }

  await buildManifest();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
