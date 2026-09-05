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

---

## Phase 4 — GPU / Sandbox / Computer (v58, সব লাইভ-ভেরিফায়েড ✅)

| স্তম্ভ | টুল | ইঞ্জিন | লাইভ প্রমাণ |
|---|---|---|---|
| **GPU** | kit.gpu {prompt, model: llama8/llama70/qwencoder, system, max_tokens} | CF Workers AI REST (X-Auth-Email/Key) | llama8 বাংলা 566ms; **llama70 244ms "SEVENTY-B-OK"** ✅ |
| **Sandbox** | kit.lab {files{}, setup, run, timeout} + kit.code | GH Actions ubuntu রানার (runSandbox) | ২ ফাইল লিখে python3 → {"sum":50} 11s ✅; pip/npm/curl আছে |
| **Computer** | bu.task/bu.status (আগেই ছিল) | browser-use.com cloud (key rotation, 11 keys) | "Example Domain" — আসল ব্রাউজার টাস্ক 15s-এ finished ✅ |
| **Computer** | kit.pdf {url, format} | Browserless /pdf → **নিজস্ব /api/pdf/<id>.pdf** (7d, %PDF verified) | example.com → 31KB PDF 1.8s ✅ |

নতুন রুট: `GET /api/pdf/<id>.pdf` (application/pdf, inline, 7d)।
মোট এক্সটার্নাল টুল: **৭২** (v58)।

---

## JUJU-PC — নিজের বাস্তব কম্পিউটার (v59) 🖥️

**আর্কিটেকচার:** GitHub Codespaces (ফ্রি 120 core-hours/মাস) → ভেতরে daemon (প্রাইভেট রেপো `juju-pc`) → worker-এর D1 job-queue-এর সাথে long-poll → JUJU চ্যাট থেকে pc.* টুল।

| টুল | কাজ |
|---|---|
| pc.pair {code} | codespace টার্মিনালের ৬-অক্ষর কোড → সেশন টোকেন (7d) |
| pc.status | daemon online/offline + pending jobs |
| pc.run {cmd, timeout≤1800, async} | যেকোনো কমান্ড — ~/work পারসিস্টেন্ট |
| pc.put / pc.get | ফাইল পাঠানো/আনা (get → /api/file/<id> ডাউনলোড 24h) |
| pc.gui {screenshot/click/type/key} | Xvfb+xdotool — JUJU স্ক্রিন দেখে মাউস-কীবোর্ড চালায় (screenshot → /api/img হোস্ট) |
| pc.desktop | Xfce+noVNC+Firefox ইনস্টল (setup-desktop.sh) → Ports 6080-এ লাইভ স্ক্রিন |
| kit.result {runKey} | অ্যাসিংক স্যান্ডবক্স ফল (kit.code/kit.lab async:true → ৬ ঘণ্টা পর্যন্ত জব) |

**নতুন পাবলিক এন্ডপয়েন্ট:** /api/pc/register, /api/pc/paircheck/<code>, /api/pc/ping, /api/pc/next, /api/pc/result (daemon টোকেন), GET /api/file/<id>।
**E2E ভেরিফায়েড (সিমুলেটেড ডেমন):** pairing ✅, run ✅, put/get বাংলা কনটেন্ট ✅, gui screenshot/click ✅, async lab→kit.result ✅।
**মালিকের ধাপ:** juju-pc রেপো → Code → Codespaces → Create → টার্মিনালের কোড JUJU-কে বলুন। ৩০ মিনিট idle-তে ঘুমায় (ডেটা থাকে), ক্লিক করে জাগানো যায়।
