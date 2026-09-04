# JUJU Mission Engine — প্রথম লাইভ মিশন (P10)

_এই ফাইলটা মানুষের হাতে লেখা নয় — ops.mission ইঞ্জিনের ১৫-ধাপের delivery loop নিজে লিখে, verify করে, gate পাস করে কমিট করেছে।_

## মিশন তথ্য
- **ইঞ্জিন:** understand→inspect→architect→plan(critic)→implement→build→test→review→security→diff→ready(gate)→approve→deploy→postverify→report
- **নীতি:** Persistent ≠ Infinite — bounded budget, ২-ব্যর্থতায় human escalation, prod deploy কখনো ছাড়া-অনুমোদনে নয়
- **তারিখ:** 2026-09-04

## প্রমাণ
এই কমিটের message-এ mission id আছে। ops.mission {action:"status", id} দিয়ে পূর্ণ checkpoint লগ দেখা যাবে।
