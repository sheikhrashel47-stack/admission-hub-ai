# SERVICES INVENTORY — JUJU-র বর্তমান সম্পদ ও সংগ্রহ-তালিকা
_(সবকিছু লাইভ-টেস্ট করা — v41, 2026-09)_

## A) লাইভ মডেল প্রোভাইডার (৮/১১ চালু)
| প্রোভাইডার | মডেল | অবস্থা |
|---|---|---|
| Groq | GPT-OSS-120B, Qwen 3.8-27B | ✅ |
| CF Workers AI | GPT-OSS 120B, Llama 3.1 8B | ✅ (key ছাড়াই) |
| Z.ai | GLM 4.5 Flash (UI), 4.7/5.2 (backup) | ✅ |
| Gemini | 3.1 Flash-Lite + ছবি/PDF পার্স | ✅ |
| OpenRouter | MiniMax M3 1M (UI), Nemotron-3 Ultra 550B, GLM 5.2, Gemma 4 31B, Nemotron Lightning, North Mini Code | ✅ (৫০ req/day ফ্রি) |
| HuggingFace | Qwen2.5 72B | ✅ |
| Ollama Cloud | GPT-OSS 120B/20B | ✅ |
| Pollinations | অসীম ফ্রি (keyless) | ✅ |
| Mistral | Small 3.1 | ⚠️ 429 রেট-লিমিট (key ঠিক) |
| Cerebras | — | ❌ 402 (ফ্রি টিয়ার মৃত) |
| DeepSeek | Chat V3 | ⏸ key বসানো, টপ-আপ (~$1) ছাড়া চলবে না |

## B) লাইভ টুলস/সার্ভিস (টেস্ট করা)
- **web.search** = Tavily ✅ · **web.read** = Jina Reader ✅ · **web.eye** = thum.io স্ক্রিনশট + vision ✅
- **bu.task/bu.status/bu.health** = Browser-Use ক্লাউড, ১১টা key, #1 লাইভ ✅
- **agent.shell/agent.envcheck** = GitHub Actions sandbox (node 22, python 3.12, 4cpu/16GB) ✅
- **gh.\*** = নতুন PAT (repo+workflow) ✅ · **cf.\*** = CF API (pages/kv/workers) ✅
- **mem.\*** (D1 মেমোরি) ✅ · **brain.\*** (মাল্টি-মডেল reasoning) ✅ · **twin.\*** (কোড-ম্যাপ) ✅ · **ops.mission** (১৫-ধাপ অটো-ফিক্স) ✅ · **qa.\*** ✅
- ডিপ্লয় পাইপলাইন: main + gh-pages worktree push (~৭৫ সেকেন্ডে লাইভ) ✅

## C) D1-এ সংরক্ষিত key (ব্যবহারের অপেক্ষায়/সক্রিয়)
BRIGHTDATA (রিজার্ভ, কোডে ব্যবহৃত নয়) · IA (Internet Archive) · TELEGRAM bot+channel · GOOGLE_DRIVE (OAuth 3-piece) · WEBCONTAINERS · SUPABASE_PAT · NPM_TOKEN · GITHUB_PAT_2 (backup)

## D) ফেজ-অনুযায়ী যা সংগ্রহ করতে হবে (মালিকের কাজ)
| ফেজ | দরকার | কীভাবে |
|---|---|---|
| P2 (রিয়েল-টাইম সার্চ) | **Serper.dev** (Google SERP, ২৫০০ ফ্রি কেরি) — AI-overview স্টাইলের জন্য সেরা | serper.dev → Gmail signup → API Key |
| P3 (৫০ টুলস) | **ElevenLabs** TTS (১০ হাজার ক্যারেক্টার/মাস ফ্রি) | elevenlabs.io → signup → API Keys |
| P3/P76 (RAG) | Cohere trial (ঐচ্ছা — Gemini embeddings দিয়েও চলবে) | dashboard.cohere.com |
| P1 বাকি | DeepSeek টপ-আপ ~$1 (ঐচ্ছা) | platform.deepseek.com |
| P4 (GPU) | কিছুই লাগবে না এখন — API টিয়ার যথেষ্ট; ভারী ট্রেনিং এলে Kaggle/Colab (মালিকের Google অ্যাকাউন্ট) | — |
| P6 (কানেক্টর) | Telegram ✅ Drive ✅ আগেই আছে; Gmail = একই Google OAuth-এ scope বাড়িয়ে হবে (কোড কাজ); WhatsApp/Facebook/Instagram = Meta Business অ্যাপ রিভিউ লাগে (কঠিন, পরে) | — |
| P5/P7/P8/P9/P10 | কোনো key লাগবে না — শুধু কোড কাজ (ওপেন-সোর্স ফ্রেমওয়ার্ক sandbox-এ pip install হবে) | — |

## E) মৃত/বাদ (আর সময় দেবেন না)
NVIDIA (BD ফোন ভেরিফিকেশন নেই — কিন্তু Nemotron 550B OR-এ ফ্রি আছে) · GitHub Models (বন্ধ হচ্ছে) · Cerebras · Together · SambaNova · DeepInfra · xAI · Kimi/MiniMax ডাইরেক্ট · Perplexity
