# 🗺️ JUZU EXECUTION PLAN — 10 PHASES (মাস্টার রোডম্যাপ)
> **কার জন্য:** জুজু + ভবিষ্যতের যেকোনো agent session। এটাই একমাত্র "এখন কী করব" ডকুমেন্ট।
> **উৎস:** Owner-এর ৪টি blueprint — Part 1 (143 capability), Part 2 (Pro Max 70+), Part 3 (20 Ultra), Part 4 (250 capability, 5 Phase)। সবগুলো মিলিয়ে এখানে ১০টা execution phase-এ ভাগ করা।
> **নিয়ম:** প্রতি phase ৫-১০টা ধাপ। ধাপ শেষ = `[x]` + তারিখ + commit sha। Phase শেষ না হওয়া পর্যন্ত পরের phase শুরু নয় (owner override ছাড়া)। প্রতি phase-এর শেষ ধাপ = deploy + live test।

## 🔥 Owner-এর ৩টা মূল দাবি (২০২৬-০৯-০৪) — সব phase-এ এগুলো খেয়াল রাখতে হবে
1. **ফ্রি কম্পিউটার (owner-এর নিজের PC নেই):** জুজুর "দেহ" = **GitHub Actions runner** (ফ্রি Linux VM, কার্ড লাগে না; public repo-তে unlimited, private-এ ২০০০ min/মাস) + **Cloudflare Workers/cron** (২৪/৭ জেগে থাকে) + প্রয়োজনে **GitHub Codespaces** ফ্রি কোটা (~১২০ core-hours/মাস)। Oracle/AWS/GCP বাদ — কার্ড লাগে। → Phase 5 + 8।
2. **Performance (হাজার হাজার লাইন + দীর্ঘ সময়):** সৎ বাস্তবতা — এক model call-এ ~৩০০-৮০০ লাইন; একটানা এক run সীমিত (Worker time limit)। সমাধান = **bounded chunk → checkpoint → cron/queue resume** → ঘণ্টার পর ঘণ্টা কাজ, এক task-এ কয়েক হাজার লাইন। ৫০০০+ লাইন output UI-তে = chunked/virtual rendering (P4#217)। → Phase 1.5, 5, 10।
3. **Owner না থাকলেও নিজে কাজ (সবচেয়ে গুরুত্বপূর্ণ):** away-mode = job queue + cron worker + Telegram report + **pre-approved mission policy**। প্রমাণ ইতিমধ্যে আছে: watchman রাত ৩টায় (BD) নিজে চলে। সীমা: production deploy approval-gated থাকবে, নাহলে mission pre-approve করা থাকতে হবে। → Phase 8 (দ্রুততম পথ: 8.1+8.2+8.4 fast-track করা যেতে পারে)।

## 🖥️ JUZU-এর কম্পিউটার (ফ্রি, কার্ড লাগে না) — ২০২৬-০৯-০৪ থেকে লাইভ
| মেশিন | কী | ক্ষমতা | প্রমাণ |
|---|---|---|---|
| **JUJU-PC1** | GitHub Actions Linux VM (`.github/workflows/juju-pc1.yml`) | 4 core / 15GB RAM / 145GB disk / Node 22 + Python 3.12 + git; public repo = unlimited minutes | run 33759486505 success; artifact `juju-out.txt` |
| **JUJU-PC2** | Cloudflare Workers (admission-hub-ai.pages.dev) | ২৪/৭ জেগে থাকা সার্ভার — agent brain, memory, scheduler, watchman | /api/health ok |
| **JUJU-PC3** | Cloud Chrome (Browserless + thum.io) | আসল ব্রাউজার — click/type/screenshot/DOM = চোখ+হাত | screenshot QA (qa-mobile.png) |
- PC1 চালানোর নিয়ম: `POST /repos/{owner}/{repo}/actions/workflows/juju-pc1.yml/dispatches {"ref":"main","inputs":{"cmd":"..."}}` অথবা repository_dispatch `juju-pc1`; ফল = artifact `juju-out` (7 দিন থাকে)।
- PC1-এ একসাথে একাধিক job চলে → Phase 9-এর swarm/parallel-এর ভিত্তি।
- নিরাপত্তা: dispatch-এ PAT লাগে (server-side); Phase 5-এ Safe Command Gateway (safe/unknown/destructive/dangerous) যোগ হবে। Phase 5.2-এ agent.shell টুল এই PC1-কেই ব্যবহার করবে।

## 📚 Blueprint ফাইল ম্যাপ
| ফাইল | কী আছে |
|---|---|
| `docs/JUZU-MASTER-BLUEPRINT.md` | Part 1 — ১৪৩ capability (foundation rule: persistent workspace, popup নয়) |
| `docs/JUZU-MASTER-BLUEPRINT-PART2.md` | Part 2 — Pro Max superset (multi-brain, skills, MCP, tiers CORE→ULTRA) |
| `docs/JUZU-MASTER-BLUEPRINT-PART3.md` | Part 3 — 20 Ultra (digital twin, incident mode, autonomy L1-L6) |
| `docs/JUZU-MASTER-BLUEPRINT-PART4-250CAPS.md` | Part 4 — 250 capability, Phase 1-5 (vision/engineering/memory/research/AI-OS) |
| `docs/BLUEPRINT-AUDIT-143.md` | Part 1-এর হাতে-কলমে অডিট (✅50 🟡71 ❌22) |
| `docs/BLUEPRINT.md` | পুরনো phase roadmap (ইতিহাস; এখন এই EXECUTION PLAN-ই চলবে) |
| `/home/user/JUJU-MEMORY.md` (agent workspace) | জুজুর চলমান মেমোরি — session শুরুতে পড়তে হবে |

## 🔒 অপরিবর্তনীয় নিয়ম (সব phase-এ খাটবে)
1. **$0 first** — কোনো paid service নয়; owner-এর কার্ড নেই (R2 বাদ)।
2. **সব secret server-side** (D1 `cfg:*` / Pages env) — client/chat/commit-এ কখনো নয়।
3. **Destructive action = approval gate**; delete/force-push/history-rewrite টুল বানানোই নিষেধ।
4. Owner-কে **সহজ ছোট বাংলা**-য় report; সৎ partial reporting ("কী হয়েছে/কী বাকি/কেন")।
5. প্রতিটি change: code → test → commit → push main → gh-pages → **verify live** → তারপর "done" বলা।
6. Existing architecture/design system/data structure ভাঙা যাবে না (task না চাইলে)।
7. Backend-বিহীন feature UI-তে দেখানো যাবে না (§45)।

---

## 🟦 PHASE 0 — সব জুজু (owner-inserted, 2026-09-04) — COMPLETE
- [x] 0.1 docs/UI-BLUEPRINT.md (flat feed, orb, working strip, type ramp) — (81c13b0)
- [x] 0.2 backend: deterministic intent router (owner-gated read-only tool loop: gh.repos/gh.read/web.*) + context pack (ctx:lasttask + chat history) + [SUGGEST] client-strip — (d0b1c5b, 53a8d32)
- [x] 0.3 frontend: flat feed (bubble-border বিদায়), জুজু header+orb, type ramp, model-UI hide — (d0b1c5b)
- [x] 0.4 orb animation (idle/think/work/happy/err) + working strip tap-to-expand + task card default-collapsed — (d0b1c5b)
- [x] 0.5 QA: live test (সাধারণ chat-এ ১৭ repo উত্তর; follow-up "private কয়টা" → ৬টি = context ✅) + 375/1280 screenshots (qa0-*.png) + sw v11 — (2026-09-04)

## 🟦 PHASE 1 — Workspace UI (popup বিদায়, persistent workspace)
**লক্ষ্য:** Agent Control = main chat-এর ভেতরেই live workspace। ব্লুপ্রিন্ট রেফ: P1#1,43,44,46,113 (FOUNDATION RULE), P4#211-220।
- [x] 1.1 Agent activity sheet → **main conversation-এ live cards** (task চলার সময় chat-এই দেখা যাবে) — (2026-09-04, c074c7d)
- [x] 1.2 **Header status bar** (`#agBar`): current task, step n/10, session-alive dot — (2026-09-04, c074c7d)
- [x] 1.3 **Progress bar + step states** (wsProg + pill: run/ok/bad/stop) — (2026-09-04, c074c7d)
- [x] 1.4 **Diff view UI** (diff-result এলে green/red/hunk রেন্ডার) — (2026-09-04, c074c7d)
- [x] 1.5 **Code workspace**: প্রতি codeBox-এ ⛶ → fullscreen overlay + copy — (2026-09-04, c074c7d)
- [x] 1.6 **Task panel** (`#sTasks`): list + status + ↻রিজিউম (server checkpoint) + 🔁নতুন করে; live stop card-এ — (2026-09-04, c074c7d)
- [x] 1.7 Streaming markdown polish + zero-waste layout — mdLive(): streaming-এ খোলা code-fence/bold নিজে বন্ধ করে (ভাঙা block/flicker নেই) + pre/table scroll rules — (2026-09-04, a07a705)
- [x] 1.8 **Message/task search** (টাস্ক প্যানেলে 🔍 — task + বর্তমান conversation, jump+flash) — (2026-09-04, c074c7d)
- [x] 1.9 Mobile-first QA — browserless 375x812 + 1280x800 screenshot: overflow/clipping নেই (qa-mobile.png, qa-desktop.png) — (2026-09-04)
- [x] 1.10 Deploy → gh-pages `e8ae045` → live verify (HTTP 200, wsCard marker, sw v10) — (2026-09-04)

## 🟦 PHASE 2 — Intent Engine + Conversation Discipline — COMPLETE (2026-09-04)
**লক্ষ্য:** message বুঝে সঠিক পথে চালানো; greeting-এ কখনো tool নয়। রেফ: P1#2,90,92,3; P4#121-130,201।
- [x] 2.1 **Intent classifier**: conversation / question / research / instruction / coding / critical-action — (2026-09-04, 0b37a30)
- [x] 2.2 **Greeting hard rule**: "Hi/কেমন আছো/সালাম" → শূন্য tool, শুধু কথা (code-level: classify→greeting ⇒ chatToolLoop null + effWeb off) — (2026-09-04, 0b37a30; live T1 ✅)
- [x] 2.3 **Pronoun/follow-up resolution**: PRON_RE + ctx:state/ctx:lasttool → "ওটার মধ্যে private কয়টা?" → ৮টি (tool-plan inherit) — (2026-09-04, 4d93162; live T3b ✅)
- [x] 2.4 **Conversation state tracking**: ctx:state:<chatId> + ctx:state {topic,intent,mode,pending,ts} প্রতি done-এ save — (2026-09-04, 0b37a30)
- [x] 2.5 **Agent modes** toggle: auto/chat/research/coding/agent/mission — MODE_SYS + tool-subset gate + কম্পোজার-উপরে mode strip UI — (2026-09-04, 0b37a30; live T2a/T2b ✅)
- [x] 2.6 **WAITING_FOR_USER state** + clarification gate: per-chat state নেই + pronoun → RULE:clarify; critical → নিশ্চিতকরণ gate (ctx:pendcrit) — (2026-09-04, 1fa7b51; live T4/T5 ✅)
- [x] 2.7 Adaptive response length + tone match: STYLE_SYS[intent] + TONE (তুই/ভাই vs আপনি) system-addendum — (2026-09-04, 0b37a30)
- [x] 2.8 Deploy → gh-pages 4d93162 → live test: greeting✅ follow-up✅ mode-gate✅ clarify✅ critical✅ health wv=p2-v22 — (2026-09-04)

## 🟦 PHASE 3 — Security Firewall + Audit + Error Memory — COMPLETE (2026-09-04)
**লক্ষ্য:** full access-কে controlled করা; capability কমবে না। রেফ: P1#48-56,129-135; P2 Part M; P3#17; P4#190,246-249।
- [x] 3.1 **Permission matrix** (tool × action → AUTO / POLICY / APPROVAL / BLOCK) — PERM table + permFor() default — (2026-09-04, b9ff1cd)
- [x] 3.2 **Git Safety Firewall**: read/branch=auto, edit/test/commit/push=POLICY(owner), merge=APPROVAL, delete/force/rewrite=BLOCK — runAgentTool gate-এ enforce; live: gh.delete→'চিরকাল নিষিদ্ধ', gh.merge→DENIED — (2026-09-04, e2d2389)
- [x] 3.3 **Action Risk Classification**: প্রতি PERM entry-তে risk + gateAllows(); audit-এ risk লগ — (2026-09-04, b9ff1cd)
- [x] 3.4 **Secret redaction layer**: redactSecrets() (gh pat/aws/sk-/Bearer/hex40) — user msg+title+answer save, clog, client display (md/mdLive/bubU); live: ghp_… → [REDACTED:gh_token] — (2026-09-04, e2d2389)
- [x] 3.5 **Prompt-injection defense**: SYSTEM-এ hierarchy rule + tool/web/file content [UNTRUSTED … END] label — (2026-09-04, b9ff1cd)
- [x] 3.6 **Audit log**: audit:* (D1, 30d) + GET /api/audit (owner-gated) + ডট-মেনু → 'অডিট লগ' শীট UI — (2026-09-04, b9ff1cd)
- [x] 3.7 **Error memory**: errmem:<sig> {n,cause,fix}; chat catch-এ auto-record + পুরনো হলে hint append — (2026-09-04, b9ff1cd)
- [x] 3.8 Deploy → gh-pages e2d2389 (+title-fix) → live: BLOCK✅ APPROVAL-DENIED✅ CALL-logged✅ redaction✅ health wv=p3-v24 — (2026-09-04)

## 🟦 PHASE 4 — Repo Digital Twin + Code Intelligence ✅ COMPLETE (2026-09-04)
**লক্ষ্য:** "জুজু project-এর structure মুখস্থ জানে"। রেফ: P3#1,2,7; P2 Part D; P4#51-57,42; P1#24,12,31।
- [x] 4.1 **Repo walker**: git/trees?recursive=1 + blob-sha diff → contents D1 cache `twin:<repo>:src:<p>` (30d). Live: 25 files ✅
- [x] 4.2 **Entry-point + config + dependency discovery** — entries (index.html×2, _worker.js, sw.js), configs (yml/manifest), external-host counts ✅
- [x] 4.3 **Symbol index**: js functions (decl+arrow-const), /api routes, html ids; uses = word-boundary refs per name/file. Live: 278 symbols ✅
- [x] 4.4 **Incremental re-index**: head-sha match → `{cached:true}`; শুধু বদলানো blob fetch, deleted files purge. Live ✅
- [x] 4.5 **twin.search tool**: hybrid ranking (path+3, symbol+2, line+1), snippets w/ line numbers, top-10. Live: 'firewall' ranked ✅
- [x] 4.6 **Codebase Map Report** (`twin.map`): per-file role + symbol count + size. Live: chat "repo-এর ম্যাপ দাও" → auto table ✅
- [x] 4.7 **Impact Analysis** (`twin.impact`): symbol-users + filename refs → dependents; entry files = CRITICAL. Live: web/index.html → CRITICAL ✅
- [x] 4.8 **Git Time-Machine** (`twin.time`): commits?path= + per-commit files/message keyword scan → hit flags. Live: kw='firewall' → শুধু Phase 3 commit 0ce46dbc hit ✅
- [x] 4.9 Deployed gh-pages `e9f6cb96` — 6 twin live tests + chat-router passed (2026-09-04)

## 🟦 PHASE 5 — Sandbox + Test Engine (GitHub Actions = $0 CI) ✅ COMPLETE (2026-09-04)
**লক্ষ্য:** CORE tier-এর শেষ ফাঁক — code execution + testing। রেফ: P1#13-16,50; P2 Part H/L; P4#80,91-96,188,189।
- [x] 5.1 **GH Actions workflow** `agent-runner.yml`: repository_dispatch[agent-run] → checkout + `timeout 100 bash run.sh` → result POST `/api/runner/result` (random run-key auth). Live: run 33839382805 ✅
- [x] 5.2 **agent.shell**: dispatch → D1 poll (5s×150s) → {exit,out,err,run,ms}. Live: `echo+node 40+2` → 10s round-trip, node v22.23.2 ✅
- [x] 5.3 **Safe Command Gateway** `cmdGate()`: per-line classify; BLOCK (rm -rf /, mkfs, dd, fork-bomb…) → 🔥; APPROVAL (git push, --force, curl|sh, sudo…) → approved:true লাগে; SAFE→auto; unknown→INSPECT flag. Live: দুটো deny + audit এন্ট্রি ✅
- [x] 5.4 **Test generator** `agent.test`: requirement (+code, pre-saved as ./candidate.<ext>) → gemText LLM bash test script (max 8, PASS/FAIL lines). Live: 8 tests generated ✅
- [x] 5.5 **Test runner + analyzer**: sandbox-এ রান + `analyzeTests()` PASS/FAIL parse → {total,passed,failed,names}. Live: 8/8 pass in 10s ✅
- [x] 5.6 **Build-Test-Repair** `agent.repair`: max 3 রাউন্ড (run tests → LLM fix → rerun). Live: ভাঙা add(a,b)=a-b → it1: 7 fail → it2: 1 fail (float precision) → it3: 8/8 pass, fixed:true ✅
- [x] 5.7 **agent.envcheck**: sandbox env report (node v22/python3.12/npm/git/4cpu/16GB) + prod health from inside + exec-ok/py-ok + result-POST loop = artifact proof. Live ok:true ✅
- [x] 5.8 Deployed gh-pages `3f3c1d75` (wv p5-v25) — 8/8 live tests passed (2026-09-04). Fix history: CF 1010 (urllib UA → browser UA), cx TDZ, gemini-only gemText → multi-provider fallback

## 🟦 PHASE 6 — Memory Engine Pro (structured, cross-model) ✅ COMPLETE (2026-09-04)
**লক্ষ্য:** "Model remembers context; Juzu remembers relationship" (P4#150 golden rule)। রেফ: P4#101-149; P2 Part E; P3#20।
- [x] 6.1 **Memory DB schema** (D1 `mem` table): kind(fact/decision/preference/episode/error) + text + conf + src + ts + exp + sup + h(sha256 dedupe). Live: 195 rows ✅
- [x] 6.2 **Auto extraction**: প্রতি ১০ message-এ শেষ ১২ message → LLM JSON → memInsert (waitUntil, non-blocking). Live: #38-এর সিদ্ধান্ত auto-capture → id 209 `decision` src chat:cd5dd2bf conf 1 ✅
- [x] 6.3 **mem.search**: token-hit×2 + conf×2 + recency-decay ranking, kind filter, top-N. Live: ranked hits + empty-token guard ✅
- [x] 6.4 **Context injection**: chat handler-এ memRelevant top-4 → sysAdd '## দীর্ঘমেয়াদি স্মৃতি' block — worker-side তাই সব provider/model share করে; done event-এ memUsed ids. Live: নতুন চ্যাটে 'ভাইয়ের পরীক্ষা কবে?' → MEMUSED:[5] + সঠিক উত্তর ✅
- [x] 6.5 **Conflict + temporal**: insert-এ same-kind 3-token overlap → পুরোনো row supersede; exp field (search-এ expired বাদ); hash-dedupe. Live: id 3 → id 1 supersede, duplicate skip ✅
- [x] 6.6 **Forget/Correct/Update**: mem.forget (sup=-1), mem.correct (supersede+new row), mem.save; chat router: 'ভুলে যাও'→forget (save-এর আগে check), 'মনে রেখো'→save, 'আগে কী বলেছি'→search. Live: chat 'মনে রেখো…' → id 5 সেভ ✅
- [x] 6.7 **Audit trail**: প্রতি injection-এ memaudit:{chatId,q,ids} D1-তে (30d); mem.audit tool uses+memories join করে. Live: ৫টা use-row + memory join ✅
- [x] 6.8 **MD ↔ DB sync**: mem.syncmd (bullet→kind classify: LESSON→error, সিদ্ধান্ত→decision, পছন্দ→preference; redactSecrets; hash-dedupe) + mem.export (DB→markdown). Live: JUJU-MEMORY.md → 188 inserted; re-sync → skipped:188; export 195 rows ✅
- [x] 6.9 Deployed gh-pages `0837afb6` (wv p6-v26) — ৫০ message পাঠানোর পরে পুরনো decision recall: MEMUSED:[5,75,10], উত্তর '১৫ অক্টোবর ২০২৬' ✅ (2026-09-04)

## 🟦 PHASE 7 — Visual QA + Browser Pro ✅ COMPLETE (2026-09-04)
**লক্ষ্য:** SEE→UNDERSTAND→REASON→ACT→OBSERVE→VERIFY→RECOVER loop (P4#50)। রেফ: P4#1-49,171-180; P2 Part I/J; P3#11,12।
- [x] 7.1 **qa.scene**: shotGrab (thum.io → browserless fallback) → visionAsk → structured JSON {page, elements[{name,region,state,interactive}], hierarchy, issues}. Live: app → 6 elements + hierarchy ✅
- [x] 7.2 **qa.baseline**: per url×device shot → filebPut (KV) + `qa:base:<key>` meta (sha256, mime, ts, 90d). Live: app desktop+iphone saved ✅
- [x] 7.3 **qa.compare**: sha match → identical PASS 100; ভিন্ন হলে 2-image vision diff → {score, diffs[{region,change,regression}], verdict}. Live: identical-PASS + time.is diff → BLOCK 'anti-scraping block page' ধরা ✅ (engine:'browserless' = fresh capture, thum cache bypass)
- [x] 7.4 **qa.matrix**: 390×844/412×915/768×1024/1280×800 → per-device ok+score+issues. Live: iPhone/tablet/desktop 100, **Android 412px-এ আসল সমস্যা ধরা: cards squashed (score 60)** ✅
- [x] 7.5 **qa.error**: vision error-hunt → [{region,severity,likelyCause,desc}]. Live: white-space + contrast LOW-severity রিপোর্ট ✅
- [x] 7.6 **qa.browse**: bounded loop (max 5): shot → vision {pageTitle,matchesGoal,pageError,visibleLinks,action,nextUrl} → done/continue/back/investigate. Live: goal-yes → success:true ✅
- [x] 7.7 **Recovery**: pageError/action=back → prev-URL-এ ফেরা (recovered counter, max 2, prev না থাকলে bounded stop). Live: /no-page → pageError:true → action:back → recovered:1 ✅
- [x] 7.8 **qa.gate**: per URL desktop+iphone load/layout check → overall PASS/BLOCK. Live: app PASS-checks, pages.dev 404-page → **verdict BLOCK** (দুই check-ই fail ধরেছে) ✅
- [x] 7.9 Deployed gh-pages `9288e550` (wv p7-v27) — ২০+ screenshot, ৫+ পেজ টেস্ট: app (gh.io, ৪ viewport), pages.dev 404-page, time.is, example.com, /no-page। নোট: gdrive-token tool পেজ gh-pages output-এ নেই (404) — repo-তে একমাত্র SPA-ই main page ✅

## 🟦 PHASE 8 — Background Ops (queue + scheduler + notify + observability)
**লক্ষ্য:** owner offline থাকলেও জুজু কাজ করে, খবর দেয়। রেফ: P1#36-38,72,84,85,109,126; P3#8,19; P4#191-199,242,245; P2 BG-BJ,AC।
- [ ] 8.1 **Job queue** (D1): task priority CRITICAL/HIGH/NORMAL/LOW/BACKGROUND (P4#194,195)
- [ ] 8.2 **Background worker**: cron-driven (watchman-এর পাশে), queued task চালায় (P4#197)
- [ ] 8.3 **Scheduler pro**: one-time + recurring + conditional task (P1#72)
- [ ] 8.4 **Telegram notification engine**: completed/approval-needed/failed/deploy-failed (P4#242,245)
- [ ] 8.5 **Health score**: project + agent — daily report "আজকের top ৩ সমস্যা" (P3#8)
- [ ] 8.6 **Observability**: per-task latency/tools/failures/retries/token-estimate (P2 AC)
- [ ] 8.7 **Incident Commander mode**: freeze→collect→compare deployment→recover→report (P3#19)
- [ ] 8.8 **Away-mode policy**: pre-approved mission হলে owner-অনুপস্থিতিতে পুরো কাজ; production deploy ছাড়া সব নিজে থেকে; প্রতিটি কিছুর Telegram report (owner দাবি #3)
- [ ] 8.9 Deploy → test (queued task + Telegram notify + away-mode প্রমাণ)

## 🟦 PHASE 9 — Multi-Brain + Advanced Reasoning
**লক্ষ্য:** কঠিন কাজে একাধিক brain। রেফ: P2 Part A/B/Q-S,AA-AB,BM-BN; P3#14,15; P4#202-210।
- [ ] 9.1 **Model capability registry + auto benchmark**: coding/reasoning/vision/speed track (P2 AA-AB)
- [ ] 9.2 **Model cascade**: cheap → low confidence → stronger → reviewer (P2 BM)
- [ ] 9.3 **Plan critic + alternative plans**: plan-এর আগে ছোট model দিয়ে check (P2#5,6)
- [ ] 9.4 **Solution competition**: hard task-এ A/B/C solution → judge (P3#15) — শুধু high-value-তে
- [ ] 9.5 **Sub-agent runner**: research/coder/QA specialist loops (P2 Part Q)
- [ ] 9.6 **Parallel workers + result aggregation** (P4#209,210)
- [ ] 9.7 **Confidence-based escalation** + quality gate COMPLETE/PARTIAL (P2 BN,BO)
- [ ] 9.8 Deploy → test (একটা hard task-এ cascade+critic প্রমাণ)

## 🟦 PHASE 10 — Mission Mode + Evaluation Lab (চূড়ান্ত)
**লক্ষ্য:** L6 Mission Mode — "এই bug ঠিক করে production-ready করো" এক কথায়। রেফ: P3#L6,18; P4#100,200,250; P2 AD-AH।
- [ ] 10.1 **Mission engine**: goal→bounded steps→checkpoints→verification→retry policy→stop condition→human escalation (P4#200 — Persistent ≠ Infinite)
- [ ] 10.2 **Autonomous delivery loop wiring**: understand→inspect→architect→plan→implement→build→test→debug→review→visual→security→diff→ready→approve→deploy→post-verify→report (P4#100)
- [ ] 10.3 **Deployment intelligence gate**: "Deployment verified: PASS" / "blocked: reason" (P3#18)
- [ ] 10.4 **Golden tasks**: Admission Hub-এর ২০টা real task + expected result save (P2 AE)
- [ ] 10.5 **Evaluation lab**: agent version update-এর আগে old vs new % (P2 AD)
- [ ] 10.6 **Self-test before release** + agent versioning + safe rollback (P2 AF-AG-AH)
- [ ] 10.7 **Auto docs + changelog generator** (P2 AX-AY)
- [ ] 10.8 **চূড়ান্ত অডিট**: ৪টা blueprint-এর সব capability আবার মিলিয়ে নতুন AUDIT ফাইল
- [ ] 10.9 **Owner-কে L6 mission demo** 🎓

---

## 📈 Status Legend ও Reporting নিয়ম (ভবিষ্যৎ agent-এর জন্য)
- প্রতি ধাপ শেষে: `[x]` + `(2026-MM-DD, commit abc1234)` লিখে commit করতে হবে।
- **COMPLETE ঘোষণার নিয়ম (owner-নির্দেশ, 2026-09-04):** phase-এর ১০/১০ ধাপ `[x]` না হলে "COMPLETE" বলা যাবে না; আংশিক হলে বলতে হবে "PHASE X — n/10, বাকি: …"।
- Phase শেষে owner-কে বলতে হবে: **"PHASE X COMPLETE — WAITING FOR OWNER APPROVAL"** — approval ছাড়া পরের phase নয়।
- ধাপ আটকে গেলে: সৎ partial report (কী হয়েছে / কী বাকি / কেন আটকেছে / বিকল্প কী)।
- **বর্তমান অবস্থা (2026-09-04):** Phase 1-10 সব pending। আগে থেকে live: D1 storage, 3-vault backup, 8-model router+fallback, web read/search/eye, watchman cron, approval gate, streaming chat, rollback reflex — এগুলো সংশ্লিষ্ট phase-এর ধাপে ভিত্তি হিসেবে কাজে লাগবে (বিস্তারিত: `docs/BLUEPRINT-AUDIT-143.md`)।
- **পরামর্শিত ক্রম:** 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 (নির্ভরতা অনুযায়ী: UI আগে, তারপর intent/security, তারপর repo-brain, sandbox, memory, vision, background, multi-brain, সর্বশেষ mission mode)।
- Deploy pipeline (প্রমাণিত): edit → commit → push main (tokenized URL) → gh-pages plumbing (mktree/commit-tree) → push → ৪০s wait → live verify। বিস্তারিত recipe: `/home/user/JUJU-MEMORY.md`।
