/**
 * Google Drive adapter — drive.file scope, multi-account
 *
 * `drive.file` scope: এই অ্যাপ যে ফাইল নিজে বানায়/আপলোড করে শুধু সেগুলোই দেখতে-বদলাতে পারে।
 * ইউজারের বাকি Drive সম্পূর্ণ অদৃশ্য — এটাই আমাদের নিরাপত্তার ভিত্তি।
 *
 * অ্যাকাউন্ট কনফিগ (.env.local, gitignored):
 *   GOOGLE_DRIVE_CLIENT_ID_1 / _SECRET_1 / _REFRESH_TOKEN_1
 *   … _2, _3 (ঐচ্ছিক — একটার কোটা ভরলে পরেরটায় যায়)
 */

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const API = 'https://www.googleapis.com/drive/v3';
const UPLOAD = 'https://www.googleapis.com/upload/drive/v3/files';
const FOLDER_MIME = 'application/vnd.google-apps.folder';

/** access_token ক্যাশ — refresh প্রতি কলে নয়, expiry-র ৬০s আগে (per-process) */
const tokenCache = new Map();
/** appRoot ফোল্ডার id ক্যাশ */
const folderCache = new Map();

export function listAccounts(env = process.env) {
  const out = [];
  for (const n of [1, 2, 3]) {
    const id = env[`GOOGLE_DRIVE_CLIENT_ID_${n}`];
    const secret = env[`GOOGLE_DRIVE_CLIENT_SECRET_${n}`];
    const refresh = env[`GOOGLE_DRIVE_REFRESH_TOKEN_${n}`];
    if (id && secret && refresh) out.push({ slot: n, id, secret, refresh });
  }
  return out;
}

export function isConfigured(env = process.env) {
  return listAccounts(env).length > 0;
}

async function accessToken(acc) {
  const hit = tokenCache.get(acc.slot);
  if (hit && hit.exp > Date.now()) return hit.tok;

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: acc.id,
      client_secret: acc.secret,
      refresh_token: acc.refresh,
      grant_type: 'refresh_token',
    }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.access_token) {
    const hint = j.error === 'invalid_grant'
      ? ' — টোকেন expire/revoked। consent screen PUBLISH করে আবার টোকেন নিন (docs/GOOGLE-DRIVE-SETUP.md)।'
      : '';
    throw new Error(`gdrive#${acc.slot} auth: ${j.error || res.status}${hint}`);
  }
  tokenCache.set(acc.slot, {
    tok: j.access_token,
    exp: Date.now() + (j.expires_in ?? 3600) * 1000 - 60_000,
  });
  return j.access_token;
}

async function api(acc, path, init = {}) {
  const tok = await accessToken(acc);
  const res = await fetch(path.startsWith('http') ? path : API + path, {
    ...init,
    headers: { authorization: `Bearer ${tok}`, ...(init.headers || {}) },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    const err = new Error(`gdrive#${acc.slot} ${res.status}: ${body.slice(0, 300)}`);
    err.status = res.status;
    throw err;
  }
  return res;
}

/** অ্যাপের নিজস্ব ফোল্ডার — না থাকলে বানায় (drive.file scope-এ নিরাপদ) */
async function rootFolder(acc, name) {
  const key = `${acc.slot}:${name}`;
  if (folderCache.has(key)) return folderCache.get(key);

  const q = encodeURIComponent(
    `name='${name.replace(/'/g, "\\'")}' and mimeType='${FOLDER_MIME}' and trashed=false`,
  );
  const found = await api(acc, `/files?q=${q}&fields=files(id)&pageSize=1`).then((r) => r.json());

  let id = found.files?.[0]?.id;
  if (!id) {
    const made = await api(acc, '/files?fields=id', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name, mimeType: FOLDER_MIME }),
    }).then((r) => r.json());
    id = made.id;
  }
  folderCache.set(key, id);
  return id;
}

async function quota(acc) {
  const j = await api(acc, '/about?fields=user(emailAddress),storageQuota(limit,usage)')
    .then((r) => r.json());
  const limit = Number(j.storageQuota?.limit ?? 0);
  const usage = Number(j.storageQuota?.usage ?? 0);
  return { email: j.user?.emailAddress, limit, usage, free: limit ? limit - usage : Infinity };
}

/** যে অ্যাকাউন্টে `need` বাইট ধরবে (৫% হেডরুম রেখে) সেটাই বাছে */
async function pickAccount(need, env) {
  const accounts = listAccounts(env);
  if (!accounts.length) throw new Error('Google Drive কনফিগার করা নেই (docs/GOOGLE-DRIVE-SETUP.md)');

  let lastErr;
  for (const acc of accounts) {
    try {
      const q = await quota(acc);
      if (q.free > need * 1.05) return acc;
      lastErr = new Error(`gdrive#${acc.slot} (${q.email}) কোটা প্রায় ভর্তি`);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr ?? new Error('কোনো Drive অ্যাকাউন্টে জায়গা নেই');
}

/* ─────────────── public API (storage/index.mjs এর সাথে অভিন্ন) ─────────────── */

export async function put(key, data, opts = {}) {
  const env = opts.env ?? process.env;
  const folderName = opts.folder ?? 'AdmissionHubAI';
  const buf = data instanceof Uint8Array ? data : new Uint8Array(await new Blob([data]).arrayBuffer());

  const acc = opts.account ?? (await pickAccount(buf.byteLength, env));
  const parent = await rootFolder(acc, folderName);

  const meta = { name: key, parents: [parent] };
  const boundary = 'ahai' + Math.random().toString(36).slice(2);
  const body = new Blob([
    `--${boundary}\r\ncontent-type: application/json; charset=UTF-8\r\n\r\n`,
    JSON.stringify(meta),
    `\r\n--${boundary}\r\ncontent-type: ${opts.contentType || 'application/octet-stream'}\r\n\r\n`,
    buf,
    `\r\n--${boundary}--\r\n`,
  ]);

  const j = await api(acc, `${UPLOAD}?uploadType=multipart&fields=id,name,size,webViewLink`, {
    method: 'POST',
    headers: { 'content-type': `multipart/related; boundary=${boundary}` },
    body,
  }).then((r) => r.json());

  return {
    provider: 'gdrive',
    account: acc.slot,
    id: j.id,
    key: j.name,
    size: Number(j.size ?? buf.byteLength),
    url: j.webViewLink,
  };
}

async function findFile(acc, key, folderName) {
  const parent = await rootFolder(acc, folderName);
  const q = encodeURIComponent(
    `name='${key.replace(/'/g, "\\'")}' and '${parent}' in parents and trashed=false`,
  );
  const j = await api(acc, `/files?q=${q}&fields=files(id,name,size,modifiedTime)&pageSize=1`)
    .then((r) => r.json());
  return j.files?.[0] ?? null;
}

/** সব অ্যাকাউন্টে খুঁজে প্রথম ম্যাচ ফেরায় (Uint8Array) */
export async function get(key, opts = {}) {
  const env = opts.env ?? process.env;
  const folderName = opts.folder ?? 'AdmissionHubAI';
  for (const acc of listAccounts(env)) {
    const f = await findFile(acc, key, folderName).catch(() => null);
    if (!f) continue;
    const res = await api(acc, `/files/${f.id}?alt=media`);
    return new Uint8Array(await res.arrayBuffer());
  }
  return null;
}

export async function list(prefix = '', opts = {}) {
  const env = opts.env ?? process.env;
  const folderName = opts.folder ?? 'AdmissionHubAI';
  const out = [];
  for (const acc of listAccounts(env)) {
    try {
      const parent = await rootFolder(acc, folderName);
      let q = `'${parent}' in parents and trashed=false`;
      if (prefix) q += ` and name contains '${prefix.replace(/'/g, "\\'")}'`;
      const j = await api(
        acc,
        `/files?q=${encodeURIComponent(q)}&fields=files(id,name,size,modifiedTime)&pageSize=${opts.limit ?? 100}`,
      ).then((r) => r.json());
      for (const f of j.files ?? []) {
        out.push({
          provider: 'gdrive',
          account: acc.slot,
          id: f.id,
          key: f.name,
          size: Number(f.size ?? 0),
          modified: f.modifiedTime,
        });
      }
    } catch { /* এক অ্যাকাউন্ট ব্যর্থ হলে বাকিগুলো চলুক */ }
  }
  return out;
}

export async function del(key, opts = {}) {
  const env = opts.env ?? process.env;
  const folderName = opts.folder ?? 'AdmissionHubAI';
  let n = 0;
  for (const acc of listAccounts(env)) {
    const f = await findFile(acc, key, folderName).catch(() => null);
    if (!f) continue;
    await api(acc, `/files/${f.id}`, { method: 'DELETE' });
    n++;
  }
  return n > 0;
}

/** প্রতিটি অ্যাকাউন্টের স্বাস্থ্য + কোটা (UI/health-check-এর জন্য) */
export async function health(env = process.env) {
  const accounts = listAccounts(env);
  if (!accounts.length) return { ok: false, configured: false, accounts: [] };

  const rows = await Promise.all(accounts.map(async (acc) => {
    try {
      const q = await quota(acc);
      return { slot: acc.slot, ok: true, email: q.email, usage: q.usage, limit: q.limit, free: q.free };
    } catch (e) {
      return { slot: acc.slot, ok: false, error: String(e.message).slice(0, 200) };
    }
  }));

  return {
    ok: rows.some((r) => r.ok),
    configured: true,
    accounts: rows,
    freeTotal: rows.filter((r) => r.ok).reduce((s, r) => s + (r.free || 0), 0),
  };
}
