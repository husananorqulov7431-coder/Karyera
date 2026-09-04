import { CardDesignTemplate } from '../types';

const STORAGE_KEY = 'efootball_saved_card_designs_v2';

const DEFAULT_DESIGNS: CardDesignTemplate[] = [
  {
    id: 'preset-ballon-dor-2026',
    name: "Ballon d'Or Gold 2026",
    createdAt: Date.now() - 86400000 * 3,
    cardTier: 'goat',
    cardBackgroundTheme: 'gold-stadium',
    cardBackgroundVideo: 'gold-stadium',
    videoOpacity: 0.7,
    renderMode: 'full',
    customPhotoUrl: '',
    customBadgeUrl: '',
    photoScale: 1.05,
    photoOffsetX: 0,
    photoOffsetY: -5,
    boosterSkill: '+2 Ball-carrying',
    club: 'Real Madrid',
    league: 'La Liga EA Sports'
  },
  {
    id: 'preset-neon-cyber-showtime',
    name: 'Neon Cyber Show Time',
    createdAt: Date.now() - 86400000 * 2,
    cardTier: 'legend',
    cardBackgroundTheme: 'emerald-pitch',
    cardBackgroundVideo: 'emerald-pitch',
    videoOpacity: 0.65,
    renderMode: 'full',
    customPhotoUrl: '',
    customBadgeUrl: '',
    photoScale: 1.0,
    photoOffsetX: 0,
    photoOffsetY: 0,
    boosterSkill: '+2 Fortress Tackle',
    club: 'Manchester City',
    league: 'Premier League'
  },
  {
    id: 'preset-retro-vintage-icon',
    name: 'Retro Classic Vintage 1998',
    createdAt: Date.now() - 86400000 * 1,
    cardTier: 'toty',
    cardBackgroundTheme: 'neon-cyber',
    cardBackgroundVideo: 'neon-cyber',
    videoOpacity: 0.6,
    renderMode: 'circle',
    customPhotoUrl: '',
    customBadgeUrl: '',
    photoScale: 1.0,
    photoOffsetX: 0,
    photoOffsetY: 0,
    boosterSkill: '+2 Phenomenal Finishing',
    club: 'AC Milan',
    league: 'Serie A Enilive'
  }
];

export function getSavedCardDesigns(): CardDesignTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DESIGNS));
      return DEFAULT_DESIGNS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_DESIGNS;
  } catch (err) {
    console.warn('Failed to read saved card designs:', err);
    return DEFAULT_DESIGNS;
  }
}

export function saveCardDesign(
  design: Omit<CardDesignTemplate, 'id' | 'createdAt'>,
  existingId?: string
): CardDesignTemplate {
  const current = getSavedCardDesigns();
  let updatedItem: CardDesignTemplate;

  if (existingId) {
    const index = current.findIndex(d => d.id === existingId);
    if (index >= 0) {
      updatedItem = {
        ...current[index],
        ...design,
        updatedAt: Date.now()
      };
      current[index] = updatedItem;
    } else {
      updatedItem = {
        ...design,
        id: `design-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        createdAt: Date.now()
      };
      current.unshift(updatedItem);
    }
  } else {
    updatedItem = {
      ...design,
      id: `design-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now()
    };
    current.unshift(updatedItem);
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch (err) {
    console.error('Failed to persist saved card design:', err);
  }

  return updatedItem;
}

export function deleteCardDesign(id: string): CardDesignTemplate[] {
  const current = getSavedCardDesigns();
  const filtered = current.filter(d => d.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('Failed to delete card design:', err);
  }
  return filtered;
}

export function exportCardDesignsToJson(): string {
  const designs = getSavedCardDesigns();
  return JSON.stringify({
    app: 'eFootball 2026 Card Studio',
    version: '2.6',
    exportedAt: new Date().toISOString(),
    designs
  }, null, 2);
}

export function importCardDesignsFromJson(jsonString: string): { success: boolean; count: number; error?: string } {
  try {
    const data = JSON.parse(jsonString);
    const list = Array.isArray(data) ? data : data?.designs;
    if (!Array.isArray(list)) {
      return { success: false, count: 0, error: 'JSON formatida dizaynlar ro‘yxati topilmadi.' };
    }

    const current = getSavedCardDesigns();
    const existingIds = new Set(current.map(d => d.id));
    let addedCount = 0;

    for (const item of list) {
      if (!item.name) continue;
      const cleanDesign: CardDesignTemplate = {
        id: existingIds.has(item.id) ? `design-${Date.now()}-${Math.random().toString(36).substring(2, 5)}` : (item.id || `design-${Date.now()}`),
        name: String(item.name).trim(),
        createdAt: item.createdAt || Date.now(),
        cardTier: item.cardTier || 'EPIC',
        cardBackgroundTheme: item.cardBackgroundTheme || 'epic-gold',
        cardBackgroundVideo: item.cardBackgroundVideo || 'epic-gold',
        videoOpacity: typeof item.videoOpacity === 'number' ? item.videoOpacity : 0.65,
        renderMode: item.renderMode === 'circle' ? 'circle' : 'full',
        customPhotoUrl: item.customPhotoUrl || '',
        customBadgeUrl: item.customBadgeUrl || '',
        photoScale: typeof item.photoScale === 'number' ? item.photoScale : 1.0,
        photoOffsetX: typeof item.photoOffsetX === 'number' ? item.photoOffsetX : 0,
        photoOffsetY: typeof item.photoOffsetY === 'number' ? item.photoOffsetY : 0,
        boosterSkill: item.boosterSkill || undefined,
        club: item.club || '',
        league: item.league || ''
      };
      current.push(cleanDesign);
      existingIds.add(cleanDesign.id);
      addedCount++;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    return { success: true, count: addedCount };
  } catch (err: any) {
    return { success: false, count: 0, error: err?.message || 'JSON faylni o‘qishda xatolik yuz berdi.' };
  }
}
