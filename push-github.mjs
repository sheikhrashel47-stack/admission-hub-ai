#!/usr/bin/env node
/**
 * push-github.mjs — GitHub-এ repo বানিয়ে কোড push (API-ভিত্তিক, টোকেন কোথাও সেভ হয় না)
 * Env: GITHUB_PAT (classic token, repo scope) · GITHUB_REPO_NAME (default admission-hub-ai)
 * শুধু whitelist করা ৭টা ফাইল যাবে — .env.local / data/ কখনোই নয়।
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const TOKEN = process.env.GITHUB_PAT || '';
const REPO_NAME = process.env.GITHUB_REPO_NAME || 'admission-hub-ai';
const ROOT = '/home/user/admission-hub-ai';

const FILES = [
  'README.md', '.env.example', '.gitignore', 'docs/ROADMAP.md',
  'lib/providers.mjs', 'server.mjs', 'web/index.html',
];

if (!TOKEN) { console.error('❌ GITHUB_PAT env নেই'); process.exit(1); }

async function api(path, opts = {}) {
  const r = await fetch('https://api.github.com' + path, {
    method: opts.method || 'GET',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const text = await r.text();
  let j = {}; try { j = JSON.parse(text); } catch {}
  if (!r.ok) throw new Error(`HTTP ${r.status}: ${JSON.stringify(j).slice(0, 250)}`);
  return j;
}

const log = (m) => console.log('→', m);

try {
  const me = await api('/user');
  log(`লগইন: ${me.login}`);

  // repo আছে কিনা
  let repoExists = true;
  try { await api(`/repos/${me.login}/${REPO_NAME}`); } catch { repoExists = false; }
  if (!repoExists) {
    await api('/user/repos', { method: 'POST', body: { name: REPO_NAME, private: true, description: 'ADMISSION HUB AI — Private AI Command Center (Phase 1 + Research). Zero-dependency, $0.' } });
    log(`private repo তৈরি: ${me.login}/${REPO_NAME}`);
  } else {
    log(`repo আগে থেকেই আছে: ${me.login}/${REPO_NAME}`); // push করবো না — নতুন ফাইল replace এড়াতে: প্রথমবারে খালি হবে
  }

  // blobs
  const blobs = [];
  for (const f of FILES) {
    const content = readFileSync(join(ROOT, f));
    const b = await api(`/repos/${me.login}/${REPO_NAME}/git/blobs`, { method: 'POST', body: { content: content.toString('base64'), encoding: 'base64' } });
    blobs.push({ f, sha: b.sha });
    log(`blob: ${f}`);
  }

  // tree (no base_tree → এক commit-এ সব)
  const tree = await api(`/repos/${me.login}/${REPO_NAME}/git/trees`, {
    method: 'POST',
    body: { tree: blobs.map((x) => ({ path: x.f, mode: '100644', type: 'blob', sha: x.sha })) },
  });

  // commit (no parents)
  const commit = await api(`/repos/${me.login}/${REPO_NAME}/git/commits`, {
    method: 'POST',
    body: {
      message: 'ADMISSION HUB AI — Phase 1: Premium Chat Foundation + Web Research\n\n- Premium branded UI (emerald, dark/light, mobile-first)\n- Model Router: AUTO task-routing + fallback (Groq/Gemini/Cerebras/Mistral)\n- Streaming SSE chat + markdown + code highlight + tables\n- Web Research (Tavily) + clickable citations + live steps\n- Files: upload/preview/analyze (text formats)\n- User Memory, chat history, branch/regenerate/export\n- Zero dependency (Node 18+)',
      tree: tree.sha,
    },
  });

  // ref main
  try {
    await api(`/repos/${me.login}/${REPO_NAME}/git/refs`, { method: 'POST', body: { ref: 'refs/heads/main', sha: commit.sha } });
  } catch (e) {
    await api(`/repos/${me.login}/${REPO_NAME}/git/refs/heads/main`, { method: 'PATCH', body: { sha: commit.sha, force: false } });
  }
  log('main branch আপডেট: ' + commit.sha.slice(0, 7));

  // default branch নিশ্চিত
  try { await api(`/repos/${me.login}/${REPO_NAME}`, { method: 'PATCH', body: { default_branch: 'main' } }); } catch {}

  // verify
  const files = await api(`/repos/${me.login}/${REPO_NAME}/contents/`);
  log(`যাচাই: ${files.length}টি ফাইল repo-তে ✓ → https://github.com/${me.login}/${REPO_NAME}`);

  // স্থায়ীভাবে নিরাপদ remote (টোকেন ছাড়া)
  console.log('\n✅ সম্পন্ন! repo: https://github.com/' + me.login + '/' + REPO_NAME);
  console.log('⚠️ এখন GitHub-এ টোকেনটা revoke করে দাও (Settings → Developer settings → Token → Delete)।');
} catch (e) {
  console.error('❌ ব্যর্থ:', e.message);
  if (/Bad credentials|401/.test(e.message)) console.error('→ টোকেন ভুল/মেয়াদ শেষ। classic token + repo scope লাগবে (github_pat_ fine-grained নয়)।');
  if (/403|Repository creation|Forbidden/.test(e.message)) console.error('→ repo বানানোর অনুমতি নেই — classic token-এ repo scope চেক করো।');
  process.exit(1);
}
