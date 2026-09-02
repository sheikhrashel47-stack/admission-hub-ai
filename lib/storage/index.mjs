/**
 * Storage abstraction — provider-নিরপেক্ষ put / get / list / del / health
 *
 * নীতি (§45 — যা নেই তা দেখানো যাবে না):
 *   • যে provider-এর key নেই সেটা চেইনে ঢোকেই না
 *   • কোনো provider "কাজ করছে" বলে ভান করে না — health() সত্যি বলে
 *   • কোনো ব্যর্থতা নীরবে গিলে ফেলা হয় না — put() সব এরর একসাথে জানায়
 *
 * সক্রিয় চেইন (অগ্রাধিকার ক্রমে):
 *   gdrive → Google Drive · কার্ড লাগে না · ১৫GB/অ্যাকাউন্ট · ✅ চালু
 *   local  → ডিস্ক · কোনো key লাগে না · fallback
 *
 * ভবিষ্যতের slot (adapter + key দিলেই যুক্ত হবে):
 *   b2         → Backblaze B2, ১০GB, কার্ড লাগে না
 *   cloudinary → ছবি/থাম্বনেইল, ~২৫ ক্রেডিট/মাস
 *   r2         → Cloudflare R2 ⚠️ কার্ড ভেরিফিকেশন লাগে (তাই এখন বাদ)
 *   mega       → ⚠️ OAuth নেই, পাসওয়ার্ড লাগে — নিরাপত্তার কারণে শেষ পছন্দ
 *
 * ব্যবহার:
 *   import * as storage from './lib/storage/index.mjs';
 *   await storage.put('note.txt', 'hello');
 *   const buf = await storage.get('note.txt');
 */

import * as gdrive from './gdrive.mjs';
import * as local from './local.mjs';

const REGISTRY = [
  { name: 'gdrive', mod: gdrive },
  { name: 'local', mod: local },
];

/** যেসব provider সত্যিই কনফিগার করা — অগ্রাধিকার ক্রমে */
export function providers(env = process.env) {
  const only = (env.STORAGE_PROVIDER || '').trim();
  let list = REGISTRY.filter((p) => {
    try { return p.mod.isConfigured(env); } catch { return false; }
  });
  if (only) list = list.filter((p) => p.name === only);
  return list;
}

export function primary(env = process.env) {
  return providers(env)[0]?.name ?? null;
}

function noneConfigured() {
  return new Error(
    'কোনো স্টোরেজ provider কনফিগার করা নেই।\n' +
    '  → Google Drive (কার্ড লাগে না, ১৫GB): docs/GOOGLE-DRIVE-SETUP.md\n' +
    '  → অথবা ডিস্ক: STORAGE_LOCAL_DIR=./data/files',
  );
}

/**
 * আপলোড — প্রথম provider-এ চেষ্টা, ব্যর্থ হলে পরেরটায় (auto-fallback)।
 * কোনোটাই না পারলে সব এরর একসাথে জানায়।
 */
export async function put(key, data, opts = {}) {
  const env = opts.env ?? process.env;
  const chain = providers(env);
  if (!chain.length) throw noneConfigured();

  const errors = [];
  for (const p of chain) {
    try {
      const r = await p.mod.put(key, data, opts);
      if (errors.length) r.fallbackFrom = errors.map((e) => e.provider);
      return r;
    } catch (e) {
      errors.push({ provider: p.name, error: String(e.message).slice(0, 200) });
    }
  }
  const err = new Error(
    'সব স্টোরেজ provider ব্যর্থ:\n' +
    errors.map((e) => `  • ${e.provider}: ${e.error}`).join('\n'),
  );
  err.errors = errors;
  throw err;
}

/** প্রথম যে provider-এ ফাইলটা আছে সেখান থেকে পড়ে (Uint8Array | null) */
export async function get(key, opts = {}) {
  for (const p of providers(opts.env ?? process.env)) {
    try {
      const buf = await p.mod.get(key, opts);
      if (buf) return buf;
    } catch { /* পরেরটায় চেষ্টা */ }
  }
  return null;
}

/** সব provider মিলিয়ে তালিকা — ডুপ্লিকেট key বাদ, নতুন আগে */
export async function list(prefix = '', opts = {}) {
  const seen = new Set();
  const out = [];
  for (const p of providers(opts.env ?? process.env)) {
    try {
      for (const item of await p.mod.list(prefix, opts)) {
        if (seen.has(item.key)) continue;
        seen.add(item.key);
        out.push(item);
      }
    } catch { /* এক provider ব্যর্থ হলে বাকিগুলো চলুক */ }
  }
  return out.sort((a, b) => String(b.modified ?? '').localeCompare(String(a.modified ?? '')));
}

/** সব provider থেকেই মোছে — কোথাও অনাথ কপি পড়ে থাকে না */
export async function del(key, opts = {}) {
  let removed = false;
  for (const p of providers(opts.env ?? process.env)) {
    try { if (await p.mod.del(key, opts)) removed = true; } catch { /* ignore */ }
  }
  return removed;
}

/** UI/status endpoint-এর জন্য — প্রতিটি provider-এর সত্যিকার অবস্থা */
export async function health(env = process.env) {
  const chain = providers(env);
  if (!chain.length) {
    return { ok: false, primary: null, providers: [], hint: 'docs/GOOGLE-DRIVE-SETUP.md' };
  }
  const rows = await Promise.all(chain.map(async (p) => {
    try { return { name: p.name, ...(await p.mod.health(env)) }; }
    catch (e) { return { name: p.name, ok: false, error: String(e.message).slice(0, 200) }; }
  }));
  return {
    ok: rows.some((r) => r.ok),
    primary: rows.find((r) => r.ok)?.name ?? null,
    providers: rows,
  };
}
