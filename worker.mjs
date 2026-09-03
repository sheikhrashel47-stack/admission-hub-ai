/**
 * ADMISSION HUB AI — Cloudflare Worker backend (free, $0)
 * একই API surface: /api/config /api/chat(SSE) /api/chats* /api/files* /api/memory /api/usage /api/system /api/health
 * Keys → Worker Secrets (server-side)। ডেটা → KV (AH_KV)।
 */
const ACCOUNT = 'abb783e456e51a5d338419de93d5e576';
const SYSTEM = `তুমি "ADMISSION HUB AI" — Admission Hub-এর জন্য বানানো একটি প্রিমিয়াম প্রাইভেট AI Assistant।
ভাষা: সহজ বাংলা (প্রয়োজনে ইংরেজি)। সবসময় সংক্ষিপ্ত, পরিষ্কার, গঠনমূলক উত্তর — দরকার হলে বুলেট/টেবিল/কোড ব্লক।
শুধু সত্য তথ্য দেবে; যা জানো না সেটা সৎভাবে বলবে। সাইটেশন [1] ফরম্যাটে দিলে সেগুলো সোর্স তালিকায় মিলবে।
তুমি এখন chat + research mode-এ চলছ। Agent tools, GitHub, deploy এখনো যুক্ত হয়নি — সেই কাজ চাইলে জানিয়ে দেবে "এখনো যুক্ত হয়নি (Phase 5+)"।

উত্তর-শৈলী (সবসময়): প্রচলিত সহজ বাংলায় সরাসরি উত্তর — অপ্রয়োজনীয় ভূমিকা/ভণিতা নয়; দরকার হলে **বোল্ড** টার্ম, টেবিল, বুলেট; সংখ্যা/তারিখ স্পষ্ট; যা নিশ্চিত নও তা সততার সাথে বলো।
যদি উপযুক্ত হয়, উত্তরের একদম শেষে ২–৩টি ফলো-আপ প্রশ্ন দিতে পারো — ঠিক এই ফরম্যাটে, এর বাইরে আর কিছু নয়:

[SUGGEST]
- প্রশ্ন ১
- প্রশ্ন ২`;

const MODELS = [
  { pid: 'groq', id: 'fast', label: 'Groq · GPT-OSS-120B', model: 'openai/gpt-oss-120b', speed: 5, quality: 4, coding: 5 },
  { pid: 'groq', id: 'lite', label: 'Groq · Qwen 3.8-27B', model: 'qwen/qwen3.8-27b', speed: 5, quality: 3, coding: 4 },
  { pid: 'cerebras', id: 'cere', label: 'Cerebras · Llama 3.3 70B', model: 'llama-3.3-70b', speed: 5, quality: 4, coding: 4 },
  { pid: 'sambanova', id: 'snova', label: 'SambaNova · Llama 3.3 70B', model: 'Meta-Llama-3.3-70B-Instruct', speed: 3, quality: 4, coding: 4 },
  { pid: 'gemini', id: 'flash', label: 'Gemini · 3.1 Flash-Lite', model: 'gemini-3.1-flash-lite', speed: 4, quality: 3, coding: 3 },
  { pid: 'mistral', id: 'm2', label: 'Mistral · Small 3.1', model: 'mistral-small-latest', speed: 4, quality: 3, coding: 3 },
  { pid: 'deepinfra', id: 'di', label: 'DeepInfra · DeepSeek-V3', model: 'deepseek-ai/DeepSeek-V3', speed: 3, quality: 4, coding: 5 },
  { pid: 'together', id: 'tg', label: 'Together · Llama 3.3 70B Turbo', model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free', speed: 3, quality: 4, coding: 4 },
  { pid: 'openrouter', id: 'or', label: 'OpenRouter · Free Router', model: 'openrouter/free', speed: 3, quality: 4, coding: 4 },
  { pid: 'huggingface', id: 'hf', label: 'Hugging Face · Qwen2.5 72B', model: 'Qwen/Qwen2.5-72B-Instruct', speed: 2, quality: 3, coding: 3 },
];
const KEYMAP = { groq: 'GROQ_API_KEY', gemini: 'GEMINI_API_KEY', cerebras: 'CEREBRAS_API_KEY', sambanova: 'SAMBANOVA_API_KEY', deepinfra: 'DEEPINFRA_API_KEY', together: 'TOGETHER_API_KEY', mistral: 'MISTRAL_API_KEY', openrouter: 'OPENROUTER_API_KEY', huggingface: 'HUGGINGFACE_API_KEY' };
// টেক্সট চ্যাটের ফিক্সড fallback ক্রম (প্রথমটা সেরা/দ্রুততম)
const FALLBACK_ORDER = ['groq', 'cerebras', 'sambanova', 'gemini', 'mistral', 'deepinfra', 'together', 'openrouter', 'huggingface'];
const TEXT_EXT = ['txt','md','csv','json','html','htm','css','js','mjs','ts','tsx','jsx','xml','yml','yaml','sh','sql','py','env'];
// বাইনারি ফাইল (PDF) — Gemini নিজে পার্স করে; base64 KV-তে, inline_data হিসেবে পাঠাই
const BIN_EXT = ['pdf'];
const BIN_MIME = { pdf: 'application/pdf' };
const MAX_TEXT = 2 * 1024 * 1024;
const MAX_B64 = 10 * 1024 * 1024;
const DATAURL = /^data:([\w.+-]+\/[\w.+-]+);base64,(.+)$/i;

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', ...cors } });
}

function kvJson(key, fallback) { return AH_KV.get(key, 'json').then((v) => v ?? fallback); }
function kvSet(key, val) { return AH_KV.put(key, JSON.stringify(val)); }

function sseLine(str) {
  const enc = new TextEncoder();
  return enc.encode(`data: ${str}\n\n`);
}
function sseStream(onWrite) {
  const stream = new ReadableStream({
    start(controller) { onWrite((ev) => { try { controller.enqueue(sseLine(JSON.stringify(ev))); } catch {} }, () => { try { controller.close(); } catch {} }); },
  });
  return new Response(stream, { headers: { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-cache', ...cors } });
}


function keyOf(pid) {
  try {
    switch (pid) {
      case 'groq': return GROQ_API_KEY;
      case 'gemini': return GEMINI_API_KEY;
      case 'cerebras': return CEREBRAS_API_KEY;
      case 'sambanova': return SAMBANOVA_API_KEY;
      case 'deepinfra': return DEEPINFRA_API_KEY;
      case 'together': return TOGETHER_API_KEY;
      case 'mistral': return MISTRAL_API_KEY;
      case 'openrouter': return OPENROUTER_API_KEY;
      case 'huggingface': return HUGGINGFACE_API_KEY;
    }
  } catch (e) { return undefined; }
  return undefined;
}

function parseBody(req) { return req.json().catch(() => ({})); }

// ================= Phase 2: summarization + suggestions + provider ping =================
const SUM_SYS = `তুমি একটি চ্যাট-সংক্ষেপক। নিচের কথোপকথনের গুরুত্বপূর্ণ তথ্য, সিদ্ধান্ত, ব্যবহারকারীর পছন্দ, নাম/সংখ্যা ও উল্লেখযোগ্য বিষয়গুলো বাংলায় সংক্ষিপ্ত বুলেটে নোট করো (সর্বোচ্চ ~৪০০ শব্দ)। শুধু সারাংশ লিখো — কোনো ভূমিকা, শিরোনাম বা মন্তব্য নয়।`;
async function summarize(lines, prev) {
  const inp = (prev ? 'পুরোনো সারাংশ:\n' + prev + '\n\n' : '') + lines.join('\n');
  if (!inp.trim()) return null;
  const finalMsgs = [{ role: 'system', content: SUM_SYS }, { role: 'user', content: inp.slice(0, 30000) }];
  for (const mid of ['flash', 'fast', 'm2']) {
    const ac = new AbortController();
    let out = '';
    try {
      for await (const tok of streamAnswer(finalMsgs, mid, 'balanced', () => {}, ac.signal)) {
        out += tok;
        if (out.length > 1500) { ac.abort(); break; }
      }
      out = out.trim();
      if (out) return out.slice(0, 2000);
    } catch (e) { if (ac.signal.aborted && out) return out.slice(0, 2000); }
  }
  throw new Error('সংক্ষেপণ ব্যর্থ');
}
async function ensureSummary(c, data) {
  if (!c) return null;
  const msgs = (c.messages || []).filter((m) => m.role !== 'system' && !(m.partial && !m.content));
  if (msgs.length < 48) return c.summary ? c.summary.text : null;
  const needUpTo = msgs.length - 24;
  if (c.summary && c.summary.upTo && c.summary.upTo >= needUpTo - 8) return c.summary.text;
  const from = (c.summary && c.summary.upTo) || 0;
  const lines = msgs.slice(Math.max(0, from), needUpTo).map((m) => (m.role === 'user' ? 'প্রশ্ন: ' : 'উত্তর: ') + (typeof m.content === 'string' ? m.content : ''));
  try {
    const txt = await summarize(lines.slice(-60), c.summary ? c.summary.text : null);
    if (txt) { c.summary = { text: txt, upTo: needUpTo, ts: Date.now() }; await kvSet('chats', data); return txt; }
  } catch {}
  return c.summary ? c.summary.text : null;
}
function parseSuggestions(ans) {
  const m = /(?:\n|^)\[SUGGEST\]\s*\n((?:[-*] .*\n?)+)\s*$/.exec(ans);
  if (!m) return { text: ans, list: null };
  const list = m[1].split('\n').map((x) => x.replace(/^[-*]\s*/, '').trim()).filter(Boolean).slice(0, 3);
  return { text: ans.slice(0, m.index).trimEnd(), list: list.length ? list : null };
}
const PING_BASE = { groq: 'https://api.groq.com/openai/v1', cerebras: 'https://api.cerebras.ai/v1', sambanova: 'https://api.sambanova.ai/v1', deepinfra: 'https://api.deepinfra.com/v1/openai', together: 'https://api.together.xyz/v1', mistral: 'https://api.mistral.ai/v1', openrouter: 'https://openrouter.ai/api/v1', huggingface: 'https://router.huggingface.co/v1' };
async function pingOne(pid) {
  const key = keyOf(pid); const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), 4000);
  const label = (MODELS.find((m) => m.pid === pid) || {}).label || pid;
  try {
    let r;
    if (pid === 'gemini') r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}&pageSize=1`, { signal: ac.signal });
    else if (pid === 'openrouter') r = await fetch(`${PING_BASE[pid]}/auth/key`, { headers: { Authorization: `Bearer ${key}` }, signal: ac.signal });
    else r = await fetch(`${PING_BASE[pid]}/models`, { headers: { Authorization: `Bearer ${key}` }, signal: ac.signal });
    return { pid, label, ok: !!r.ok };
  } catch { return { pid, label, ok: false }; }
  finally { clearTimeout(t); }
}
async function pingProviders() {
  const out = []; const seen = new Set();
  for (const m of MODELS) {
    if (seen.has(m.pid)) continue;
    const key = keyOf(m.pid);
    if (!key) continue;
    seen.add(m.pid);
    out.push(await pingOne(m.pid));
  }
  return out;
}

function pickChain(model, mode, multimodal) {
  // multimodal = ছবি/PDF — শুধু Gemini inline_data পার্স করে
  let list = MODELS;
  if (model && model !== 'auto') {
    const m = MODELS.find((x) => x.id === model);
    list = m ? [m] : [];
  } else {
    list = [...MODELS].sort((a, b) => (FALLBACK_ORDER.indexOf(a.pid) - FALLBACK_ORDER.indexOf(b.pid)));
  }
  if (multimodal) return list.filter((m) => m.pid === 'gemini' && keyOf(m.pid)).slice(0, 1);
  return list.filter((m) => keyOf(m.pid)).slice(0, 9);
}

async function* openaiStream(base, key, model, messages, signal) {
  const r = await fetch(`${base}/chat/completions`, {
    method: 'POST', signal,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model, messages, stream: true, temperature: 0.6, max_tokens: 2048 }),
  });
  if (!r.ok || !r.body) throw new Error('provider HTTP ' + r.status);
  const reader = r.body.getReader(); const dec = new TextDecoder(); let buf = '';
  while (true) {
    const { done, value } = await reader.read(); if (done) break;
    buf += dec.decode(value, { stream: true }); let i;
    while ((i = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
      if (!line.startsWith('data:')) continue;
      const p = line.slice(5).trim(); if (p === '[DONE]') return;
      try { const j = JSON.parse(p); if (j.choices?.[0]?.delta?.content) yield j.choices[0].delta.content; } catch {}
    }
  }
}
async function* geminiStream(key, model, messages, signal) {
  const contents = messages.filter((m) => m.role === 'user' || m.role === 'assistant').map((m) => {
    const parts = Array.isArray(m.content)
      ? m.content.map((p) => (p.type === 'image_url'
          ? (() => { const mm = DATAURL.exec(p.image_url?.url || ''); return mm ? { inline_data: { mime_type: mm[1], data: mm[2] } } : null; })()
          : { text: p.text || '' })).filter(Boolean)
      : [{ text: String(m.content) }];
    return { role: m.role === 'assistant' ? 'model' : 'user', parts };
  });
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${key}`, {
    method: 'POST', signal, headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents, generationConfig: { maxOutputTokens: 2048, temperature: 0.6 } }),
  });
  if (!r.ok || !r.body) throw new Error('gemini HTTP ' + r.status);
  const reader = r.body.getReader(); const dec = new TextDecoder(); let buf = '';
  while (true) {
    const { done, value } = await reader.read(); if (done) break;
    buf += dec.decode(value, { stream: true }); let i;
    while ((i = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
      if (!line.startsWith('data:')) continue;
      try { const j = JSON.parse(line.slice(5).trim()); const t = (j.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join(''); if (t) yield t; } catch {}
    }
  }
}

async function* streamAnswer(messages, model, mode, emit, signal, multimodal) {
  let attempt = null;
  const chain = pickChain(model, mode, multimodal);
  if (!chain.length) throw new Error('কোনো AI provider key নেই — Cloudflare Secrets চেক করো');
  for (const m of chain) {
    const key = keyOf(m.pid);
    const ac = new AbortController();
    const onAbort = () => ac.abort();
    if (signal) { if (signal.aborted) ac.abort(); else signal.addEventListener('abort', onAbort); }
    try {
      emit({ attempt: { provider: m.pid, label: m.label, model: m.model } }); attempt = m;
      let got = false;
      const it = m.pid === 'gemini' ? geminiStream(key, m.model, messages, ac.signal) : openaiStream({ groq: 'https://api.groq.com/openai/v1', cerebras: 'https://api.cerebras.ai/v1', sambanova: 'https://api.sambanova.ai/v1', deepinfra: 'https://api.deepinfra.com/v1/openai', together: 'https://api.together.xyz/v1', mistral: 'https://api.mistral.ai/v1', openrouter: 'https://openrouter.ai/api/v1', huggingface: 'https://router.huggingface.co/v1' }[m.pid], key, m.model, messages, ac.signal);
      for await (const t of it) { got = true; yield t; }
      if (!got) throw new Error('খালি');
      return attempt;
    } catch (e) {
      if (ac.signal.aborted) throw e;
    } finally {
      signal?.removeEventListener('abort', onAbort);
    }
  }
  throw new Error('সব AI provider ব্যর্থ');
}

async function searchWeb(key, query, max = 5) {
  const r = await fetch('https://api.tavily.com/search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ api_key: key, query, max_results: max }) });
  if (!r.ok) throw new Error('সার্চ ব্যর্থ');
  const j = await r.json();
  return (j.results || []).slice(0, max).map((x, i) => ({ n: i + 1, title: x.title || 'সোর্স ' + (i + 1), url: x.url, content: (x.content || '').slice(0, 1500) }));
}

addEventListener('fetch', (event) => {
  event.respondWith(handle(event.request));
});

async function handle(req) {
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;
    if (method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

    // health
    if (method === 'GET' && path === '/api/health') return json({ ok: true });

    // config
    if (method === 'GET' && path === '/api/config') {
      const models = MODELS.filter((m) => keyOf(m.pid)).map((m) => ({ id: m.id, label: m.label, pid: m.pid }));
      return json({ models, features: { research: !!TAVILY_API_KEY, files: true, memory: true, agent: false, github: false, deploy: false, image: true } });
    }

    // system
    if (method === 'GET' && path === '/api/system') {
      const n = MODELS.filter((m) => keyOf(m.pid)).length;
      const providers = await pingProviders().catch(() => []);
      return json({ providers, services: [
        { name: 'AI Providers', status: n ? n + ' সক্রিয়' : 'কোনো key নেই', dot: n ? 'ok' : 'err' },
        { name: 'API Server', status: 'Operational', dot: 'ok' },
        { name: 'Web Research', status: TAVILY_API_KEY ? 'Operational' : 'Setup needed', dot: TAVILY_API_KEY ? 'ok' : 'warn' },
        { name: 'Storage (KV)', status: 'Operational', dot: 'ok' },
        { name: 'Agent Engine', status: 'Phase 5-এ আসবে', dot: 'off' },
      ], deployments: [] });
    }

    // memory
    if (method === 'GET' && path === '/api/memory') {
      const mem = await kvJson('memory', { enabled: true, notes: '' });
      return json(mem);
    }
    if (method === 'PUT' && path === '/api/memory') {
      const body = await parseBody(req);
      const mem = await kvJson('memory', { enabled: true, notes: '' });
      if (typeof body.enabled === 'boolean') mem.enabled = body.enabled;
      if (typeof body.notes === 'string') mem.notes = body.notes.slice(0, 4000);
      await kvSet('memory', mem);
      return json(mem);
    }

    // usage
    if (method === 'GET' && path === '/api/usage') {
      const u = await kvJson('usage', { total: { requests: 0, tokens: 0, cost: 0 }, byModel: {} });
      return json(u);
    }

    // chats list
    if (method === 'GET' && path === '/api/chats') {
      const data = await kvJson('chats', { chats: [] });
      const q = (url.searchParams.get('q') || '').toLowerCase().trim();
      const dateF = (url.searchParams.get('date') || '').trim();
      const proj = url.searchParams.get('project') || '';
      const arch = url.searchParams.get('archived'); // ডিফল্ট: archived বাদ | ?archived=1 → শুধু archived | ?archived=all → সব
      const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '50', 10) || 50));
      const offset = Math.max(0, parseInt(url.searchParams.get('offset') || '0', 10) || 0);
      let list = data.chats;
      if (arch === '1' || arch === 'true') list = list.filter((c) => !!c.archived);
      else if (arch !== 'all') list = list.filter((c) => !c.archived);
      if (proj) list = list.filter((c) => c.project === proj);
      if (q) list = list.filter((c) => (c.title || '').toLowerCase().includes(q) || (c.messages || []).some((m) => m.role !== 'system' && String(m.content || '').toLowerCase().includes(q)));
      if (dateF) {
        const d0 = new Date(dateF + 'T00:00:00').getTime(); const d1 = d0 + 86400000;
        if (!isNaN(d0)) list = list.filter((c) => (c.updatedAt >= d0 && c.updatedAt < d1) || (c.createdAt >= d0 && c.createdAt < d1));
      }
      list = list.map((c) => ({ id: c.id, title: c.title, project: c.project, pinned: !!c.pinned, archived: !!c.archived, createdAt: c.createdAt, updatedAt: c.updatedAt, n: (c.messages || []).filter((m) => m.role !== 'system').length }));
      list.sort((a, b) => b.updatedAt - a.updatedAt);
      return json(list.slice(offset, offset + limit));
    }
    if (method === 'POST' && path === '/api/chats') {
      const data = await kvJson('chats', { chats: [] });
      const body = await parseBody(req);
      const c = { id: crypto.randomUUID(), title: (body.title || 'নতুন চ্যাট').slice(0, 60), project: body.project || 'সাধারণ', pinned: false, archived: false, createdAt: Date.now(), updatedAt: Date.now(), messages: [] };
      data.chats.unshift(c); await kvSet('chats', data);
      return json(c);
    }

    const mChat = path.match(/^\/api\/chats\/([\w-]+)$/);
    if (mChat && method === 'GET') {
      const data = await kvJson('chats', { chats: [] });
      const c = data.chats.find((x) => x.id === mChat[1]);
      if (!c) return json({ error: 'পাওয়া যায়নি' }, 404);
      const { messages, ...meta } = c;
      return json({ ...meta, total: (c.messages || []).length });
    }
    const mMessages = path.match(/^\/api\/chats\/([\w-]+)\/messages$/);
    if (mMessages && method === 'GET') {
      const data = await kvJson('chats', { chats: [] });
      const c = data.chats.find((x) => x.id === mMessages[1]);
      if (!c) return json({ error: 'পাওয়া যায়নি' }, 404);
      const msgs = c.messages || [];
      const limit = Math.min(200, Math.max(1, parseInt(url.searchParams.get('limit') || '60', 10) || 60));
      const offset = Math.max(0, parseInt(url.searchParams.get('offset') || '0', 10) || 0);
      return json({ total: msgs.length, messages: msgs.slice(offset, offset + limit) });
    }
    const mSearchMsg = path.match(/^\/api\/chats\/([\w-]+)\/search$/);
    if (mSearchMsg && method === 'GET') {
      const data = await kvJson('chats', { chats: [] });
      const c = data.chats.find((x) => x.id === mSearchMsg[1]);
      if (!c) return json({ error: 'পাওয়া যায়নি' }, 404);
      const q = (url.searchParams.get('q') || '').toLowerCase().trim();
      if (!q) return json({ hits: [] });
      const hits = [];
      (c.messages || []).forEach((m, i) => {
        if (m.role === 'system') return;
        const t = String(m.content || '');
        const idx = t.toLowerCase().indexOf(q);
        if (idx >= 0) {
          const snip = (idx > 30 ? '…' : '') + t.slice(Math.max(0, idx - 30), idx + q.length + 60) + (idx + q.length + 60 < t.length ? '…' : '');
          hits.push({ i, role: m.role, snip });
        }
      });
      return json({ hits: hits.slice(0, 100) });
    }
    if (mChat && method === 'DELETE') {
      const data = await kvJson('chats', { chats: [] });
      data.chats = data.chats.filter((x) => x.id !== mChat[1]); await kvSet('chats', data);
      return json({ ok: true });
    }
    if (mChat && method === 'PATCH') {
      const data = await kvJson('chats', { chats: [] });
      const c = data.chats.find((x) => x.id === mChat[1]);
      if (!c) return json({ error: 'নেই' }, 404);
      const body = await parseBody(req);
      for (const k of ['title', 'pinned', 'archived']) if (k in body) c[k] = body[k];
      c.updatedAt = Date.now(); await kvSet('chats', data);
      return json(c);
    }

    const mBr = path.match(/^\/api\/chats\/([\w-]+)\/branch$/);
    if (mBr && method === 'POST') {
      const data = await kvJson('chats', { chats: [] });
      const c = data.chats.find((x) => x.id === mBr[1]);
      if (!c) return json({ error: 'নেই' }, 404);
      const body = await parseBody(req);
      const idx = Math.max(0, Math.min(Number(body.index) || c.messages.length - 1, c.messages.length));
      const nc = { id: crypto.randomUUID(), title: c.title + ' · branch', pinned: false, archived: false, createdAt: Date.now(), updatedAt: Date.now(), messages: c.messages.slice(0, idx) };
      data.chats.unshift(nc); await kvSet('chats', data);
      return json(nc);
    }

    // files
    if (method === 'GET' && path === '/api/files') {
      const list = (await kvJson('files', {}));
      return json(Object.values(list).sort((a, b) => b.ts - a.ts));
    }
    if (method === 'POST' && path === '/api/files') {
      const body = await parseBody(req);
      const name = (body.name || 'file.txt').slice(0, 100);
      const ext = (name.split('.').pop() || '').toLowerCase();
      const isBin = BIN_EXT.includes(ext) || (typeof body.b64 === 'string' && (body.mime || '').startsWith('application/pdf'));
      const id = crypto.randomUUID();
      const files = await kvJson('files', {});
      if (isBin) {
        const b64 = (body.b64 || '').replace(/\s/g, '');
        if (!b64) return json({ error: 'ফাইলের কনটেন্ট নেই' }, 400);
        if (b64.length > MAX_B64) return json({ error: 'PDF সর্বোচ্চ ১০MB' }, 400);
        const mime = BIN_MIME[ext] || 'application/pdf';
        files[id] = { id, name, size: b64.length, bytes: Math.floor(b64.length * 0.75), mime, type: 'binary', ts: Date.now() };
        await kvSet('files', files);
        await AH_KV.put('fileb:' + id, b64);
        return json(files[id]);
      }
      const content = (body.content || '').slice(0, MAX_TEXT);
      if (!TEXT_EXT.includes(ext)) return json({ error: 'এই ফরম্যাট এখনো সাপোর্ট নেই — PDF, TXT, CSV, JSON বা কোড ফাইল দাও' }, 400);
      files[id] = { id, name, size: content.length, type: 'text', ts: Date.now() };
      await kvSet('files', files);
      await AH_KV.put('file:' + id, content);
      return json(files[id]);
    }
    const mFile = path.match(/^\/api\/files\/([\w-]+)(\/(analyze|ask))?$/);
    if (mFile) {
      const files = await kvJson('files', {});
      const meta = files[mFile[1]];
      if (!meta) return json({ error: 'নেই' }, 404);
      const isBin = meta.type === 'binary' || BIN_EXT.includes((meta.name.split('.').pop() || '').toLowerCase());
      const b64 = isBin ? await AH_KV.get('fileb:' + mFile[1]) : null;
      const content = isBin ? null : await AH_KV.get('file:' + mFile[1]);
      if (method === 'GET' && !mFile[2]) {
        if (isBin && b64) {
          const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
          return new Response(bin, { headers: { 'Content-Type': meta.mime || 'application/pdf', ...cors } });
        }
        return new Response(content || '', { headers: { 'Content-Type': 'text/plain; charset=utf-8', ...cors } });
      }
      if (method === 'DELETE' && !mFile[2]) {
        delete files[mFile[1]]; await kvSet('files', files);
        await AH_KV.delete('file:' + mFile[1]); await AH_KV.delete('fileb:' + mFile[1]);
        return json({ ok: true });
      }
      if (method === 'POST') {
        const body = await parseBody(req);
        const q = mFile[2] === 'ask' ? (body.question || 'এই ফাইল সম্পর্কে কী জানো?') : 'এই ফাইলের সম্পূর্ণ বিশ্লেষণ দাও: মূল বিষয়, গঠন, গুরুত্বপূর্ণ অংশ, সম্ভাব্য সমস্যা, সারাংশ।';
        const msgs = isBin && b64
          ? [{ role: 'system', content: 'তুমি একটি ফাইল বিশ্লেষক। সংযুক্ত ফাইল-এর উপর ভিত্তি করে বাংলায় উত্তর দাও।' },
             { role: 'user', content: [{ type: 'text', text: `ফাইল: ${meta.name}\nপ্রশ্ন: ${q}` }, { type: 'image_url', image_url: { url: `data:${meta.mime || 'application/pdf'};base64,${b64}`, mime_type: meta.mime || 'application/pdf' } }] }]
          : [{ role: 'system', content: 'তুমি একটি ফাইল বিশ্লেষক। ফাইল-এর উপর ভিত্তি করে উত্তর দাও।' },
             { role: 'user', content: `ফাইল: ${meta.name}\n\n${(content || '').slice(0, 50000)}\n\nপ্রশ্ন: ${q}` }];
        let ans = '';
        for await (const t of streamAnswer(msgs, 'auto', 'balanced', () => {}, null, isBin)) ans += t;
        return json({ answer: ans });
      }
    }

    // ---- MAIN CHAT (SSE) ----
    const mRe = path.match(/^\/api\/chats\/([\w-]+)\/regenerate$/);
    if ((method === 'POST' && path === '/api/chat') || (mRe && method === 'POST')) {
      const body = await parseBody(req);
      const data = await kvJson('chats', { chats: [] });
      const chatId = mRe ? mRe[1] : (body.chatId || null);
      let c = data.chats.find((x) => x.id === chatId);
      let msgs;
      let popped = null;
      if (mRe) {
        if (!c) return json({ error: 'নেই' }, 404);
        msgs = c.messages;
        while (msgs.length && msgs[msgs.length - 1].role === 'assistant') popped = msgs.pop();
      } else {
        const msg = (body.message || '').trim();
        if (!msg) return json({ error: 'খালি' }, 400);
        if (!c) {
          c = { id: crypto.randomUUID(), title: msg.slice(0, 42) + (msg.length > 42 ? '…' : ''), pinned: false, archived: false, createdAt: Date.now(), updatedAt: Date.now(), messages: [] };
          data.chats.unshift(c);
        }
        c.messages.push({ role: 'user', content: msg, ts: Date.now(), media: body.media || null, images: body.images || null });
        msgs = c.messages;
      }

      const mem = await kvJson('memory', { enabled: true, notes: '' });
      msgs.push({ role: 'assistant', content: '', partial: true, ts: Date.now() });
      const summary = await ensureSummary(c, data);
      const baseSys = SYSTEM + (mem.enabled && mem.notes ? '\n## স্মৃতি\n' + mem.notes : '') + (summary ? '\n\n## এ পর্যন্ত কথোপকথনের সারাংশ (পুরোনো অংশ)\n' + summary : '');
      let finalMsgs = [{ role: 'system', content: baseSys }, ...msgs.filter((m) => m.role !== 'system' && !(m.partial && !m.content)).slice(-24)];

      // ফাইল (txt inline / PDF inline_data) + ছবি — শেষ user মেসেজে যুক্ত
      let hasMulti = !!(body.images && body.images.length);
      let extraText = '';
      const binParts = [];
      if (body.media && body.media.length) {
        const files = await kvJson('files', {});
        for (const m of body.media) {
          const meta = files[m.id];
          if (!meta) continue;
          const isBin = meta.type === 'binary' || BIN_EXT.includes((meta.name.split('.').pop() || '').toLowerCase());
          if (isBin) {
            const b64 = (await AH_KV.get('fileb:' + m.id)) || '';
            if (b64) { binParts.push({ type: 'image_url', image_url: { url: `data:${meta.mime || 'application/pdf'};base64,${b64}`, mime_type: meta.mime || 'application/pdf' } }); hasMulti = true; }
          } else {
            const txt = ((await AH_KV.get('file:' + m.id)) || '').slice(0, 50000);
            if (txt) extraText += '\n\n[সংযুক্ত ফাইল: ' + meta.name + ']\n' + txt + '\n';
          }
        }
      }
      const lU = finalMsgs[finalMsgs.length - 1];
      if (lU && lU.role === 'user' && (extraText || binParts.length || (body.images && body.images.length))) {
        const parts = [{ type: 'text', text: (typeof lU.content === 'string' ? lU.content : '') + extraText }];
        for (const bp of binParts) parts.push(bp);
        for (const im of (body.images || [])) {
          const mm = DATAURL.exec(im || '');
          if (!mm || mm[2].length > 4 * 1024 * 1024) continue;
          parts.push({ type: 'image_url', image_url: { url: im, mime_type: mm[1] } });
        }
        finalMsgs[finalMsgs.length - 1] = parts.length > 1
          ? { role: 'user', content: parts }
          : { role: 'user', content: parts[0].text };
      }

      const emitQueue = [];
      let res; // হবে SSE Response
      let answer = '', sources = [], attempt = null;
      const t0 = Date.now();

      res = sseStream((emit, close) => {
        (async () => {
          try {
            if (body.web) {
              const lastC = finalMsgs[finalMsgs.length - 1].content;
              const q = typeof lastC === 'string' ? lastC : lastC.filter((p) => p.type === 'text').map((p) => p.text).join(' ');
              emit({ step: 'SEARCHING' });
              sources = await searchWeb(TAVILY_API_KEY, q, 5);
              emit({ sources });
              emit({ step: 'READING' });
              const ctx = sources.map((s) => `[${s.n}] ${s.title}\nURL: ${s.url}\n${s.content}`).join('\n\n');
              const last = finalMsgs.pop();
              finalMsgs.push({ role: 'system', content: `ওয়েব সোর্স থেকে উত্তর দাও, প্রতিটি দাবিতে [1] নম্বর উল্লেখ করো।\n\n${ctx}` }, last);
              emit({ step: 'ANALYZING' });
            }
            const ac = new AbortController();
            req.signal?.addEventListener('abort', () => ac.abort());
            for await (const tok of streamAnswer(finalMsgs, body.model || 'auto', body.mode || 'balanced', emit, ac.signal, hasMulti)) {
              answer += tok; emit({ token: tok });
            }
            if (!answer) throw new Error('খালি');
            const parsed = parseSuggestions(answer);
            answer = parsed.text;
            const meta = { model: attempt?.model, provider: attempt?.pid, mode: body.mode || 'balanced', seconds: Math.round((Date.now() - t0) / 100) / 10, tokens: Math.ceil(answer.length / 4) };
            const ph = c.messages[c.messages.length - 1];
            if (ph && ph.partial) { Object.assign(ph, { content: answer, partial: false, ts: Date.now(), model: (attempt?.pid || '') + ' · ' + (attempt?.model || ''), mode: meta.mode, meta, sources, suggestions: parsed.list }); }
            else c.messages.push({ role: 'assistant', content: answer, ts: Date.now(), model: (attempt?.pid || '') + ' · ' + (attempt?.model || ''), mode: meta.mode, meta, sources, suggestions: parsed.list });
            c.updatedAt = Date.now();
            await kvSet('chats', data);
            const u = await kvJson('usage', { total: { requests: 0, tokens: 0, cost: 0 }, byModel: {} });
            u.total.requests += 1; u.total.tokens += meta.tokens;
            const k = attempt?.label || 'unknown';
            u.byModel[k] = u.byModel[k] || { requests: 0, tokens: 0 };
            u.byModel[k].requests += 1; u.byModel[k].tokens += meta.tokens;
            await kvSet('usage', u);
            emit({ done: true, id: c.id, meta, sources, suggestions: parsed.list });
          } catch (e) {
            /* partial-stream persistence: যতটুকু এসেছে তা সেভ করো */
            try {
              if (answer && answer.trim()) {
                const ph = c.messages[c.messages.length - 1];
                if (ph && ph.partial) { ph.content = answer; ph.ts = Date.now(); }
                else c.messages.push({ role: 'assistant', content: answer, partial: true, ts: Date.now() });
              } else if (popped) {
                /* রিজেনারেশন ব্যর্থ → পুরোনো উত্তর ফেরত */
                const ph = c.messages[c.messages.length - 1];
                if (ph && ph.partial) { Object.assign(ph, popped); ph.partial = true; }
                else c.messages.push({ ...popped, partial: true });
              }
              /* ব্যর্থ হলেও user বার্তা + placeholder সংরক্ষিত থাকে */
              c.updatedAt = Date.now();
              await kvSet('chats', data);
            } catch {}
            if (req.signal?.aborted) { emit({ abort: true }); }
            else emit({ stopped: true, error: String(e.message || 'সমস্যা').slice(0, 200) });
          } finally { close(); }
        })();
      });
      return res;
    }

    return json({ error: 'পাওয়া যায়নি' }, 404);
  }
