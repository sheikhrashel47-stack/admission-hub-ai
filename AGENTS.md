# 🤖 AGENTS.md — এই repo-তে ঢোকা যেকোনো AI এজেন্টের প্রথম নির্দেশিকা

**তুমি JUJU-র ঘরে এসেছ।** এটা Sheikh Rashel-এর প্রাইভেট AI এজেন্ট "জুজু"-র নিজস্ব repo — একটা ফ্রি-স্ট্যাকে (Cloudflare Pages worker + D1/KV + GitHub Actions sandbox + ৮ ফ্রি মডেল প্রোভাইডার) চলা পূর্ণাঙ্গ অটোনমাস সিস্টেম।

## ⚡ এখন কোথায় (সর্বশেষ: ২০২৬-০৯-০৪)
- **সম্পূর্ণ:** পুরনো ১০-phase প্ল্যান (Phase 0–10, ৯২/৯২ ধাপ) — UI, model-router, repo-twin, sandbox, memory, visual-QA, background-ops, multi-brain, mission-mode। worker `p10-v34`।
- **চলমান:** 🌌 **MASTER-100** — ১০০ phase-এর নতুন মহাপরিকল্পনা (১–২ বছর)। **এখন: Phase 1 শুরু হয়নি।**

## 📖 পড়ার ক্রম (এর বাইরে কিছু করো না)
1. `docs/MASTER-100/00-INDEX-AND-RULES.md` — মালিকের ৫ নির্দেশ + শাসন-নিয়ম (CONSTITUTION)
2. `docs/MASTER-100/F-ONBOARDING.md` — সিস্টেমের বর্তমান অবস্থা, ইনফ্রা, ডেপলয় পাইপলাইন, শব্দকোষ
3. বর্তমান block-এর phase ফাইল (যে phase চলছে সেটা)
4. রেফারেন্স: `docs/DEEP-RESEARCH-V34.md` (গ্যাপ-অডিট), `docs/FINAL-AUDIT-P10.md` (অর্জন), `docs/JUZU-EXECUTION-PLAN.md` (পুরনো প্ল্যান — সব ✅)

## 🛑 অপরিবর্তনীয় নিয়ম (না মানলে সব কাজ বাতিল)
- **মালিকের অনুমোদন ছাড়া phase COMPLETE নয়; phase শেষে বলো: "PHASE X COMPLETE — WAITING FOR OWNER APPROVAL"।**
- **Production deploy/rollback-এ সর্বদা explicit `approved:true`** — কখনো অটো নয়।
- **Secrets কখনো repo-তে নয়** (repo PUBLIC) — keys আছে D1/KV/GH-Actions-secrets-এ।
- **সৎ থাকো:** ভুয়া সাফল্য নয়; আটকালে partial report (কী হয়েছে/কী বাকি/কেন/বিকল্প)।
- **প্রতিটা worker পরিবর্তনে:** `node --check` → main push → gh-pages blob-swap → wv bump → ৭৫s wait → `/api/health` probe।
- Persistent ≠ Infinite — সব অটোনমি bounded: budget, stop condition, human escalation।

## 🔗 লাইভ এন্ডপয়েন্ট
- API/worker: `https://admission-hub-ai.pages.dev` (health: `/api/health` → wv দেখো)
- UI: `https://sheikhrashel47-stack.github.io/admission-hub-ai/`
- ড্যাশবোর্ড (জুজুর নিজের লেখা): `…/status.html`

## 🧰 বিদ্যমান টুল-পরিবার (worker-এ ৬০+)
`brain.*` (solve/critic/race/sub/parallel/bench/registry) · `ops.*` (mission/gate/golden/eval/selftest/changelog/queue/jobs/schedule/tick/away/incident/notify/health/stats) · `gh.*` (repos/read/commit/edit/branch/push/merge…) · `cf.pages.*` (deployments/rollback) · `twin.*` (index/search/map/impact/time) · `mem.*` (save/search/correct/forget/audit/export) · `qa.*` (scene/baseline/compare/matrix/error/browse/gate) · `agent.*` (shell/test/repair/envcheck) · `web.*` (search/read/eye) · `verify.url` · `deploy.ghpages` · `bu.*`

_নিয়ন্ত্রণ: মালিক Sheikh Rashel। প্রশ্ন/সন্দেহে মালিককে জিজ্ঞেস করো — অনুমানে ভাঙো না।_
