# 🟩 PHASE 5 — OSS Agent Bench (প্রমাণ)
তারিখ: ২০২৬-০৯-০৫ · রানার: GH Actions ubuntu-latest (ফ্রি, private repo কোটা) · dispatch: POST /api/runner/start (owner-gated, v75)

## bench-1 (run_31147b9d7741c0b928d71326)
| ধাপ | ফল |
|---|---|
| Python | 3.12.3 |
| `pip install smolagents` | **5s** |
| `import smolagents` | **1.0s** |
| সংস্করণ | 1.26.0 |
| CodeAgent (ভুল stub: plain function) | AgentGenerationError — 'function' object has no attribute 'generate' (আমাদের stub-ভুল, ফ্রেমওয়ার্ক নয়) |
| crewai wheel (download-only) | 1.1M (install >100s Actions-সীমা → বাদ) |

## bench-2 (run_448bc461aa6b5411f0328ee5) ✅
| ধাপ | ফল |
|---|---|
| install+import | 5s + 1s |
| CodeAgent + Tool(Add) + Model-subclass stub | **Step 1 → Executing parsed code → Final answer: 7** |
| Agent step time | 0.09s |
| EXIT | 0 |

## সিদ্ধান্ত (architecture)
1. **ফ্রেমওয়ার্ক নয়, প্যাটার্ন:** worker (JS/CF) এ pip চলে না → জুজুর ব্রেইন = নেটিভ ReAct লুপ (plan→tool→observe→reflect→answer), v73-এ mission intent + retry-loop যুক্ত।
2. **smolagents = kit.lab-এর ভারী কাজের জন্য:** পাইথন এজেন্ট-জব (যেমন পরে Phase 9 large-site coding এর AST-কাজ) GH Actions VM-এ ৫ সেকেন্ডে প্রস্তুত হয় — $০।
3. **CrewAI বাদ:** ভারী + Actions 100s-সীমা; smolagents হালকা ও যথেষ্ট।
4. runner স্ট্যাটাস: GET /api/runner/<key> (owner) — UI/ডিবাগ দুটোতেই।

## Acceptance (PHASE5-PLAN অনুযায়ী)
- [x] kit.lab-এ smolagents install+import+মিনি-এজেন্ট রান (bench-2 লগ)
- [x] `মিশন:` মেসেজে step+সোর্সসহ বহু-ধাপ কাজ (ক্রিকেট সারাংশ টেস্ট ✅)
- [x] ব্যর্থ টুল অটো-রিট্রাই (v73 retry-loop কোড; লুপ-পথ bench-ভবিষ্যৎ)
- [x] GET /api/runner/<key>: বিনা কোডে 401, কোডসহ 200
- [x] health wv p10-v75
