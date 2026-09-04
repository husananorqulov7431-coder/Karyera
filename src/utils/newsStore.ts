import { InGameNews, UserNewsViewRecord } from '../types';

const NEWS_STORAGE_KEY = 'efootball_ingame_news_v2';
const NEWS_SEEN_STORAGE_KEY = 'efootball_news_seen_records_v2';
const EXPIRY_DURATION_MS = 24 * 60 * 60 * 1000; // 24 soat

const INITIAL_NEWS: InGameNews[] = [
  {
    id: 'news-welcome-2026',
    title: '🔥 eFootball™ 2026 Yangi Mavsum & Epic Card Studio Ochildi!',
    content: 'Hurmatli murabbiylar va menejerlar! Endi o‘yinda o‘zingizning afsonaviy kartalaringizni professional darajada yaratishingiz, Full-body PNG renderlar va video orqa fonlar qo‘yishingiz mumkin. Har bir g‘alaba uchun 50 GP beriladi va 10 talik lotereyalar uchun 10 ta bepul urinish kafolatlanadi!',
    category: 'pack',
    createdAt: Date.now() - 1000 * 60 * 60 * 2, // 2 soat oldin
    createdBy: 'Konami eFootball Bosh Admin',
    priority: 'high',
    imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'news-telegram-bot',
    title: '🤖 Rasmiy Telegram Bot (@Futbolkarerapack_bot) Bilan Kirish Faollashtirildi',
    content: 'Telegram boti orqali shaxsiy Menejer ID va bir martalik maxfiy kod olib o‘yinga kiring. O‘yin balansingiz, ochilgan afsonaviy kartalaringiz va sovg‘alaringiz bot orqali avtomatik ravishda saqlanadi!',
    category: 'event',
    createdAt: Date.now() - 1000 * 60 * 60 * 5, // 5 soat oldin
    createdBy: 'Admin Xavfsizlik Xizmati',
    priority: 'normal'
  }
];

export function getAllNews(): InGameNews[] {
  try {
    const raw = localStorage.getItem(NEWS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(INITIAL_NEWS));
      return INITIAL_NEWS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_NEWS;
  } catch (err) {
    console.warn('Failed to load news:', err);
    return INITIAL_NEWS;
  }
}

export function getSeenRecords(): Record<string, number> {
  try {
    const raw = localStorage.getItem(NEWS_SEEN_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) || {};
  } catch {
    return {};
  }
}

export function markNewsAsSeen(newsId: string): void {
  const records = getSeenRecords();
  if (!records[newsId]) {
    records[newsId] = Date.now();
    try {
      localStorage.setItem(NEWS_SEEN_STORAGE_KEY, JSON.stringify(records));
    } catch (err) {
      console.error('Failed to mark news seen:', err);
    }
  }
}

export function getRemainingTimeForSeenNews(newsId: string): number | null {
  const records = getSeenRecords();
  const seenAt = records[newsId];
  if (!seenAt) return null; // hali ko'rilmagan (yangi)
  const remaining = seenAt + EXPIRY_DURATION_MS - Date.now();
  return remaining > 0 ? remaining : 0;
}

/**
 * Foydalanuvchi uchun ko'rinadigan yangiliklar:
 * Agar foydalanuvchi yangilikni ko'rgan bo'lsa va ko'rganidan so'ng 24 soat o'tgan bo'lsa,
 * bu yangilik uning ro'yxatidan avtomatik ravishda yashiriladi/o'chadi.
 * Admin esa barcha yangiliklarni ko'ra oladi.
 */
export function getUserVisibleNews(isAdmin = false): InGameNews[] {
  const all = getAllNews();
  if (isAdmin) return all;

  const records = getSeenRecords();
  const now = Date.now();

  return all.filter(news => {
    const seenAt = records[news.id];
    if (!seenAt) return true; // hali ko'rilmagan, ko'rinsin
    return (now - seenAt) < EXPIRY_DURATION_MS; // 24 soat ichida bo'lsa ko'rinsin
  });
}

export function createInGameNews(
  news: Omit<InGameNews, 'id' | 'createdAt'>
): InGameNews {
  const all = getAllNews();
  const newItem: InGameNews = {
    ...news,
    id: `news-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: Date.now()
  };
  all.unshift(newItem);
  try {
    localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(all));
  } catch (err) {
    console.error('Failed to create news:', err);
  }
  return newItem;
}

export function deleteInGameNews(newsId: string): InGameNews[] {
  const all = getAllNews();
  const filtered = all.filter(n => n.id !== newsId);
  try {
    localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('Failed to delete news:', err);
  }
  return filtered;
}
