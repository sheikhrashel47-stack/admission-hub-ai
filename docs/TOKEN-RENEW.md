# 🔄 Drive টোকেন renew — ৩ ধাপ, ৩০ সেকেন্ড

> **কখন লাগবে?** consent screen **Testing** মোডে থাকলে refresh token **৭ দিনে** expire হয়।
> লক্ষণ: `invalid_grant` এরর, বা `health()`-এ `❌ টোকেন expire/revoked`।

---

## ধাপ ১ — টুল খুলুন

ফোনের ব্রাউজারে:

```
https://htmlpreview.github.io/?https://raw.githubusercontent.com/sheikhrashel47-stack/admission-hub-ai/main/tools/gdrive-token/index.html
```

Client ID ও Secret **আগে থেকেই ভরা থাকবে** (ব্রাউজারে সেভ করা)।

## ধাপ ২ — লগইন

**"লগইন লিংক বানাও"** → সবুজ 🔗 বাটন → অ্যাকাউন্ট বাছুন →
**Advanced → Go to … (unsafe) → Continue → Allow**

`localhost` পেজে **"This site can't be reached"** আসবে — **এটাই সঠিক** ✅
অ্যাড্রেস বার ট্যাপ → **Select all → Copy**

## ধাপ ৩ — পেস্ট

টুলে ফিরে নিচের বড় ঘরে পেস্ট → **"টোকেন নাও"** → নতুন
`GOOGLE_DRIVE_REFRESH_TOKEN_1` কপি করে `.env.local` / Worker Secret-এ বসান।

যাচাই:
```bash
node scripts/gdrive-auth.mjs check
```

---

## ♾️ চিরতরে বন্ধ করতে — consent screen PUBLISH করুন

Publish করলে টোকেন আর কখনো expire হয় না।

1. `console.cloud.google.com/auth/branding` → **App name** ও **User support email** ভরুন → **SAVE**
2. `console.cloud.google.com/auth/scopes` → **Manually add scopes** ঘরে
   `https://www.googleapis.com/auth/drive.file` → **Add to table** → **Update**
   ⚠️ অন্য কোনো scope-এ টিক দেবেন না (sensitive scope = verification বাধ্যতামূলক)
3. `console.cloud.google.com/auth/audience` → **PUBLISH APP** → **CONFIRM**
   → status হবে `In production`

**যদি Publish বাটন ধূসর থাকে:**
- `console.cloud.google.com/apis/library/drive.googleapis.com` → **Drive API ENABLE** আছে কিনা দেখুন
- App logo **আপলোড করবেন না** — লোগো দিলেই verification লাগে
- Authorized domains **খালি** থাকতে হবে (Desktop app-এ ডোমেইন লাগে না)
- মোবাইল ব্রাউজারে Console-এর কিছু বাটন কাজ করে না — **ডেস্কটপ থেকে চেষ্টা করুন**

---

## সাধারণ এরর

| এরর | কারণ | সমাধান |
|---|---|---|
| `invalid_grant` | টোকেন expire/revoked | উপরের ৩ ধাপ |
| `403 access_denied` | ইমেইল test users-এ নেই | Audience → **+ Add users** |
| `insufficient permissions` | scope নেই | Data access → `drive.file` যোগ |
| কোটা ভর্তি | Drive ভরে গেছে | দ্বিতীয় অ্যাকাউন্ট slot `_2`-তে যোগ করুন |
