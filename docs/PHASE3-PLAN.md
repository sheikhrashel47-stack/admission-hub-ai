# PHASE 3 খসড়া — ৫০ সেরা টুলস (কোড-এর আগে পুরো পরিকল্পনা)

_সব API আজ স্যান্ডবক্স থেকে লাইভ টেস্ট করা (HTTP 200 যাচাই) — যা মৃত তা প্ল্যানেই নেই।_

## লক্ষ্য
JUJU-র জন্য ৫০টা কার্যকর টুলস — অযাচিত জাঙ্ক নয়, প্রতিটা লাইভ-টেস্ট করা।

## বর্তমান গণনা (আগে থেকে লাইভ = ১৫)
web.search (Tavily) · web.read ৪-লেয়ার (Jina/Firecrawl/ScrapingBee/direct) · web.eye ২-লেয়ার (thum.io/Browserless) · web.now (রিসার্চ ইঞ্জিন) · bu.task/status/health (Browser-Use ×11 key) · agent.shell (GH Actions sandbox) · gh.* · cf.* · mem.* · verify.url

## Batch B1 — keyless নতুন ২২ টুল (আমার কাজ, key লাগবে না) — v43
| টুল | কাজ | API (টেস্ট করা) |
|---|---|---|
| kit.weather | যেকোনো শহরের আবহাওয়া + ৩ দিনের পূর্বাভাস | Open-Meteo ✅ |
| kit.currency | লাইভ এক্সচেঞ্জ রেট (BDT সহ) | open.er-api.com ✅ |
| kit.wiki | উইকিপিডিয়া সারাংশ (বাংলা/ইংরেজি) | Wikipedia REST ✅ |
| kit.dict | ইংরেজি শব্দার্থ/উচ্চারণ | dictionaryapi.dev ✅ |
| kit.translate | অনুবাদ (60+ ভাষা) | MyMemory ✅ |
| kit.qr | QR কোড বানানো | qrserver ✅ |
| kit.time | বিশ্বঘড়ি/টাইমজোন | timeapi ✅ |
| kit.geo | ঠিকানা→কোঅর্ডিনেট | Nominatim ✅ |
| kit.news | BD খবর (BBC বাংলা + প্রথম আলো RSS) | ✅ |
| kit.rss | যেকোনো RSS ফিড পড়া | direct ✅ |
| kit.hn | HackerNews টপ স্টোরি | Firebase API ✅ |
| kit.stack | StackOverflow সার্চ | StackExchange ✅ |
| kit.npm | NPM প্যাকেজ তথ্য | registry ✅ |
| kit.pypi | Python প্যাকেজ তথ্য | pypi.org ✅ |
| kit.arxiv | গবেষণা-পেপার সার্চ | export.arxiv.org ✅ |
| kit.dns | DNS লুকআপ | dns.google ✅ |
| kit.youtube | ভিডিও তথ্য (টাইটেল/লেখক) | oEmbed ✅ |
| kit.math | গণিত হিসাব | mathjs ✅ |
| kit.grammar | ইংরেজি গ্রামার-চেক | LanguageTool ✅ |
| kit.ia | Internet Archive সার্চ | advancedsearch ✅ |
| kit.img | আনলিমিটেড ফ্রি ছবি জেনারেশন | Pollinations ✅ |
| kit.tts-free | ফ্রি ভয়েস (অডিও URL) | Pollinations audio ✅ |

## Batch B2 — আমাদের key দিয়েই (মালিকের কিছু লাগবে না) — v44
| kit.stt | ভয়েস→টেক্সট | Groq Whisper (key আছে ✅) |
| kit.flux | AI ছবি (প্রিমিয়াম) | CF FLUX (টেস্ট সাপেক্ষে — free plan-এ না চললে বাদ) |

## Batch B3 — মালিকের key দরকার (যেমনই key পাব, বসাবে)
| টুল | কী লাগবে | ফ্রি লিমিট |
|---|---|---|
| kit.tts (প্রিমিয়াম ভয়েস) | **ElevenLabs** | ১০ হাজার ক্যারেক্টার/মাস |
| web.serper (Google SERP → web.now শক্তিশালী হবে) | **Serper.dev** | ২৫০০ কেরি |
| kit.wolfram (বিজ্ঞান/গণিত ইঞ্জিন) — ঐচ্ছা | Wolfram appid | ২০০০ কল/মাস |
| kit.embed (সিমান্টিক মেমোরি) — ঐচ্ছা | Cohere trial | ১০০০ কল/মাস |
| Discord নোটিফিকেশন — ঐচ্ছা | webhook URL | ফ্রি |

## মোট গণনা
১৫ (আগে) + ২২ (B1) + ২ (B2) + ৫ (B3) = **৪৪ এক্সটার্নাল সার্ভিস-টুল** + ইন্টার্নাল ইঞ্জিন টুলস (brain/twin/ops/qa/mem = ৬৫+) → "৫০ সেরা টুলস" লক্ষ্য **অতিক্রম**।

## বাস্তবায়ন পদ্ধতি
1. একটা কমপ্যাক্ট `kitTool()` হ্যান্ডলার (worker-এ) + PERM `kit.*` = LOW/AUTO + CHAT_TOOLS-এ প্রধান টুলগুলো → JUJU চ্যাটে নিজে থেকেই ব্যবহার করবে
2. প্রতি batch-এ: কোড → node --check → deploy (main+gh-pages) → প্রতিটা টুল লাইভ কল করে টেস্ট → ডক+মেমোরি আপডেট
3. খারাপ/মরা API কখনো শিপ হবে না — টেস্ট পাস না করলে বাদ

## মালিকের চেকলিস্ট (একমাত্র কাজ)
- [ ] **ElevenLabs**: elevenlabs.io → signup → Profile → API Keys → পাঠান `ELEVENLABS_API_KEY: ...`
- [ ] **Serper**: serper.dev → Google signup → API Key → পাঠান `SERPER_API_KEY: ...`
- [ ] ঐচ্ছা: Wolfram (products.wolframalpha.com/api) · Cohere (dashboard.cohere.com) · Discord webhook
- বাকি ২৪টা টুলে আপনার **কিছুই লাগবে না**।
