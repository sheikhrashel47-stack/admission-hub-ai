#!/usr/bin/env node
/**
 * Google Drive OAuth helper — Desktop App flow (কোনো ডোমেইন verification লাগে না)
 *
 *   node scripts/gdrive-auth.mjs link  <CLIENT_ID>
 *   node scripts/gdrive-auth.mjs token <CLIENT_ID> <CLIENT_SECRET> "<code বা localhost URL>"
 *   node scripts/gdrive-auth.mjs check
 *
 * ⚠️ কোনো key এই ফাইলে হার্ডকোড করা নেই এবং করা যাবে না। সব `.env.local`-এ (gitignored)।
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const ENV_FILE = resolve(ROOT, '.env.local');

// Desktop app-এ Google-এর সংরক্ষিত loopback ঠিকানা — verification লাগে না
const REDIRECT = 'http://localhost';
const SCOPE = 'https://www.googleapis.com/auth/drive.file';

const C = {
  g: (s) => `\x1b[32m${s}\x1b[0m`,
  r: (s) => `\x1b[31m${s}\x1b[0m`,
  y: (s) => `\x1b[33m${s}\x1b[0m`,
  b: (s) => `\x1b[1m${s}\x1b[0m`,
  d: (s) => `\x1b[2m${s}\x1b[0m`,
};

function loadEnv() {
  const env = {};
  if (!existsSync(ENV_FILE)) return env;
  for (const line of readFileSync(ENV_FILE, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
  }
  return env;
}

/** URL, "code=..." বা কাঁচা কোড — যেকোনোটা থেকে authorization code বার করে */
function extractCode(raw) {
  if (!raw) return '';
  let s = String(raw).trim().replace(/^["']|["']$/g, '');
  try {
    if (/^https?:\/\//i.test(s)) {
      const u = new URL(s);
      if (u.searchParams.get('error')) {
        throw new Error(`Google পাঠিয়েছে error=${u.searchParams.get('error')}`);
      }
      const c = u.searchParams.get('code');
      if (c) return c;
    }
  } catch (e) {
    if (e.message.startsWith('Google')) throw e;
  }
  const m = s.match(/[?&]code=([^&\s]+)/);
  if (m) return decodeURIComponent(m[1]);
  return s;
}

function cmdLink(clientId) {
  if (!clientId || !clientId.includes('.apps.googleusercontent.com')) {
    console.error(C.r('❌ সঠিক CLIENT_ID দিন (…apps.googleusercontent.com)'));
    console.error(C.d('   ব্যবহার: node scripts/gdrive-auth.mjs link <CLIENT_ID>'));
    process.exit(1);
  }
  const url = 'https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams({
    client_id: clientId,
    redirect_uri: REDIRECT,
    response_type: 'code',
    scope: SCOPE,
    access_type: 'offline',
    prompt: 'consent',            // প্রতিবার refresh token পেতে জরুরি
    include_granted_scopes: 'true',
  });

  console.log('\n' + C.b('🔗 এই লিংকটা ব্রাউজারে খুলুন:') + '\n');
  console.log(url + '\n');
  console.log(C.b('এরপর যা হবে:'));
  console.log('  ১. Google লগইন স্ক্রিন → আপনার অ্যাকাউন্ট বাছুন');
  console.log('  ২. ' + C.y('"Google hasn\'t verified this app"') + ' এলে →');
  console.log('     ' + C.b('Advanced') + ' → ' + C.b('Go to Admission Hub AI (unsafe)') + ' → ' + C.b('Continue'));
  console.log('  ৩. ব্রাউজার ' + C.d('http://localhost/?code=4/0A…') + ' এ যাবে এবং');
  console.log('     ' + C.y('"সাইট খোলা যাচ্ছে না" দেখাবে — এটাই স্বাভাবিক, ভয় নেই।'));
  console.log('  ৪. অ্যাড্রেস বারের ' + C.b('পুরো URL কপি') + ' করে চালান:\n');
  console.log(C.g('     node scripts/gdrive-auth.mjs token <CLIENT_ID> <CLIENT_SECRET> "<কপি করা URL>"') + '\n');
}

async function cmdToken(clientId, clientSecret, rawCode) {
  if (!clientId || !clientSecret || !rawCode) {
    console.error(C.r('❌ ব্যবহার: node scripts/gdrive-auth.mjs token <CLIENT_ID> <CLIENT_SECRET> "<code|URL>"'));
    process.exit(1);
  }
  let code;
  try {
    code = extractCode(rawCode);
  } catch (e) {
    console.error(C.r('❌ ' + e.message));
    process.exit(1);
  }
  if (!code || code.length < 10) {
    console.error(C.r('❌ authorization code পাওয়া যায়নি। পুরো localhost URL-টা কোটেশনসহ দিন।'));
    process.exit(1);
  }

  console.log(C.d('→ টোকেন চাওয়া হচ্ছে…'));
  let res, j;
  try {
    res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: REDIRECT,
        grant_type: 'authorization_code',
      }),
    });
    j = await res.json().catch(() => ({}));
  } catch (e) {
    console.error(C.r('\n❌ Google-এ পৌঁছানো যায়নি (নেটওয়ার্ক ব্লকড)'));
    console.error(C.d('   ' + (e.cause?.code || e.message)));
    console.error(C.y('\n💡 এই মেশিন থেকে oauth2.googleapis.com এ কানেকশন যাচ্ছে না।'));
    console.error(C.y('   বিকল্প: ব্রাউজার-টুল ব্যবহার করুন — ফোনেই পুরো কাজ হবে:'));
    console.error(C.g('   npx --yes serve tools/gdrive-token   # অথবা ফাইলটা সরাসরি খুলুন'));
    console.error(C.d('   tools/gdrive-token/index.html'));
    process.exit(1);
  }

  if (!res.ok || !j.refresh_token) {
    console.error(C.r(`\n❌ ব্যর্থ (HTTP ${res.status}): ${j.error || '?'} — ${j.error_description || ''}\n`));
    const hints = {
      invalid_grant: 'code একবারই ব্যবহার করা যায় এবং ~১০ মিনিটে expire হয় → `link` দিয়ে নতুন কোড নিন।',
      invalid_client: 'CLIENT_ID/SECRET মিলছে না, অথবা ক্লায়েন্টটি Desktop app নয়।',
      redirect_uri_mismatch: 'ক্লায়েন্টটি "Web application" — Console-এ নতুন করে **Desktop app** ক্লায়েন্ট বানান।',
      invalid_request: 'কোড ভুলভাবে কপি হয়েছে — পুরো URL কোটেশনের ভেতরে দিন।',
    };
    if (hints[j.error]) console.error(C.y('💡 ' + hints[j.error]));
    if (!j.refresh_token && res.ok) {
      console.error(C.y('💡 refresh_token আসেনি — লিংকে `prompt=consent` ছিল কিনা দেখুন, অথবা'));
      console.error(C.y('   myaccount.google.com/permissions → অ্যাপটি Remove করে আবার চেষ্টা করুন।'));
    }
    process.exit(1);
  }

  const env = loadEnv();
  const slot = [1, 2, 3].find((n) => !env[`GOOGLE_DRIVE_REFRESH_TOKEN_${n}`]) || 1;

  console.log(C.g('\n✅ সফল! নিচের ৩ লাইন ') + C.b('.env.local') + C.g('-এ যোগ করুন:\n'));
  console.log(`GOOGLE_DRIVE_CLIENT_ID_${slot}=${clientId}`);
  console.log(`GOOGLE_DRIVE_CLIENT_SECRET_${slot}=${clientSecret}`);
  console.log(`GOOGLE_DRIVE_REFRESH_TOKEN_${slot}=${j.refresh_token}`);
  console.log(C.d(`\n(scope: ${j.scope || SCOPE})`));
  console.log(C.y('\n⚠️ এই টোকেন কখনো git-এ, চ্যাটে বা স্ক্রিনশটে দেবেন না।'));
  console.log(C.d('   যাচাই: node scripts/gdrive-auth.mjs check\n'));
}

async function refreshAccessToken(id, secret, refresh) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: id, client_secret: secret,
      refresh_token: refresh, grant_type: 'refresh_token',
    }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${j.error || res.status}: ${j.error_description || ''}`);
  return j.access_token;
}

async function cmdCheck() {
  const env = { ...loadEnv(), ...process.env };
  const slots = [1, 2, 3].filter((n) => env[`GOOGLE_DRIVE_REFRESH_TOKEN_${n}`]);

  if (!slots.length) {
    console.log(C.y('⚠️  .env.local-এ কোনো GOOGLE_DRIVE_REFRESH_TOKEN_* নেই।'));
    console.log(C.d('   গাইড: docs/GOOGLE-DRIVE-SETUP.md'));
    process.exit(1);
  }

  let ok = 0;
  for (const n of slots) {
    const id = env[`GOOGLE_DRIVE_CLIENT_ID_${n}`];
    const secret = env[`GOOGLE_DRIVE_CLIENT_SECRET_${n}`];
    const refresh = env[`GOOGLE_DRIVE_REFRESH_TOKEN_${n}`];
    process.stdout.write(`অ্যাকাউন্ট #${n} … `);
    try {
      const at = await refreshAccessToken(id, secret, refresh);
      const about = await fetch(
        'https://www.googleapis.com/drive/v3/about?fields=user(emailAddress),storageQuota(limit,usage)',
        { headers: { authorization: `Bearer ${at}` } },
      ).then((r) => r.json());
      const q = about.storageQuota || {};
      const gb = (v) => (v ? (Number(v) / 1073741824).toFixed(2) + ' GB' : '—');
      console.log(C.g('✅ ') + (about.user?.emailAddress || '?') +
        C.d(`  · ব্যবহৃত ${gb(q.usage)} / ${gb(q.limit)}`));
      ok++;
    } catch (e) {
      console.log(C.r('❌ ' + e.message));
      if (String(e.message).includes('invalid_grant')) {
        console.log(C.y('   💡 টোকেন expire/revoked। consent screen PUBLISH করে আবার `link` → `token` করুন।'));
      }
    }
  }
  console.log(`\n${ok}/${slots.length} অ্যাকাউন্ট কাজ করছে।`);
  process.exit(ok ? 0 : 1);
}

const [cmd, ...args] = process.argv.slice(2);
switch (cmd) {
  case 'link':  cmdLink(args[0]); break;
  case 'token': await cmdToken(args[0], args[1], args[2]); break;
  case 'check': await cmdCheck(); break;
  default:
    console.log(`
${C.b('Google Drive OAuth helper')} ${C.d('(Desktop app flow — 403 verification এরর হয় না)')}

  ${C.g('node scripts/gdrive-auth.mjs link')}  <CLIENT_ID>
      → লগইন লিংক বানায়

  ${C.g('node scripts/gdrive-auth.mjs token')} <CLIENT_ID> <CLIENT_SECRET> "<code|URL>"
      → refresh token বের করে (.env.local-এ বসাতে হবে)

  ${C.g('node scripts/gdrive-auth.mjs check')}
      → সব অ্যাকাউন্টের টোকেন + কোটা যাচাই করে

  ${C.d('বিস্তারিত গাইড: docs/GOOGLE-DRIVE-SETUP.md')}
`);
}
