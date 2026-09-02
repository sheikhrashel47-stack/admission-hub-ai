/**
 * ADMISSION HUB AI — Cloudflare Pages backend (_worker.js, module format)
 * Keys: env binding → না থাকলে KV 'cfg:*' থেকে পড়ে (কখনো public code-এ নেই)।
 * Data: KV namespace AH_KV। সব free। SSE chat + Tavily research।
 */
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
  { pid: 'groq', id: 'fast', label: 'Groq · GPT-OSS-120B', model: 'openai/gpt-oss-120b', speed: 3, quality: 4, coding: 5 },
  { pid: 'groq', id: 'lite', label: 'Groq · Qwen 3.8-27B', model: 'qwen/qwen3.8-27b', speed: 4, quality: 3, coding: 4 },
  { pid: 'gemini', id: 'flash', label: 'Gemini · 3.1 Flash-Lite', model: 'gemini-3.1-flash-lite', speed: 4, quality: 3, coding: 3 },
  { pid: 'mistral', id: 'm2', label: 'Mistral · Small 3.1', model: 'mistral-small-latest', speed: 4, quality: 3, coding: 3 },
  { pid: 'openrouter', id: 'or', label: 'OpenRouter · Free Router', model: 'openrouter/free', speed: 3, quality: 4, coding: 4 },
];
const KEYMAP = { groq: 'GROQ_API_KEY', gemini: 'GEMINI_API_KEY', cerebras: 'CEREBRAS_API_KEY', mistral: 'MISTRAL_API_KEY', openrouter: 'OPENROUTER_API_KEY' };
const NL = '\n';
const NN = '\n\n';
const TEXT_EXT = ['txt','md','csv','json','html','htm','css','js','mjs','ts','tsx','jsx','xml','yml','yaml','sh','sql','py','env'];

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', ...cors } });
}

let _keysCache = null;
async function loadKeys(env) {
  if (_keysCache) return _keysCache;
  const k = {};
  const names = ['GROQ_API_KEY','GEMINI_API_KEY','CEREBRAS_API_KEY','MISTRAL_API_KEY','OPENROUTER_API_KEY','TAVILY_API_KEY'];
  for (const n of names) {
    let v;
    try { v = env[n]; } catch {} // binding-মিস হলে throw এড়াই
    if (!v) { try { v = await env.AH_KV.get('cfg:' + n); } catch {} }
    if (v) k[n] = v;
  }
  _keysCache = k;
  return k;
}

function kvGet(env, key, fallback) { return env.AH_KV.get(key, 'json').then((v) => v ?? fallback); }
function kvSet(env, key, val) { return env.AH_KV.put(key, JSON.stringify(val)); }

function sseStream(onWrite) {
  const enc = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      onWrite(
        (ev) => { try { controller.enqueue(enc.encode(`data: ${JSON.stringify(ev)}\n\n`)); } catch {} },
        () => { try { controller.close(); } catch {} }
      );
    },
  });
  return new Response(stream, { headers: { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-cache', ...cors } });
}

function parseBody(req) { return req.json().catch(() => ({})); }

function pickChain(keys, model, mode, images) {
  let list = MODELS;
  if (model && model !== 'auto') {
    const m = MODELS.find((x) => x.id === model);
    list = m ? [m] : [];
  } else {
    list = [...MODELS].sort((a, b) => (b.quality * 10 + b.speed) - (a.quality * 10 + a.speed));
    if (mode === 'fast') list.sort((a, b) => b.speed - a.speed || b.quality - a.quality);
    if (images) list.sort((a, b) => (a.pid === 'gemini') === (b.pid === 'gemini') ? 0 : a.pid === 'gemini' ? -1 : 1);
  }
  if (images) return list.filter((m) => m.pid === 'gemini' && keys[KEYMAP[m.pid]]).slice(0, 1);
  return list.filter((m) => keys[KEYMAP[m.pid]]).slice(0, 4);
}

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
  const contents = cleanMsgs(messages).filter((m) => m.role !== 'system').map((m) => {
    const parts = Array.isArray(m.content)
      ? m.content.map((p) => (p.type === 'image_url'
          ? (() => { const mm = /^data:(image\/[a-z+]+);base64,(.+)$/i.exec(p.image_url?.url || ''); return mm ? { inline_data: { mime_type: mm[1], data: mm[2] } } : null; })()
          : { text: p.text || '' }))
      : [{ text: m.content }];
    return { role: m.role === 'assistant' ? 'model' : 'user', parts: parts.filter(Boolean) };
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

async function* streamAnswer(keys, messages, model, mode, emit, signal, images) {
  let attempt = null;
  const chain = pickChain(keys, model, mode, images);
  if (!chain.length) throw new Error('কোনো AI provider key নেই — KV-তে cfg:* চেক করো');
  for (const m of chain) {
    const key = keys[KEYMAP[m.pid]];
    const ac = new AbortController();
    const onAbort = () => ac.abort();
    if (signal) { if (signal.aborted) ac.abort(); else signal.addEventListener('abort', onAbort); }
    try {
      emit({ attempt: { provider: m.pid, label: m.label, model: m.model } }); attempt = m;
      let got = false;
      const base = { groq: 'https://api.groq.com/openai/v1', cerebras: 'https://api.cerebras.ai/v1', mistral: 'https://api.mistral.ai/v1', openrouter: 'https://openrouter.ai/api/v1' }[m.pid];
      const it = m.pid === 'gemini' ? geminiStream(key, m.model, messages, ac.signal) : openaiStream(base, key, m.model, messages, ac.signal);
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

const SUM_SYS = `তুমি একটি চ্যাট-সংক্ষেপক। নিচের কথোপকথনের গুরুত্বপূর্ণ তথ্য, সিদ্ধান্ত, ব্যবহারকারীর পছন্দ, নাম/সংখ্যা ও উল্লেখযোগ্য বিষয়গুলো বাংলায় সংক্ষিপ্ত বুলেটে নোট করো (সর্বোচ্চ ~৪০০ শব্দ)। শুধু সারাংশ লিখো — কোনো ভূমিকা, শিরোনাম বা মন্তব্য নয়।`;
async function summarize(keys, lines, prev) {
  const inp = (prev ? 'পুরোনো সারাংশ:' + NN + prev + NN : '') + lines.join(NL);
  if (!inp.trim()) return null;
  const finalMsgs = [{ role: 'system', content: SUM_SYS }, { role: 'user', content: inp.slice(0, 30000) }];
  for (const mid of ['flash', 'fast', 'm2']) {
    const ac = new AbortController();
    let out = '';
    try {
      for await (const tok of streamAnswer(keys, finalMsgs, mid, 'balanced', () => {}, ac.signal, false)) {
        out += tok;
        if (out.length > 1500) { ac.abort(); break; }
      }
      out = out.trim();
      if (out) return out.slice(0, 2000);
    } catch (e) { if (ac.signal.aborted && out) return out.slice(0, 2000); }
  }
  throw new Error('সংক্ষেপণ ব্যর্থ');
}
async function ensureSummary(keys, env, c, data) {
  if (!c) return null;
  const msgs = (c.messages || []).filter((m) => m.role !== 'system' && !(m.partial && !m.content));
  if (msgs.length < 48) return c.summary ? c.summary.text : null;
  const needUpTo = msgs.length - 24;
  if (c.summary && c.summary.upTo && c.summary.upTo >= needUpTo - 8) return c.summary.text;
  const from = (c.summary && c.summary.upTo) || 0;
  const lines = msgs.slice(Math.max(0, from), needUpTo).map((m) => (m.role === 'user' ? 'প্রশ্ন: ' : 'উত্তর: ') + (typeof m.content === 'string' ? m.content : ''));
  try {
    const txt = await summarize(keys, lines.slice(-60), c.summary ? c.summary.text : null);
    if (txt) { c.summary = { text: txt, upTo: needUpTo, ts: Date.now() }; await kvSet(env, 'chats', data); return txt; }
  } catch {}
  return c.summary ? c.summary.text : null;
}
function parseSuggestions(ans) {
  const m = /(?:\n|^)\[SUGGEST\]\s*\n((?:[-*] .*\n?)+)\s*$/.exec(ans);
  if (!m) return { text: ans, list: null };
  const list = m[1].split(NL).map((x) => x.replace(/^[-*]\s*/, '').trim()).filter(Boolean).slice(0, 3);
  return { text: ans.slice(0, m.index).trimEnd(), list: list.length ? list : null };
}
const PING_BASE = { groq: 'https://api.groq.com/openai/v1', mistral: 'https://api.mistral.ai/v1', openrouter: 'https://openrouter.ai/api/v1' };
async function pingProviders(keys) {
  const out = []; const seen = new Set();
  for (const m of MODELS) {
    if (seen.has(m.pid)) continue;
    const key = keys[KEYMAP[m.pid]];
    if (!key) continue;
    seen.add(m.pid);
    try {
      let r;
      if (m.pid === 'gemini') r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}&pageSize=1`);
      else if (m.pid === 'openrouter') r = await fetch(`${PING_BASE[m.pid]}/auth/key`, { headers: { Authorization: `Bearer ${key}` } });
      else r = await fetch(`${PING_BASE[m.pid]}/models`, { headers: { Authorization: `Bearer ${key}` } });
      out.push({ pid: m.pid, label: m.label, ok: !!r.ok });
    } catch { out.push({ pid: m.pid, label: m.label, ok: false }); }
  }
  return out;
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;
    if (method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

    const keys = await loadKeys(env);

    if (method === 'GET' && path === '/api/health') return json({ ok: true });

    if (method === 'GET' && path === '/api/config') {
      const models = MODELS.filter((m) => keys[KEYMAP[m.pid]]).map((m) => ({ id: m.id, label: m.label, pid: m.pid }));
      return json({ models, features: { research: !!keys.TAVILY_API_KEY, files: true, memory: true, agent: false, github: false, deploy: false, image: true } });
    }

    if (method === 'GET' && path === '/api/system') {
      const n = MODELS.filter((m) => keys[KEYMAP[m.pid]]).length;
      const providers = await pingProviders(keys).catch(() => []);
      return json({
        providers,
        services: [
          { name: 'AI Providers', status: n ? n + ' সক্রিয়' : 'কোনো key নেই', dot: n ? 'ok' : 'err' },
          { name: 'API Server', status: 'Operational', dot: 'ok' },
          { name: 'Web Research', status: keys.TAVILY_API_KEY ? 'Operational' : 'Setup needed', dot: keys.TAVILY_API_KEY ? 'ok' : 'warn' },
          { name: 'Storage (KV)', status: 'Operational', dot: 'ok' },
          { name: 'Agent Engine', status: 'Phase 5-এ আসবে', dot: 'off' },
        ],
        deployments: [],
      });
    }

    if (method === 'GET' && path === '/api/memory') return json(await kvGet(env, 'memory', { enabled: true, notes: '' }));
    if (method === 'PUT' && path === '/api/memory') {
      const body = await parseBody(req);
      const mem = await kvGet(env, 'memory', { enabled: true, notes: '' });
      if (typeof body.enabled === 'boolean') mem.enabled = body.enabled;
      if (typeof body.notes === 'string') mem.notes = body.notes.slice(0, 4000);
      await kvSet(env, 'memory', mem);
      return json(mem);
    }

    if (method === 'GET' && path === '/api/usage') return json(await kvGet(env, 'usage', { total: { requests: 0, tokens: 0, cost: 0 }, byModel: {} }));

    if (method === 'GET' && path === '/api/chats') {
      const data = await kvGet(env, 'chats', { chats: [] });
      const q = (url.searchParams.get('q') || '').toLowerCase().trim();
      const dateF = (url.searchParams.get('date') || '').trim();
      const proj = url.searchParams.get('project') || '';
      const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '50', 10) || 50));
      const offset = Math.max(0, parseInt(url.searchParams.get('offset') || '0', 10) || 0);
      let list = data.chats;
      if (proj) list = list.filter((c) => (c.project || 'সাধারণ') === proj);
      if (q) list = list.filter((c) => (c.title || '').toLowerCase().includes(q) || (c.messages || []).some((m) => m.role !== 'system' && String(m.content || '').toLowerCase().includes(q)));
      if (dateF) {
        const d0 = new Date(dateF + 'T00:00:00').getTime(); const d1 = d0 + 86400000;
        if (!isNaN(d0)) list = list.filter((c) => (c.updatedAt >= d0 && c.updatedAt < d1) || (c.createdAt >= d0 && c.createdAt < d1));
      }
      list = list.map((c) => ({ id: c.id, title: c.title, project: c.project || 'সাধারণ', pinned: !!c.pinned, archived: !!c.archived, createdAt: c.createdAt, updatedAt: c.updatedAt, n: (c.messages || []).filter((m) => m.role !== 'system').length }));
      list.sort((a, b) => b.updatedAt - a.updatedAt);
      return json(list.slice(offset, offset + limit));
    }
    if (method === 'POST' && path === '/api/chats') {
      const data = await kvGet(env, 'chats', { chats: [] });
      const body = await parseBody(req);
      const c = { id: crypto.randomUUID(), title: (body.title || 'নতুন চ্যাট').slice(0, 60), project: (body.project || 'সাধারণ'), pinned: false, archived: false, createdAt: Date.now(), updatedAt: Date.now(), messages: [] };
      data.chats.unshift(c); await kvSet(env, 'chats', data);
      return json(c);
    }

    const mChat = path.match(/^\/api\/chats\/([\w-]+)$/);
    if (mChat && method === 'GET') {
      const data = await kvGet(env, 'chats', { chats: [] });
      const c = data.chats.find((x) => x.id === mChat[1]);
      if (!c) return json({ error: 'পাওয়া যায়নি' }, 404);
      const { messages, ...meta } = c;
      return json({ ...meta, total: (c.messages || []).length });
    }
    const mMessages = path.match(/^\/api\/chats\/([\w-]+)\/messages$/);
    if (mMessages && method === 'GET') {
      const data = await kvGet(env, 'chats', { chats: [] });
      const c = data.chats.find((x) => x.id === mMessages[1]);
      if (!c) return json({ error: 'পাওয়া যায়নি' }, 404);
      const msgs = c.messages || [];
      const limit = Math.min(200, Math.max(1, parseInt(url.searchParams.get('limit') || '60', 10) || 60));
      const offset = Math.max(0, parseInt(url.searchParams.get('offset') || '0', 10) || 0);
      return json({ total: msgs.length, messages: msgs.slice(offset, offset + limit) });
    }
    const mSearchMsg = path.match(/^\/api\/chats\/([\w-]+)\/search$/);
    if (mSearchMsg && method === 'GET') {
      const data = await kvGet(env, 'chats', { chats: [] });
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
      const data = await kvGet(env, 'chats', { chats: [] });
      data.chats = data.chats.filter((x) => x.id !== mChat[1]); await kvSet(env, 'chats', data);
      return json({ ok: true });
    }
    if (mChat && method === 'PATCH') {
      const data = await kvGet(env, 'chats', { chats: [] });
      const c = data.chats.find((x) => x.id === mChat[1]);
      if (!c) return json({ error: 'নেই' }, 404);
      const body = await parseBody(req);
      for (const k of ['title', 'pinned', 'archived', 'project']) if (k in body) c[k] = body[k];
      c.updatedAt = Date.now(); await kvSet(env, 'chats', data);
      return json(c);
    }

    const mBr = path.match(/^\/api\/chats\/([\w-]+)\/branch$/);
    if (mBr && method === 'POST') {
      const data = await kvGet(env, 'chats', { chats: [] });
      const c = data.chats.find((x) => x.id === mBr[1]);
      if (!c) return json({ error: 'নেই' }, 404);
      const body = await parseBody(req);
      const idx = Math.max(0, Math.min(Number(body.index) || c.messages.length - 1, c.messages.length));
      const nc = { id: crypto.randomUUID(), title: c.title + ' · branch', pinned: false, archived: false, createdAt: Date.now(), updatedAt: Date.now(), messages: c.messages.slice(0, idx) };
      data.chats.unshift(nc); await kvSet(env, 'chats', data);
      return json(nc);
    }

    if (method === 'GET' && path === '/api/files') {
      const list = await kvGet(env, 'files', {});
      return json(Object.values(list).sort((a, b) => b.ts - a.ts));
    }
    if (method === 'POST' && path === '/api/files') {
      const body = await parseBody(req);
      const name = (body.name || 'file.txt').slice(0, 100);
      const content = (body.content || '').slice(0, 2 * 1024 * 1024);
      if (!TEXT_EXT.includes((name.split('.').pop() || '').toLowerCase())) return json({ error: 'এই ফরম্যাট এখনো সাপোর্ট নেই' }, 400);
      const id = crypto.randomUUID();
      const files = await kvGet(env, 'files', {});
      files[id] = { id, name, size: content.length, ts: Date.now() };
      await kvSet(env, 'files', files);
      await env.AH_KV.put('file:' + id, content);
      return json(files[id]);
    }
    const mFile = path.match(/^\/api\/files\/([\w-]+)(\/(analyze|ask))?$/);
    if (mFile) {
      const files = await kvGet(env, 'files', {});
      const meta = files[mFile[1]];
      if (!meta) return json({ error: 'নেই' }, 404);
      const content = await env.AH_KV.get('file:' + mFile[1]);
      if (method === 'GET' && !mFile[2]) return new Response(content || '', { headers: { 'Content-Type': 'text/plain; charset=utf-8', ...cors } });
      if (method === 'DELETE' && !mFile[2]) {
        delete files[mFile[1]]; await kvSet(env, 'files', files); await env.AH_KV.delete('file:' + mFile[1]);
        return json({ ok: true });
      }
      if (method === 'POST') {
        const body = await parseBody(req);
        const q = mFile[2] === 'ask' ? (body.question || 'এই ফাইল সম্পর্কে কী জানো?') : 'এই ফাইলের সম্পূর্ণ বিশ্লেষণ দাও: মূল বিষয়, গঠন, গুরুত্বপূর্ণ অংশ, সম্ভাব্য সমস্যা, সারাংশ।';
        const msgs = [{ role: 'system', content: 'তুমি একটি ফাইল বিশ্লেষক। ফাইল-এর উপর ভিত্তি করে উত্তর দাও।' }, { role: 'user', content: `ফাইল: ${meta.name}\n\n${(content || '').slice(0, 50000)}\n\nপ্রশ্ন: ${q}` }];
        let ans = '';
        for await (const t of streamAnswer(keys, msgs, 'auto', 'balanced', () => {})) ans += t;
        return json({ answer: ans });
      }
    }

    const mRe = path.match(/^\/api\/chats\/([\w-]+)\/regenerate$/);
    if ((method === 'POST' && path === '/api/chat') || (mRe && method === 'POST')) {
      const body = await parseBody(req);
      const data = await kvGet(env, 'chats', { chats: [] });
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
          c = { id: crypto.randomUUID(), title: msg.slice(0, 42) + (msg.length > 42 ? '…' : ''), project: (body.project || 'সাধারণ'), pinned: false, archived: false, createdAt: Date.now(), updatedAt: Date.now(), messages: [] };
          data.chats.unshift(c);
        }
        c.messages.push({ role: 'user', content: msg, ts: Date.now(), media: body.media || null, images: body.images || null });
        msgs = c.messages;
      }

      msgs.push({ role: 'assistant', content: '', partial: true, ts: Date.now() });
      const mem = await kvGet(env, 'memory', { enabled: true, notes: '' });
      const summary = await ensureSummary(keys, env, c, data);
      const baseSys = SYSTEM + (mem.enabled && mem.notes ? '\n## স্মৃতি\n' + mem.notes : '') + (summary ? '\n\n## এ পর্যন্ত কথোপকথনের সারাংশ (পুরোনো অংশ)\n' + summary : '');
      let finalMsgs = [{ role: 'system', content: baseSys }, ...msgs.filter((m) => m.role !== 'system' && !(m.partial && !m.content)).slice(-24)];
      if (body.media && body.media.length) {
        const lastU = finalMsgs[finalMsgs.length - 1];
        if (lastU.role === 'user') {
          let extra = '';
          const files = await kvGet(env, 'files', {});
          for (const m of body.media) {
            const meta = files[m.id];
            if (!meta) continue;
            const txt = ((await env.AH_KV.get('file:' + m.id)) || '').slice(0, 50000);
            if (!txt) continue;
            extra += '\n\n[সংযুক্ত ফাইল: ' + meta.name + ']\n' + txt + '\n';
          }
          if (extra) finalMsgs[finalMsgs.length - 1] = { role: 'user', content: lastU.content + extra };
        }
      }
      if (body.images && body.images.length) {
        const lastU = finalMsgs[finalMsgs.length - 1];
        if (lastU && lastU.role === 'user') {
          const parts = [{ type: 'text', text: typeof lastU.content === 'string' ? lastU.content : '' }];
          for (const im of body.images) {
            const mm = /^data:(image\/[a-z+]+);base64,(.+)$/i.exec(im || '');
            if (!mm || mm[2].length > 4 * 1024 * 1024) continue;
            parts.push({ type: 'image_url', image_url: { url: im, mime_type: mm[1] } });
          }
          if (parts.length > 1) finalMsgs[finalMsgs.length - 1] = { role: 'user', content: parts };
        }
      }

      return sseStream((emit, close) => {
        (async () => {
          try {
            if (body.web) {
              const q = finalMsgs[finalMsgs.length - 1].content;
              emit({ step: 'SEARCHING' });
              const sources = await searchWeb(keys.TAVILY_API_KEY, q, 5);
              emit({ sources });
              emit({ step: 'READING' });
              const ctx = sources.map((s) => `[${s.n}] ${s.title}\nURL: ${s.url}\n${s.content}`).join('\n\n');
              const last = finalMsgs.pop();
              finalMsgs.push({ role: 'system', content: `ওয়েব সোর্স থেকে উত্তর দাও, প্রতিটি দাবিতে [1] নম্বর উল্লেখ করো।\n\n${ctx}` }, last);
              emit({ step: 'ANALYZING' });
            }
            const ac = new AbortController();
            req.signal?.addEventListener('abort', () => ac.abort());
            let answer = '', attempt = null;
            const t0 = Date.now();
            for await (const tok of streamAnswer(keys, finalMsgs, body.model || 'auto', body.mode || 'balanced', emit, ac.signal, !!(body.images && body.images.length))) {
              answer += tok; emit({ token: tok });
            }
            if (!answer) throw new Error('খালি');
            const parsed = parseSuggestions(answer);
            answer = parsed.text;
            const meta = { model: attempt?.model, provider: attempt?.pid, mode: body.mode || 'balanced', seconds: Math.round((Date.now() - t0) / 100) / 10, tokens: Math.ceil(answer.length / 4) };
            const srcs2 = body.web ? (await kvGet(env, 'lastSources', [])) : [];
            const ph = c.messages[c.messages.length - 1];
            if (ph && ph.partial) Object.assign(ph, { content: answer, partial: false, ts: Date.now(), model: (attempt?.pid || '') + ' · ' + (attempt?.model || ''), mode: meta.mode, meta, sources: srcs2, suggestions: parsed.list });
            else c.messages.push({ role: 'assistant', content: answer, ts: Date.now(), model: (attempt?.pid || '') + ' · ' + (attempt?.model || ''), mode: meta.mode, meta, sources: srcs2, suggestions: parsed.list });
            c.updatedAt = Date.now();
            await kvSet(env, 'chats', data);
            const u = await kvGet(env, 'usage', { total: { requests: 0, tokens: 0, cost: 0 }, byModel: {} });
            u.total.requests += 1; u.total.tokens += meta.tokens;
            const kk = attempt?.label || 'unknown';
            u.byModel[kk] = u.byModel[kk] || { requests: 0, tokens: 0 };
            u.byModel[kk].requests += 1; u.byModel[kk].tokens += meta.tokens;
            await kvSet(env, 'usage', u);
            emit({ done: true, id: c.id, meta, sources: body.web ? (await kvGet(env, 'lastSources', [])) : [], suggestions: parsed.list });
          } catch (e) {
            try {
              if (answer && answer.trim()) {
                const ph = c.messages[c.messages.length - 1];
                if (ph && ph.partial) { ph.content = answer; ph.ts = Date.now(); }
                else c.messages.push({ role: 'assistant', content: answer, partial: true, ts: Date.now() });
              } else if (popped) {
                const ph = c.messages[c.messages.length - 1];
                if (ph && ph.partial) { Object.assign(ph, popped); ph.partial = true; }
                else c.messages.push({ ...popped, partial: true });
              }
              c.updatedAt = Date.now();
              await kvSet(env, 'chats', data);
            } catch {}
            if (req.signal?.aborted) emit({ abort: true });
            else emit({ stopped: true, error: String(e.message || 'সমস্যা').slice(0, 200) });
          } finally { close(); }
        })();
      });
    }

    if (method === 'GET' && path === '/oauth/callback') {
      const sc = (url.searchParams.get('code') || '').replace(/[<>&"']/g, '');
      const err = url.searchParams.get('error') || '';
      const html = '<!doctype html><html lang="bn"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Drive সংযোগ — Admission Hub AI</title></head><body style="font-family:system-ui,sans-serif;background:#f6faf8;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0"><div style="background:#fff;border:1px solid #d9ede4;border-radius:16px;padding:28px;max-width:540px;width:92%;box-shadow:0 6px 24px rgba(0,0,0,.06)"><h2 style="color:' + (err ? '#b3541e' : '#0b7a53') + ';margin:0 0 10px">' + (err ? '⚠️ অনুমতি দেওয়া হয়নি' : '✅ Google Drive সংযোগ প্রস্তুত') + '</h2>' + (err ? '<p style="color:#555">অ্যাকাউন্টে Allow না করায় কোড আসেনি। আবার লিংকে ক্লিক করে <b>Allow</b> করুন।</p>' : '<p style="color:#555">নিচের কোডটি <b>নির্বাচন করে কপি</b> করুন এবং চ্যাটে আমায় পাঠিয়ে দিন:</p><div style="background:#eef7f3;border:1px dashed #0b7a53;border-radius:10px;padding:14px;margin:14px 0"><code style="font-size:15px;word-break:break-all;color:#0b4a33">' + (sc || '') + '</code></div><p style="font-size:13px;color:#888">কোডটি একবার-ব্যবহারযোগ্য — ১০ মিনিটের মধ্যে শেষ করতে হবে। এই ট্যাব বন্ধ করে দিতে পারেন।</p>') + '</div></body></html>';
      return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8', ...cors } });
    }

    return json({ error: 'পাওয়া যায়নি' }, 404);
  },
};
