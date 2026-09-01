# ADMISSION HUB AI — Implementation Roadmap (dependency-ভিত্তিক)

> নিয়ম: কোনো ফিচার "চলছে" দেখানো হবে না যতক্ষণ না সত্যিই backend-এ কাজ করে।

## Phase 1 — Premium Chat Foundation ✅ (এখন বানানো)
- Chat + streaming + markdown + code highlight + tables
- Model Router (AUTO + fallback + config-driven models)
- Response modes (Fast/Balanced/Deep)
- User Memory + chat history + manage (rename/pin/search/delete/branch/export)
- Usage ledger

## Phase 2 — Real Auth + History in DB
- Supabase Auth (owner-only লগইন) + Postgres-এ chats/files/memory
- (এখন local JSON — single private user; ডেটা হারানো থেকে বাঁচাতে এটাই প্রথম)

## Phase 3 — Files Pro + Projects + Canvas
- PDF/DOCX/XLSX parsing (serverless parse) → MCQ extraction pipeline
- Projects workspace (project memory + files + instructions)
- Canvas (document/code writer panel) — real AI-edit

## Phase 4 — Deep Research + Image
- Deep research agent (plan → multi-source → cross-check → report artifact)
- Image generation (Gemini image model / provider-key হলে)

## Phase 5 — Agent Runtime + Tools (sandboxed)
- Tools: read/search/create/update file · git status/diff/commit/PR
- Sandbox: E2B free tier বা GitHub Actions runner — এখানেই কোড চলবে
- Agent task panel + Plan → Approve → Execute (real)
- Risk levels: LOW auto · HIGH approval

## Phase 6 — GitHub + Code Workspace
- GitHub App (scoped, master key কখনো নয়) + Monaco editor + diff viewer
- Branch → commit → PR workflow

## Phase 7 — Deployment Automation
- Vercel/Cloudflare preview → health check → owner approval → production → verify → record
- Rollback + deploy log

## Phase 8 — Admission Hub Integrations
- Supabase scoped tools: question_bank_read/update, vocabulary_read/update, content_sync
- Project knowledge RAG (pgvector)

## Phase 9 — Automation + Background Tasks
- Daily health check, nightly reports, notifications, pg-boss queue

## Phase 10 — Multi-Agent
- Orchestrator → Research/Coding/Testing/Deployment specialists

## Hard limits (সৎ)
- Agent কখনো payment/financial/user-PII/master secret পাবে না (নকশায় deny)
- Sandbox ছাড়া code execute হয় না
- Free tier-এ runtime sessions সীমিত — দীর্ঘ task background queue-তে
