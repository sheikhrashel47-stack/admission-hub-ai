# 🟢 BLOCK B (১/২) — Phase 31–45: যেকোনো বড় প্রজেক্ট/গবেষণা
> লক্ষ্য (মালিকের নির্দেশ #2): জুজু শুধু Admission Hub-এর কেয়ারটেকার নয় — **নতুন বড় বড় অ্যাপ/ওয়েবসাইট/প্রজেক্ট/গবেষণা** নিজে থেকে বা মালিকের নির্দেশে তৈরি ও পরিচালনা করবে।
> নির্ভরতা: Block A (বিশেষত Phase 1/4/5/7/26) শেষ থাকবে।

---

### Phase 31 — Project Factory v1 (ধারণা → জীবন্ত প্রজেক্ট)
**লক্ষ্য:** "এই ধরনের একটা অ্যাপ বানাও" → বাস্তব লাইভ প্রজেক্ট, এক মিশন-চেইনে।
- [ ] 31.1 `project.new`: {idea, kind-auto|template, name} → requirement-compiler (ধারণা → measurable acceptance criteria, P3-3) → মালিক-অনুমোদন কার্ড (Phase 19)
- [ ] 31.2 টেমপ্লেট বাছাই ইন্টেল: idea বিশ্লেষণে সেরা template (Phase 26) + প্রয়োজনীয় ভ্যারিয়েবল
- [ ] 31.3 নতুন repo তৈরি: মালিকের অ্যাকাউন্টে `gh.repo.create` (private ডিফল্ট) + branch protection নীতি
- [ ] 31.4 scaffold → build (Phase 4) → preview (Phase 5) → gate → approve → deploy (Phase 9) চেইন এক mission-plan-এ (DAG)
- [ ] 31.5 প্রজেক্ট-কার্ড kv-তে: নাম/রেপো/URL/স্টেট/পরবর্তী-ধাপ — status.html-এ "প্রজেক্ট" সেকশন
- [ ] 31.6 live proof: একটা সম্পূর্ণ নতুন ছোট অ্যাপ ধারণা থেকে লাইভ URL পর্যন্ত (মালিকের পছন্দের আইডিয়া)
**মাপকাঠি:** মালিক নতুন অ্যাপ ব্যবহার করে দেখেছেন। **ঝুঁকি:** scope ফোলা — requirement-compiler-এ বাজেট।

### Phase 32 — Full-Stack Recipe (React + Worker + D1)
**লক্ষ্য:** আধুনিক full-stack রেসিপি প্রমাণ — বড় অ্যাপের প্রযুক্তিগত ভিত্তি।
- [ ] 32.1 vite-react টেমপ্লেট আপগ্রেড: routing, state (zustand-lite), API client, auth context, i18n-ready
- [ ] 32.2 worker-api টেমপ্লেট সংযোগ: CORS, session, D1 schema migration স্লট, rate-limit প্যাটার্ন
- [ ] 32.3 monorepo বিন্যাস সিদ্ধান্ত: এক repo-তে web/+worker/ (আমাদের নিজস্ব টপোলজির মতো) + build script
- [ ] 32.4 deploy recipe: web → GH Pages বা CF Pages preview; worker → CF Pages functions; env সংযোগ
- [ ] 32.5 E2E স্মোক: preview URL-এ qa.browse লগিন-ফ্লো টেস্ট
- [ ] 32.6 live proof: recipe দিয়ে একটা টুডু-শ্রেণির full-stack অ্যাপ (auth+DB+UI) লাইভ
**মাপকাঠি:** ডেটা persist, লগিন কাজ, লাইভ URL। **ঝুঁকি:** বিল্ড জটিলতা — ক্যাশ+টেমপ্লেট টেস্ট।

### Phase 33 — E-commerce-class প্রজেক্ট (কার্ট/চেকআউট প্যাটার্ন)
**লক্ষ্য:** বহু-পাতা, স্টেট-ভারী, ফ্লো-নির্ভর অ্যাপের সক্ষমতা প্রমাণ (payment আসল নয় — confirmation-grade সিমুলেশন, P5-F নীতি)।
- [ ] 33.1 ডোমেইন মডেল: product/cart/order/inventory schema (D1) + migration
- [ ] 33.2 UI কিট: product grid/detail/cart/checkout multi-step (বাংলা, mobile-first)
- [ ] 33.3 অর্ডার স্টেট-মেশিন + ট্রানজিশন-গেট (double-submit রোধ, idempotency key)
- [ ] 33.4 "payment" সিমুলেশন: manual confirmation flow (TG approve প্যাটার্ন) — আসল অর্থ ছাড়া, অডিটসহ
- [ ] 33.5 লোড-স্মোক: ১০০ প্রোডাক্ট সিড + পাতা-সময় যাচাই
- [ ] 33.6 live proof: ডেমো স্টোরে অর্ডার-চক্র সম্পূর্ণ (TG অনুমোদনসহ)
**মাপকাঠি:** race/double-submit টেস্ট পাস। **ঝুঁকি:** আসল payment ভুলেও নয় — নীতি ডকে।

### Phase 34 — Content/Media সাইট শ্রেণি
**লক্ষ্য:** ব্লগ/ইবুক/মিডিয়া লাইব্রেরি — মালিকের পুরনো প্রজেক্টগুলোর (bangla-ebook-reader, jibonke-notun-kore-dekho) ভবিষ্যৎ-আপগ্রেডের ভিত্তি।
- [ ] 34.1 content pipeline: md/epub/pdf → সংরক্ষণ (ws/IA cold-vault) → index → পড়া-UI
- [ ] 34.2 static-site generator প্যাটার্ন (নিজেদের ছোট SSG: md→html template, build sandbox-এ)
- [ ] 34.3 ছবি/অডিও সংযুক্তি (Phase 20/22 pipeline) + lazy-load প্যাটার্ন
- [ ] 34.4 সার্চ: content-index (twin প্যাটার্ন ছোট করে) + হাইলাইট
- [ ] 34.5 RSS/sitemap/SEO বেসিক (Phase 43-এর বীজ)
- [ ] 34.6 live proof: ২০+ পাতার একটা বাস্তব বাংলা কনটেন্ট সাইট লাইভ
**মাপকাঠি:** ফোনে সুন্দর পড়া যায়; সার্চ চলে। **ঝুঁকি:** কপিরাইট কনটেন্ট — শুধু মালিকের/মুক্ত।

### Phase 35 — API-first সার্ভিস শ্রেণি
**লক্ষ্য:** UI ছাড়াও বিশুদ্ধ API পণ্য বানানো (bot/webhook/ইন্টিগ্রেশনের ভিত্তি)।
- [ ] 35.1 API টেমপ্লেট v2: OpenAPI spec-first (spec → routes skeleton জেনারেট)
- [ ] 35.2 auth প্যাটার্ন লাইব্রেরি: API-key (hashed), JWT-lite, rate-limit middleware (D1 counters)
- [ ] 35.3 versioning নীতি (/v1/) + deprecation header
- [ ] 35.4 contract test: spec vs implementation স্মোক (sandbox-এ)
- [ ] 35.5 public docs page (spec → html) প্রতি সার্ভিসে
- [ ] 35.6 live proof: একটা বাস্তব ছোট API (যেমন বাংলা-টেক্সট ইউটিলিটি সার্ভিস) লাইভ + docs
**মাপকাঠি:** বাইরে থেকে curl করে প্রমাণ। **ঝুঁকি:** abuse — rate-limit বাধ্যতামূলক।

### Phase 36 — Data Dashboard শ্রেণি (chart + CSV/DB)
**লক্ষ্য:** ডেটা-ভিজ্যুয়ালাইজেশন অ্যাপ (P5-D chart/dashboard)।
- [ ] 36.1 ছোট chart লাইব্রেরি সিদ্ধান্ত: inline SVG জেনারেট (নিজস্ব, zero-dep) vs CDN chart.js — ট্রেডঅফ+টেস্ট
- [ ] 36.2 `data.query`: CSV/D1 টেবিলে সীমিত SQL-like প্রশ্ন (select/where/group) — ইনজেকশন-নিরাপদ (parameterized)
- [ ] 36.3 dashboard টেমপ্লেট: KPI কার্ড + ৩ চার্ট + টেবিল (বাংলা সংখ্যা টগল)
- [ ] 36.4 auto-insight: ডেটায় ছোট মডেলে "৩টা লক্ষণীয় কথা" সারাংশ
- [ ] 36.5 রিপোর্ট এক্সপোর্ট (Phase 21 xlsx/pdf)
- [ ] 36.6 live proof: মালিকের বাস্তব ডেটা (যেমন ops.stats/golden history) দিয়ে একটা লাইভ ড্যাশবোর্ড
**মাপকাঠি:** বাস্তব সংখ্যা, ভুয়া নয়; এক্সপোর্ট চলে। **ঝুঁকি:** বড় ডেটাসেট সীমা — pagination+cap।

### Phase 37 — Advanced PWA (offline-first, push, install)
**লক্ষ্য:** ফোনে অ্যাপের মতো অভিজ্ঞতা গভীর করা (মালিকের দর্শক = মোবাইল বাংলাদেশ)।
- [ ] 37.1 offline data sync প্যাটার্ন: IndexedDB queue → online-এ flush (conflict নীতি)
- [ ] 37.2 Web Push ফ্রি-পথ গবেষণা ও প্রোটোটাইপ (VAPID + worker) — সীমা সৎভাবে
- [ ] 37.3 install-flow UX উন্নতি + iOS quirk তালিকা (আমাদের জানা double-safe-area ইত্যাদি)
- [ ] 37.4 background sync/periodic sync সাপোর্ট-যেখানে-পারে
- [ ] 37.5 app-shell ক্যাশিং কৌশল v2 (sw.js আপডেট নীতি — stale-client catch-22 এড়ানোর পুরনো শিক্ষা)
- [ ] 37.6 live proof: বিমানে-মোড টেস্ট (offline কাজ) + install স্ক্রিনশট
**মাপকাঠি:** offline-এ মূল ফ্লো চলে। **ঝুঁকি:** iOS সীমা — সৎ ডক।

### Phase 38 — Auth + Multi-user ভিত্তি (RBAC-lite)
**লক্ষ্য:** একাধিক ব্যবহারকারী সমর্থন — মালিকের ভবিষ্যৎ পাবলিক অ্যাপের শর্ত (P5-U আংশিক, স্বেচ্ছায়-সীমিত)।
- [ ] 38.1 user মডেল: magic-link (Telegram OTP বা email-free পথ) vs password+hash — গবেষণা+সিদ্ধান্ত ডক
- [ ] 38.2 session/token ইঞ্জিন (httpOnly cookie + CSRF টোকেন প্যাটার্ন)
- [ ] 38.3 role স্কোপ: owner/admin/user/guest — PERM-এর দার্শনিক অনুবাদ ওয়েব-স্তরে
- [ ] 38.4 tenant isolation: ডেটা partition (user_id prefix) + কুয়েরি-গার্ড
- [ ] 38.5 signup/login/reset UI কিট (টেমপ্লেটে সংযুক্ত)
- [ ] 38.6 নিরাপত্তা টেস্ট: session fixation/IDOR স্মোক (agent.test জেনারেটেড)
- [ ] 38.7 live proof: ২ জন ভিন্ন ব্যবহারকারীর পৃথক ডেটা এক ডেমো অ্যাপে
**মাপকাঠি:** IDOR টেস্ট পাস। **ঝুঁকি:** নিরাপত্তা দায় — কঠোর গেট, ছোট surface।

### Phase 39 — DB Migration Engine
**লক্ষ্য:** স্কিমা পরিবর্তন নিরাপদ ও ট্রেসড (বড় অ্যাপের মেরুদণ্ড)।
- [ ] 39.1 migrations/ ডিরেক্টরি কনভেনশন: সংখ্যাযুক্ত SQL ফাইল + manifest
- [ ] 39.2 `db.migrate`: pending চেনা → dry-run (EXPLAIN/validity) → apply (transaction যেখানে সম্ভব) → rollup log
- [ ] 39.3 backward-compat নীতি: expand→migrate→contract প্যাটার্ন ডক
- [ ] 39.4 backup-before-migrate: snapshot (D1 export বা টেবিল dump → vault)
- [ ] 39.5 rollback script জেনারেশন (যেখানে সম্ভব; না-পারলে সৎ ফ্ল্যাগ)
- [ ] 39.6 live proof: একটা ডেমো DB-তে ৩ ধাপের মাইগ্রেশন + রোলব্যাক
**মাপকাঠি:** ডেটা হারায়নি; ব্যাকআপ থেকে ফেরত সম্ভব হয়েছে। **ঝুঁকি:** D1 export সীমা — dump পদ্ধতি যাচাই।

### Phase 40 — CI/CD Mastery (যেকোনো repo-র জন্য pipeline)
**লক্ষ্য:** প্রতি নতুন প্রজেক্টে অটো build/test/deploy workflow (Phase 8-এর উপরে)।
- [ ] 40.1 workflow টেমপ্লেট সেট: ci.yml (lint+test+build), deploy-pages.yml, nightly.yml — ভ্যারিয়েবল-স্লটসহ
- [ ] 40.2 `ci.install`: repo-তে workflow যোগ + secrets সেট (GH API — আমাদের নিজস্ব pynacl রেসিপি)
- [ ] 40.3 run পর্যবেক্ষণ: workflow run status API → failure হলে লগ বিশ্লেষণ (Phase 15 taxonomy)
- [ ] 40.4 deploy গেট সংযোগ: CI সবুজ না হলে mission deploy আটকে
- [ ] 40.5 matrix টেস্ট প্যাটার্ন (node/python ভার্শন) প্রয়োজনে
- [ ] 40.6 live proof: নতুন প্রজেক্টে push → CI সবুজ → অটো-ডিপ্লয় সম্পূর্ণ চক্র
**মাপকাঠি:** মানুষ ছাড়া (অনুমোদন ছাড়া) pipeline চলেছে। **ঝুঁকি:** minutes quota (public = free) — private repo হলে সীমা সৎ।

### Phase 41 — Performance Engineering
**লক্ষ্য:** দ্রুত অ্যাপ = মাপা দ্রুততা (P3-10, P4-237)।
- [ ] 41.1 `perf.audit`: sandbox/browserless দিয়ে লোড-সময়, সংখ্যক রিকোয়েস্ট, সাইজ-ব্রেকআপ (har-lite)
- [ ] 41.2 বাজেট নীতি: পাতা ≤2s (3G-lite সিমুলেশন), bundle ≤300KB, ছবি ≤200KB — গেটে যোগ
- [ ] 41.3 অটো-প্রস্তাব: বড় JS/ছবি/ক্যাশ-হেডার বিশ্লেষণে "শীর্ষ ৫ উন্নতি" রিপোর্ট
- [ ] 41.4 CDN/ক্যাশ প্যাটার্ন লাইব্রেরি (CF cache rules ডক)
- [ ] 41.5 লোড স্মোক: k6-বিহীন সহজ parallel-fetch টেস্ট (৫০ কল) — p95 রিপোর্ট
- [ ] 41.6 live proof: Admission Hub UI-র perf রিপোর্ট + ১টা বাস্তব উন্নতি (প্রমাণসহ)
**মাপকাঠি:** মাপা উন্নতি (আগে/পরে সংখ্যা)। **ঝুঁকি:** datacenter-IP টেস্ট বাস্তব-নেট নয় — সীমা স্বীকার।

### Phase 42 — Security Hardening Suite
**লক্ষ্য:** প্রতি প্রজেক্টে নিরাপত্তা ডিফল্ট (P2-M, P5-Z)।
- [ ] 42.1 `sec.scan`: ডিপেন্ডেন্সি audit (npm audit --json / pip-audit sandbox-এ) + সারাংশ
- [ ] 42.2 secret-sweep v2: repo history scan (Phase 28.3-এর টুলিং প্রজেক্ট-জেনেরিক করা)
- [ ] 42.3 headers audit: CSP/HSTS/XFO পরীক্ষা + প্রস্তাব
- [ ] 42.4 injection স্মোক: form/API-তে ফাজি পেলোড টেস্ট (নিরাপদ ডেটাসেটে)
- [ ] 42.5 প্রতি mission-এ security stage আপগ্রেড: sec.scan সংক্ষিপ্ত রান (বড় প্রজেক্টে)
- [ ] 42.6 live proof: একটা ডেমো প্রজেক্টে ৩টা বাস্তব দুর্বলতা ধরা+সারানো
**মাপকাঠি:** ধরা পড়া সমস্যার সংখ্যা ও সমাধান রিপোর্ট। **ঝুঁকি:** false positive — severity ফিল্টার।

### Phase 43 — SEO/Analytics Integration
**লক্ষ্য:** পাবলিক অ্যাপ/সাইট খুঁজে পাওয়া যায় + ব্যবহার মাপা যায়।
- [ ] 43.1 SEO কিট: meta/OG/twitter card টেমপ্লেট, sitemap.xml, robots.txt জেনারেটর
- [ ] 43.2 structured data (JSON-LD) স্নিپেট লাইব্রেরি
- [ ] 43.3 ফ্রি অ্যানালিটিক্স সিদ্ধান্ত: নিজস্ব হালকা (worker log rollup — Phase 17 প্যাটার্ন) vs প্লাউজিবল-সদৃশ সেলফ-হোস্টেড — ট্রেডঅফ ডক
- [ ] 43.4 নিজস্ব হালকা অ্যানালিটিক্স: /api/track pixel + rollup (কোনো PII নয়) + ড্যাশবোর্ড সেকশন
- [ ] 43.5 Search Console প্যাটার্ন ডক (মালিকের অ্যাকাউন্টে manual ধাপ সৎভাবে চিহ্নিত)
- [ ] 43.6 live proof: কনটেন্ট সাইটে (Phase 34) sitemap+meta+track লাইভ
**মাপকাঠি:** ভিজিট সংখ্যা ড্যাশবোর্ডে দেখা যাচ্ছে। **ঝুঁকি:** privacy — aggregate only নীতি।

### Phase 44 — Confirmation-grade Flows (অর্থ/বার্তা/মুছুনে মানুষ-গেট)
**লক্ষ্য:** P5-F/Z নীতির প্রকৌশল: অর্থ-সদৃশ, বার্তা-পাঠানো, মুছে-ফেলা, পাবলিক-পোস্ট — সবসময় দ্বি-স্তর নিশ্চিতকরণ।
- [ ] 44.1 FLOW_CRITICAL শ্রেণি সংজ্ঞা + PERM-এ নতুন gate: 'CONFIRM' (মালিকের explicit দ্বিতীয় ট্যাপ/উত্তর)
- [ ] 44.2 confirmation কার্ড UI (Phase 19 প্রশ্ন-কার্ডের রূপান্তর): কী হবে, কাকে, কত — স্পষ্ট সারাংশ
- [ ] 44.3 অডিট অতিরিক্ত ফিল্ড: confirmedBy/confirmedAt/raw-request hash
- [ ] 44.4 প্রত্যাহার-উইন্ডো নীতি (যেখানে সম্ভব: ৬০s soft-hold → execute)
- [ ] 44.5 টেস্ট: গেট বাইপাসের চেষ্টা ব্যর্থ প্রমাণ (red-team স্মোক)
- [ ] 44.6 live proof: একটা demo "পেমেন্ট-সদৃশ" ফ্লো পূর্ণ নিশ্চিতকরণ চেইনে
**মাপকাঠি:** বাইপাস অসম্ভব প্রমাণিত। **ঝুঁকি:** UX ঘর্ষণ — সংক্ষিপ্ত কার্ড।

### Phase 45 — i18n Engine (বহুভাষা)
**লক্ষ্য:** বাংলা-ইংরেজি দ্বৈত ও ভবিষ্যৎ ভাষা — সব টেমপ্লেটে ডিফল্ট।
- [ ] 45.1 string-catalog ফরম্যাট (JSON) + টেমপ্লেটে স্লট
- [ ] 45.2 অনুবাদ পাইপলাইন: ক্যাটালগ → মডেল-অনুবাদ → মালিক-রিভিউ কিউ (bulk নয়, ব্যাচে)
- [ ] 45.3 runtime switcher + URL-prefix প্যাটার্ন (/bn/, /en/)
- [ ] 45.4 বাংলা টাইপোগ্রাফি নীতিমালা (লাইন-হাইট/ফন্ট-স্ট্যাক — আমাদের ROUND-6 শিক্ষা)
- [ ] 45.5 ভাষা-ভিত্তিক টেস্ট স্মোক (rendering ভাঙছে কিনা — visual gate)
- [ ] 45.6 live proof: একটা ডেমো অ্যাপ bn/en টগলসহ
**মাপকাঠি:** দুই ভাষায় UI অক্ষত। **ঝুঁকি:** অনুবাদ গুণমান — রিভিউ কিউ।

---
_বাকি Block B: `B2-PHASES-46-60.md`।_
