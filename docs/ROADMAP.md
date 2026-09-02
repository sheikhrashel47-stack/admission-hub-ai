# Admission Hub AI — Official Master Roadmap (10 Phases)

> নিয়ম: প্রতিটি ফেজের শেষে `PHASE X COMPLETE — WAITING FOR OWNER APPROVAL` — Owner-এর অনুমোদন ছাড়া পরের ফেজে যাওয়া নিষিদ্ধ।
> §45: প্রতিটি দৃশ্যমান ফিচার real হতে হবে (ব্যাকএন্ড ছাড়া কিছু দেখানো যাবে না)। §63: বড় কাজ আগে প্ল্যান।
> আপডেট: ২০২৬-০৯-০২

---

## ✅ Phase 1 — AI Chat UI  (চলছে → প্রায় শেষ)

| আইটেম | Status |
|---|---|
| Premium mobile chatbox (dark iOS + emerald) | ✅ |
| Clean composer (auto-expand, safe-area keyboard) | ✅ |
| `+` tools menu (bottom sheet) | ✅ |
| 3-dot menu (header ⋮ → conversation menu) | ✅ |
| Long-press message actions (copy/regen/edit/share/delete…) | ✅ |
| File upload UI (+ attachment chips) | ✅ |
| Image UI | ✅ (Gemini vision live — local + public worker, লাল→লাল/নীল→নীল verified) |
| **Chat Engine Stability** (windowed 60/বার্তা + পুরোনো-লোডার, history server-pagination 50/পাতা, title+content+date search, in-chat search (server, debounced), partial-stream crash recovery + retry, regenerate-এ মিস-টার্গেট ফিক্স + ব্যর্থ হলে পুরোনো উত্তর restore, hero ধ্বংস-বাগ ফিক্স, draft autosave, race-safe streaming, H1–H6/italic/checklist/hr মডার্ন md, codeBox কপি) | ✅ LOCALLY TESTED — deploy pending tokens |
| Voice input UI (mic + Listening wave) | ✅ (ব্রাউজার SpeechRecognition) |
| Model selector (Auto/Fast/Balanced/Deep + provider list) | ✅ |
| Agent Mode UI | 🔒 তৈরি, কিন্তু backend agent বন্ধ থাকায় hidden (Phase 4-তে চালু) |
| **Light/Dark theme toggle** | ✅ (ডিফল্ট লাইট — MASTER UI রুল) |
| **MASTER UI রুল মেনে চলা** (কোনো বটম-নেভ নেই, টুলস শুধু `+`, ⋮ মেনু, হরাইজন্টাল মেসেজ অ্যাকশন) | ✅ **PWA v4** |
| Mobile keyboard behavior (visualViewport) | ✅ |
| Loading / error / fallback UI | ✅ |

**Phase 1 = 100% সম্পন্ন ঘোষণার আগে বাকি:** Owner-এর ভিজ্যুয়াল রিভিউ (লাইভ: localhost:3000) + পাবলিক ডিপ্লয় (টোকেন লাগবে)।

---

## 🧩 Phase 2 — AI Core + Model Router (৮০% → ১০০%)

- ✅ Gemini / Groq / Mistral integration (server-side key; Cerebras free credit শেষ → বাদ)
- ✅ Model selection, automatic fallback chain, streaming SSE
- ✅ Context handling (last-24 messages + memory)
- ✅ Error handling + retry (provider failover, 4-attempt chain)
- 🟡 Provider health check `/api/system` (extend: dynamic live ping)
- 🟡 OpenRouter integration (key লাগবে — `.env.local` + KV)
- 🟡 Token/context management (অটো-সংক্ষেপণ: লম্বা চ্যাট → সারাংশ)
- ⏳ **Gemini Vision (PDF/DOCX/ইমেজ/ছবি-বোঝা)** — Phase 1-এর image UI-এর gate
- ⏳ Response quality v2 (system prompt, ইনলাইন সাইটেশন, ফলো-আপ সাজেশন)

---

## 🛠️ Phase 3 — Tool System (input → execution → result → error → retry)

- ✅ Web search (Tavily) · File read/write · File analyze/ask · Project search
- ⏳ Code execution/workspace (E2B / WebContainers — free tier)
- ⏳ Browser tool (Browser Use Cloud — ~$40/মাস, বাজেট-গেটেড)
- ⏳ Git operations (GitHub API — repo/commit/branch)
- ⏳ Database operations (Cloudflare D1/KV ops)
- ⏳ Image/file processing (Gemini vision pipeline)
- ⏳ Testing (run tests, capture output)

---

## 🤖 Phase 4 — Private Agent Engine

- ⏳ Plan → Tools নির্বাচন → Execute → Verify → Retry → Final Report
- ⏳ Research Agent (সাব-প্রশ্ন → মাল্টি-সার্চ → সাইটেশন রিপোর্ট)
- ⏳ File Agent · Code Agent (লিখে/রান করে test) · Project-inspect Agent
- ⏳ Agent step-cards live (UI রেডি), পারমিশন গেট (§26/§38/§39), টাস্ক লিমিট

---

## 🏗️ Phase 5 — Admission Hub Knowledge + Project Brain

- ⏳ স্থায়ী project knowledge: architecture, PWA, Public App, Question Bank, Vocabulary, UI rules, DB structure, deployment structure, known bugs, decisions, current status, roadmap
- ⏳ Project Memory: agent এসে "Admission Hub এখন কোথায় আছে?" — উত্তর পাবে নিজে থেকে
- 🟡 ভিত্তি আছে: memory notes + chat history + এই docs

---

## 🔐 Phase 6 — Owner Security + Secret Management

- 🟡 API keys: server-side only (Cloudflare KV `cfg:*`) — সঠিক প্যাটার্ন
- ⏳ Owner-only auth (passkey/WebAuthn — GitHub Pages HTTPS-এ সম্ভব; অথবা owner access code)
- ⏳ Secure session + device/session management + emergency revoke
- ⏳ Secret vault UI (keys কখনো response-এ না — runtime-only ব্যবহার)
- ⏳ Audit log + login/activity history + agent permission system

---

## 🔗 Phase 7 — Full Infrastructure Integration

- ✅ Cloudflare Pages (backend) · GitHub Pages (PWA) · AI providers
- ⏳ GitHub API (repos/commits) · Supabase/Cloudflare D1 (per-user data) · Domain
- ⏳ প্রতিটি integration-এর test suite

---

## 🚀 Phase 8 — Development + Deploy Automation

- ⏳ Agent: inspect → plan → edit → test → commit → preview → verify → deploy
- ✅ ম্যানুয়াল pipeline আছে (Cloudflare direct-upload + gh-pages force-push)
- ⏳ প্রিভিউ/প্রোডাকশন ডিপ্লয়, rollback, build logs, status, health checks

---

## 📜 Phase 9 — Complete History / Continuity System

- ⏳ Timeline: agent task, prompt, plan, files changed, tests, commit, deploy, error, fix, rollback, config change, DB change, agent session
- 🟡 ভিত্তি: চ্যাট-হিস্টরি + usage log + এই রোডম্যাপ
- ⏳ নতুন agent এলে state রিকভারি

---

## 🧪 Phase 10 — Full QA + Autonomous Workflow + Production

- ⏳ Full-system QA (AI/Agent/Tools/GitHub/Cloudflare/PWA/DB/Security/UI)
- ⏳ Real-world command tests → Production Ready

---

## 🔄 Execution Rules
1. **প্রতি ফেজ-শেষে**: `PHASE X COMPLETE — WAITING FOR OWNER APPROVAL`
2. Owner approve করলেই পরের ফেজ।
3. নতুন agent এলে: এই ফাইল + Phase 9 history → তৎক্ষণাৎ state বুঝবে।
4. $0-প্রথম; কোনো ফিচার ব্যাকএন্ড ছাড়া UI-তে আসবে না (§45)।
