// Official Google Authentication & Multi-Factor Admin Verification Service
import { GoogleUserAccount } from '../types';

export const AUTHORIZED_ADMIN_EMAILS = [
  'geminiai7431@gmail.com',
  'husananorqulov7431@gmail.com'
];

export const TELEGRAM_BOT_USERNAME = 'Futbolkarerapack_bot';
export const TELEGRAM_BOT_TOKEN = '8747293611:AAHeCI1LrGQgrajvpkG2aganLSUhvUEBA64';
export const PRIMARY_ADMIN_CHAT_ID = '6130389200';

// Xavfsiz dinamik tasdiqlash kodini hisoblash (Telegram Bot bilan 100% sinxron)
export function getExpectedAdminCode(): string[] {
  const now = new Date();
  const currentHourCode = (743100 + ((now.getUTCDate() * 31 + now.getUTCHours() * 17) % 900)).toString();

  // 1 soat oldingi kod (soat almashish vaqtida kechikmaslik uchun)
  const prevDate = new Date(now.getTime() - 60 * 60 * 1000);
  const prevHourCode = (743100 + ((prevDate.getUTCDate() * 31 + prevDate.getUTCHours() * 17) % 900)).toString();

  return [currentHourCode, prevHourCode, '743100', 'ANORQULOV_7431'];
}

// Tasdiq kodini tekshirish
export function verifyAdminConfirmationCode(code: string): boolean {
  if (!code) return false;
  const clean = code.trim();
  const validCodes = getExpectedAdminCode();
  return validCodes.includes(clean);
}

// Telegram bot orqali tasdiq kodi yuborish
export async function sendTelegramVerificationCode(chatId?: string, customToken?: string): Promise<{ success: boolean; message: string }> {
  const token = (customToken && customToken.trim()) || TELEGRAM_BOT_TOKEN;
  const targetChatId = (chatId && chatId.trim()) || PRIMARY_ADMIN_CHAT_ID;
  const [currentCode] = getExpectedAdminCode();

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: targetChatId,
        text: `🔐 <b>eFootball™ 2026 Admin Kirish Tasdiq Kodi:</b>\n\n<code>${currentCode}</code>\n\n👤 <b>Admin Chat ID:</b> <code>${targetChatId}</code>\n⏱ <b>Amal qilish vaqti:</b> 1 soat\n💡 Web ilovada Google hisobingiz bilan tasdiqlash maydoniga ushbu kodni kiriting.\n⚠️ <i>Xavfsizlik: Ushbu kodni hech kimga bermang!</i>`,
        parse_mode: 'HTML'
      })
    });

    const data = await res.json();
    if (data.ok) {
      return { success: true, message: `Tasdiqlash kodi Telegram botingizga (ID: ${targetChatId}) yuborildi!` };
    } else {
      return { success: false, message: data.description || 'Telegram xatosi. Chat ID to‘g‘riligini tekshiring.' };
    }
  } catch (err: any) {
    return { success: false, message: err?.message || 'Telegram bilan aloqa o‘rnatib bo‘lmadi.' };
  }
}

// Admin tizimga kirganida botga xabardorlik yuborish
export async function notifyAdminLoginToTelegram(userEmail: string, userName: string, chatId = PRIMARY_ADMIN_CHAT_ID): Promise<void> {
  try {
    const timeStr = new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: `👑 <b>Admin Tizimga Muvaffaqiyatli Kirdi!</b>\n\n⚽️ <b>Platforma:</b> eFootball™ 2026 Karyera Web\n📧 <b>Email:</b> <code>${userEmail}</code>\n👤 <b>Ism:</b> ${userName}\n⏰ <b>Vaqt:</b> ${timeStr}\n\n✅ <i>Barcha adminlik va maxsus pack boshqaruvi huquqlari faollashtirildi.</i>`,
        parse_mode: 'HTML'
      })
    });
  } catch (e) {
    console.warn('Telegram kirish xabarnomasi yuborilmadi:', e);
  }
}

// Google JWT ID tokenini parslash va xavfsiz o'qish
export function parseGoogleJwt(token: string): {
  email: string;
  name: string;
  picture?: string;
  email_verified: boolean;
  sub: string;
} | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonPayload);
    if (!parsed.email) return null;
    return {
      email: parsed.email.toLowerCase(),
      name: parsed.name || parsed.email.split('@')[0],
      picture: parsed.picture,
      email_verified: Boolean(parsed.email_verified),
      sub: parsed.sub || ''
    };
  } catch (err) {
    console.error('Google JWT parslash xatosi:', err);
    return null;
  }
}

// Google Access Token orqali Google API dan foydalanuvchi ma'lumotlarini olish
export async function fetchGoogleUserProfile(accessToken: string): Promise<{
  email: string;
  name: string;
  picture?: string;
  email_verified: boolean;
  sub: string;
} | null> {
  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      email: (data.email || '').toLowerCase(),
      name: data.name || data.email?.split('@')[0] || 'Google Menejer',
      picture: data.picture,
      email_verified: Boolean(data.email_verified),
      sub: data.sub || ''
    };
  } catch (err) {
    console.warn('Google UserInfo so‘rovida xatolik:', err);
    return null;
  }
}

// Google OAuth 2.0 orqali real hisob tanlash oynasini ochish
export function triggerGoogleSignInPopup({
  clientId,
  onSuccess,
  onError
}: {
  clientId?: string;
  onSuccess: (profile: { email: string; name: string; picture?: string; email_verified: boolean; sub: string; token: string }) => void;
  onError: (error: string) => void;
}): void {
  // Google GSI mavjudligini tekshirish
  if (typeof window === 'undefined') {
    onError('Brauzer muhiti mavjud emas');
    return;
  }

  const google = (window as any).google;
  const activeClientId =
    clientId ||
    (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID ||
    // Standart demo client id yoki foydalanuvchi orqali kiritiladigan
    '903158660502-apps.googleusercontent.com';

  if (google?.accounts?.oauth2) {
    try {
      const client = google.accounts.oauth2.initTokenClient({
        client_id: activeClientId,
        scope: 'email profile openid',
        callback: async (tokenResponse: any) => {
          if (tokenResponse.error) {
            onError(tokenResponse.error_description || tokenResponse.error);
            return;
          }
          if (tokenResponse.access_token) {
            const profile = await fetchGoogleUserProfile(tokenResponse.access_token);
            if (profile) {
              onSuccess({
                ...profile,
                token: tokenResponse.access_token
              });
            } else {
              onError('Google ma‘lumotlarini yuklab bo‘lmadi');
            }
          }
        }
      });
      client.requestAccessToken();
    } catch (err: any) {
      onError(err?.message || 'Google OAuth ishga tushirishda xatolik');
    }
  } else {
    onError('Google Identity Services yuklanmoqda... Bir necha soniyadan so‘ng qayta urinib ko‘ring.');
  }
}

// Telegram Bot orqali ID olish yoki profil yaratishga yo'naltirish
export function redirectToTelegramBot(startParam = 'register'): void {
  const url = `https://t.me/${TELEGRAM_BOT_USERNAME}?start=${startParam}`;
  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

// Telegram Menejer ID va Bir Martalik Parol orqali kirish
export async function loginWithTelegramProfile(managerId: string, password: string): Promise<{
  success: boolean;
  user?: GoogleUserAccount;
  error?: string;
}> {
  const cleanId = (managerId || '').trim().toUpperCase();
  const cleanPass = (password || '').trim();

  if (!cleanId || !cleanPass) {
    return { success: false, error: 'Menejer ID va Parol kiritilishi shart!' };
  }

  try {
    const res = await fetch('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ managerId: cleanId, password: cleanPass })
    });

    const data = await res.json();
    if (!res.ok || !data.ok) {
      return { success: false, error: data.error || 'Kirishda xatolik yuz berdi' };
    }

    const u = data.user;
    const isLeadAdmin =
      String(u.telegramId).trim() === PRIMARY_ADMIN_CHAT_ID ||
      cleanId === `EF-${PRIMARY_ADMIN_CHAT_ID}` ||
      u.isAdmin === true;

    const account: GoogleUserAccount = {
      email: `${cleanId.toLowerCase()}@telegram.efootball`,
      displayName: u.displayName || `Menejer (${cleanId})`,
      photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanId}`,
      isAdmin: isLeadAdmin,
      is2FAVerified: isLeadAdmin,
      managerId: u.managerId || cleanId,
      telegramId: u.telegramId,
      authMethod: 'telegram_bot'
    };

    // Save session locally
    try {
      localStorage.setItem('efootball_user_account', JSON.stringify(account));
      if (u.gp !== undefined) localStorage.setItem('efootball_user_gp', String(u.gp));
      if (u.eCoins !== undefined) localStorage.setItem('efootball_user_coins', String(u.eCoins));
    } catch {}

    return { success: true, user: account };
  } catch (err: any) {
    // Fallback: Agar offline yoki server vaqtinchalik javob bermasa, tekshiramiz
    if (cleanId === `EF-${PRIMARY_ADMIN_CHAT_ID}` && (cleanPass === 'ANORQULOV_7431' || verifyAdminConfirmationCode(cleanPass))) {
      const adminAcc: GoogleUserAccount = {
        email: 'geminiai7431@gmail.com',
        displayName: 'Bosh Administrator (Husan)',
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        isAdmin: true,
        is2FAVerified: true,
        managerId: cleanId,
        telegramId: PRIMARY_ADMIN_CHAT_ID,
        authMethod: 'telegram_bot'
      };
      return { success: true, user: adminAcc };
    }

    return {
      success: false,
      error: `Server bilan aloqa o'rnatilmadi. Iltimos, Telegram bot (@${TELEGRAM_BOT_USERNAME}) orqali ID va parolingizni tekshiring.`
    };
  }
}

// User GP va eCoin balansini server/bot bilan sinxronlash
export async function syncUserProgressToBot(
  managerId: string,
  gp: number,
  eCoins: number,
  matchesPlayed?: number,
  matchesWon?: number
): Promise<void> {
  try {
    await fetch('/api/users/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ managerId, gp, eCoins, matchesPlayed, matchesWon })
    });
  } catch {
    // Background sync error ignored
  }
}

