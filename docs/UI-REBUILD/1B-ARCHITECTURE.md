# 1B — NEW UI ARCHITECTURE (JUJU Workspace v2)
লক্ষ্য: premium AI workspace · শূন্য freeze · backend contract অপরিবর্তিত · অবস্থান: `web/v2/` (পুরনো UI `/`-এ অক্ষত যতদিন না cutover)।

## ফাইল-পরিকল্পনা
```
web/v2/index.html        shell markup (views as <section>)
web/v2/css/tokens.css    design tokens (§60) + light/dark
web/v2/css/app.css       shell/components/layout
web/v2/js/core.js        store(pub/sub), bus, dom(), lifecycle(timers/observers/urls), toast, palette
web/v2/js/api.js         fetch wrappers + ONE SSE client (rAF-batched token bus)
web/v2/js/md.js          markdown renderer + CodeBlock (windowed render, copy/download/collapse/preview)
web/v2/js/views/chat.js  message list (append-only, active-msg-only re-render), composer, attachments
web/v2/js/views/history.js  virtualized chat list (window 40, cursor)
web/v2/js/views/misc.js  projects/files/tasks/settings/connectors (real API, lazy)
web/v2/js/shell.js       nav, routing, context panel, boot
```

## State (§62): ৭টা ছোট store — ui, chat, agent, project, file, preview, server(cache+TTL)। প্রতিটি = {state,get,set,sub}; cross-store event = bus। কোনো global let নয়।
## Rendering strategy (§28-30)
- Message list = **append-only DOM**; নতুন টোকেন = শুধু active message-এর text node buffer → rAF flush (≤60fps batch); md re-render **শুধু active message**, throttle 120ms; done হলে final md once।
- Code block ≥300 lines = **collapsed card** + "open viewer"; viewer = **windowed <pre>** (viewport slice ±200 lines, scroll-translate) + lazy hl per chunk; line numbers = CSS counter (no extra nodes)।
- History/chats = **virtual window** (40 render, scroll margin, cursor pagination from /api/chats)।
- Images = loading=lazy + IntersectionObserver full-res swap; video = metadata preload none; objectURL = lifecycle.revoke registry।
- Lists-এ event delegation (data-act attributes); inline onclick শূন্য।
## SSE client: এক parser; events → bus('sse', ev); token buffer Map(msgId→chunks) + rAF drain; abort = AbortController per msg; reconnect state = store.ui.conn।
## Components (§61): AppShell, SideNav, BottomNav, TopBar, ContextPanel, Composer, Message, CodeBlock, FileCard, Viewer(image/video/pdf/text), AgentTimeline, ProgressCard, TaskCard, Palette, Sheet, Modal, Toast, Empty/Error/Loading states।
## Tokens: --c-bg/--c-card/--c-line/--c-txt/--c-dim/--c-acc/--c-ok/--c-warn/--c-err; --sp-1..6; --r-1..3; --sh-1..2; --f-ui/--f-mono; --tr-1..2; --z-sheet/pal/toast; theme = [data-theme] swap, এক CSS।
## Perf rules: rAF/throttle/debounce helpers core-এ; timer/observer/URL সব lifecycle.register→auto-cleanup view-switch-এ; no layout-thrash (transform/opacity anim); prefers-reduced-motion।
## Security: redactSec ক্লায়েন্ট-এ; secrets কখনো DOM/log-এ নয়; preview iframe = sandbox="allow-scripts" + srcdoc, no same-origin।
## Cutover: 1A–1R শেষে `/` = v2 (পুরনো = /legacy/ এক রিলিজ রাখা); sw v25 = static-only cache + network-first HTML।
## Test plan (1P): synthetic注入 — 1k chats (client-side gen, server নয়), 5k msgs, 10k-line code paste, 40MB-equivalent md; measure: first-paint, scroll fps (rAF counter), heap (performance.memory), input latency; gate: no frame >250ms during stream।
