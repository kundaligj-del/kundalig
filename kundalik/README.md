# Kundalik

O'quvchilar uchun jadval, vazifalar, kitoblar, kalkulyator, tarjimon va internet talab qilmaydigan Mitticha.

## 1. Ilovani ishga tushirish

PowerShell yoki terminalda `kundalik` papkasiga o'ting:

```powershell
cd kundalik
npm install
npm run dev
```

Brauzerda `http://127.0.0.1:5173` ni oching. Mitticha suhbat, test, imtihon, mavzu tushuntirish va vazifalar brauzerda ishlaydi. **Bugungi reja** uchun ixtiyoriy server kaliti kerak bo'ladi; bu sozlama quyida berilgan.

`src/App.tsx` dagi React Router URL manzilga qarab sahifani tanlaydi: masalan, `/translator` — **Tarjimon**. Fayllar `.js` emas, `.ts/.tsx` bo'lishi loyihaning TypeScript ishlatishidan.

## Qo'ng'iroq va dars vaqtlari

Boshlang'ich qo'ng'iroqlar jadvali `src/data/bellSchedule.ts` faylida, vaqtni holatga aylantirish yordamchilari esa `src/utils/bellTime.ts` faylida. Sozlamada ilgari avtomatik saqlangan standart vaqtlar yangi jadvalga bir marta yangilanadi; o'quvchi qo'lda o'zgartirgan vaqtlar saqlanib qoladi.

**Sozlamalar → Dars vaqtlari va Mitticha eslatmalari** bo'limida dars vaqtlarini, eslatma yoqilganini va necha daqiqa oldin chiqishini sozlang. Brauzer bildirishnomasi ixtiyoriy; ruxsat bo'lmasa sayt ichidagi eslatma qoladi. Brauzer va sayt ichidagi eslatmalar sahifa ochiq turganida ishlaydi.

Jadval tepasidagi jonli soat har soniyada qurilmaning mahalliy vaqtini yangilaydi. Soat formati va soniyalarni ko'rsatishni shu sozlamalar bo'limidan tanlang; ko'rinish `kundalik-live-clock` kaliti bilan brauzerda saqlanadi.

## 2. Mitticha paketiga yangi mavzu qo'shish

- Algebra paketlari: `src/data/packs/algebra.ts`
- Fizika uchun bo'sh paket fayli: `src/data/packs/physics.ts`
- Mavzular tartibi: `src/data/topics.ts`
- Qisqa tushuntirish va ikkita misol: `src/data/explanations.ts`

Algebra faylidagi `algebraPacks` ro'yxatiga `{ fan, mavzu, testlar, uyVazifa }` obyektini qo'shing. Har bir paketda 10 ta test bo'ladi; har testning 4 varianti, `togri` maydonida 0 dan boshlanadigan to'g'ri javob indeksi bor. Uy vazifasiga ketma-ket 3 ta ishora, namuna yechim va tekshirish kaliti qo'shing. Mavzu nomini `topics.ts` fayliga ham xuddi shunday yozing. Hozir to'liq namuna: **Algebra → Chiziqli tenglamalar**.

**Sozlamalar → Mitticha mavzu sozlamalari** ichida mavzu necha dars davom etishini yoki hozirgi mavzuni qo'lda tanlaysiz. Qo'lda tanlangan mavzu avtomatik tavsiyadan ustun.

## 3. Mitticha, test va saqlash

Oddiy suhbat va tushunilmagan iboralar `src/data/smallTalk.ts` hamda `src/utils/matcher.ts` fayllarida. Suhbatni qidirish, eksport qilish, tasdiq bilan tozalash va alohida xabarni o'chirish mumkin.

- Chat tarixi: `kundalik-mitticha-chat` — oxirgi 200 xabar
- Test natijalari va xatolar: `kundalik-test-results` — chatdan alohida
- Zaif mavzular va takrorlash sanalari: `kundalik-weak-topics`
- Uy vazifalari: `kundalik-homework`
- Tushunilmagan iboralar: `kundalik-unknown-messages`

Imtihon rejimida tanlangan fan/mavzudan 10 savolga 10 daqiqada javob beriladi. Xato qilingan mavzu ertasi kuni, muvaffaqiyatli takrorlardan so'ng 3 va 7 kundan keyin qayta chiqadi. Muddati yetgan mavzularni chatdagi **Xatolar ustida ishlash** tugmasidan toping.

Vazifalar, mavzu sozlamalari va boshqa ma'lumotlar brauzerning **localStorage** xotirasida qoladi. **Sozlamalar → Saqlangan ma'lumotlarni tozalash** bo'limida kerakli turini yoki Kundalikdagi hamma ma'lumotni tasdiqlab o'chiring.

### Ovozli chat

Mitticha oynasidagi mikrofon tugmasi brauzer qo'llasa o'zbekcha nutqni matnga aylantiradi; matnni yuborishdan oldin tahrirlash mumkin. Karnay tugmasi keyingi javoblarni ovoz chiqarib o'qishni yoqadi, har bir javob yonidagi karnay esa uni qayta o'qiydi. Mikrofon uchun brauzer ruxsati kerak. Ayrim brauzerlarning nutqni tanish xizmati internet talab qilishi mumkin; audio Kundalik serveriga yuborilmaydi. Ovozning mavjudligi qurilma va brauzerga bog'liq.

## 4. Lug'at va tarjima

`src/data/dictionary.ts` faylida 9 fan bo'yicha offline atamalar bor. **Tarjimon** bo'limida UZ/EN/RU til yo'nalishini tanlang, so'z qidiring, sevimlilarga saqlang yoki kartochka rejimida mashq qiling. So'zlar internet bo'lmasa ham tarjima qilinadi; gap yoki lug'atda topilmagan so'zlar uchun **ixtiyoriy** Gemini tarjimasi bor.

### Gemini tarjimasini ixtiyoriy yoqish

Bu faqat **Tarjimon** sahifasidagi onlayn zaxira tarjima uchun kerak.

1. Google AI Studio (`https://aistudio.google.com/apikey`) saytidan Gemini API kalit oling.
2. Loyiha ichidagi `kundalik` papkasida:

   ```powershell
   Copy-Item .env.example .env.local
   ```

3. `.env.local` faylini ochib, `GEMINI_API_KEY=...` qatoriga kalitni kiriting. `TRANSLATE_PROVIDER=gemini` qatorini o'zgartirmang. Kalitni React kodiga yozmang va `VITE_` bilan boshlamang.
4. Gemini tarjimasi yoki Mittichaning **Bugungi rejam** funksiyasi kerak bo'lganda ikkinchi terminal ochib:

   ```powershell
   cd kundalik
   npm run dev:api
   ```

   Birinchi terminaldagi `npm run dev` Vite sahifasini ochiq qoldiring. `.env.local` ichiga ishlatmoqchi bo'lgan xizmat kalitinigina kiriting. Tarjimon OpenAI kalitisiz ham ishlayveradi.

Providerlarni `server/providers/` ichida alohida saqladik. Hozir Gemini ulangan; DeepL va Microsoft fayllari hozircha namuna.

### Mittichaning bugungi rejasini yoqish

1. OpenAI platformasidan API kalit oling.
2. `.env.local` faylidagi `OPENAI_API_KEY` qatoriga kalitni yozing (`VITE_` qo'shmang).
3. Yuqoridagi `npm run dev:api` serverini ishga tushiring.
4. Mitticha sahifasida **Bugungi rejam** tugmasini bosing. Jadval va bajarilmagan vazifalar serverga yuborilib, JSON javobi tekshirilgandan keyin kartochkalarda ko'rsatiladi. Reja so'rovlari serverda minutiga 10 ta bilan cheklangan.
5. **Yozma ishni tekshir** ham shu serverdagi kalitdan foydalanadi. Faqat Adabiyot, Ona tili, Ingliz tili va Rus tili qo'llanadi; matn 3000 belgigacha, so'rovlar minutiga 5 ta. Mitticha insho yozib bermaydi, tahlil va tahrir maslahatlarini qaytaradi.

### Rasmdan vazifa

**Mitticha → Rasmdan vazifa** orqali JPG, PNG yoki WebP surat tanlang. Brauzerda surat 1280 px dan oshmaydigan va 700 KB gacha bo'lgan JPEG ko'rinishiga kichraytiriladi; asl surat 8 MB dan katta bo'lmasin. So'ng rasm OpenAI ko'rish modeliga server orqali yuboriladi. Bu funksiya `.env.local` dagi `OPENAI_API_KEY` va yuqorida ishga tushirilgan `npm run dev:api` serverini talab qiladi; standart `gpt-4o-mini` ko'rish modelini qo'llaydi. Bitta IP manzilidan minutiga 5 ta so'rovga ruxsat beriladi. Rasm chat tarixida yoki `localStorage` da saqlanmaydi.

## 5. Boshqa sozlamalar va tekshirish

- Dars vaqtlari: **Jadval → vaqt sozlamalari**.
- Kitob va PDF havolalari: `src/data/schedule.ts`.
- Kalendar, o'quv yili va dam olish kunlari: **Kalendar** va **Sozlamalar**.
- Kodni tekshirish va production build:

  ```powershell
  npm run lint
  npm run build
  npm start
  ```
