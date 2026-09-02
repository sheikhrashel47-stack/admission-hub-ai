#!/usr/bin/env node
/**
 * ADMISSION HUB AI — Private AI Command Center (Phase 1 + Research)
 * Zero-dependency Node 18+ server। চ্যাট history, files, memory, usage JSON-এ (server-side)।
 */
import http from 'node:http';
import { existsSync, readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { streamAnswer, searchWeb, FREEMODELS, summarizeChat, pingProviderStatus } from './lib/providers.mjs';
import * as storage from './lib/storage/index.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const DATA = join(ROOT, 'data');
const WEB = join(ROOT, 'web', 'index.html');
mkdirSync(join(DATA, 'files'), { recursive: true });

// ---- secrets (server-side only) ----
function loadEnv(path) {
  try {
    for (const line of readFileSync(path, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.+)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
    }
  } catch {}
}
loadEnv(join(ROOT, '.env.local'));

const PORT = process.env.PORT || 3000;
const MAX_UPLOAD = 2 * 1024 * 1024;
const MAX_B64 = 10 * 1024 * 1024;
const TEXT_EXT = ['txt', 'md', 'csv', 'json', 'html', 'htm', 'css', 'js', 'mjs', 'ts', 'tsx', 'jsx', 'xml', 'yml', 'yaml', 'sh', 'sql', 'py', 'env'];
const BIN_EXT = ['pdf'];
const BIN_MIME = { pdf: 'application/pdf' };

function loadJson(file, fallback) { try { return JSON.parse(readFileSync(join(DATA, file), 'utf8')); } catch { return fallback; } }
function saveJson(file, obj) { try { writeFileSync(join(DATA, file), JSON.stringify(obj)); } catch {} }

const store = {
  chats: loadJson('chats.json', { chats: [] }),
  memory: loadJson('memory.json', { enabled: true, notes: '', items: [] }),
  usage: loadJson('usage.json', { total: { requests: 0, tokens: 0, cost: 0 }, byModel: {} }),
};
const save = () => { saveJson('chats.json', store.chats); saveJson('memory.json', store.memory); saveJson('usage.json', store.usage); };
const now = () => Date.now();
const rateTokens = (text) => Math.max(1, Math.ceil((text || '').length / 4));

function logUsage(label, chars) {
  const tokens = rateTokens(chars);
  store.usage.total.requests += 1; store.usage.total.tokens += tokens; store.usage.total.cost += 0;
  store.usage.byModel[label] = store.usage.byModel[label] || { requests: 0, tokens: 0 };
  store.usage.byModel[label].requests += 1; store.usage.byModel[label].tokens += tokens;
  save();
}

const SYSTEM = `তুমি "ADMISSION HUB AI" — Admission Hub-এর জন্য বানানো একটি প্রিমিয়াম প্রাইভেট AI Assistant।
ভাষা: সহজ বাংলা (প্রয়োজনে ইংরেজি)। সবসময় সংক্ষিপ্ত, পরিষ্কার, গঠনমূলক উত্তর — দরকার হলে বুলেট/টেবিল/কোড ব্লক।
শুধু সত্য তথ্য দেবে; যা জানো না সেটা সৎভাবে বলবে। সাইটেশন [1] ফরম্যাটে দিলে সেগুলো সোর্স তালিকায় মিলবে।
তুমি এখন chat + research mode-এ চলছ। Agent tools, GitHub, deploy, code sandbox এখনো যুক্ত হয়নি — সেই কাজ চাইলে জানিয়ে দেবে "এখনো যুক্ত হয়নি (Phase 5+)"।

উত্তর-শৈলী (সবসময়): প্রচলিত সহজ বাংলায় সরাসরি উত্তর — অপ্রয়োজনীয় ভূমিকা/ভণিতা নয়; দরকার হলে **বোল্ড** টার্ম, টেবিল, বুলেট; সংখ্যা/তারিখ স্পষ্ট; যা নিশ্চিত নও তা সততার সাথে বলো।
যদি উপযুক্ত হয়, উত্তরের একদম শেষে ২–৩টি ফলো-আপ প্রশ্ন দিতে পারো — ঠিক এই ফরম্যাটে, এর বাইরে আর কিছু নয়:

[SUGGEST]
- প্রশ্ন ১
- প্রশ্ন ২`;

function memoryBlock() {
  if (!store.memory.enabled) return '';
  return store.memory.notes ? `\n## আমার সম্পর্কে (স্মৃতি)\n${store.memory.notes}\n` : '';
}

function fmtUser(msgs) {
  return msgs.filter((m) => m.role !== 'system').slice(-24);
}

const DATAURL = /^data:([\w.+-]+\/[\w.+-]+);base64,(.+)$/i;

/* ফাইল সংযুক্তি: টেক্সট ফাইল inline টেক্সট হিসেবে; বাইনারি (PDF) base64 → inline_data (Gemini) */
async function expandMedia(finalMsgs, media) {
  if (!media || !media.length) return finalMsgs;
  const last = finalMsgs[finalMsgs.length - 1];
  if (!last || last.role !== 'user') return finalMsgs;
  let extra = '';
  const binParts = [];
  for (const m of media) {
    const meta = fileList().find((f) => f.id === m.id);
    if (!meta) continue;
    const isBin = meta.type === 'binary' || (meta.name.split('.').pop() || '').toLowerCase() === 'pdf';
    if (isBin) {
      let b64 = '';
      try { b64 = readFileSync(join(DATA, 'files', meta.id + '.b64'), 'utf8'); } catch {}
      if (!b64) { try { const buf = await storage.get(`${meta.id}__${meta.name}`).catch(() => null); if (buf) { b64 = Buffer.from(buf).toString('base64'); try { writeFileSync(join(DATA, 'files', meta.id + '.b64'), b64); } catch {} } } catch {} }
      if (b64) binParts.push({ type: 'image_url', image_url: { url: `data:${meta.mime || 'application/pdf'};base64,${b64}`, mime_type: meta.mime || 'application/pdf' } });
      continue;
    }
    let txt = ''; try { txt = readFileSync(join(DATA, 'files', meta.id + '.txt'), 'utf8'); } catch {}
    if (!txt) { try { const buf = await storage.get(`${meta.id}__${meta.name}`).catch(() => null); if (buf) { txt = new TextDecoder().decode(buf); try { writeFileSync(join(DATA, 'files', meta.id + '.txt'), txt); } catch {} } } catch {} }
    if (txt) extra += `\n\n[সংযুক্ত ফাইল: ${meta.name}]\n${txt.slice(0, 50000)}\n`;
  }
  if (!extra && !binParts.length) return finalMsgs;
  const out = [...finalMsgs];
  if (binParts.length) {
    const parts = [{ type: 'text', text: (typeof last.content === 'string' ? last.content : '') + extra }, ...binParts];
    out[out.length - 1] = { role: 'user', content: parts };
  } else {
    out[out.length - 1] = { role: 'user', content: last.content + extra };
  }
  return out;
}

function expandImages(finalMsgs, images) {
  if (!images || !images.length) return finalMsgs;
  const last = finalMsgs[finalMsgs.length - 1];
  if (!last || last.role !== 'user') return finalMsgs;
  const base = typeof last.content === 'string'
    ? last.content
    : last.content.filter((p) => p.type === 'text').map((p) => p.text).join('\n');
  const parts = [{ type: 'text', text: base }];
  // expandMedia ইতিমধ্যে বাইনারি পার্ট যোগ করে থাকলে সেগুলো রাখি
  if (Array.isArray(last.content)) for (const p of last.content) if (p.type === 'image_url') parts.push(p);
  for (const im of images) {
    const m = DATAURL.exec(im || '');
    if (!m || m[2].length > 4 * 1024 * 1024) continue;
    parts.push({ type: 'image_url', image_url: { url: im, mime_type: m[1] } });
  }
  if (parts.length < 2) return finalMsgs;
  const out = [...finalMsgs];
  out[out.length - 1] = { role: 'user', content: parts };
  return out;
}

const CTX_TAIL = 24, CTX_TRIGGER = 48;
async function ensureSummary(c) {
  /* লম্বা চ্যাট → পুরোনো অংশ সারাংশে ডেকে কনটেক্সট ছোট রাখা (Phase 2) */
  if (!c) return null;
  const msgs = (c.messages || []).filter((m) => m.role !== 'system' && !(m.partial && !m.content));
  if (msgs.length < CTX_TRIGGER) return c.summary ? c.summary.text : null;
  const needUpTo = msgs.length - CTX_TAIL;
  if (c.summary && c.summary.upTo && c.summary.upTo >= needUpTo - 8) return c.summary.text;
  const from = (c.summary && c.summary.upTo) || 0;
  const lines = msgs.slice(Math.max(0, from), needUpTo).map((m) => (m.role === 'user' ? 'প্রশ্ন: ' : 'উত্তর: ') + (typeof m.content === 'string' ? m.content : ''));
  try {
    const txt = await summarizeChat(lines.slice(-60), c.summary ? c.summary.text : null);
    if (txt) { c.summary = { text: txt, upTo: needUpTo, ts: now() }; save(); if (process.env.DBG) console.log('[ctx] summary built upTo=', needUpTo); return txt; }
  } catch (e) { if (process.env.DBG) console.log('[ctx] summary ব্যর্থ:', e.message); }
  return c.summary ? c.summary.text : null;
}
function parseSuggestions(ans) {
  const m = /(?:\n|^)\[SUGGEST\]\s*\n((?:[-*] .*\n?)+)\s*$/.exec(ans);
  if (!m) return { text: ans, list: null };
  const list = m[1].split('\n').map((x) => x.replace(/^[-*]\s*/, '').trim()).filter(Boolean).slice(0, 3);
  return { text: ans.slice(0, m.index).trimEnd(), list: list.length ? list : null };
}

async function runChat({ messages, model, mode, web, signal, emit, media, images, summary }) {
  // base system + memory
  let finalMsgs = await expandImages(await expandMedia([{ role: 'system', content: SYSTEM + memoryBlock() + (summary ? '\n\n## এ পর্যন্ত কথোপকথনের সারাংশ (পুরোনো অংশ)\n' + summary : '') }, ...fmtUser(messages)], media), images);
  const meta = { model: null, provider: null, mode, seconds: 0, tokens: 0 };
  const t0 = now();
  try {
    let answer = '';
    let sources = [];

    if (web) {
      const q = finalMsgs[finalMsgs.length - 1].content;
      emit({ step: 'SEARCHING' });
      sources = await searchWeb(q, 5);
      if (!sources.length) throw new Error('ওয়েব সার্চে কোনো ফলাফল পাওয়া যায়নি');
      emit({ sources });
      emit({ step: 'READING' });
      const ctx = sources.map((s) => `[${s.n}] ${s.title}\nURL: ${s.url}\n${s.content}`).join('\n\n');
      const last = finalMsgs.pop();
      finalMsgs.push({ role: 'system', content: `নিচের ওয়েব সোর্সগুলো থেকে প্রশ্নের উত্তর দাও। প্রতিটি দাবির সাথে [1] ধাঁচে সোর্স নম্বর উল্লেখ করো।\n\n${ctx}` });
      finalMsgs.push(last);
      emit({ step: 'ANALYZING' });
    }

    let attempt = null;
    for await (const tok of streamAnswer(finalMsgs, { model, mode, signal, onAttempt: (a) => { emit({ attempt: a }); attempt = a; } })) {
      if (signal.aborted) break;
      answer += tok;
      emit({ token: tok });
    }
    if (!answer) throw new Error('AI থেকে খালি উত্তর এসেছে');
    const parsed = parseSuggestions(answer);
    answer = parsed.text;
    meta.model = attempt?.model || model;
    meta.provider = attempt?.provider || '';
    meta.seconds = Math.round((now() - t0) / 100) / 10;
    meta.tokens = rateTokens(answer) + rateTokens(finalMsgs.map((m) => m.content).join(''));
    if (attempt) logUsage(attempt.label, answer);
    emit({ done: true, meta, sources, suggestions: parsed.list });
    return { answer, meta, sources, suggestions: parsed.list };
  } catch (e) {
    if (signal.aborted) { emit({ abort: true }); return null; }
    emit({ stopped: true, error: String(e.message || 'অজানা সমস্যা').slice(0, 250) });
    return null;
  }
}

function readBody(req) {
  return new Promise((resolve) => {
    let b = '';
    req.on('data', (c) => { b += c; if (b.length > 4e6) { req.destroy(); resolve(''); return; } });
    req.on('end', () => resolve(b));
    req.on('error', () => resolve(''));
  });
}

function openSSE(res) {
  res.writeHead(200, { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
  return (ev) => { try { res.write(`data: ${JSON.stringify(ev)}\n\n`); } catch {} };
}

const KEYMAP = { groq: 'GROQ_API_KEY', gemini: 'GEMINI_API_KEY', cerebras: 'CEREBRAS_API_KEY', mistral: 'MISTRAL_API_KEY', openrouter: 'OPENROUTER_API_KEY' };
const allowedFile = (name) => TEXT_EXT.includes((name || '').split('.').pop().toLowerCase());
const fileList = () => loadJson('files.json', []);

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  const path = url.pathname;
  // CORS (GitHub Pages → backend সহ সব ক্রস-অরিজিন)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
  const json = (code, obj) => { res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(obj)); };

  try {
    // static PWA assets (manifest, sw, icons) — web/ ফোল্ডার
    const staticPaths = ['/manifest.webmanifest', '/sw.js', '/index.html', '/'];
    if (req.method === 'GET' && (staticPaths.includes(path) || path.startsWith('/icons/'))) {
      const p = path === '/' ? '/index.html' : path;
      const file = join(ROOT, 'web', p);
      if (!existsSync(file)) return json(404, { error: 'নেই' });
      const types = { '.html': 'text/html; charset=utf-8', '.webmanifest': 'application/manifest+json', '.js': 'application/javascript; charset=utf-8', '.png': 'image/png' };
      const ext = file.slice(file.lastIndexOf('.'));
      res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
      return res.end(readFileSync(file));
    }

    if (req.method === 'GET' && (path === '/' || path === '/index.html')) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(readFileSync(WEB));
    }

    if (req.method === 'GET' && path === '/api/health') return json(200, { ok: true, ts: now() });

    if (req.method === 'GET' && path === '/api/system') {
      const modelCount = FREEMODELS.filter((m) => process.env[KEYMAP[m.pid]]).length;
      const providers = await pingProviderStatus().catch(() => []);
      return json(200, {
        providers,
        services: [
          { name: 'AI Providers', status: modelCount ? `${modelCount} সক্রিয়` : 'কোনো key নেই', dot: modelCount ? 'ok' : 'err' },
          { name: 'API Server', status: 'Operational', dot: 'ok' },
          { name: 'Web Research', status: process.env.TAVILY_API_KEY ? 'Operational' : 'Setup needed', dot: process.env.TAVILY_API_KEY ? 'ok' : 'warn' },
          { name: 'Storage', status: 'Operational', dot: 'ok' },
          { name: 'Agent Engine', status: 'Phase 5-এ আসবে', dot: 'off' },
        ],
        deployments: [],
      });
    }

    if (req.method === 'GET' && path === '/api/config') {
      const models = FREEMODELS.filter((m) => process.env[KEYMAP[m.pid]]).map((m) => ({ id: m.id, label: m.label, pid: m.pid }));
      return json(200, { models, features: { research: !!process.env.TAVILY_API_KEY, files: true, memory: true, agent: false, github: false, deploy: false, image: true } });
    }

    if (req.method === 'GET' && path === '/api/chats') {
      const q = (url.searchParams.get('q') || '').toLowerCase().trim();
      const dateF = (url.searchParams.get('date') || '').trim();
      const proj = url.searchParams.get('project') || '';
      const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '50', 10) || 50));
      const offset = Math.max(0, parseInt(url.searchParams.get('offset') || '0', 10) || 0);
      const raw = store.chats.chats;
      let list = raw;
      if (proj) list = list.filter((c) => c.project === proj);
      if (q) list = list.filter((c) => (c.title || '').toLowerCase().includes(q) || (c.messages || []).some((m) => m.role !== 'system' && String(m.content || '').toLowerCase().includes(q)));
      if (dateF) {
        const d0 = new Date(dateF + 'T00:00:00').getTime(); const d1 = d0 + 86400000;
        if (!isNaN(d0)) list = list.filter((c) => (c.updatedAt >= d0 && c.updatedAt < d1) || (c.createdAt >= d0 && c.createdAt < d1));
      }
      list = list.map((c) => ({ id: c.id, title: c.title, project: c.project, pinned: !!c.pinned, archived: !!c.archived, createdAt: c.createdAt, updatedAt: c.updatedAt, n: (c.messages || []).filter((m) => m.role !== 'system').length }));
      list.sort((a, b) => (b.pinned - a.pinned) || (b.updatedAt - a.updatedAt));
      return json(200, list.slice(offset, offset + limit));
    }

    if (req.method === 'POST' && path === '/api/chats') {
      let body = {}; try { body = JSON.parse(await readBody(req)); } catch {}
      const c = { id: randomUUID(), title: (body.title || 'নতুন চ্যাট').slice(0, 60), project: body.project || 'সাধারণ', pinned: false, archived: false, createdAt: now(), updatedAt: now(), messages: [] };
      store.chats.chats.unshift(c); save();
      return json(200, c);
    }

    const mChat = path.match(/^\/api\/chats\/([\w-]+)$/);
    if (mChat) {
      const c = store.chats.chats.find((x) => x.id === mChat[1]);
      if (req.method === 'GET') {
        if (!c) return json(404, { error: 'চ্যাট পাওয়া যায়নি' });
        const { messages, ...meta } = c;
        return json(200, { ...meta, total: (c.messages || []).length });
      }
      if (req.method === 'DELETE') { store.chats.chats = store.chats.chats.filter((x) => x.id !== mChat[1]); save(); return json(200, { ok: true }); }
      if (req.method === 'PATCH') {
        if (!c) return json(404, { error: 'চ্যাট পাওয়া যায়নি' });
        let body = {}; try { body = JSON.parse(await readBody(req)); } catch {}
        for (const k of ['title', 'project', 'pinned', 'archived']) if (k in body) c[k] = body[k];
        c.updatedAt = now(); save();
        return json(200, c);
      }
    }

    const mMessages = path.match(/^\/api\/chats\/([\w-]+)\/messages$/);
    if (req.method === 'GET' && mMessages) {
      const c = store.chats.chats.find((x) => x.id === mMessages[1]);
      if (!c) return json(404, { error: 'চ্যাট পাওয়া যায়নি' });
      const msgs = c.messages || [];
      const limit = Math.min(200, Math.max(1, parseInt(url.searchParams.get('limit') || '60', 10) || 60));
      const offset = Math.max(0, parseInt(url.searchParams.get('offset') || '0', 10) || 0);
      return json(200, { total: msgs.length, messages: msgs.slice(offset, offset + limit) });
    }

    const mSearchMsg = path.match(/^\/api\/chats\/([\w-]+)\/search$/);
    if (req.method === 'GET' && mSearchMsg) {
      const c = store.chats.chats.find((x) => x.id === mSearchMsg[1]);
      if (!c) return json(404, { error: 'চ্যাট পাওয়া যায়নি' });
      const q = (url.searchParams.get('q') || '').toLowerCase().trim();
      if (!q) return json(200, { hits: [] });
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
      return json(200, { hits: hits.slice(0, 100) });
    }

    const mBr = path.match(/^\/api\/chats\/([\w-]+)\/branch$/);
    if (req.method === 'POST' && mBr) {
      const c = store.chats.chats.find((x) => x.id === mBr[1]);
      let body = {}; try { body = JSON.parse(await readBody(req)); } catch {}
      if (!c) return json(404, { error: 'চ্যাট পাওয়া যায়নি' });
      const idx = Math.max(0, Math.min(Number(body.index) || c.messages.length - 1, c.messages.length));
      const nchat = { id: randomUUID(), title: c.title + ' · branch', project: c.project, pinned: false, archived: false, createdAt: now(), updatedAt: now(), messages: c.messages.slice(0, idx) };
      store.chats.chats.unshift(nchat); save();
      return json(200, nchat);
    }

    const mRe = path.match(/^\/api\/chats\/([\w-]+)\/regenerate$/);

    if (req.method === 'POST' && (path === '/api/chat' || mRe)) {
      let chatId = null, body = {};
      try { body = JSON.parse(await readBody(req)); } catch {}
      if (mRe) chatId = mRe[1]; else chatId = body.chatId || null;
      const c = store.chats.chats.find((x) => x.id === chatId);
      let msgs = c ? c.messages : [];
      let ncOut = null;
      let popped = null;
      if (mRe) {
        if (!c) return json(404, { error: 'চ্যাট পাওয়া যায়নি' });
        while (msgs.length && msgs[msgs.length - 1].role === 'assistant') popped = msgs.pop();
        if (!msgs.some((m) => m.role === 'user')) return json(400, { error: 'উত্তর দেওয়ার মতো প্রশ্ন নেই' });
      } else {
        const msg = (body.message || '').trim();
        if (!msg) return json(400, { error: 'খালি বার্তা' });
        let nc = c;
        ncOut = nc;
        if (!nc) {
          nc = { id: randomUUID(), title: msg.slice(0, 42) + (msg.length > 42 ? '…' : ''), project: body.project || 'সাধারণ', pinned: false, archived: false, createdAt: now(), updatedAt: now(), messages: [] };
          store.chats.chats.unshift(nc);
        }
        nc.messages.push({ role: 'user', content: msg, ts: now(), media: body.media || null, images: body.images || null });
        msgs = nc.messages;
      }
      /* partial-stream persistence: placeholder আগেই সেভ হয়, সংযোগ কাটলে অংশটুকু রাখা হয় */
      msgs.push({ role: 'assistant', content: '', partial: true, ts: now() });
      const ctxMsgs = msgs.filter((m) => !(m.partial && !m.content));
      const rawEmit = openSSE(res);
      let acc = '', finalized = false;
      const emit = (ev) => { if (ev.token) acc += ev.token; rawEmit(ev); };
      const ac = new AbortController();
      res.on('close', () => {
        ac.abort();
        const ch = store.chats.chats.find((x) => x.id === (c ? c.id : (ncOut ? ncOut.id : null)));
        if (ch && !finalized) {
          const last = (ch.messages || [])[ch.messages.length - 1];
          if (acc) {
            if (last && last.partial) { last.content = acc; last.ts = now(); }
            else { ch.messages.push({ role: 'assistant', content: acc, partial: true, ts: now() }); }
          } else if (popped) {
            /* রিজেনারেশন ব্যর্থ → পুরোনো উত্তর ফেরত (ডেটা ক্ষতি হয় না) */
            if (last && last.partial) { Object.assign(last, popped); last.partial = true; }
            else ch.messages.push({ ...popped, partial: true });
          }
          ch.updatedAt = now(); save();
        }
      });
      const summary = await ensureSummary(c || ncOut);
      const out = await runChat({ messages: ctxMsgs, model: body.model || 'auto', mode: body.mode || 'balanced', web: !!body.web, signal: ac.signal, emit, media: body.media || null, images: body.images || null, summary });
      if (out) {
        const ph = msgs[msgs.length - 1];
        if (ph && ph.partial) {
          ph.content = out.answer; ph.partial = false; ph.ts = now();
          ph.model = out.meta.provider + ' · ' + out.meta.model; ph.mode = body.mode; ph.meta = out.meta; ph.sources = out.sources || []; ph.suggestions = out.suggestions || null;
        } else {
          msgs.push({ role: 'assistant', content: out.answer, ts: now(), model: out.meta.provider + ' · ' + out.meta.model, mode: body.mode, meta: out.meta, sources: out.sources || [], suggestions: out.suggestions || null });
        }
        finalized = true;
      }
      /* ব্যর্থ হলেও user বার্তা + placeholder সংরক্ষিত থাকে */
      const tgt = c || ncOut;
      if (tgt) tgt.updatedAt = now();
      save();
      try { res.end(); } catch {}
      return;
    }

    if (req.method === 'GET' && path === '/api/memory') return json(200, store.memory);
    if (req.method === 'PUT' && path === '/api/memory') {
      let body = {}; try { body = JSON.parse(await readBody(req)); } catch {}
      if (typeof body.enabled === 'boolean') store.memory.enabled = body.enabled;
      if (typeof body.notes === 'string') store.memory.notes = body.notes.slice(0, 4000);
      save(); return json(200, store.memory);
    }

    if (req.method === 'GET' && path === '/api/files') return json(200, fileList().sort((a, b) => b.ts - a.ts));
    if (req.method === 'POST' && path === '/api/files') {
      let body = {}; try { body = JSON.parse(await readBody(req)); } catch {}
      const name = (body.name || 'file.txt').slice(0, 100);
      const ext = (name.split('.').pop() || '').toLowerCase();
      const isBin = BIN_EXT.includes(ext) || (typeof body.b64 === 'string' && (body.mime || '').startsWith('application/pdf'));
      const meta = { id: randomUUID(), name, ts: now() };
      if (isBin) {
        // PDF — Gemini নিজে পার্স করে; base64 ডিস্কে রাখি (chat/analyze-এ inline_data)
        const b64 = (body.b64 || '').replace(/\s/g, '');
        if (!b64) return json(400, { error: 'ফাইলের কনটেন্ট নেই' });
        if (b64.length > MAX_B64) return json(400, { error: 'PDF সর্বোচ্চ ১০MB' });
        const mime = BIN_MIME[ext] || 'application/pdf';
        Object.assign(meta, { size: b64.length, bytes: Math.floor(b64.length * 0.75), mime, type: 'binary' });
        writeFileSync(join(DATA, 'files', meta.id + '.b64'), b64);
        if (storage.primary() === 'gdrive') {
          try {
            const bin = Buffer.from(b64, 'base64');
            const r = await storage.put(`${meta.id}__${name}`, bin, { contentType: mime });
            meta.cloud = { provider: r.provider, account: r.account ?? null };
          } catch (e) { meta.cloudError = String(e.message).slice(0, 120); }
        }
        const list = fileList(); list.unshift(meta); saveJson('files.json', list);
        return json(200, meta);
      }
      const content = (body.content || '').slice(0, MAX_UPLOAD);
      if (!allowedFile(name)) return json(400, { error: 'এই ফরম্যাট এখনো সাপোর্ট হয় না — PDF, txt/md/csv/json/html/css/js/ts OK।' });
      Object.assign(meta, { size: content.length, type: 'text' });
      // ডিস্কে সবসময় (দ্রুত পড়া/বিশ্লেষণের জন্য) …
      writeFileSync(join(DATA, 'files', meta.id + '.txt'), content);
      // … আর ক্লাউডে ব্যাকআপ (Drive)। ব্যর্থ হলেও আপলোড ব্যর্থ হবে না।
      if (storage.primary() === 'gdrive') {
        try {
          const r = await storage.put(`${meta.id}__${name}`, content, { contentType: 'text/plain' });
          meta.cloud = { provider: r.provider, account: r.account ?? null };
        } catch (e) {
          meta.cloudError = String(e.message).slice(0, 120);
        }
      }
      const list = fileList(); list.unshift(meta); saveJson('files.json', list);
      return json(200, meta);
    }

    // স্টোরেজ স্বাস্থ্য — UI-র সিস্টেম স্ট্যাটাসে দেখানোর জন্য
    if (req.method === 'GET' && path === '/api/storage') {
      return json(200, await storage.health());
    }

    const mFile = path.match(/^\/api\/files\/([\w-]+)(\/(analyze|ask))?$/);
    if (mFile) {
      const meta = fileList().find((f) => f.id === mFile[1]);
      if (!meta) return json(404, { error: 'ফাইল পাওয়া যায়নি' });
      const isBin = meta.type === 'binary' || (meta.name.split('.').pop() || '').toLowerCase() === 'pdf';
      // ডিস্কে না পেলে ক্লাউড ব্যাকআপ থেকে পুনরুদ্ধার
      let content = null, b64 = null;
      if (isBin) {
        const b64Path = join(DATA, 'files', meta.id + '.b64');
        if (existsSync(b64Path)) b64 = readFileSync(b64Path, 'utf8');
        else {
          const buf = await storage.get(`${meta.id}__${meta.name}`).catch(() => null);
          if (!buf) return json(404, { error: 'ফাইলের কনটেন্ট পাওয়া যায়নি (ডিস্ক ও ক্লাউড দুটোতেই নেই)' });
          b64 = Buffer.from(buf).toString('base64');
          try { writeFileSync(b64Path, b64); } catch {}
        }
      } else {
        const diskPath = join(DATA, 'files', meta.id + '.txt');
        if (existsSync(diskPath)) {
          content = readFileSync(diskPath, 'utf8');
        } else {
          const buf = await storage.get(`${meta.id}__${meta.name}`).catch(() => null);
          if (!buf) return json(404, { error: 'ফাইলের কনটেন্ট পাওয়া যায়নি (ডিস্ক ও ক্লাউড দুটোতেই নেই)' });
          content = new TextDecoder().decode(buf);
          try { writeFileSync(diskPath, content); } catch {} // ক্যাশ করে রাখি
        }
      }
      if (req.method === 'GET' && !mFile[2]) {
        if (isBin) {
          res.writeHead(200, { 'Content-Type': meta.mime || 'application/pdf' });
          return res.end(Buffer.from(b64, 'base64'));
        }
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end(content);
      }
      if (req.method === 'DELETE' && !mFile[2]) {
        rmSync(join(DATA, 'files', meta.id + '.txt'), { force: true });
        rmSync(join(DATA, 'files', meta.id + '.b64'), { force: true });
        // ক্লাউড কপিও মুছি — কোথাও অনাথ ফাইল পড়ে থাকবে না
        if (meta.cloud) {
          try { await storage.del(`${meta.id}__${meta.name}`); } catch {}
        }
        saveJson('files.json', fileList().filter((f) => f.id !== meta.id));
        return json(200, { ok: true });
      }
      if (req.method === 'POST') {
        let body = {}; try { body = JSON.parse(await readBody(req)); } catch {}
        const q = mFile[2] === 'ask' ? (body.question || 'এই ফাইল সম্পর্কে কী জানো?') : 'এই ফাইলের সম্পূর্ণ বিশ্লেষণ দাও: মূল বিষয়, গঠন, গুরুত্বপূর্ণ অংশ, সম্ভাব্য সমস্যা, সংক্ষিপ্ত সারাংশ।';
        const msgs = isBin
          ? [{ role: 'system', content: 'তুমি একটি ফাইল বিশ্লেষক। সংযুক্ত ফাইলের উপর ভিত্তি করে প্রশ্নের উত্তর দাও, সংক্ষিপ্ত ও নির্ভুল।' },
             { role: 'user', content: [{ type: 'text', text: `ফাইল: ${meta.name}\nপ্রশ্ন: ${q}` }, { type: 'image_url', image_url: { url: `data:${meta.mime || 'application/pdf'};base64,${b64}`, mime_type: meta.mime || 'application/pdf' } }] }]
          : [{ role: 'system', content: 'তুমি একটি ফাইল বিশ্লেষক। নিচের ফাইলের উপর ভিত্তি করে প্রশ্নের উত্তর দাও, সংক্ষিপ্ত ও নির্ভুল।' },
             { role: 'user', content: `ফাইল: ${meta.name}\n\n${content.slice(0, 50000)}\n\nপ্রশ্ন: ${q}` }];
        let ans = '';
        for await (const tok of streamAnswer(msgs, { model: 'auto', mode: 'balanced', images: isBin })) ans += tok;
        logUsage('File Analyze', ans);
        return json(200, { answer: ans });
      }
    }

    if (req.method === 'GET' && path === '/api/usage') return json(200, store.usage);

    return json(404, { error: 'পাওয়া যায়নি' });
  } catch (e) {
    return json(500, { error: 'কিছু একটা ভুল হয়েছে। আবার চেষ্টা করো।' });
  }
});

function findChatIdFor(msgs) { return null; } // safety no-op

server.listen(PORT, '0.0.0.0', () => console.log(`✅ ADMISSION HUB AI চালু → http://0.0.0.0:${PORT}`));
