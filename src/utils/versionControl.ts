import { AppVersionInfo, SpecialPack } from '../types';

const VERSION_STORAGE_KEY = 'efootball_app_version_state_v2';
const USER_APPLIED_VERSION_KEY = 'efootball_user_applied_version_v2';

const DEFAULT_VERSION: AppVersionInfo = {
  version: 'v2.6.0',
  releaseTitle: 'eFootball™ 2026 Yangi Mavsum Relizi',
  releaseNotes: [
    'Epic Card Studio: Yangi Full-body PNG render va shablonlar',
    'Yangiliklar & E‘lonlar paneli qo‘shildi',
    'Avtomatik versiya sinxronizatsiyasi va barqarorlik'
  ],
  releasedAt: Date.now() - 86400000,
  hasPublishedPack: true,
  activePackIds: []
};

export function getAppVersionInfo(): AppVersionInfo {
  try {
    const raw = localStorage.getItem(VERSION_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(VERSION_STORAGE_KEY, JSON.stringify(DEFAULT_VERSION));
      return DEFAULT_VERSION;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_VERSION;
  }
}

export function getUserAppliedVersion(): string {
  try {
    return localStorage.getItem(USER_APPLIED_VERSION_KEY) || 'v2.6.0';
  } catch {
    return 'v2.6.0';
  }
}

export function markUserVersionApplied(version: string): void {
  try {
    localStorage.setItem(USER_APPLIED_VERSION_KEY, version);
  } catch (err) {
    console.error('Failed to save user applied version:', err);
  }
}

/**
 * Foydalanuvchida yangilanish (Update popup) chiqishi kerakmi yoki yo'qligini tekshirish:
 * 1. Admin tomonidan haqiqiy yangi versiya chiqarilgan bo'lishi kerak.
 * 2. `hasPublishedPack === true` bo'lishi kerak (agar admin dizayn qilib ishlatmagan bo'lsa va pack kelmagan bo'lsa, foydalanuvchiga yangilanish talab qilinmaydi!).
 * 3. Foydalanuvchining o'zida saqlangan versiya adminning so'nggi versiyasidan farq qilishi kerak.
 */
export function shouldPromptUserUpdate(currentPacks: SpecialPack[] = []): boolean {
  const currentAppVersion = getAppVersionInfo();
  const userVersion = getUserAppliedVersion();

  // Agar foydalanuvchida allaqachon so'nggi versiya o'rnatilgan bo'lsa
  if (userVersion === currentAppVersion.version) {
    return false;
  }

  // Qat'iy qoida: Agar pack kelmagan bo'lsa (yoki published packlar yo'q bo'lsa) -> yangilanish bo'lmasin!
  if (!currentAppVersion.hasPublishedPack) {
    return false;
  }

  // Agar faol packlar haqiqatan mavjud bo'lsa
  const hasActiveLivePacks = currentPacks.length > 0;
  if (!hasActiveLivePacks && currentAppVersion.activePackIds.length === 0) {
    return false;
  }

  return true;
}

/**
 * Admin yangi versiya e'lon qiladi (Publish Release):
 * Agar yangi packlar mavjud bo'lsa `hasPublishedPack = true` belgilanadi.
 */
export function publishNewAppVersion(params: {
  version: string;
  releaseTitle: string;
  releaseNotes: string[];
  activePackIds: string[];
  hasPublishedPack: boolean;
}): AppVersionInfo {
  const newVersionInfo: AppVersionInfo = {
    version: params.version.trim() || `v2.${Math.floor(Date.now() / 100000 % 100)}.0`,
    releaseTitle: params.releaseTitle.trim() || 'Yangi O‘yin Yangilanishi',
    releaseNotes: params.releaseNotes.filter(n => n.trim().length > 0),
    releasedAt: Date.now(),
    hasPublishedPack: params.hasPublishedPack,
    activePackIds: params.activePackIds
  };

  try {
    localStorage.setItem(VERSION_STORAGE_KEY, JSON.stringify(newVersionInfo));
  } catch (err) {
    console.error('Failed to publish version info:', err);
  }

  return newVersionInfo;
}
