/**
 * ADMISSION HUB AI — Cloudflare Pages backend (_worker.js, module format)
 * Keys: env binding → না থাকলে KV 'cfg:*' থেকে পড়ে (কখনো public code-এ নেই)।
 * Data: KV namespace AH_KV। সব free। SSE chat + Tavily research।
 */
const SYSTEM = `তুমি "ADMISSION HUB AI" — Admission Hub-এর জন্য বানানো একটি প্রিমিয়াম প্রাইভেট AI Assistant।
ভাষা: সহজ বাংলা (প্রয়োজনে ইংরেজি)। সবসময় সংক্ষিপ্ত, পরিষ্কার, গঠনমূলক উত্তর — দরকার হলে বুলেট/টেবিল/কোড ব্লক।
শুধু সত্য তথ্য দেবে; যা জানো না সেটা সৎভাবে বলবে। সাইটেশন [1] ফরম্যাটে দিলে সেগুলো সোর্স তালিকায় মিলবে।
তুমি এখন chat + research mode-এ চলছ। Agent tools, GitHub, deploy এখনো যুক্ত হয়নি — সেই কাজ চাইলে জানিয়ে দেবে "এখনো যুক্ত হয়নি (Phase 5+)"।`;

const MODELS = [
  { pid: 'groq', id: 'fast', label: 'Groq · GPT-OSS-120B', model: 'openai/gpt-oss-120b', speed: 3, quality: 4, coding: 5 },
  { pid: 'groq', id: 'lite', label: 'Groq · Qwen 3.8-27B', model: 'qwen/qwen3.8-27b', speed: 4, quality: 3, coding: 4 },
  { pid: 'gemini', id: 'flash', label: 'Gemini · 3.1 Flash-Lite', model: 'gemini-3.1-flash-lite', speed: 4, quality: 3, coding: 3 },
  { pid: 'cerebras', id: 'c3', label: 'Cerebras · GPT-OSS-120B', model: 'gpt-oss-120b', speed: 5, quality: 3, coding: 4 },
  { pid: 'mistral', id: 'm2', label: 'Mistral · Small 3.1', model: 'mistral-small-latest', speed: 4, quality: 3, coding: 3 },
  { pid: 'openrouter', id: 'or', label: 'OpenRouter · Llama 3.3 Free', model: 'meta-llama/llama-3.3-70b-instruct:free', speed: 3, quality: 4, coding: 4 },
];
const KEYMAP = { groq: 'GROQ_API_KEY', gemini: 'GEMINI_API_KEY', cerebras: 'CEREBRAS_API_KEY', mistral: 'MISTRAL_API_KEY', openrouter: 'OPENROUTER_API_KEY' };
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
  return list.filter((m) => keys[KEYMAP[m.pid]]).slice(0, 4);
}

function cleanMsgs(messages) {
  return (messages || [])
    .filter((m) => m && typeof m.content === 'string' && (m.role === 'user' || m.role === 'assistant' || m.role === 'system'))
    .map((m) => ({ role: m.role, content: m.content }));
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
  const contents = cleanMsgs(messages).filter((m) => m.role !== 'system').map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));
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
      return json({ models, features: { research: !!keys.TAVILY_API_KEY, files: true, memory: true, agent: false, github: false, deploy: false, image: false } });
    }

    if (method === 'GET' && path === '/api/system') {
      const n = MODELS.filter((m) => keys[KEYMAP[m.pid]]).length;
      return json({
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
      const q = (url.searchParams.get('q') || '').toLowerCase();
      let list = data.chats.map((c) => ({ id: c.id, title: c.title, project: c.project || 'সাধারণ', pinned: !!c.pinned, archived: !!c.archived, createdAt: c.createdAt, updatedAt: c.updatedAt, n: (c.messages || []).filter((m) => m.role !== 'system').length }));
      if (q) list = list.filter((c) => (c.title || '').toLowerCase().includes(q));
      const pj = url.searchParams.get('project');
      if (pj) list = list.filter((c) => (c.project || 'সাধারণ') === pj);
      list.sort((a, b) => b.updatedAt - a.updatedAt);
      return json(list.slice(0, 300));
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
      return c ? json(c) : json({ error: 'পাওয়া যায়নি' }, 404);
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
      if (mRe) {
        if (!c) return json({ error: 'নেই' }, 404);
        msgs = c.messages;
        while (msgs.length && msgs[msgs.length - 1].role === 'assistant') msgs.pop();
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

      const mem = await kvGet(env, 'memory', { enabled: true, notes: '' });
      let finalMsgs = [{ role: 'system', content: SYSTEM + (mem.enabled && mem.notes ? '\n## স্মৃতি\n' + mem.notes : '') }, ...msgs.filter((m) => m.role !== 'system').slice(-24)];
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
            const meta = { model: attempt?.model, provider: attempt?.pid, mode: body.mode || 'balanced', seconds: Math.round((Date.now() - t0) / 100) / 10, tokens: Math.ceil(answer.length / 4) };
            c.messages.push({ role: 'assistant', content: answer, ts: Date.now(), model: (attempt?.pid || '') + ' · ' + (attempt?.model || ''), mode: meta.mode, meta, sources: body.web ? (await kvGet(env, 'lastSources', [])) : [] });
            c.updatedAt = Date.now();
            await kvSet(env, 'chats', data);
            const u = await kvGet(env, 'usage', { total: { requests: 0, tokens: 0, cost: 0 }, byModel: {} });
            u.total.requests += 1; u.total.tokens += meta.tokens;
            const kk = attempt?.label || 'unknown';
            u.byModel[kk] = u.byModel[kk] || { requests: 0, tokens: 0 };
            u.byModel[kk].requests += 1; u.byModel[kk].tokens += meta.tokens;
            await kvSet(env, 'usage', u);
            emit({ done: true, id: c.id, meta });
          } catch (e) {
            if (req.signal?.aborted) emit({ abort: true });
            else emit({ stopped: true, error: String(e.message || 'সমস্যা').slice(0, 200) });
          } finally { close(); }
        })();
      });
    }

    return json({ error: 'পাওয়া যায়নি' }, 404);
  },
};
