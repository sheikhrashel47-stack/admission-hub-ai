# 🧠 ADMISSION HUB — JUZU AUTONOMOUS AGENT — A→Z COMPLETE MASTER BLUEPRINT
> Owner-প্রদত্ত আনুষ্ঠানিক ব্লুপ্রিন্ট (২০২৬-০৯-০৪)। সংক্ষিপ্ত কিন্তু সম্পূর্ণ সংস্করণ — প্রতিটি ধারার মূল দাবি সংরক্ষিত।
> সম্পর্কিত: `docs/BLUEPRINT.md` (১-phase রোডম্যাপ), `docs/BLUEPRINT-AUDIT-143.md` (বাস্তব অডিট)।

## 0. 🎯 CORE IDENTITY
Agent = Persistent, multi-turn, tool-using, autonomous AI operator। শুধু chatbot নয়, শুধু automation button নয়।
প্রবাহ: YOU → CHAT → JUZU → UNDERSTAND → PLAN → USE TOOLS → EXECUTE → OBSERVE → VERIFY → FIX → REPORT → WAIT FOR NEXT INSTRUCTION।
**Task শেষ হলেও Agent/session শেষ হবে না।**

## ️ FOUNDATION RULE (সর্বোচ্চ গুরুত্ব)
❌ হবে না: "User task দিল → Agent কাজ করল → popup বন্ধ → session শেষ।"
✅ হবে: "Continuous relationship — task আসবে, execute হবে, শেষ হবে — কিন্তু Agent থাকবে, context থাকবে, chat থাকবে, composer থাকবে, পরের instruction-এর জন্য ready থাকবে।"
Agent Control কোনো popup/task form নয় — পুরো জিনিসটা **persistent AI workspace + autonomous execution engine**।

## 1-4: UI + INTELLIGENCE
1. **Full Agent Workspace**: header (name/avatar/online/status/model/project/settings/new conv/history); main chat (user/agent/streaming/tool activity/thinking summary/files touched/code changes/test results/errors/completion); composer (text/multiline/send/stop/attach file/attach image/mention/voice-future/retry/edit previous)। TASK COMPLETED → SESSION REMAINS ACTIVE → INPUT REMAINS ACTIVE।
2. **Intent classes**: CASUAL/QUESTION/INFORMATION/RESEARCH/TASK/CODING/AUTOMATION/FILE/DEPLOYMENT/FOLLOW-UP/CLARIFICATION।
3. **Greeting-এ কাজ নয়** (hard rule): Hi/Hello/হাই/কেমন আছো/Thanks/Okay/Good/Who are you → কোনো tool চলবে না।
4. **Brain**: intent detection, context, planning, reasoning, tool selection, execution strategy, error analysis, replanning, verification, final reporting। Model = decision-maker।

## 5-6: MODELS
5. **Multi-model router**: task type/capability/context size/availability/latency/quota/failure/cost/vision/coding/reasoning দেখে route (Gemini/OpenRouter/HF/free/future)।
6. **Model health**: health check, latency, quota, failure tracking, timeout, retry, fallback, disable/enable, capability registry। Task মাঝপথে হারাবে না।

## 7-10: TASK ENGINE
7. **Task object**: id, conversation id, request, status, priority, plan, current step, completed/pending steps, tool calls, files changed, errors, retries, test results, created/updated, final result।
8. **State machine**: IDLE→UNDERSTANDING→PLANNING→WAITING_FOR_APPROVAL→EXECUTING→OBSERVING→VERIFYING→PASS/FAIL→COMPLETED বা ANALYZE→REPLAN→EXECUTE; clarification-এ WAITING_FOR_USER।
9. **Decomposition**: বড় task → ছোট step (inspect→identify→plan→modify→preserve→test→fix→verify)।
10. **Planning engine**: objective/assumptions/dependencies/files/tools/steps/risks/verification criteria।

## 11: APPROVAL
Analyze আগে বলে তারপর approval। বাধ্যতামূলক: production deploy, destructive action, secret/API change, DB destructive, payment, গুরুত্বপূর্ণ account action।

## 12-16: TOOLS + EXECUTION
12. **Tool categories**: file (list/read/write/edit/delete/move/rename/create_folder), search (files/code/regex/symbol/dependency), git (status/diff/log/branch/checkout/commit/push/pull), repo (inspect/list/read/search)।
13. **Code execution**: run_command/script/build/test/linter/formatter/typecheck — sandbox-এ।
14. **Package mgmt**: inspect/identify/install/update/lockfile/conflict/compat।
15. **Testing engine**: unit/integration/build/lint/type/runtime/API/UI/regression।
16. **Self-healing**: BUILD→ERROR→READ→LOCATE→UNDERSTAND→FIX→BUILD AGAIN; max iteration limit।

## 17-19: VERIFICATION + REVIEW
17. **Verification engine**: "Done" বলা যাবে না যতক্ষণ requirement→implementation→test→actual result→requirement comparison না হয়।
18. **Code review**: bugs/regressions/security/unused/broken imports/duplicated/bad architecture/missing edge cases।
19. **Reviewer agent**: CODER→REVIEWER→ISSUES?→FIX→REVIEW AGAIN (আলাদা model)।

## 20-25: PROJECT + MEMORY + CONTEXT
20. **Project system**: প্রতি project-এ files/conversations/tasks/memory/git state/env/credentials refs/deployment info/logs/settings।
21. **Project memory**: architecture/important files/naming/decisions/previous bugs/goals/patterns/deployment/limitations।
22. **Conversation memory**: messages/tasks/tool activity/files/decisions/summaries persistent।
23. **Context management**: Huge repo → index → relevant files → sections → functions → model context।
24. **Codebase index**: filenames/paths/functions/classes/components/imports/exports/dependencies/symbols।
25. **RAG**: embeddings/vector/keyword/semantic/hybrid retrieval।

## 26-30: FILES + VISION + WEB
26. **File system**: HTML/CSS/JS/JSON/MD/TXT/CSV/PDF/images/source/config।
27. **Vision**: screenshot/UI/error screenshot/design reference/diagrams/scanned docs; image দেখে code/UI modification।
28. **Web agent**: search/open/navigate/click/type/inspect/extract/interact/fill forms (permitted)/screenshot/verify UI।
29. **Research engine**: question→search→multiple sources→extract→compare→cross-check→summarize→citations।
30. **Browser observation**: DOM/page state/screenshot/text/links/forms/visible elements।

## 31-36: INTEGRATIONS
31. **GitHub first-class**: inspect/read/search/commits/branches/issues/PRs/diffs/releases/workflow status/Actions logs/commit/push/PR/code changes।
32. **Git workflow**: branch→modify→test→diff→commit→push→PR; production সরাসরি নয়।
33. **Cloudflare**: Workers/Pages/deployments/environment/build status/logs/domains/health/rollback।
34. **Supabase**: tables/schema/query/policies/functions/migrations/logs/config; destructive = approval।
35. **Gmail**: search/read/summarize/draft/organize (permission)/send (approval)।
36. **Telegram**: send/receive command/task+completion+error notification/background update।

## 37-44: EXECUTION RUNTIME
37. **Background tasks**: app বন্ধ থাকলেও task state server-side (queue→worker→checkpoint→continue)।
38. **Long-running**: queue/worker/checkpoint/resume/retry/heartbeat/timeout/state persistence।
39. **Checkpoint**: task state/plan/completed/current/files changed/errors।
40. **Resume**: restart → load checkpoint → continue step N (শুরু থেকে নয়)।
41. **Streaming**: token→token; tool activity live।
42. **Controls**: Stop/Pause/Resume/Retry/Cancel/Continue/Approve/Reject।
43. **Live activity (popup নয়, conversation-এ)**: 🧠 Understanding… 📋 Planning… 🔍 Inspecting… 🔧 Editing… ▶️ Testing… 🩹 Fixing… ✓ Verified — expandable।
44. **Progress**: Step 6/10 + bar; per-step status pending/running/completed/failed/skipped।

## 45-47: OUTPUT
45. **Artifacts**: code/files/reports/patches/screenshots/logs/documents tracked।
46. **Diff view**: before(−)/after(+)।
47. **Final report**: changed/added/fixed/tests/deployment status।

## 48-56: SECURITY + LOGS
48. **Security**: scoped permissions/temporary credentials/server-side secrets/encrypted storage/token rotation/permission boundaries/tool-level authorization।
49. **Secret manager**: raw secret model context-এ অযথা নয়।
50. **Sandbox**: CPU/memory/network/filesystem/time/commands/domains controlled।
51. **Permission levels**: READ/WRITE/EXECUTE/DEPLOY/DELETE/ADMIN।
52. **Destructive protection**: delete DB/repo/production deploy/delete files/reset branch/rotate credentials → approval।
53. **Owner-only**: control/credentials/deployment/integrations/permissions/audit।
54. **Audit log**: WHO/WHAT/WHEN/WHICH TOOL/WHICH PROJECT/RESULT।
55. **Tool log**: timestamped tool sequence।
56. **Error memory**: error/cause/solution/affected files/successful fix — একই ভুল বারবার নয়।

## 57-64: RESILIENCE + MEMORY
57. **Retry engine**: retry→fallback provider→alternative strategy।
58. **Replanning**: Plan A fail → analyze → Plan B।
59. **Loop protection**: max iterations/retries/time budget/token budget/tool budget।
60. **Cost/quota manager**: quota/requests/tokens/failures/remaining/availability।
61. **Smart routing**: simple→light; coding→strongest coding; vision→vision; research→web+suitable; complex→strongest।
62. **Context compression**: old→summary→decisions→current state→recent।
63. **Working memory**: objective/files/plan/errors/result।
64. **Long-term memory**: architecture/preferences/decisions/conventions/successful solutions।

## 65-70: CAPABILITIES
65. **Coding agent**: READ→UNDERSTAND→PLAN→CREATE→EDIT→REFACTOR→DEBUG→TEST→REVIEW→COMMIT→PUSH→DEPLOY→VERIFY→ROLLBACK।
66. **SWE breadth**: frontend/backend/APIs/DB/auth/UI/CSS/JS/HTML/config/automation/testing/deployment।
67. **UI engineering**: image→vision→analyze→identify→implement→run→compare→improve।
68. **Visual verification**: screenshot expected vs actual।
69. **Document processing**: PDF read/search/summarize/extract/transform/generate/compare।
70. **Data processing**: CSV/JSON/tables/filter/transform/analysis।

## 71-79: AUTOMATION + MULTI-AGENT
71. **Workflow engine**: trigger→research→filter→process→store→notify (user-defined, যেমন "প্রতিদিন সকালে GK collect")।
72. **Scheduler**: one-time/recurring/daily/weekly/scheduled/conditional।
73. **Workflow composer**: trigger→tool→AI decision→tool→condition→tool→notification।
74. **Sub-agents**: Research/Coding/Browser/Testing/Reviewer/Deployment — main = coordinator।
75. **Specialist roles**: researcher/programmer/debugger/tester/UI/security/deployment।
76. **A2A communication**। 77. **Orchestrator** = central brain। 78. **Task graph** (dependency)। 79. **Parallel execution**।

## 80-88: QUALITY + OPS
80. **Regression protection**। 81. **Versioning** (checkpoint/diff/branch before big change)। 82. **Rollback** (health FAIL → previous stable)।
83. **Health monitoring**: app/API/deployment/worker/DB/provider। 84. **Observability dashboard**: tasks/success/failure/tool usage/model usage/latency/errors/provider health/jobs।
85. **Notification engine**: in-app/Telegram/email/push। 86. **Offline/interruption recovery**। 87. **Multi-device session**। 88. **Conversation continuity**।

## 89-96: UNDERSTANDING
89. **Follow-up understanding** ("ওটা" কোনটা)। 90. **Clarification engine** (ambiguous → প্রশ্ন)। 91. **User preference memory**।
92. **Agent modes**: Chat/Assist/Agent/Autonomous/Review। 93. **HITL** ([Approve][Reject])। 94. **Confidence system** (low → clarification)।
95. **Fact verification** (cross-check)। 96. **Citations** (source/title/evidence)।

## 97-105: SYSTEM DESIGN
97. **Tool discovery**। 98. **Tool schema** (name/description/params/permissions/timeout/risk/result)। 99. **Integration layer** (brain→tool router→adapter→service)।
100. **Backend arch**: frontend→gateway→orchestrator→queue→worker→tool layer→services (+DB/memory/logs/secrets/artifacts)।
101. **Data layer**: users/projects/conversations/messages/tasks/plans/tool calls/checkpoints/memories/artifacts/logs/integrations/permissions।
102. **Authentication** (session/token/validation/expiration/revocation)। 103. **Authorization** (who→project→tool→permission→allowed)।
104. **Data isolation**। 105. **Complete auditability**।

## 106-113: RELIABILITY + UX
106. **Failure handling** (model/API/network/tool/timeout/invalid/code/permission/quota — প্রতিটির recovery)। 107. **Fallback strategy** (→ ask user if impossible)।
108. **Network mgmt** (timeout/retry/backoff/status/health/cancel)। 109. **Job queue** (queued/running/paused/waiting/completed/failed/cancelled)।
110. **Idempotency**। 111. **State consistency** (backend = source of truth)। 112. **Real-time events** (task.started/step/tool/error/retry/completed)।
113. **UI task panel** (current task/progress/step/files/tools/elapsed/status)।

## 114-122: WORKSPACE + QA
114. **Code workspace** (files/editor/preview/terminal/diff/chat)। 115. **Preview environment** (edit→build→preview→inspect→fix)।
116. **Deployment pipeline** (test→build→preview→verify→approval→production→health)। 117. **Deploy health check**। 118. **Safe deployment** (fail→rollback→notify)।
119. **Acceptance test engine** (requirement থেকে test)। 120. **Requirement traceability**। 121. **Self-evaluation**। 122. **Task quality score**।

## 123-130: INTERACTION + CONFIG
123. **Natural language control**। 124. **Natural follow-up**। 125. **Mobile-first** (safe-area/touch/keyboard/streaming/compact activity/expandable logs/background status)।
126. **Background completion notification**। 127. **Context-aware tool selection**। 128. **Agent configuration** (models/autonomy/max iterations/timeout/approval policy/permissions/memory/notifications/providers)।
129. **Tool permission matrix**। 130. **Rules engine** (hard rules model-এর বাইরে: deploy→approval, secret exposure→prohibited, delete DB→approval, greeting→no tools, task done→session active)।

## 131-140: SAFETY + HONESTY
131. **Prompt-injection defense** (trust hierarchy)। 132. **Untrusted content isolation**। 133. **Secret leak prevention** (SECRET→REDACT)।
134. **Memory safety** (candidate যাচাই)। 135. **Memory management** (save/update/delete/expire/scope)। 136. **Artifact storage** (project→task→files/logs/screenshots/reports)।
137. **Task resume after failure**। 138. **Environment reconciliation** (resume-এর আগে অবস্থা মিলিয়ে দেখা)। 139. **Final sanity check**।
140. **Completion contract**: criteria satisfy না হলে "Partially completed — N issues remain"। সৎ reporting।

## 141-143: CULTURE + FINAL FLOW
141. **Developer-experience communication** (I inspected/found/changed/tested/fixed/verified)।
142. **Collaboration**: YOU=OWNER/DIRECTOR · JUZU=OPERATOR · TOOLS=HANDS · MODELS=BRAINS · MEMORY=KNOWLEDGE · SANDBOX=WORKSPACE · VERIFIER=QA।
143. **Final E2E flow**: USER→CHAT→INTENT→(CONVERSATION | TASK→ANALYZE→PLAN→APPROVAL?→EXECUTE→TOOL ROUTER→OBSERVE→VERIFY→PASS/FAIL→REPLAN…)→FINAL REPORT→**SESSION STILL ACTIVE**→"এবার এটা করো…"।
