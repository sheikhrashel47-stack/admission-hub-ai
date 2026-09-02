# Google Drive সেটআপ — Desktop App পদ্ধতি (403 এরর হয় না)

> **কেন এই পদ্ধতি?** আগে "Web application" ক্লায়েন্ট + `https://admission-hub-ai.pages.dev/oauth/callback`
> redirect ব্যবহার করা হয়েছিল → Google **ব্র্যান্ড verification** চায় → `Error 403: access_denied`
> ("has not completed the Google verification process")।
>
> **Desktop app** ক্লায়েন্টে redirect হয় `http://localhost` — এটা Google-এর নিজস্ব সংরক্ষিত ঠিকানা,
> কোনো ডোমেইন verification লাগে না। তাই 403 আসে না। ✅

---

## নিরাপত্তা-নিয়ম (অটুট)

| নিয়ম | কেন |
|---|---|
| 🔒 পাসওয়ার্ড কখনো চ্যাটে/এজেন্টকে নয় | লগইন হয় Google-এর নিজের স্ক্রিনে (OAuth) |
| 🔒 scope শুধু `drive.file` | এজেন্ট **শুধু নিজের আপলোড করা ফাইল** দেখে — আপনার পুরো Drive নয় |
| 🔒 সব token `.env.local` / CF Secret-এ | `.gitignore`-এ আছে — git-এ কখনো যাবে না |
| 🔒 প্রতি অ্যাকাউন্টে 2FA | অ্যাকাউন্ট হাইজ্যাক ঠেকায় |
| ⚠️ "১০০% নিরাপদ" বলে কিছু নেই | তবে এই নিয়মে ঝুঁকি নগণ্য |

---

## ধাপ ১ — Google Cloud প্রজেক্ট (প্রতি অ্যাকাউন্টে একবার)

যে Google অ্যাকাউন্টের Drive ব্যবহার করবেন, **সেই অ্যাকাউন্টেই** লগইন করে:

1. **console.cloud.google.com** খুলুন
2. উপরে প্রজেক্ট ড্রপডাউন → **New Project**
3. Name: `ahai-drive1` (দ্বিতীয় অ্যাকাউন্টে `ahai-drive2`) → **Create**
4. প্রজেক্টটা সিলেক্ট করা আছে কিনা নিশ্চিত করুন (উপরের বারে নাম দেখা যাবে)

## ধাপ ২ — Drive API চালু

1. ☰ → **APIs & Services** → **Library**
2. সার্চ: `Google Drive API` → খুলুন → **ENABLE**

## ধাপ ৩ — OAuth consent screen

1. ☰ → **APIs & Services** → **OAuth consent screen**
   *(নতুন UI-তে: **Google Auth Platform** → **Branding** / **Audience**)*
2. User type: **External** → Create
3. App name: `Admission Hub AI` · support email: আপনার ইমেইল · developer email: আপনার ইমেইল → Save
4. **Scopes** ধাপ → **ADD OR REMOVE SCOPES** → সার্চে `drive.file` →
   `https://www.googleapis.com/auth/drive.file` টিক দিন → Update → Save
5. **Audience** ট্যাব → দুটোর যেকোনো একটা:
   - ⭐ **PUBLISH APP** চাপুন → "Testing" থেকে **In production** হবে
     *(এতে refresh token স্থায়ী হয়। sensitive scope না থাকায় verification লাগবে না)*
   - অথবা Testing-এই রাখলে **+ ADD USERS**-এ আপনার ইমেইল যোগ করুন
     ⚠️ Testing মোডে **refresh token ৭ দিনে মরে যায়** — তাই Publish করাই ভালো

## ধাপ ৪ — Desktop App ক্লায়েন্ট ⭐ (এটাই আসল ফিক্স)

1. ☰ → **APIs & Services** → **Credentials**
2. **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Application type: **Desktop app** ← ❗ **Web application নয়**
4. Name: `ahai-agent` → **CREATE**
5. পপআপে **Client ID** (`...apps.googleusercontent.com`) ও **Client secret** (`GOCSPX-...`) দেখাবে
   → দুটোই কপি করে ফোনের secure note-এ রাখুন

> ✅ Desktop app-এ redirect URI নিজে থেকে ঠিক হয়ে যায় — কিছু বসাতে হবে না।

## ধাপ ৫ — টোকেন নেওয়া (ফোন থেকেই, ২ মিনিট)

রিপোতে হেল্পার স্ক্রিপ্ট আছে। **কোনো key চ্যাটে পাঠাবেন না** — টার্মিনালে/`.env.local`-এ বসান।

```bash
# ১) লগইন লিংক বানান
node scripts/gdrive-auth.mjs link <CLIENT_ID>
```

লিংকটা ব্রাউজারে খুলুন → Google লগইন → "Google hasn't verified this app" এলে
**Advanced → Go to Admission Hub AI (unsafe)** → **Continue** →
ব্রাউজার `http://localhost/?code=4/0Ax...` এ যাবে ও **"সাইট খোলা যাচ্ছে না"** দেখাবে —
**এটাই স্বাভাবিক।** অ্যাড্রেস বারের পুরো URL কপি করুন।

```bash
# ২) কোড → refresh token
node scripts/gdrive-auth.mjs token <CLIENT_ID> <CLIENT_SECRET> "<কপি করা URL বা শুধু code>"
```

আউটপুটে `GOOGLE_DRIVE_REFRESH_TOKEN_1=...` পাবেন।

## ধাপ ৬ — `.env.local`-এ বসান

```bash
GOOGLE_DRIVE_CLIENT_ID_1=xxxx.apps.googleusercontent.com
GOOGLE_DRIVE_CLIENT_SECRET_1=GOCSPX-xxxx
GOOGLE_DRIVE_REFRESH_TOKEN_1=1//xxxx

# দ্বিতীয় অ্যাকাউন্ট (ঐচ্ছিক — কোটা ভরলে অটো পরেরটায় যাবে)
GOOGLE_DRIVE_CLIENT_ID_2=
GOOGLE_DRIVE_CLIENT_SECRET_2=
GOOGLE_DRIVE_REFRESH_TOKEN_2=
```

যাচাই:
```bash
node scripts/gdrive-auth.mjs check
```

---

## সমস্যা → সমাধান

| যা দেখছেন | কারণ | সমাধান |
|---|---|---|
| `403 access_denied` — "has not completed the Google verification process" | **Web application** ক্লায়েন্ট + কাস্টম ডোমেইন redirect | **Desktop app** ক্লায়েন্ট বানান (ধাপ ৪) |
| `403 access_denied` — "app is being tested" | Testing মোড, আপনি test user নন | Audience → **PUBLISH APP**, নয়তো নিজের ইমেইল test user-এ যোগ করুন |
| ৭ দিন পর হঠাৎ `invalid_grant` | Testing মোডে refresh token expire | **PUBLISH APP** করে আবার ধাপ ৫ |
| `redirect_uri_mismatch` | ক্লায়েন্ট টাইপ ভুল | Desktop app হলে এই এরর আসেই না |
| `Google hasn't verified this app` ওয়ার্নিং | unverified app — স্বাভাবিক | Advanced → Go to … (unsafe) → Continue |
| `access_denied` কিন্তু scope ভিন্ন | consent screen-এ scope যোগ করা হয়নি | ধাপ ৩.৪ |

---

## নোট

- `drive.file` scope-এ এজেন্ট **আগে থেকে থাকা** ফাইল পড়তে পারে না — শুধু নিজে বানানো/আপলোড করা।
  পুরো Drive পড়তে `drive.readonly` লাগে, কিন্তু সেটা **sensitive scope** → Google verification বাধ্যতামূলক।
  তাই আমরা `drive.file`-এই থাকছি।
- Client secret Desktop app-এ "গোপন নয়" ধরা হয় (Google-এর নিজের ডকেই লেখা), তবুও repo-তে রাখা হবে না।
