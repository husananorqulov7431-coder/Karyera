# ⚽️ eFootball™ 2026: Futbol Taqdiri & Maxsus Packlar Bozori

> **eFootball™ 2026** uslubidagi zamonaviy kartalar bozori, 3D kinematik walkout animatsiyasi, jamoadoshlarning stadiondagi kutib olish sahnalari, karyera rejimi, jonli o'yin simulyatori hamda avtonom **Telegram Bot** (@Futbolkarerapack_bot).

---

## 🌟 Asosiy Imkoniyatlar

1. **Maxsus Packlar Bozori (Special Packs Market):**
   - eFootball 2026 Box Draw tizimi.
   - 1x va 10x ochish opsiyalari.
   - Har bir pack uchun qolgan vaqt hisoblagichi (Countdown Timer).
   - Har 20 ta matchda g'alaba qozonib 1000 GP to'plash va 10 talik ochish imkoniyati.
   - Admin hisoblari uchun barcha packlar **0 GP (bepul)** ochiladi hamda packlarni darhol o'chirish tugmasi mavjud.

2. **3D Kinematik Cutscene & Jamoadoshlar Kutib Olish Sahnalari:**
   - Har qanday ochilgan futbolchi (Epic, Highlight yoki Standard) uchun 3D perspektivada o'z kartasini ko'tarib chiqish sahnasi.
   - Stadionda jamoadoshlarning olqishlari, projektorlar va konfetti nurlari (`sfxApplause`).
   - 10 talik ochishda esa asosiy yulduz markazda gavdalanib, yakunda barcha 10 ta o'yinchi eFootball kartalari galereyasi ko'rinishida taqdim etiladi.

3. **Haqiqiy PES / eFootball Tasodifiylik Tizimi (Odds):**
   - 👑 **Epic (89+ OVR):** 2.5% — Kamyob afsonalar!
   - ⭐ **Highlight (84-88 OVR):** 15.0% — Hafta yulduzlari!
   - ⚽️ **Standard (<84 OVR):** 82.5% — Asosiy tarkib o'yinchilari!

4. **Telegram Bot (@Futbolkarerapack_bot):**
   - Avtonom Long Polling orqali ishlaydi (`npm run bot`).
   - Foydalanuvchilarga 100 talik o'yinchilar packini tayyor `.json` fayl ko'rinishida yuboradi (`/sample`).
   - Foydalanuvchi botga `.json` fayl yuborganida, AI uni tahlil qilib nechta Epic/Highlight/Standard borligini hisoblab beradi.
   - Google Apps Script orqali 24/7 bepul serverless webhook usulida ham ishlatish mumkin.

---

## 🚀 O'rnatish va Ishga Tushirish

### 1. Bog'liqliklarni o'rnatish:
```bash
npm install
```

### 2. Veb-Ilovani ishga tushirish (Vite):
```bash
npm run dev
```
Ilova brauzerda ochiladi: `http://localhost:3000`

### 3. Telegram Botni ishga tushirish (Long Polling):
```bash
npm run bot
```
Bot `@Futbolkarerapack_bot` foydalanuvchilarning barcha buyruqlariga darhol javob berishni boshlaydi!

### 4. Loyihani ishlab chiqarishga (Production) yig'ish:
```bash
npm run build
```
Natija `dist/` papkasida yaratiladi va GitHub Pages yoki har qanday hostingga joylashtirishga tayyor bo'ladi.

---

## 📂 Loyiha Tuzilmasi

```
├── .github/workflows/deploy.yml   # GitHub Pages avtomatik deployment
├── scripts/
│   └── telegramBot.mjs            # Avtonom Telegram Bot servisi (Polling)
├── src/
│   ├── components/
│   │   ├── SpecialPacksMarket.tsx # Maxsus packlar bozori
│   │   ├── PackOpeningCutscene.tsx# 3D Walkout, ko'tarish va kutib olish sahnasi
│   │   ├── TelegramBotManager.tsx # Bot va AI boshqaruv markazi
│   │   ├── AdminPackManager.tsx   # Maxsus pack yaratuvchi admin paneli
│   │   ├── MatchSimulator.tsx     # Jonli 2D match simulyatori
│   │   ├── GoogleAuthModal.tsx    # Kirish va admin autentifikatsiyasi
│   │   └── ...
│   ├── data/                      # 100 talik packlar va futbolchilar bazasi
│   ├── utils/                     # Tovush effektlari (sfxSpendCoins, sfxApplause, h.k.)
│   ├── App.tsx                    # Asosiy boshqaruvchi komponent
│   └── types.ts                   # TypeScript tiplar
├── package.json
└── README.md
```

---

## 🔑 Admin Hisoblari
Quyidagi elektron pochtalar orqali tizimga kirilganda Admin maqomi beriladi va barcha packlar bepul ochiladi:
- `husananorqulov7431@gmail.com`
- `geminiai7431@gmail.com`
