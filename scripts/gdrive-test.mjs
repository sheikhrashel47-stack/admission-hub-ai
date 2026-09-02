#!/usr/bin/env node
/**
 * Google Drive adapter smoke test — সত্যিকার আপলোড → পড়া → লিস্ট → মুছে ফেলা।
 *   node scripts/gdrive-test.mjs
 * কোনো key প্রিন্ট করে না।
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import * as gd from '../lib/storage/gdrive.mjs';

const ENV_FILE = resolve(import.meta.dirname, '..', '.env.local');
const env = { ...process.env };
if (existsSync(ENV_FILE)) {
  for (const line of readFileSync(ENV_FILE, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
  }
}

const g = (s) => `\x1b[32m${s}\x1b[0m`;
const r = (s) => `\x1b[31m${s}\x1b[0m`;
const d = (s) => `\x1b[2m${s}\x1b[0m`;
const gb = (v) => (Number.isFinite(v) ? (v / 1073741824).toFixed(2) + ' GB' : '—');

if (!gd.isConfigured(env)) {
  console.log(r('❌ .env.local-এ GOOGLE_DRIVE_* নেই — docs/GOOGLE-DRIVE-SETUP.md দেখুন'));
  process.exit(1);
}

const KEY = `ahai-selftest-${Date.now()}.txt`;
const TEXT = `Admission Hub AI storage test · ${new Date().toISOString()}`;
let fail = 0;
const step = async (label, fn) => {
  process.stdout.write(`${label} … `);
  try { const v = await fn(); console.log(g('✅')); return v; }
  catch (e) { console.log(r('❌ ' + e.message)); fail++; }
};

console.log('\n🔍 Google Drive adapter টেস্ট\n');

const h = await gd.health(env);
for (const a of h.accounts) {
  console.log(a.ok
    ? `  #${a.slot} ${g('✅')} ${a.email} ${d(`· ${gb(a.usage)} / ${gb(a.limit)} · ফাঁকা ${gb(a.free)}`)}`
    : `  #${a.slot} ${r('❌ ' + a.error)}`);
}
if (!h.ok) { console.log(r('\nকোনো অ্যাকাউন্ট কাজ করছে না।')); process.exit(1); }
console.log(d(`  মোট ফাঁকা: ${gb(h.freeTotal)}\n`));

await step('আপলোড', () => gd.put(KEY, TEXT, { env, contentType: 'text/plain' }));
await step('পড়া (মিল যাচাই)', async () => {
  const buf = await gd.get(KEY, { env });
  if (!buf) throw new Error('ফাইল পাওয়া যায়নি');
  const got = new TextDecoder().decode(buf);
  if (got !== TEXT) throw new Error('কনটেন্ট মেলেনি');
});
await step('লিস্ট', async () => {
  const items = await gd.list('ahai-selftest', { env });
  if (!items.some((i) => i.key === KEY)) throw new Error('লিস্টে নেই');
});
await step('মুছে ফেলা', async () => {
  if (!(await gd.del(KEY, { env }))) throw new Error('delete ব্যর্থ');
  if (await gd.get(KEY, { env })) throw new Error('মোছার পরেও পাওয়া যাচ্ছে');
});

console.log(fail ? r(`\n${fail}টি ধাপ ব্যর্থ\n`) : g('\n🎉 সব ঠিক আছে — Drive স্টোরেজ প্রস্তুত!\n'));
process.exit(fail ? 1 : 0);
