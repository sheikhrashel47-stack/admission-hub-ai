# ☁️ ~~Cloudflare R2 (S3 Storage)~~ — বাতিল

> **❌ ২০২৬-০৯-০২: R2 বাতিল করা হয়েছে।** কারণ: ফ্রি ১০GB প্ল্যানেও Cloudflare **পেমেন্ট মেথড (কার্ড) চায়** — owner পলিসি অনুযায়ী প্রজেক্টে পেইড/কার্ড কিছুই নয়।
> **বদলি সমাধান (আরও ভালো, কার্ড-মুক্ত):** **Supabase Storage** — তোমার `admissionhub` প্রজেক্ট আগে থেকেই ACTIVE; ফ্রি: **১GB ফাইল স্টোরেজ + ৫০০MB PostgreSQL** + Auth, কার্ড লাগে না। Management API (`sbp_` PAT) দিয়ে project keys-ও সংগ্রহ করা যায় (টেস্ট PASS)। Phase 5-7-এ storage/DB → Supabase; ছোট ডেটা → Cloudflare KV (আগের মতোই)।

নিচের ধাপগুলো শুধু রেফারেন্স — ভবিষ্যতে কখনো R2 চাইলে (কার্ড থাকলে) কাজে লাগবে।
---


> **R2 কী:** Cloudflare-এর ফ্রি object storage (S3-সামঞ্জস্যপূর্ণ)। ফ্রি প্ল্যান: **১০GB স্টোরেজ + ১M Class-A + ১০M Class-B অপারেশন/মাস**। egress (ডাউনলোড) ফি **নেই** — এটাই R2-এর সবচেয়ে বড় সুবিধা।
> **কাজে লাগবে:** Phase 5/7 — নলেজ বেস ফাইল, ইউজার আপলোড, ব্যাকআপ। এখন শুধু চালু করে রাখলেই হবে।

---

## ধাপ ১ — R2 চালু (Enable)

1. **https://dash.cloudflare.com** — লগইন করো (যে ইমেইল দিয়ে `abb783e4…` অ্যাকাউন্ট, সেটা)।
2. বাম মেনুতে **R2 Object Storage** খুঁজো (শব্দ দিয়ে সার্চ করো: "R2")।
3. **"Enable R2"** বাটনে ক্লিক করো → কনফার্ম → আর কিছু লাগবে না (ফ্রি প্ল্যান অটো)।
   - ডাইরেক্ট লিংক: `https://dash.cloudflare.com/?to=/:account/r2`
   - অফিসিয়াল ডক: https://developers.cloudflare.com/r2/get-started/

## ধাপ ২ — Bucket তৈরি

1. R2 পেজে **"Create bucket"** → Create bucket।
2. **Bucket name:** `admission-hub` (নিজের পছন্দ — পরে কোডে একই নাম দিব)।
3. **Location:** `Automatic` (বা Asia Pacific) → **Create**।
   - ডক: https://developers.cloudflare.com/r2/buckets/create-buckets/

## ধাপ ৩ — API টোকেন তৈরি (Access Key + Secret)

1. R2 পেজে **"Manage R2 API Tokens"** → **Create API token**।
2. **Token name:** `ahai-app`
3. **Permission:** `Object Read & Write` (আগে থেকে আছে; Adminও চলবে)
4. **Create** → এবার **Access Key ID** ও **Secret Access Key** দেখাবে — **এই মুহূর্তেই কপি করো** (আবার দেখা যায় না; না কপি করলে মুছে নতুন বানাতে হয়)।
   - ডক: https://developers.cloudflare.com/r2/api/s3/tokens/

## ধাপ ৪ — `.env.local`-এ বসাও

```bash
R2_ACCESS_KEY_ID=<Access Key ID>
R2_SECRET_ACCESS_KEY=<Secret Access Key>
R2_ENDPOINT=https://abb783e456e51a5d338419de93d5e576.r2.cloudflarestorage.com
R2_BUCKET=admission-hub
```

- `R2_ENDPOINT` আগে থেকেই দেওয়া আছে (তোমার account ID-সহ) — বদলাতে হবে না।
- S3 এন্ডপয়েন্ট ডক: https://developers.cloudflare.com/r2/api/s3/api/

## ধাপ ৫ — যাচাই

বলো "হয়ে গেছে" → আমি CF API দিয়ে bucket ও key যাচাই করব (sandbox থেকে S3 টেলস ব্লকড, কিন্তু প্রোডাকশন Worker-এ কাজ করবে)।

## ফ্রি লিমিট চেক

- https://developers.cloudflare.com/r2/pricing/ — ১০GB ফ্রি, লিমিট ছাড়ালে বিল হবে না (সম্পূর্ণ বন্ধ হবে) — পেইড-মুক্ত নীতির সাথে মিলে যায়।
