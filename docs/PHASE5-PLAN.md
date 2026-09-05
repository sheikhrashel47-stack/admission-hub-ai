# 🟩 PHASE 5 — Free + OSS Agent Framework (পরিকল্পনা)
তারিখ: ২০২৬-০৯-০৫ · স্ট্যাটাস: ✅ COMPLETE — WAITING FOR OWNER APPROVAL

## লক্ষ্য
জুজুর এজেন্ট-ইঞ্জিনকে **১০% ফ্রি + ওপেন-সোর্স প্যাটার্নে** দাঁড় করানো — কোনো পেড ফ্রেমওয়ার্ক/সার্ভিস ছাড়া।

## সিদ্ধান্ত-ফ্রেম (architecture decision)
- CF Workers (JS) রানটাইমে pip/npm এজেন্ট-ফ্রেমওয়ার্ক চালানো যায় না → **ফ্রেমওয়ার্ক নয়, প্যাটার্ন নিই**।
- OSS ফ্রেমওয়ার্ক (smolagents / CrewAI) = **kit.lab (GH Actions ফ্রি VM)**-এ ভারী পাইথন এজেন্ট-জবের জন্য; benchmark করে প্রমাণ রাখব।
- জুজুর নিজের ব্রেইন = worker-এর নেটিভ ReAct-লুপ (plan → tool → observe → reflect → answer), যা smolagents/CodeAgent প্যাটার্ন অনুসরণ করে কিন্তু $০।

## ডেলিভারেবল
1. **5.1 OSS bench (kit.lab):** `pip install smolagents` → import → একটা আসল Tool + CodeAgent মিনি-রান (ফ্রি GH Actions VM-এ)। সময় মেপে `docs/PHASE5-OSS-BENCH.md`-এ টেবিল। CrewAI = ভারী (>১০০s Actions-সীমা) → install-ছাড়া নোট।
2. **5.2 নেটিভ মিশন-ইঞ্জিন আপগ্রেড:**
   - `মিশন:` প্রিফিক্স → intent `mission` (MODE_SYS mission ইতিমধ্যে আছে)।
   - chatToolLoop-এ **observe→reflect রাউন্ড**: কোনো টুল ব্যর্থ হলে একবার রিট্রাই (validation loop, smolagents-প্যাটার্ন)।
   - mission-এ খবর/তথ্য-কীওয়ার্ড থাকলে লাইভ সার্চ চলবে।
3. **5.3 রানার স্ট্যাটাস রুট:** `GET /api/runner/<key>` (owner-gated) — অ্যাসিংক sandbox/মিশনের ফল সরাসরি পড়া যায় (UI/ডিবাগ দুটোতেই লাগবে)।
4. **5.4 ডক:** bench ফল + সিদ্ধান্ত এই প্ল্যান-ডকেই আপডেট; SERVICES-INVENTORY-তে v73 সেকশন।

## Acceptance criteria
- [x] kit.lab-এ smolagents install+import+মিনি-এজেন্ট রান ✅ (লগ-প্রমাণ)
- [x] `মিশন: …` মেসেজে step-সহ বহু-ধাপ কাজ সম্পন্ন (লাইভ টেস্ট)
- [x] ব্যর্থ টুল অটো-রিট্রাই (লুপ-টেস্ট)
- [x] GET /api/runner/<key> owner-কোডে 200, বিনা কোডে 401
- [x] health wv = p10-v73

## Owner task list
- **কিছু লাগবে না** — সব ফ্রি কোটা (GH Actions ২০০ min/মাস private, CF free)।
- ঐচ্ছিক: পরে Phase 6 (Connectors)-এর জন্য Discord webhook key দিতে পারেন (এখন নয়)।

## নিয়ম
শেষে: `PHASE 5 COMPLETE — WAITING FOR OWNER APPROVAL` → owner অনুমোদন → Phase 6 (Connectors)।
