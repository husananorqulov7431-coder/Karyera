// eFootball™ 2026 - Telegram Bot Watchdog & Process Supervisor
// Bot o'chib qolmasligini kafolatlaydigan avtomatik nazoratchi (24/7 Supervizor)

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BOT_SCRIPT = path.resolve(__dirname, 'telegramBot.mjs');
const WATCHDOG_PID_FILE = path.join('/tmp', 'efootball_bot_watchdog.pid');
const STATUS_FILE = path.join('/tmp', 'efootball_bot_status.json');

console.log('====================================================');
console.log('🛡️ eFootball™ 2026 Telegram Bot Watchdog Nazoratchisi');
console.log('Bot 24/7 o‘chmaydigan qilib sozlanmoqda...');
console.log(`Watchdog PID: ${process.pid}`);
console.log('====================================================');

// Watchdog PID yozish
try {
  fs.writeFileSync(WATCHDOG_PID_FILE, String(process.pid));
} catch (e) {
  console.error('Watchdog PID yozishda xatolik:', e.message);
}

process.on('exit', () => {
  try {
    if (fs.existsSync(WATCHDOG_PID_FILE)) fs.unlinkSync(WATCHDOG_PID_FILE);
  } catch {}
});

process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));
process.on('uncaughtException', (err) => console.error('Watchdog Exception:', err));
process.on('unhandledRejection', (err) => console.error('Watchdog Rejection:', err));

let currentChild = null;
let restartCount = 0;
let isShuttingDown = false;

function spawnBotProcess() {
  if (isShuttingDown) return;

  restartCount++;
  console.log(`\n🚀 [Watchdog #${restartCount}] Telegram Bot jarayoni ishga tushirilmoqda: ${BOT_SCRIPT}`);

  const child = spawn(process.execPath, [BOT_SCRIPT], {
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..'),
    env: { ...process.env }
  });

  currentChild = child;
  console.log(`🟢 [Watchdog] Bot yangi PID bilan ishga tushdi: ${child.pid}`);

  child.on('error', (err) => {
    console.error(`❌ [Watchdog] Botni ishga tushirishda xatolik:`, err.message);
  });

  child.on('exit', (code, signal) => {
    console.warn(`⚠️ [Watchdog] Telegram Bot to‘xtadi (Exit Code: ${code}, Signal: ${signal})!`);
    currentChild = null;

    if (!isShuttingDown) {
      console.log('🔄 [Watchdog] 1 soniyadan so‘ng Bot avtomatik qayta yoqiladi (Auto-Respawn)...');
      setTimeout(spawnBotProcess, 1000);
    }
  });
}

// Birinchi marta botni ishga tushirish
spawnBotProcess();

// Monitor va Sog'lomlik Tekshiruvi (Har 15 soniyada)
setInterval(() => {
  if (isShuttingDown) return;

  // 1. Jarayon tirikligini tekshirish
  if (!currentChild || !currentChild.pid) {
    console.warn('⚠️ [Watchdog Monitor] Bot jarayoni topilmadi. Qayta ishga tushirilmoqda...');
    spawnBotProcess();
    return;
  }

  try {
    process.kill(currentChild.pid, 0);
  } catch {
    console.warn(`⚠️ [Watchdog Monitor] PID ${currentChild.pid} javob bermayapti. Qayta ishga tushirilmoqda...`);
    currentChild = null;
    spawnBotProcess();
    return;
  }

  // 2. Heartbeat vaqtini tekshirish
  try {
    if (fs.existsSync(STATUS_FILE)) {
      const statusData = JSON.parse(fs.readFileSync(STATUS_FILE, 'utf-8'));
      const diff = Date.now() - (statusData.timestamp || 0);
      // Agar 90 soniyadan ko'proq vaqt davomida yangilanmagan bo'lsa (muzlab qolgan)
      if (diff > 90000) {
        console.warn(`⚠️ [Watchdog Monitor] Bot 90 soniyadan beri muzlab qolgan (${Math.round(diff / 1000)}s oldin oxirgi ping). Qayta yuklanmoqda...`);
        try {
          process.kill(currentChild.pid, 'SIGKILL');
        } catch {}
      }
    }
  } catch (e) {
    // ignore json read errors
  }
}, 15000);
