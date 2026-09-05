# টুলস ৫০ — নতুন সংগ্রহ তালিকা + বিদ্যমানদের সচল/অচল হিসাব
_(সব তথ্য লাইভ-টেস্ট ভিত্তিক — v48, 2026-09-05)_

## অংশ ১: বিদ্যমান সবকিছুর অবস্থা

### মডেল প্রোভাইডার (৮ সচল / ৩ অচল)
| ✅ সচল | বিস্তারিত |
|---|---|
| Groq | GPT-OSS-120B + Qwen 3.8-27B + Whisper STT |
| CF Workers AI | GPT-OSS 120B, Llama 3.1 8B, **FLUX ছবি** (key ছাড়াই) |
| Z.ai | GLM 4.5 Flash (4.7/5.2 backup — overload/ব্যালেন্স) |
| Gemini | 3.1 Flash-Lite + ছবি/PDF পার্স |
| OpenRouter | MiniMax M3 1M, Nemotron-550B, GLM 5.2, Gemma 4, ×৬ ফ্রি |
| HuggingFace | Qwen2.5 72B |
| Ollama Cloud | GPT-OSS 120B/20B |
| Pollinations | আনলিমিটেড টেক্সট+ছবি (keyless) |

| ❌ অচল | কারণ |
|---|---|
| Cerebras | 402 — কোম্পানি ফ্রি টিয়ার বন্ধ করেছে |
| DeepSeek | key ঠিক, ব্যালেন্স $0 (টপ-আপ ~$1 লাগবে) |
| Mistral | key ঠিক, 429 রেট-লিমিট (সাময়িক, মাঝে মাঝে চলে) |
| ~~NVIDIA~~ | BD ফোন ভেরিফিকেশন নেই (মালিকের দেওয়া key 401) — Nemotron OR-এ ফ্রি আছে |
| ~~xAI/SambaNova/Together/DeepInfra/GitHub Models~~ | সব মৃত (কার্ড/ক্রেডিট/বন্ধ) |

### টুলস (সচল)
web.search (Tavily) ✅ · web.read ৪ লেয়ার (Jina/Firecrawl/ScrapingBee/direct) ✅ · web.eye (thum.io + Browserless) ✅ · web.now ✅ · bu.* (১১ key, #1 লাইভ) ✅ · agent.shell (GH Actions 4cpu/16GB) ✅ · gh.* (নতুন PAT) ✅ · cf.* ✅ · mem.* ✅ · verify.url ✅ · kit.* ২৫টা ✅ (weather/currency/wiki/dict/translate/qr/time/geo/news/rss/hn/stack/npm/pypi/arxiv/dns/youtube/math/grammar/ia/img/tts-free/stt/flux)

### টুলস (অচল/আংশিক)
| অচল | বিকল্প যা চলছে |
|---|---|
| kit.translate-এর MyMemory লেয়ার (CF IP রেট-লিমিট) | LLM ফলব্যাক ✅ কাজ করছে |
| StackExchange API সরাসরি (CF IP থ্রটল) | Tavily রুট ✅ |
| Pollinations audio (ঘন 429) | kit.tts-free URL দেয়, রিট্রাই চলে |
| BrightData key (কোডে ব্যবহৃতই নয়) | রিজার্ভ |
| GitHub PAT-1 (ghp_v6B...) | PAT-2 ✅ চলে, PAT-1 ব্যাকআপ স্লটে পড়ে আছে |
| OWNER_KEY_UNIDENTIFIED_1 (D1) | = ব্যর্থ NVIDIA চেষ্টা, মুছে ফেলা যাবে |

---

## অংশ ২: ৫০ নতুন টুল সংগ্রহ তালিকা

### গ্রুপ A — keyless, আমি একাই বসাতে পারব (৩২টা)
| # | টুল | কাজ |
|---|---|---|
| 1 | **Piston (emkc.org)** | যেকোনো ভাষায় কোড রান (Python/JS/C++/Java...) — keyless! |
| 2 | **Overpass API** | OSM-এ কাছের হাসপাতাল/স্কুল/ব্যাংক খোঁজা |
| 3 | **OSRM** | রুট/দূরত্ব/যাতায়াত-সময় (ডিরেকশন) |
| 4 | **Aladhan** | নামাজের সময়সূচি (যেকোনো শহর) — BD ইউজারদের জন্য দরকারি |
| 5 | **AlQuran Cloud** | কুরআন আয়াত/অনুবাদ/তাফসির API |
| 6 | **RDAP (rdap.org)** | ডোমেইন WHOIS তথ্য |
| 7 | **ip-api.com** | IP → লোকেশন/ISP |
| 8 | **date.nager.at** | দেশের সরকারি ছুটি (BD সহ) |
| 9 | **CoinGecko** | ক্রিপ্টো দাম (ফ্রি, key ছাড়া) |
| 10 | **Binance public** | লাইভ ক্রিপ্টো মার্কেট |
| 11 | **Yahoo Finance (query1)** | স্টক/সোনার দাম/শেয়ারবাজার |
| 12 | **Open Library** | বই সার্চ/লেখক/কভার |
| 13 | **Google Books** | বই প্রিভিউ/উদ্ধৃতি |
| 14 | **Wikidata SPARQL** | স্ট্রাকচারড জ্ঞান-কোয়েরি |
| 15 | **Wikipedia full search** | summary ছাড়াও পূর্ণ সার্চ |
| 16 | **DuckDuckGo Instant** | দ্রুত উত্তর/সংজ্ঞা |
| 17 | **MusicBrainz** | গান/শিল্পী মেটাডেটা |
| 18 | **OpenTriviaDB** | কুইজ/মজার প্রশ্ন |
| 19 | **REST Countries** | দেশ-তথ্য (জনসংখ্যা/মুদ্রা/ভাষা) |
| 20 | **DEV.to API** | প্রোগ্রামিং আর্টিকেল |
| 21 | **Reddit .json** | সাবরেডিট পোস্ট পড়া |
| 22 | **Can I Use (JSON)** | ব্রাউজার-সাপোর্ট ডেটা |
| 23 | **0x0.st / tmpfiles** | অস্থায়ী ফাইল হোস্টিং |
| 24 | **dpaste API** | কোড পেস্ট শেয়ার |
| 25 | **random-data-api** | ডেমো/টেস্ট ডেটা জেনারেটর |
| 26 | **HTTPBin/echo** | নেটওয়ার্ক ডিবাগ |
| 27 | **QR reader** (zxing/দৃশ্য) | QR স্ক্যান (ছবি থেকে) |
| 28 | **Unicode tools** | বাংলা↔ইউনিকোড/ফন্ট কনভার্ট |
| 29 | **Lorem Ipsum BN** | বাংলা ডামি টেক্সট |
| 30 | **Color tools** (thecolorapi) | রঙের নাম/hex/প্যালেট |
| 31 | **Agify/Genderize** | নাম→বয়স/লিঙ্গ অনুমান (মজা) |
| 32 | **Universities list API** | বিশ্ববিদ্যালয় ডোমেইন/তালিকা (BD সহ) |

### গ্রুপ B — আমাদের existing key দিয়েই হবে (৫টা)
| # | টুল | কাজ |
|---|---|---|
| 33 | **Gemini Embeddings** | টেক্সট→ভেক্টর (মেমোরি সার্চ আপগ্রেড) — GEMINI key আছে |
| 34 | **Gemini ছবি জেনারেশন** (nano-banana) — ফ্রি টিয়ারে চললে | GEMINI key আছে |
| 35 | **Groq PlayAI TTS** — গ্রোস সাউন্ড ভয়েস | GROQ key আছে |
| 36 | **HF Inference ছবি/অন্য মডেল** | HUGGINGFACE key আছে |
| 37 | **CF Workers AI embeddings** (@cf/baai/m3e-base) | CF creds আছে |

### গ্রুপ C — মালিকের ফ্রি সাইনআপ দরকার (১৩টা)
| # | টুল | ফ্রি লিমিট | সাইনআপ |
|---|---|---|---|
| 38 | **Serper.dev** ⭐ | ২৫০০ Google সার্চ | serper.dev (Gmail) |
| 39 | **ElevenLabs** ⭐ | ১০ক ক্যারেক্টার/মাস TTS | elevenlabs.io |
| 40 | **Brave Search API** | ২০০০/মাস | brave.com/search/api (কার্ড লাগে না) |
| 41 | **Wolfram Alpha** | ২০০০ কল/মাস | products.wolframalpha.com |
| 42 | **Cohere Trial** | ১০০০ কল/মাস (Embed/Rerank) | dashboard.cohere.com |
| 43 | **GNews** | ১০০ রিকোয়েস্ট/দিন (BD সংবাদ) | gnews.io |
| 44 | **NewsAPI.org** | ১০০/দিন ডেভ টিয়ার | newsapi.org |
| 45 | **Alpha Vantage** | ২৫/দিন স্টক+ফরেক্স | alphavantage.co |
| 46 | **OpenRouteService** | ২০০০/দিন ডিরেকশন+ম্যাপ | openrouteservice.org |
| 47 | **SiliconFlow** | ফ্রি ক্রেডিট (Qwen/ছবি) | siliconflow.cn |
| 48 | **Discord webhook** | ফ্রি নোটিফিকেশন | discord.com (সার্ভার থাকলে) |
| 49 | **TMDB** | ফ্রি সিনেমা/সিরিজ DB | themoviedb.org |
| 50 | **OMDb (IMDb)** | ১০০০/দিন মুভি তথ্য | omdbapi.com |

## বাস্তবায়ন ক্রম (প্রস্তাব)
1. **B2.5 (এখনই, আমার কাজ):** গ্রুপ A-র সেরা ১০টা (Piston কোড-রানার, Overpass, OSRM, Aladhan, AlQuran, RDAP, CoinGecko, Yahoo Finance, Open Library, ip-api) — v49-এ
2. **গ্রুপ B (৫টা):** existing key টেস্ট করে যেগুলো চলে সেগুলো — v50-এ
3. **বাকি গ্রুপ A (২২টা):** ধাপে ধাপে v51-v53
4. **গ্রুপ C:** মালিক key দিলেই সাথে সাথে (প্রতিটা ৫ মিনিটের কাজ)
