# 🎨 JUZU UI BLUEPRINT — v1 (owner review-এর জন্য)
> PHASE 0, ধাপ 0.1। এই ডকুমেন্ট approve হওয়ার আগে কোনো UI কোড বদলাবে না।
> Moodboard: owner-এর দেওয়া ৩-স্ক্রিন demo (glassmorphism, নরম gradient, ভাসমান কার্ড) — **কপি নয়**, জুজুর নিজের ভাষা: clean + smooth + premium।
> মূল দর্শন: **"অ্যাপ মানেই জুজু"** — কোনো আলাদা assistant নেই, মডেলের নাম কোথাও নেই, সব সিদ্ধান্ত জুজুর ভেতরে।

## ১) Layout কাঠামো (মোবাইল-first)
```
┌──────────────────────────────┐
│ header: ☰  (🟣জুজু-orb) জুজু   │  ← 44px, glass, নামের নিচে status line
│         "online · সেশন চালু"  ✚ ⋯ │
├──────────────────────────────┤
│ working strip (শুধু কাজ চললে)  │  ← 1 লাইন: 🔧 ধাপ… n/N + hairline progress + ˅
├──────────────────────────────┤
│ FEED (full-width, flat)       │
│   user row                    │  ← ডান-ঘেঁষা, নরম lavender tint, বর্ডার নেই
│   juzu row (orb + content)    │  ← বাঁ-ঘেঁষা avatar, content সরাসরি background-এ
│   task card (একমাত্র বক্স)     │  ← flat panel, default collapsed
│   …                           │
├──────────────────────────────┤
│ composer pill: (+) লেখো… (🎤)(↑)│  ← floating, safe-area, সবসময় সক্রিয়
└──────────────────────────────┘
```
- ডেস্কটপ: feed-এর reading column max 720px centered; কিন্তু message-এর নিজের কোনো side-border/space নেই।
- মোবাইল: ১০% width; ডান-বাম padding মাত্র 16px (content-এর শ্বাস, বর্ডার নয়)।

## ২) Message Feed — bubble বিদায়
| পুরনো (বাদ) | নতুন |
|---|---|
| চারপাশে বর্ডার-ওয়ালা bubble | **flat row** — কোনো border/box-shadow নেই |
| user bubble card | user: ডান-ঘেঁষা text block, `--lav` tint, radius 18px (border নেই), max-width 85% |
| AI card | juzu: 28px animated orb + নাম/সময় line + content সরাসরি page background-এ |
| ছবি/ফাইল chip border | flat chip, tint bg, radius 12 |
- Row spacing 18px; enter animation: opacity 0→1 + translateY(4px), 240ms।
- Long-press/quote/reply অক্ষত থাকবে (functionality নষ্ট নয়)।

## ৩) Typography Ramp (পাহাড়-হেডিং বিদায়)
| Token | Size/Weight | ব্যবহার |
|---|---|---|
| T1 | 20/700 | message-ভেতরে সর্বোচ্চ h1 (report title) |
| T2 | 17/700 | h2 |
| T3 | 15.5/650 | h3 |
| Body | 15/400, lh 1.65 | সাধারণ লেখা |
| Small | 12.5/500 | meta, step, pill |
| Mono | 12.5 | কোড |
- message-এর ভেতরে h1 কখনো 20px-এর বড় নয় (আগের bug: পাহাড়)।
- বাংলা font stack অক্ষত (Noto Sans Bengali)।

## ৪) জুজু Orb — dynamic avatar (৫ state)
SVG+CSS animated orb: নরম violet→green gradient blob + ২টা চোখ (blink every ~4s)।
| State | চেহারা |
|---|---|
| idle | ধীর breathing (scale 1↔1.03, 3s) |
| think | চোখ উপরে + halo pulse |
| work | চারপাশে ঘূর্ণায়মান hairline ring + চোখ focused |
| happy | ছোট bounce + ২টা spark |
| error | amber tint + একবার shake |
- header-এ 22px, message-এ 28px, hero-এ 84px।
- `prefers-reduced-motion` → static orb। কপি নয় — নিজস্ব geometry।

## ৫) Working Strip + Task Card (প্রগ্রেস লুকানো-ছোট)
- কাজ চললে header-এর নিচে **1 লাইনের strip**: `🔧 bu.status চালাচ্ছে… 6/10` + 2px progress hairline + chevron।
- **ডিফল্ট collapsed**; tap → task card-এর ভেতরে step list খোলে (accordion, 240ms)।
- Task card anatomy:
  1. header row: mini-orb + task text (1 line ellipsis) + status pill + সময়
  2. progress hairline
  3. working strip (live)
  4. steps accordion (কাজভেদে আলাদা ধাপ — backend event-driven)
  5. report: flat, typography ramp মেনে; code = flat codeBox + ⛶
  6. diff accordion (🔀, default বন্ধ)
  7. action row: ⏹ / ↻ রিজিউম / কপি রিপোর্ট
- শেষ হলে card auto-collapse; শুধু header + report সারাংশ দেখায়।

## ৬) Header / Composer / Sheets
- Header: ☰ · orb+“জুজু”+status subline · ✚  — **মডেল chip/label কোথাও নয়**।
- Composer: floating pill (radius 24), + sheet, auto-grow textarea, mic, send-orb (gradient); draft/quote bar অক্ষত।
- Sheets: bottom glass sheet, top radius 24, spring 240ms cubic-bezier(.22,.9,.28,1); section label 11px caps-dim; item row 48px+ touch target।
- Hero (খালি chat): বড় orb + greeting + ৩টা flat suggestion pill।

## ৭) Color & Theme
- Token অপরিবর্তিত (--bg/--card/--brand/--green…); নতুন শুধু `--juzu-grad: linear-gradient(135deg,#8B7CF8,#34D399)` (orb/ring/send)।
- Dark parity বাধ্য; contrast ≥ 4.5:1; tint গুলো theme-aware।

## ৮) Motion Spec
- easing: `cubic-bezier(.22,.9,.28,1)`; durations: micro 150 / normal 240 / sheet 320।
- কোনো layout jump নয় (height animation এড়িয়ে clip/opacity)।
- reduced-motion: সব animation off, orb static।

## ৯) Accessibility
- touch target ≥44px; focus-visible ring 2px brand; feed aria-live polite; strip-এ role=status।

## ১০) যা মুছে যাবে (owner নির্দেশ)
❌ border-ওয়ালা bubble ❌ মডেল নাম/selector ❌ sheet-এ আটকানো agent ❌ পাহাড় h1 ❌ `[SUGGEST]` leak ❌ "ক্ষমতা নেই (Phase 5+)" জাতীয় উত্তর (router পড়-টুল auto দেবে)।

## ১১) QA Checklist (build-এর পরে)
- 375×812, 768, 1280×800 — light+dark screenshot
- reduced-motion on
- task চলছে: strip collapsed default, tap-এ steps
- report-এ h1 ≤20px
- [SUGGEST] কোথাও নেই
- follow-up context: "ওটা আবার করো" → আগের task-এর সাথে link

## ১২) Build Mapping
| ধাপ | কী |
|---|---|
| 0.2 | backend: intent router + context pack + suggest-leak fix |
| 0.3 | frontend: flat feed + header/composer/sheets rebuild |
| 0.4 | orb animation + working strip + task card |
| 0.5 | QA screenshots + owner demo |
