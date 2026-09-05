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

---

## v60–v64: চ্যাটে টুল-সংযোগ মেরামত (মালিকের স্ক্রিনশট-বাগ ফিক্স)

সমস্যা ছিল ৩ স্তরে: (১) SYSTEM prompt-এ পুরনো লাইন "Agent tools যুক্ত হয়নি (Phase 5+)" — মডেল সৎভাবে refuse করছিল; (২) chat mode/auto-তে tool-loop gate বন্ধ ছিল (শুধু web-toggle/research-এ চলত); (৩) weather planner rule ছিল না + বাংলা loc cleanup-এ "ের" (e-kar)-এর বদলে ভুল "এর"字符 ছিল → geocoding-এ "গাজীপুরের" যেত → ব্যর্থ; + open-meteo CF-edge থেকে মাঝে মাঝে 429 (এখন 3x retry)।
ফিক্স: prompt-এ ৮১-টুল সত্য + তাজা-ডেটা নিয়ম + বানোয়াট টুল-নাম নিষেধ; quickKit rules (weather/prayer/pc.status) সব mode-এ; BN→EN ৪০-শহর ম্যাপ fallback; retry wrapper; D1-এ secret-ঘেঁষা mem rows suppressed (নিরাপত্তা)।
টেস্ট: ৩/৩ চ্যাট-রান লাইভ আবহাওয়া (৩১.৪°C, ৭%, টাইমস্ট্যাম্পসহ)। dbg:lastloop (D1, 1h TTL) = ভবিষ্যৎ ডিবাগ ট্রেস।

---

## v65 — ইউনিফায়েড রাউটার (মালিকের দাবি: "এক বক্স, সব অটো")
- UI: + শিট থেকে **mode-row (চ্যাট/রিসার্চ/কোড/এজেন্ট/মিশন) সরানো** — এখন একটাই ইনপুট বক্স; অ্যাপ imode:'auto' পাঠায়।
- Worker: `imode` সবসময় 'auto' (body/stChat মোড ignore); **intent-ই রাউটার**: research→Tavily ওয়েব-পাইপলাইন+সোর্স (weather-quickhit থাকলে ডুপ নয়), coding→কোড-ফার্স্ট স্টাইল, instruction→এজেন্ট-স্টাইল পরিকল্পনা, question/conversation→খালি LLM; টুল-প্ল্যানার (quickKit+rules) সববার চলে।
- টেস্ট: সার্চ-প্রশ্ন→web.now+সোর্স✅ · কবিতা→টুল ছাড়া সৃজনশীল✅ · fizzbuzz→কোড-ফার্স্ট✅।

## v66 (2026-09-05) — Owner 5-দফা সংশোধন
- টপ গ্রে-ব্যান্ড: body::before সাদা safe-top overlay (fixed, z120)।
- এজেন্ট গেট বাদ: agOn ডিফল্ট true; মেনুর "এজেন্ট সক্রিয়" সুইচ-রো deleted; "AI Agent Control" মেনু-আইটেম hidden।
- থিঙ্কিং দৃশ্যমান: প্রতিটি রিপ্লাইয়ে stepLine স্ট্যাটাস লাইন (সাইক্লিং 💭/🔧/📖/✍️ + সার্ভার step ইভেন্ট SEARCHING/READING/ANALYZING) — টোকেন শুরুর সাথে সাথে সরে যায়।
- সাজেশন চিপ: UI কল + SYSTEM [SUGGEST] ব্লক বাদ।
- ফ্যাক্ট ক্রস-চেক: সংখ্যা/তালিকা প্রশ্নে plan = web.now + kit.wsearch; SYSTEM-এ সংঘাত-নিয়ম (নতুন সূত্র/উইকি অগ্রাধিকার)।
- টেস্ট: "বাংলাদেশে কতটি উপজেলা" → ৫০৩ ✅ (bn.wikipedia সোর্স; ৪৯৫-বনাম-৫০৩ ব্যাখ্যা সহ)। health p10-v66 ✅

## v73–v75 (2026-09-05) — PHASE 5: Free+OSS Agent
- v73: mission intent (`মিশন:` প্রিফিক্স) + MODE_SYS mission + mission-এ খবর-কীওয়ার্ডে লাইভ সার্চ; chatToolLoop-এ observe→reflect রিট্রাই-লুপ; GET /api/runner/<key> (owner)।
- v74: runner রুটে x-owner-code সাপোর্ট; mission web keywords (সংবাদ/আজকের/সর্বশেষ)।
- v75: POST /api/runner/start (owner-gated sandbox dispatch)।
- OSS bench: smolagents 1.26.0 install 5s/import 1s; CodeAgent+Tool মিনি-রান Final answer 7 (run_448bc461…)। docs/PHASE5-OSS-BENCH.md।
- Deploys: v73 178aef3/f4bbd08, v74 3d6e001/bb44aa1, v75 c06c285/4bd1031; health p10-v75।
