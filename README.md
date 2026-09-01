# ADMISSION HUB AI — Private AI Command Center

> **ব্র্যান্ড:** ADMISSION HUB AI · Internal: ADMISSION HUB COMMAND AI
> **স্ট্যাটাস:** Phase 1 (Premium Chat Foundation) + Research — **সব ফিচার ১০০% real** (কোনো ফেক নয়)
> **রান:** Zero dependency Node 18+ (npm install লাগবে না) · খরচ: **$0** (সব free tier)

---

## যা এখন বানানো আছে (সত্যি যা আছে)

| ফিচার | স্ট্যাটাস |
|---|---|
| 💬 Premium chat (streaming, markdown, code highlight, tables, citations) | ✅ **real** |
| 🧠 Model Router (AUTO task-ভিত্তিক মডেল বাছাই + fallback chain) | ✅ **real** |
| 🎛️ Model selector (Auto / Groq / Gemini / Cerebras / Mistral — config থেকে) | ✅ **real** |
| ⚡ / ⚖️ / 🌊 Response modes (Fast / Balanced / Deep) | ✅ **real** |
| 🔎 Web Research mode (Tavily — live সোর্স + clickable citations + step panel) | ✅ **real** |
| 📁 ফাইল (upload, preview, AI বিশ্লেষণ, ফাইল-প্রশ্ন) — txt/md/csv/json/html/css/js/ts… | ✅ **real** |
| 🧠 User Memory (notes + toggle, সব চ্যাটে injected) | ✅ **real** |
| 💾 চ্যাট ইতিহাস (server-side JSON) + search + pin + delete + branch + export .md | ✅ **real** |
| 🔄 Regenerate · ✏️ Edit prompt · ⏹ Stop · 📋 Copy · 🔊 TTS · 🎙️ STT (browser) | ✅ **real** |
| 🌙/☀️ Dark/Light · 📱 mobile drawer + bottom sheet · বাংলা UI | ✅ **real** |
| 📊 Usage ledger (requests, tokens, cost — প্রতিটি রিকোয়েস্টের meta-সহ) | ✅ **real** |
| 🔐 Keys শুধু server-side (`.env.local`, git-এ কখনো না) — model কোনো দিন key দেখে না | ✅ |

## চালানো
```bash
# 1. keys বসাও  →  .env.local (নিচের .env.example দেখো)
# 2. চালাও
node server.mjs          # → http://localhost:3000
```

## ফাইল স্ট্রাকচার
```
server.mjs            → HTTP server + API + SSE chat + research + files + memory
lib/providers.mjs     → Model Router (config-driven, fallback chain, Tavily)
web/index.html        → Premium UI (mobile-first, বাংলা)
data/                 → chats.json · memory.json · usage.json · files/  (auto-তৈরি)
.env.local            → 🔴 keys (gitignored — কখনো commit কোরো না)
```

## সততার ঘোষণা (কী এখনো নেই — ফেক করা হয়নি)
- PDF / DOCX / XLSX parsing → **Phase 3** (এখন সৎভাবে "সাপোর্ট হয় না" বলে)
- Agent tools (code edit, git, deploy) → **Phase 5–6** (UI-তে "Phase 5+" লেখা আছে)
- Image generation → key-নির্ভর, পরে
- Multi-user auth → private single-owner এখন; Supabase auth Phase 2
- [নিয়ম]: model শুধু tool result + minimal context পায় — master secrets কখনো নয়

---

## License
Private — শুধু owner-এর জন্য (তুমি)।
