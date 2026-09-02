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
  attrs: PlayerAttributes;
  avatar: AvatarConfig;
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
