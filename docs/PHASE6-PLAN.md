# 🔗 PHASE 6 — Connectors (পরিকল্পনা)
তারিখ: ২০২৬-০৯-০৫ · স্ট্যাটাস: ✅ COMPLETE — WAITING FOR OWNER APPROVAL

## লক্ষ্য
জুজুকে বাইরের দুনিয়ার সাথে **দুই-মুখী সংযোগ**: outbound (জুজু → সার্ভিস) + inbound (সার্ভিস → জুজু)। সব ফ্রি টিয়ার; নতুন key লাগলে শুধু owner দেবেন।

## স্কোপ (slice-1, এই সাইকেল — নতুন key লাগবে না)
1. **GitHub connector (outbound):** নতুন টুল `gh.issue` (খোলা/বন্ধ), `gh.pr` (লিস্ট/স্ট্যাটাস), `gh.runs` (Actions রান),আগে থেকেই আছে `gh.repos/gh.read`। PAT আগে থেকেই server-side।
2. **GitHub connector (inbound):** `POST /api/hook/github` — HMAC (X-Hub-Signature-256, secret = GH_HOOK_SECRET) verify → শেষ ১০ ইভেন্ট D1-এ → `gh.events` টুলে পড়া।
3. **Owner debug/connector গেটওয়ে:** `POST /api/tool` (owner-gated) — যেকোনো টুল সরাসরি কল (টেস্ট/অটোমেশন/পরবর্তী ফেজের ভিত)।
4. **Discord outbound স্ক্যাফল্ড:** `con.discord` — DISCORD_WEBHOOK থাকলে পাঠাবে, না থাকলে বাংলায় সেটাপ-নির্দেশ সহ এরর (owner key পরে)।
5. প্ল্যানার quick-rules: নতুন ৫ টুলের জন্য regex-ম্যাপ।

## স্কোপ (slice-2, owner-key সাপেক্ষে — পরের সাইকেল)
- Discord webhook URL (owner), Slack webhook, Gmail/Resend (free tier), Telegram bot token — যেগুলো owner দেবেন।
- Inbound: Telegram/Discord → JUJU reply-loop (CF cron poll)।

## Acceptance
- [x] /api/tool owner ছাড়া 401, owner-সহ gh.pr/gh.runs লাইভ ডেটা
- [x] gh.issue দিয়ে টেস্ট-ইশু খোলা → বন্ধ (প্রমাণ URL)
- [x] /api/hook/github: ভুল signature-তে 401; সঠিক HMAC-এ 200 + gh.events-এ ইভেন্ট
- [x] con.discord: key নেই → পরিষ্কার বাংলা সেটাপ-এরর
- [x] health wv p10-v76

## Owner task list (ঐচ্ছিক, পরে)
1. Discord: Server Settings → Integrations → Webhooks → New → URL কপি → JUJU-কে দিন (১ মিনিট)।
2. GitHub webhook (inbound চাইলে): Repo → Settings → Webhooks → Add → URL = https://admission-hub-ai.pages.dev/api/hook/github + secret = JUJU দেবে → Save। (এখন না করলেও ক্ষতি নেই)

## নিয়ম
শেষে: `PHASE 6 COMPLETE — WAITING FOR OWNER APPROVAL` → Phase 7 (Bash)।
