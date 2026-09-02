/**
 * Local disk adapter — কোনো key/অ্যাকাউন্ট লাগে না।
 *
 * ভূমিকা: Drive ব্যর্থ হলে (টোকেন expire, কোটা ভর্তি, নেটওয়ার্ক) শেষ ভরসা।
 * ডিরেক্টরি: STORAGE_LOCAL_DIR (ডিফল্ট ./data/files) — `data/` .gitignore-এ আছে।
 *
 * ⚠️ Cloudflare Worker-এ ফাইলসিস্টেম নেই — সেখানে এই adapter নিজে থেকেই নিষ্ক্রিয় থাকে।
 */

import { mkdir, writeFile, readFile, readdir, unlink, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, join } from 'node:path';

const dir = (env = process.env) => resolve(env.STORAGE_LOCAL_DIR || './data/files');

/** path traversal ঠেকায় — key কখনো ফোল্ডারের বাইরে লিখতে পারবে না */
const safe = (key) => String(key).replace(/[/\\]/g, '_').replace(/^\.+/, '_').slice(0, 255);

export function isConfigured(env = process.env) {
  // Worker/edge-এ fs নেই → নিষ্ক্রিয়। STORAGE_DISABLE_LOCAL=1 দিলেও বন্ধ।
  if (env.STORAGE_DISABLE_LOCAL === '1') return false;
  return typeof process !== 'undefined' && !!process.versions?.node;
}

export async function put(key, data, opts = {}) {
  const base = dir(opts.env ?? process.env);
  await mkdir(base, { recursive: true });
  const buf = data instanceof Uint8Array
    ? data
    : new Uint8Array(await new Blob([data]).arrayBuffer());
  const path = join(base, safe(key));
  await writeFile(path, buf);
  return { provider: 'local', key, size: buf.byteLength, path };
}

export async function get(key, opts = {}) {
  const path = join(dir(opts.env ?? process.env), safe(key));
  if (!existsSync(path)) return null;
  return new Uint8Array(await readFile(path));
}

export async function list(prefix = '', opts = {}) {
  const base = dir(opts.env ?? process.env);
  if (!existsSync(base)) return [];
  const out = [];
  for (const name of await readdir(base)) {
    if (prefix && !name.includes(prefix)) continue;
    try {
      const s = await stat(join(base, name));
      if (!s.isFile()) continue;
      out.push({ provider: 'local', key: name, size: s.size, modified: s.mtime.toISOString() });
    } catch { /* race — ফাইল মুছে গেছে */ }
  }
  return out;
}

export async function del(key, opts = {}) {
  const path = join(dir(opts.env ?? process.env), safe(key));
  if (!existsSync(path)) return false;
  await unlink(path);
  return true;
}

export async function health(env = process.env) {
  const base = dir(env);
  try {
    await mkdir(base, { recursive: true });
    const files = existsSync(base) ? (await readdir(base)).length : 0;
    return { ok: true, configured: true, dir: base, files };
  } catch (e) {
    return { ok: false, configured: true, error: String(e.message).slice(0, 200) };
  }
}
