# ADMISSION HUB AI — Private AI Command Center

> **🧭 নতুন agent/developer? প্রথমে পড়ো: [`docs/BLUEPRINT.md`](docs/BLUEPRINT.md)** — চূড়ান্ত লক্ষ্য, architecture-এর দর্শন, ১০-phase রোডম্যাপ, আর বর্তমান অবস্থা এক জায়গায়। Phase approval rule-ও সেখানে আছে।

> **ব্র্যান্ড:** Admission Hub AI · **স্ট্যাটাস:** Phase 1 + Research — সম্পূর্ণ real (কোনো ফেক নয়) · **খরচ: $0**

## 🔗 লাইভ লিংক

| কী | লিংক |
|---|---|
| 🌐 **PWA অ্যাপ (Public)** | **https://sheikhrashel47-stack.github.io/admission-hub-ai/** — ব্রাউজারে খুলো → **Add to Home Screen** (iOS: Safari → Share → Add to Home Screen) |
| 🤖 AI Backend (free) | `https://rashelzayan213.workers.dev/admission-hub-ai` — Cloudflare Workers (keys server-side) |
| 📦 GitHub repo | `https://github.com/sheikhrashel47-stack/admission-hub-ai` |

## যা আছে (সত্যি যা আছে)

- 💬 প্রিমিয়াম chat — streaming, markdown, tables, code highlight, citations
- 🧠 Model Router: AUTO (task-ভিত্তিক) + fallback (Groq → Gemini → Cerebras → Mistral)
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
📱 PWA (GitHub Pages)  ──►  ☁️ Cloudflare Workers backend  ──►  Groq/Gemini/Cerebras/Mistral + Tavily
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
