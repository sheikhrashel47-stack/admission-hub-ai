# 1A — COMPLETE FRONTEND AUDIT + DEPENDENCY MAP
তারিখ: ২০২৬-০৯-০৬ · স্কোপ: `web/index.html` (2,175L), `web/sw.js` (69L), manifest, icons · নীতি: **কিছু ডিলিট নয় আগে dependency বুঝে**।

## ১) স্ক্রিন/শিট/মোডাল (20) — নির্ভরতা + স্ট্যাটাস
| ID | উদ্দেশ্য | নির্ভর (fn/API/state) | স্ট্যাটাস |
|---|---|---|---|
| sMenu | মূল মেনু | 15 mItem handler | ACTIVE |
| sModel | মডেল বাছাই | cfg.models, /api/config | ACTIVE |
| sHistory | চ্যাট লিস্ট | loadHistory(), /api/chats | ACTIVE (non-virtualized ⚠) |
| sProjects | প্রজেক্ট গ্রুপ | currentProject, histFetch | PARTIAL |
| sFav | ফেভারিট | meta.fav | PARTIAL |
| sAudit | টুল-অডিট | /api/audit | ACTIVE |
| sMemory | মেমোরি নোট | /api/memory GET/PUT, memData | ACTIVE |
| sSources | সোর্স লিস্ট | curSources | ACTIVE |
| sDetails | মেসেজ-ডিটেইলস | curMsgRef | PARTIAL |
| sTools | ফাইল/টুল আপলোড | attachments, /api/files | ACTIVE |
| sTasks | এজেন্ট টাস্ক প্যানেল | agTasks, agent:task store | LEGACY (agent WS স্ট্যাক) |
| sAgent | এজেন্ট ওয়ার্কস্পেস | agRender, /api/agent | LEGACY (hidden flow) |
| sSettings | সেটিংস | localStorage prefs | ACTIVE |
| sHelp | হেল্প | static | ACTIVE |
| sSys | সিস্টেম স্ট্যাটাস | /api/system,/api/usage | ACTIVE |
| sConv | চ্যাট-ম্যানেজ | /api/chats/<id> PUT | ACTIVE |
| sMsg | মেসেজ-অ্যাকশন | doMsgAction | ACTIVE |
| sConn | কানেক্টর | /api/connectors | ACTIVE (v79) |
| sRepo | রেপো-কাজ | /api/tool gh.repos, selRepo | ACTIVE (v86) |
| codePrev/codeFs | কোড প্রিভিউ/ফুলস্ক্রিন | cpFrame iframe | PARTIAL (no sandbox attr audit ⚠) |

## ২) মেনু (15): ACTIVE 11 · HIDDEN/LEGACY 2 (mAgent, mChatOps-context) · DUP 1 (memSave ≈ sMemory) · DEAD 1 (mAgent target stack)
## ৩) রেন্ডারার
| fn | কাজ | স্ট্যাটাস |
|---|---|---|
| esc/hl/md/mdLive | markdown+highlight | ACTIVE কিন্তু **full re-render per token batch** ⚠ (perf) |
| addUserMsg/addAiShell | মেসেজ নোড | ACTIVE |
| agentSteps | step timeline | PARTIAL (stepLine সহ dup) |
| renderFollowUps | সাজেশন চিপ | **DEAD** (কল বাদ, fn থেকেছে) |
| agRender/agBar*/agTasks | এজেন্ট WS UI | **LEGACY** |
## ৪) API কল-ম্যাপ: /api/chat(SSE), /api/chats(+id), /api/files(+id), /api/memory, /api/system, /api/usage, /api/config, /api/audit, /api/tool, /api/owner/unlock, /api/connectors, /api/agent(legacy) — **contract অক্ষত রাখতে হবে**।
## ৫) ইভেন্ট: inline onclick 110 + addEventListener 28 → **delegation নেই** ⚠। SSE reader-loop 3টা (chat/retry/agent) = dup parser ⚠। timers: setInterval 3, setTimeout 16 — registry নেই ⚠।
## ৬) State (global let): curId, streaming, abort, model, mode, web, agentMode, cfg, curSources, stickScroll, attachments[], imgAttachments[], attPending, quoteCtx, currentProject, agOn/agRunning/agAbort, selRepo, memData, srResults… = **uncontrolled global** ⚠।
## ৭) SPEC-ফিচার GAP (MISSING): command palette, virtualized lists (chat+history), windowed code render, video viewer, PDF page viewer, file tree, task center persistent, preview console, drag-drop zone, upload progress bytes, context panel, desktop 3-pane, accessibility focus mgmt, reduced-motion।
## ৮) BROKEN/ঝুঁকি: sw v24 cache-name bump ম্যানুয়াল; codePrev iframe sandbox audit বাকি; b64 আপলোড UI-তে (spec §38 বিরোধে) — chunking backend-এ নেই → UI-side progress simulation নিষিধ (no-fake rule) → progress = indeterminate bar সত্যভাবে।
## ৯) সংখ্যা: ACTIVE 34 · PARTIAL 7 · LEGACY 6 · DEAD 2 · DUP 3 · MISSING 14 (spec-বিচারে)।

**সিদ্ধান্ত:** legacy (sTasks/sAgent/agBar/renderFollowUps/mAgent) = v2-তে **আনব না**; backend contract অপরিবর্তিত; v2 = নতুন ডিরেক্টরি, cutover পরে।
