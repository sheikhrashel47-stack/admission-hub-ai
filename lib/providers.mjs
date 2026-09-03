#!/usr/bin/env node
/**
 * ADMISSION HUB AI — Model Router & Providers
 * - Model names আসে config থেকে (hard-code কোথাও নেই)
 * - AUTO mode: task/mode অনুযায়ী সেরা model বাছাই
 * - Fail হলে automatic fallback chain
 * - Zero dependency (Node 18+), keys শুধু env থেকে (server-side)
 */

export const FREEMODELS = [
  // groq — দ্রুততম সাধারণ চ্যাট + কোড (প্রথম পছন্দ)
  { pid: 'groq', id: 'fast', label: 'Groq · GPT-OSS-120B', model: 'openai/gpt-oss-120b', speed: 5, quality: 4, coding: 5, context: 131072 },
  { pid: 'groq', id: 'lite', label: 'Groq · Qwen 3.8-27B', model: 'qwen/qwen3.8-27b', speed: 5, quality: 3, coding: 4, context: 131072 },
  // cerebras — আল্ট্রা-লো-লেটেন্সি Llama/Qwen (groq-এর সাথে speed-tier)
  { pid: 'cerebras', id: 'cere', label: 'Cerebras · Llama 3.3 70B', model: 'llama-3.3-70b', speed: 5, quality: 4, coding: 4, context: 128000 },
  // sambanova — Llama 3.3 70B (উদার ফ্রি, শক্ত general/code ব্যাকআপ)
  { pid: 'sambanova', id: 'snova', label: 'SambaNova · Llama 3.3 70B', model: 'Meta-Llama-3.3-70B-Instruct', speed: 3, quality: 4, coding: 4, context: 131072 },
  // gemini — vision/ছবি/PDF + লং-কনটেক্সট (multimodal-এ বাধ্যতামূলক)
  { pid: 'gemini', id: 'flash', label: 'Gemini · 3.1 Flash-Lite', model: 'gemini-3.1-flash-lite', speed: 4, quality: 3, coding: 3, context: 1048576 },
  // mistral — সাধারণ ব্যাকআপ
  { pid: 'mistral', id: 'm2', label: 'Mistral · Small 3.1', model: 'mistral-small-latest', speed: 4, quality: 3, coding: 3, context: 131072 },
  // deepinfra — DeepSeek: reasoning + code ফলব্যাক
  { pid: 'deepinfra', id: 'di', label: 'DeepInfra · DeepSeek-V3', model: 'deepseek-ai/DeepSeek-V3', speed: 3, quality: 4, coding: 5, context: 64000 },
  // together — specialty/code (ফ্রি ক্রেডিট ছোট → মাঝ-ফলব্যাক)
  { pid: 'together', id: 'tg', label: 'Together · Llama 3.3 70B Turbo', model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free', speed: 3, quality: 4, coding: 4, context: 131072 },
  // openrouter — openrouter/free অটো-রাউটার (ফ্রি মডেল catch-all)
  { pid: 'openrouter', id: 'or', label: 'OpenRouter · Free Router', model: 'openrouter/free', speed: 3, quality: 4, coding: 4, context: 131072 },
  // huggingface — সবার শেষ universal ফলব্যাক (রেট-লিমিট ফ্রি)
  { pid: 'huggingface', id: 'hf', label: 'Hugging Face · Qwen2.5 72B', model: 'Qwen/Qwen2.5-72B-Instruct', speed: 2, quality: 3, coding: 3, context: 32768 },
];

const PROVIDERS = {
  groq: { label: 'Groq', base: 'https://api.groq.com/openai/v1', keyEnv: 'GROQ_API_KEY' },
  gemini: { label: 'Gemini', keyEnv: 'GEMINI_API_KEY' },
  cerebras: { label: 'Cerebras', base: 'https://api.cerebras.ai/v1', keyEnv: 'CEREBRAS_API_KEY' },
  sambanova: { label: 'SambaNova', base: 'https://api.sambanova.ai/v1', keyEnv: 'SAMBANOVA_API_KEY' },
  deepinfra: { label: 'DeepInfra', base: 'https://api.deepinfra.com/v1/openai', keyEnv: 'DEEPINFRA_API_KEY' },
  together: { label: 'Together', base: 'https://api.together.xyz/v1', keyEnv: 'TOGETHER_API_KEY' },
  openrouter: { label: 'OpenRouter', base: 'https://openrouter.ai/api/v1', keyEnv: 'OPENROUTER_API_KEY' },
  huggingface: { label: 'Hugging Face', base: 'https://router.huggingface.co/v1', keyEnv: 'HUGGINGFACE_API_KEY' },
  mistral: { label: 'Mistral', base: 'https://api.mistral.ai/v1', keyEnv: 'MISTRAL_API_KEY' },
};

// টেক্সট চ্যাটের ফিক্সড fallback ক্রম (প্রথমটা সেরা/দ্রুততম; যার key আছে সেভাবে এগোয়)
export const FALLBACK_ORDER = ['groq', 'cerebras', 'sambanova', 'gemini', 'mistral', 'deepinfra', 'together', 'openrouter', 'huggingface'];

// ---- Task classification (সহজ keyword-based, real router) ----
const TASK_RULES = [
  { type: 'code', words: ['code', 'bug', 'fix', 'function', 'script', 'react', 'node', 'api', 'component', 'debug', 'সোর্স', 'কোড'] },
  { type: 'research', words: ['research', 'research', 'তথ্য', 'খোঁজ', 'report', 'analysis', 'quote', 'বর্তমান', 'news'] },
];

export function classifyTask(text, mode = 'balanced') {
  const t = (text || '').toLowerCase();
  let type = 'general';
  for (const r of TASK_RULES) if (r.words.some((w) => t.includes(w))) { type = r.type; break; }
  const need = mode === 'deep' ? 4 : mode === 'fast' ? 0 : 2;
  return { type, minSpeed: need };
}

// ---- AUTO: available keys অনুযায়ী সবচেয়ে ভালো ম্যাচিং chain ----
// multimodal = ছবি বা PDF (data URL inline_data) — শুধু Gemini এগুলো পার্স করে
const DATAURL = /^data:([\w.+-]+\/[\w.+-]+);base64,(.+)$/i;
function chainHasImage(messages) {
  return (messages || []).some((m) => Array.isArray(m.content) && m.content.some((p) => p && p.type === 'image_url'));
}
function rank(pid, task) {
  let i = FALLBACK_ORDER.indexOf(pid);
  if (i < 0) i = FALLBACK_ORDER.length;
  // কোড টাস্কে reasoning/code-স্পেশালিস্ট (DeepInfra DeepSeek) উপরে তোলা
  if (task && task.type === 'code' && pid === 'deepinfra') i = 2;
  return i;
}

export function pickChain({ model, mode, task, images }) {
  let list;
  if (model && model !== 'auto') {
    const exact = FREEMODELS.find((m) => m.id === model);
    list = exact ? [exact] : [];
  } else {
    list = [...FREEMODELS].sort((a, b) => rank(a.pid, task) - rank(b.pid, task));
  }
  // ছবি/PDF থাকলে শুধু vision-capable (Gemini) — text-only মডেল অন্ধ উত্তর দেবে না
  if (images) return FREEMODELS.filter((m) => m.pid === 'gemini').slice(0, 1);
  // শুধু যে provider-এর key আছে সেটাই রাখি + fallback chain বানাই (FALLBACK_ORDER অনুযায়ী)
  const chain = [];
  for (const m of list) {
    const p = PROVIDERS[m.pid];
    if (p && process.env[p.keyEnv]) chain.push(m);
    if (chain.length >= 9) break;
  }
  if (!chain.length) throw new Error('কোনো AI provider key পাওয়া যায়নি (.env.local চেক করো)');
  return chain;
}

export function providerInfo(pid) { return PROVIDERS[pid] || {}; }

// ---- Streaming implementations ----
function sseLines(readable) {
  const reader = readable.getReader();
  const decoder = new TextDecoder();
  let buf = '';
  return (async function* () {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      let i;
      while ((i = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, i).trim();
        buf = buf.slice(i + 1);
        if (!line.startsWith('data:')) continue;
        const payload = line.slice(5).trim();
        if (payload === '[DONE]') return;
        try {
          const j = JSON.parse(payload);
          const d = j.choices?.[0]?.delta || {};
          if (d.content) yield d.content;
        } catch {}
      }
    }
  })();
}

// Groq/OpenAI-compatible providers strict JSON schema মেনে চলে — শুধু role/content পাঠাই
function cleanMsgs(messages) {
  return (messages || [])
    .filter((m) => m && (typeof m.content === 'string' || Array.isArray(m.content)) && (m.role === 'user' || m.role === 'assistant' || m.role === 'system'))
    .map((m) => Array.isArray(m.content)
      ? { role: m.role, content: m.content.filter((p) => p && (p.type === 'text' || p.type === 'image_url')) }
      : { role: m.role, content: m.content });
}

async function* openaiStream(base, key, model, messages, signal) {
  const r = await fetch(`${base}/chat/completions`, {
    method: 'POST', signal,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model, messages: cleanMsgs(messages), stream: true, temperature: 0.6, max_tokens: 2048 }),
  });
  if (!r.ok || !r.body) throw new Error(`HTTP ${r.status}`);
  yield* sseLines(r.body);
}

async function* geminiStream(key, model, messages, signal) {
  const contents = cleanMsgs(messages)
    .filter((m) => m.role !== 'system')
    .map((m) => {
      const parts = Array.isArray(m.content)
        ? m.content.map((p) => p.type === 'image_url'
            ? (() => { const mm = DATAURL.exec(p.image_url?.url || ''); return mm ? { inline_data: { mime_type: mm[1], data: mm[2] } } : null; })()
            : { text: p.text || '' })
        : [{ text: m.content }];
      return { role: m.role === 'assistant' ? 'model' : 'user', parts: parts.filter(Boolean) };
    });
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${key}`;
  const r = await fetch(url, { method: 'POST', signal, headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents, generationConfig: { maxOutputTokens: 2048, temperature: 0.6 } }) });
  if (!r.ok || !r.body) throw new Error(`HTTP ${r.status}`);
  const reader = r.body.getReader();
  const decoder = new TextDecoder();
  let buf = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    let i;
    while ((i = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, i).trim();
      buf = buf.slice(i + 1);
      if (!line.startsWith('data:')) continue;
      try {
        const j = JSON.parse(line.slice(5).trim());
        const text = (j.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('');
        if (text) yield text;
      } catch {}
    }
  }
}

// ---- Main: stream with chain ----
export async function* streamAnswer(messages, { model, mode, onAttempt, signal, images } = {}) {
  const task = classifyTask(typeof messages[messages.length - 1]?.content === 'string' ? messages[messages.length - 1]?.content : '', mode);
  const chain = pickChain({ model, mode, task, images: images || chainHasImage(messages) });
  const errors = [];
  for (const m of chain) {
    const p = providerInfo(m.pid);
    const ac = new AbortController();
    const onAbort = () => ac.abort();
    if (signal) { if (signal.aborted) ac.abort(); else signal.addEventListener('abort', onAbort); }
    try {
      onAttempt?.({ provider: p.label, model: m.model, label: m.label });
      let got = false;
      const it = m.pid === 'gemini'
        ? geminiStream(process.env[p.keyEnv], m.model, messages, ac.signal)
        : openaiStream(p.base, process.env[p.keyEnv], m.model, messages, ac.signal);
      for await (const tok of it) { got = true; yield tok; }
      if (!got) throw new Error('খালি উত্তর');
      return { provider: p.label, model: m.model };
    } catch (e) {
      errors.push(`${p.label} → ${e.message}`);
      console.error('[agent-debug]', p.label, '→', e.message);
      if (ac.signal.aborted) throw e;
    } finally { signal?.removeEventListener('abort', onAbort); }
  }
  throw new Error('সব AI provider ব্যর্থ হয়ে গেছে। একটু পরে আবার চেষ্টা করো।');
}

// ---- Tavily real web search ----
export async function searchWeb(query, max = 5) {
  if (!process.env.TAVILY_API_KEY) throw new Error('TAVILY_API_KEY নেই — Web search বন্ধ');
  const r = await fetch('https://api.tavily.com/search', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: process.env.TAVILY_API_KEY, query, max_results: max, include_answer: false }),
  });
  if (!r.ok) throw new Error('ওয়েব সার্চ ব্যর্থ (HTTP ' + r.status + ')');
  const j = await r.json();
  return (j.results || []).slice(0, max).map((x, i) => ({
    n: i + 1, title: x.title || ('সোর্স ' + (i + 1)), url: x.url, content: (x.content || '').slice(0, 1500),
  }));
}

// ================= Phase 2: chat summarization (context compaction) =================
const SUM_SYS = `তুমি একটি চ্যাট-সংক্ষেপক। নিচের কথোপকথনের গুরুত্বপূর্ণ তথ্য, সিদ্ধান্ত, ব্যবহারকারীর পছন্দ, নাম/সংখ্যা ও উল্লেখযোগ্য বিষয়গুলো বাংলায় সংক্ষিপ্ত বুলেটে নোট করো (সর্বোচ্চ ~৪০০ শব্দ)। শুধু সারাংশ লিখো — কোনো ভূমিকা, শিরোনাম বা মন্তব্য নয়।`;

export async function summarizeChat(lines, prev) {
  const inp = (prev ? 'পুরোনো সারাংশ:\n' + prev + '\n\n' : '') + lines.join('\n');
  if (!inp.trim()) return null;
  const finalMsgs = [
    { role: 'system', content: SUM_SYS },
    { role: 'user', content: inp.slice(0, 30000) },
  ];
  // flash (সবচেয়ে সস্তা/দ্রুত) → fast → m2 — যেটা আছে
  for (const mid of ['flash', 'fast', 'm2']) {
    const ac = new AbortController();
    let out = '';
    try {
      for await (const tok of streamAnswer(finalMsgs, { model: mid, mode: 'balanced', signal: ac.signal, onAttempt: () => {} })) {
        out += tok;
        if (out.length > 1500) { ac.abort(); break; }
      }
      out = out.trim();
      if (out) return out.slice(0, 2000);
    } catch (e) { if (ac.signal.aborted && out) return out.slice(0, 2000); /* পরের মডেল চেষ্টা */ }
  }
  throw new Error('সংক্ষেপণ ব্যর্থ — সব মডেল');
}

// ================= Phase 2: provider live health ping =================
const PING_CACHE = new Map();
async function pingOne(pid, key) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), 4000);
  const base = (PROVIDERS[pid] || {}).base || '';
  try {
    let r;
    if (pid === 'gemini') r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}&pageSize=1`, { signal: ac.signal });
    else if (pid === 'openrouter') r = await fetch(`${base}/auth/key`, { headers: { Authorization: `Bearer ${key}` }, signal: ac.signal });
    else r = await fetch(`${base}/models`, { headers: { Authorization: `Bearer ${key}` }, signal: ac.signal });
    return { pid, label: (PROVIDERS[pid] || {}).label || pid, ok: !!r.ok };
  } catch {
    return { pid, label: (PROVIDERS[pid] || {}).label || pid, ok: false };
  } finally { clearTimeout(t); }
}
export async function pingProviderStatus() {
  const out = [];
  const nowT = Date.now();
  const seen = new Set();
  for (const m of FREEMODELS) {
    if (seen.has(m.pid)) continue;
    const p = PROVIDERS[m.pid];
    if (!p || !process.env[p.keyEnv]) continue;
    seen.add(m.pid);
    const cached = PING_CACHE.get(m.pid);
    if (cached && nowT - cached.at < 60000) { out.push(cached.v); continue; }
    const v = await pingOne(m.pid, process.env[p.keyEnv]);
    PING_CACHE.set(m.pid, { at: nowT, v });
    out.push(v);
  }
  return out;
}
