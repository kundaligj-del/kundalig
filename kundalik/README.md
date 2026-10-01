# Kundalik

O'quvchilar uchun dars jadvali, uy vazifalari, darsliklar va Mitticha yordamchisi.

## Ishga tushirish

Loyiha papkasida terminal ochib, quyidagilarni bajaring:

```bash
npm install
npm run dev
```

Brauzerda `http://localhost:3000` manzilini oching.

## Mitticha AI kalitini xavfsiz sozlash

1. [platform.openai.com](https://platform.openai.com/) saytida API kalit yarating.
2. `kundalik` papkasidagi `.env.example` faylidan nusxa olib, `.env.local` nomi bilan saqlang.
   PowerShell buyrug'i:

   ```powershell
   Copy-Item .env.example .env.local
   ```

3. `.env.local` ichiga kalit va modelni kiriting:

   ```env
   OPENAI_API_KEY=bu-yerga-haqiqiy-kalitingiz
   OPENAI_MODEL=gpt-4o-mini
   ```

4. Saqlangach, `npm run dev` serverini to'xtatib qayta ishga tushiring.

`OPENAI_API_KEY` frontend kodiga yozilmaydi va `VITE_` bilan boshlanmaydi. Next.js uni faqat serverdagi `src/app/api/chat/route.ts` endpointida ishlatadi. `.env.local` Git'ga qo'shilmaydi; kalitni hech kimga yubormang.

## Darslik va PDF havolalari

Fanlarning `darslikUrl` va `pdfUrl` manzillari `src/data/schedule.ts` faylida. Har bir fanning havolasini shu yerdan alohida almashtiring.
