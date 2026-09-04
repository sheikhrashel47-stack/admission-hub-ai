# 🟣 BLOCK C (২/২) — Phase 76–90: জ্ঞান, মেমরি, ইন্টেলিজেন্স ও প্রশিক্ষণ

---

### Phase 76 — Vector/Embedding RAG
**লক্ষ্য:** keyword-এর বাইরে অর্থ-ভিত্তিক খোঁজা (P1-25, P2-D16, P5-K) — DEEP-RESEARCH গ্যাপ #4 বন্ধ।
- [ ] 76.1 ফ্রি embedding পথ গবেষণা: Gemini embedding API (ফ্রি কোটা), OpenRouter ফ্রি মডেল, বা worker-ভিত্তিক হালকা (hash/TF-IDF+BM25) — তুলনা ডক
- [ ] 76.2 ভেক্টর স্টোরেজ: D1-এ BLOB ভেক্টর + brute-force cosine (ছোট কর্পাস) vs sqlite-vec (sandbox) — স্কেল-হিসাবসহ সিদ্ধান্ত
- [ ] 76.3 chunker: ফাইল/ডক → সেমান্টিক চাঙ্ক (হেডিং-সীমানা, ≤512 টোকেন)
- [ ] 76.4 `rag.index/query` টুল: hybrid (keyword twin + vector) র‍্যাংক-ফিউশন
- [ ] 76.5 twin আপগ্রেড: repo ফাইলের chunk-ভেক্টর (quota গভর্নরসহ, Phase 27 প্যাটার্ন)
- [ ] 76.6 citation বাধ্যতামূলক: rag.query ফলাফলে source+chunk-id
- [ ] 76.7 live proof: "স্মৃতি/ডিপ্লয় সম্পর্কিত কোথায় কোথায় কী আছে" ধরনের অর্থ-প্রশ্নে keyword-এর চেয়ে ভালো ফল দেখানো
**মাপকাঠি:** hybrid > keyword-only প্রমাণ (৫টা প্রশ্নে)। **ঝুঁকি:** কোটা — batch embedding রাতে।

### Phase 77 — Private Knowledge Base Engine
**লক্ষ্য:** মালিকের নিজস্ব জ্ঞানভাণ্ডার (ডক/নোট/বই) — আলাদা, অনুমতি-সীমায়িত, উদ্ধৃতিসহ উত্তর (P5-K)।
- [ ] 77.1 KB স্ট্রাকচার: collection→document→chunk; আপলোড পথ (UI file + TG document + Drive sync পুনরায়)
- [ ] 77.2 OCR/PDF পার্সিং চেইন (Gemini vision + sandbox pdftotext ফ্রি)
- [ ] 77.3 public/private পৃথকীকরণ: private KB কখনো পাবলিক উত্তরে নয় (PERM স্কোপ)
- [ ] 77.4 KB versioning: ডক আপডেট = পুরনো চাঙ্ক বাতিল
- [ ] 77.5 উত্তর-টেমপ্লেট: "তোমার KB অনুযায়ী… (সূত্র: doc#chunk)"
- [ ] 77.6 live proof: মালিকের একটা বাস্তব ডকসেট আপলোড→প্রশ্নোত্তর
**মাপকাঠি:** উদ্ধৃতি মিলিয়ে দেখা গেছে। **ঝুঁকি:** বড় PDF কোটা — ধাপে পার্স।

### Phase 78 — Memory Pro (স্কিমা/আস্থা/সময়/দ্বন্দ্ব)
**লক্ষ্য:** P2-E + P4-113/114/115/138/139 — মেমরি পরিপক্বতা।
- [ ] 78.1 স্কিমা v2: প্রতি memory = {id, type: fact|preference|decision|episode|procedure, text, confidence H/M/L, source, created, valid_until?, superseded_by?}
- [ ] 78.2 temporal: valid_until/superseded — পুরনো তথ্য অটো-চিহ্নিত ("API v1 old")
- [ ] 78.3 conflict detection: নতুন memory যোগে বিদ্যমানের সাথে মিল/বিরোধ চেক (rag+critic) → বিরোধ হলে প্রমাণ-ভিত্তিক সমাধান বা মালিককে প্রশ্ন
- [ ] 78.4 dedupe+decay: ডুপ্লিকেট মার্জ (occurrences কাউন্ট), নিম্ন-ব্যবহৃত memory priority-down (মুছে নয়)
- [ ] 78.5 confidence propagation: অনিশ্চিত উৎসের তথ্য H পায় না
- [ ] 78.6 mem.* টুল আপগ্রেড (backward-compat রেখে)
- [ ] 78.7 live proof: বিরোধ-শনাক্ত ও সমাধানের বাস্তব উদাহরণ + decay রিপোর্ট
**মাপকাঠি:** ভুল-বাসি স্মৃতি ধরা পড়েছে। **ঝুঁকি:** over-merge — মানুয়াল ভেটো ফ্ল্যাগ।

### Phase 79 — Memory Reasoning
**লক্ষ্য:** একাধিক স্মৃতি যুক্ত করে সিদ্ধান্ত (P4-146/147) — "তুমি আগে বলেছিলে X, পরে Y — তাহলে এখন Z?"
- [ ] 79.1 retrieval-augmented reasoning: প্রশ্ন→প্রাসঙ্গিক memories (rag)→যুক্তি-চেইন→উত্তর (উদ্ধৃতিসহ)
- [ ] 79.2 contradiction-aware উত্তর: বিরোধ থাকলে লুকানো নয়, দেখানো
- [ ] 79.3 decision memory সংযোগ: বড় সিদ্ধান্তের আগে "অতীতে কী ঠিক হয়েছিল" অটো-চেক (P4-117)
- [ ] 79.4 preference inference: পুনরাবৃত্ত পছন্দ থেকে প্রোফাইল আপডেট প্রস্তাব (মালিক-অনুমোদনে)
- [ ] 79.5 টেস্ট সেট: ১০টা বহু-স্মৃতি যুক্তি প্রশ্ন (golden-এ যোগ)
- [ ] 79.6 live proof: টেস্ট সেট ≥70%
**মাপকাঠি:** উদ্ধৃতিসহ সঠিক যুক্তি। **ঝুঁকি:** ভুল ইনফারেন্স — প্রস্তাব-মাত্র, প্রয়োগ অনুমোদনে।

### Phase 80 — Model Intelligence v2
**লক্ষ্য:** মডেল-ফ্লাকচুয়েশনে স্বয়ংক্রিয় বুদ্ধিমত্তা (P2-AA/AB + আমাদের বেঞ্চ উত্তরাধিকার)।
- [ ] 80.1 অটো-বেঞ্চ ক্যালেন্ডার: সাপ্তাহিক brain.bench (হালকা, quota-সচেতন) → registry ট্রেন্ড
- [ ] 80.2 capability registry v2: coding/reasoning/vision/follow/speed/reliability স্কোর + দৈনিক 429-হার
- [ ] 80.3 রাউটার আপগ্রেড: task-type × capability × quota → মডেল বাছাই (শুধু cascade-ক্রম নয়)
- [ ] 80.4 নতুন ফ্রি মডেল স্কাউট: মাসিক গবেষণা মিশন ("নতুন ফ্রি প্রোভাইডার/মডেল এসেছে?") → bench → যোগ/বাদ
- [ ] 80.5 cost governor সংযোগ (Phase 14) — স্কোর/খরচ অনুপাতে সেরা
- [ ] 80.6 live proof: রাউটার-সিদ্ধান্তের ব্যাখ্যা লগ ("কেন এই মডেল")
**মাপকাঠি:** quota-মরণেও সেবা অক্ষত (ড্রিল)। **ঝুঁকি:** registry বাসি — TTL।

### Phase 81 — Consensus/Debate Engine v2
**লক্ষ্য:** high-value সিদ্ধান্তে একাধিক মডেলের ঐকমত্য/বিতর্ক (P2-3/S, P4-205)।
- [ ] 81.1 consensus মোড: ৩ মডেলের উত্তর → মিল/অমিল ম্যাপ → সংখ্যাগরিষ্ঠ+বিরোধী-মত রিপোর্ট
- [ ] 81.2 debate মোড: A বনাম B সমাধান → রাউন্ড-বিতর্ক (২ রাউন্ড, bounded) → judge রায়
- [ ] 81.3 ট্রিগার নীতি: শুধু high-value (deploy-সিদ্ধান্ত, বড় রিফ্যাক্টর, অর্থ-সদৃশ ফ্লো) — quota বাঁচাতে
- [ ] 81.4 brain.race-এর সাথে একত্রীকরণ (race=দ্রুত সেরা, debate=গভীর যাচাই)
- [ ] 81.5 খরচ-রিপোর্ট: প্রতি debate-এর টোকেন হিসাব
- [ ] 81.6 live proof: একটা বাস্তব কঠিন সিদ্ধান্তে debate রায় + পরবর্তী ফলাফল মিল
**মাপকাঠি:** একক-মডেলের চেয়ে ভালো সিদ্ধান্তের অন্তত ১টা প্রমাণ কেস।

### Phase 82 — Daily Self-Practice Missions (মালিকের পুরনো দাবি!)
**লক্ষ্য:** জুজু প্রতিদিন নিজে অনুশীলন করে শেখে — ফ্রি ইনফ্রায় "training"।
- [ ] 82.1 practice কিউরিয়াটর: skill registry (Phase 61) + গ্যাপ-অডিট + lessons KB থেকে আজকের ১–৩টা অনুশীলন-কাজ বাছাই
- [ ] 82.2 হৃদস্পন্দন-সংযোগ: রাতের watchman-এ practice mission (non-prod, ws/ডেমো-স্কোপে, away-mode নীতি মেনে)
- [ ] 82.3 স্ব-মূল্যায়ন: অনুশীলনের ফল golden-style স্কোরে → lessons KB-তে শিক্ষা
- [ ] 82.4 অগ্রগতি-লগ: `practice:<date>` kv + সাপ্তাহিক উন্নতি-চার্ট (status.html)
- [ ] 82.5 নিরাপত্তা: practice কখনো prod/main-repo ছোঁবে না — sandbox/ws/demo-branch only
- [ ] 82.6 মালিক-রিপোর্ট: প্রতি সপ্তাহে "এই সপ্তাহে যা শিখলাম" TG digest
- [ ] 82.7 live proof: ৭ দিনের অবিচ্ছিন্ন practice লগ + স্কোর-ট্রেন্ড
**মাপকাঠি:** স্কোরে দৃশ্য উন্নতি (golden/pct বা practice স্কোর)। **ঝুঁকি:** quota অপচয় — বাজেট কঠিন (দিনে ≤3 ছোট কাজ)।

### Phase 83 — Lessons Auto-Capture + Error Memory v2
**লক্ষ্য:** প্রতি ব্যর্থতা/সফলতা থেকে অটো শিক্ষা সংগ্রহ (P4-85, Phase 15.4 বিস্তার)।
- [ ] 83.1 auto-capture hook: mission escalate/safety-abort/gate-fail ঘটনায় অটো lesson ড্রাফট (কী/কেন/প্রতিকার)
- [ ] 83.2 সফলতা-প্যাটার্ন: সফল মিশন থেকে "কী কাজ করল" এক্সট্রাক্ট
- [ ] 83.3 dedupe+লিংক: একই প্যাটার্নের শিক্ষা মার্জ, সংশ্লিষ্ট কমিট/মিশন রেফারেন্স
- [ ] 83.4 retrieval সংযোগ: একই ধরনের কাজে অটো-ইনজেক্ট (Phase 51.2 গভীর)
- [ ] 83.5 শিক্ষা-কার্যকারিতা মাপা: একই ভুল দ্বিতীয়বার হয়েছে কিনা ট্র্যাক
- [ ] 83.6 live proof: "একই ভুল দ্বিতীয়বার এড়ানো হয়েছে" বাস্তব কেস
**মাপকাঠি:** পুনরাবৃত্ত ভুলের হার কমেছে (সংখ্যায়)।

### Phase 84 — Planning Engine v2
**লক্ষ্য:** বিকল্প প্ল্যান, নির্ভরতা ও সীমাবদ্ধতা-যুক্তি (P2-B4–8)।
- [ ] 84.1 alternative plans: বড় কাজে A/B/C প্ল্যান → তুলনা ম্যাট্রিক্স (ঝুঁকি/সময়/quota/jetিলতা) → বাছাই+কারণ
- [ ] 84.2 dependency reasoning: "A ছাড়া B নয়" অটো-শনাক্ত (DAG-এ রূপান্তর, Phase 7 সংযোগ)
- [ ] 84.3 constraint extraction: মালিকের নির্দেশ থেকে explicit constraints (কী নষ্ট করা যাবে না) → প্ল্যানে lock (P2-AR requirement lock)
- [ ] 84.4 plan critic v2: শুধু FIX নয় — প্রতি বিকল্পে স্কোর
- [ ] 84.5 scope drift guard: চলমান মিশনে নতুন দাবি এলে "এটা এই মিশনের বাইরে — নতুন মিশন?" প্রশ্ন
- [ ] 84.6 live proof: একটা বড় কাজে A/B/C তুলনা রিপোর্ট + বাছাইয়ের যৌক্তিকতা
**মাপকাঠি:** মালিকের রায় "পরিকল্পনা আগের চেয়ে গভীর"।

### Phase 85 — Self-Reflection Loops
**লক্ষ্য:** কাজের আগে/পরে আত্ম-পরীক্ষা (P2-C9–11)।
- [ ] 85.1 pre-action: প্রতি risk≥MEDIUM টুল-কলের আগে ১-লাইন "কেন এই টুল, প্রত্যাশা কী" লগ
- [ ] 85.2 post-action: ফলাফল প্রত্যাশা মিলল কিনা অটো-চেক (expectation field)
- [ ] 85.3 mismatch → strategy change: ২ বার অমিল = ভিন্ন পথ (অন্ধ পুনরাবৃত্তি নয়)
- [ ] 85.4 reflection budget: ছোট মডেলে দ্রুত চেক (quota সচেতন)
- [ ] 85.5 audit-এ reflection ফিল্ড
- [ ] 85.6 live proof: mismatch→পরিবর্তন কেস স্টাডি
**মাপকাঠি:** অন্ধ-পুনরাবৃত্তি কমেছে (লগ প্রমাণ)।

### Phase 86 — Golden Suite 350
**লক্ষ্য:** P2-AD মাপকাঠি: 100 coding + 100 reasoning + 100 research + 50 UI-task — বিশ্ব-মানের নিজস্ব বেঞ্চমার্ক।
- [ ] 86.1 জেনারেটর পাইপলাইন: টেমপ্লেট+মডেল দিয়ে খসড়া → মানুষ(মালিক)/critic ভেটো → চূড়ান্ত (একসাথে 350 জেনারেট নয়, ব্যাচে)
- [ ] 86.2 স্কোরার v2: keyword+regex+সংখ্যা-নরমালাইজ (বাংলা সংখ্যা সমস্যা ফিক্স)+মডেল-judge (খোলা উত্তরে)
- [ ] 86.3 ভাগ: smoke(20)/standard(100)/full(350) — পরিস্থিতিভিত্তিক রান
- [ ] 86.4 সংস্করণ-নিয়ন্ত্রণ: suite v1/v2 — তুলনা একই suite-এ (ইতিহাস অক্ষুণ্ণ)
- [ ] 86.5 research-task যাচাই: সূত্র-উপস্থিতি স্কোরিং (Phase 23 সংযোগ)
- [ ] 86.6 UI-task: qa.gate-ভিত্তিক স্বয়ংক্রিয় চেক
- [ ] 86.7 live proof: full রান (রাতে, ব্যাচে) → বেসলাইন রিপোর্ট
**মাপকাঠি:** 350 task সম্পূর্ণ, রান-যোগ্য, সংস্করণড। **ঝুঁকি:** quota — রাতের ব্যাচ + ক্যাশ।

### Phase 87 — Eval Lab v2 (auto regression block)
**লক্ষ্য:** কোনো আপডেট স্কোর কমালে সেটা prod-এ যেতেই পারবে না (P2-AD/AH শক্ত রূপ)।
- [ ] 87.1 release pipeline-এ eval গেট: self-deploy (Phase 13) আগে standard(100) রান → পুরনো wv-এর সাথে তুলনা
- [ ] 87.2 regression = auto-block + auto-rollback-প্রস্তাব + incident রিপোর্ট
- [ ] 87.3 per-skill স্কোর: কোন দক্ষতা পড়ল (skill-wise breakdown)
- [ ] 87.4 A/B প্রম্পট টেস্ট: প্রম্পট-পরিবর্তনের প্রভাব মাপা (ভার্শনড প্রম্পট)
- [ ] 87.5 eval-history ড্যাশবোর্ড (status.html চার্ট)
- [ ] 87.6 live proof: ইচ্ছাকৃত খারাপ প্রম্পট-পরিবর্তন গেটে আটকেছে ড্রিল
**মাপকাঠি:** খারাপ আপডেট আটকেছে (ড্রিল প্রমাণ)।

### Phase 88 — Training Pipeline (agent versioning + safe update/rollback)
**লক্ষ্য:** P2-AG/AH পূর্ণ: জুজুর "প্রম্পট/টুল/রাউটিং/স্কিল/নীতি" সবকিছুর ভার্শন — v-next ব্যর্থ হলে v-stable-এ ফেরা।
- [ ] 88.1 agent manifest: `agent:manifest` kv = {wv, prompts-version, skills-version, routing-version, policies-version, suite-version}
- [ ] 88.2 প্রতি পরিবর্তনে manifest bump + kv snapshot (agent:manifest:<wv>)
- [ ] 88.3 `agent.rollback`: আগের manifest+worker blob ফেরত (এক কলে, approved gate)
- [ ] 88.4 ক্যানারি রিলিজ: নতুন সংস্করণ আগে preview/নিজের-উপর (non-prod missions) → eval PASS → prod
- [ ] 88.5 রিলিজ-নোট অটো (changelog সংযোগ)
- [ ] 88.6 live proof: v(n)→v(n+1)→ব্যর্থতা-ড্রিল→rollback পূর্ণ চক্র
**মাপকাঠি:** rollback এক কলে, ডেটা অক্ষত।

### Phase 89 — Zero-Trust + Injection Defense v2
**লক্ষ্য:** P5-Z + P2-87/88 পরিপূর্ণ: বাইরের সব ইনপুট সন্দেহভাজন।
- [ ] 89.1 injection classifier: web.read/file/TG ইনপুটে "নির্দেশ-সদৃশ টেক্সট" শনাক্ত (heuristic+small-model) → ট্যাগ untrusted
- [ ] 89.2 untrusted isolation: ট্যাগ করা কনটেন্ট কখনো tool-নির্দেশ হিসেবে parse হবে না (আর্কিটেকচার-গ্যারান্টি + টেস্ট)
- [ ] 89.3 exfiltration guard: outbound কলে secret প্যাটার্ন + অপ্রত্যাশিত ডোমেইনে ডেটা পাঠানো আটকে
- [ ] 89.4 file-safety: আপলোড টাইপ/সাইজ/malware-heuristic (সীমা সৎভাবে)
- [ ] 89.5 red-team suite: ২০টা আক্রমণ-প্রচেষ্টা টেস্ট (golden-এ যোগ)
- [ ] 89.6 live proof: red-team suite রান — সব আটকেছে/ট্যাগ হয়েছে
**মাপকাঠি:** বাইপাস শূন্য (জানা পদ্ধতিতে)। **ঝুঁকি:** নতুন আক্রমণ-ভেক্টর — বিনয়ী ডক।

### Phase 90 — Block-C চূড়ান্ত অডিট (বিশ্ব-তুলনা)
**লক্ষ্য:** "টপ এজেন্টদের মতো" দাবির যাচাই — বাইরের মানদণ্ডে।
- [ ] 90.1 পাবলিক এজেন্ট-বেঞ্চমার্ক গবেষণা (research session): বর্তমান বিশ্বের টপ এজেন্টদের প্রকাশ্য মূল্যায়ন পদ্ধতি কী
- [ ] 90.2 সম্ভাব্যগুলোতে নিজের স্কোর (যেগুলো ফ্রি-ইনফ্রায় সম্ভব — সৎ সীমাসহ)
- [ ] 90.3 capability matrix v2: DEEP-RESEARCH-এর ৩৮ গ্যাপ-গ্রুপের হালনাগাদ অবস্থা
- [ ] 90.4 golden-350 full রান + পূর্ব-সংস্করণ তুলনা
- [ ] 90.5 FINAL-AUDIT-BLOCK-C.md + মালিক-সারাংশ (PDF, রিপোর্ট ইঞ্জিনে)
- [ ] 90.6 Block D-র জন্য প্রস্তুতি-যাচাই (personality layer-এর ভিত্তি আছে কিনা)
**মাপকাঠি:** মালিকের রায় + সংখ্যাসঙ্গত অডিট। **ঝুঁকি:** তুলনা অসম (ফ্রি vs কর্পোরেট) — সৎ ফ্রেমিং।

---
_পরবর্তী: `D-PHASES-91-100.md` — মানুষের মতো জুজু।_
