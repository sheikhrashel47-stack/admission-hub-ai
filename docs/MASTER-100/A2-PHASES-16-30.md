# 🔵 BLOCK A (২/২) — Phase 16–30: বিল্ডার-প্যারিটি থেকে বিল্ডার-অতিক্রম

---

### Phase 16 — Crash Recovery v2 (চেঞ্জপয়েন্ট থেকে জীবন ফেরত)
**লক্ষ্য:** worker/tick/mission যেকোনো স্তরে মরে গেলে হারানো কাজ শূন্য (P2-U, P4-193)।
- [ ] 16.1 mission checkpoint v2: প্রতি stage-এর পরে পূর্ণ স্টেট (ctx সহ) kv-তে — বর্তমান আছে, যাচাই+টেস্ট
- [ ] 16.2 worker restart detection: boot-এ `agent:boot` kv stamp — অস্বাভাবিক gap হলে TG-তে "আমি ফিরেছি" রিপোর্ট
- [ ] 16.3 queue crash-safe: running job ১০ মিনিট পেরোলে auto-requeue (tries সীমা মেনে)
- [ ] 16.4 tick overlap guard: চলমান tick থাকলে নতুন tick skip (lock আছে — edge case টেস্ট)
- [ ] 16.5 recovery drill: ইচ্ছাকৃতভাবে মাঝপথে mission ফেলে (কল না করে) পরের কলে ঠিক জায়গা থেকে চালু প্রমাণ
- [ ] 16.6 live proof: drill-এর সম্পূর্ণ লগ + TG রিপোর্ট
**মাপকাঠি:** drill-এ শূন্য কাজ হারিয়েছে। **ঝুঁকি:** kv স্টেট বাসি — timestamp+consistency check।

### Phase 17 — Observability v2 (নিজের ভেতরটা দেখা)
**লক্ষ্য:** প্রতি কল/টুল/মিশনের সময়-টোকেন-ফলাফলের পূর্ণ দৃশ্যমানতা (P2-AC) + status.html-কে আসল ড্যাশবোর্ড বানানো।
- [ ] 17.1 per-call metric store: tool, model, ms, tokens, quota-tag, result → kv (7-day rollup)
- [ ] 17.2 rollup job (heartbeat-এ): ঘণ্টা/দিন ভিত্তিক সারাংশ — ops.stats v2
- [ ] 17.3 `/api/status-public` (redacted, no secrets): health+wv+quota%+last-mission+golden-pct — status.html-এর ব্যাকেন্ড
- [ ] 17.4 status.html আপডেট মিশন (জুজু নিজে code.edit দিয়ে করবে — Phase 2/10 প্রয়োগ): quota bars, mission feed, eval history
- [ ] 17.5 alert thresholds: 429-হার >20%/ঘণ্টা বা golden <50% হলে TG সতর্কতা
- [ ] 17.6 live proof: মালিকের ফোনে status.html-এ লাইভ সংখ্যা (স্ক্রিনশট TG-তে)
**মাপকাঠি:** ড্যাশবোর্ডে বাস্তব ডেটা, ফেব্রিকেশন নেই। **ঝুঁকি:** পাবলিক এন্ডপয়েন্টে leak — redaction টেস্ট বাধ্যতামূলক।

### Phase 18 — Notification Intelligence
**লক্ষ্য:** সবকিছুতে পিং নয় — গুরুত্ব বুঝে তাৎক্ষণিক/স্বাভাবিক/সারসংক্ষেপ (P4-242, P5-N)।
- [ ] 18.1 নোটিফিকেশন শ্রেণি: CRITICAL (incident/escalation) → তাৎক্ষণিক; PROGRESS (mission done/deploy) → স্বাভাবিক; DIGEST (stats/quota) → দৈনিক সারসংক্ষেপ
- [ ] 18.2 quiet hours (মালিক-সেট, ডিফল্ট রাত ১১–সকাল ৮) — CRITICAL ছাড়া চুপ
- [ ] 18.3 dedupe: একই ঘটনার পুনরাবৃত্তি ১ ঘণ্টায় ১ বার
- [ ] 18.4 digest job (heartbeat): দিনের সারাংশ প্রতি সন্ধ্যায় TG-তে
- [ ] 18.5 preference kv + চ্যাট কমান্ড ("নোটিফিকেশন কমাও")
- [ ] 18.6 live proof: digest বার্তা + quiet-hour suppression টেস্ট
**মাপকাঠি:** মালিকের কাছে স্প্যাম কমেছে, জরুরি খবর ঠিকই পৌঁছেছে। **ঝুঁকি:** সংকট চুপ পড়া — CRITICAL সর্বদা exempt।

### Phase 19 — Clarification Protocol (ask_user সমকক্ষ)
**লক্ষ্য:** অস্পষ্ট নির্দেশে অনুমান নয় — গঠনমূলক প্রশ্ন (বিল্ডারের ask_user-এর সমকক্ষ, চ্যাট-ভিত্তিক)।
- [ ] 19.1 ambiguity detector: mission/agent নির্দেশে ঘাটতি স্কোর (টার্গেট নেই? ফাইল নেই? মানদণ্ড নেই?) — ছোট মডেলে দ্রুত চেক
- [ ] 19.2 structured question ফরম্যাট: ২–৪টা বিকল্প + মুক্ত উত্তর, চ্যাট কার্ডে রেন্ডার (client v24-এ ছোট UI যোগ — Phase 10 প্রয়োগ)
- [ ] 19.3 উত্তর-সংযোজন: মালিকের উত্তর mission ctx-এ মার্জ → ধাপ চালু
- [ ] 19.4 awaiting-answer state (WAIT_FOR_USER-এর বাস্তব রূপ, P2-BF) + টাইমআউটে স্মার্ট ডিফল্ট (সতর্কতাসহ)
- [ ] 19.5 প্রশ্ন-বাজেট: মিশনে ≤3 প্রশ্ন (নাহলে জ্বালাতন)
- [ ] 19.6 live proof: ইচ্ছাকৃত অস্পষ্ট নির্দেশে জুজু প্রশ্ন করল, উত্তরে কাজ শেষ করল
**মাপকাঠি:** ভুল অনুমানের বদলে প্রশ্ন — প্রমাণসহ। **ঝুঁকি:** অতিপ্রশ্ন — বাজেট কঠিন।

### Phase 20 — Image Pipeline v1
**লক্ষ্য:** ছবি আনা-খোঁজা-সংরক্ষণ-দেখানো (generation নয় — সেটা Phase 25+/C-block; এখানে pipeline)।
- [ ] 20.1 `img.fetch`: URL → worker-এ ডাউনলোড → mime/size যাচাই → ws/kv-blob-এ জমা (≤2MB)
- [ ] 20.2 `img.search`: ফ্রি সোর্চ (Wikimedia/Openverse API keyless where possible) → img.fetch
- [ ] 20.3 `/api/img/:id` সার্ভিং (owner/public ফ্ল্যাগ) — UI/প্রিভিউতে ব্যবহার
- [ ] 20.4 vision সংযোগ: প্রতি আপলোডে web.eye auto-caption (প্রয়োজনে)
- [ ] 20.5 ছবি-সহ রিপোর্ট: TG sendPhoto + status.html গ্যালারি
- [ ] 20.6 live proof: একটা রিপোর্টে বাস্তব ছবি (সোর্সসহ) খুঁজে-এনে-দেখানো
**মাপকাঠি:** end-to-end ছবি প্রবাহ। **ঝুঁকি:** কপিরাইট — সোর্স লাইসেন্স মেটাডেটা বাধ্যতামূলক।

### Phase 21 — Document Engine (DOCX/XLSX/PPTX/PDF)
**লক্ষ্য:** অফিস ডকুমেন্ট তৈরি-রূপান্তর (P5-D/F, P4-227) — sandbox-এর পাইথন লাইব্রেরি দিয়ে (python-docx/openpyxl/python-pptx/reportlab — সব ফ্রি)।
- [ ] 21.1 `doc.generate`: {kind: docx|xlsx|pptx|pdf, spec (স্ট্রাকচার JSON), content} → sandbox-এ লাইব্রেরি রান → artifact (Phase 4)
- [ ] 21.2 টেমপ্লেট সেট: রিপোর্ট/ইনভয়েস/চেকলিস্ট/স্লাইড-ডেক (বাংলা ফন্ট সাপোর্ট যাচাই — Noto Sans Bengali embed)
- [ ] 21.3 রূপান্তর: md→pdf, csv→xlsx (সহজ রূপান্তর সেট)
- [ ] 21.4 বিতরণ: TG sendDocument + download লিংক (owner-gated)
- [ ] 21.5 mission report আপগ্রেড: বড় মিশনের রিপোর্ট PDF-এও
- [ ] 21.6 live proof: একটা বাস্তব বাংলা রিপোর্ট DOCX+PDF — মালিকের ফোনে ডাউনলোড হয়েছে
**মাপকাঠি:** মালিক ডকুমেন্ট খুলে পড়েছেন (TG কনফার্মেশন)। **ঝুঁকি:** বাংলা লিগেচার রেন্ডার — ফন্ট-embed টেস্ট আগে।

### Phase 22 — Voice Integration (TTS/STT ফ্রি-টায়ার)
**লক্ষ্য:** কণ্ঠ দেওয়া-কণ্ঠ শোনা (P4-243, P5-G/M) — সততার সাথে: এজেন্টের নিজের ভয়েস ক্লোন নয়, সেবা-ভিত্তিক।
- [ ] 22.1 ফ্রি TTS অনুসন্ধান ও নির্বাচন (Edge-TTS প্যাটার্ন/Google translate-TTS/অন্য keyless — গুণমান+বাংলা যাচাই; গবেষণা মিশন)
- [ ] 22.2 `voice.say`: টেক্সট → অডিও artifact → TG voice নোটিশ + UI প্লেয়ার
- [ ] 22.3 STT: মালিকের ভয়েস নোট (TG bot ভয়েস মেসেজ) → ফ্রি transcription (Whisper API ফ্রি নয় — বিকল্প: TG-এর নিজস্ব বা browser Web Speech; সীমা সৎভাবে ডক)
- [ ] 22.4 ভয়েস-কমান্ড প্রোটোটাইপ: ছোট নির্দেশ সেট ("স্ট্যাটাস দাও", "মিশন চালাও") → intent
- [ ] 22.5 quiet-hours/পছন্দ সংযোগ (Phase 18)
- [ ] 22.6 live proof: জুজুর কণ্ঠে মিশন-সারাংশ মালিকের ফোনে পৌঁছেছে
**মাপকাঠি:** বাংলা স্পষ্ট শোনায়। **ঝুঁকি:** ফ্রি সেবা ভঙ্গুর — fallback chain (TTS-এও!)।

### Phase 23 — Research Suite v2 (প্রমাণ-ভিত্তিক গবেষণা)
**লক্ষ্য:** P2-AZ/BB + P4-151–170: গবেষণা = সেশন, সূত্র-বিশ্বাস, ক্রস-চেক, উদ্ধৃতি।
- [ ] 23.1 research session object: {id, question, sub-questions, sources[], claims[], state} kv-তে — resume সাপোর্ট ("কালকের গবেষণা চালাও")
- [ ] 23.2 query decomposition: প্রশ্ন → ৩–৫ উপ-প্রশ্ন (brain.solve) → প্রতিটায় web.search
- [ ] 23.3 source trust ranking: official docs>primary>reputable>community — ডোমেইন-হিউরিস্টিক + রিপোর্টে ট্যাগ
- [ ] 23.4 claim-evidence mapping: প্রতি দাবিতে সূত্র-লিংক; unsourced দাবি রিপোর্টে ফ্ল্যাগ
- [ ] 23.5 cross-verification: গুরুত্বপূর্ণ দাবিতে ২য় সূত্র; বিরোধ হলে resolver (নতুন/primary জেতে)
- [ ] 23.6 completion detection: যথেষ্ট প্রমাণ? → synthesize : আরও খোঁজো (bounded)
- [ ] 23.7 আউটপুট: উদ্ধৃতি+লিংকসহ বাংলা রিপোর্ট → mem.save + চাইলে doc.generate (Phase 21)
- [ ] 23.8 live proof: একটা বাস্তব গবেষণা ("২০২৭ সালের ফ্রি এজেন্ট-ইনফ্রা ল্যান্ডস্কেপ") পূর্ণ সেশনে
**মাপকাঠি:** প্রতি দাবিতে সূত্র; পুনরায় চালু করে দেখানো। **ঝুঁকি:** ওভার-সার্চ বাজেট — সীমা কঠিন।

### Phase 24 — Browser Suite v2 (DOM/console/network)
**লক্ষ্য:** স্ক্রিনশটের বাইরে গিয়ে পাতার ভেতরটা দেখা (P2-I54–56, P4-171–179)।
- [ ] 24.1 browserless-এ স্ক্রিপ্ট মোড: evaluate/extract (DOM query → JSON), console logs, network requests — এক স্ক্রিপ্ট পেলোডে
- [ ] 24.2 `web.dom`: {url, selectors[]} → টেক্সট/অ্যাট্রিবিউট এক্সট্রাক্ট (স্ক্রিনশট নয়, ডেটা)
- [ ] 24.3 `web.console`: লোড-এরর/ওয়ার্নিং ক্যাপচার → qa.error সংযোগ
- [ ] 24.4 form-fill প্রোটোটাইপ: {url, fields} → type/click (browserless script) — শুধু মালিকের অনুমোদিত ডোমেইনে
- [ ] 24.5 pagination/scroll ইন্টেল: তালিকা-পাতায় ধাপে ধাপে এক্সট্রাক্ট (duplicate avoid)
- [ ] 24.6 ডোমেইন allowlist নীতি (নিরাপত্তা): যাচাই-পূর্ব অনুমোদিত সাইটেই interaction
- [ ] 24.7 live proof: একটা বাস্তব সাইট থেকে টেবিল-ডেটা এক্সট্রাক্ট → xlsx (Phase 21)
**মাপকাঠি:** console-এরর ধরা পড়েছে স্ক্রিনশটের আগে। **ঝুঁকি:** anti-bot সাইট — সীমা স্বীকার, forced নয়।

### Phase 25 — Vision Deep Suite
**লক্ষ্য:** P4 Phase-1/5-এর vision গভীরতা: ফিডেলিটি স্কোর, ডিজাইন টোকেন, তুলনা-ম্যাট্রিক্স।
- [ ] 25.1 `qa.fidelity`: রেফারেন্স স্ক্রিনশট vs বাস্তব → ক্রাইটেরিয়া-ভিত্তিক স্কোর (layout/spacing/typography/color) %
- [ ] 25.2 `qa.tokens`: স্ক্রিনশট থেকে ডিজাইন টোকেন অনুমান (রং প্যালেট/স্পেসিং/রেডিয়াস) — pixel-sample + vision
- [ ] 25.3 device matrix v2: ৫ ভিউপোর্টে (375/414/768/1024/1440) অটো স্কোর-কার্ড
- [ ] 25.4 a11y visual audit: কনট্রাস্ট রেশিও (pixel গণনা), টাচ-টার্গেট সাইজ, টেক্সট-সাইজ
- [ ] 25.5 screenshot archive: প্রতি ডেপলয়ে প্রধান স্ক্রিন kv/ws-এ (৩ সংস্করণ রাখা) — "৩ ডেপলয় ধরে nav বদলাচ্ছে" ধরার ভিত্তি
- [ ] 25.6 mission visual-stage সংযোগ: UI-মিশনে ready-গেটে qa.fidelity ≥ threshold
- [ ] 25.7 live proof: status.html-এর fidelity স্কোরকার্ড + আগের UI-র সাথে তুলনা
**মাপকাঠি:** ভিজ্যুয়াল সমস্যা মানুষের আগে ধরা পড়েছে। **ঝুঁকি:** vision 429/quota — ছোট ক্রপে বিশ্লেষণ।

### Phase 26 — Template Library (প্রজেক্ট বীজ)
**লক্ষ্য:** নতুন প্রজেক্ট = শূন্য থেকে নয় — প্রমাণিত স্টার্টার থেকে (Block B-এর ভিত্তি)।
- [ ] 26.1 টেমপ্লেট রেপো/ডিরেক্টরি সিদ্ধান্ত: `templates/` (এই repo) vs আলাদা repo — ট্রেডঅফ ডক
- [ ] 26.2 প্রথম ৫ টেমপ্লেট (নিজেই assemble করবে — Phase 1 প্রয়োগ): static-pwa, vite-react, worker-api (D1+auth প্যাটার্ন), docs-site, telegram-bot
- [ ] 26.3 প্রতি টেমপ্লেটে: manifest.json (ফাইল-গ্রাফ, ভ্যারিয়েবল স্লট, বিল্ড কমান্ড) + README + স্মোক টেস্ট
- [ ] 26.4 `project.scaffold`: {template, name, vars} → ws/repo-তে ফাইল-সেট জেনারেট → build স্মোক
- [ ] 26.5 টেমপ্লেট ক্যাটালগ UI (status.html-এ সেকশন)
- [ ] 26.6 live proof: scaffold → build → preview (Phase 4/5 চেইন) এক মিশনে
**মাপকাঠি:** ৫ টেমপ্লেট স্মোক-পাস। **ঝুঁকি:** বাসি টেমপ্লেট — প্রতি Block-শেষে রিফ্রেশ নীতি।

### Phase 27 — Multi-Repo Twin (১৭ repo-র জ্ঞান)
**লক্ষ্য:** মালিকের সব repo (private সহ) জুজুর মাথায় — twin index সবগুলোতে (মালিকের পুরনো দাবি)।
- [ ] 27.1 inventory auto-sync: gh.repos → kv `repos:index` (নাম/ভাষা/আকার/শেষ আপডেট) — heartbeat-এ সাপ্তাহিক রিফ্রেশ
- [ ] 27.2 twin.index multi-repo: প্রতি repo-তে (সাইজ-অনুযায়ী বাছাই — বড় repo-তে গুরুত্বপূর্ণ ফাইল আগে) index → `twin:<repo>:*` keys
- [ ] 27.3 quota গভর্নর: D1 write-সীমা মেনে batched indexing (দিনে ≤2 repo)
- [ ] 27.4 cross-repo search: twin.search-এ repo ফিল্টার + "সব repo-তে খোঁজো" মোড
- [ ] 27.5 repo health snapshot: প্রতি repo-র শেষ কমিট/ওপেন ইস্যু/ভাষা মিশেল → digest-এ
- [ ] 27.6 live proof: মালিকের অন্য একটা repo (যেমন studymate-web) সম্পর্কে প্রশ্নের উত্তর twin থেকে
**মাপকাঠি:** ১৭ repo index বা সীমা-সহ সৎ তালিকা। **ঝুঁকি:** quota — ধাপে ধাপে, রিপোর্টে অগ্রগতি।

### Phase 28 — Secrets & Environment Governance
**লক্ষ্য:** মালিকের পুরো ক্লাউড-পরিবেশের নিরাপদ উদ্ভাবন (মালিকের পুরনো দাবি: full Cloudflare account)।
- [ ] 28.1 `cf.inv` (Phase 9.1) পূর্ণাঙ্গ: accounts, pages projects, workers, D1, KV, R2, DNS, tokens-scope রিপোর্ট (READ-ONLY)
- [ ] 28.2 key rotation প্রোটোকল: প্রতি secret-এ বয়স ট্র্যাক; ৯০ দিনে রোটেশন-প্রস্তাব TG-তে (প্রয়োগ মালিকের হাতে)
- [ ] 28.3 secret exposure scan: repo ইতিহাসে leak খোঁজা (gh.search + regex sweep) — পাওয়া গেলে incident flow
- [ ] 28.4 env reconciliation: worker-এর প্রত্যাশিত env vs প্রকৃত (agent.envcheck v2) → boot-এ সতর্কতা
- [ ] 28.5 permission map ডক: কোন টোকেনে কী ক্ষমতা — ন্যূনতম-অধিকার পর্যালোচনা
- [ ] 28.6 live proof: সম্পূর্ণ inventory রিপোর্ট (redacted) মালিককে
**মাপকাঠি:** মালিক জানেন তার ক্লাউডে কী আছে; জুজুও জানে। **ঝুঁকি:** token scope কম — ঘটতি সৎভাবে রিপোর্ট।

### Phase 29 — Gauntlet: "যেকোনো repo → ফিক্স → ডেপ্লই"
**লক্ষ্য:** Block A-এর সম্মিলিত পরীক্ষা — বাস্তব প্রমাণ যে জুজু এখন বিল্ডার-সমকক্ষ।
- [ ] 29.1 gauntlet নীতিমালা: মালিক যেকোনো repo+যেকোনো কাজ বেছে দেবে (বা জুজু প্রস্তাব করবে, মালিক অনুমোদন)
- [ ] 29.2 রাউন্ড ১: মালিকের নিজের এক repo-তে বাস্তব ফিচার/ফিক্স (full mission: DAG→edit→build→preview→approve→deploy→verify)
- [ ] 29.3 রাউন্ড ২: ভিন্ন ভাষার প্রজেক্ট (যেমন Python rashel-zayan-bot বা Swift admission-plan-widget-এ ডক/টেস্ট কাজ)
- [ ] 29.4 রাউন্ড ৩: বড় ফাইল-অপারেশন (১,০০০+ লাইন জেনারেশন বা multi-file refactor)
- [ ] 29.5 প্রতি রাউন্ডে metric: সময়, ধাপ, escalation, মানুষের হস্তক্ষেপ সংখ্যা, গুণমান স্কোর
- [ ] 29.6 ব্যর্থ রাউন্ড = নতুন phase প্রস্তাব (প্ল্যান জীবন্ত)
- [ ] 29.7 চূড়ান্ত প্রতিবেদন মালিককে (PDF — Phase 21 প্রয়োগ)
**মাপকাঠি:** ৩/৩ রাউন্ড সফল বা সৎ ব্যর্থতা-বিশ্লেষণসহ ২/৩। **ঝুঁকি:** repo-ভেদে অপ্রত্যাশিত বিল্ড — Phase 4 ক্যাশ।

### Phase 30 — Block-A চূড়ান্ত অডিট (বিল্ডার-প্যারিটি স্কোরকার্ড)
**লক্ষ্য:** DEEP-RESEARCH-V34 অংশ-২-এর ১০টা গ্যাপ বনাম অর্জন — সংখ্যায় রায়।
- [ ] 30.1 গ্যাপ-টেবিল পুনর্মূল্যায়ন: ১০টার প্রতিটায় এখন ✅/🟡/❌ + প্রমাণ-লিংক
- [ ] 30.2 নতুন স্কোর: "বিল্ডার-প্যারিটি %" (ওজনসহ) + ব্লুপ্রিন্ট Part-1 স্কোর হালনাগাদ (৭৪% থেকে কত?)
- [ ] 30.3 golden suite পুনঃরান (full 20) + eval compare v30 baseline-এর সাথে
- [ ] 30.4 selftest + gate + regression সবুজ যাচাই
- [ ] 30.5 FINAL-AUDIT-BLOCK-A.md ডক + মালিককে বাংলা সারসংক্ষেপ
- [ ] 30.6 পরবর্তী ব্লকের জন্য শিখেছি-তালিকা সংযোজন (Block B ফাইলে)
**মাপকাঠি:** মালিকের রায় — "হ্যাঁ, এখন যেকোনো অ্যাপ ধরতে পারবে"। **ঝুঁকি:** আত্মতুষ্টি — কঠোর সমালোচক (brain.critic + বাইরের তুলনা)।

---
_পরবর্তী: `B1-PHASES-31-45.md` — শুধু Admission Hub নয়, যেকোনো বড় প্রজেক্ট।_
