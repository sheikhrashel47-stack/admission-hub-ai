# 🚀 PRIVATE AI AGENT — ULTIMATE 10-PHASE BLUEPRINT

> **এই ফাইলটা কেন আছে:** Admission Hub AI-এর চূড়ান্ত লক্ষ্য, architecture-এর দর্শন, আর ১০টা phase-এর সম্পূর্ণ রোডম্যাপ এখানে স্থায়ীভাবে লেখা আছে।
> **নতুন যেকোনো agent / developer — প্রথমেই এই ফাইলটা পড়ো।** এখান থেকেই project-এর উদ্দেশ্য, কোথায় কাজ হয়েছে, আর কী বাকি — সব বুঝে নাও। কাউকে মুখে বুঝিয়ে দিতে হবে না।
>
> **সম্পর্কিত ডক:** `docs/ROADMAP.md` (phase-ভিত্তিক বাস্তবায়ন টিকা), `docs/PHASE1-STABILITY-REPORT.md`, `docs/UPGRADE-ROADMAP-ChatGPT-Level.md`।
>
> **লাইভ:** PWA → https://sheikhrashel47-stack.github.io/admission-hub-ai/ · Backend → Cloudflare Pages (`web-backend/_worker.js`) · Repo → `sheikhrashel47-stack/admission-hub-ai`

---

## 📌 নতুন Agent-দের জন্য নিয়ম (অবশ্যই মানবে)

1. **আগে পড়ো:** এই BLUEPRINT → `docs/ROADMAP.md` → কোড। তারপর কাজ শুরু।
2. **Phase Approval Rule (অপরিবর্তনীয়):** প্রতিটা phase শেষ হলে agent নিজে থেকে পরের phase-এ যাবে **না**। থেমে শুধু বলবে:
   > **`PHASE X COMPLETE — WAITING FOR OWNER APPROVAL`**
   Owner approve না করা পর্যন্ত পরের phase শুরু করবে না। এটাই project-কে AI-এর “উৎসাহে” এলোমেলো হয়ে যাওয়া থেকে বাঁচায়।
3. **§45 — যা নেই তা “আছে” দেখানো যাবে না:** কোনো ফিচার ব্যাকএন্ড ছাড়া শুধু UI-তে আসবে না। health/status সবসময় সত্যি বলবে।
4. **$0-প্রথম:** কার্ড/টাকা লাগে না এমন সমাধান আগে (Cloudflare free tier, Gemini/Groq free, GitHub Pages, Drive)।
5. **Key কখনো client-এ নয়:** সব secret server-side (env / KV `cfg:*` / secret vault)। chat response-এ key প্রকাশ করা যাবে না।
6. **Model ≠ Agent:** আজকের সেরা model কাল বদলাবে; কিন্তু Agent Operating System (orchestrator + memory + tools + workspace + checkpoints + verification + history) স্থায়ী। provider বদলালেও capability হারাবে না।

---

## 📍 বর্তমান অবস্থা (snapshot — 2026-09-03)

> এটা সময়ের সাথে বদলাবে। প্রতিটা phase শেষে agent এই টেবিল আপডেট করবে।

| Phase | নাম | অবস্থা | যা আছে (বাস্তব) / যা বাকি |
|---|---|---|---|
| **1** | Premium Chat UI | ✅ **কার্যত সম্পূর্ণ** | চ্যাট/কম্পোজার/+ মেনু/⋮ মেনু/long-press/markdown+code/মডেল সিলেক্টর/থিম/কীবোর্ড/loading-error/ছবি-ফাইল UI+আপলোড স্পিনার/virtualized windowed history। **বাকি:** jump-to-latest, loading skeleton, offline/reconnect banner, tool-executing state, desktop responsive, ১০k-message full virtualization |
| **2** | AI Core + Router | ✅ **~৯০%** | Multi-provider (Gemini/Groq/Cerebras/Mistral/OpenRouter), auto fallback চেইন, SSE streaming, context (tail ২৪ + summary compaction), retry/regenerate, provider health ping, vision+PDF → Gemini রাউটিং। **বাকি:** model registry-তে full capability metadata, health engine (latency/success/quota), semantic memory, token budget manager, tool-aware trimming, durable task runtime, parallel execution |
| **3** | Universal Tool System | 🟡 **~৪০% (ফিক্সড-ফ্লো)** | ✅ web search (Tavily), file read/write/analyze, chat/project search, Google Drive backup। ❌ model-driven tool-calling loop, code execution/shell, GitHub ops, Cloudflare/Supabase/Gmail/Telegram/Browser tools |
| **4** | Autonomous Agent Engine | ⬜ **শুরু হয়নি** | `features.agent:false`; plan→tools→execute→verify লুপ নেই |
| **4.5** | Multi-Agent Workforce | ⬜ | — |
| **5** | Project Brain | 🟡 আংশিক | user memory + docs আছে; living project-graph/knowledge নেই |
| **6** | Owner Security | ⬜ প্রায় শূন্য | শুধু “key server-side”; auth/passkey/vault/audit নেই |
| **7** | Ecosystem Integration | 🟡 আংশিক | Cloudflare + AI providers + GitHub Pages + Drive লাইভ; Supabase/Gmail/Telegram/Browser বাকি |
| **8** | Dev + Deploy Automation | 🟡 ম্যানুয়াল | হাতে push/deploy; agent automation/rollback/preview নেই |
| **8.5** | High-Performance Engine | ⬜ | — |
| **9** | Continuity + History | 🟡 আংশিক | chat history + usage log আছে; agent task timeline/checkpoint নেই |
| **10** | Full QA + Production | ⬜ | — |

**এক লাইনে:** Phase 1 শেষ, Phase 2 feature-complete (advanced অংশ বাকি) → দাঁড়িয়ে আছে **Phase 3 (model-driven tool loop)**-এর দরজায়, যেটা Phase 4 Agent-এর ভিত্তি।

---

# 🚀 PRIVATE AI AGENT — ULTIMATE 10-PHASE ROADMAP

## PHASE 1 — Premium AI Chat UI

**Goal:** ChatGPT/Gemini-level polished mobile experience।

বর্তমান UI থাকবে, কিন্তু production-grade করতে আরও এগুলো lock করতে হবে:

- Premium mobile chat layout
- Message streaming UI
- Markdown + code block renderer
- Syntax highlighting
- Copy / edit / regenerate / retry
- Long-press actions
- Reply / quote
- File/image attachment UI
- Voice input/output UI
- Model selector
- Agent Mode selector
- New chat / rename / archive
- Search conversations
- Pin important chats
- Draft persistence
- Keyboard-safe composer
- Auto-scroll intelligence
- “Jump to latest”
- Loading skeleton
- Error state
- Offline state
- Network reconnect state
- Tool-executing state
- “Agent is working…” state
- Background task status indicator
- Dark / Light theme
- Responsive desktop support

**বিশেষভাবে:** ১০,০০০ message-এর chat যেন UI ভেঙে না যায়। পুরো conversation DOM-এ একসাথে render করা যাবে না।

ব্যবহার করবে:
**Virtualized Message List + Windowed Rendering + Message Chunking + Incremental History Loading**

অর্থাৎ ১০,০০০ message থাকলেও screen-এ বাস্তবে প্রয়োজনীয় কয়েকশো DOM node থাকবে।

---

## 🧠 PHASE 2 — AI CORE + ULTRA MODEL ROUTER

এটাই সবচেয়ে বেশি upgrade করা হচ্ছে। Future agent-এর power অনেকটাই এখানে নির্ধারিত হবে।

### 2.1 Multi-Provider AI Gateway
একটা provider-এর উপর কখনো dependency থাকবে না।

```
                PRIVATE AI GATEWAY
                       │
      ┌────────────────┼────────────────┐
      ↓                ↓                ↓
   Gemini        OpenRouter        Other APIs
      │                │                │
      └────────────────┼────────────────┘
                       ↓
                Model Registry
```

Model registry-তে প্রতিটা model-এর: provider, model ID, context size, input capability, output capability, vision, tool calling, structured output, coding ability, reasoning ability, speed, cost, reliability, timeout, rate limit, health status থাকবে।

### 2.2 Intelligent Model Router
শুধু dropdown selector না — agent নিজেই বুঝবে কোন কাজের জন্য কোন model ভালো:

- Simple chat → fast model
- Deep coding → reasoning/coding model
- Huge codebase → long-context model
- Image analysis → vision model
- Cheap background task → low-cost model
- Critical production change → high-reliability model

**Routing factors:** task type, complexity, context size, tool requirement, latency, provider health, token budget, cost budget, previous failure rate, model capability।

### 2.3 Automatic Failover
Gemini → timeout → retry → still failed → OpenRouter → alternative model → continue।
Conversation break হবে না; failover-এ আবার পুরো context শুরু থেকে দেওয়া হবে না।

### 2.4 Provider Health Engine
প্রতি provider-এর latency, success rate, timeout rate, HTTP errors, quota state, rate-limit state, last successful request, current availability track হবে।
Unhealthy provider এড়িয়ে healthy-তে route হবে।

### 2.5 Context Intelligence
১০,০০০ message প্রতিবার model-কে পাঠানো যাবে না। Layer:

1. **Active Context** — বর্তমান কয়েকটা message
2. **Recent Context** — সাম্প্রতিক window
3. **Summary Memory** — পুরনো অংশের compressed summary
4. **Semantic Memory** — পুরনো relevant message/decision
5. **Project Memory** — Admission Hub-এর স্থায়ী knowledge
6. **Task Memory** — বর্তমান task-এর state

### 2.6 Automatic Conversation Compression
Message 1–500 → summary; 501–1000 → summary … কিন্তু **original message delete হবে না**।
Storage পূর্ণ history রাখবে, model context intelligently retrieve করবে।

### 2.7 Context Retrieval
“গত সপ্তাহে login bug যেভাবে fix করেছিলাম সেটাই করো” — agent পুরো ১০,০০০ message পড়বে না:
query → semantic search → relevant messages → project memory → task history → context builder → model।

### 2.8 Token Budget Manager
প্রতি request-এ: system budget, conversation budget, retrieved-context budget, tool-output budget, reasoning budget, response budget। Overflow হলে intelligent trimming।

### 2.9 Tool-Aware Context
Tool result বিশাল হলে পুরোটা দেওয়া হবে না (যেমন ২০,০০০ লাইন ফাইল → relevant sections → summary → exact snippets → model)।

### 2.10 Structured AI State
প্রতি request internally: Conversation · Task · Plan · Context · Tool State · Model State · Errors · Retries · Checkpoint · Final Result হিসেবে থাকবে।

### 2.11 Streaming Engine
Token-by-token streaming-এর পাশাপাশি: tool-call streaming, progress streaming, status streaming, partial-result streaming, reconnect streaming।
```
Analyzing project…
✓ Repository connected
✓ 184 files indexed
✓ Found auth module
→ Inspecting login flow
→ Running tests
```

### 2.12 Retry & Recovery Engine
তিন ধরনের retry: **Request Retry** (API call fail), **Tool Retry** (tool execution fail), **Task Recovery** (একটা step fail → checkpoint থেকে ওই step retry → বাকি continue)।

### 2.13 Parallel Model Execution
একই task-এর multiple reasoning path (Agent A analysis, B coding, C testing → Synthesizer) — complex কাজের quality বাড়ায়।

### 2.14 Cost / Resource Governor
Background কাজে token budget, API budget, execution budget, max retries, max runtime, parallel worker limit।

### 2.15 ⭐ Durable Task Runtime (সবচেয়ে গুরুত্বপূর্ণ)
“একটানা ৫–৬ ঘণ্টা background-এ কাজ” — সাধারণ HTTP request দিয়ে reliable হয় না।
```
User Command → Create Job → Persistent Queue → Worker/Agent Runtime
   → Checkpoint → Tool → Checkpoint → Model → Checkpoint → Next Step
```
Browser বন্ধ হলেও কাজ চলবে; phone offline হলেও task state হারাবে না; server restart হলেও task resume করবে।

---

## 🧩 PHASE 3 — UNIVERSAL TOOL SYSTEM

AI শুধু কথা বলবে না:
**AI → Tool Selection → Permission Check → Execution → Result → Validation → Next action**

প্রতিটা tool-এর flow: **input → execution → result → error → retry**।

**Core integrations:**

- **Files:** read · write · edit · rename · move · delete · diff
- **Code:** terminal · shell · package install · build · lint · format · test
- **GitHub:** repo list · branch · clone · read · write · commit · push · PR · issue · release · Actions · workflow logs
- **Cloudflare:** Workers · Pages · D1 · KV · R2 · Durable Objects · deployments · versions · logs · build status · DNS (যেখানে permission)
  - Cloudflare Workers-এ version ও deployment আলাদা ধারণা; deployment traffic-এর version বেছে নেয় — এটা agent-এর preview → verify → production workflow-এর জন্য আদর্শ।
- **Supabase:** database · tables · SQL · migrations · auth · storage · edge functions · logs
- **Gmail:** inbox read · search · draft · send · reply · attachments
- **Telegram:** send message · receive command · notifications · deployment/agent-progress/error alerts
- **Browser:** open website · search · click · type · screenshot · extract · test website · dashboards interact

**পরবর্তীতে:** Google Drive, Sheets, Calendar, Discord, Slack, Notion, Linear, Jira, Trello, Docker, npm, PyPI, S3-compatible storage, monitoring, analytics, domain providers।

---

## 🤖 PHASE 4 — PRIVATE AUTONOMOUS AGENT ENGINE

এখানে AI সত্যিকারের agent হবে।

“Admission Hub inspect করো” → internal loop:
```
UNDERSTAND → PLAN → INSPECT → EXECUTE → OBSERVE → VERIFY
   → REPLAN (if needed) → FINAL REPORT
```

**Capabilities:** repository understanding, architecture analysis, bug diagnosis, feature development, refactoring, migration, documentation, testing, deployment, rollback, debugging, research, browser tasks, database tasks, email automation, Telegram automation।

### 🔥 Self-Check layer (সবচেয়ে শক্তিশালী)
Code লিখেই final বলবে না:
```
Write code → Review own changes → Run tests → Inspect errors → Fix
   → Run tests again → Regression check → Final validation
```
এটাকে verification loop বানাতে হবে।

### 🧠 PHASE 4.5 — Multi-Agent Workforce
একজন AI সব কাজ করবে না। **MASTER AGENT** orchestrate করবে:
Research · Coding · Debug · Testing · Browser · Database · Security · Deployment · Reviewer Agent।
বড় task: Research → Coder → Tester → Security Review → Deploy → Health Check।

---

## 🏗️ PHASE 5 — ADMISSION HUB PROJECT BRAIN

Admission Hub শুধু memory না — একটা **living project knowledge system** পাবে। Store করবে:
architecture, repository map, components, database schema, API map, integration map, UI rules, feature list, design system, deployment architecture, environment config, known bugs, previous fixes, decisions, roadmap, current status, TODO, technical debt।

### 🧠 Project Graph
সবকিছুর relationship track হবে:
```
Feature → Component → File → Database → API → Deployment
```
যেমন: Login → Auth UI → auth.js → Supabase Auth → Session middleware → Cloudflare deployment।
ফলে agent বুঝবে একটা change কোথায় কোথায় impact ফেলবে।

---

## 🔐 PHASE 6 — OWNER SECURITY + SECRET VAULT

কোনো API key chat history-তে plaintext হবে না।
```
Owner → Authentication → Authorization → Secret Vault → Runtime injection → Tool
```

**Secrets:** Gemini, OpenRouter, Cloudflare, GitHub, Supabase, Gmail, Telegram, Browser credentials, deployment secrets — সব আলাদা secret identity।
Cloudflare-ও deployment credentials repo-তে না রেখে CI/CD secret storage ব্যবহারের পরামর্শ দেয়।

**Features:** owner-only access, passkey/biometric, session control, device management, secret encryption, least privilege, scoped permissions, emergency revoke, audit log, tool approval policy, production approval policy।

---

## 🔗 PHASE 7 — FULL ECOSYSTEM INTEGRATION

```
                PRIVATE OWNER AI
                      │
       ┌──────────────┼──────────────┐
       ↓              ↓              ↓
    Models         Memory        Agent Core
       └──────────────┼──────────────┘
                      ↓
                   TOOL BUS
                      │
 ┌──────┬───────┬─────┼──────┬───────┬────────┐
 ↓      ↓       ↓     ↓      ↓       ↓        ↓
GitHub Cloudflare Supabase Gmail Telegram Browser Files
```

---

## 🚀 PHASE 8 — AUTONOMOUS DEVELOPMENT + DEPLOYMENT

“এই bug fix করো” → agent:
```
Inspect → Understand → Plan → Create branch → Edit code → Run tests → Fix failures
→ Review diff → Build → Preview deploy → Browser test → Health check
→ Create commit → Push → Optional PR → Owner approval → Production deploy → Verify
```
Cloudflare-এ programmatic deployment API আছে এবং GitHub Actions দিয়ে Workers deploy automate করা যায় — workflow বাস্তব infrastructure-এ করা সম্ভব।

**Rollback:** Production → problem detected → previous known-good version → rollback → health check (Cloudflare Workers-এর version/deployment model এ জন্য সরাসরি ব্যবহারযোগ্য)।

### 🕒 Long-Running Work (৫–৬ ঘণ্টা)
আলাদা **Background Agent Runtime**:
```
Start Job → Scan 1 → Checkpoint → Scan 2 → Checkpoint → Analyze →
Checkpoint → Tests → Checkpoint → Generate report
```
Job lifecycle: **Queued · Running · Paused · Waiting for input · Retrying · Blocked · Completed · Failed · Cancelled**।
⚠️ “unlimited magically” ধরে design নয় — persistent resumable jobs, যাতে provider/platform limit থাকলেও task এগোয় ও resume হয়।

### ⚡ PHASE 8.5 — High-Performance Engine
- Parallel execution (A: frontend, B: backend, C: database, D: tests, E: security)
- Intelligent caching (একই code বারবার scan নয়)
- Incremental indexing (শুধু changed files)
- Persistent workspace (প্রতি task-এর filesystem)
- Checkpoint snapshots
- Worker queue (এক task আরেক task block করবে না)
- Backpressure + Resource governor (CPU/memory/token/API cap)

---

## 📜 PHASE 9 — COMPLETE CONTINUITY + HISTORY

Timeline উদাহরণ:
```
03 Sep
00:21 — Agent started task
00:24 — Repository indexed
00:31 — Bug detected
00:39 — Fix created
00:45 — Tests failed
00:51 — Fix revised
00:56 — Tests passed
01:02 — Commit created
01:08 — Preview deployed
01:12 — Browser verification passed
01:15 — Production deployed
01:17 — Health check passed
```

Store হবে: user command, plan, model used, tools used, files changed, diff, tests, errors, retries, decisions, commits, deployments, rollbacks, database changes, config changes, agent sessions।

### 🧬 Continuity Engine
নতুন agent এলে লোড করবে: **Current Project State + Recent Tasks + Open Issues + Architecture + Previous Decisions + Active Jobs + Deployment State**।
তখন “Admission Hub কী?” শুরু থেকে বুঝাতে হবে না — সে project state পড়ে continue করবে।

---

## 🧪 PHASE 10 — FULL QA + PRODUCTION

সব system একসাথে test:

- **AI:** model routing, fallback, streaming, context, retry, token handling
- **Agent:** planning, tool calling, multi-step task, self-check, recovery, long-running task
- **Tools:** Files, GitHub, Cloudflare, Supabase, Gmail, Telegram, Browser, Database
- **Infrastructure:** queues, worker, persistence, logs, monitoring, secrets, authentication
- **UI:** mobile, desktop, ১০,০০০-message conversation, long response, streaming, attachments, reconnect, background job status

---

## 🏆 FINAL SYSTEM ARCHITECTURE

```
                       OWNER
                         │
                         ↓
                  PRIVATE CHAT UI
                         │
                         ↓
                SESSION / AUTH LAYER
                         │
                         ↓
                AI ORCHESTRATION CORE
                         │
      ┌──────────────────┼──────────────────┐
      ↓                  ↓                  ↓
 MODEL ROUTER         MEMORY           TASK ENGINE
      │                  │                  │
      ↓                  ↓                  ↓
 Gemini/OpenRouter   Project Memory     Job Queue
 Other Providers     Conversation       Checkpoints
                     Memory              Scheduler
                                         Workers
      └──────────────────┼──────────────────┘
                         ↓
                      TOOL BUS
                         │
  ┌────────┬────────┬────┼──────┬────────┬────────┐
  ↓        ↓        ↓    ↓      ↓        ↓        ↓
 GitHub Cloudflare Supabase Gmail Telegram Browser Files
                         │
                         ↓
                   VERIFY / TEST
                         │
                         ↓
                  REVIEW / APPROVE
                         │
                         ↓
                    DEPLOY ENGINE
                         │
                         ↓
                 HEALTH / MONITORING
                         │
                         ↓
                HISTORY + AUDIT LOG
                         │
                         ↓
                PROJECT CONTINUITY
```

### 🎛️ AGENT CONTROL CENTER
Owner-এর জন্য আলাদা dashboard:
```
ACTIVE AGENTS     3
RUNNING TASKS     7
QUEUED TASKS      12
FAILED TASKS      1
BACKGROUND JOBS   4

GitHub       ● Connected
Cloudflare   ● Connected
Supabase     ● Connected
Gmail        ● Connected
Telegram     ● Connected
Browser      ● Connected
```
প্রতি active task:
```
Task: Fix Login System        Status: Running     Elapsed: 2h 14m
Agent: Coding Agent           Model: Current Best Coding Model
Progress: ██████████████████░░ 87%
Current: Running integration tests…
Files changed: 14   Tests: 38   Passed: 35   Failed: 3   Retries: 2
```
এটা private AI-কে সাধারণ chat app থেকে personal engineering command center বানাবে।

### 🧠 মূল design principle — Model ≠ Agent
```
MODEL → REASONING ENGINE → ORCHESTRATOR → MEMORY → TOOLS
      → WORKSPACE → CHECKPOINTS → VERIFICATION → DEPLOYMENT → HISTORY
```
এটাই আসল শক্তি: আজকের সেরা model কাল বদলাতে পারে, কিন্তু Agent Operating System একই থাকবে। provider/model বদলালেও private agent-এর capability হারাবে না।

> লক্ষ্য: Claude Code / Codex / Cursor / Devin / OpenHands-এর হুবহু clone নয় — বরং **deep coding + autonomous cloud execution + integrations + long-running jobs + persistent project memory + owner security** — এই capability-গুলো একসাথে করা।

---

## ✅ FINAL PHASE MAP

```
PHASE 1   Premium Chat UI
            ↓
PHASE 2   AI Core + Ultra Model Router
          (+ Context Engine, Token Manager, Failover, Health Engine, Durable Task Runtime)
            ↓
PHASE 3   Universal Tool System
            ↓
PHASE 4   Autonomous Agent Engine (+ Self-Verification, Multi-step Reasoning)
            ↓
PHASE 5   Admission Hub Project Brain (+ Project Graph, Persistent Memory)
            ↓
PHASE 6   Owner Security (+ Secret Vault, Permissions, Audit)
            ↓
PHASE 7   GitHub + Cloudflare + Supabase + Gmail + Telegram + Browser (Full Ecosystem)
            ↓
PHASE 8   Autonomous Coding + Testing + Git + Preview + Production + Rollback
          (+ 5–6h Resumable Background Jobs)
            ↓
PHASE 9   Complete History + Continuity + State + Timeline
            ↓
PHASE 10  Full QA + Stress Test + Security Test + Real-world Agent Test + Production Ready
```

---

## 🔒 Phase Approval Rule (অপরিবর্তিত)

প্রতিটা phase শেষ হলে agent **অবশ্যই থামবে** এবং শুধু বলবে:

> **`PHASE X COMPLETE — WAITING FOR OWNER APPROVAL`**

Owner approve না করা পর্যন্ত পরের phase শুরু করবে না। এটাই project-টাকে AI-এর “উৎসাহে” এলোমেলো হয়ে যাওয়া থেকে বাঁচাবে।
