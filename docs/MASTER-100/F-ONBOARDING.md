# 🎓 F-ONBOARDING — জুজু সিস্টেমের পূর্ণ হস্তান্তর-দলিল (নতুন এজেন্টের জন্য)

> লক্ষ্য: এই ফাইল পড়লে যেকোনো এজেন্ট জুজুর **পুরো বর্তমান অবস্থা** বুঝে যাবে — কী আছে, কোথায় আছে, কীভাবে চলে, কী ভাঙলে কীভাবে সারানো যায়। সব তথ্য ২০২৬-০৯-০৪ পর্যন্ত সত্য ও লাইভ-যাচাইকৃত।

---

## ১. পরিচয় ও ইতিহাস (৩০ সেকেন্ডে)
জুজু = Sheikh Rashel-এর প্রাইভেট AI এজেন্ট। জন্ম: ২০২৬-০৯-০৩/০৪। Phase 0–10 (পুরনো প্ল্যান) সম্পূর্ণ: প্রিমিয়াম বাংলা PWA চ্যাট UI (client v24) → ৮-প্রোভাইডার ফ্রি মডেল রাউটার → সিকিউরিটি ফায়ারওয়াল+অডিট → repo digital-twin → কোড sandbox (GH Actions) → মেমরি ইঞ্জিন → ভিজ্যুয়াল QA → ব্যাকগ্রাউন্ড অপস (cron/away-mode) → মাল্টি-ব্রেইন (cascade/race/judge) → মিশন ইঞ্জিন (L6) + Evaluation Lab। **জুজু নিজে নিজের প্রোডাকশন কোডে বাগফিক্স করেছে (২০২৬-০৯-০৪, brain.critic fallback — মিশন Mmtmr84er)।**

## ২. ইনফ্রাস্ট্রাকচার ম্যাপ (সব $0)

### ২.১ তিনটা ফ্রি কম্পিউটার
| # | কী | কী চলে | সীমা |
|---|---|---|---|
| PC1 | **GitHub Actions runner** (repo PUBLIC → আনলিমিটেড মিনিট) | `agent.shell`/`agent.test` sandbox (ubuntu, node/python3/curl), heartbeat cron, watchman | ephemeral — প্রতি রানে নতুন; ফাইল persist করে না; script ≤~60KB |
| PC2 | **Cloudflare Pages worker** (`admission-hub-ai.pages.dev`) | পুরো API/এজেন্ট ইঞ্জিন (web-backend/_worker.js, ~190KB), D1, KV | Workers সীমা: CPU 30s/রিকোয়েস্ট (I/O wait গণনা নয়), no eval/new Function, no Node APIs (nodejs_compat ছাড়া) |
| PC3 | **Browserless + thum.io** | স্ক্রিনশট ইঞ্জিন (`web.eye`, `qa.*`) | thum.io heavily cached — fresh capture-এ browserless (key আছে D1-এ) |

### ২.২ স্টোরেজ
- **D1 `AH_DB`** (primary): টেবিল `kv(key,value,exp)` — সব স্টেট এখানে (registry, missions, eval, memory, config), `jobs` (queue), `audit:*` keys, চ্যাট ইত্যাদি। ফ্রি: 5M read/100k write প্রতিদিন, 5GB।
- **KV `AH_KV`**: D1-এর fallback (storeGet/storePut আগে D1 চেষ্টা করে)।
- **Vaults**: 3-vault nightly AES-GCM ব্যাকআপ (Drive/IA/টেলিগ্রাম) — keys D1-এ, কখনো repo-তে নয়।
- **repo PUBLIC** — তাই সব secret শুধু server-side (D1/KV/GH Actions secrets)।

### ২.৩ বাহ্যিক সেবা
- **মডেল**: Groq (fast+lite), Gemini (flash), OpenRouter, Mistral, DeepInfra, Cerebras, SambaNova, Together — keys D1 `keys` কনফিগে; `pingCached` 60s ক্যাশে; `brain.bench` registry (`brain:registry`) স্কোর রাখে। **শিখেছি:** groq ফ্রি daily-quota ফুরোয় (lite আগে মরে) — সব কলে fallback chain বাধ্যতামূলক। cerebras-এর llama-3.3-70b মরে গেছে (404)। mistral মাঝে মাঝে 429।
- **Telegram Bot API**: টোকেন+channel D1-এ; `tgNotify` সব mission/ops/incident রিপোর্ট পাঠায়; sendDocument প্রমাণিত (vault ব্যাকআপ)।
- **GitHub**: PAT (owner-এর ১৭ repo দেখে — private সহ) D1-এ; `ghApi` helper; org/repo: `sheikhrashel47-stack/admission-hub-ai`।
- **Cloudflare API**: CF_API_TOKEN+CF_ACC — pages deployments list/rollback (`cf.pages.deployments`, `cf.pages.rollback`)।
- **Tavily** (search), **browserless.io** (screenshot)।

## ৩. ডেপলয় টপোলজি (এলোমেলো করো না — এটাই প্রাণ)
- **github.io/admission-hub-ai/** = GitHub Pages, সোর্স **gh-pages branch**। gh-pages root = UI (index.html client v24, sw.js, manifest, icons/, status.html) + `web-backend/` সাবডিরেক্টরি।
- **admission-hub-ai.pages.dev** = CF Pages, `destination_dir: web-backend` → শুধু `_worker.js` সার্ভ করে; `/` এ 404 = **ডিজাইন, বাগ নয়**।
- **main branch** = সোর্স অফ ট্রুথ (worker + docs + scripts; পুরনো node server.mjs ইত্যাদি ইতিহাস)।
- UI ফাইল পরিবর্তন = **gh-pages root**-এ যেতে হবে (মিশন M3-এর শিক্ষা: main-এ কমিট করলে github.io-তে আসে না!)।

## ৪. ডেপলয় পাইপলাইন (worker আপডেট — হুবহু পালন করো)
```
1. web-backend/_worker.js এডিট
2. node --check web-backend/_worker.js        # সিনট্যাক্স গেট
3. wv bump: /api/health-এর wv + AGENT_VERSION  # দুটোই!
4. git commit → push main (token URL: https://x-access-token:${GH_TOKEN}@github.com/sheikhrashel47-stack/admission-hub-ai.git)
5. gh-pages blob-swap:
   git fetch URL gh-pages && git update-ref refs/heads/gh-pages FETCH_HEAD
   B3=$(git hash-object -w web-backend/_worker.js)
   GIT_INDEX_FILE=/tmp/ghidx git read-tree gh-pages
   GIT_INDEX_FILE=/tmp/ghidx git update-index --cacheinfo 100644,$B3,web-backend/_worker.js
   NEWTREE=$(GIT_INDEX_FILE=/tmp/ghidx git write-tree)
   C=$(git commit-tree "$NEWTREE" -p "$(git rev-parse gh-pages)" -m "deploy: …")
   git push URL "$C:refs/heads/gh-pages" && git update-ref refs/heads/gh-pages "$C"
6. sleep ~75s → curl https://admission-hub-ai.pages.dev/api/health → নতুন wv দেখো
```
**গর্ত-সতর্কতা:** (ক) mission `gh.commit` main-এ লেখে → পরের push-এ আগে `git pull --rebase`। (খ) CF error 1010 এড়াতে pages.dev POST-এ browser-like UA। (গ) inline ``` literals Pages build ভাঙে। (ঘ) routes `const pm/cx`-এর আগে বসাও (TDZ)। (ঙ) worker-এ eval/new Function নেই — সিনট্যাক্স চেক শুধু sandbox-এ।

## ৫. নিরাপত্তা মডেল
- **Owner unlock**: POST `/api/owner/unlock` {code} → response key = **`session`** (token নয়!) → Authorization: Bearer। কোড owner-এর কাছে; workspace `.secrets/ownercode.txt` (git-এ নয়)।
- **PERM ম্যাপ** (worker-এ): প্রতি টুলে {risk: LOW/MEDIUM/HIGH/CRITICAL, gate: AUTO/POLICY/APPROVAL/BLOCK}। POLICY = ctx.owner লাগে; APPROVAL = ctx.approved; gh.*(delete|force|rewrite) = BLOCK চিরকাল; /(commit|push|deploy)/ = HIGH/POLICY; OPS_PROD_RE (`cf.pages.deploy|rollback|prod.deploy`) = queue-তে explicit approved ছাড়া কখনো নয়।
- **redactSecrets()** সব outbound কনটেন্টে; audit:* লগ ৩০ দিন।
- **cmdGate** sandbox কমান্ড শ্রেণিবদ্ধ করে (BLOCK/APPROVAL/safe)।

## ৬. মিশন ইঞ্জিন (L6) — সংক্ষিপ্ত রেফারেন্স
`ops.mission` — new(goal, files[{path,content|prompt|anchor+bug}], deploy:none|ghpages, approved, budget≤60) → 15 stage: understand→inspect→architect→plan(critic FIX-gate)→implement(gh.commit; prompt→brain.sub coder iters:1 + fence-extraction; anchor+bug→window-surgery: block-aware window ≤3.2KB, coder fix, size-gate 0.4×–6×, merged-size sanity)→build(node --check sandbox)→test(agent.test)→review(critic, model groq:fast)→security(secret regex)→diff→ready(gate: health/UI/rollback≥2/secret)→approve(!approved→awaiting-approval STOP)→deploy(ghpages শুধু approved)→postverify(verify.url×2+GitHub visible)→report(kv+TG)। step/steps≤15, retry(escalated→running), 2×ব্যর্থ→escalated+TG। kv: `mission:<id>`, `missions:index`।
**প্রমাণিত ইতিহাস:** Mmtmqfnc3 (docs demo, 19 step), Mmtmr84er (worker bugfix+status.html, 22 step, 2 escalation+1 safety-abort — সব নীতিমাফিক), Mmtmrkk50 (status.html clean regen, 15 step, 21.6s)।

## ৭. মাল্টি-ব্রেইন (P9) রেফারেন্স
`mbCall(keys, ref, messages, maxTok, timeoutMs)` — ref=`pid:id`, gemini→generateContent, বাকি→PING_BASE+'/chat/completions'। BRAIN_CASCADE=['groq:lite','groq:fast','gemini:flash','mistral:m2'] (বেঞ্চ-সাজানো; lite quota-মৃত হলেও cascade টিকে)। brain.solve (CONF: n parse, minConf 75, reviewer gate COMPLETE/PARTIAL), brain.critic (**v34 থেকে fallback chain: args.model→groq:fast→gemini:flash — জুজুর নিজের লেখা ফিক্স**), brain.race (≤3 সমান্তরাল+blind judge), brain.sub (research/coder/qa, iters≤3 — precision কাজে 1), brain.parallel (≤5+aggregator), brain.bench (3 auto-graded task→registry)।

## ৮. Evaluation Lab (P10) রেফারেন্স
GOLDEN 20 task (code7/reason6/follow4/domain3) keyword-scope → `ops.golden run` → kv `eval:<wv>:<model>` + `eval:index` → `ops.eval compare` (delta≥-5=release-safe) → `ops.selftest` (health+wv match/UI/golden smoke/rollback refs → PASS/FAIL + `agent:version` stamp) → `ops.changelog` (conventional grouping → CHANGELOG.md)। Baseline p10-v30: groq:fast 65%, gemini:flash 75%। **দুর্বলতা:** কিছু expect বাংলা-সংখ্যা/lipi mismatch — Block C-তে suite 350-এ উন্নীত হবে।

## ৯. ব্যাকগ্রাউন্ড অপস (P8) রেফারেন্স
`juju-heartbeat.yml` cron `*/30 * * * *` → GET `/api/ops/tick` (X-Watch: secrets.WATCH_SECRET, 60s D1 ticklock)। Watchman 3am → `/api/watch` (X-Watch)। away-mode (`ops:away`, TG-তে ঘোষণা; pre-approved missions; prod কখনো অটো নয়)। freeze (`ops:freeze`)। queue: `jobs` টেবিল, 5 priority, drain budget, CRITICAL ছাড়া freeze-আটকে। incident (`ops.incident`): freeze+deployments compare+recover প্রস্তাব।

## ১০. UI (client v24) রেফারেন্স
gh-pages root index.html (~1MB+): বাংলা প্রিমিয়াম চ্যাট, flat feed (কোনো bordered bubble নয়), mode-chip composer-এ নিষিদ্ধ (মোড শুধু `+` sheet-এ), long-press popup, code box-এ ▶ run/⬇ download (RAW unescaped কোড — escaped entity কখনো নয়), SSE streaming (`token` ফিল্ড), edge-to-edge, iOS double-safe-area ফিক্স, keyboard stability। পরিবর্তনে: qa.gate/qa.compare ভিজ্যুয়াল যাচাই + browserless fresh capture (thum.io cache এড়িয়ে)।

## ১১. মালিকের স্থায়ী পছন্দ (উল্লঙ্ঘন নয়)
সহজ বাংলায় রিপোর্ট · প্রতি-phase অনুমোদন গেট · সততা (§45) · ফ্রি-স্ট্যাক · Aldra স্টাইল নিষিদ্ধ · composer পরিষ্কার (কোনো chip-row নয়) · কোড বক্সে সম্পূর্ণ RAW কোড · দীর্ঘ কাজে ধাপে ধাপে অগ্রগতি-বার্তা। মালিকের ১৭ repo-র তালিকা ও ভবিষ্যৎ-চাহিদা (multi-repo twin, daily practice, CF inventory) — DEEP-RESEARCH ও পুরনো memory-তে; Block A/B/C-তে ধাপ হিসেবে ঢুকেছে।

## ১২. শব্দকোষ
wv = worker version (health-এ ধরা পড়ে) · blob-swap = gh-pages-এ ফাইল-স্তরে কমিট · twin = repo digital index · golden = স্থায়ী পরীক্ষা-সুইট · mission = bounded অটোনমাস প্রজেক্ট · gate = শর্ত-সাპেক্ষ অনুমোদন · away-mode = মালিকের অনুপস্থিতির সীমিত অটোনমি · escalation = মানুষের কাছে ফেরত · window-surgery = বড় ফাইলের ছোট অংশে কোডার-ফিক্স · fence-extraction = LLM আউটপুট থেকে বিশুদ্ধ কোড ছাড়ানো।

## ১৩. জরুরি রেসিপি
- **session হারালে:** POST /api/owner/unlock {code: ownercode} → `session`।
- **worker অচল হলে:** gh-pages-এ আগের কমিটে blob-swap ফিরিয়ে দাও (ইতিহাস git-এ আছে) বা `cf.pages.rollback` (approved লাগবে)।
- **groq 429:** অপেক্ষা (quota রিসেট) — cascade নিজেই সামলায়; ভারী বেঞ্চ এক দিনে একবারের বেশি নয়।
- **mission আটকালে:** `ops.mission status` → লগ পড়ো → ঠিক করে `retry` → বাতিলে `cancel`।
- **নতুন টুল যোগ করলে:** PERM এন্ট্রি + (প্রয়োজনে) CHAT_TOOLS + অডিট + live proof + wv bump।

_সর্বশেষ হালনাগাদ: ২০২৬-০৯-০৪ (v34, M3-পরবর্তী)। পরিবর্তন হলে এই ফাইলও হালনাগাদ করো — এটাই নতুন এজেন্টের একমাত্র সত্য।_
