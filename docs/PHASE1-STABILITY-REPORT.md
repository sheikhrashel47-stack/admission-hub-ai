# PHASE 1 STABILITY REPORT — Admission Hub AI Chat Engine

> তারিখ: ২০২৬-০৯-০২ · Scope: Phase 1-এর চ্যাট ইঞ্জিন প্রোডাকশন-লেভেল স্ট্যাবিলাইজেশন
> Testing: লোকাল (`localhost:3000`, server.mjs) — API টেস্ট T1–T19 + হেডলেস Chromium E2E (মোবাইল ভিউপোর্ট 390×844, টাচ) + markdown ইউনিট ব্যাটারি।
> **Deploy status: কোড সম্পূর্ণ প্রস্তুত (PWA v6) — GitHub PAT + Cloudflare টোকেন ছাড়া push/redeploy হয়নি। পাবলিক ভার্সন এখনো v5।**

---

## ✅ চেকলিস্ট — প্রতিটি আইটেমের অবস্থা

### নতুন চ্যাট (NEW CHAT)
- [x] নতুন চ্যাট **কখনো blank হয় না** — `resetMsgs()` দিয়ে hero-সহ স্থায়ী UI রক্ষা
- [x] `#hero` ধ্বংস-বাগ ফিক্স (**root cause**: `openChat`/`newChat`-এ `msgs.innerHTML=''` চ্যাটের ভেতরে থাকা `#hero` এলিমেন্টটাই মুছে দিত — v5-এও ছিল, blank-screen-এর আসল উৎস ছিল এটি)
- [x] openChat ব্যর্থ হলে error card: "আবার চেষ্টা + নতুন চ্যাট" — blank screen নয়

### পূর্বের চ্যাট রিজিউম (RESUME)
- [x] ঠিক জায়গা থেকে খোলে (মেসেজ windowed লোড — শেষ ৬০টি + "আরো পুরোনো বার্তা" বাটন)
- [x] পুরোনো চ্যাট খুললে কোনো JS error নেই (E2E: ২ চ্যাট খোলা, ০ pageerror)
- [x] অসম্পূর্ণ (partial) উত্তর দেখায় + "আবার চেষ্টা করো" chip
- [x] উত্তরই না-আসা প্রশ্নে resume card: "এই প্রশ্নের উত্তর পাওয়া যায়নি → আবার চেষ্টা করো" (আসল regenerate চালায়)

### ১,০০০+ কনভারসেশন আর্কিটেকচার
- [x] **Server-side pagination**: `GET /api/chats?limit=50&offset=N` (৩০০-এর hard cap সরানো হয়েছে)
- [x] history sheet: "আরও ৫০টি দেখো ↓" — DOM একসাথে বড় হয় না
- [x] টেস্ট: ১,০৫৫ চ্যাট সিড → page 0/offset 1000/offset 1050 সব সঠিক (50/50/5)
- [x]**On-demand message loading**: `GET /api/chats/:id/messages?offset&limit` (৬০/ব্যাচ) — chat meta-তে আর সম্পূর্ণ মেসেজ আসে না (`total`-সহ)
- [x] drawer-এ প্রথম ৪০টি — ইনডেক্সড

### লং কনভারসেশন (LONG CONVERSATION)
- [x] ১২০-মেসেজ চ্যাট: প্রথমে ৬০ লোড → পুরোনো লোডার → ১২০ (E2E A1–A4 PASS)
- [x] প্রতিটি মেসেজে `data-i` (গ্লোবাল ইনডেক্স) — সার্চ জাম্প/রিজেনারেট টার্গেটিং নির্ভুল
- [x] পুরোনো লোড হলে scroll-জাম্প হয় না (stickScroll)

### অটো-সেভ (AUTO SAVE)
- [x] পার-চ্যাট ড্রাফট autosave (`ahai-draft:<id>`, 400ms debounce) + **boot-এ restore** + নতুন চ্যাট/ওপেনে restore
- [x] মেসেজ পাঠানোর মুহূর্তেই user message server-এ সংরক্ষিত
- [x] স্ট্রিম শেষে/এডিট/রিজেনারেট/টাইটেল/মডেল/অ্যাটাচমেন্ট — সব `save()` পাথে
- [x] **Partial stream recovery**: স্ট্রিমের মাঝে সংযোগ কাটলে যতটুকু এসেছে `partial:true`-সহ সংরক্ষিত (abort টেস্ট: 750 চ্যারেক্টার উদ্ধার)
- [x] রিজেনারেশন ব্যর্থ হলে **পুরোনো উত্তর restore হয়** (ডেটা ক্ষতি শূন্য — নির্ধারিত failure টেস্টে যাচাই)
- [x] প্রোভাইডার সম্পূর্ণ ব্যর্থ হলেও user বার্তা + placeholder সংরক্ষিত (আগে হারাত)

### ক্র্যাশ/হ্যাং প্রোটেকশন
- [x] `$('#id').style`-এ null-guard (hideHero/showHero/openSheet)
- [x] `openSheetCloseAll()` আর্গুমেন্ট-হীন কল → `null.classList` ক্র্যাশ ফিক্স
- [x] `ns()` মিসিং → সেন্ডে ReferenceError — ধরা ও ফিক্স
- [x] streaming-লক: ডাবল-সেন্ড/ডাবল-ফেচ অসম্ভব; abort-এ AbortController
- [x] স্ট্রিম স্টেট `sTarget` দিয়ে রেস-সেফ — অন্য চ্যাট খোলা থাকলে result ভুল চ্যাটে যায় না
- [x] কোনো uncontrolled timer নেই (debounce-গুলো সব clearTimeout-সহ)

### স্ট্রিমিং (STREAMING)
- [x] টোকেন-বাই-টোকেন SSE, layout জাম্প নেই (প্রতি টোকেনে শুধু `body.innerHTML=md(acc)`)
- [x] `stickScroll`: user নিচে থাকলে follow, উপরে স্ক্রল করলে **জোর করে scroll হয় না**; নিজের নতুন মেসেজে force-follow
- [x] API ব্যর্থ → বাংলা error card + Retry (খালি স্ক্রিন/আধা-উত্তর হয় না)
- [x] থামানো (stop) হলে আংশিক উত্তর দেখায় "⏸ থামানো হয়েছে"
- [x] done-এর পর meta/srcs সংরক্ষিত; রিফ্রেশে মেসেজ থেকেই বিল্ড হয়

### মার্কডাউন (MARKDOWN)
- [x] অনুচ্ছেদ, **bold**, *italic* (+`_italic_`), H1–H6, ordered/unordered list, `- [x]` checklist (✅/⬜), inline code, `<hr>`, blockquote
- [x] টেবিল: এক টেবিলে সব rows গ্রুপ (আগে প্রতি row আলাদা `<table>` — ফিক্স)
- [x] লিস্ট: এক `<ul>`-এ ধারাবাহিক আইটেম (আগে প্রতিটি আলাদা — ফিক্স)
- [x] বাংলা+ইংরেজি মিশ্রণ, cite `[1]` স্প্যান, লিংক rel=noopener
- [x] ফর্মুলা/ডায়াগ্রাম/গ্রাফ: বর্তমানে plain-text fallback — raw `$…$`/mermaid ব্রোকেন সিনট্যাক্স দেখায় না (না-ফেক: রেন্ডারার নেই বলে সত্যি বলা হয়েছে; Phase 2-এ KaTeX/Mermaid gate)

### কোড ব্লক (CODE)
- [x] `.codeBox`: ভাষা লেবেল + **কপি বাটন** + `<pre>`-এ horizontal scroll + whitespace/indentation হুবহু
- [x] কোনো ব্রোকেন wrap নেই (`white-space:pre` + overflow-x)
- [x] ডিলিগেটেড কপি (`copyText`) — প্রতিটি লাইনে বাটন নয়

### টেবিল (TABLE)
- [x] রেসপন্সিভ রেন্ডারার (overflow-x:auto, বর্ডার-সেল, ছোট স্ক্রিনে scroll)

### টেক্সট সিলেকশন (TEXT SELECTION)
- [x] নেটিভ সিলেকশন অবাধ — কোনো overlay `pointer-events` ব্লক করে না (E2E যাচাই)
- [x] লং-প্রেসে সিলেকশন থাকলে মেনু আসে না; ট্যাপ avatar/meta-তে মেনু

### কপি সিস্টেম (COPY)
- [x] কোড ব্লক কপি / পুরো উত্তর কপি (মেনু) / ইউজার মেসেজ কপি — ক্লিন, প্রতি-লাইন বাটন নয়

### মেসেজ অ্যাকশন (COMPACT)
- [x] লং-প্রেস মেনু: কপি/Regenerate/রিভাইস/শেয়ার + কোড/সোর্স সেকশন — ১০–১৫ আইকন নয়

### মোবাইল কীবোর্ড (KEYBOARD)
- [x] Composer `position:fixed` + `html,body{height:100%;overflow:hidden}` + `#app{height:100vh;100dvh}` + chat bottom padding `calc(96px+safe-b)` — কীবোর্ড খুললে composer উপরে থাকে (E2E computed-style যাচাই)
- [x] safe-area + dynamic viewport — ব্ল্যাংক এরিয়া/পেজ-জাম্প নেই

### স্ক্রলিং (SMOOTH SCROLL)
- [x] `scroll-behavior:smooth` + stickScroll + requestAnimationFrame(scrollB) — জাম্প-ফ্রি

### সার্চ (SEARCH)
- [x] **History সার্চ**: title + content + date (YYYY-MM-DD), project filter — `GET /api/chats?q&date&limit&offset` (ইউনিক টোকেন/বাংলা কনটেন্ট/তারিখ — T4–T7 PASS), 300ms debounce
- [x] **In-chat সার্চ**: সার্ভার-ব্যাকড `GET /api/chats/:id/search?q` — সব মেসেজে (windowed লোডেও), 250ms debounce, ফলাফল search input-এর নিচে fixed dropdown (আগে লং চ্যাটে ৫০০০px দূরে হারাত — ফিক্স)

### কনটেক্সট ম্যানেজমেন্ট (CONTEXT MGMT)
- [x] সার্ভার সর্বশেষ ~২৪ মেসেজ + সিস্টেম/মেমরি পাঠায় (worker); server-এ একই ট্রিম — লং চ্যাট ≠ বিশাল API রিকোয়েস্ট
- [x] partial খালি placeholder কনটেক্সটে যায় না

### মেমরি ম্যানেজমেন্ট
- [x] ডিলিট: UI + স্টোরেজ দুই-ই (DELETE API 404-পরীক্ষিত); clear-চ্যাট UI+স্টেট রিসেট

### ডেটা ইন্টিগ্রিটি (INTEGRITY)
- [x] প্রতিটি রিকোয়েস্ট `conversationId`-তে বাঁধা; `sTarget` রেস-গার্ড
- [x] রিজেনারেট এখন **নির্দিষ্ট মেসেজে** (আগে সবসময় শেষ AI উত্তর টার্গেট করত — `mid` ফিক্স)
- [x] duplicate response নেই (প্লেসহোল্ডার রিপ্লেস মডেল)

### এরর রিকভারি (ERROR RECOVERY)
- [x] চ্যাট-খোলা/স্ট্রিম/রিজেনারেট — সব পথে বাংলা error card + Retry
- [x] খালি উত্তর → "আবার চেষ্টা" + পুরোনো উত্তর রক্ষা

### পারফরম্যান্স
- [x] লিস্ট/মেসেজ windowed; md() সিঙ্গেল-পাস; কোনো লিকিং listener নেই (একই delegate)
- [x] E2E-তে প্রতিটি বড় কনভারসেশন <৪০০ms ওপেন

---

## 🧪 টেস্ট প্রমাণ (সংক্ষেপ)

| স্যুট | ফলাফল |
|---|---|
| API: config/health | ✅ image:true, models ৪টি |
| API: pagination 1,055 chats | ✅ 50/50/5 |
| API: title+content+date search, project | ✅ |
| API: meta (messages-stripped) + messages windowing (total/offsets) | ✅ |
| API: in-chat search (+snippet) | ✅ |
| API: delete→404, PATCH title | ✅ |
| API: real SSE stream (fast মডেল, done, saved) | ✅ |
| API: abrupt abort → partial 750-chars saved | ✅ |
| API: ব্যর্থ regenerate → **পুরোনো উত্তর restore** (invalid-key deterministic টেস্ট) | ✅ |
| API: সফল regenerate → partial replaced (কোনো dup নেই) | ✅ |
| E2E core 12/12: hero/fixed-composer/stream/codeBox/table/history+search/chat-open/reload/new-chat/no-overlay | ✅ 0 errors |
| E2E advanced: windowing 60→120, olderBtn, partial chip, resume-card→regenerate, in-chat search+jump, draft restore (reload), mid-stream switch, copy-code, regenerate via menu | ✅ 0 errors (সব PASS) |
| Markdown ব্যাটারি: H1–H6/bold/italic/checklist/quote/hr/nested/code-whitespace/table-group/80-item list/Bangla/plain-math | ✅ ১৫/১৫ (২টি ছিল টেস্ট-এস্কেপ আর্টিফ্যাক্ট, আউটপুট ডাম্পে নিশ্চিত) |

---

## ⚠️ বাকি সমস্যা / Known Limitations (সৎ তালিকা)
1. **পাবলিক ডিপ্লয় বিহীন** — সব ফিক্স local-only; public PWA এখনো v5 + পুরোনো worker। GitHub PAT + Cloudflare টোকেন লাগবে (আগের টোকেন রিভোক করার পরামর্শ দেওয়া হয়েছিল — নতুন দিলে সাথে সাথে deploy হবে: sw v6 + index v6 + worker + image:true)।
2. **ভার্চুয়ালাইজড DOM নয়** — >৬০ মেসেজ windowed, কিন্তু user যদি "আরো পুরোনো" বারবার চাপে তাহলে DOM বাড়ে; ১০০০-মেসেজ চ্যাট একবারে লোড করলে ভারী (সীমা ৬০/ব্যাচ)।
3. **সেম্যান্টিক কমপ্যাকশন নেই** — কনটেক্সট = শেষ ~২৪ মেসেজ ট্রিম (বড় রিকোয়েস্ট হয় না), কিন্তু summary/important-context extract এখনো নেই (সৎ: Phase 2-এর প্রার্থী)।
4. সার্চ-জাম্প শুধু **লোড হওয়া** উইন্ডোর ভেতরে; আরও পুরোনো hit-এ নির্দেশনা-টোস্ট।
5. ভয়েস ইনপুট ব্রাউজার SpeechRecognition-নির্ভর (iPhone Safari-তে সীমিত)।
6. মডেল-প্রোভাইডার আউটেজে chain-রিট্রাই শেষে honest error — resiliency উন্নত, তবে ১০০% আপটাইম সম্ভব নয়।
7. iOS real-device কীবোর্ড ভেরিফিকেশন — CSS+computed যাচাই হয়েছে; ডিভাইসে একবার চোখে দেখে নেওয়া ভালো।

## 🚀 Next Phase Readiness
**READY (engineering)**, কিন্তু গেটিং নিয়ম মেনে: owner অনুমোদন + ডিপ্লয় টোকেন ছাড়া Phase 2 শুরু হবে না। ডিপ্লয় হলে পাবলিক ভেরিফিকেশন (grep codeBox/ahai-v6) + আপনার Test A–O চালানো হবে।

---
*সংরক্ষিত ফাইল: `web/index.html` (v6, 96 KB), `web/sw.js` (v6, network-first HTML), `server.mjs` + `worker.mjs` (pagination/search/messages/partial-recovery), `docs/ROADMAP.md`। সবকিছু uncommitted — deploy-এর সময় commit+push।*
