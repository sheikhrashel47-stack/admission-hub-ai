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
  { pid: 'groq', id: 'fast', label: 'Groq · GPT-OSS-120B', model: 'openai/gpt-oss-120b', speed: 5, quality: 4, coding: 5 },
  { pid: 'groq', id: 'lite', label: 'Groq · Qwen 3.8-27B', model: 'qwen/qwen3.8-27b', speed: 5, quality: 3, coding: 4 },
  { pid: 'cerebras', id: 'cere', label: 'Cerebras · Llama 3.3 70B', model: 'llama-3.3-70b', speed: 5, quality: 4, coding: 4 },
  { pid: 'sambanova', id: 'snova', label: 'SambaNova · Llama 3.3 70B', model: 'Meta-Llama-3.3-70B-Instruct', speed: 3, quality: 4, coding: 4 },
  { pid: 'gemini', id: 'flash', label: 'Gemini · 3.1 Flash-Lite', model: 'gemini-3.1-flash-lite', speed: 4, quality: 3, coding: 3 },
  { pid: 'mistral', id: 'm2', label: 'Mistral · Small 3.1', model: 'mistral-small-latest', speed: 4, quality: 3, coding: 3 },
  { pid: 'deepinfra', id: 'di', label: 'DeepInfra · DeepSeek-V3', model: 'deepseek-ai/DeepSeek-V3', speed: 3, quality: 4, coding: 5 },
  { pid: 'together', id: 'tg', label: 'Together · Llama 3.3 70B Turbo', model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free', speed: 3, quality: 4, coding: 4 },
  { pid: 'openrouter', id: 'or', label: 'OpenRouter · Nemotron Lightning (free)', model: 'nvidia/nemotron-3.5-lightning:free', speed: 5, quality: 3, coding: 4, hide: 1 },
  { pid: 'openrouter', id: 'or2', label: 'OpenRouter · North Mini Code (free)', model: 'cohere/north-mini-code:free', speed: 4, quality: 3, coding: 4, hide: 1 },
  { pid: 'huggingface', id: 'hf', label: 'Hugging Face · Qwen2.5 72B', model: 'Qwen/Qwen2.5-72B-Instruct', speed: 2, quality: 3, coding: 3 },
  { pid: 'ollama', id: 'o120', label: 'Ollama · GPT-OSS 120B', model: 'gpt-oss:120b', speed: 3, quality: 4, coding: 5 },
  { pid: 'ollama', id: 'o20', label: 'Ollama · GPT-OSS 20B', model: 'gpt-oss:20b', speed: 4, quality: 3, coding: 4 },
  { pid: 'pollinations', id: 'polli', label: 'Pollinations · Free (key লাগে না)', model: 'openai', speed: 2, quality: 2, coding: 2 },
];
const KEYMAP = { groq: 'GROQ_API_KEY', gemini: 'GEMINI_API_KEY', cerebras: 'CEREBRAS_API_KEY', sambanova: 'SAMBANOVA_API_KEY', deepinfra: 'DEEPINFRA_API_KEY', together: 'TOGETHER_API_KEY', mistral: 'MISTRAL_API_KEY', openrouter: 'OPENROUTER_API_KEY', huggingface: 'HUGGINGFACE_API_KEY', ollama: 'OLLAMA_API_KEY' };
// টেক্সট চ্যাটের ফিক্সড fallback ক্রম (প্রথমটা সেরা/দ্রুততম)
const FALLBACK_ORDER = ['groq', 'cerebras', 'ollama', 'sambanova', 'gemini', 'mistral', 'deepinfra', 'together', 'openrouter', 'huggingface', 'pollinations'];
// key লাগে না এমন provider (pollinations) সবসময় "available" — বাকিরা key-নির্ভর
const hasKey = (keys, pid) => (pid === 'pollinations' ? true : !!keys[KEYMAP[pid]]);
const NL = '\n';
const NN = '\n\n';
const TEXT_EXT = ['txt','md','csv','json','html','htm','css','js','mjs','ts','tsx','jsx','xml','yml','yaml','sh','sql','py','env'];
// বাইনারি ফাইল — Gemini নিজে পার্স করে (PDF নেটিভ সাপোর্ট)। KV-তে base64 রাখি, vision পার্ট হিসেবে পাঠাই।
const BIN_EXT = ['pdf'];
const BIN_MIME = { pdf: 'application/pdf' };
const MAX_TEXT = 2 * 1024 * 1024;   // টেক্সট: ২MB
const MAX_B64 = 10 * 1024 * 1024;  // বাইনারি base64: ১০MB (KV value limit ২৫MB-এর মধ্যে)
// যেকোনো data URL: ছবি (image/*) + PDF (application/pdf) — Gemini inline_data-এ ম্যাপ হয়
const DATAURL = /^data:([\w.+-]+\/[\w.+-]+);base64,(.+)$/i;

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
  const names = ['GROQ_API_KEY','GEMINI_API_KEY','CEREBRAS_API_KEY','SAMBANOVA_API_KEY','DEEPINFRA_API_KEY','TOGETHER_API_KEY','MISTRAL_API_KEY','OPENROUTER_API_KEY','HUGGINGFACE_API_KEY','OLLAMA_API_KEY','TAVILY_API_KEY','GITHUB_PAT','CF_EMAIL','CF_GLOBAL_KEY'];
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

/* ---------- Google Drive backup (loadKeys প্যাটার্ন: env binding → KV cfg:GOOGLE_DRIVE_*_1) ---------- */
const DRIVE_FOLDER_NAME = 'ADMISSION-HUB-AI-Backups';
let _driveCfgCache = null;
async function loadDriveCfg(env) {
  if (_driveCfgCache !== null) return _driveCfgCache;
  const names = ['GOOGLE_DRIVE_CLIENT_ID_1', 'GOOGLE_DRIVE_CLIENT_SECRET_1', 'GOOGLE_DRIVE_REFRESH_TOKEN_1'];
  const c = {};
  for (const n of names) {
    let v;
    try { v = env[n]; } catch {} // binding-মিস হলে throw এড়াই
    if (!v) { try { v = await env.AH_KV.get('cfg:' + n); } catch {} }
    if (v) c[n] = String(v).trim();
  }
  _driveCfgCache = (c.GOOGLE_DRIVE_CLIENT_ID_1 && c.GOOGLE_DRIVE_CLIENT_SECRET_1 && c.GOOGLE_DRIVE_REFRESH_TOKEN_1)
    ? { clientId: c.GOOGLE_DRIVE_CLIENT_ID_1, clientSecret: c.GOOGLE_DRIVE_CLIENT_SECRET_1, refreshToken: c.GOOGLE_DRIVE_REFRESH_TOKEN_1 }
    : false;
  return _driveCfgCache;
}
let _driveTok = null; // { token, exp } — isolate-লেভেল ক্যাশ
async function driveToken(env) {
  const cfg = await loadDriveCfg(env);
  if (!cfg) return null;
  if (_driveTok && _driveTok.exp > Date.now() + 60000) return _driveTok.token;
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: cfg.clientId, client_secret: cfg.clientSecret, refresh_token: cfg.refreshToken, grant_type: 'refresh_token' }),
  });
  if (!r.ok) throw new Error('Drive token HTTP ' + r.status);
  const j = await r.json();
  if (!j.access_token) throw new Error('Drive token নেই');
  _driveTok = { token: j.access_token, exp: Date.now() + (Number(j.expires_in) || 3600) * 1000 };
  return _driveTok.token;
}
async function driveFolderId(env, token, force) {
  if (!force) { try { const cached = await env.AH_KV.get('drive:folder_1'); if (cached) return cached; } catch {} }
  const q = encodeURIComponent(`name='${DRIVE_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`);
  let id = null;
  const r = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id)&pageSize=1`, { headers: { Authorization: 'Bearer ' + token } });
  if (r.ok) { const j = await r.json(); id = j.files?.[0]?.id || null; }
  if (!id) {
    const c = await fetch('https://www.googleapis.com/drive/v3/files?fields=id', {
      method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: DRIVE_FOLDER_NAME, mimeType: 'application/vnd.google-apps.folder' }),
    });
    if (!c.ok) throw new Error('Drive folder HTTP ' + c.status);
    id = (await c.json()).id;
  }
  try { await env.AH_KV.put('drive:folder_1', id); } catch {}
  return id;
}
function driveMime(name) {
  const e = (name.split('.').pop() || '').toLowerCase();
  return { json: 'application/json', html: 'text/html', htm: 'text/html', css: 'text/css', csv: 'text/csv', xml: 'application/xml', js: 'text/javascript', mjs: 'text/javascript', md: 'text/markdown', pdf: 'application/pdf' }[e] || 'text/plain';
}
// content: string (text) বা Uint8Array (বাইনারি) — multipart body Blob দিয়ে বানাই যাতে বাইনারি নষ্ট না হয়
async function driveMultipartUpload(token, folderId, name, content, mime) {
  const boundary = 'ahb' + crypto.randomUUID().replace(/-/g, '');
  const meta = { name, parents: [folderId], description: 'Admission Hub AI ব্যাকআপ' };
  const isBin = content instanceof Uint8Array;
  const body = new Blob([
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(meta)}\r\n--${boundary}\r\nContent-Type: ${mime}${isBin ? '' : '; charset=UTF-8'}\r\n\r\n`,
    content,
    `\r\n--${boundary}--`,
  ]);
  const r = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': `multipart/related; boundary=${boundary}` },
    body,
  });
  if (!r.ok) throw new Error('Drive upload HTTP ' + r.status);
  return r.json();
}
async function driveBackup(env, name, content, mime) {
  const token = await driveToken(env);
  if (!token) return null;
  const m = mime || driveMime(name);
  let folder = await driveFolderId(env, token, false);
  try { return await driveMultipartUpload(token, folder, name, content, m); }
  catch { // ক্যাশ করা folder id বাসি হলে (ডিলিট হয়ে গেলে) নতুন করে খুঁজে/বানিয়ে একবার রিট্রাই
    folder = await driveFolderId(env, token, true);
    return await driveMultipartUpload(token, folder, name, content, m);
  }
}
async function driveDelete(env, fileId) {
  const token = await driveToken(env);
  if (!token || !fileId) return;
  await fetch('https://www.googleapis.com/drive/v3/files/' + encodeURIComponent(fileId), { method: 'DELETE', headers: { Authorization: 'Bearer ' + token } }).catch(() => {});
}

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

function pickChain(keys, model, mode, multimodal) {
  // multimodal = ছবি বা PDF (Gemini inline_data)। শুধু Gemini-ই এগুলো নিজে পার্স করে।
  let list = MODELS;
  if (model && model !== 'auto') {
    const m = MODELS.find((x) => x.id === model);
    list = m ? [m] : [];
  } else {
    list = [...MODELS].sort((a, b) => (FALLBACK_ORDER.indexOf(a.pid) - FALLBACK_ORDER.indexOf(b.pid)));
  }
  if (multimodal) return list.filter((m) => m.pid === 'gemini' && keys[KEYMAP[m.pid]]).slice(0, 1);
  return list.filter((m) => hasKey(keys, m.pid)).slice(0, 9);
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
  // কিছু provider (যেমন OpenRouter free — Cloudflare network থেকে) stream এ 404 দেয় কিন্তু non-stream চলে
  if (!r.ok && (r.status === 404 || r.status === 400)) {
    const r2 = await fetch(`${base}/chat/completions`, {
      method: 'POST', signal,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model, messages: cleanMsgs(messages), stream: false, temperature: 0.6, max_tokens: 2048 }),
    });
    if (r2.ok) {
      const j = await r2.json().catch(() => null);
      const t = j?.choices?.[0]?.message?.content;
      if (t) { yield t; return; }
    }
  }
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
          ? (() => { const mm = DATAURL.exec(p.image_url?.url || ''); return mm ? { inline_data: { mime_type: mm[1], data: mm[2] } } : null; })()
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

async function* streamAnswer(keys, messages, model, mode, emit, signal, multimodal) {
  // নির্দিষ্ট মডেল বাছা হলেও সেটা ব্যর্থ হলে AUTO chain-এ নেমে আসে — ইউজার কখনো "সব ব্যর্থ" দেখবে না
  const explicit = model && model !== 'auto';
  const chains = explicit
    ? [pickChain(keys, model, mode, multimodal), pickChain(keys, 'auto', mode, multimodal)]
    : [pickChain(keys, model, mode, multimodal)];
  const tried = new Set();
  let attempt = null;
  for (const chain of chains) {
    for (const m of chain) {
      const tag = m.pid + ':' + m.id;
      if (tried.has(tag)) continue;
      tried.add(tag);
      const key = keys[KEYMAP[m.pid]];
      const ac = new AbortController();
      const onAbort = () => ac.abort();
      if (signal) { if (signal.aborted) ac.abort(); else signal.addEventListener('abort', onAbort); }
      try {
        emit({ attempt: { provider: m.pid, label: m.label, model: m.model } }); attempt = m;
        let got = false;
        const base = { groq: 'https://api.groq.com/openai/v1', cerebras: 'https://api.cerebras.ai/v1', sambanova: 'https://api.sambanova.ai/v1', deepinfra: 'https://api.deepinfra.com/v1/openai', together: 'https://api.together.xyz/v1', mistral: 'https://api.mistral.ai/v1', openrouter: 'https://openrouter.ai/v1', huggingface: 'https://router.huggingface.co/v1', ollama: 'https://ollama.com/v1' }[m.pid];
        const it = m.pid === 'gemini' ? geminiStream(key, m.model, messages, ac.signal)
          : m.pid === 'pollinations' ? pollinationsStream(messages, ac.signal)
          : openaiStream(base, key, m.model, messages, ac.signal);
        for await (const t of it) { got = true; yield t; }
        if (!got) throw new Error('খালি');
        return attempt;
      } catch (e) {
        if (ac.signal.aborted) throw e;
        emit({ fail: { provider: m.pid, model: m.model, error: String(e && e.message || e).slice(0, 90) } });
      } finally {
        signal?.removeEventListener('abort', onAbort);
      }
    }
  }
  throw new Error('সব AI provider ব্যর্থ');
}

// keyless fallback: Pollinations text GET (শুধু শেষ ইউজার-বার্তা, URL-সীমার জন্য ছোট)
async function* pollinationsStream(messages, signal) {
  const last = [...messages].reverse().find((m) => m.role === 'user' && typeof m.content === 'string');
  const q = (last?.content || '').slice(0, 1500);
  if (!q.trim()) throw new Error('খালি প্রশ্ন');
  const r = await fetch('https://text.pollinations.ai/' + encodeURIComponent(q) + '?model=openai', { signal });
  if (!r.ok) throw new Error('pollinations HTTP ' + r.status);
  const t = (await r.text()).trim();
  if (!t) throw new Error('খালি উত্তর');
  yield t;
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
const PING_BASE = { groq: 'https://api.groq.com/openai/v1', cerebras: 'https://api.cerebras.ai/v1', sambanova: 'https://api.sambanova.ai/v1', deepinfra: 'https://api.deepinfra.com/v1/openai', together: 'https://api.together.xyz/v1', mistral: 'https://api.mistral.ai/v1', openrouter: 'https://openrouter.ai/api/v1', huggingface: 'https://router.huggingface.co/v1', ollama: 'https://ollama.com/v1' };
const CF_ACC = 'abb783e456e51a5d338419de93d5e576';
async function sha256hex(s) { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join(''); }
async function ownerUnlock(env, code) {
  const want = await env.AH_KV.get('owner:code_hash');
  if (!want) return { error: 'owner code সেট করা নেই' };
  if ((await sha256hex(String(code || ''))) !== want) return { error: 'ভুল কোড' };
  const sess = crypto.randomUUID();
  await env.AH_KV.put('sess:' + sess, '1', { expirationTtl: 7 * 86400 });
  return { session: sess, ttlDays: 7 };
}
async function ownerOk(env, req) {
  const t = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  if (!t) return false;
  return !!(await env.AH_KV.get('sess:' + t));
}
async function ghApi(keys, path, opts = {}) {
  const r = await fetch('https://api.github.com' + path, { method: opts.method || 'GET', headers: { Authorization: `Bearer ${keys.GITHUB_PAT}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' }, body: opts.body });
  const t = await r.text(); let j = {}; try { j = JSON.parse(t); } catch {}
  if (!r.ok) throw new Error('github HTTP ' + r.status + ': ' + String(j.message || '').slice(0, 80));
  return j;
}
async function cfApi(keys, path, opts = {}) {
  const r = await fetch('https://api.cloudflare.com/client/v4' + path, { method: opts.method || 'GET', headers: { 'X-Auth-Email': keys.CF_EMAIL, 'X-Auth-Key': keys.CF_GLOBAL_KEY, 'Content-Type': 'application/json' }, body: opts.body });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.success === false) throw new Error('cloudflare HTTP ' + r.status + ': ' + String((j.errors || [{}])[0].message || '').slice(0, 80));
  return j;
}
async function runTool(keys, tool, args) {
  switch (tool) {
    case 'gh.repos': { const j = await ghApi(keys, '/user/repos?per_page=100&sort=updated'); return { count: j.length, repos: j.map((x) => ({ name: x.name, private: x.private, updated: x.updated_at })) }; }
    case 'gh.read': { const j = await ghApi(keys, `/repos/${args.repo}/contents/${args.path}${args.ref ? '?ref=' + args.ref : ''}`); return { path: j.path, size: j.size, text: atob(String(j.content || '').replace(/\n/g, '')).slice(0, 20000) }; }
    case 'gh.commit': {
      let sha; try { sha = (await ghApi(keys, `/repos/${args.repo}/contents/${args.path}`)).sha; } catch {}
      const j = await ghApi(keys, `/repos/${args.repo}/contents/${args.path}`, { method: 'PUT', body: JSON.stringify({ message: args.message || 'agent update', content: btoa(unescape(encodeURIComponent(args.content))), sha, branch: args.branch }) });
      return { committed: true, sha: j.content && j.content.sha, url: j.content && j.content.html_url };
    }
    case 'cf.pages.deployments': { const j = await cfApi(keys, `/accounts/${CF_ACC}/pages/projects/${args.project}/deployments?per_page=${args.limit || 10}`); return { deployments: j.result.map((x) => ({ id: x.id, env: x.environment, status: (x.latest_stage || {}).status, branch: ((x.deployment_trigger || {}).metadata || {}).branch, created: x.created_on })) }; }
    case 'cf.pages.rollback': { const j = await cfApi(keys, `/accounts/${CF_ACC}/pages/projects/${args.project}/deployments/${args.deploymentId}/rollback`, { method: 'POST' }); return { rolledBack: true, id: j.result && j.result.id }; }
    case 'cf.workers': { const j = await cfApi(keys, `/accounts/${CF_ACC}/workers/scripts`); return { workers: j.result.map((w) => w.id) }; }
    case 'cf.kv.keys': { const j = await cfApi(keys, `/accounts/${CF_ACC}/storage/kv/namespaces/${args.ns}/keys?per_page=100`); return { keys: j.result.map((k) => k.name) }; }
    default: throw new Error('অজানা টুল: ' + tool);
  }
}
let _pingCache = null;
async function pingCached(keys) {
  const now = Date.now();
  if (_pingCache && now - _pingCache.ts < 60000) return _pingCache.list;
  const list = await pingProviders(keys);
  _pingCache = { ts: now, list };
  return list;
}
async function pingProviders(keys) {
  // §45 সৎ health: model-list নয় — আসল ১-টোকেন completion দিয়ে পরীক্ষা (60s cache আছে)
  const out = []; const seen = new Set();
  for (const m of MODELS) {
    if (seen.has(m.pid)) continue;
    if (!hasKey(keys, m.pid)) continue;
    seen.add(m.pid);
    const key = keys[KEYMAP[m.pid]] || '';
    try {
      let ok = false;
      if (m.pid === 'gemini') ok = (await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}&pageSize=1`)).ok;
      else if (m.pid === 'openrouter') { const ac = new AbortController(); const to = setTimeout(() => ac.abort(), 9000); const r = await fetch(`${PING_BASE.openrouter}/chat/completions`, { method: 'POST', signal: ac.signal, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` }, body: JSON.stringify({ model: m.model, stream: false, temperature: 0.6, max_tokens: 8, messages: [{ role: 'system', content: 'ping' }, { role: 'user', content: 'ping' }] }) }); clearTimeout(to); ok = r.ok; }
      else if (m.pid === 'pollinations') { const r = await fetch('https://text.pollinations.ai/' + encodeURIComponent('ping')); ok = r.ok && (await r.text()).trim().length > 0; }
      else {
        const ac = new AbortController(); const to = setTimeout(() => ac.abort(), 9000);
        const r = await fetch(`${PING_BASE[m.pid]}/chat/completions`, { method: 'POST', signal: ac.signal, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` }, body: JSON.stringify({ model: m.model, max_tokens: 1, messages: [{ role: 'user', content: 'ping' }] }) });
        clearTimeout(to); ok = r.ok;
      }
      out.push({ pid: m.pid, label: m.label, ok });
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

    /* ============ OWNER GATE + TOOL BUS (Phase 3 ভিত্তি) ============
       পাবলিক PWA — তাই টুল কখনো খোলা নয়। unlock = owner code (KV-তে hash),
       session ৭ দিন। Destructive টুল (delete) এই ভার্সনে নেই। */
    if (method === 'POST' && path === '/api/owner/unlock') {
      const b = await req.json().catch(() => ({}));
      return json(await ownerUnlock(env, b.code));
    }
    if (path === '/api/tools') {
      if (method !== 'POST') return json({ error: 'POST লাগবে' }, 405);
      if (!(await ownerOk(env, req))) return json({ error: '🔒 মালিক পরিচয় লাগবে — আগে /api/owner/unlock' }, 401);
      const b = await req.json().catch(() => ({}));
      try { return json({ ok: true, tool: b.tool, result: await runTool(keys, b.tool, b.args || {}) }); }
      catch (e) { return json({ ok: false, tool: b.tool, error: String(e.message || e).slice(0, 200) }, 500); }
    }
    if (method === 'GET' && path === '/api/config') {
      const healthy = await pingCached(keys).catch(() => []);
      const okPids = new Set(healthy.filter((p) => p.ok).map((p) => p.pid));
      const models = MODELS.filter((m) => !m.hide && hasKey(keys, m.pid) && (okPids.has(m.pid))).map((m) => ({ id: m.id, label: m.label, pid: m.pid }));
      return json({ models, features: { research: !!keys.TAVILY_API_KEY, files: true, memory: true, agent: false, github: !!keys.GITHUB_PAT, deploy: !!(keys.CF_GLOBAL_KEY && keys.CF_EMAIL), image: true, driveBackup: !!(await loadDriveCfg(env)) } });
    }

    if (method === 'GET' && path === '/api/system') {
      const providers = await pingCached(keys).catch(() => []);
      const n = providers.filter((p) => p.ok).length;
      const drv = await loadDriveCfg(env);
      return json({
        providers,
        services: [
          { name: 'AI Providers', status: providers.length ? n + '/' + providers.length + ' সক্রিয়' : 'কোনো key নেই', dot: n ? 'ok' : 'err' },
          { name: 'API Server', status: 'Operational', dot: 'ok' },
          { name: 'Web Research', status: keys.TAVILY_API_KEY ? 'Operational' : 'Setup needed', dot: keys.TAVILY_API_KEY ? 'ok' : 'warn' },
          { name: 'Storage (KV)', status: 'Operational', dot: 'ok' },
          { name: 'Drive Backup', status: drv ? 'Operational' : 'Setup needed', dot: drv ? 'ok' : 'warn' },
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
      const arch = url.searchParams.get('archived'); // ডিফল্ট: archived বাদ | ?archived=1 → শুধু archived | ?archived=all → সব
      const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '50', 10) || 50));
      const offset = Math.max(0, parseInt(url.searchParams.get('offset') || '0', 10) || 0);
      let list = data.chats;
      if (arch === '1' || arch === 'true') list = list.filter((c) => !!c.archived);
      else if (arch !== 'all') list = list.filter((c) => !c.archived);
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
      const ext = (name.split('.').pop() || '').toLowerCase();
      const isBin = BIN_EXT.includes(ext) || (typeof body.b64 === 'string' && (body.mime || '').startsWith('application/pdf'));
      if (isBin) {
        // PDF — Gemini নিজে পার্স করে। base64 KV-তে রাখি, chat/analyze-এ inline_data হিসেবে যায়।
        const b64 = (body.b64 || '').replace(/\s/g, '');
        if (!b64) return json({ error: 'ফাইলের কনটেন্ট নেই' }, 400);
        if (b64.length > MAX_B64) return json({ error: 'PDF সর্বোচ্চ ১০MB' }, 400);
        const mime = BIN_MIME[ext] || 'application/pdf';
        const id = crypto.randomUUID();
        const files = await kvGet(env, 'files', {});
        const rec = { id, name, size: b64.length, bytes: Math.floor(b64.length * 0.75), mime, type: 'binary', ts: Date.now() };
        if (await loadDriveCfg(env)) { // Drive ব্যাকআপ — ব্যর্থ হলেও আপলোড আটকায় না
          try {
            const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
            const d = await driveBackup(env, name, bin, mime);
            if (d?.id) rec.drive = { fileId: d.id, link: d.webViewLink || null, ts: Date.now() };
          } catch (e) { rec.driveError = String((e && e.message) || e).slice(0, 120); }
        }
        files[id] = rec;
        await kvSet(env, 'files', files);
        await env.AH_KV.put('fileb:' + id, b64);
        return json(rec);
      }
      const content = (body.content || '').slice(0, MAX_TEXT);
      if (!TEXT_EXT.includes(ext)) return json({ error: 'এই ফরম্যাট এখনো সাপোর্ট নেই — PDF, TXT, CSV, JSON বা কোড ফাইল দাও' }, 400);
      const id = crypto.randomUUID();
      const files = await kvGet(env, 'files', {});
      const rec = { id, name, size: content.length, type: 'text', ts: Date.now() };
      if (await loadDriveCfg(env)) { // Drive ব্যাকআপ — ব্যর্থ হলেও আপলোড আটকায় না
        try {
          const d = await driveBackup(env, name, content);
          if (d?.id) rec.drive = { fileId: d.id, link: d.webViewLink || null, ts: Date.now() };
        } catch (e) { rec.driveError = String((e && e.message) || e).slice(0, 120); }
      }
      files[id] = rec;
      await kvSet(env, 'files', files);
      await env.AH_KV.put('file:' + id, content);
      return json(rec);
    }
    if (method === 'GET' && path === '/api/storage') {
      const files = await kvGet(env, 'files', {});
      const list = Object.values(files);
      const kv = {
        files: list.length,
        bytes: list.reduce((s, f) => s + (Number(f.size) || 0), 0),
        backedUp: list.filter((f) => f.drive && f.drive.fileId).length,
      };
      const cfg = await loadDriveCfg(env);
      const drive = { configured: !!cfg, connected: false };
      if (cfg) {
        try {
          const token = await driveToken(env);
          const r = await fetch('https://www.googleapis.com/drive/v3/about?fields=storageQuota,user(emailAddress)', { headers: { Authorization: 'Bearer ' + token } });
          if (!r.ok) throw new Error('Drive about HTTP ' + r.status);
          const j = await r.json();
          const sq = j.storageQuota || {};
          drive.connected = true;
          drive.account = j.user?.emailAddress || null;
          drive.quota = { limit: Number(sq.limit) || null, usage: Number(sq.usage) || 0, usageInDrive: Number(sq.usageInDrive) || 0 };
          if (drive.quota.limit) drive.quota.percent = Math.round((drive.quota.usage / drive.quota.limit) * 1000) / 10;
          try {
            const folderId = await driveFolderId(env, token, false);
            drive.folder = { id: folderId, name: DRIVE_FOLDER_NAME };
            const q = encodeURIComponent(`'${folderId}' in parents and trashed=false`);
            const fr = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id)&pageSize=1000`, { headers: { Authorization: 'Bearer ' + token } });
            if (fr.ok) drive.backups = ((await fr.json()).files || []).length;
          } catch {}
        } catch (e) { drive.error = String((e && e.message) || e).slice(0, 160); }
      }
      return json({ kv, drive });
    }

    const mFile = path.match(/^\/api\/files\/([\w-]+)(\/(analyze|ask))?$/);
    if (mFile) {
      const files = await kvGet(env, 'files', {});
      const meta = files[mFile[1]];
      if (!meta) return json({ error: 'নেই' }, 404);
      const isBin = meta.type === 'binary' || BIN_EXT.includes((meta.name.split('.').pop() || '').toLowerCase());
      const b64 = isBin ? await env.AH_KV.get('fileb:' + mFile[1]) : null;
      const content = isBin ? null : await env.AH_KV.get('file:' + mFile[1]);
      if (method === 'GET' && !mFile[2]) {
        if (isBin && b64) {
          const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
          return new Response(bin, { headers: { 'Content-Type': meta.mime || 'application/pdf', ...cors } });
        }
        return new Response(content || '', { headers: { 'Content-Type': 'text/plain; charset=utf-8', ...cors } });
      }
      if (method === 'DELETE' && !mFile[2]) {
        delete files[mFile[1]]; await kvSet(env, 'files', files);
        await env.AH_KV.delete('file:' + mFile[1]); await env.AH_KV.delete('fileb:' + mFile[1]);
        if (meta.drive?.fileId) { try { await driveDelete(env, meta.drive.fileId); } catch {} } // Drive কপিও মুছি (best-effort)
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
        for await (const t of streamAnswer(keys, msgs, 'auto', 'balanced', () => {}, null, isBin)) ans += t;
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
      let hasMulti = !!(body.images && body.images.length);
      let extraText = '';
      const binParts = [];
      if (body.media && body.media.length) {
        const files = await kvGet(env, 'files', {});
        for (const m of body.media) {
          const meta = files[m.id];
          if (!meta) continue;
          const isBin = meta.type === 'binary' || BIN_EXT.includes((meta.name.split('.').pop() || '').toLowerCase());
          if (isBin) {
            const b64 = (await env.AH_KV.get('fileb:' + m.id)) || '';
            if (b64) { binParts.push({ type: 'image_url', image_url: { url: `data:${meta.mime || 'application/pdf'};base64,${b64}`, mime_type: meta.mime || 'application/pdf' } }); hasMulti = true; }
          } else {
            const txt = ((await env.AH_KV.get('file:' + m.id)) || '').slice(0, 50000);
            if (txt) extraText += '\n\n[সংযুক্ত ফাইল: ' + meta.name + ']\n' + txt + '\n';
          }
        }
      }
      const lastU = finalMsgs[finalMsgs.length - 1];
      if (lastU && lastU.role === 'user' && (extraText || binParts.length || (body.images && body.images.length))) {
        const parts = [];
        const baseText = (typeof lastU.content === 'string' ? lastU.content : '') + extraText;
        parts.push({ type: 'text', text: baseText });
        for (const bp of binParts) parts.push(bp);
        for (const im of (body.images || [])) {
          const mm = DATAURL.exec(im || '');
          if (!mm || mm[2].length > 4 * 1024 * 1024) continue;
          parts.push({ type: 'image_url', image_url: { url: im, mime_type: mm[1] } });
        }
        // ছবি/PDF থাকলে multimodal parts; শুধু টেক্সট ফাইল থাকলে স্ট্রিং — text-only মডেলেও চলে
        finalMsgs[finalMsgs.length - 1] = parts.length > 1
          ? { role: 'user', content: parts }
          : { role: 'user', content: baseText };
      }

      return sseStream((emit, close) => {
        (async () => {
          try {
            if (body.web) {
              const lastC = finalMsgs[finalMsgs.length - 1].content;
              const q = typeof lastC === 'string' ? lastC : lastC.filter((p) => p.type === 'text').map((p) => p.text).join(' ');
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
            for await (const tok of streamAnswer(keys, finalMsgs, body.model || 'auto', body.mode || 'balanced', emit, ac.signal, hasMulti)) {
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



