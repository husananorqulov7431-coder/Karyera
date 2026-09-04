import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import { defineConfig } from 'vite';

function startWatchdogIfNeeded(forceRestart = false) {
  const WATCHDOG_PID_FILE = '/tmp/efootball_bot_watchdog.pid';
  const BOT_PID_FILE = '/tmp/efootball_bot.pid';

  if (forceRestart) {
    try {
      if (fs.existsSync(WATCHDOG_PID_FILE)) {
        const wPid = parseInt(fs.readFileSync(WATCHDOG_PID_FILE, 'utf-8').trim(), 10);
        if (wPid) {
          try { process.kill(wPid, 'SIGTERM'); } catch {}
        }
        try { fs.unlinkSync(WATCHDOG_PID_FILE); } catch {}
      }
      if (fs.existsSync(BOT_PID_FILE)) {
        const bPid = parseInt(fs.readFileSync(BOT_PID_FILE, 'utf-8').trim(), 10);
        if (bPid) {
          try { process.kill(bPid, 'SIGKILL'); } catch {}
        }
        try { fs.unlinkSync(BOT_PID_FILE); } catch {}
      }
    } catch {}
  } else {
    try {
      if (fs.existsSync(WATCHDOG_PID_FILE)) {
        const pidStr = fs.readFileSync(WATCHDOG_PID_FILE, 'utf-8').trim();
        const pid = parseInt(pidStr, 10);
        if (pid && !isNaN(pid)) {
          try {
            process.kill(pid, 0);
            return;
          } catch {
            // dead PID
          }
        }
      }
    } catch {}
  }

  try {
    const watchdogScript = path.resolve(__dirname, 'scripts/botWatchdog.mjs');
    const child = spawn(process.execPath, [watchdogScript], {
      detached: true,
      stdio: 'inherit',
      cwd: path.resolve(__dirname)
    });
    child.unref();
    console.log(`[Telegram Bot] 🛡️ 24/7 Watchdog supervizor fon rejimida yoqildi (PID: ${child.pid})`);
  } catch (err: any) {
    console.error('[Telegram Bot] Watchdog xatoligi:', err.message);
  }
}

export default defineConfig(() => {
  return {
    base: './',
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'telegram-bot-service',
        configureServer(server) {
          startWatchdogIfNeeded();

          server.middlewares.use('/api/bot-status', (_req, res) => {
            let statusData: any = { status: 'offline', active: false };
            try {
              if (fs.existsSync('/tmp/efootball_bot_status.json')) {
                statusData = JSON.parse(fs.readFileSync('/tmp/efootball_bot_status.json', 'utf-8'));
                const age = Date.now() - (statusData.timestamp || 0);
                statusData.active = age < 60000;
              }
            } catch {}
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: true, data: statusData }));
          });

          server.middlewares.use('/api/bot-restart', (_req, res) => {
            startWatchdogIfNeeded(true);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: true, message: "Bot va Watchdog qayta ishga tushirildi!" }));
          });

          server.middlewares.use('/api/packs/sync', (req, res) => {
            const LIVE_PACKS_FILE = '/tmp/efootball_live_packs.json';
            if (req.method === 'POST') {
              let body = '';
              req.on('data', chunk => { body += chunk; });
              req.on('end', () => {
                try {
                  fs.writeFileSync(LIVE_PACKS_FILE, body, 'utf-8');
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ ok: true, message: 'Packlar muvaffaqiyatli saqlandi' }));
                } catch (err: any) {
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ ok: false, error: err.message }));
                }
              });
            } else {
              let data: any[] = [];
              try {
                if (fs.existsSync(LIVE_PACKS_FILE)) {
                  data = JSON.parse(fs.readFileSync(LIVE_PACKS_FILE, 'utf-8'));
                }
              } catch {}
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: true, packs: data }));
            }
          });

          // User Profiles List API (Bot va GitHub bilan eng so'nggi profillar)
          server.middlewares.use('/api/profiles', (_req, res) => {
            const PROFILES_FILE = '/tmp/efootball_user_profiles.json';
            const BACKUP_FILE = path.join(process.cwd(), 'src', 'data', 'profiles.json');
            let profiles: any[] = [];
            try {
              if (fs.existsSync(PROFILES_FILE)) {
                profiles = JSON.parse(fs.readFileSync(PROFILES_FILE, 'utf-8'));
              } else if (fs.existsSync(BACKUP_FILE)) {
                profiles = JSON.parse(fs.readFileSync(BACKUP_FILE, 'utf-8'));
              }
            } catch {}
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: true, profiles }));
          });

          // User Profile Authentication & Management API
          server.middlewares.use('/api/users/login', (req, res) => {
            const PROFILES_FILE = '/tmp/efootball_user_profiles.json';
            const BACKUP_FILE = path.join(process.cwd(), 'src', 'data', 'profiles.json');
            if (req.method === 'POST') {
              let body = '';
              req.on('data', chunk => { body += chunk; });
              req.on('end', () => {
                try {
                  const { managerId, password } = JSON.parse(body || '{}');
                  if (!managerId || !password) {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ ok: false, error: 'Menejer ID va parol kiritilishi shart!' }));
                    return;
                  }

                  let profiles: any[] = [];
                  if (fs.existsSync(PROFILES_FILE)) {
                    profiles = JSON.parse(fs.readFileSync(PROFILES_FILE, 'utf-8'));
                  } else if (fs.existsSync(BACKUP_FILE)) {
                    profiles = JSON.parse(fs.readFileSync(BACKUP_FILE, 'utf-8'));
                  }

                  const cleanId = String(managerId).trim().toUpperCase();
                  const cleanPass = String(password).trim();

                  // Special check for head admin
                  if (
                    (cleanId === 'EF-6130389200' || cleanId === '6130389200' || cleanId === 'ADMIN') &&
                    (cleanPass === 'ANORQULOV_7431' || cleanPass === '743100')
                  ) {
                    const adminUser = {
                      managerId: 'EF-6130389200',
                      telegramId: '6130389200',
                      displayName: 'Bosh Administrator',
                      isAdmin: true,
                      gp: 9999999,
                      eCoins: 50000,
                      matchesPlayed: 50,
                      matchesWon: 48
                    };
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ ok: true, user: adminUser }));
                    return;
                  }

                  const user = profiles.find(
                    (p: any) =>
                      String(p.managerId).trim().toUpperCase() === cleanId ||
                      String(p.telegramId).trim() === cleanId
                  );

                  if (!user) {
                    res.statusCode = 404;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(
                      JSON.stringify({
                        ok: false,
                        error: `"${cleanId}" ID raqamli profil topilmadi! Iltimos, Veb yoki Telegram bot (@Futbolkarerapack_bot) orqali hisob oching.`
                      })
                    );
                    return;
                  }

                  if (String(user.password).trim() !== cleanPass) {
                    res.statusCode = 401;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(
                      JSON.stringify({
                        ok: false,
                        error: "Parol noto'g'ri kiritildi! Iltimos, qayta urinib ko'ring."
                      })
                    );
                    return;
                  }

                  // Successfully authenticated
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ ok: true, user }));
                } catch (err: any) {
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ ok: false, error: err.message }));
                }
              });
            } else {
              res.statusCode = 405;
              res.end('Method Not Allowed');
            }
          });

          // Change Password API
          server.middlewares.use('/api/users/change-password', (req, res) => {
            const PROFILES_FILE = '/tmp/efootball_user_profiles.json';
            const BACKUP_FILE = path.join(process.cwd(), 'src', 'data', 'profiles.json');
            if (req.method === 'POST') {
              let body = '';
              req.on('data', chunk => { body += chunk; });
              req.on('end', () => {
                try {
                  const { managerId, newPassword } = JSON.parse(body || '{}');
                  if (!managerId || !newPassword) {
                    res.statusCode = 400;
                    res.end(JSON.stringify({ ok: false, error: 'Menejer ID va yangi parol kiritilishi shart!' }));
                    return;
                  }

                  let profiles: any[] = [];
                  if (fs.existsSync(PROFILES_FILE)) {
                    try { profiles = JSON.parse(fs.readFileSync(PROFILES_FILE, 'utf-8')); } catch {}
                  } else if (fs.existsSync(BACKUP_FILE)) {
                    try { profiles = JSON.parse(fs.readFileSync(BACKUP_FILE, 'utf-8')); } catch {}
                  }

                  const cleanId = String(managerId).trim().toUpperCase();
                  const idx = profiles.findIndex(
                    (p: any) =>
                      String(p.managerId).trim().toUpperCase() === cleanId ||
                      String(p.telegramId).trim() === cleanId
                  );

                  if (idx >= 0) {
                    profiles[idx].password = String(newPassword).trim();
                    profiles[idx].updatedAt = Date.now();
                    fs.writeFileSync(PROFILES_FILE, JSON.stringify(profiles, null, 2), 'utf-8');
                    try { fs.writeFileSync(BACKUP_FILE, JSON.stringify(profiles, null, 2), 'utf-8'); } catch {}
                  }

                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ ok: true, message: 'Parol muvaffaqiyatli saqlandi!' }));
                } catch (err: any) {
                  res.statusCode = 500;
                  res.end(JSON.stringify({ ok: false, error: err.message }));
                }
              });
            } else {
              res.statusCode = 405;
              res.end('Method Not Allowed');
            }
          });

          // Register User API
          server.middlewares.use('/api/users/register', (req, res) => {
            const PROFILES_FILE = '/tmp/efootball_user_profiles.json';
            const BACKUP_FILE = path.join(process.cwd(), 'src', 'data', 'profiles.json');
            if (req.method === 'POST') {
              let body = '';
              req.on('data', chunk => { body += chunk; });
              req.on('end', () => {
                try {
                  const { displayName, password, username } = JSON.parse(body || '{}');
                  let profiles: any[] = [];
                  if (fs.existsSync(PROFILES_FILE)) {
                    try { profiles = JSON.parse(fs.readFileSync(PROFILES_FILE, 'utf-8')); } catch {}
                  } else if (fs.existsSync(BACKUP_FILE)) {
                    try { profiles = JSON.parse(fs.readFileSync(BACKUP_FILE, 'utf-8')); } catch {}
                  }

                  const randNum = Math.floor(100000 + Math.random() * 900000);
                  const newProfile = {
                    managerId: `EF-${randNum}`,
                    displayName: displayName || `Menejer #${randNum}`,
                    username: username || `user_${randNum}`,
                    password: password || '123456',
                    gp: 1000,
                    eCoins: 100,
                    isAdmin: false,
                    createdAt: Date.now(),
                    matchesPlayed: 0,
                    matchesWon: 0
                  };

                  profiles.push(newProfile);
                  fs.writeFileSync(PROFILES_FILE, JSON.stringify(profiles, null, 2), 'utf-8');
                  try { fs.writeFileSync(BACKUP_FILE, JSON.stringify(profiles, null, 2), 'utf-8'); } catch {}

                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ ok: true, user: newProfile }));
                } catch (err: any) {
                  res.statusCode = 500;
                  res.end(JSON.stringify({ ok: false, error: err.message }));
                }
              });
            } else {
              res.statusCode = 405;
              res.end('Method Not Allowed');
            }
          });

          // Sync user GP / eCoins back to profile
          server.middlewares.use('/api/users/sync', (req, res) => {
            const PROFILES_FILE = '/tmp/efootball_user_profiles.json';
            const BACKUP_FILE = path.join(process.cwd(), 'src', 'data', 'profiles.json');
            if (req.method === 'POST') {
              let body = '';
              req.on('data', chunk => { body += chunk; });
              req.on('end', () => {
                try {
                  const { managerId, gp, eCoins, matchesPlayed, matchesWon } = JSON.parse(body || '{}');
                  if (!managerId) {
                    res.statusCode = 400;
                    res.end(JSON.stringify({ ok: false, error: 'managerId missing' }));
                    return;
                  }

                  let profiles: any[] = [];
                  if (fs.existsSync(PROFILES_FILE)) {
                    profiles = JSON.parse(fs.readFileSync(PROFILES_FILE, 'utf-8'));
                  }

                  const idx = profiles.findIndex(
                    (p: any) => String(p.managerId).trim().toUpperCase() === String(managerId).trim().toUpperCase()
                  );

                  if (idx >= 0) {
                    if (gp !== undefined) profiles[idx].gp = gp;
                    if (eCoins !== undefined) profiles[idx].eCoins = eCoins;
                    if (matchesPlayed !== undefined) profiles[idx].matchesPlayed = matchesPlayed;
                    if (matchesWon !== undefined) profiles[idx].matchesWon = matchesWon;
                    profiles[idx].updatedAt = Date.now();
                    fs.writeFileSync(PROFILES_FILE, JSON.stringify(profiles, null, 2), 'utf-8');
                    try {
                      fs.writeFileSync(BACKUP_FILE, JSON.stringify(profiles, null, 2), 'utf-8');
                    } catch {}
                  }

                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ ok: true }));
                } catch (err: any) {
                  res.statusCode = 500;
                  res.end(JSON.stringify({ ok: false, error: err.message }));
                }
              });
            }
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
