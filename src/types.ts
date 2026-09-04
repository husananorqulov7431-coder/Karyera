export type PositionZone = 'GK' | 'DEF' | 'MID' | 'FWD';

export type PositionRole =
  | 'GK'
  | 'CB'
  | 'LB'
  | 'RB'
  | 'LWB'
  | 'RWB'
  | 'DMF'
  | 'CMF'
  | 'AMF'
  | 'LMF'
  | 'RMF'
  | 'LWF'
  | 'RWF'
  | 'CF'
  | 'ST'
  | 'SS';

export type CardTier = 'goat' | 'legend' | 'toty' | 'gold' | 'emerald' | 'silver';

export type CardBackgroundTheme =
  | 'auto'
  | 'gold-stadium'
  | 'champions-galaxy'
  | 'neon-cyber'
  | 'magma-fire'
  | 'emerald-pitch'
  | 'ice-diamond'
  | 'royal-purple';

export type PlayStyle =
  | 'Tezkor hujumchi'
  | 'Jarima maydoni ovchisi'
  | 'Ijodkor pleymeyker'
  | 'To‘p qaytaruvchi'
  | 'Box-to-box'
  | 'Texnik qanot'
  | 'Tezkor qanot'
  | 'Himoyaviy tayanch'
  | 'Pas ustasi'
  | 'Klassik himoyachi'
  | 'Darvoza qo‘riqchisi'
  | 'Pressing mutaxassisi'
  | 'Uzoq zarba ustasi'
  | 'Erkin rol'
  | 'Qanotdan ichkariga kiruvchi'
  | 'Chuqur pleymeyker'
  | 'Tezkor himoyachi'
  | 'Sovuqqon ijodkor'
  | 'Texnik sehrgar'
  | 'Texnik kuchli dribling';

export interface Nation {
  code: string;
  name: string;
  flag: string;
  power: number;
  confederation: 'uefa' | 'conmebol' | 'afc' | 'concacaf' | 'caf' | 'ofc';
}

export interface PlayerAttributes {
  pac: number;
  sho: number;
  pas: number;
  dri: number;
  def: number;
  phy: number;
  // Goalkeeper specific
  div?: number;
  ref?: number;
  han?: number;
  pos?: number;
  kic?: number;
  spd?: number;
}

export interface AvatarConfig {
  skinTone: string;
  hairStyle: 'short-fade' | 'curls' | 'ponytail' | 'topknot' | 'buzz' | 'parted' | 'afro' | 'wavy-headband';
  hairColor: string;
  facialHair?: 'none' | 'stubble' | 'full-beard' | 'goatee';
  kitPrimaryColor: string;
  kitSecondaryColor: string;
  likenessName?: string;
}

export interface Player {
  id: string;
  name: string;
  role: string;
  displayRole?: string;
  naturalPositions: string[];
  family: 'GK' | 'DF' | 'MF' | 'FW';
  ovr: number;
  potential: number;
  nation: Nation;
  club: string;
  league: string;
  cardTier: CardTier;
  cardBackgroundTheme?: CardBackgroundTheme;
  cardBackgroundVideo?: string;
  boosterSkill?: string;
  customPhotoUrl?: string;
  customBadgeUrl?: string;
  renderMode?: 'full' | 'circle';
  photoScale?: number;
  photoOffsetX?: number;
  photoOffsetY?: number;
  cardGlowColor?: string;
  videoOpacity?: number;
  attrs: PlayerAttributes;
  avatar?: AvatarConfig;
  playStyle: PlayStyle;
  skills: string[];
  age: number;
  foot: 'O‘ng' | 'Chap';
  height: number;
  weight: number;
  form: number;
  condition: number;
  marketValue: number;
  level: number;
  xp: number;
  stamina?: number; // 0 - 100
  careerHistory?: {
    season: number;
    club: string;
    apps: number;
    goals: number;
    assists: number;
    rating: number;
  }[];
  stats?: {
    games: number;
    goals: number;
    assists: number;
    cleanSheets: number;
    saves?: number;
    tackles?: number;
    trophies?: number;
  };
}

export interface CareerResult {
  player: Player;
  debutAge: number;
  primeAge: number;
  retireAge: number;
  careerYears: number;
  clubsCount: number;
  primaryClub: string;
  games: number;
  goals: number;
  assists: number;
  cleanSheets: number;
  saves: number;
  tackles: number;
  yellowCards: number;
  redCards: number;
  leagueTitles: number;
  domesticCups: number;
  clTitles: number;
  clGoals: number;
  nationalCaps: number;
  worldCupCaps: number;
  worldCupGoals: number;
  worldCupTitles: number;
  continentalCupTitles: number;
  ballonDor: number;
  goldenBoots: number;
  yashinTrophies: number;
  bestDefenderTrophies: number;
}

export interface SlotDef {
  id: string;
  role: string;
  x: number;
  y: number;
  zone: PositionZone;
}

export type FormationKey =
  | '4-3-3'
  | '4-2-3-1'
  | '4-4-2'
  | '3-5-2'
  | '3-4-3'
  | '5-3-2'
  | '4-1-2-1-2'
  | '4-3-1-2'
  | '5-2-3'
  | '4-5-1';

export interface MatchEvent {
  minute: number;
  type: 'goal' | 'save' | 'foul' | 'card' | 'sub' | 'whistle';
  text: string;
  team: 1 | 2;
  player?: string;
}

export interface OpponentTeam {
  id: string;
  name: string;
  league: string;
  rating: number;
  color: string;
  badge: string;
  tactics: string;
}

export interface LeaderboardItem {
  id: string;
  name: string;
  pos: string;
  nation: string;
  rating: number;
  bdo: number;
  wc: number;
  cl: number;
  isUser: boolean;
  avatar?: AvatarConfig;
}

export interface GoogleUserAccount {
  email: string;
  displayName: string;
  photoURL?: string;
  hideEmail?: boolean; // Maxfiylik uchun emailni yashirish/maskalash
  isAdmin: boolean;
  isGoogleVerified?: boolean; // Haqiqiy Google tizimi orqali tasdiqlanganmi
  adminVerified?: boolean; // Admin 2-bosqichli tasdiqdan o'tganmi
  is2FAVerified?: boolean;
  adminVerifiedAt?: number;
  authMethod?: 'google_oauth' | 'google_id_token' | 'email_code' | 'guest' | 'telegram_bot';
  googleSub?: string; // Google xavfsiz foydalanuvchi identifikatori
  managerId?: string; // Telegram bot bergan Shaxsiy Menejer ID (masalan: EF-6130389)
  telegramId?: string;
  tempPassword?: string;
  gp?: number; // eFootball Game Points: 1 match win = 50 GP, 20 wins = 1000 GP (10-pack)
  eCoins?: number;
  matchesPlayed?: number;
  matchesWon?: number;
  matchesDrawn?: number;
  matchesLost?: number;
  goalsScored?: number;
  goalsConceded?: number;
  signedInAt?: number;
}

export interface SpecialPack {
  id: string;
  name: string;
  badge: 'EPIC' | 'SHOW TIME' | 'HIGHLIGHT' | 'SPECIAL';
  description: string;
  themeColor: string; // e.g. 'emerald', 'gold', 'cyan', 'purple'
  startsAt?: number; // timestamp in ms when pack becomes active
  expiresAt: number; // timestamp in ms
  freePullsTotal: number; // e.g. 10
  freePullsRemaining: number;
  costPer10: number; // e.g. 1000 GP (20 matches won)
  costPer1: number; // 100 GP
  featuredPlayerIds?: string[];
  players: Player[]; // Box drawdagi qolgan o'yinchilar
  originalPlayers?: Player[]; // Boxni qayta tiklash (Reset) uchun asl ro'yxat
  totalPoolCount?: number; // Masalan 100 yoki 150 ta PES Box Draw
  pulledCount?: number;
  createdAt: number;
  createdBy: string;
  isActive?: boolean;
}

export interface PackOpenLog {
  id: string;
  packId: string;
  packName: string;
  userEmail: string;
  userName: string;
  pullCount: 1 | 10;
  spentGp: number;
  pulledPlayers: {
    id: string;
    name: string;
    ovr: number;
    role: string;
    isEpic: boolean;
  }[];
  timestamp: number;
}

export interface RawJsonPlayerInput {
  name: string;
  role: string;
  ovr: number;
  club?: string;
  league?: string;
  nation?: string;
  cardTier?: CardTier;
  attrs?: Partial<PlayerAttributes>;
  stats?: {
    games?: number;
    goals?: number;
    assists?: number;
    cleanSheets?: number;
    trophies?: number;
  };
}

export interface RawJsonPackInput {
  packName: string;
  badge?: 'EPIC' | 'SHOW TIME' | 'HIGHLIGHT' | 'SPECIAL';
  description?: string;
  startsInHours?: number;
  expiresInDays?: number;
  freePulls?: number;
  costPer10?: number;
  players: RawJsonPlayerInput[];
}

// ----------------------------------------------------
// MAXSUS KARTA DIZAYNLARI SHABLONLARI (STUDIO PRESETS)
// ----------------------------------------------------
export interface CardDesignTemplate {
  id: string;
  name: string; // Masalan: "Real Madrid Ballon d'Or 2026", "Gold Icon Cutout"
  createdAt: number;
  updatedAt?: number;
  cardTier: CardTier;
  cardBackgroundTheme?: CardBackgroundTheme;
  cardBackgroundVideo?: string;
  videoOpacity?: number;
  renderMode: 'full' | 'circle';
  customPhotoUrl?: string;
  customBadgeUrl?: string;
  photoScale: number;
  photoOffsetX: number;
  photoOffsetY: number;
  boosterSkill?: string;
  club?: string;
  league?: string;
  cardGlowColor?: string;
  previewImageUrl?: string;
}

// ----------------------------------------------------
// O'YIN YANGILIKLARI & E'LONLAR (IN-GAME NOTICEBOARD)
// ----------------------------------------------------
export interface InGameNews {
  id: string;
  title: string;
  content: string;
  category: 'pack' | 'event' | 'maintenance' | 'gift';
  imageUrl?: string;
  attachmentName?: string;
  attachmentData?: string; // base64 yoki URL
  attachmentSize?: string;
  createdAt: number;
  createdBy: string;
  priority?: 'high' | 'normal';
}

export interface UserNewsViewRecord {
  newsId: string;
  firstSeenAt: number; // Foydalanuvchi ko'rgan vaqt
  expired: boolean;
}

// ----------------------------------------------------
// ILOVA VERSIYA VA RELIZ BOSHQARUVI (VERSION SYSTEM)
// ----------------------------------------------------
export interface AppVersionInfo {
  version: string; // Masalan "v2.6.0"
  releaseTitle: string;
  releaseNotes: string[];
  releasedAt: number;
  hasPublishedPack: boolean; // Faqat haqiqiy yangi pack chiqqandagina o'yinchilarda yangilanish talab qilinadi
  activePackIds: string[];
}


