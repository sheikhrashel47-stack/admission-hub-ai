# 🟢 BLOCK B (২/২) — Phase 46–60: গবেষণা-শক্তি ও প্রকল্প-পরিপক্বতা

---

### Phase 46 — Research Agent Pro (evidence graph + গভীর গবেষণা)
**লক্ষ্য:** দিনব্যাপী গভীর গবেষণা মিশন — বিশ্বের টপ রিসার্চ-এজেন্টদের প্যাটার্ন (Phase 23-এর উপরে)।
- [ ] 46.1 evidence graph: node=claim/source, edge=supports/refutes → kv-তে স্টোর + ভিজ্যুয়ালাইজ (DOT→SVG sandbox-এ)
- [ ] 46.2 গভীরতা-নিয়ন্ত্রক: breadth (উপ-প্রশ্ন সংখ্যা) × depth (প্রতি সূত্রে কত দূর) — বাজেটসহ
- [ ] 46.3 contradiction radar: বিরোধী দাবি জোড়া অটো-শনাক্ত → resolver রায়
- [ ] 46.4 gap detector: "যা এখনো জানা নেই" তালিকা → পরবর্তী সার্চ রাউন্ড
- [ ] 46.5 synthesis: গ্রেডেড আত্মবিশ্বাসসহ চূড়ান্ত প্রতিবেদন (claim→confidence→sources)
- [ ] 46.6 দীর্ঘ-মিশন সংযোগ: heartbeat tick-এ ধাপে ধাপে গবেষণা এগোনো (away-mode নীতি মেনে)
- [ ] 46.7 live proof: মালিকের পছন্দের একটা বড় বিষয়ে ২০+ সূত্রের প্রতিবেদন (PDF, Phase 21)
**মাপকাঠি:** প্রতি দাবিতে সূত্র; বিরোধ নিরসন দেখানো। **ঝুঁকি:** quota — Phase 14 economy।

### Phase 47 — Big Report Generator (গবেষণা → পণ্য-মানের দলিল)
**লক্ষ্য:** যেকোনো বড় কাজের ফলাফল = পেশাদার দলিল (মালিক পাঠাতে/ছাপাতে পারবে)।
- [ ] 47.1 রিপোর্ট আর্কিটেক্ট: outline জেনারেট (সেকশন/চার্ট/টেবিল স্লট) → প্রতি সেকশন আলাদা কলে লেখা → সংযোজন
- [ ] 47.2 চার্ট সংযোগ: data → SVG chart (Phase 36.1) → ডকুমেন্টে embed
- [ ] 47.3 ফরম্যাট ম্যাট্রিক্স: md (সবসময়) + PDF/DOCX (Phase 21) + html (preview)
- [ ] 47.4 সম্পাদকীয় গেট: সংখ্যা-সামঞ্জস্য চেক (টেবিল vs টেক্সট), সূত্র-উপস্থিতি, টোন-নীতি (সহজ বাংলা)
- [ ] 47.5 ভার্শনিং: report:<id>:v1/v2 + diff
- [ ] 47.6 live proof: Block A-এর 30-phase রিপোর্ট নিজেই এই ইঞ্জিনে তৈরি
**মাপকাঠি:** মালিকের রায় — "এটা পেশাদার দেখায়"। **ঝুঁকি:** সেলাই-ফারাক (সেকশন জোড়া) — সম্পাদক গেট।

### Phase 48 — Bot Factory (Telegram/Discord বট বানানোর কারখানা)
**লক্ষ্য:** মালিকের rashel-zayan-bot ধরনের প্রজেক্ট দ্রুত বানানো-চালানো।
- [ ] 48.1 bot টেমপ্লেট (Phase 26-এ যোগ): Telegram long-polling (worker cron-trigger প্যাটার্ন, webhook নয় — ফ্রি সীমায় সহজ)
- [ ] 48.2 command router + conversation state (kv session)
- [ ] 48.3 jujubrain সংযোগ: বটের উত্তর = brain.solve cascade (মালিকের এজেন্ট-ব্রেন রিইউজ)
- [ ] 48.4 admin panel প্যাটার্ন (ছোট web UI, Phase 38 auth-lite)
- [ ] 48.5 deploy recipe: CF Worker (আলাদা) বা এই worker-এ route — ট্রেডঅফ ডক
- [ ] 48.6 live proof: একটা নতুন কার্যকর বট (মালিকের আইডিয়া) লাইভ
**মাপকাঠি:** মালিকের ফোনে বট উত্তর দিচ্ছে। **ঝুঁকি:** টোকেন নিরাপত্তা — vault প্যাটার্ন।

### Phase 49 — Interactive/Game ক্ষমতা
**লক্ষ্য:** কুইজ/গেম/ইন্টারঅ্যাকটিভ কনটেন্ট (admission-quiz-platform উত্তরসূরি)।
- [ ] 49.1 canvas-free গেম প্যাটার্ন: DOM/SVG ভিত্তিক ছোট গেম ইঞ্জিন (zero-dep)
- [ ] 49.2 কুইজ ইঞ্জিন v2: প্রশ্ন-ব্যাংক স্কিমা, স্পেসড-রিপিটিশন (SM-2 ফ্রি অ্যালগরিদম), স্কোরবোর্ড
- [ ] 49.3 শব্দ-সংকেত (Phase 22 TTS + ছোট beep synth sandbox-এ)
- [ ] 49.4 offline-first কুইজ (Phase 37 sync)
- [ ] 49.5 live proof: ভর্তি-প্রস্তুতির একটা মিনি-কুইজ গেম লাইভ (মালিকের ডোমেইন)
**মাপকাঠি:** ফোনে মসৃণ খেলা যায়। **ঝুঁকি:** perf বাজেট (Phase 41)।

### Phase 50 — EdTech Suite (মালিকের ডোমেইনে গভীরতা)
**লক্ষ্য:** ভর্তি/পড়াশোনা অ্যাপগুলোর (admission-*, studymate, vocabulary-master, english-academy) সহযোগে যুগ্ম শক্তি।
- [ ] 50.1 subject-matter index: ভর্তি সিলেবাস/প্রশ্নব্যাংক স্ট্রাকচার kv/repo-তে (মালিকের উপকরণ থেকে)
- [ ] 50.2 question generator: পাঠ্য → MCQ/সংক্ষিপ্ত (গুণমান গেট: brain.race ২ মডেল + judge)
- [ ] 50.3 wrong-answer diagnosis: ভুল থেকে দুর্বল-টপিক শনাক্ত → অনুশীলন-প্রস্তাব
- [ ] 50.4 study planner: সময়-বাজেট → দিনভিত্তিক রুটিন (mem.* preference সংযোগ)
- [ ] 50.5 cross-app SSO-lite (Phase 38 ভিত্তিতে মালিকের অ্যাপগুলোর মধ্যে)
- [ ] 50.6 live proof: একটা ভর্তি-টপিকে জেনারেটেড কুইজ + পরিকল্পনা মালিকের ফোনে
**মাপকাঠি:** মালিক/তার শিক্ষার্থী ব্যবহার করেছে। **ঝুঁকি:** কনটেন্ট শুদ্ধতা — উৎস-যাচাই গেট।

### Phase 51 — Cross-Project Knowledge Transfer
**লক্ষ্য:** এক প্রজেক্টের শিক্ষা সব প্রজেক্টে — ভুল পুনরাবৃত্তি নয়।
- [ ] 51.1 lessons KB: প্রতি mission/প্রজেক্ট-শেষে অটো "শিখলাম" এক্সট্রাক্ট → `lessons:<topic>` kv (mem.* প্যাটার্ন)
- [ ] 51.2 সন্ধান: নতুন প্রজেক্টের architect stage-এ প্রাসঙ্গিক lessons অটো-inject
- [ ] 51.3 প্যাটার্ন লাইব্রেরি: সমাধান-প্যাটার্ন (auth, sync, deploy…) ট্যাগসহ
- [ ] 51.4 anti-pattern তালিকা: "এটা কখনো করো না" (আমাদের Errors & Dead Ends উত্তরাধিকার)
- [ ] 51.5 হাইজিন: ডুপ্লিকেট মার্জ, বাসি শিক্ষা মেয়াদ (Phase 78 temporal memory-র বীজ)
- [ ] 51.6 live proof: নতুন মিশনে পুরনো শিক্ষা উদ্ধৃত হওয়ার উদাহরণ
**মাপকাঠি:** অন্তত ৩টা বাস্তব পুনঃব্যবহার। **ঝুঁকি:** ভুল শিক্ষা প্রচার — মালিক-ভেটো ফ্ল্যাগ।

### Phase 52 — Project Health Score + Tech Debt Mapper
**লক্ষ্য:** প্রতি প্রজেক্টের স্বাস্থ্য সংখ্যায় (P3-8) + ঋণের ম্যাপ (P4-66)।
- [ ] 52.1 স্কোর মডেল: quality (verify/test pass %), security (sec.scan), perf (perf.audit), freshness (last deploy/commit), debt (TODO/FIXME/complexity heuristics) → 0–100
- [ ] 52.2 `project.health`: যেকোনো indexed repo-র স্কোরকার্ড + "আজকের শীর্ষ ৩ সমস্যা"
- [ ] 52.3 debt items kv-তে টিকেট-আকারে (mission-এ রূপান্তরযোগ্য)
- [ ] 52.4 সাপ্তাহিক health digest (Phase 18 digest-এ যোগ)
- [ ] 52.5 ট্রেন্ড: স্কোরের ইতিহাস চার্ট (status.html)
- [ ] 52.6 live proof: Admission Hub + অন্তত ২টা অন্য repo-র স্কোরকার্ড
**মাপকাঠি:** সংখ্যা যাচাইযোগ্য (হাতে মিলিয়ে দেখা)। **ঝুঁকি:** heuristic ভুল — মানদণ্ড ডক-এ খোলা।

### Phase 53 — Large-Scale Refactoring Engine
**লক্ষ্য:** শত-ফাইল সমন্বিত পরিবর্তন নিরাপদে (P2-K75, P4-75)।
- [ ] 53.1 refactor plan compiler: লক্ষ্য → affected-files (twin.impact) → ধাপ-ক্রম (DAG) → risk প্রতি ধাপে
- [ ] 53.2 ছোট-ঝোঁক নীতি: প্রতি commit ≤N ফাইল, প্রতি ধাপে test gate, ব্যর্থতায় থামা
- [ ] 53.3 codemod প্যাটার্ন: name-change/signature-move এর জন্য নির্ভরযোগ্য regex/AST-lite স্ক্রিপ্ট (sandbox node)
- [ ] 53.4 shadow verify: refactor-এর পরে behavior-সমতা স্মোক (আগে/পরে একই টেস্ট সেট)
- [ ] 53.5 প্রত্যাহার-পথ: ধাপ-ভিত্তিক revert তালিকা অটো-তৈরি
- [ ] 53.6 live proof: একটা বাস্তব repo-তে ১০+ ফাইলের নিরাপদ রিফ্যাক্টর
**মাপকাঠি:** টেস্ট অক্ষত + উদ্দেশ্য পূরণ। **ঝুঁকি:** বিস্তার-ফোলা — minimal-change নীতি (P2-AT)।

### Phase 54 — Migration Engine (API/framework/dependency)
**লক্ষ্য:** "পুরনো থেকে নতুন"-এ স্থানান্তর (P4-76/77/78/79)।
- [ ] 54.1 usage discovery: পুরনো API/ডিপেন্ডেন্সির সব ব্যবহার twin+grep ম্যাপ
- [ ] 54.2 compat matrix: নতুন ভার্সনের breaking-change তালিকা (changelog reading — Phase 23)
- [ ] 54.3 migration recipe জেনারেট: প্রতি usage-এ রূপান্তর-প্যাচার্ন
- [ ] 54.4 ধাপে ধাপে প্রয়োগ (Phase 53 ইঞ্জিন রিইউজ) + test gate
- [ ] 54.5 deprecated detector: আর ব্যবহৃত নয় চিহ্নিত → অপসারণ প্রস্তাব
- [ ] 54.6 live proof: একটা বাস্তব ডিপেন্ডেন্সি/API মাইগ্রেশন (মালিকের repo-তে)
**মাপকাঠি:** মাইগ্রেশন সম্পূর্ণ + টেস্ট সবুজ। **ঝুঁকি:** hidden usage — discovery গভীরতা।

### Phase 55 — Ghost Bug Hunter + Performance Profiler
**লক্ষ্য:** কেউ বলেনি এমন বাগ খোঁজা (P3-9/10) — "বাগ-ফিক্সার" থেকে "বাগ-আবিষ্কারক"।
- [ ] 55.1 স্ট্যাটিক শিকার: error-handling হারানো, race-suspect pattern, duplicate call, dead branch (regex+AST-lite rules)
- [ ] 55.2 রানটাইম শিকার: console-এরর/নেটওয়ার্ক-ব্যর্থতা ক্যাপচার (Phase 24) প্রধান পাতায়
- [ ] 55.3 perf শিকার: বড় DOM, ধীর স্ক্রিপ্ট (long-task অনুমান), oversized asset (Phase 41 ডেটা)
- [ ] 55.4 রিপোর্ট: severity+evidence+প্রস্তাবিত ফিক্স → টিকেট kv (Phase 52.3)
- [ ] 55.5 মালিক-অনুমোদনে অটো-ফিক্স মিশন (Phase 53 চেইন)
- [ ] 55.6 nightly run (watchman-এ যোগ) + সাপ্তাহিক শিকার-রিপোর্ট
- [ ] 55.7 live proof: Admission Hub-এ অন্তত ৩টা অজানা সমস্যা শনাক্ত (যাচাইযোগ্য)
**মাপকাঠি:** ধরা সমস্যা মানুষ সম্মতি দিয়েছে "এটা সত্যিই ছিল"। **ঝুঁকি:** noise — severity ফিল্টার।

### Phase 56 — Incident Commander v2
**লক্ষ্য:** ক্রস-সার্ভিস বিপর্যয় ব্যবস্থাপনা (P3-19 বিস্তার)।
- [ ] 56.1 incident timeline অটো-গঠন: audit+jobs+deployments+TG লগ মিলিয়ে "কী কখন"
- [ ] 56.2 deployment correlate: সমস্যা-শুরুর আগে শেষ ৩ deploy — সম্ভাব্য কারণ স্কোর
- [ ] 56.3 recovery playbook: rollback/provision-switch/feature-off প্রস্তাব (প্রয়োগ approved গেটে)
- [ ] 56.4 freeze মোড উন্নত: incident-এ শুধু CRITICAL job (আছে) + নতুন deploy আটকে
- [ ] 56.5 post-mortem জেনারেট: কারণ/প্রভাব/প্রতিকার/শিক্ষা → lessons KB (Phase 51)
- [ ] 56.6 live proof: একটা ড্রিল (কৃত্রিম incident) — শনাক্ত→timeline→প্রস্তাব→post-mortem
**মাপকাঠি:** ড্রিল রিপোর্ট মালিক-অনুমোদিত। **ঝুঁকি:** ভুল কারণ-দোষারোপ — স্কোর সীমা-সহ।

### Phase 57 — Stakeholder Deliverables (মানুষের জন্য পণ্য)
**লক্ষ্য:** প্রজেক্টের ফলাফল মানুষের ভাষায় — ডেমো পেজ, চেঞ্জলগ, হ্যান্ডওভার।
- [ ] 57.1 ডেমো-পেজ জেনারেটর: প্রতি লাইভ প্রজেক্টে "এটা কী/কেন/কীভাবে" পাতা (টেমপ্লেট)
- [ ] 57.2 per-project CHANGELOG (Phase 10.7 tool প্রজেক্ট-জেনেরিক)
- [ ] 57.3 handover doc: setup/deploy/rollback/keys-location(redacted)/known-limits — প্রতি প্রজেক্টে
- [ ] 57.4 screenshot-tour জেনারেট (browserless ধাপে ধাপে স্ক্রিন)
- [ ] 57.5 release notes সংক্ষিপ্ত বাংলা (মালিকের ভাষা-নীতি)
- [ ] 57.6 live proof: বিদ্যমান এক প্রজেক্টের পূর্ণ handover সেট
**মাপকাঠি:** বাইরের মানুষ ডক পড়ে চালাতে পারবে (মালিক পরীক্ষা)। **ঝুঁকি:** বাসি ডক — mission-শেষে অটো-রিফ্রেশ।

### Phase 58 — Portfolio: ৩ বাস্তব প্রজেক্ট লাইভ
**লক্ষ্য:** Block B-এর চূড়ান্ত প্রয়োগ — তিনটে সত্যিকারের ব্যবহৃত প্রজেক্ট।
- [ ] 58.1 মালিকের সাথে বাছাই: ৩টা আইডিয়া (তার ডোমেইন: শিক্ষা/পরিবার/ব্যক্তিগত টুল) — scope চুক্তি
- [ ] 58.2 প্রজেক্ট ১: ধারণা→লাইভ (Phase 31 চেইন) + ১ সপ্তাহ পরিচালনা (health/digest)
- [ ] 58.3 প্রজেক্ট ২: ভিন্ন শ্রেণির (content/API/dashboard) — একই চেইন
- [ ] 58.4 প্রজেক্ট ৩: জটিলতম (multi-user বা data-heavy)
- [ ] 58.5 প্রতিটিতে: perf/sec/SEO/ডক (Phase 41–43, 57) বাধ্যতামূলক
- [ ] 58.6 মালিকের ব্যবহার-রিপোর্ট (১ সপ্তাহ পরে) → উন্নতি মিশন
- [ ] 58.7 portfolio পেজ (সব প্রজেক্টের ইনডেক্স — status.html সম্প্রসারণ)
**মাপকাঠি:** ৩টা URL মালিকের হাতে, অন্তত ১টা নিয়মিত ব্যবহৃত। **ঝুঁকি:** একসাথে বেশি — ক্রমিক।

### Phase 59 — Retrospective Engine
**লক্ষ্য:** প্রতি বড় কাজের পরে নিজে থেকে শেখা (P4 + Part-5 A)।
- [ ] 59.1 retro টেমপ্লেট: লক্ষ্য ছিল কী / হলো কী / ফারাক কেন / কী রাখব / কী বদলাব
- [ ] 59.2 অটো-ডেটা সংগ্রহ: mission log+metrics+escalation+টোকেন-খরচ → retro ড্রাফট
- [ ] 59.3 সমালোচক ধাপ: brain.critic retro-তে ("আত্মপ্রশংসা ধরো")
- [ ] 59.4 কর্ম-আইটেম → lessons KB / নতুন phase প্রস্তাব / anti-pattern
- [ ] 59.5 মালিক-ফিডব্যাক স্লট (তার রায় সংরক্ষণ)
- [ ] 59.6 live proof: Block B-এর retro সম্পূর্ণ চক্র
**মাপকাঠি:** অন্তত ২টা কর্ম-আইটেম পরের phase-এ বাস্তবায়িত। **ঝুঁকি:** ফাঁকা আনুষ্ঠানিকতা — ডেটা-বাধ্যতামূলক।

### Phase 60 — Block-B চূড়ান্ত অডিট
**লক্ষ্য:** "যেকোনো বড় প্রজেক্ট" দাবির সংখ্যায় যাচাই।
- [ ] 60.1 ম্যাট্রিক্স: প্রজেক্ট-শ্রেণি × সক্ষমতা (scaffold/build/deploy/auth/data/perf/sec/docs) → ✅🟡❌
- [ ] 60.2 ৩টা portfolio প্রজেক্টের চূড়ান্ত health score
- [ ] 60.3 blueprint Part-4 Phase-1/5 (vision) বাদে বাকি কভারেজ পুনর্গণনা
- [ ] 60.4 গ্যাপ থেকে Block C-তে নতুন ধাপ প্রস্তাব (যদি লাগে)
- [ ] 60.5 FINAL-AUDIT-BLOCK-B.md + মালিক-সারাংশ (PDF)
- [ ] 60.6 উদযাপন নীতি: মালিকের অনুমোদনে ছোট ছুটি 😄
**মাপকাঠি:** মালিকের রায় — "এখন যেকোনো অ্যাপ ধরতে পারবে"। **ঝুঁকি:** আত্মতুষ্টি — কঠোর সমালোচক।

---
_পরবর্তী: `C1-PHASES-61-75.md` — বিশ্ব-টপ এজেন্টদের ব্রেইন/স্কিল।_
