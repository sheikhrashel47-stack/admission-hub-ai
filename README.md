# ADMISSION HUB AI — Private AI Command Center

> **🤖 নতুন AI এজেন্ট? প্রথমে পড়ো: [`AGENTS.md`](AGENTS.md)** → তারপর **🌌 [`docs/MASTER-100/00-INDEX-AND-RULES.md`](docs/MASTER-100/00-INDEX-AND-RULES.md)** — ১০০ phase-এর চূড়ান্ত মহাপরিকল্পনা (২০২৬–২০২৮), শাসন-নিয়ম ও অগ্রগতি-ট্র্যাকার।
> 📜 পুরনো ১০-phase প্ল্যান (✅ সম্পূর্ণ): [`docs/JUZU-EXECUTION-PLAN.md`](docs/JUZU-EXECUTION-PLAN.md) · অডিট: [`docs/FINAL-AUDIT-P10.md`](docs/FINAL-AUDIT-P10.md) · গ্যাপ-গবেষণা: [`docs/DEEP-RESEARCH-V34.md`](docs/DEEP-RESEARCH-V34.md)

> **ব্র্যান্ড:** Admission Hub AI · **স্ট্যাটাস:** Phase 1 + Research — সম্পূর্ণ real (কোনো ফেক নয়) · **খরচ: $0**

## 🔗 লাইভ লিংক

| কী | লিংক |
|---|---|
| 🌐 **PWA অ্যাপ (Public)** | **https://sheikhrashel47-stack.github.io/admission-hub-ai/** — ব্রাউজারে খুলো → **Add to Home Screen** (iOS: Safari → Share → Add to Home Screen) |
| 🤖 AI Backend (free) | `https://admission-hub-ai.pages.dev` — Cloudflare Pages `_worker.js` + KV (keys server-side) |
| 📦 GitHub repo | `https://github.com/sheikhrashel47-stack/admission-hub-ai` |

## যা আছে (সত্যি যা আছে)

- 💬 প্রিমিয়াম chat — streaming, markdown, tables, code highlight, citations
- 🧠 Model Router: AUTO (task-ভিত্তিক) + explicit fallback chain (Groq → Gemini → Mistral → OpenRouter; Cerebras বাদ — ফ্রি ক্রেডিট শেষ)
- 🔎 Web Research (Tavily) — live steps + clickable সোর্স
- 📁 ফাইল: upload / preview / AI বিশ্লেষণ / প্রশ্ন — **PDF (Gemini নেটিভ পার্সিং)** + txt/md/csv/json/কোড
- 🖼️ ছবি বিশ্লেষণ — গ্যালারি বা ক্যামেরা থেকে ছবি (Gemini vision), PWA-তে ক্যামেরা capture
- 🧠 User Memory (নোট + toggle) — সব চ্যাটে injected
- 🗂️ চ্যাট history: search / delete / branch / regenerate / export .md
- ⚡/⚖️/🌊 Response modes · 🎙️ ভয়েস ইনপুট · 🔊 TTS · 🌙/☀️ থিম
- 📲 PWA — installable, offline UI shell, icons, iOS meta
- 📊 Usage ledger (প্রতি মডেল request/token)
- 🤖 Agent Task panel + System Status + Deployments (real, এখন Phase 5/7-এর বাকি সৎভাবে লেখা)

## আর্কিটেকচার (সব ফ্রি)

```
📱 PWA (GitHub Pages)  ──►  ☁️ Cloudflare Pages backend  ──►  Groq/Gemini/Mistral/OpenRouter + Tavily
                                 (KV: chats/files/memory)
```

## চালানো (লোকাল)
```bash
cp .env.example .env.local   # key বসাও
node server.mjs              # → http://localhost:3000
```

## সততার ঘোষণা
- PDF ও ছবি বিশ্লেষণ ✅ (Gemini native) · DOCX/Office, Canvas, Agent tools (code edit/git), Deploy automation, Image gen → পরের Phase (docs/ROADMAP.md)
- কখনো fake loading নেই — যেটা "চলছে" দেখায় সেটা সত্যিই backend-এ চলছে
- Keys কখনো client-এ নেই: Workers Secrets-এ; model শুধু tool result + minimal context পায়

## 🔐 নিরাপত্তা নোট (গুরুত্বপূর্ণ)
- এই repo **public** — এখানে কোনো key নেই (`.env.local`, `data/` gitignored)
- GitHub PAT ও Cloudflare token যথারীতি **revoke** করে দাও (এগুলো chat-এ এক্সপোজড হয়েছিল)
