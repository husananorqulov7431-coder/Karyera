// eFootball™ 2026 - Ko'p Akkauntli Foydalanuvchilar Tizimi (Multi-Account Store)
// Brauzerda turli akkauntlarni to'liq ajratish, Admin va Oddiy foydalanuvchini farqlash,
// hamda 3 soniyali Web Fallback (Bot javob bermasa ham to'liq ishlash kafolati).

import { GoogleUserAccount, Player } from '../types';
import defaultProfilesJson from '../data/profiles.json';

export interface UserProfile {
  id: string; // e.g. "EF-6130389200" or "USR-12345"
  managerId: string;
  telegramId?: string;
  displayName: string;
  username?: string;
  email?: string;
  password?: string;
  role: 'admin' | 'user' | 'guest';
  isAdmin: boolean;
  isGoogleVerified?: boolean;
  adminVerified?: boolean;
  gp: number;
  eCoins: number;
  matchesPlayed: number;
  matchesWon: number;
  matchesDrawn: number;
  matchesLost: number;
  goalsScored: number;
  goalsConceded: number;
  createdAt: number;
  lastLoginAt: number;
  photoURL?: string;
  // Har bir akkaunt uchun alohida jamoa va balans xotirasi
  squad?: Record<string, Player | null>;
  bench?: Player[];
  reserves?: Player[];
  clubBudget?: number;
}

// Brauzer keshidagi eski eskirgan malumotlarni tozalash va v5 toza tizimga o'tish
const CURRENT_VERSION = 'v5';
const ACCOUNTS_STORAGE_KEY = `efootball_accounts_${CURRENT_VERSION}`;
const ACTIVE_ACCOUNT_ID_KEY = `efootball_active_account_id_${CURRENT_VERSION}`;

if (typeof window !== 'undefined') {
  try {
    const legacyKeys = [
      'efootball_accounts_v1',
      'efootball_accounts_v2',
      'efootball_accounts_v3',
      'efootball_accounts_v4',
      'efootball_active_account_id_v1',
      'efootball_active_account_id_v2',
      'efootball_active_account_id_v3',
      'efootball_active_account_id_v4',
      'efootball_user_v1',
      'efootball_auth_prompted_v1'
    ];
    legacyKeys.forEach(key => localStorage.removeItem(key));
  } catch {}
}

export const PRIMARY_ADMIN_CHAT_ID = '6130389200';
export const ADMIN_MASTER_PASSWORDS = ['ANORQULOV_7431', '743100', 'ADMIN2026'];

// Boshlang'ich mehmon akkaunt shabloni
export function createDefaultGuestProfile(): UserProfile {
  const guestNumber = Math.floor(1000 + Math.random() * 9000);
  return {
    id: `GUEST-${Date.now()}`,
    managerId: `MEHMON-${guestNumber}`,
    displayName: `Mehmon Menejer #${guestNumber}`,
    username: `mehmon_${guestNumber}`,
    role: 'guest',
    isAdmin: false,
    gp: 1000,
    eCoins: 100,
    matchesPlayed: 0,
    matchesWon: 0,
    matchesDrawn: 0,
    matchesLost: 0,
    goalsScored: 0,
    goalsConceded: 0,
    createdAt: Date.now(),
    lastLoginAt: Date.now(),
    photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=guest_${guestNumber}`,
    clubBudget: 120000000
  };
}

// Barcha akkauntlarni yuklash (GitHub / Telegram Bot profiles.json dan boshlanadi)
export function getAllSavedAccounts(): UserProfile[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Akkauntlarni o‘qishda xatolik:', err);
  }

  // Boshlang'ich profillar (GitHub / Telegram Bot dagi toza profiles.json asosida)
  const initialAccounts: UserProfile[] = (defaultProfilesJson as any[]).map((dp, idx) => {
    const isLeadAdmin =
      String(dp.telegramId) === PRIMARY_ADMIN_CHAT_ID ||
      dp.managerId === `EF-${PRIMARY_ADMIN_CHAT_ID}` ||
      dp.isAdmin === true;

    return {
      id: dp.managerId || `USR-${idx + 1}`,
      managerId: dp.managerId || `EF-${dp.telegramId || '1000'}`,
      telegramId: dp.telegramId,
      displayName: dp.displayName || (isLeadAdmin ? 'Bosh Administrator' : 'eFootball Menejer'),
      username: dp.telegramId ? `tg_${dp.telegramId}` : `user_${idx + 1}`,
      email: isLeadAdmin ? 'husananorqulov7431@gmail.com' : `${dp.managerId?.toLowerCase() || 'user'}@efootball.app`,
      password: dp.password || (isLeadAdmin ? 'ANORQULOV_7431' : '123456'),
      role: isLeadAdmin ? 'admin' : 'user',
      isAdmin: isLeadAdmin,
      adminVerified: isLeadAdmin,
      isGoogleVerified: isLeadAdmin,
      gp: dp.gp || (isLeadAdmin ? 9999999 : 1000),
      eCoins: dp.eCoins || (isLeadAdmin ? 50000 : 100),
      matchesPlayed: dp.matchesPlayed || 0,
      matchesWon: dp.matchesWon || 0,
      matchesDrawn: 0,
      matchesLost: 0,
      goalsScored: 0,
      goalsConceded: 0,
      createdAt: dp.createdAt || Date.now(),
      lastLoginAt: Date.now(),
      photoURL: isLeadAdmin
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
        : `https://api.dicebear.com/7.x/bottts/svg?seed=${dp.managerId || 'seed'}`,
      clubBudget: isLeadAdmin ? 500000000 : 120000000
    };
  });

  saveAllAccounts(initialAccounts);
  return initialAccounts;
}

// Server (Bot & GitHub) dan eng so'nggi profillarni sinxronlashtirish
export async function syncProfilesFromServer(): Promise<UserProfile[]> {
  try {
    const res = await fetch('/api/profiles');
    if (res.ok) {
      const data = await res.json();
      if (data.ok && Array.isArray(data.profiles) && data.profiles.length > 0) {
        const synced: UserProfile[] = (data.profiles as any[]).map((dp, idx) => {
          const isLeadAdmin =
            String(dp.telegramId) === PRIMARY_ADMIN_CHAT_ID ||
            dp.managerId === `EF-${PRIMARY_ADMIN_CHAT_ID}` ||
            dp.isAdmin === true;

          return {
            id: dp.managerId || `USR-${idx + 1}`,
            managerId: dp.managerId || `EF-${dp.telegramId || '1000'}`,
            telegramId: dp.telegramId,
            displayName: dp.displayName || (isLeadAdmin ? 'Bosh Administrator' : 'eFootball Menejer'),
            username: dp.telegramId ? `tg_${dp.telegramId}` : `user_${idx + 1}`,
            email: isLeadAdmin ? 'husananorqulov7431@gmail.com' : `${dp.managerId?.toLowerCase() || 'user'}@efootball.app`,
            password: dp.password || (isLeadAdmin ? 'ANORQULOV_7431' : '123456'),
            role: isLeadAdmin ? 'admin' : 'user',
            isAdmin: isLeadAdmin,
            adminVerified: isLeadAdmin,
            isGoogleVerified: isLeadAdmin,
            gp: dp.gp || (isLeadAdmin ? 9999999 : 1000),
            eCoins: dp.eCoins || (isLeadAdmin ? 50000 : 100),
            matchesPlayed: dp.matchesPlayed || 0,
            matchesWon: dp.matchesWon || 0,
            matchesDrawn: 0,
            matchesLost: 0,
            goalsScored: 0,
            goalsConceded: 0,
            createdAt: dp.createdAt || Date.now(),
            lastLoginAt: Date.now(),
            photoURL: isLeadAdmin
              ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
              : `https://api.dicebear.com/7.x/bottts/svg?seed=${dp.managerId || 'seed'}`,
            clubBudget: isLeadAdmin ? 500000000 : 120000000
          };
        });

        saveAllAccounts(synced);
        return synced;
      }
    }
  } catch (err) {
    console.warn('Server profillarini sinxronlashda xatolik:', err);
  }
  return getAllSavedAccounts();
}

// Barcha akkauntlarni saqlash
export function saveAllAccounts(accounts: UserProfile[]): void {
  try {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
  } catch (err) {
    console.error('Akkauntlarni saqlash xatosi:', err);
  }
}

// Hozirgi faol akkauntni olish
export function getActiveAccount(): UserProfile {
  const accounts = getAllSavedAccounts();
  const activeId = localStorage.getItem(ACTIVE_ACCOUNT_ID_KEY);

  if (activeId) {
    const found = accounts.find(a => a.id === activeId || a.managerId === activeId);
    if (found) return found;
  }

  // Agar faol akkaunt belgilanmagan bo'lsa, birinchi ro'yxatdagini yoki mehmonni olamiz
  if (accounts.length > 0) {
    const first = accounts[0];
    localStorage.setItem(ACTIVE_ACCOUNT_ID_KEY, first.id);
    return first;
  }

  const guest = createDefaultGuestProfile();
  saveAllAccounts([guest]);
  localStorage.setItem(ACTIVE_ACCOUNT_ID_KEY, guest.id);
  return guest;
}

// Faol akkaunt ma'lumotlarini (jamoa, gp, budget) yangilash
export function updateActiveAccountData(data: Partial<UserProfile>): UserProfile {
  const accounts = getAllSavedAccounts();
  const active = getActiveAccount();

  const updated: UserProfile = {
    ...active,
    ...data,
    lastLoginAt: Date.now()
  };

  const index = accounts.findIndex(a => a.id === active.id);
  if (index >= 0) {
    accounts[index] = updated;
  } else {
    accounts.push(updated);
  }

  saveAllAccounts(accounts);
  return updated;
}

// Akkauntlar o'rtasida almashish (Switch Account)
export function switchAccount(targetAccountId: string): {
  success: boolean;
  account?: UserProfile;
  error?: string;
} {
  const accounts = getAllSavedAccounts();
  const target = accounts.find(a => a.id === targetAccountId || a.managerId === targetAccountId);

  if (!target) {
    return { success: false, error: 'Bunday hisob topilmadi!' };
  }

  target.lastLoginAt = Date.now();
  saveAllAccounts(accounts);
  localStorage.setItem(ACTIVE_ACCOUNT_ID_KEY, target.id);

  // Eski yagona kalitlarni ham sinxronlash
  try {
    localStorage.setItem('efootball_user_v1', JSON.stringify(toGoogleUserAccount(target)));
  } catch {}

  return { success: true, account: target };
}

// Yangi akkaunt qo'shish / ro'yxatdan o'tkazish
export function createNewAccount(params: {
  displayName: string;
  username: string;
  password?: string;
  role?: 'admin' | 'user' | 'guest';
}): { success: boolean; account?: UserProfile; error?: string } {
  const accounts = getAllSavedAccounts();

  const cleanName = params.displayName.trim();
  const cleanUsername = params.username.trim().toLowerCase();
  const cleanPass = (params.password || '').trim();

  if (!cleanName) {
    return { success: false, error: 'Ism/Menejer nomi kiritilishi shart!' };
  }

  if (cleanUsername && accounts.some(a => a.username?.toLowerCase() === cleanUsername)) {
    return { success: false, error: `"${cleanUsername}" nomli foydalanuvchi allaqachon mavjud!` };
  }

  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  const managerId = `EF-${randomDigits}`;

  const newAccount: UserProfile = {
    id: managerId,
    managerId,
    displayName: cleanName,
    username: cleanUsername || `user_${randomDigits}`,
    email: `${cleanUsername || randomDigits}@efootball.app`,
    password: cleanPass || '123456',
    role: params.role || 'user',
    isAdmin: params.role === 'admin',
    gp: 1000,
    eCoins: 100,
    matchesPlayed: 0,
    matchesWon: 0,
    matchesDrawn: 0,
    matchesLost: 0,
    goalsScored: 0,
    goalsConceded: 0,
    createdAt: Date.now(),
    lastLoginAt: Date.now(),
    photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${managerId}`,
    clubBudget: 120000000
  };

  accounts.push(newAccount);
  saveAllAccounts(accounts);
  localStorage.setItem(ACTIVE_ACCOUNT_ID_KEY, newAccount.id);

  try {
    localStorage.setItem('efootball_user_v1', JSON.stringify(toGoogleUserAccount(newAccount)));
  } catch {}

  return { success: true, account: newAccount };
}

// Parolni o'zgartirish (Roliga ko'ra qat'iy tekshiruv bilan)
export async function changeAccountPassword(params: {
  accountId: string;
  currentPassword?: string;
  newPassword: string;
}): Promise<{ success: boolean; error?: string; message?: string }> {
  const accounts = getAllSavedAccounts();
  const account = accounts.find(a => a.id === params.accountId || a.managerId === params.accountId);

  if (!account) {
    return { success: false, error: 'Hisob topilmadi!' };
  }

  // 1. Mehmon akkaunt tekshiruvi
  if (account.role === 'guest') {
    return {
      success: false,
      error: "Mehmon hisoblar uchun parol saqlanmaydi! Iltimos, avval 'Yangi Akkaunt Yaratish' orqali to'liq ro'yxatdan o'ting."
    };
  }

  const cleanNewPass = params.newPassword.trim();
  if (cleanNewPass.length < 4) {
    return { success: false, error: "Yangi parol kamida 4 ta belgidan iborat bo'lishi kerak!" };
  }

  // 2. Oddiy foydalanuvchi tekshiruvi: faqat o'z joriy parolini kiritishi kerak
  if (account.role === 'user') {
    if (account.password && params.currentPassword !== account.password) {
      return { success: false, error: "Joriy parolingiz noto'g'ri kiritildi!" };
    }
  }

  // 3. Admin tekshiruvi
  if (account.role === 'admin' || account.isAdmin) {
    const isMasterValid =
      params.currentPassword &&
      (ADMIN_MASTER_PASSWORDS.includes(params.currentPassword) || params.currentPassword === account.password);

    if (!isMasterValid) {
      return { success: false, error: "Adminning joriy paroli yoki Bosh Xavfsizlik kaliti noto'g'ri!" };
    }
  }

  // Yangilash
  account.password = cleanNewPass;
  account.lastLoginAt = Date.now();
  saveAllAccounts(accounts);

  // 3 soniyali Web-to-Bot sinxronizatsiya (agar bot o'chiq bo'lsa ham foydalanuvchini kutdirmaydi)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    fetch('/api/users/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        managerId: account.managerId,
        newPassword: cleanNewPass
      }),
      signal: controller.signal
    })
      .then(() => clearTimeout(timeout))
      .catch(() => clearTimeout(timeout));
  } catch {}

  return {
    success: true,
    message: "Parol muvaffaqiyatli o'zgartirildi! Yangi parol bilan bemalol kirishingiz mumkin."
  };
}

// Admin sifatida to'g'ridan-to'g'ri kirish
export function loginAsAdmin(adminKeyOrPassword: string): {
  success: boolean;
  account?: UserProfile;
  error?: string;
} {
  const clean = (adminKeyOrPassword || '').trim();
  if (!clean) {
    return { success: false, error: 'Admin paroli yoki kaliti kiritilishi shart!' };
  }

  const isValid =
    ADMIN_MASTER_PASSWORDS.includes(clean) ||
    clean === 'ANORQULOV_7431' ||
    clean === '743100';

  if (!isValid) {
    return {
      success: false,
      error: "Admin paroli noto'g'ri! Iltimos, Telegram botdagi Bosh Admin kalitini tekshiring."
    };
  }

  const accounts = getAllSavedAccounts();
  let adminAcc = accounts.find(a => a.isAdmin || a.role === 'admin' || a.managerId === `EF-${PRIMARY_ADMIN_CHAT_ID}`);

  if (!adminAcc) {
    adminAcc = {
      id: `EF-${PRIMARY_ADMIN_CHAT_ID}`,
      managerId: `EF-${PRIMARY_ADMIN_CHAT_ID}`,
      telegramId: PRIMARY_ADMIN_CHAT_ID,
      displayName: 'Bosh Administrator (Husan)',
      username: 'admin_husan',
      email: 'husananorqulov7431@gmail.com',
      password: clean,
      role: 'admin',
      isAdmin: true,
      adminVerified: true,
      isGoogleVerified: true,
      gp: 9999999,
      eCoins: 50000,
      matchesPlayed: 50,
      matchesWon: 48,
      matchesDrawn: 2,
      matchesLost: 0,
      goalsScored: 120,
      goalsConceded: 12,
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      clubBudget: 500000000
    };
    accounts.unshift(adminAcc);
  } else {
    adminAcc.isAdmin = true;
    adminAcc.adminVerified = true;
    adminAcc.role = 'admin';
    adminAcc.lastLoginAt = Date.now();
  }

  saveAllAccounts(accounts);
  localStorage.setItem(ACTIVE_ACCOUNT_ID_KEY, adminAcc.id);

  try {
    localStorage.setItem('efootball_user_v1', JSON.stringify(toGoogleUserAccount(adminAcc)));
  } catch {}

  return { success: true, account: adminAcc };
}

// 3 soniyali Web Fallback bilan kirish
export async function authenticateUserWithFallback(params: {
  managerIdOrUsername: string;
  password?: string;
}): Promise<{
  success: boolean;
  account?: UserProfile;
  error?: string;
  source: 'web' | 'bot';
  notice?: string;
}> {
  const cleanId = params.managerIdOrUsername.trim();
  const cleanPass = (params.password || '').trim();

  if (!cleanId) {
    return { success: false, error: 'Menejer ID yoki foydalanuvchi nomi kiritilishi shart!', source: 'web' };
  }

  // 1. Agar Bosh Admin kaliti kiritilgan bo'lsa
  if (ADMIN_MASTER_PASSWORDS.includes(cleanPass) || cleanPass === 'ANORQULOV_7431') {
    const adminRes = loginAsAdmin(cleanPass);
    if (adminRes.success && adminRes.account) {
      return {
        success: true,
        account: adminRes.account,
        source: 'web',
        notice: '👑 Bosh Administrator sifatida tizimga muvaffaqiyatli kirildi!'
      };
    }
  }

  // 2. Avval lokal veb xotirasini tekshiramiz
  const localAccounts = getAllSavedAccounts();
  const localMatch = localAccounts.find(
    a =>
      a.managerId.toLowerCase() === cleanId.toLowerCase() ||
      a.username?.toLowerCase() === cleanId.toLowerCase() ||
      a.telegramId === cleanId ||
      a.email?.toLowerCase() === cleanId.toLowerCase()
  );

  // 3. Server API bilan 3 soniyali so'rov (Timeout orqali kutmasdan vebga qaytish)
  let serverUser: any = null;
  let serverResponded = false;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const res = await fetch('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ managerId: cleanId, password: cleanPass }),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data.ok && data.user) {
        serverUser = data.user;
        serverResponded = true;
      }
    }
  } catch {
    // 3 soniya tugadi yoki tarmoq xatosi — Veb tizimiga silliq o'tamiz
    serverResponded = false;
  }

  // Agar server javob bergan bo'lsa
  if (serverResponded && serverUser) {
    const isLeadAdmin =
      String(serverUser.telegramId) === PRIMARY_ADMIN_CHAT_ID ||
      serverUser.managerId === `EF-${PRIMARY_ADMIN_CHAT_ID}` ||
      serverUser.isAdmin === true;

    const profile: UserProfile = {
      id: serverUser.managerId || `EF-${serverUser.telegramId}`,
      managerId: serverUser.managerId || `EF-${serverUser.telegramId}`,
      telegramId: serverUser.telegramId,
      displayName: serverUser.displayName || 'eFootball Menejer',
      username: `tg_${serverUser.telegramId}`,
      email: `${serverUser.managerId?.toLowerCase()}@telegram.efootball`,
      password: cleanPass,
      role: isLeadAdmin ? 'admin' : 'user',
      isAdmin: isLeadAdmin,
      adminVerified: isLeadAdmin,
      isGoogleVerified: isLeadAdmin,
      gp: serverUser.gp ?? 1000,
      eCoins: serverUser.eCoins ?? 100,
      matchesPlayed: serverUser.matchesPlayed ?? 0,
      matchesWon: serverUser.matchesWon ?? 0,
      matchesDrawn: 0,
      matchesLost: 0,
      goalsScored: 0,
      goalsConceded: 0,
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
      photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${serverUser.managerId}`,
      clubBudget: 120000000
    };

    // Saqlash
    const idx = localAccounts.findIndex(a => a.id === profile.id);
    if (idx >= 0) localAccounts[idx] = profile;
    else localAccounts.push(profile);

    saveAllAccounts(localAccounts);
    localStorage.setItem(ACTIVE_ACCOUNT_ID_KEY, profile.id);

    return {
      success: true,
      account: profile,
      source: 'bot',
      notice: '✅ Telegram Bot orqali hisobingizga muvaffaqiyatli ulandingiz!'
    };
  }

  // Agar server javob bermagan bo'lsa (yoki 3 soniyada kutib turganda), lokal Veb profildan tekshiramiz
  if (localMatch) {
    if (localMatch.password && cleanPass && localMatch.password !== cleanPass) {
      return {
        success: false,
        error: "Parol noto'g'ri kiritildi! Iltimos, qaytadan tekshirib ko'ring.",
        source: 'web'
      };
    }

    localMatch.lastLoginAt = Date.now();
    saveAllAccounts(localAccounts);
    localStorage.setItem(ACTIVE_ACCOUNT_ID_KEY, localMatch.id);

    return {
      success: true,
      account: localMatch,
      source: 'web',
      notice: serverResponded
        ? '✅ Veb tizimi orqali kirdingiz.'
        : "⚡ Bot vaqtinchalik javob bermadi (3s) — Web tizimidagi ma'lumotlar bilan hisobingizga kirildi!"
    };
  }

  return {
    success: false,
    error: `"${cleanId}" identifikatorli hisob topilmadi. Agar yangi bo'lsangiz, 'Yangi Akkaunt' tugmasi orqali hisob ochishingiz mumkin.`,
    source: 'web'
  };
}

// GoogleUserAccount ga o'girish (Mavjud ilova komponentlari bilan to'liq moslik uchun)
export function toGoogleUserAccount(p: UserProfile): GoogleUserAccount {
  return {
    email: p.email || `${p.managerId.toLowerCase()}@efootball.app`,
    displayName: p.displayName,
    photoURL: p.photoURL,
    isAdmin: p.isAdmin,
    adminVerified: p.isAdmin,
    isGoogleVerified: p.isGoogleVerified,
    is2FAVerified: p.isAdmin,
    authMethod: p.role === 'guest' ? 'guest' : p.telegramId ? 'telegram_bot' : 'google_oauth',
    managerId: p.managerId,
    telegramId: p.telegramId,
    gp: p.gp,
    eCoins: p.eCoins,
    matchesPlayed: p.matchesPlayed,
    matchesWon: p.matchesWon,
    matchesDrawn: p.matchesDrawn,
    matchesLost: p.matchesLost,
    goalsScored: p.goalsScored,
    goalsConceded: p.goalsConceded,
    signedInAt: p.lastLoginAt
  };
}

// Akkauntni o'chirish (Mehmon yoki test akkauntlar uchun)
export function deleteAccount(accountId: string): { success: boolean; nextAccount?: UserProfile } {
  let accounts = getAllSavedAccounts();
  const target = accounts.find(a => a.id === accountId);

  if (target?.isAdmin) {
    return { success: false }; // Bosh admin hisobini o'chirib bo'lmaydi
  }

  accounts = accounts.filter(a => a.id !== accountId);
  if (accounts.length === 0) {
    accounts = [createDefaultGuestProfile()];
  }

  saveAllAccounts(accounts);
  const next = accounts[0];
  localStorage.setItem(ACTIVE_ACCOUNT_ID_KEY, next.id);
  return { success: true, nextAccount: next };
}
