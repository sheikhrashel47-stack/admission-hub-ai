# 🖥️ PHASE 7 — Bash (টার্মিনাল কমান্ড, সেফটি-গেট সহ)
তারিখ: ২০২৬-০৯-০৬ · স্ট্যাটাস: ✅ COMPLETE — WAITING FOR OWNER APPROVAL

## লক্ষ্য
জুজু নিজে **টার্মিনাল কমান্ড চালাবে** — কিন্তু ৪-স্তর গেট পেরিয়ে: `cmdGate()` = SAFE → INSPECT → APPROVAL → BLOCK (বিদ্যমান, v-পুরনো)। রান = GH Actions ফ্রি Linux VM (kit.lab ইঞ্জিন)।

## ডেলিভারেবল
1. **`kit.bash` টুল:** {cmd, async?, ownerConfirm?} — BLOCK হলে সরাসরি আটকে; INSPECT/APPROVAL হলে মালিকের অনুমোদন ছাড়া চলবে না; SAFE হলে সাথে সাথে।
2. **প্ল্যানার সংযোগ:**.quick-rule (টার্মিনাল/bash/কমান্ড + চালাও/run) → kit.bash; PLAN_CATALOG-এ kit.bash{cmd}; LLM প্ল্যানারও দিতে পারবে।
3. **অনুমোদন-ফ্লো:** চ্যাটে লিখুন `অনুমোদন: <কমান্ড>` → ownerConfirm:true সহ চলে (owner-gate ছাড়া কাজ করবে না)।
4. async মোড: runKey → GET /api/runner/<key>।

## Acceptance
- [x] SAFE কমান্ড (ls/python3 -V) → আউটপুট সহ উত্তর
- [x] BLOCK (rm -rf /) → বাংলা ব্লক-বার্তা, কিছুই চলে না
- [x] APPROVAL (git push) → needsApproval; `অনুমোদন:` সহ → চলে
- [x] চ্যাট quick-rule + মিশন-প্ল্যানার দুই পথেই kit.bash
- [x] health wv p10-v89

## Owner task list
- কিছু লাগবে না। অনুমোদন-ফ্লো চ্যাটেই।

## নিয়ম
শেষে: `PHASE 7 COMPLETE — WAITING FOR OWNER APPROVAL` → Phase 9 (Large-Site Coding)।
