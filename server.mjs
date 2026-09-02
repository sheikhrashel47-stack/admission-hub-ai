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
import { streamAnswer, searchWeb, FREEMODELS } from './lib/providers.mjs';

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
const TEXT_EXT = ['txt', 'md', 'csv', 'json', 'html', 'htm', 'css', 'js', 'mjs', 'ts', 'tsx', 'jsx', 'xml', 'yml', 'yaml', 'sh', 'sql', 'py', 'env'];

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
তুমি এখন chat + research mode-এ চলছ। Agent tools, GitHub, deploy, code sandbox এখনো যুক্ত হয়নি — সেই কাজ চাইলে জানিয়ে দেবে "এখনো যুক্ত হয়নি (Phase 5+)"।`;

function memoryBlock() {
  if (!store.memory.enabled) return '';
  return store.memory.notes ? `\n## আমার সম্পর্কে (স্মৃতি)\n${store.memory.notes}\n` : '';
}

function fmtUser(msgs) {
  return msgs.filter((m) => m.role !== 'system').slice(-24);
}

async function expandMedia(finalMsgs, media) {
  if (!media || !media.length) return finalMsgs;
  const last = finalMsgs[finalMsgs.length - 1];
  if (!last || last.role !== 'user') return finalMsgs;
  let extra = '';
  for (const m of media) {
    const meta = fileList().find((f) => f.id === m.id);
    if (!meta) continue;
    let txt = ''; try { txt = readFileSync(join(DATA, 'files', meta.id + '.txt'), 'utf8'); } catch {}
    if (!txt) continue;
    extra += `\n\n[সংযুক্ত ফাইল: ${meta.name}]\n${txt.slice(0, 50000)}\n`;
  }
  if (!extra) return finalMsgs;
  const out = [...finalMsgs];
  out[out.length - 1] = { role: 'user', content: last.content + extra };
  return out;
}

async function runChat({ messages, model, mode, web, signal, emit, media }) {
  // base system + memory
  let finalMsgs = await expandMedia([{ role: 'system', content: SYSTEM + memoryBlock() }, ...fmtUser(messages)], media);
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
    meta.model = attempt?.model || model;
    meta.provider = attempt?.provider || '';
    meta.seconds = Math.round((now() - t0) / 100) / 10;
    meta.tokens = rateTokens(answer) + rateTokens(finalMsgs.map((m) => m.content).join(''));
    if (attempt) logUsage(attempt.label, answer);
    emit({ done: true, meta, sources });
    return { answer, meta, sources };
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
      return json(200, {
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
      return json(200, { models, features: { research: !!process.env.TAVILY_API_KEY, files: true, memory: true, agent: false, github: false, deploy: false, image: false } });
    }

    if (req.method === 'GET' && path === '/api/chats') {
      const q = (url.searchParams.get('q') || '').toLowerCase();
      const proj = url.searchParams.get('project') || '';
      let list = store.chats.chats.map((c) => ({ id: c.id, title: c.title, project: c.project, pinned: !!c.pinned, archived: !!c.archived, createdAt: c.createdAt, updatedAt: c.updatedAt, n: (c.messages || []).filter((m) => m.role !== 'system').length }));
      if (proj) list = list.filter((c) => c.project === proj);
      if (q) list = list.filter((c) => (c.title || '').toLowerCase().includes(q));
      list.sort((a, b) => (b.pinned - a.pinned) || (b.updatedAt - a.updatedAt));
      return json(200, list.slice(0, 300));
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
      if (req.method === 'GET') return c ? json(200, c) : json(404, { error: 'চ্যাট পাওয়া যায়নি' });
      if (req.method === 'DELETE') { store.chats.chats = store.chats.chats.filter((x) => x.id !== mChat[1]); save(); return json(200, { ok: true }); }
      if (req.method === 'PATCH') {
        if (!c) return json(404, { error: 'চ্যাট পাওয়া যায়নি' });
        let body = {}; try { body = JSON.parse(await readBody(req)); } catch {}
        for (const k of ['title', 'project', 'pinned', 'archived']) if (k in body) c[k] = body[k];
        c.updatedAt = now(); save();
        return json(200, c);
      }
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
      if (mRe) {
        if (!c) return json(404, { error: 'চ্যাট পাওয়া যায়নি' });
        while (msgs.length && msgs[msgs.length - 1].role === 'assistant') msgs.pop();
        if (!msgs.some((m) => m.role === 'user')) return json(400, { error: 'উত্তর দেওয়ার মতো প্রশ্ন নেই' });
      } else {
        const msg = (body.message || '').trim();
        if (!msg) return json(400, { error: 'খালি বার্তা' });
        let nc = c;
        if (!nc) {
          nc = { id: randomUUID(), title: msg.slice(0, 42) + (msg.length > 42 ? '…' : ''), project: body.project || 'সাধারণ', pinned: false, archived: false, createdAt: now(), updatedAt: now(), messages: [] };
          store.chats.chats.unshift(nc);
        }
        nc.messages.push({ role: 'user', content: msg, ts: now(), media: body.media || null });
        msgs = nc.messages;
      }
      const emit = openSSE(res);
      const ac = new AbortController();
      res.on('close', () => ac.abort());
      const out = await runChat({ messages: msgs, model: body.model || 'auto', mode: body.mode || 'balanced', web: !!body.web, signal: ac.signal, emit, media: body.media || null });
      if (out) {
        msgs.push({ role: 'assistant', content: out.answer, ts: now(), model: out.meta.provider + ' · ' + out.meta.model, mode: body.mode, meta: out.meta, sources: out.sources || [] });
        const fc = store.chats.chats.find((x) => x.id === (c ? c.id : msgs[0] && findChatIdFor(msgs)));
        if (c) { c.updatedAt = now(); }
        save();
      }
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
      const content = (body.content || '').slice(0, MAX_UPLOAD);
      if (!allowedFile(name)) return json(400, { error: 'এই ফরম্যাট এখনো সাপোর্ট হয় না — txt/md/csv/json/html/css/js/ts OK। PDF/DOCX Phase 3-এ।' });
      const meta = { id: randomUUID(), name, size: content.length, type: 'text', ts: now() };
      writeFileSync(join(DATA, 'files', meta.id + '.txt'), content);
      const list = fileList(); list.unshift(meta); saveJson('files.json', list);
      return json(200, meta);
    }

    const mFile = path.match(/^\/api\/files\/([\w-]+)(\/(analyze|ask))?$/);
    if (mFile) {
      const meta = fileList().find((f) => f.id === mFile[1]);
      if (!meta) return json(404, { error: 'ফাইল পাওয়া যায়নি' });
      const content = readFileSync(join(DATA, 'files', meta.id + '.txt'), 'utf8');
      if (req.method === 'GET' && !mFile[2]) {
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end(content);
      }
      if (req.method === 'DELETE' && !mFile[2]) {
        rmSync(join(DATA, 'files', meta.id + '.txt'), { force: true });
        saveJson('files.json', fileList().filter((f) => f.id !== meta.id));
        return json(200, { ok: true });
      }
      if (req.method === 'POST') {
        let body = {}; try { body = JSON.parse(await readBody(req)); } catch {}
        const q = mFile[2] === 'ask' ? (body.question || 'এই ফাইল সম্পর্কে কী জানো?') : 'এই ফাইলের সম্পূর্ণ বিশ্লেষণ দাও: মূল বিষয়, গঠন, গুরুত্বপূর্ণ অংশ, সম্ভাব্য সমস্যা, সংক্ষিপ্ত সারাংশ।';
        const msgs = [{ role: 'system', content: 'তুমি একটি ফাইল বিশ্লেষক। নিচের ফাইলের উপর ভিত্তি করে প্রশ্নের উত্তর দাও, সংক্ষিপ্ত ও নির্ভুল।' },
        { role: 'user', content: `ফাইল: ${meta.name}\n\n${content.slice(0, 50000)}\n\nপ্রশ্ন: ${q}` }];
        let ans = '';
        for await (const tok of streamAnswer(msgs, { model: 'auto', mode: 'balanced' })) ans += tok;
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
