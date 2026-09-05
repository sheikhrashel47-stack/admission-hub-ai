# PHASE 1 — মালিকের জন্য Key গাইড (আপডেটেড: সব লাইভ-টেস্ট করা)

> নিয়ম: key এনে লিখুন — `নাম: <key>`। আমি D1-এ বসিয়ে দেব। সব প্রোভাইডার কোডে আগে থেকেই wired।

## ✅ ইতিমধ্যে ফ্রিতে যোগ হয়ে গেছে (আপনার কিছু করতে হবে না)
- **CF Workers AI** (নতুন key ছাড়াই): GPT-OSS 120B + Llama 3.1 8B — লাইভ ✅
- **OpenRouter ফ্রি মডেল ×৬**: MiniMax M3 (1M ctx, UI-তে দেখা যাচ্ছে), **Nemotron-3 Ultra 550B**, **GLM 5.2**, Gemma 4 31B, Nemotron-3.5 Lightning, North Mini Code
- আগে থেকে: Groq ×২, Gemini, HuggingFace, Ollama ×২, Pollinations, Mistral

## 📋 এখন আপনার কাছে যা দরকার (মাত্র ২টা + ২টা ঐচ্ছিক)

### ~~১) NVIDIA~~ — বাদ ✅ (ফোন ভেরিফিকেশনে বাংলাদেশি নম্বরের অপশন নেই)
- চিন্তা নেই: NVIDIA-র সেরা মডেল (Nemotron-3 Ultra 550B) OpenRouter ফ্রি রুটে আগেই যোগ হয়ে গেছে ✅

### ~~২) Z.ai~~ — হয়ে গেছে ✅ (key বসানো, GLM 4.5 Flash UI-তে লাইভ)
- GLM 4.5 Flash: ফ্রি, চলছে ✅ (free tier-এ মাঝে মাঝে overload/ধীর — fallback chain সামলে নেয়)
- GLM 4.7 Flash: hidden backup (Z.ai সাইডে overload কাটলে অটো ব্যবহারযোগ্য)
- GLM 5.2: এই অ্যাকাউন্টে ব্যালেন্স নেই — কিন্তু OpenRouter-এ ফ্রি চলছে ✅

### ৩) DeepSeek — শুধু টপ-আপ (ঐচ্ছা)
- আপনার key বসানো ✅ কিন্তু ব্যালেন্স $0। platform.deepseek.com → **Top Up** → মিনিমাম (~$1-৫) দিলেই অটো চলবে। "৫ মিলিয়ন ফ্রি টোকেন" দাবিটা ২০২৬-এ সত্যি না — আপনার নিজের অ্যাকাউন্টেই প্রমাণ মিলেছে।

### ৪) Cohere — ঐচ্ছা (পরে RAG/embeddings-এ লাগবে)
1. **https://dashboard.cohere.com** → Google/Gmail signup
2. **API Keys** → Trial key কপি
3. পাঠান: `COHERE_API_KEY: ...`
- ফ্রি: ~১,০০০ কল/মাস (non-commercial) — Embed 4 মডেলটা আমাদের ভবিষ্যৎ মেমোরি-সার্চে কাজে লাগবে

## ❌ এগুলোর পেছনে সময় নষ্ট করবেন না (সব লাইভ-টেস্ট/ভেরিফাই করা, ২০২৬)
| দাবি ছিল | বাস্তব |
|---|---|
| GitHub Models ফ্রি | বন্ধ হচ্ছে — "retirement brownout" (HTTP 410) |
| Cerebras 1M টোকেন/দিন ফ্রি | 402 Payment Required — ফ্রি টিয়ার মৃত ($5 ট্রায়ালেও কার্ড লাগে) |
| Together $25/$100 ক্রেডিট | জুলাই ২০২৫-এ বন্ধ — মিনিমাম $5 কিনতে হয় |
| SambaNova ফ্রি ক্রেডিট | কার্ড ছাড়া দেয় না (PAYMENT_METHOD_REQUIRED) |
| DeepInfra ফ্রি | কার্ড/প্রি-পে বাধ্যতামূলক |
| xAI $25 ফ্রি | আপনি নিজেই বলেছেন — ফ্রি নেই; ক্রেডিট ছাড়া চলে না |
| Kimi/Moonshot ডাইরেক্ট | মিনিমাম $1 টপ-আপ (তবে Kimi-K3 ফ্রিতে NVIDIA NIM-এ আছে) |
| MiniMax ডাইরেক্ট | টেক্সট API-তে ফ্রি নেই (তবে MiniMax-M3 ফ্রি OpenRouter-এ পেয়েছি ✅) |
| Perplexity API | ফ্রি নেই |
| Inkling (Thinking Machines) | OpenRouter-এ শুধু "agentic harness"-এর জন্য — আমাদের চলবে না |
| Qwen/DashScope | 1M টোকেন ট্রায়াল ৩০-৯০ দিনে শেষ হয় + সাইনআপ ঝামেলা — Qwen তো Groq/CF/HF-এ ফ্রি চলছেই ✅ |

## Key দিলে আমার কাজ (অটো)
D1-তে `cfg:<নাম>` লেখা → wv-bump রিফ্রেশ ডিপ্লয় → বেঞ্চ টেস্ট → রিপোর্ট। কোথাও key পাবলিক হয় না (repo PUBLIC, তাই key কখনো কোডে/ডক্সে লেখা হয় না)।
