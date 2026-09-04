# 🟣 BLOCK C (১/২) — Phase 61–75: বিশ্ব-টপ এজেন্টদের ব্রেইন/স্কিল/টুল
> লক্ষ্য (মালিকের নির্দেশ #3): এমন ব্রেইন/skill/tools/intelligence/training — **পৃথিবীর টপ এজেন্টগুলোর মতো**।
> রেফারেন্স: P2-N/O/P (skill system), P2-G (MCP), P5-K (RAG)। ভিত্তি: Block A+B সম্পূর্ণ।

---

### Phase 61 — Skill Registry আর্কিটেকচার
**লক্ষ্য:** দক্ষতা = মড্যুলার প্যাকেজ, মনোলিথিক প্রম্পট নয়।
- [ ] 61.1 স্কিমা: প্রতি skill = {id, name, description, when_to_use, tools[], workflow (ধাপ-টেমপ্লেট), constraints, examples[2+], verification}
- [ ] 61.2 স্টোরেজ সিদ্ধান্ত: repo `skills/*.json` (ভার্শনড, PR-যোগ্য) + kv ক্যাশ — ডক
- [ ] 61.3 `skill.list/get/search` টুল + mission architect stage-এ অটো-প্রস্তাব ("এই কাজে কোন skills?")
- [ ] 61.4 skill loader: মিশনে সক্রিয় skill-এর workflow+constraints সিস্টেম-প্রম্পটে সংযোজন (token-budget সচেতন)
- [ ] 61.5 verification hook: প্রতি skill-এ "শিখেছি কিনা" পরীক্ষা (golden-style mini-task)
- [ ] 61.6 বীজ: বিদ্যমান জ্ঞান থেকে প্রথম স্কিল স্কেচ (deploy-pipeline, worker-patch) — পরের phase-গুলোতে পূর্ণতা
- [ ] 61.7 live proof: skill-ভিত্তিক মিশন একটা ছোট কাজে (deploy skill রিলোড করে দেখানো)
**মাপকাঠি:** registry CRUD + loader লাইভ। **ঝুঁকি:** প্রম্পট-ফোলা — প্রতি মিশনে ≤3 skill।

### Phase 62 — Skill: coding
- [ ] 62.1 workflow: spec→outline→chunk-gen (Phase 1)→verify (Phase 11)→edit-চক্র (Phase 2)→test
- [ ] 62.2 ভাষা-প্রোফাইল: JS/TS/Python/Bash/Swift-lite — প্রতিটায় কনভেনশন+টেস্ট-প্যাটার্ন+common pitfalls (আমাদের জানা TDZ/clog ইত্যাদি সহ)
- [ ] 62.3 constraints: raw unescaped কোড, সম্পূর্ণ ফাইল/হাঙ্ক, কখনো অর্ধেক নয়
- [ ] 62.4 examples: ৩টা বাস্তব (worker patch, status.html, utility lib)
- [ ] 62.5 verification: mini-task সেট (golden-এ যোগ)
- [ ] 62.6 live proof: coding-skill-লোডেড মিশনে নতুন ফিচার
**মাপকাঠি:** verification mini-tasks ≥80%।

### Phase 63 — Skill: debugging
- [ ] 63.1 workflow: লক্ষণ→প্রজনন (repro)→অনুমান (≤3)→পরীক্ষা→রাইট-কারণ→ফিক্স→রিগ্রেশন-টেস্ট
- [ ] 63.2 টুল-ম্যাপ: error taxonomy (Phase 15), gh.log/bisect-lite (Phase 8), web.console (Phase 24), mem.error-search
- [ ] 63.3 anti-pattern: "অনুমান-ফিক্স-প্রার্থনা" নিষিদ্ধ; প্রমাণ ছাড়া ফিক্স নয়
- [ ] 63.4 examples: 429-cascade incident, prod-gate hole, thum.io cache (আমাদের ইতিহাস)
- [ ] 63.5 verification: ২টা কৃত্রিম বাগ ধরার ড্রিল
- [ ] 63.6 live proof: ড্রিল রিপোর্ট
**মাপকাঠি:** ড্রিল বাগ ২টাই ধরা পড়েছে পদ্ধতিতে।

### Phase 64 — Skill: github
- [ ] 64.1 workflow: clone-বিহীন API প্যাটার্ন, branch→PR→review→merge নীতি, contents API সীমা (1MB), blob-swap কৌশল
- [ ] 64.2 টুল-ম্যাপ: gh.*, ci.* (Phase 40), twin.*
- [ ] 64.3 constraints: force/rewrite কখনো নয়; main সরাসরি = শুধু মালিক-নীতি অনুমোদিত প্রজেক্টে
- [ ] 64.4 examples: আমাদের নিজস্ব deploy pipeline, mission commits
- [ ] 64.5 verification: PR-চক্র ড্রিল
- [ ] 64.6 live proof: ড্রিল রিপোর্ট
**মাপকাঠি:** ড্রিল নিরাপদে সম্পূর্ণ।

### Phase 65 — Skill: browser
- [ ] 65.1 workflow: লক্ষ্য-পাতা→state বোঝা (Phase 24)→action→verify→recovery
- [ ] 65.2 টুল-ম্যাপ: web.eye/qa.browse/browserless script, allowlist নীতি
- [ ] 65.3 anti-bot সীমা-সততা: কী করা যাবে না তালিকা
- [ ] 65.4 examples: ফর্ম-এক্সট্রাক্ট, ভিজ্যুয়াল গেট
- [ ] 65.5 verification: ২টা বাস্তব সাইট টাস্ক
- [ ] 65.6 live proof: রিপোর্ট
**মাপকাঠি:** verification পাস।

### Phase 66 — Skill: research
- [ ] 66.1 workflow: Phase 23/46 চেইনের সংক্ষিপ্ত রূপ + সূত্র-নীতি
- [ ] 66.2 quality bar: প্রতি দাবিতে সূত্র; snippet-থেকে-সিদ্ধান্ত নয় (P5-I নীতি)
- [ ] 66.3 tools: web.search/read, research session, doc.generate
- [ ] 66.4 examples: provider-eval গবেষণা (আমাদের ইতিহাস)
- [ ] 66.5 verification: mini গবেষণা টাস্ক সেট
- [ ] 66.6 live proof: রিপোর্ট
**মাপকাঠি:** verification পাস।

### Phase 67 — Skill: testing
- [ ] 67.1 workflow: স্পেক→কেস-ম্যাট্রিক্স (positive/negative/edge)→জেনারেট (agent.test)→রান→বিশ্লেষণ→রিপোর্ট
- [ ] 67.2 স্তর: unit(sandbox)/integration(API)/E2E(browser)/visual(qa.gate)/golden
- [ ] 67.3 ফ্ল্যাকি নীতি: ৩-রান median, অস্থির টেস্ট আইসোলেশন
- [ ] 67.4 examples: আমাদের golden suite, P8 tick-lock টেস্ট
- [ ] 67.5 verification: ইচ্ছাকৃত বাগ ধরা ড্রিল
- [ ] 67.6 live proof: রিপোর্ট
**মাপকাঠি:** verification পাস।

### Phase 68 — Skill: deployment
- [ ] 68.1 workflow: build→gate (Phase 12/9.4)→approved→deploy→post-verify→rollback-ready
- [ ] 68.2 টার্গেট-প্রোফাইল: gh-pages blob-swap, CF Pages direct-upload, CI auto (Phase 40) — প্রতিটার ধাপ-টেমপ্লেট
- [ ] 68.3 constraints: prod কখনো অটো নয়; wv bump বাধ্যতামূলক; health probe বাধ্যতামূলক
- [ ] 68.4 examples: আমাদের v29–v34 চেইন
- [ ] 68.5 verification: ক্যানারি ড্রিল
- [ ] 68.6 live proof: রিপোর্ট
**মাপকাঠি:** verification পাস।

### Phase 69 — Skill: security
- [ ] 69.1 workflow: threat-model-lite→scan (Phase 42)→fix→verify→audit-log
- [ ] 69.2 আমাদের নীতি-সংহিতা: secrets server-side, redaction, zero-trust input, PERMISSION matrix
- [ ] 69.3 red-team চেকলিস্ট: injection/bypass/leak টেস্ট প্যাটার্ন
- [ ] 69.4 examples: prod-gate hole fix (আমাদের ইতিহাস)
- [ ] 69.5 verification: বাইপাস-চেষ্টা ব্যর্থ ড্রিল
- [ ] 69.6 live proof: রিপোর্ট
**মাপকাঠি:** verification পাস।

### Phase 70 — Skill: ui-design
- [ ] 70.1 workflow: প্রসঙ্গ→রেফারেন্স (archive/মালিকের পছন্দ)→wireframe (টেক্সট)→কোড→visual gate→রিফাইন
- [ ] 70.2 মালিকের ডিজাইন-ভাষা সংহিতা: violet/glass, flat feed, premium typography, no-chips (ROUND-5/6 শিক্ষা)
- [ ] 70.3 responsive/a11y চেকলিস্ট (Phase 25 tools)
- [ ] 70.4 examples: Admission Hub UI, status.html
- [ ] 70.5 verification: fidelity স্কোর গেট
- [ ] 70.6 live proof: একটা নতুন UI অংশ স্কোরসহ
**মাপকাঠি:** মালিকের রায় "সুন্দর"।

### Phase 71 — Skill: documentation
- [ ] 71.1 workflow: অডিয়েন্স→আউটলাইন→লেখা→সম্পাদনা গেট→ফরম্যাট (md/pdf/docx)
- [ ] 71.2 ভাষা-নীতি: সহজ বাংলা, প্রযুক্তি-পরিভাষা ইংরেজিতে, উদাহরণ বাধ্যতামূলক
- [ ] 71.3 ডক-প্রকার প্রোফাইল: README/handover/report/audit/changelog
- [ ] 71.4 examples: এই প্ল্যান, FINAL-AUDIT
- [ ] 71.5 verification: সম্পাদক-গেট (Phase 47.4) পাস
- [ ] 71.6 live proof: একটা নতুন ডক
**মাপকাঠি:** verification পাস।

### Phase 72 — Skill: automation
- [ ] 72.1 workflow: পুনরাবৃত্ত কাজ শনাক্ত→ট্রিগার বাছাই (cron/webhook/manual)→job নকশা→নিরাপত্তা-গেট→নিরীক্ষণ
- [ ] 72.2 টুল-ম্যাপ: ops.queue/schedule/tick/away, heartbeat/watchman
- [ ] 72.3 constraints: away-mode নীতি (prod অটো নয়), budget
- [ ] 72.4 examples: nightly vault backup, daily digest
- [ ] 72.5 verification: এক সপ্তাহ নির্ভরযোগ্য রান লগ
- [ ] 72.6 live proof: রিপোর্ট
**মাপকাঠি:** শূন্য নীরব ব্যর্থতা (সপ্তাহে)।

### Phase 73 — Skill: database
- [ ] 73.1 workflow: স্কিমা-নকশা→migration (Phase 39)→query প্যাটার্ন→ব্যাকআপ→monitoring
- [ ] 73.2 D1/KV বিশেষত্ব: quota, batch, transaction সীমা, kv-exp প্যাটার্ন (আমাদের জানা)
- [ ] 73.3 anti-pattern: index ছাড়া LIKE-scan, unbounded query
- [ ] 73.4 examples: আমাদের kv/jobs স্কিমা
- [ ] 73.5 verification: migration ড্রিল (apply+rollback)
- [ ] 73.6 live proof: রিপোর্ট
**মাপকাঠি:** verification পাস।

### Phase 74 — Skill Composition + Discovery
**লক্ষ্য:** এক কাজে একাধিক skill সুরেলা সংমিশ্রণ (P2-O/P)।
- [ ] 74.1 discovery: task বর্ণনা → skill ম্যাচ স্কোর (embedding নয় আগে — keyword+critic; Phase 76-এ vector আপগ্রেড)
- [ ] 74.2 composition rules: দ্বন্দ্ব (conflict) নিরসন (দুই skill-এর বিপরীত নির্দেশ), অগ্রাধিকার ক্রম
- [ ] 74.3 বাজেট: ≤3 skill/মিশন, token-weighted ছাঁটাই
- [ ] 74.4 composite উদাহরণ: "ডিপ্লয়মেন্ট-সহ ফিচার" = coding+testing+deployment+github
- [ ] 74.5 ট্রেস: প্রতি mission report-এ "কোন skill কেন" ব্যাখ্যা (X-explainability)
- [ ] 74.6 live proof: composite মিশন সফল
**মাপকাঠি:** skill-ছাড়া মিশনের তুলনায় গুণমান/সময় উন্নতি দেখানো।

### Phase 75 — MCP Client
**লক্ষ্য:** বাইরের স্ট্যান্ডার্ড টুল-সার্ভারদের সাথে যোগ (P2-G) — নতুন টুল = মস্তিষ্ক-পুনর্লিখন নয়।
- [ ] 75.1 গবেষণা: ফ্রি/hosted MCP সার্ভার কী আছে (2027 সালে!) — research session (Phase 23)
- [ ] 75.2 প্রোটোকল সাপোর্ট স্তর সিদ্ধান্ত: HTTP/SSE transport worker-এ সম্ভব কিনা — ট্রেডঅফ ডক
- [ ] 75.3 `mcp.connect/list/call` টুল (client) — টুল-তালিকা → PERM-এ অটো-ম্যাপিং (unknown = APPROVAL)
- [ ] 75.4 নিরাপত্তা: MCP সার্ভার = untrusted input; আউটপুট redaction; allowlist
- [ ] 75.5 একটা বাস্তব MCP সার্ভার সংযোগ (যেমন ফাইল/সার্চ/ডেটাবেস)
- [ ] 75.6 skill registry-তে MCP-টুল যোগ প্যাটার্ন
- [ ] 75.7 live proof: MCP-টুল দিয়ে একটা মিশন ধাপ
**মাপকাঠি:** বাইরের টুল লাইভ ব্যবহৃত। **ঝুঁকি:** ফ্রি সার্ভার নির্ভরতা — fallback নীতি।

---
_বাকি Block C: `C2-PHASES-76-90.md` — RAG, memory pro, training pipeline।_
