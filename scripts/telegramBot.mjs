// eFootball™ 2026 - Avtonom Telegram Bot Servisi
// Ishga tushirish: npm run bot (yoki node scripts/telegramBot.mjs)

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8747293611:AAHeCI1LrGQgrajvpkG2aganLSUhvUEBA64';
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;
export const PRIMARY_ADMIN_CHAT_ID = '6130389200';

console.log('----------------------------------------------------');
console.log('⚽️ eFootball™ 2026 Telegram Bot ishga tushirilmoqda...');
console.log(`🤖 Bot Token: ${BOT_TOKEN.substring(0, 15)}...`);
console.log(`👑 Bosh Admin ID: ${PRIMARY_ADMIN_CHAT_ID}`);
console.log('----------------------------------------------------');

// Helper to call Telegram Bot API with timeout to prevent hanging
async function callTelegram(method, params = {}, timeoutMs = 25000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${TELEGRAM_API}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
      signal: controller.signal
    });
    clearTimeout(timer);
    const json = await res.json();
    return json;
  } catch (err) {
    clearTimeout(timer);
    const isAbort = err.name === 'AbortError';
    console.error(`Telegram API xatolik (${method}):`, isAbort ? 'So‘rov vaqti tugadi (Timeout)' : err.message);
    return null;
  }
}

// Send Document to Telegram Chat with timeout
async function sendDocument(chatId, filename, fileContent, caption = '') {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  try {
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    let body = '';
    
    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="chat_id"\r\n\r\n${chatId}\r\n`;

    if (caption) {
      body += `--${boundary}\r\n`;
      body += `Content-Disposition: form-data; name="caption"\r\n\r\n${caption}\r\n`;
    }

    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="document"; filename="${filename}"\r\n`;
    body += `Content-Type: application/json\r\n\r\n`;
    body += fileContent + `\r\n`;
    body += `--${boundary}--\r\n`;

    const res = await fetch(`${TELEGRAM_API}/sendDocument`, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      },
      body: body,
      signal: controller.signal
    });
    clearTimeout(timer);
    return await res.json();
  } catch (err) {
    clearTimeout(timer);
    console.error('sendDocument xatosi:', err.message);
    return null;
  }
}

// Helper to load live packs dynamically from sync file without ghost packs
function getLivePacks() {
  const LIVE_PACKS_FILE = path.join('/tmp', 'efootball_live_packs.json');
  try {
    if (fs.existsSync(LIVE_PACKS_FILE)) {
      const content = fs.readFileSync(LIVE_PACKS_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('getLivePacks o‘qishda xatolik:', err.message);
  }
  return [];
}

// User Profiles Database Persistence (/tmp and src/data fallback)
const PROFILES_FILE = path.join('/tmp', 'efootball_user_profiles.json');
const BACKUP_PROFILES_FILE = path.join(__dirname, '../src/data/profiles.json');

function getProfiles() {
  try {
    if (fs.existsSync(PROFILES_FILE)) {
      const content = fs.readFileSync(PROFILES_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed;
    } else if (fs.existsSync(BACKUP_PROFILES_FILE)) {
      const content = fs.readFileSync(BACKUP_PROFILES_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        try { fs.writeFileSync(PROFILES_FILE, JSON.stringify(parsed, null, 2), 'utf-8'); } catch {}
        return parsed;
      }
    }
  } catch (err) {
    console.warn('getProfiles o‘qishda xatolik:', err.message);
  }
  return [];
}

function saveProfiles(profiles) {
  try {
    fs.writeFileSync(PROFILES_FILE, JSON.stringify(profiles, null, 2), 'utf-8');
    try {
      fs.writeFileSync(BACKUP_PROFILES_FILE, JSON.stringify(profiles, null, 2), 'utf-8');
    } catch {}
  } catch (err) {
    console.error('saveProfiles yozishda xatolik:', err.message);
  }
}

function getOrCreateProfile(chatId, firstName, lastName, username) {
  const profiles = getProfiles();
  const strChatId = String(chatId).trim();
  let user = profiles.find(p => String(p.telegramId).trim() === strChatId);

  if (!user) {
    const isLeadAdmin = strChatId === PRIMARY_ADMIN_CHAT_ID;
    const initialPassword = isLeadAdmin
      ? 'ANORQULOV_7431'
      : 'EF-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    user = {
      managerId: `EF-${strChatId}`,
      telegramId: strChatId,
      displayName: [firstName, lastName].filter(Boolean).join(' ') || (username ? `@${username}` : 'eFootball Menejer'),
      password: initialPassword,
      gp: isLeadAdmin ? 9999999 : 1000,
      eCoins: isLeadAdmin ? 50000 : 100,
      isAdmin: isLeadAdmin,
      createdAt: Date.now(),
      matchesPlayed: 0,
      matchesWon: 0
    };
    profiles.push(user);
    saveProfiles(profiles);
  }
  return user;
}

// User state tracking for password changes
const pendingPasswordChanges = new Map();

// Generate comprehensive live statistics message
function getStatisticsReportMessage() {
  const packs = getLivePacks();
  const allPlayers = packs.flatMap(p => p.players || []);
  const epics = allPlayers.filter(p => (p.ovr || 0) >= 89);
  const highlights = allPlayers.filter(p => (p.ovr || 0) >= 84 && (p.ovr || 0) < 89);
  const standards = allPlayers.filter(p => (p.ovr || 0) < 84);

  const fwCount = allPlayers.filter(p => ['CF', 'SS', 'LWF', 'RWF'].includes(p.role || '')).length;
  const mfCount = allPlayers.filter(p => ['AMF', 'CMF', 'DMF', 'LMF', 'RMF'].includes(p.role || '')).length;
  const dfCount = allPlayers.filter(p => ['CB', 'LB', 'RB'].includes(p.role || '')).length;
  const gkCount = allPlayers.filter(p => (p.role || '') === 'GK').length;

  const sortedTopPlayers = [...allPlayers].sort((a, b) => (b.ovr || 0) - (a.ovr || 0)).slice(0, 5);
  const avgOvr = allPlayers.length ? Math.round(allPlayers.reduce((acc, p) => acc + (p.ovr || 0), 0) / allPlayers.length) : 0;

  return `📊 <b>eFootball™ 2026 Jonli Statistika & Tahlil:</b>
━━━━━━━━━━━━━━━━━━━━
📦 <b>Packlar & Bozor Holati:</b>
• Faol Packlar: <b>${packs.length} ta</b>
• Jami Futbolchilar: <b>${allPlayers.length} ta</b>
• O‘rtacha Reyting (Avg OVR): <b>${avgOvr > 0 ? avgOvr : '—'}</b>

👑 <b>Kartalar Kategoriyasi Bo‘yicha:</b>
• 👑 Epic Afsonalar (89+ OVR): <b>${epics.length} ta</b>
• ⭐ Highlight Yulduzlar (84-88): <b>${highlights.length} ta</b>
• ⚽ Standard O‘yinchilar (&lt;84): <b>${standards.length} ta</b>

🎯 <b>Maydon Pozitsiyalari Taqsimoti:</b>
• ⚡ Hujumchilar (FW): <b>${fwCount} ta</b>
• 🎯 Yarim himoya (MF): <b>${mfCount} ta</b>
• 🛡 Himoyachilar (DF): <b>${dfCount} ta</b>
• 🧤 Darvozabonlar (GK): <b>${gkCount} ta</b>

${sortedTopPlayers.length > 0 ? `🔥 <b>Eng Kuchli Reytingli Futbolchilar:</b>
${sortedTopPlayers.map((p, i) => `${i + 1}. <b>${p.name}</b> (${p.role}) — <b>${p.ovr} OVR</b> [${p.club || 'Klub'}]`).join('\n')}
` : `ℹ️ <i>Hozirda o‘yinda faol packlar mavjud emas (tozalangan).</i>
`}
━━━━━━━━━━━━━━━━━━━━
💰 <b>PES Box Draw & Iqtisodiyot:</b>
• 1 ta o‘yinda g‘alaba = <b>+50 GP</b>
• 10 talik ochish = <b>1000 GP</b> (20 ta o‘yin yutish kerak)
• Har bir packda = <b>10 ta Bepul (Free) imkoniyat</b>
• Omad mexanikasi: Har bir aylantirishda qutidagi koptoklar kamayadi (PES Box Draw)

🟢 <b>Bot Servis Holati:</b>
• Bot Rejimi: <b>100% 24/7 Uzluksiz (Watchdog faol)</b>
• Qayta ishlangan so‘rovlar: <b>${updatesHandledCount} ta</b>
• Bosh Admin ID: <code>${PRIMARY_ADMIN_CHAT_ID}</code>`;
}

// Generate dynamic pack overview message based ONLY on live synced packs
function getPacksSummaryMessage() {
  const packs = getLivePacks();
  if (packs.length === 0) {
    return `🏆 <b>eFootball™ 2026 Packlar Bozori:</b>

ℹ️ <b>Hozirda o‘yinda hech qanday pack mavjud emas.</b>
Barcha eski default packlar talabingizga binoan tozalandi.

👑 <b>Yangi Pack va Epiclar Qo‘shish:</b>
Web ilovaning Packlar bo‘limida <b>"Epic Studio"</b> yoki <b>"Pack Manager"</b> orqali yangi Epic afsonalar va 100 talik packlar yarating. Ular saqlangach, botda darhol yangi ma'lumotlar bilan aks etadi!`;
  }

  let msg = `🏆 <b>eFootball™ 2026 Faol Maxsus Packlar (${packs.length} ta):</b>\n\n`;
  packs.forEach((p, idx) => {
    const list = p.players || [];
    const epics = list.filter(item => (item.ovr || 0) >= 89);
    const totalPool = p.totalPoolCount || list.length || 100;
    const remaining = Math.max(0, totalPool - (p.pulledCount || 0));

    msg += `${idx + 1}. 👑 <b>${p.name}</b> (${p.badge || 'PACK'})\n`;
    msg += `• Jami futbolchilar: <b>${list.length} ta</b> (Qutida qolgan: <b>${remaining}/${totalPool}</b>)\n`;
    msg += `• Epic afsonalar (89+): <b>${epics.length} ta</b>\n`;
    if (epics.length > 0) {
      msg += `• Yulduzlar: <i>${epics.slice(0, 4).map(e => `${e.name} (${e.ovr})`).join(', ')}</i>\n`;
    }
    msg += `• Narx: 1x = <b>${p.costPer1 || 100} GP</b> | 10x = <b>${p.costPer10 || 1000} GP</b>\n\n`;
  });

  msg += `💡 <i>O‘yin ilovasida packlarni aylantirib yulduzlarni qo‘lga kiritishingiz mumkin!</i>`;
  return msg;
}

// 100 O'yinchili Namuna JSON Generator
function generateSample100Pack() {
  const positions = ['CF', 'SS', 'LWF', 'RWF', 'AMF', 'CMF', 'DMF', 'LB', 'CB', 'RB', 'GK'];
  const clubs = ['Real Madrid', 'FC Barcelona', 'Manchester City', 'Bayern Munich', 'Arsenal', 'PSG', 'Inter Milan', 'Juventus', 'Liverpool'];

  const legendNames = [
    { name: 'Lionel Messi', ovr: 104, role: 'RWF', club: 'FC Barcelona', photo: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500&q=80' },
    { name: 'Cristiano Ronaldo', ovr: 103, role: 'CF', club: 'Real Madrid', photo: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500&q=80' },
    { name: 'Zinedine Zidane', ovr: 101, role: 'AMF', club: 'Real Madrid', photo: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=500&q=80' },
    { name: 'Ronaldinho Gaucho', ovr: 100, role: 'LWF', club: 'FC Barcelona', photo: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=500&q=80' },
    { name: 'Paolo Maldini', ovr: 99, role: 'CB', club: 'AC Milan', photo: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=500&q=80' },
    { name: 'Kylian Mbappe', ovr: 98, role: 'CF', club: 'Real Madrid', photo: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=500&q=80' },
    { name: 'Erling Haaland', ovr: 97, role: 'CF', club: 'Manchester City', photo: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=500&q=80' },
    { name: 'Kevin De Bruyne', ovr: 96, role: 'AMF', club: 'Manchester City', photo: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500&q=80' },
    { name: 'Thibaut Courtois', ovr: 94, role: 'GK', club: 'Real Madrid', photo: 'https://images.unsplash.com/photo-1526676037777-05a232554f77?w=500&q=80' },
    { name: 'Jude Bellingham', ovr: 95, role: 'AMF', club: 'Real Madrid', photo: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=500&q=80' },
    { name: 'Rodri Hernandez', ovr: 94, role: 'DMF', club: 'Manchester City', photo: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=500&q=80' },
    { name: 'Vinicius Jr', ovr: 95, role: 'LWF', club: 'Real Madrid', photo: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=500&q=80' }
  ];

  const players = [];

  // Add 12 Top Stars
  legendNames.forEach((l, idx) => {
    players.push({
      id: `p_star_${idx + 1}`,
      name: l.name,
      ovr: l.ovr,
      role: l.role,
      country: 'World Elite',
      club: l.club,
      photoUrl: l.photo,
      stats: { pace: l.ovr - 5, shooting: l.ovr - 8, passing: l.ovr - 6, dribbling: l.ovr - 4, defending: 65, physical: 80 }
    });
  });

  // Generate Remaining 88 Players (OVR 70 to 88)
  for (let i = 13; i <= 100; i++) {
    const role = positions[i % positions.length];
    const club = clubs[i % clubs.length];
    const isHighlight = i <= 28; // 16 highlight players
    const ovr = isHighlight ? 84 + (i % 5) : 70 + (i % 14);

    players.push({
      id: `p_gen_${i}`,
      name: `Futbolchi ${i}`,
      ovr: ovr,
      role: role,
      country: 'International',
      club: club,
      photoUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500&q=80',
      stats: { pace: ovr - 10, shooting: ovr - 12, passing: ovr - 10, dribbling: ovr - 8, defending: 60, physical: 70 }
    });
  }

  return {
    name: "100 Stars Mega Box Draw",
    description: "eFootball 2026 uslubidagi 100 ta jahon darajasidagi futbolchilar ro'yxati",
    category: "epic_box",
    badgeLabel: "100 STARS",
    totalPoolCount: 100,
    costPer1: 100,
    costPer10: 1000,
    freePullsRemaining: 3,
    bannerUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1000&q=80",
    expiresInDays: 7,
    players: players
  };
}

// Bot Main Menu Message
function getStartMessage(firstName, chatId, fromObj = {}) {
  const isAdmin = String(chatId).trim() === PRIMARY_ADMIN_CHAT_ID;
  if (isAdmin) {
    return `👑 Assalomu alaykum, <b>Bosh Admin</b>!
🆔 Sizning Telegram ID: <code>${PRIMARY_ADMIN_CHAT_ID}</code> (Tasdiqlangan Bosh Administrator)

🎮 <b>eFootball™ 2026 Admin & Pack Market Bot</b> tizimiga xush kelibsiz!
Web ilovada Google hisobingiz bilan kirib, <b>"Admin Kirish Tasdiq Kodi"</b> tugmasi orqali istalgan paytda yangi 2FA kod olishingiz va packlarni sinxronlashingiz mumkin.

Boshqaruv menyusidan kerakli amalni tanlang:`;
  }

  const profile = getOrCreateProfile(
    chatId,
    fromObj.first_name || firstName,
    fromObj.last_name,
    fromObj.username
  );

  return `👋 Assalomu alaykum, <b>${profile.displayName}</b>!

🎮 <b>eFootball™ 2026 O'yinchi & Packlar Boti</b>

🎉 <b>Sizning Menejer Profilingiz:</b>
━━━━━━━━━━━━━━━━━━━━
🆔 <b>Menejer ID:</b> <code>${profile.managerId}</code>
🔑 <b>Bir Martalik / Joriy Parol:</b> <code>${profile.password}</code>
💰 <b>GP Balans:</b> <b>${profile.gp.toLocaleString()} GP</b>
🪙 <b>eCoin:</b> <b>${profile.eCoins}</b>
━━━━━━━━━━━━━━━━━━━━
🌐 <b>Veb Ilovada Profilga Kirish:</b>
1. Veb ilovada <b>"Telegram Profil bilan Kirish"</b> tugmasini bosing.
2. Menejer ID: <code>${profile.managerId}</code>
3. Parol: <code>${profile.password}</code> ni kiriting!

🔒 <i>Xavfsizlik uchun parolingizni istalgan payt pastdagi <b>"🔑 Parolni O'zgartirish"</b> tugmasi orqali almashtirishingiz mumkin.</i>`;
}

// Admin Native Keyboard (Faqat Bosh Admin uchun)
const ADMIN_KEYBOARD = {
  keyboard: [
    [
      { text: "📊 Jonli Statistika" },
      { text: "🏆 Mavjud Packlar" }
    ],
    [
      { text: "📦 100 O'yinchili Pack JSON" },
      { text: "🔐 Admin Kirish Tasdiq Kodi" }
    ],
    [
      { text: "🔄 Packlarni Sinxronlash" },
      { text: "ℹ️ Qo'llanma & Yordam" }
    ]
  ],
  resize_keyboard: true,
  is_persistent: true
};

// User Native Keyboard (Oddiy foydalanuvchilar uchun xavfsiz profil menyusi - Admin opsiyalari yo'q)
const USER_KEYBOARD = {
  keyboard: [
    [
      { text: "👤 Mening Profilim" },
      { text: "🔑 Parolni O'zgartirish" }
    ],
    [
      { text: "🏆 Mavjud Packlar" },
      { text: "📊 Jonli Statistika" }
    ],
    [
      { text: "🌐 Ilovaga Kirish" },
      { text: "ℹ️ Qo'llanma & Yordam" }
    ]
  ],
  resize_keyboard: true,
  is_persistent: true
};

// Handle Incoming Updates
async function handleUpdate(update) {
  // Callback Query (Button click for any older inline messages)
  if (update.callback_query) {
    const cb = update.callback_query;
    const chatId = cb.message.chat.id;
    const data = cb.data;
    const isAdmin = String(chatId).trim() === PRIMARY_ADMIN_CHAT_ID;
    const currentKeyboard = isAdmin ? ADMIN_KEYBOARD : USER_KEYBOARD;

    await callTelegram('answerCallbackQuery', { callback_query_id: cb.id });

    if (data === 'btn_admin_code') {
      if (!isAdmin) {
        await callTelegram('sendMessage', {
          chat_id: chatId,
          text: `⛔️ <b>Ruxsat berilmadi!</b>\n\nSizning hisobingiz (ID: <code>${chatId}</code>) oddiy foydalanuvchi hisoblanadi.\nAdmin tasdiq kodi faqat Bosh Admin uchun beriladi.\n\nIltimos, <b>Admin bilan bog'laning</b>.`,
          parse_mode: 'HTML',
          reply_markup: USER_KEYBOARD
        });
        return;
      }
      const now = new Date();
      const dynamicHourCode = (743100 + ((now.getUTCDate() * 31 + now.getUTCHours() * 17) % 900)).toString();
      await callTelegram('sendMessage', {
        chat_id: chatId,
        text: `🔐 <b>eFootball 2026 Admin Kirish Tasdiq Kodi:</b>\n\n<code>${dynamicHourCode}</code>\n\n⏱ Ushbu kod 1 soat amal qiladi.\n💡 Web ilovada Google hisobingiz bilan kirgach, ushbu kodni <b>Admin Tasdiqlash</b> maydoniga kiriting. Begonalarga bermang!`,
        parse_mode: 'HTML',
        reply_markup: ADMIN_KEYBOARD
      });
    } else if (data === 'btn_sample_json') {
      if (!isAdmin) {
        await callTelegram('sendMessage', {
          chat_id: chatId,
          text: `⛔️ <b>Ruxsat berilmadi!</b>\n\nPack fayllari faqat Bosh Admin uchun mavjud.\n\nIltimos, <b>Admin bilan bog'laning</b>.`,
          parse_mode: 'HTML',
          reply_markup: USER_KEYBOARD
        });
        return;
      }
      const sample = generateSample100Pack();
      const jsonStr = JSON.stringify(sample, null, 2);
      await sendDocument(
        chatId,
        '100_stars_mega_pack.json',
        jsonStr,
        '✅ <b>100 O\'yinchili Mega Pack</b> tayyor!\n\nUshbu faylni eFootball Veb-Ilovasining "Telegram Bot & AI Hub" bo\'limiga yuklab darhol o\'yinda 100 talik pack yaratishingiz mumkin.'
      );
    } else if (data === 'btn_odds') {
      const text = `🎯 <b>eFootball™ 2026 Yangilangan Haqiqiy Omad Tizimi:</b>

🎲 <b>Haqiqiy Baraban (PES Box Draw):</b> Qutidagi barcha o'yinchilar teng taqsimlangan va har bir aylantirishda qutidagi o'yinchi soni kamayadi!
🔥 <b>Omadli Chaqnash (Lucky Strike):</b> Har bir aylantirishda, hatto 1 ta Bepul (Free) spin bilan ham omad kelib 89+ Epic afsona (Messi, Terry, Cahill) ilinib qolish imkoniyati mavjud!
👑 <b>Admin Imtiyozi:</b> Adminlar uchun barcha packlar 0 GP (mutlaqo bepul ochiladi)!`;
      await callTelegram('sendMessage', {
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
        reply_markup: currentKeyboard
      });
    } else if (data === 'btn_packs') {
      const text = getPacksSummaryMessage();
      await callTelegram('sendMessage', {
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
        reply_markup: currentKeyboard
      });
    } else if (data === 'btn_stats') {
      const text = getStatisticsReportMessage();
      await callTelegram('sendMessage', {
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
        reply_markup: currentKeyboard
      });
    } else if (data === 'btn_help') {
      if (isAdmin) {
        const text = `📖 <b>Admin Foydalanish Qo'llanmasi:</b>

1. Pastdagi <b>📦 100 O'yinchili Pack JSON</b> tugmasini bosing — bot sizga 100 talik to'liq JSON faylni yuboradi.
2. Veb-ilovaga o'ting (https://husananorqulov7431-coder.github.io/Karyera/).
3. <b>Telegram Bot & AI Hub</b> bo'limida JSON faylni yuklang yoki matnini joylang.
4. Agar eski packlar qolib ketgan bo'lsa, <b>🔄 Packlarni Sinxronlash</b> orqali tiklang!`;
        await callTelegram('sendMessage', {
          chat_id: chatId,
          text: text,
          parse_mode: 'HTML',
          reply_markup: ADMIN_KEYBOARD
        });
      } else {
        const text = `📖 <b>Qo'llanma & Yordam:</b>

• <b>🏆 Mavjud Packlar</b> — O'yindagi 4 ta rasmiy maxsus packlar tarkibini ko'rish.
• <b>📊 Ehtimolliklar (Odds)</b> — Haqiqiy baraban va yutuq mexanikasi.
• <b>👨‍💻 Admin bilan bog'lanish</b> — Savol va takliflar uchun admin aloqasi.

💡 Packlarni tiklash yoki qo'shimcha imkoniyatlar uchun <b>Admin bilan bog'laning</b>.`;
        await callTelegram('sendMessage', {
          chat_id: chatId,
          text: text,
          parse_mode: 'HTML',
          reply_markup: USER_KEYBOARD
        });
      }
    }
    return;
  }

  // Regular Text Message & Keyboard button clicks
  if (update.message) {
    const msg = update.message;
    const chatId = msg.chat.id;
    const text = (msg.text || '').trim();
    const cleanText = text.toLowerCase();
    const isAdmin = String(chatId).trim() === PRIMARY_ADMIN_CHAT_ID;
    const currentKeyboard = isAdmin ? ADMIN_KEYBOARD : USER_KEYBOARD;

    // Document (JSON file uploaded by user)
    if (msg.document) {
      if (!isAdmin) {
        await callTelegram('sendMessage', {
          chat_id: chatId,
          text: `⛔️ <b>Ruxsat berilmadi!</b>\n\nFayl orqali pack yaratish yoki tahlil qilish faqat tasdiqlangan Bosh Admin uchun ruxsat etilgan.\n\nIltimos, <b>Admin bilan bog'laning</b>.`,
          parse_mode: 'HTML',
          reply_markup: USER_KEYBOARD
        });
        return;
      }
      const doc = msg.document;
      if (doc.file_name && doc.file_name.endsWith('.json')) {
        await callTelegram('sendMessage', {
          chat_id: chatId,
          text: `🔍 <code>${doc.file_name}</code> fayli qabul qilindi. AI tahlil qilmoqda...`,
          parse_mode: 'HTML'
        });

        // Get file download link
        const fileInfo = await callTelegram('getFile', { file_id: doc.file_id });
        if (fileInfo && fileInfo.result && fileInfo.result.file_path) {
          const downloadUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${fileInfo.result.file_path}`;
          try {
            const rawFile = await fetch(downloadUrl).then(r => r.json());
            const players = Array.isArray(rawFile.players) ? rawFile.players : [];
            const epics = players.filter(p => (p.ovr || 0) >= 89);
            const highlights = players.filter(p => (p.ovr || 0) >= 84 && (p.ovr || 0) < 89);
            const standards = players.filter(p => (p.ovr || 0) < 84);

            const report = `✅ <b>AI Tahlil Muvaffaqiyatli Yakunlandi!</b>

📦 <b>Pack Nomi:</b> ${rawFile.name || 'Maxsus Pack'}
👥 <b>Jami O'yinchilar:</b> ${players.length} ta
👑 <b>Epic O'yinchilar (89+):</b> ${epics.length} ta
⭐ <b>Highlight O'yinchilar (84-88):</b> ${highlights.length} ta
⚽️ <b>Standard O'yinchilar (&lt;84):</b> ${standards.length} ta

Ushbu faylni to'g'ridan-to'g'ri o'yin ilovasida ishlatishingiz mumkin!`;
            await callTelegram('sendMessage', {
              chat_id: chatId,
              text: report,
              parse_mode: 'HTML',
              reply_markup: ADMIN_KEYBOARD
            });
            return;
          } catch {
            await callTelegram('sendMessage', {
              chat_id: chatId,
              text: '⚠️ JSON fayl formati noto\'g\'ri yoki o\'qib bo\'lmadi. Qaytadan tekshirib ko\'ring.',
              reply_markup: ADMIN_KEYBOARD
            });
            return;
          }
        }
      }
    }

    // Check if user is currently in password change mode
    if (pendingPasswordChanges.get(chatId)) {
      if (cleanText === '/cancel' || cleanText === 'bekor qilish' || cleanText === 'bekor') {
        pendingPasswordChanges.delete(chatId);
        await callTelegram('sendMessage', {
          chat_id: chatId,
          text: `❌ Parolni o'zgartirish bekor qilindi. Boshqaruv menyusidan davom etishingiz mumkin:`,
          parse_mode: 'HTML',
          reply_markup: currentKeyboard
        });
        return;
      }

      if (text.length < 4) {
        await callTelegram('sendMessage', {
          chat_id: chatId,
          text: `⚠️ Parol kamida 4 ta belgidan iborat bo'lishi kerak.\n\nIltimos, yangi parolingizni qaytadan yozing (yoki bekor qilish uchun /cancel deb yozing):`,
          parse_mode: 'HTML'
        });
        return;
      }

      const profiles = getProfiles();
      const strChatId = String(chatId).trim();
      let user = profiles.find(p => String(p.telegramId).trim() === strChatId);
      if (!user) {
        user = getOrCreateProfile(chatId, msg.from?.first_name, msg.from?.last_name, msg.from?.username);
      }
      user.password = text;
      user.updatedAt = Date.now();
      saveProfiles(profiles);
      pendingPasswordChanges.delete(chatId);

      await callTelegram('sendMessage', {
        chat_id: chatId,
        text: `✅ <b>Parolingiz muvaffaqiyatli o'zgartirildi!</b>\n\n🆔 <b>Menejer ID:</b> <code>${user.managerId}</code>\n🔑 <b>Yangi Parolingiz:</b> <code>${text}</code>\n\n💡 Endi ushbu yangi parol bilan Veb-ilovaga (https://husananorqulov7431-coder.github.io/Karyera/) kirishingiz mumkin!`,
        parse_mode: 'HTML',
        reply_markup: currentKeyboard
      });
      return;
    }

    if (text.startsWith('/start') || cleanText === 'start') {
      const firstName = msg.from ? msg.from.first_name : '';
      await callTelegram('sendMessage', {
        chat_id: chatId,
        text: getStartMessage(firstName, chatId, msg.from || {}),
        parse_mode: 'HTML',
        reply_markup: currentKeyboard
      });
    } else if (text.includes('Mening Profilim') || text.includes('Profil') || cleanText === '/profile' || cleanText === 'profil') {
      const profile = getOrCreateProfile(chatId, msg.from?.first_name, msg.from?.last_name, msg.from?.username);
      await callTelegram('sendMessage', {
        chat_id: chatId,
        text: `👤 <b>eFootball™ 2026 Menejer Profilingiz:</b>
━━━━━━━━━━━━━━━━━━━━
🆔 <b>Menejer ID:</b> <code>${profile.managerId}</code>
👤 <b>Menejer:</b> <b>${profile.displayName}</b>
🔑 <b>Joriy Parol:</b> <code>${profile.password}</code>
💰 <b>GP Balans:</b> <b>${profile.gp.toLocaleString()} GP</b>
🪙 <b>eCoin:</b> <b>${profile.eCoins}</b>
🏆 <b>O'yinlar:</b> <b>${profile.matchesPlayed || 0} ta</b> (G'alaba: <b>${profile.matchesWon || 0}</b>)
📅 <b>Ro'yxatdan o'tilgan:</b> ${new Date(profile.createdAt).toLocaleDateString()}
━━━━━━━━━━━━━━━━━━━━
🌐 <b>Veb-Ilovaga Kirish:</b>
Web ilovada (https://husananorqulov7431-coder.github.io/Karyera/) <b>"Telegram Profil bilan Kirish"</b> orqali profilingizga kiring.

💡 <i>Parolni almashtirish uchun pastdagi <b>"🔑 Parolni O'zgartirish"</b> tugmasini bosing.</i>`,
        parse_mode: 'HTML',
        reply_markup: currentKeyboard
      });
    } else if (text.includes('Parolni') || text.includes('parol') || cleanText === '/changepassword') {
      pendingPasswordChanges.set(chatId, true);
      await callTelegram('sendMessage', {
        chat_id: chatId,
        text: `🔑 <b>Yangi Parol O'rnatish:</b>\n\nIltimos, o'zingiz istagan yangi parolingizni ushbu chatga xabar sifatida yozib yuboring (kamida 4 ta belgi).\n\n<i>Bekor qilish uchun /cancel deb yozing.</i>`,
        parse_mode: 'HTML'
      });
    } else if (text.includes('Ilovaga Kirish') || cleanText === '/app' || cleanText === 'ilova') {
      const profile = getOrCreateProfile(chatId, msg.from?.first_name, msg.from?.last_name, msg.from?.username);
      await callTelegram('sendMessage', {
        chat_id: chatId,
        text: `🌐 <b>eFootball™ 2026 Rasmiy O'yin Veb-Ilovasi:</b>

🔗 <b>Havola:</b> https://husananorqulov7431-coder.github.io/Karyera/

📋 <b>Kirish Ma'lumotlaringiz:</b>
• 🆔 <b>Menejer ID:</b> <code>${profile.managerId}</code>
• 🔑 <b>Parolingiz:</b> <code>${profile.password}</code>

💡 Saytga kirib, <b>"Telegram Profil bilan Kirish"</b> bo'limida ushbu ID va parolni kiriting!`,
        parse_mode: 'HTML',
        reply_markup: currentKeyboard
      });
    } else if (text.includes("100 O'yinchili") || text.includes('100 talik') || cleanText === '/sample' || cleanText === 'sample') {
      if (!isAdmin) {
        await callTelegram('sendMessage', {
          chat_id: chatId,
          text: `⛔️ <b>Ruxsat berilmadi!</b>\n\nSizning hisobingiz (ID: <code>${chatId}</code>) oddiy foydalanuvchi hisoblanadi.\n100 talik pack fayllari faqat Bosh Admin uchun taqdim etiladi.\n\nIltimos, <b>Admin bilan bog'laning</b>.`,
          parse_mode: 'HTML',
          reply_markup: USER_KEYBOARD
        });
        return;
      }
      const sample = generateSample100Pack();
      const jsonStr = JSON.stringify(sample, null, 2);
      await sendDocument(
        chatId,
        '100_stars_mega_pack.json',
        jsonStr,
        '✅ <b>100 O\'yinchili Mega Pack</b> JSON fayli tayyor!\n\nUshbu faylni eFootball Veb-ilovasida "Telegram Bot & AI Hub" bo\'limiga joylashtiring.'
      );
    } else if (text.includes('Admin Kirish') || text.includes('tasdiq') || text.includes('admin') || text.includes('kod') || cleanText === '/tasdiq' || cleanText === '/admin') {
      if (!isAdmin) {
        await callTelegram('sendMessage', {
          chat_id: chatId,
          text: `⛔️ <b>Ruxsat berilmadi!</b>\n\nSizning hisobingiz (ID: <code>${chatId}</code>) oddiy foydalanuvchi hisoblanadi.\nAdmin tasdiqlash kodi faqat tasdiqlangan Bosh Admin uchun beriladi.\n\nIltimos, <b>Admin bilan bog'laning</b>.`,
          parse_mode: 'HTML',
          reply_markup: USER_KEYBOARD
        });
        return;
      }
      // Dinamik xavfsiz tasdiqlash kodi (Faqat Bosh Admin ID uchun)
      const now = new Date();
      const dynamicHourCode = (743100 + ((now.getUTCDate() * 31 + now.getUTCHours() * 17) % 900)).toString();
      await callTelegram('sendMessage', {
        chat_id: chatId,
        text: `🔐 <b>eFootball 2026 Admin Kirish Tasdiq Kodi:</b>\n\n<code>${dynamicHourCode}</code>\n\n⏱ Ushbu kod 1 soat davomida amal qiladi.\n💡 Web ilovada Google hisobingiz bilan kirgach, ushbu kodni <b>Admin Tasdiqlash</b> maydoniga kiriting. Begonalarga bermang!`,
        parse_mode: 'HTML',
        reply_markup: ADMIN_KEYBOARD
      });
    } else if (text.includes('Statistika') || text.includes('stat') || cleanText === '/stats' || cleanText === 'stats') {
      const statsMessage = getStatisticsReportMessage();
      await callTelegram('sendMessage', {
        chat_id: chatId,
        text: statsMessage,
        parse_mode: 'HTML',
        reply_markup: currentKeyboard
      });
    } else if (text.includes('Mavjud Packlar') || text.includes('packlar') || cleanText === '/packs') {
      const packMessage = getPacksSummaryMessage();
      await callTelegram('sendMessage', {
        chat_id: chatId,
        text: packMessage,
        parse_mode: 'HTML',
        reply_markup: currentKeyboard
      });
    } else if (text.includes('Ehtimolliklar') || text.includes('odds') || cleanText === '/odds') {
      await callTelegram('sendMessage', {
        chat_id: chatId,
        text: `🎯 <b>eFootball™ 2026 Haqiqiy Omad & Box Draw Tizimi:</b>

🎲 <b>Haqiqiy Baraban (PES Box Draw):</b>
Har bir aylantirishda qutidagi haqiqiy koptoklar soni kamayadi. Agar 100 talik qutidan 10 ta ochsangiz, keyingi safar qutida 90 ta o'yinchi qoladi.

🔥 <b>Omadli Chaqnash (Lucky Strike):</b>
Hech qanday sun'iy to'siq yo'q! Bitta Free (bepul) aylantirishda ham omad kelib 89+ Epic yulduz chiqish imkoniyati to'liq mavjud!

👑 <b>Adminlar uchun:</b> Barcha packlar 0 GP (bepul va cheksiz)!`,
        parse_mode: 'HTML',
        reply_markup: currentKeyboard
      });
    } else if (text.includes('Sinxronlash') || text.includes('tiklash') || text.includes('sync') || cleanText === '/sync') {
      if (!isAdmin) {
        await callTelegram('sendMessage', {
          chat_id: chatId,
          text: `⛔️ <b>Ruxsat berilmadi!</b>\n\nSizning hisobingiz (ID: <code>${chatId}</code>) oddiy foydalanuvchi hisoblanadi.\nPacklarni tiklash va sinxronlash amali faqat tasdiqlangan Bosh Admin uchun ruxsat etilgan.\n\nIltimos, <b>Admin bilan bog'laning</b>.`,
          parse_mode: 'HTML',
          reply_markup: USER_KEYBOARD
        });
        return;
      }
      const livePacks = getLivePacks();
      await callTelegram('sendMessage', {
        chat_id: chatId,
        text: `🔄 <b>eFootball™ 2026 Packlar & Kesh Sinxronizatsiyasi:</b>

✅ Bot va Web ilova ma'lumotlar ombori to'liq yangilandi.
• Faol Sinxronlangan Packlar: <b>${livePacks.length} ta</b>
• Eski avvalgi barcha packlar o'chirildi.

💡 <b>Veb ilovada yangilash usuli:</b>
Web ilovaning "Packlar" bo'limida yangi pack yaratishingiz yoki <b>"🔄 Packlarni Sinxronlash"</b> orqali ma'lumotlarni saqlashingiz mumkin!`,
        parse_mode: 'HTML',
        reply_markup: ADMIN_KEYBOARD
      });
    } else if (text.includes('Admin bilan') || text.includes('bog\'lanish') || text.includes('aloqa') || cleanText === '/contact') {
      await callTelegram('sendMessage', {
        chat_id: chatId,
        text: `👨‍💻 <b>Admin bilan bog'lanish:</b>\n\nSavol, taklif yoki o'yin bo'yicha murojaat uchun ilovaning rasmiy administratori bilan bog'lanishingiz mumkin.\n\n🆔 Sizning Telegram ID raqamingiz: <code>${chatId}</code>\n🌐 Rasmiy o'yin veb-ilovasi: https://husananorqulov7431-coder.github.io/Karyera/`,
        parse_mode: 'HTML',
        reply_markup: currentKeyboard
      });
    } else if (text.includes('Qo\'llanma') || text.includes('yordam') || text.includes('help') || cleanText === '/help') {
      if (isAdmin) {
        await callTelegram('sendMessage', {
          chat_id: chatId,
          text: `📌 <b>Admin Boshqaruv Qo'llanmasi:</b>
• <b>📦 100 O'yinchili Pack JSON</b> — Veb ilovaga o'rnatish uchun 100 talik fayl.
• <b>🔐 Admin Kirish Tasdiq Kodi</b> — Veb saytda admin huquqini tasdiqlash kodi.
• <b>🏆 Mavjud Packlar</b> — 4 ta rasmiy pack tarkibi va imkoniyatlari.
• <b>🔄 Packlarni Sinxronlash</b> — Keshni yangilash va packlarni tiklash.`,
          parse_mode: 'HTML',
          reply_markup: ADMIN_KEYBOARD
        });
      } else {
        await callTelegram('sendMessage', {
          chat_id: chatId,
          text: `📌 <b>Qo'llanma & Yordam:</b>
• <b>🏆 Mavjud Packlar</b> — 4 ta rasmiy pack tarkibi va yulduzlari.
• <b>📊 Ehtimolliklar (Odds)</b> — O'yinchi chiqish ko'rsatkichlari.
• <b>👨‍💻 Admin bilan bog'lanish</b> — Yordam va savollar uchun aloqa.

ℹ️ Packlarni tiklash yoki qo'shimcha ruxsat kerak bo'lsa, iltimos, <b>Admin bilan bog'laning</b>.`,
          parse_mode: 'HTML',
          reply_markup: USER_KEYBOARD
        });
      }
    } else {
      if (isAdmin) {
        await callTelegram('sendMessage', {
          chat_id: chatId,
          text: `Kerakli amalni pastdagi Admin menyusi tugmalaridan birini bosib tanlang:`,
          reply_markup: ADMIN_KEYBOARD
        });
      } else {
        await callTelegram('sendMessage', {
          chat_id: chatId,
          text: `Salom! Kerakli amalni pastdagi menyudan tanlang. Qo'shimcha savollar yoki ruxsat uchun, iltimos, <b>Admin bilan bog'laning</b>.`,
          parse_mode: 'HTML',
          reply_markup: USER_KEYBOARD
        });
      }
    }
  }
}

process.on('uncaughtException', (err) => console.error('Uncaught Exception:', err));
process.on('unhandledRejection', (err) => console.error('Unhandled Rejection:', err));

const STATUS_FILE = path.join('/tmp', 'efootball_bot_status.json');
const PID_FILE = path.join('/tmp', 'efootball_bot.pid');

let isBotRunning = false;
let updatesHandledCount = 0;
let lastHeartbeatTime = Date.now();

// Health Status logger
function updateHealthStatus(status = 'online', extra = {}) {
  try {
    const data = {
      status,
      pid: process.pid,
      startTime: new Date().toISOString(),
      lastHeartbeat: new Date().toISOString(),
      timestamp: Date.now(),
      updatesProcessed: updatesHandledCount,
      adminId: PRIMARY_ADMIN_CHAT_ID,
      nodeVersion: process.version,
      ...extra
    };
    fs.writeFileSync(STATUS_FILE, JSON.stringify(data, null, 2));
  } catch {
    // ignore
  }
}

// Write PID file
try {
  fs.writeFileSync(PID_FILE, String(process.pid));
} catch {}

process.on('exit', () => {
  try {
    if (fs.existsSync(PID_FILE)) fs.unlinkSync(PID_FILE);
  } catch {}
});

// Start Long Polling Engine with Automatic Self-Healing
export async function startBot() {
  if (isBotRunning) {
    console.log('⚠️ Telegram Bot allaqachon ishlayapti.');
    return;
  }
  isBotRunning = true;
  updateHealthStatus('starting');

  // First, delete any lingering webhook so getUpdates works smoothly
  console.log('Eski webhook tozalanmoqda...');
  try {
    await callTelegram('deleteWebhook', { drop_pending_updates: false }, 15000);
  } catch (e) {
    console.warn('deleteWebhook xatosi:', e.message);
  }

  const me = await callTelegram('getMe', {}, 15000);
  if (me && me.result) {
    console.log(`✅ Bot muvaffaqiyatli ulandi: @${me.result.username} (${me.result.first_name})`);
    updateHealthStatus('online', { username: me.result.username, botName: me.result.first_name });
  } else {
    console.warn('⚠️ getMe javob bermadi, token yoki internetni tekshiring.');
    updateHealthStatus('connecting');
  }

  let offset = 0;
  let consecutiveErrors = 0;
  console.log('🚀 Telegram Bot 24/7 Doimiy Ishlash Rejimida (Watchdog & Self-Healing faol)...');

  // Heartbeat every 30s
  const heartbeatInterval = setInterval(() => {
    lastHeartbeatTime = Date.now();
    updateHealthStatus('online', { lastHeartbeat: new Date().toISOString(), updatesProcessed: updatesHandledCount });
    console.log(`[${new Date().toLocaleTimeString()}] 🟢 Bot 100% faol, qayta ishlangan so'rovlar: ${updatesHandledCount}`);
  }, 30000);

  while (true) {
    try {
      // Timeout: 35000ms for fetch, while Telegram long-poll timeout is 20s
      const updatesRes = await callTelegram(
        'getUpdates',
        {
          offset: offset,
          timeout: 20,
          allowed_updates: ['message', 'callback_query']
        },
        35000
      );

      // Handle successful update batch
      if (updatesRes && updatesRes.ok && Array.isArray(updatesRes.result)) {
        consecutiveErrors = 0;
        updateHealthStatus('online', { updatesProcessed: updatesHandledCount });

        for (const upd of updatesRes.result) {
          offset = upd.update_id + 1;
          updatesHandledCount++;
          try {
            await handleUpdate(upd);
          } catch (hErr) {
            console.error('handleUpdate xatosi:', hErr);
          }
        }
      } else if (updatesRes && !updatesRes.ok) {
        // Telegram API returned an error object
        consecutiveErrors++;
        console.warn(`⚠️ Telegram API xatolik (kod: ${updatesRes.error_code}): ${updatesRes.description}`);

        if (updatesRes.error_code === 409) {
          // 409 Conflict: another instance is running or old connection lingering
          console.warn('⚠️ 409 Conflict: Eski Telegram ulanishi yopilmoqda, 5 soniya kutilmoqda...');
          try {
            await callTelegram('deleteWebhook', { drop_pending_updates: false }, 10000);
          } catch {}
          await new Promise((res) => setTimeout(res, 5000));
        } else if (updatesRes.error_code === 429) {
          // 429 Too Many Requests
          const waitSec = updatesRes.parameters?.retry_after || 5;
          console.warn(`⚠️ 429 Rate Limit: ${waitSec} soniya kutilmoqda...`);
          await new Promise((res) => setTimeout(res, waitSec * 1000));
        } else {
          await new Promise((res) => setTimeout(res, 3000));
        }
      } else {
        // updatesRes is null (Timeout / Network drop)
        consecutiveErrors++;
        if (consecutiveErrors >= 5) {
          console.warn('⚠️ 5 ta ketma-ket tarmoq xatoligi. Telegram sessiyasi qayta ulanmoqda...');
          try {
            await callTelegram('deleteWebhook', { drop_pending_updates: false }, 10000);
          } catch {}
          consecutiveErrors = 0;
        }
        await new Promise((res) => setTimeout(res, 2000));
      }
    } catch (loopErr) {
      consecutiveErrors++;
      console.error('Polling ichki xatosi:', loopErr.message);
      await new Promise((res) => setTimeout(res, 3000));
    }
  }
}

// Outer supervisor to ensure the bot NEVER stops running
async function runBotForever() {
  while (true) {
    try {
      await startBot();
    } catch (fatalErr) {
      console.error('CRITICAL BOT ERROR:', fatalErr);
    }
    isBotRunning = false;
    updateHealthStatus('restarting');
    console.warn('⚠️ Bot tsikli kutilmaganda to‘xtadi. 2 soniyadan so‘ng avtomatik qayta ulanmoqda (Self-Healing)...');
    await new Promise((res) => setTimeout(res, 2000));
  }
}

runBotForever();

