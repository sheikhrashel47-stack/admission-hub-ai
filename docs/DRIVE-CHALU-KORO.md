# 🚀 Drive চালু করা — শেষ ধাপ

> সব কোড রেডি। শুধু টোকেনটা বসানো বাকি। **৩ মিনিট।**

---

## অবস্থা এখন

| | |
|---|---|
| Google 403 ব্লক | ✅ সমাধান |
| Drive টোকেন | ✅ পাওয়া গেছে (`mahmudrashel1034@gmail.com`, ১২.২৪GB ফাঁকা) |
| স্টোরেজ কোড | ✅ লেখা ও মার্জ |
| **টোকেন বসানো** | ⬜ **এই কাজটা বাকি** |

টোকেন না বসালে অ্যাপ ডিস্কে ফাইল রাখবে (কাজ চলবে), কিন্তু Drive-এ ব্যাকআপ হবে না।

---

## ধাপ ১ — GitHub-এ ফাইল বানান (ফোন থেকেই)

⚠️ **এই ফাইলটা কখনো commit হবে না** — `.gitignore`-এ আছে। তাই GitHub ওয়েবে
বানানো যাবে না। নিচের যেকোনো একটা উপায়ে করুন:

### উপায় ক — Codespaces (সবচেয়ে সহজ, ফোনে চলে)

1. রিপোর পেজে সবুজ **Code** বাটন → **Codespaces** → **Create codespace on main**
2. ১–২ মিনিটে ব্রাউজারে VS Code খুলবে
3. নিচের টার্মিনালে লিখুন:
   ```bash
   nano .env.local
   ```
4. তিন লাইন পেস্ট করুন (যেগুলো টোকেন টুল থেকে কপি করেছিলেন):
   ```
   GOOGLE_DRIVE_CLIENT_ID_1=…apps.googleusercontent.com
   GOOGLE_DRIVE_CLIENT_SECRET_1=GOCSPX-…
   GOOGLE_DRIVE_REFRESH_TOKEN_1=1//…
   ```
5. **Ctrl+O** → **Enter** (সেভ) → **Ctrl+X** (বের হওয়া)

### উপায় খ — লোকাল মেশিনে

```bash
cp .env.example .env.local
# তারপর GOOGLE_DRIVE_* লাইনগুলো ভরুন
```

## ধাপ ২ — যাচাই

```bash
node scripts/gdrive-auth.mjs check
```

দেখাবে:
```
অ্যাকাউন্ট #1 … ✅ mahmudrashel1034@gmail.com  · ব্যবহৃত 2.76 GB / 15.00 GB
1/1 অ্যাকাউন্ট কাজ করছে।
```

## ধাপ ৩ — সত্যিকার টেস্ট (আপলোড → পড়া → মুছা)

```bash
node scripts/gdrive-test.mjs
```

দেখাবে:
```
🎉 সব ঠিক আছে — Drive স্টোরেজ প্রস্তুত!
```

## ধাপ ৪ — অ্যাপে দেখুন

```bash
node server.mjs
```

তারপর:
```bash
curl localhost:3000/api/storage
```

`"primary":"gdrive"` দেখালেই সব চালু ✅
এখন চ্যাটে ফাইল অ্যাটাচ করলে সেটা **ডিস্ক + Drive দুই জায়গায়** যাবে।

---

## 🔑 টোকেন হারিয়ে ফেললে

`docs/TOKEN-RENEW.md` — ৩ ধাপে নতুন টোকেন (৩০ সেকেন্ড)।

## ⏰ ৭ দিনের ব্যাপারটা

consent screen এখনো **Testing** মোডে → টোকেন ৭ দিনে expire হবে।
মরলে অ্যাপ ভাঙবে না (ডিস্কে চলতে থাকবে), শুধু Drive ব্যাকআপ বন্ধ হবে।
স্থায়ী সমাধান: `docs/TOKEN-RENEW.md`-এর **PUBLISH** অংশ।
