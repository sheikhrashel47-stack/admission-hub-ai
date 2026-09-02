# 🔑 API Key Inventory — Admission Hub AI

> **নিয়ম:** আসল key **কখনোই** এই ফাইল বা git-এ থাকবে না। সব key শুধু `.env.local`-এ (gitignored) / Cloudflare Secrets-এ। এখানে শুধু নাম + ভূমিকা + অবস্থা।

**স্টোরেজ অবস্থান:** `server.mjs` (লোকাল) → `.env.local` · CF Pages worker → Cloudflare environment bindings (সার্ভার-সাইড) · GitHub Actions → repo secrets (যদি থাকে)।

| ভেরিয়েবল | সার্ভিস | কাজ | কোথায় ব্যবহৃত | ফেজ | অবস্থা (2026-09-02) |
|---|---|---|---|---|---|
| `GEMINI_API_KEY` | Google Gemini | চ্যাট মডেল + **ভিশন/ইমেজ প্রসেসিং** (Phase 3) | server.mjs, `_worker.js` | Phase 1-2 (লাইভ) + Phase 3 ভিশন | ✅ verified (নতুন `AQ.` ফরম্যাট, `x-goog-api-key` হেডার) |
| `GROQ_API_KEY` | Groq (gsk_) | দ্রুততম চ্যাট মডেল (fast/lite) | server.mjs, `_worker.js` | Phase 1-2 (লাইভ) | ✅ verified |
| ~~`XAI_API_KEY`~~ (Grok) | xAI — Grok | ~~মডেল fallback~~ | — | — | ❌ **বাদ দেওয়া হয়েছে** (২০২৬-০৯-০২) — পেইড ক্রেডিট লাগে; owner পলিসি: **প্রজেক্টে কোনো পেইড সার্ভিস নয়** |
| `MISTRAL_API_KEY` | Mistral | ব্যাকআপ মডেল (m2) | server.mjs, `_worker.js` | Phase 1-2 (লাইভ) | ✅ verified |
| `CEREBRAS_API_KEY` | Cerebras (csk-) | আল্ট্রা-ফাস্ট ফ্রি মডেল | — (কোড-রেডি নয়) | Phase 3 (মডেল রাউটারে যোগ) | ✅ verified |
| `OPENROUTER_API_KEY` | OpenRouter | ১০০+ মডেল এক key-তে; `openrouter/free` রাউটার মডেল (স্বয়ংক্রিয়ভাবে ফ্রি মডেল বেছে নেয় — কখনো পুরনো হয় না) | `_worker.js`/`worker.mjs`/`lib/providers.mjs` (গেটেড, চালু হলে) | Phase 3 | ✅ verified ২০২৬-০৯-০২ — free tier, SSE চ্যাট + সাজেশন PASS |
| `TAVILY_API_KEY` | Tavily Search | ওয়েব রিসার্চ (সাইটেশনসহ) | server.mjs, `_worker.js` | Phase 1-2 (লাইভ) | ✅ verified |
| `BROWSER_USE_API_KEY_1..3` | Browser Use Cloud (`api.browser-use.com`, হেডার `X-Browser-Use-API-Key`) | ক্লাউড ব্রাউজার এজেন্ট (ওয়েব টাস্ক অটোমেশন) — একটি শেষ হলে পরেরটি (রোটেশন) | — (কোড-রেডি নয়) | Phase 3 (Browser tool) | ✅ ৩টিই verified · বাজেট-গেটেড (ক্রেডিট-ভিত্তিক) |
| `OLLAMA_API_KEY` | Ollama Cloud | লোকাল/ক্লাউড ওপেন-মডেল (প্রাইভেট fallback) | — | Phase 4+ (প্রাইভেট এজেন্ট) | ✅ verified (`ollama.com/api` Bearer) |
| `WEBCONTAINERS_API_KEY` | E2B WebContainers (`wc_api_`) | ব্রাউজারে কোড execution sandbox (`auth.init` ক্লায়েন্ট-সাইড) | — | Phase 3 (code execution) | 📦 stored · ব্রাউজারে যাচাই হবে (ক্লায়েন্ট-সাইড) |
| `NPM_TOKEN` | npmjs | npm প্যাকেজ publish/auth | — | Phase 8 (Deploy automation) | ✅ verified (`whoami` 200) |
| `SUPABASE_PAT` | Supabase Management | **প্রধান storage + DB/auth** (ফাইল স্টোরেজ ফ্রি ১GB, DB ৫০০MB — কার্ড লাগে না) | — | Phase 3/5-6 | ✅ verified — `admissionhub` (ACTIVE, ap-northeast-1); project keys (service_role ইত্যাদি) Management API থেকে সংগ্রহের টেস্ট **PASS** |
| `CF_TOKEN` | Cloudflare API | Pages deploy + CF রিসোর্স অটোমেশন | deploy স্ক্রিপ্ট | Phase 1+ (সক্রিয়) | ✅ verified |
| `CF_ACCOUNT_ID` | Cloudflare | অ্যাকাউন্ট আইডি (`abb783e4…`) | স্ক্রিপ্ট/API | সব ফেজ | — |
| ~~R2~~ (S3) | Cloudflare R2 | ~~ফাইল স্টোরেজ~~ | — | — | ❌ **বাদ** (২০২৬-০৯-০২) — ফ্রি ১০GB-ও **কার্ড/পেমেন্ট মেথড চায়** (Cloudflare নিয়ম); owner পলিসি: পেইড নয় → **বদলে Supabase Storage** |
| `GITHUB_PAT` | GitHub | repo ops (git tools), Actions, Pages ডিপ্লয় | deploy/CI | Phase 1+ (সক্রিয়) | ✅ verified |

### রোটেশন নিয়ম
- **Browser Use:** `_1` → `_2` → `_3` (৪২৯/৪২৯/৪২৯) — একটি exhausted/rate-limited হলে পরেরটি।

### 💰 পেইড-মুক্ত নীতি (owner policy, ২০২৬-০৯-০২)
> প্রজেক্টে **কোনো পেইড সার্ভিস নেই** — সব ফ্রি টিয়ার, **কোনো কার্ডও লাগবে না**। কোনো সেবা ফ্রি লিমিট শেষ করলে সেটা বন্ধ/গেটেড থাকবে, পেইড হবে না। এই নীতিতে বাদ: **Grok (xAI)** (পেইড ক্রেডিট), **Cloudflare R2** (ফ্রি প্ল্যানেও কার্ড চায়) → storage-এর বদলি: **Supabase Storage** (ফ্রি ১GB, কার্ড নেই)। Browser Use-ও শুধু ফ্রি অ্যালাউন্সের মধ্যে (৩ key রোটেশন); লিমিট শেষ হলে টুল বন্ধ থাকবে।

### মিসিং (সৎ অবস্থা)

- **E2B API key** — শুধু WebContainers (`wc_api_`) দেওয়া হয়েছে; E2B-র আলাদা key নেই।

