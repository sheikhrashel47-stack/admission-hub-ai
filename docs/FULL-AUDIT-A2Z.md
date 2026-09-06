# 🔍 FULL A-to-Z AUDIT — Admission Hub AI (JUJU)
তারিখ: ২০২৬-০৯-০৬ · কমিট: `c27993e` · health: `p10-v89` · উদ্দেশ্য: রিবিল্ডের আগে **সবকিছুর** সৎ ইনভেন্টরি — কিছু বাদ নেই।

---

## ১) এক-নজরে স্ন্যাপশট
| আইটেম | মান |
|---|---|
| মূল রেপো | `sheikhrashel47-stack/admission-hub-ai` (private) |
| ব্রাঞ্চ | main (লাইভ), gh-pages (ডিপ্লয়), **t399/t40f/tmain = পরিত্যক্ত** |
| মোট কমিট | 230 |
| ইঞ্জিন | `web-backend/_worker.js` — 3,337 লাইন (Cloudflare Workers, $0) |
| UI | `web/index.html` — 2,175 লাইন (এক ফাইল PWA) + `sw.js` 69 লাইন + manifest + 5 icon |
| API রুট | 33 |
| টুল কেস | 84 (`runAgentTool`), CHAT_TOOLS গেটলিস্ট ~86 |
| মডেল | 27 LLM + 4 ডিভাইস-প্রিভিউ |
| D1 টেবিল | kv, mem, jobs, sched, tasklog |
| ওয়ার্কফ্লো | 3 (agent-runner, juju-heartbeat, juju-pc1) |
| ডক | 31 + MASTER-100/10 |
| লাইভ সাইট | https://admission-hub-ai.pages.dev |
| সংশ্লিষ্ট রেপো | `juju-pc` (daemon; codespace এখনো তৈরি হয়নি) |

---

## ২) ইঞ্জিন (_worker.js) — ভেতরের সব অংশ
### ২.১ API রুট (33)
- **চ্যাট:** POST /api/chat (SSE স্ট্রিম), GET/POST /api/chats, /api/chats/<id> (PUT/DELETE), GET /api/files, /api/files/<id>, POST /api/files
- **Owner/সেফটি:** POST /api/owner/unlock, GET/POST /api/cfg, POST /api/tool, GET /api/audit, GET /api/usage, GET /api/watch, POST /api/clog
- **এজেন্ট/মিশন:** POST /api/agent (WS-স্টাইল পুরনো), GET /api/ops/tick
- **স্যান্ডবক্স:** POST /api/runner/start, POST /api/runner/result, GET /api/runner/<key>
- **কানেক্টর:** POST /api/hook/github (HMAC), GET /api/connectors
- **PC:** POST /api/pc/register|ping|result, GET /api/pc/next
- **সিস্টেম:** GET /api/health|config|system|memory|storage, PUT /api/memory, GET /api/tools

### ২.২ কোর ইঞ্জিনসমূহ
1. **Intent classifier** (`classifyIntent`): greeting/critical/coding/research/instruction/question/mission/conversation।
2. **Unified router (v65):** imode='auto' → MODE_SYS; ইউজার কোনো মোড বাছে না।
3. **প্ল্যানার ৩-স্তর:** (ক) quick-rules regex (weather/prayer/pc/mem/bash/অনুমোদন), (খ) regex plan rules (~15), (গ) **LLM প্ল্যানার** (groq qwen3.8-27b→gpt-oss-120b→cfai fp8; JSON ≤4 ধাপ; CHAT_TOOLS ফিল্টার)।
4. **chatToolLoop:** plan→tool→notes→retry-once (observe→reflect)→extraText; cap: mission=4/অন্য=2; preSteps স্ট্রিম।
5. **streamAnswer/provider chain:** 27 মডেল, fail→পরবর্তী, pollinations keyless শেষ ভরসা; junk-guards (JSON-tool-call + সব tool-XML ট্যাগ) → clear→retry।
6. **effWeb সার্চ পাইপলাইন:** Tavily→(Serper মৃত)→wiki-keyless; সংখ্যা-প্রশ্নে wiki পূর্ণ-অনুচ্ছেদ; সোশ্যাল/কুইজ ফিল্টার; কর্তৃত্ব-ক্রম (সরকারি>উইকি>খবর); সংঘাত-নিয়ম; লাইভ ঘড়ি ইনজেকশন (Asia/Dhaka)।
7. **মেমোরি ইঞ্জিন:** mem টেবিল (kind/conf/src/exp/sup), SUM_SYS সংক্ষেপক, pronoun-context, mem.save/search/forget/correct।
8. **Twin ইঞ্জিন:** twin.index/map/search/impact/time (repo ইনডেক্স D1 'twin:')।
9. **Sandbox/Runner:** runSandboxStart→GH Actions repository_dispatch→result POST→store 'runner:'; cmdGate 4-স্তর (SAFE/INSPECT/APPROVAL/BLOCK); kit.bash/kit.lab/kit.code।
10. **PC ইঞ্জিন:** pc.register/pair/ping/next/result + pc.* টুল (daemon-নির্ভর; এখন ঘুমন্ত)।
11. **সেশন/সেফটি:** ownerUnlock (code→st. token/sess), ownerOk/ownerOk2, redactSecrets, critical-approval flow, gh.write main-gate, gh.prc merge-gate।
12. **Hooks/ইভেন্ট:** /api/hook/github → 'gh:lastevents' (১০টা)।
13. **Ops:** /api/ops/tick, watch:log, sched/jobs/tasklog টেবিল (cron-ভিত্তি)।

### ২.৩ টুল-ইকোসিস্টেম (84 কেস)
- **GitHub (11):** repos, read, branch, write, prc, diff, pr, runs, issue, events, commit
- **Web (5):** search, read, eye, now, verify.url
- **Kit (~50):** weather, prayer, currency, translate, wiki, wsearch, wikidata, gnews, news, rss, ddg, stack, devto, hn, arxiv, books, universities, holidays, quran, bn, dict, grammar, lorem, math, color, qr, qrread, img, flux, pdf, stt, tts, tts-free, music, youtube, npm, pypi, crypto, stock, geo, ip, dns, whois, route, nearby, time, embed, gpu, lab, code, result, upload, httpbin, name
- **Cloudflare (4):** cf.kv.keys, cf.pages.deployments, cf.pages.rollback, cf.workers
- **Mem (4), Twin (4+index), PC (8), con.discord, kit.bash**
- **এজেন্ট-ভার্ব (পুরনো agent-মোড):** plan, build, implement, review, test, security, architect, inspect, diff, approve, ready, report, postverify, deploy

### ২.৪ মডেল (27)
Groq×2, Cerebras×2, CF-AI×2, DeepSeek, NVIDIA(বন্ধ), xAI(বন্ধ), Z.ai×3, SambaNova, Gemini, Mistral, DeepInfra, Together, OpenRouter×7, HF, Ollama×2, Pollinations(keyless)।

---

## ৩) UI (web/index.html, 2,175 লাইন, এক ফাইল)
### ৩.১ শিট (20): sMenu, sModel, sHistory, sProjects, sFav, sAudit, sMemory, sSources, sDetails, sTools, sTasks, sAgent, sSettings, sHelp, sSys, sConv, sMsg, sConn, sRepo
### ৩.২ মেনু (15): mNew, mSearch, mProjects, mHistory, mAudit, mFav, mModel, mSettings, mAgent(hidden), mSystem, mHelp, mChatOps(hidden), mConn, mRepo, memSave
### ৩.৩ ফিচার: SSE চ্যাট + stepLine(💭/🔧/) + typing dots; সোর্স-শিট; কপি/শেয়ার/TTS বাটন; long-press popup; quote/reply; export md; chat-search; memory sheet; model sheet; connectors sheet; repo-work sheet (repo picker→mission); keyboard-safe composer; edge-to-edge; PWA (sw v24 network-first HTML); netBanner; jumpLatest; theme light/dark; redactSec ক্লায়েন্ট-সাইড।
### ৩.৪ লিগ্যাসি (কোড আছে, ব্যবহার নেই/আধা): sAgent+agBar+agTasks+agent WS স্ট্যাক (পুরনো এজেন্ট মোড), mAgent hidden, renderFollowUps ডেফ (কল বাদ), taskCard CSS, sTasks, mode-অবশিষ্ট, heroLine/quickHome অব্যবহৃত অংশ।

---

## ৪) ডেটা/স্টোরেজ
- **D1 (adc1f421…):** kv (cfg:, sess:, runner:, twin:, ctx:, dbg:, img:, pc:*, agent:task:, ops:, watch:, report:), mem, jobs, sched, tasklog; chats = kv 'chats'।
- **KV (AH_KV):** D1 ফেল করলে fallback।
- **সিক্রেট:** CF env binding + D1 cfg: (নাম 28: GROQ…BU_KEY_1, GH_HOOK_SECRET, DISCORD_WEBHOOK সহ)। /api/cfg owner-gated।
- **ফাইল:** /api/files (img/pdf b64→store 'img:'/'pdf:' TTL)।

---

## ৫) অটোমেশন/ডিপ্লয়
- **agent-runner.yml:** repository_dispatch 'agent-run' → ubuntu VM → script (outer timeout 100s) → result POST।
- **juju-heartbeat.yml, juju-pc1.yml:** cron/PC daemon সাপোর্ট।
- **ডিপ্লয় পাইপলাইন (ম্যানুয়াল-স্ক্রিপ্টেড):** main push → gh-pages worktree-এ worker+index copy → push → CF Pages auto-build (~75s) → /api/health wv যাচাই।
- **scripts/:** gdrive-auth.mjs (broken—commit-এর আগে checkout লাগে), gdrive-test.mjs।
- **রুট লিগ্যাসি:** server.mjs (Phase-1 dev server), worker.mjs (পুরনো worker কপি), push-github.mjs, status.html, lib/ (providers/storage—dev অবশিষ্ট)।

---

## ৬) এক্সটার্নাল সার্ভিস/কী — সৎ স্ট্যাটাস
| স্ট্যাট | সার্ভিস |
|---|---|
| 🟢 লাইভ | Groq, Cerebras, CF-AI, Z.ai, SambaNova, Gemini, Mistral, DeepInfra, Together, OpenRouter, HF, Ollama, Pollinations, Tavily(ফ্ল্যাকি), GNews, Browserless, BU×11, GH PAT, CF API |
| 🔴 মৃত/বন্ধ | **Serper (403)**, NVIDIA (owner বন্ধ), xAI (owner বন্ধ), 0x0.st, random-data-api, Piston |
| 🟡 আটকা | Groq Orpheus (terms accept বাকি), HF flux (410), StackExchange/MyMemory throttle |
|  বাকি (owner key) | Brave, Wolfram, Cohere, NewsAPI, Alpha Vantage, SiliconFlow, Discord webhook, TMDB, OMDb |

---

## ৭) ডক ও রোডম্যাপ — বর্তমান বনাম পুরনো
- **বর্তমান/সত্য:** SERVICES-INVENTORY.md (v60–v89 লগ), PHASE5/6/7-PLAN+OSS-BENCH, FULL-AUDIT (এই ডক), TOOLS-50-WISHLIST, KEYS.md।
- **পুরনো/দ্বন্দ্বপূর্ণ:** ROADMAP.md (১০-ফেজ, Phase-3 অনুমোদন-নিয়ম), BLUEPRINT*.md (৫ পার্ট), PHASE1/3 রিপোর্ট, TOKEN-RENEW, DRIVE-*, MASTER-100/ (ভবিষৎ পরিকল্পনা), UPGRADE-ROADMAP-ChatGPT-Level, UI-BLUEPRINT, DEEP-RESEARCH-V34, R2_SETUP, AGENT-LOG।
- **দ্বন্দ্ব:** ৩টা রোডম্যাপ একসাথে (ROADMAP 10-phase vs temp-phase list vs MASTER-100) — কোনটা আসল তা ডকে অস্পষ্ট।

---

## ৮) ভার্সন-হাইলাইট (v58→v89)
v58 GPU/Sandbox/Computer · v59 JUJU-PC+async · v60–64 stability+weather · v65 unified router · v66 owner 5-fix (চিপ/গেট/stepLine/টপ-ব্যান্ড/ক্রসচেক) · v67 সার্চ-ফলব্যাক চেইন · v68 লাইভ ঘড়ি · v69 wiki-অনুচ্ছেদ+ফরম্যাট · v70 factQ→search · v71 সোশ্যাল-ফিল্টার · v72 junk-gard · v73–75 PHASE5 (mission, runner routes, OSS bench) · v76–78 PHASE6 (GH connector, webhook, /api/tool, /api/cfg) · v79 connectors UI · v80–85 code-pipeline+LLM planner · v86 repo-work UI · v87 tool-XML guard+README fallback · v88–89 PHASE7 bash+cmdGate।

---

## ৯) যা আসলই কাজ করে (KEEP-লিস্ট)
1. Provider fallback chain + junk-guards (27 মডেল, কখনো ডাউন নয়)
2. Unified intent router + 3-স্তর প্ল্যানার + retry-loop
3. 84-টুল ইকোসিস্টেম + cmdGate সেফটি
4. মেমোরি ইঞ্জিন + সংক্ষেপক
5. Sandbox runner (GH Actions $0) + kit.bash/lab
6. GitHub দুই-মুখী কানেক্টর + HMAC webhook
7. Deploy pipeline + health wv
8. PWA কোর চ্যাট UX (SSE, stepLine, সোর্স, কপি, export)
9. Owner security (code→session, redaction, gates)

## ১০) সৎ সমস্যা-তালিকা (রিবিল্ড-ইনপুট)
**UI:** ২,১৭৫ লাইন এক ফাইল; লিগ্যাসি agent-স্ট্যাক মৃত-ওজন; 20 শিট/15 মেনু — অর্ধেক অব্যবহৃত; কোনো কম্পোনেন্ট/টেস্ট নেই; sw 69 লাইন বেসিক।
**Engine:** ৩,৩৩৭ লাইন এক ফাইল; ৩ প্ল্যানার স্তর এলোমেলো; 24 প্যাচ-সাইকেলের স্তূপীকৃত guard; কিছু টুল অটেস্টেড/মৃত-এন্ডপয়েন্ট; owner-gate ডুপ্লিকেট; D1 বাইরে থেকে query-রুটিং ফ্ল্যাকি।
**Keys:** Serper মৃত (Google-সার্চ নেই), Tavily ফ্ল্যাকি, Group-C বাকি, Orpheus terms বাকি।
**Docs:** 41 md, ৩ রোডম্যাপ দ্বন্দ্ব, অধিকাংশ stale।
**Repo:** ৩ পরিত্যক্ত ব্রাঞ্চ; ৫ লিগ্যাসি রুট ফাইল; gdrive script broken।
**PC:** codespace তৈরি হয়নি → pc.* ঘুমন্ত।
**Tests:** শূন্য অটোমেটেড টেস্ট-সুট (সব ম্যানুয়াল curl)।
**Workflow:** ডিপ্লয় ম্যানুয়াল-স্ক্রিপ্টেড (CI নেই)।

---

## ১) রিবিল্ড প্রস্তাব (৩ অপশন)
**A. ইঞ্জিন রাখো, UI নতুন (প্রস্তাবিত):** worker = tested asset; নতুন পরিচ্ছন্ন PWA (কম্পোনেন্ট-ভিত্তিক, legacy-free, ~৮ শিট), ডক prune→১ ROADMAP+১ ARCHITECTURE, legacy ফাইল/ব্রাঞ্চ delete, kit.lab-ভিত্তিক অটো টেস্ট-সুট, ডিপ্লয় CI-করণ। ঝুঁকি কম, সময় ~৩-৪ সাইকেল।
**B. সব নতুন (engine+UI):** সবচেয়ে পরিচ্ছন্ন কিন্তু tested engine হারানোর ঝুঁকি + বহু সপ্তাহ।
**C. ইনক্রিমেন্টাল ক্লিনআপ:** প্রতি সাইকেলে একটা খণ্ড (legacy UI→docs→tests)। ধীর কিন্তু শূন্য-ঝুঁকি।

**অপেক্ষা:** owner-এর অপশন-পছন্দ (A/B/C) → তারপর বিস্তারিত রিবিল্ড-প্ল্যান ডক + কাজ শুরু।
