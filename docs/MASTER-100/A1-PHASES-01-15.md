# 🔵 BLOCK A (১/২) — Phase 1–15: বিল্ডারের সমান শক্তি
> লক্ষ্য (মালিকের নির্দেশ #1): জুজু যেন **যেকোনো অ্যাপ/ওয়েবসাইট, যত বড়ই হোক** — পরিবর্তন/আপডেট/কমিট/ডিপ্লই করতে পারে, হুবহু বিল্ডারের (Arena.ai এজেন্ট) মতো বা তার চেয়ে শক্তিশালীভাবে।
> ভিত্তি-তথ্য: `docs/DEEP-RESEARCH-V34.md` অংশ ২ (বিল্ডারের ১০টা সক্ষমতা যা জুজুর নেই)।
> নিয়ম: প্রতি phase শেষে live proof + `[x]` + কমিট + "PHASE X COMPLETE — WAITING FOR OWNER APPROVAL"।

---

### Phase 1 — File-Assembler Engine (হাজার-লাইন কোড লেখার ক্ষমতা)
**লক্ষ্য:** ~২৫০ লাইন/কল-এর সীমা ভেঙে ৫,০০০+ লাইনের ফাইল ধাপে ধাপে জোড়া লাগিয়ে লেখা (P4-217)।
- [ ] 1.1 নতুন টুল `code.assemble`: স্পেক {path, spec (বাংলা/ইংরেজি বর্ণনা), outline?} → outline ধাপ (brain.solve) → প্রতি chunk (≤২০০ লাইন) brain.sub coder iters:1 → জোড়া → মোট লাইন/সিনট্যাক্স রিপোর্ট
- [ ] 1.2 chunk-সীমানা নিরাপত্তা: প্রতি chunk-এর পরে syntax-increment check (JS হলে bracket-balance counter; অন্য ভাষায় sandbox `node --check`/`python -m py_compile` অংশবিশেষে)
- [ ] 1.3 cross-chunk রেফারেন্স verify: ডিক্লেয়ার্ড ফাংশন/ভ্যারিয়েবল নামের সেট মিলিয়ে "undefined reference" রিপোর্ট
- [ ] 1.4 assemble ফলাফল kv-তে draft হিসেবে জমা (`draft:<id>`), চূড়ান্তকরণে gh.commit/deploy আলাদা ধাপ (সরাসরি commit নয়)
- [ ] 1.5 ব্যর্থ chunk = শুধু সেই chunk পুনর্জননা (পুরো ফাইল নয়) — bounded retry ২×
- [ ] 1.6 PERM (MEDIUM/POLICY) + অডিট + wv bump
- [ ] 1.7 live proof: ১,০০০+ লাইনের একটা বাস্তব utility ফাইল (যেমন বাংলা টেক্সট-প্রসেসিং লাইব্রেরি) assemble → syntax pass → repo-তে কমিট
**মাপকাঠি:** ≥১,০০০ লাইনের ফাইল এক মিশনে বিশুদ্ধ সিনট্যাক্সসহ তৈরি। **ঝুঁকি:** chunk seam-এ স্টাইল ফারাক — outline+নাম-সেট verify-তে ঠিক হবে।

### Phase 2 — Fuzzy-Edit Engine v2 (বড় ফাইলে সার্জিক্যাল এডিট)
**লক্ষ্য:** বিল্ডারের edit_file-এর সমকক্ষ: যেকোনো আকারের ফাইলে old→new প্রতিস্থাপন, whitespace-সহনশীল, multi-hunk, diff-preview, undo।
- [ ] 2.1 নতুন টুল `code.edit`: {repo, branch, path, edits:[{find, replace, count?}]} → ghApi read (full) → প্রতি edit-এ exact match, না পেলে normalized match (whitespace collapse) → replace
- [ ] 2.2 multi-hunk: এক কলে ≤10 edits, সব মিললে তবেই commit (all-or-nothing)
- [ ] 2.3 diff-preview মোড (dry:true) → unified diff রিপোর্ট, commit নয়
- [ ] 2.4 undo: commit-পূর্ব কনটেন্ট kv-তে `undo:<repo>:<path>` (7 দিন TTL) + `code.edit {undo:true}`
- [ ] 2.5 সিনট্যাক্স গেট: JS ফাইলে এডিটের পরে sandbox check (ফাইল ≤60KB হলে); বড় হলে bracket-balance heuristic
- [ ] 2.6 mission implement stage-এ নতুন file-mode: {path, edits[]} — window-surgery-র সাধারণ রূপ
- [ ] 2.7 live proof: নিজের worker ফাইলেই একটা নিরাপদ এডিট (কমেন্ট-লাইন যোগ) dry→apply→undo চক্র
**মাপকাঠি:** ১৯০KB ফাইলে ৩-hunk এডিট + undo এক মিশনে। **ঝুঁকি:** ambiguous match — count/first-match নীতি + dry-run বাধ্যতামূলক ডক।

### Phase 3 — Persistent Workspace FS (জুজুর নিজের ফাইলসিস্টেম)
**লক্ষ্য:** সেশন-ছাড়াই টিকে থাকা কাজের জায়গা — বিল্ডারের /home/user-এর সমকক্ষ (repo-ভিত্তিক, সস্তা)।
- [ ] 3.1 ডিজাইন সিদ্ধান্ত: workspace = repo-র ভিতরে `workspace/` ডিরেক্টরি (gh API) নাকি D1-blob FS? — ট্রেডঅফ ডক (read/write সংখ্যা, D1 100k write/day সীমা)
- [ ] 3.2 নতুন টুল `ws.*`: write/read/list/delete/move (path-based, ≤1MB/ফাইল, kv/D1-blob ব্যাকেন্ড)
- [ ] 3.3 sandbox সংযোগ: agent.shell স্ক্রিপ্টের আগে ws ফাইলগুলো runner-এ ডাউনলোড (base64 payload বা wget-from-worker এন্ডপয়েন্ট)
- [ ] 3.4 nightly snapshot → vault ব্যাকআপে যোগ (3-vault প্যাটার্ন)
- [ ] 3.5 quota গভর্নর: মোট সাইজ ক্যাপ (যেমন 20MB) + LRU eviction রিপোর্ট
- [ ] 3.6 live proof: এক সেশনে ফাইল লিখে পরের দিনের tick-এ পড়া (heartbeat job দিয়ে যাচাই)
**মাপকাঠি:** ws ফাইল ২৪ ঘণ্টা পরেও অক্ষত + sandbox-এ ব্যবহৃত। **ঝুঁকি:** D1 write-quota — ক্যাপ+স্ন্যাপশট ক্যাশিং।

### Phase 4 — Build Sandbox v2 (npm/pip install + cache + artifact)
**লক্ষ্য:** ephemeral sandbox → আসল বিল্ড এনভায়রনমেন্ট: ডিপেন্ডেন্সি ইনস্টল, ক্যাশ, আর্টিফ্যাক্ট সংরক্ষণ।
- [ ] 4.1 runner workflow আপডেট: actions/cache (key = lockfile hash) node_modules/.venv ক্যাশ
- [ ] 4.2 `agent.build` টুল: {repo?, setup (install cmds), build cmd, artifact paths} → sandbox রান → আর্টিফ্যাক্ট base64/zip → kv/ws-এ জমা (≤5MB)
- [ ] 4.3 আর্টিফ্যাক্ট বিতরণ: worker এন্ডপয়েন্ট `/api/artifact/:id` (owner-gated) — পরে CF Pages preview-তে আপলোডের ভিত্তি
- [ ] 4.4 বিল্ড-লগ বিশ্লেষণ: প্রথম অর্থপূর্ণ error extraction (P4-80) → রিপোর্টে "কেন ব্যর্থ"
- [ ] 4.5 ব্যর্থতায় ১-রাউন্ড auto-fix প্রস্তাব (agent.repair প্যাটার্ন) — প্রয়োগ approval-সাপেক্ষ
- [ ] 4.6 live proof: একটা ছোট Vite প্রজেক্ট ws/repo-তে scaffold → `npm install && npm run build` → dist আর্টিফ্যাক্ট সংরক্ষিত
**মাপকাঠি:** দ্বিতীয় বিল্ডে ক্যাশ-হিটে সময় অর্ধেক। **ঝুঁকি:** Actions ক্যাশ 10GB সীমা — কী-রোটেশন নীতি।

### Phase 5 — Preview Hosting (ক্লায়েন্ট লাইভ প্রিভিউ)
**লক্ষ্য:** বিল্ডারের live-preview সমকক্ষ: বিল্ড আর্টিফ্যাক্ট → পাবলিক URL → মালিক ব্রাউজারে দেখবে → ভিজ্যুয়াল গেট।
- [ ] 5.1 CF Pages-এ দ্বিতীয় প্রজেক্ট `juju-preview` (ফ্রি) — ডিরেক্ট আপলোড API (`POST /accounts/{acc}/pages/projects/juju-preview/deployments`, manifest+files)
- [ ] 5.2 `preview.deploy` টুল: {artifactId|wsDir, alias} → আপলোড → `https://<alias>.juju-preview.pages.dev` URL রিপোর্ট (approved-gate: MEDIUM)
- [ ] 5.3 `preview.qa`: ওই URL-এ qa.scene/qa.gate/browserless স্ক্রিনশট → রিপোর্ট
- [ ] 5.4 TTL নীতি: প্রিভিউ ৭ দিন, তারপর তালিকা থেকে বাদ (deployment delete)
- [ ] 5.5 টেলিগ্রামে প্রিভিউ লিংক পাঠানো (mission report-এ যোগ)
- [ ] 5.6 live proof: Phase 4-এর Vite dist → preview URL → স্ক্রিনশট ভেরিফিকেশন
**মাপকাঠি:** মালিক ফোনে লিংক খুলে বিল্ড দেখতে পেরেছেন (TG-তে প্রমাণ)। **ঝুঁকি:** direct-upload API ফরম্যাট জটিল — ডক অনুযায়ী manifest ধাপে ধাপে।

### Phase 6 — Process ও Log Management
**লক্ষ্য:** দীর্ঘজীবী কাজ পর্যবেক্ষণ — বিল্ড/টেস্ট/স্ক্রাপার যেন "চালাও আর ভুলে যাও" না হয়।
- [ ] 6.1 `job logs v2`: প্রতি job/mission stage-এর আউটপুট kv-তে পূর্ণাঙ্গ (বর্তমান 4KB ছেঁদা → টেইল+হেড+রেফারেন্স)
- [ ] 6.2 `ops.follow`: চলমান job-এর লগ টেলিং পোলিং এন্ডপয়েন্ট (SSE নয় — সাধারণ incremental read)
- [ ] 6.3 long-task progress রিপোর্টিং: mission stage-ভিত্তিক শতকরা + TG-তে মাইলস্টোন নোটিফিকেশন (P4-198)
- [ ] 6.4 timeout/watchdog: stage-সময়সীমা (ডিফল্ট 120s) পেরোলে kill+escalate নীতি
- [ ] 6.5 live proof: একটা ইচ্ছাকৃত ধীর কাজ (৩ মিনিটের sandbox sleep-poll) follow করে দেখানো
**মাপকাঠি:** মালিক TG-তে লাইভ অগ্রগতি দেখেছেন। **ঝুঁকি:** poll-লুপ CPU — budget বাউন্ড।

### Phase 7 — Multi-File DAG Coordination
**লক্ষ্য:** একসাথে অনেক ফাইলের সমন্বিত পরিবর্তন — নির্ভরতা-সচেতন ক্রমে (P4-208)।
- [ ] 7.1 mission v2 স্পেক: files[] → nodes {id, path, deps:[ids], mode:create|edit|bugfix, spec}
- [ ] 7.2 architect stage আপগ্রেড: ফাইল-গ্রাফ + ক্রম নির্ধারণ (topological sort) — gemini দিয়ে প্ল্যান, critic গেট
- [ ] 7.3 implement stage: ক্রম অনুযায়ী প্রতি node; প্রতি node-এর পরে cross-reference check (নাম-সেট মেলানো)
- [ ] 7.4 ব্যর্থ node → নির্ভরশীল node স্কিপ + আংশিক-সফল রিপোর্ট (সব-না-কিছুই না নয়)
- [ ] 7.5 ট্রানজ্যাকশন নীতি: সব node সফল না হলে commit না করে draft-এ রাখা মোড (args.atomic)
- [ ] 7.6 live proof: ৩-ফাইলের একটা ছোট প্রজেক্ট (html+css+js) এক মিশনে, deps সহ
**মাপকাঠি:** নির্ভরতা ভাঙলে সঠিক আচরণ (স্কিপ/রোলব্যাক) প্রমাণিত। **ঝুঁকি:** জটিল গ্রাফে মডেল-প্ল্যান ভুল — critic+cycle-detection।

### Phase 8 — Git Mastery (branch/PR/bisect/diff)
**লক্ষ্য:** ব্লুপ্রিন্টের "GitHub first-class" পূর্ণ করা (P1-31/32, P3-7)।
- [ ] 8.1 `gh.diff`: দুই ref/কমিটের মধ্যে ফাইল-তালিকা + patch (API compare) → review.diff-এ খাওয়ানো যায়
- [ ] 8.2 `gh.pr`: create/list/status (PAT scope যাচাই আগে) — PR-ভিত্তিক নিরাপদ ফ্লো (মালিক চাইলে merge নিজে)
- [ ] 8.3 `gh.log`: ফাইল-ভিত্তিক কমিট ইতিহাস + "এই লাইন কে কবে বদলাল" (blame API)
- [ ] 8.4 `gh.bisect-lite`: রেঞ্জ কমিট থেকে সন্দেহভাজন regression কমিট শনাক্ত (diff+critic বিশ্লেষণ; আসল bisect রান নয়)
- [ ] 8.5 mission-এ branch মোড: implement → নতুন branch → PR → postverify → approval-এ merge
- [ ] 8.6 live proof: এই repo-তেই একটা ডেমো branch+PR খুলে বন্ধ করা (বাস্তব কমিটসহ)
**মাপকাঠি:** PR ফ্লো এক মিশনে end-to-end। **ঝুঁকি:** merge = APPROVAL gate — কখনো অটো নয়।

### Phase 9 — Deploy Intelligence v2 (যেকোনো টার্গেটে নিরাপদ ডেপলয়)
**লক্ষ্য:** শুধু নিজের repo নয় — যেকোনো CF Pages প্রজেক্ট/GH Pages repo-তে বিল্ড→ডিপ্লই→ভেরিফাই→রোলব্যাক (P3-18)।
- [ ] 9.1 `cf.inv`: পুরো CF অ্যাকাউন্ট inventory — projects, deployments, DNS zones, workers (মালিকের পুরনো দাবি; READ-ONLY)
- [ ] 9.2 CF Pages build_config API পড়া/লেখা (জানা এন্ডপয়েন্ট) — বিল্ড কমান্ড/আউটপুট ডির পরিবর্তন approved-gate-এ
- [ ] 9.3 `deploy.target` জেনেরিক টুল: {kind:'cf-pages'|'gh-pages', project/repo, source: artifactId|branch, verify:{url, expect}}
- [ ] 9.4 deploy পরে অটো post-verify + ব্যর্থতায় অটো-rollback প্রস্তাব (প্রয়োগ approved ছাড়া নয়)
- [ ] 9.5 deployment-history ইন্টেল: আগের deployment-এর সাথে health তুলনা (P8 incident-এর বিস্তার)
- [ ] 9.6 live proof: juju-preview প্রজেক্টে (Phase 5) একটা নতুন বিল্ড ডেপলয়→ভেরিফাই→রোলব্যাক চক্র
**মাপকাঠি:** "Deployment verified: PASS" + রোলব্যাক একই মিশনে। **ঝুঁকি:** CF API scope — টোকেনে permissions যাচাই আগে।

### Phase 10 — UI Autonomy (নিজের ক্লায়েন্ট নিজে বদলানো)
**লক্ষ্য:** client v24 (gh-pages root index.html) — জুজু নিজে নিরাপদে UI ফিচার যোগ/ফিক্স করতে পারবে।
- [ ] 10.1 UI বেসলাইন স্ন্যাপশট: প্রধান ৫টা স্ক্রিনের browserless স্ক্রিনশট + DOM-অ্যাংকর তালিকা kv-তে
- [ ] 10.2 `code.edit` (Phase 2) UI ফাইলে প্রয়োগ-নীতি: ছোট হাঙ্ক, প্রতি এডিটে qa.gate
- [ ] 10.3 ভিজ্যুয়াল রিগ্রেশন গেট: এডিটের আগে/পরে স্ক্রিনশট compare — অপ্রত্যাশিত পরিবর্তন ধরা
- [ ] 10.4 রোলব্যাক রিফ্লেক্স: UI ভাঙলে আগের blob ফেরত (১ কলে)
- [ ] 10.5 মালিকের স্থায়ী পছন্দ-চেকলিস্ট (কোনো chip-row নয়, flat feed, RAW কোড…) — এডিটের আগে অটো-সতর্কতা
- [ ] 10.6 live proof: একটা ছোট নিরাপদ UI উন্নতি (যেমন status link/footer) এডিট→গেট→ডিপ্লই→স্ক্রিনশট তুলনা
**মাপকাঠি:** ভিজ্যুয়াল গেট PASS + মালিকের পছন্দ অক্ষুণ্ণ। **ঝুঁকি:** 1MB ফাইলে এডিট — anchor-নির্ভর সার্জারি।

### Phase 11 — Chunk-Quality ও Cross-File Verify
**লক্ষ্য:** জেনারেটেড কোডের গুণমান নিশ্চয়তা — "লেখাই শেষ কথা নয়"।
- [ ] 11.1 `code.verify`: ফাইল-সেটে স্ট্যাটিক চেক — undefined refs, duplicate declarations, import/export মেলানো (JS/TS), HTML id/class consistency
- [ ] 11.2 test-gen বাই-ডিফল্ট: প্রতি code.assemble/multi-file mission-এ অটো ছোট টেস্ট-স্পেক (agent.test) — না দিলেও চলবে
- [ ] 11.3 quality score: প্রতি ড্রাফটে 0–100 (syntax+verify+test+review verdict মিশেল) → mission report-এ
- [ ] 11.4 নিম্ন স্কোর (<60) হলে চূড়ান্ত commit-এ সতর্ক-ফ্ল্যাগ + TG নোটিশ
- [ ] 11.5 live proof: ইচ্ছাকৃত খারাপ কোড (undefined ref) আটকানো + ভালো কোড PASS
**মাপকাঠি:** ভুয়া-সফল কোড গেটে আটকেছে (প্রমাণসহ)। **ঝুঁকি:** heuristic ভুল-পজিটিভ — রিপোর্ট শুধু সতর্কতা, ব্লক নয়।

### Phase 12 — Regression Guard Wiring
**লক্ষ্য:** যেকোনো পরিবর্তনের আগে-পরে পুরনো ক্ষমতা অক্ষত আছে কিনা অটো-যাচাই (P2-AQ)।
- [ ] 12.1 golden run → mission ready-stage-এ বাধ্যতামূলক স্মোক (limit 3) — FAIL হলে ready blocked
- [ ] 12.2 eval compare গেট: নতুন wv-এর স্কোর আগের থেকে 5%-এর বেশি কমলে deploy আটকে (release-safe নীতি worker-এ)
- [ ] 12.3 qa.gate ভিজ্যুয়াল স্মোক UI পরিবর্তনে (Phase 10-এর সাথে সংযুক্ত)
- [ ] 12.4 API contract স্মোক: /api/health, /api/config, /api/chats (GET) 200 + আকৃতি যাচাই
- [ ] 12.5 regression ঘটলে অটো রিপোর্ট: কী ভাঙল, কোন কমিটের পরে (gh.log+bisect-lite সংযোগ)
- [ ] 12.6 live proof: একটা ইচ্ছাকৃত ছোট regression ধরা পড়ার ডেমো (টেস্ট-ব্রাঞ্চে, prod নয়)
**মাপকাঠি:** ভাঙা বিল্ড prod-এ যেতে পারেনি (গেট প্রমাণ)। **ঝুঁকি:** ফ্ল্যাকি golden — retry-নীতি + median স্কোর।

### Phase 13 — Self-Deploy Loop (জুজু নিজেকে আপডেট করে)
**লক্ষ্য:** সবচেয়ে বিপজ্জনক ক্ষমতাটাই সবচেয়ে নিরাপদভাবে — worker-এর নিজের পরিবর্তন অটো-পাইপলাইনে।
- [ ] 13.1 `deploy.self` টুল: {path:'web-backend/_worker.js', mode:'from-main'} → node --check (sandbox, main থেকে ফেচ করা ফাইল) → wv bump যাচাই → gh-pages blob-swap (worker-ভিতরে ghApi দিয়ে) → 75s পরে health probe
- [ ] 13.2 দ্বি-স্তর অনুমোদন: self-deploy = HIGH + explicit approved:true + TG-তে আগে-নোটিশ
- [ ] 13.3 অটো-রোলব্যাক: health probe ব্যর্থ/wv mismatch → আগের blob ফেরত (একই কলে) + incident রিপোর্ট
- [ ] 13.4 ক্যানারি নীতি: বড় পরিবর্তনে আগে preview প্রজেক্টে (Phase 5) টেস্ট-ডিপ্লয়, PASS হলে prod
- [ ] 13.5 self-deploy ইতিহাস kv-তে (কে/কখন/কোন কমিট/ফলাফল)
- [ ] 13.6 live proof: একটা তুচ্ছ নিরাপদ পরিবর্তন (কমেন্ট/wv) পুরো self-loop-এ — অনুমোদনসহ
**মাপকাঠি:** মানুষ ছাড়া পাইপলাইন চলেছে, কিন্তু মানুষের অনুমোদনসহ; রোলব্যাক পথ প্রস্তুত। **ঝুঁকি:** আত্ম-ধ্বংস — sandbox syntax-check বাধ্যতামূলক, ব্যর্থতায় অটো-ফেরত।

### Phase 14 — Token Economy Manager
**লক্ষ্য:** ফ্রি quota-তে সর্বোচ্চ কাজ (P2-X, BK): প্রতি কলের বাজেট, ক্যাশিং, সস্তা-মডেল-অগ্রাধিকার।
- [ ] 14.1 প্রতি mbCall-এ টোকেন হিসাব (usage ফিল্ড থেকে) → kv `usage:model:<ref>:<day>` (daily quota tracker)
- [ ] 14.2 quota-aware routing: দৈনিক সীমার ৮০% ছুঁলে cascade স্বয়ংক্রিয়ভাবে পরের প্রোভাইডারে ঝোঁকে
- [ ] 14.3 প্রম্পট ক্যাশ: একই সিস্টেম-প্রম্পট+ইনপুট হ্যাশে ২৪h ফলাফল ক্যাশ (golden/bench-এ বিশেষ লাভ)
- [ ] 14.4 আউটপুট বাজেট নীতিমালা: টুলভিত্তিক maxTok প্রিসেট (কোড 3000, সমালোচনা 1200, সারাংশ 800)
- [ ] 14.5 সাপ্তাহিক খরচ-রিপোর্ট TG-তে (কোন মডেলে কত কল/টোকেন/429)
- [ ] 14.6 live proof: quota-tracker ড্যাশবোর্ডে (status.html আপডেট মিশনে!) সংখ্যা দেখানো
**মাপকাঠি:** 429-এর আগেই স্বয়ংক্রিয় সরে যাওয়া প্রমাণিত। **ঝুঁকি:** ক্যাশে বাসি উত্তর — TTL+explicit no-cache ফ্ল্যাগ।

### Phase 15 — Error Taxonomy + Recovery Playbooks
**লক্ষ্য:** এরর মানেই পুনরায় চেষ্টা নয় — শ্রেণি বুঝে সঠিক প্রতিকার (P2-AN/AP)।
- [ ] 15.1 ট্যাক্সোনমি কোড: NET/HTTP429/HTTP4xx/HTTP5xx/QUOTA/SYNTAX/REF/PERM/GATE/TIMEOUT/UNKNOWN — mbCall/ghApi/cfApi/runSandbox-এর এররে ট্যাগ বসানো
- [ ] 15.2 প্রতিকার-টেবিল: প্রতি ট্যাগে নীতি (429→backoff+fallback, QUOTA→provider-switch, SYNTAX→coder-retry 1×, PERM→escalate, GATE→report…)
- [ ] 15.3 mission retry logic আপগ্রেড: অন্ধ retry নয় — ট্যাগ-ভিত্তিক পদক্ষেপ; escalate-রিপোর্টে ট্যাগ+প্রস্তাব
- [ ] 15.4 error memory v2: প্রতি নতুন এরর-প্যাটার্ন mem.*-এ (কারণ/সমাধান/ব্যর্থ-চেষ্টা) → পরের বারে আগে খোঁজে (P4-85)
- [ ] 15.5 root-cause Why×3: escalated mission-এ ছোট মডেল দিয়ে "কেন?কেন?কেন?" বিশ্লেষণ রিপোর্টে
- [ ] 15.6 live proof: আজকের 429-incident-এর পুনর্নির্মাণ — ট্যাগ→প্রতিকার→সমাধান অটো-লগ
**মাপকাঠি:** একই এরর দ্বিতীয়বার মানুষ ডাকে না (playbook সামলায়)। **ঝুঁকি:** ভুল ট্যাগ — UNKNOWN-এ সর্বদা মানুষের কাছে।

---
_বাকি Block A: `A2-PHASES-16-30.md`। প্রতি phase অনুমানে ১–৩ কর্মদিবস (এজেন্ট-সময়), মালিকের অনুমোদন-ছন্দে বাস্তবে কয়েক দিন।_
