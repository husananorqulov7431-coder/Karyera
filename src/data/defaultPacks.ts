import { SpecialPack, Player } from '../types';
import { REAL_STAR_PLAYERS, generateRandomPlayer } from './realPlayers';
import { getNationByName } from './nations';
import { ONE_HUNDRED_REAL_PLAYERS_POOL, OFFICIAL_100_BOX_DRAW_PACK } from './oneHundredPlayersPack';

// Helper to create a legend player
function createLegend(
  id: string,
  name: string,
  role: string,
  ovr: number,
  nationName: string,
  club: string,
  attrs: { pac: number; sho: number; pas: number; dri: number; def: number; phy: number },
  avatarLikeness: string,
  skinTone: string,
  hairColor: string,
  kitPrimary = '#ffffff',
  kitSecondary = '#1e3a8a'
): Player {
  return {
    id,
    name,
    role,
    displayRole: role,
    naturalPositions: [role],
    family: role === 'GK' ? 'GK' : ['CB', 'LB', 'RB'].includes(role) ? 'DF' : ['CMF', 'AMF', 'DMF', 'LMF', 'RMF'].includes(role) ? 'MF' : 'FW',
    ovr,
    potential: Math.min(99, ovr + 2),
    nation: getNationByName(nationName),
    club,
    league: 'Afsonalar & Elit Klublar',
    cardTier: 'legend',
    attrs,
    avatar: {
      skinTone,
      hairStyle: 'short-fade',
      hairColor,
      facialHair: 'stubble',
      kitPrimaryColor: kitPrimary,
      kitSecondaryColor: kitSecondary,
      likenessName: avatarLikeness
    },
    playStyle: 'Ijodkor pleymeyker',
    skills: ['Speed Dribbling', 'Through Passing', 'First-time Shot', 'Outside Curler'],
    age: 33,
    foot: 'O‘ng',
    height: 182,
    weight: 78,
    form: 95,
    condition: 95,
    marketValue: ovr * ovr * 25000,
    level: 25,
    xp: 0,
    stamina: 100,
    stats: { games: 600, goals: 120, assists: 150, cleanSheets: 0, trophies: 15 }
  };
}

// 1. Worldwide Legends Pool (150 players)
const WORLDWIDE_LEGENDS_150_POOL: Player[] = [
  // Top 10 Epics
  createLegend('leg_messi', 'Lionel Messi (Epic 2026)', 'CF', 96, 'Argentina', 'Worldwide Legends', { pac: 88, sho: 97, pas: 98, dri: 99, def: 40, phy: 75 }, 'messi', '#f4caa1', '#4a2f18', '#f59e0b', '#1e1b4b'),
  createLegend('leg_ronaldo', 'Cristiano Ronaldo (Epic 2026)', 'ST', 96, 'Portugaliya', 'Worldwide Legends', { pac: 91, sho: 98, pas: 84, dri: 92, def: 38, phy: 90 }, 'ronaldo', '#e4af80', '#1c1917', '#ef4444', '#172554'),
  createLegend('leg_maldini', 'Paolo Maldini', 'CB', 95, 'Italiya', 'AC Milan Legends', { pac: 86, sho: 55, pas: 82, dri: 78, def: 98, phy: 92 }, 'maldini', '#fed7aa', '#451a03', '#dc2626', '#000000'),
  createLegend('leg_zidane', 'Zinedine Zidane', 'AMF', 95, 'Fransiya', 'France Legends', { pac: 84, sho: 90, pas: 98, dri: 97, def: 72, phy: 88 }, 'zidane', '#f4caa1', '#1e293b', '#1d4ed8', '#ffffff'),
  createLegend('leg_ronaldinho', 'Ronaldinho Gaúcho', 'LWF', 94, 'Braziliya', 'FC Barcelona Legends', { pac: 92, sho: 90, pas: 94, dri: 99, def: 42, phy: 80 }, 'ronaldinho', '#c88c5a', '#000000', '#fbbf24', '#1e3a8a'),
  createLegend('leg_cruyff', 'Johan Cruyff', 'SS', 95, 'Niderlandiya', 'Ajax & Barca Legends', { pac: 91, sho: 92, pas: 94, dri: 97, def: 50, phy: 78 }, 'cruyff', '#fed7aa', '#78350f', '#ea580c', '#ffffff'),
  createLegend('leg_beckham', 'David Beckham', 'RMF', 93, 'Angliya', 'Man United Legends', { pac: 82, sho: 91, pas: 97, dri: 88, def: 72, phy: 82 }, 'beckham', '#f4caa1', '#d97706', '#dc2626', '#ffffff'),
  createLegend('leg_henry', 'Thierry Henry', 'CF', 94, 'Fransiya', 'Arsenal Legends', { pac: 96, sho: 94, pas: 86, dri: 93, def: 45, phy: 84 }, 'henry', '#9f6b43', '#000000', '#dc2626', '#ffffff'),
  createLegend('leg_kaka', 'Kaká', 'AMF', 93, 'Braziliya', 'AC Milan Legends', { pac: 93, sho: 90, pas: 91, dri: 95, def: 55, phy: 80 }, 'kaka', '#fed7aa', '#1c1917', '#dc2626', '#000000'),
  createLegend('leg_rcarlos', 'Roberto Carlos', 'LB', 92, 'Braziliya', 'Real Madrid Legends', { pac: 95, sho: 94, pas: 86, dri: 88, def: 85, phy: 90 }, 'carlos', '#c88c5a', '#000000', '#ffffff', '#1e3a8a'),
  createLegend('leg_casillas', 'Iker Casillas', 'GK', 93, 'Ispaniya', 'Real Madrid Legends', { pac: 60, sho: 20, pas: 75, dri: 40, def: 93, phy: 85 }, 'casillas', '#fed7aa', '#1c1917', '#ffffff', '#d4af37'),
  createLegend('leg_xavi', 'Xavi Hernández', 'CMF', 93, 'Ispaniya', 'Barcelona Legends', { pac: 78, sho: 80, pas: 98, dri: 94, def: 78, phy: 75 }, 'xavi', '#fed7aa', '#1c1917', '#1d4ed8', '#dc2626'),
  createLegend('leg_iniesta', 'Andrés Iniesta', 'CMF', 93, 'Ispaniya', 'Barcelona Legends', { pac: 82, sho: 82, pas: 97, dri: 96, def: 68, phy: 74 }, 'iniesta', '#fed7aa', '#78350f', '#1d4ed8', '#dc2626'),
  // Modern Superstars (Highlights)
  ...REAL_STAR_PLAYERS.slice(0, 37).map((p, idx) => ({ ...p, id: `leg_pool_${idx}_${p.id}`, stamina: 100 }))
];

// Fill up to 150 players for Worldwide Legends
while (WORLDWIDE_LEGENDS_150_POOL.length < 150) {
  const i = WORLDWIDE_LEGENDS_150_POOL.length + 1;
  const roles = ['CF', 'ST', 'RWF', 'LWF', 'AMF', 'CMF', 'DMF', 'CB', 'LB', 'RB', 'GK'] as const;
  const role = roles[i % roles.length];
  const p = generateRandomPlayer(role);
  p.id = `ww_legends_extra_${i}`;
  p.name = `Yulduz O‘yinchi ${i}`;
  p.ovr = 78 + (i % 9); // 78 to 86
  WORLDWIDE_LEGENDS_150_POOL.push(p);
}

// 2. Real Madrid Galacticos Pool (50 players)
const REAL_MADRID_GALACTICOS_50_POOL: Player[] = [
  // Top Galacticos Stars
  createLegend('rm_mbappe', 'Kylian Mbappé', 'CF', 95, 'Fransiya', 'Real Madrid', { pac: 97, sho: 94, pas: 85, dri: 95, def: 42, phy: 82 }, 'mbappe', '#9f6b43', '#000000', '#ffffff', '#d4af37'),
  createLegend('rm_bellingham', 'Jude Bellingham', 'AMF', 93, 'Angliya', 'Real Madrid', { pac: 85, sho: 89, pas: 90, dri: 92, def: 84, phy: 89 }, 'bellingham', '#9f6b43', '#000000', '#ffffff', '#d4af37'),
  createLegend('rm_vinicius', 'Vinícius Júnior', 'LWF', 93, 'Braziliya', 'Real Madrid', { pac: 98, sho: 88, pas: 85, dri: 97, def: 38, phy: 77 }, 'vinicius', '#7c4c28', '#000000', '#ffffff', '#d4af37'),
  createLegend('rm_modric', 'Luka Modrić (Galactico)', 'CMF', 92, 'Xorvatiya', 'Real Madrid', { pac: 75, sho: 84, pas: 96, dri: 93, def: 75, phy: 72 }, 'modric', '#fed7aa', '#b45309', '#ffffff', '#d4af37'),
  createLegend('rm_courtois', 'Thibaut Courtois', 'GK', 92, 'Belgiya', 'Real Madrid', { pac: 55, sho: 20, pas: 78, dri: 45, def: 93, phy: 88 }, 'courtois', '#fed7aa', '#1e293b', '#1e293b', '#ffffff'),
  createLegend('rm_valverde', 'Federico Valverde', 'CMF', 90, 'Urugvay', 'Real Madrid', { pac: 90, sho: 86, pas: 87, dri: 86, def: 82, phy: 90 }, 'valverde', '#f4caa1', '#3d2314', '#ffffff', '#d4af37'),
  createLegend('rm_rodrygo', 'Rodrygo Goes', 'RWF', 89, 'Braziliya', 'Real Madrid', { pac: 91, sho: 86, pas: 84, dri: 91, def: 42, phy: 72 }, 'rodrygo', '#9f6b43', '#000000', '#ffffff', '#d4af37'),
  createLegend('rm_camavinga', 'Eduardo Camavinga', 'DMF', 88, 'Fransiya', 'Real Madrid', { pac: 84, sho: 76, pas: 86, dri: 88, def: 86, phy: 86 }, 'camavinga', '#7c4c28', '#000000', '#ffffff', '#d4af37'),
  createLegend('rm_tchouameni', 'Aurélien Tchouaméni', 'DMF', 88, 'Fransiya', 'Real Madrid', { pac: 79, sho: 78, pas: 85, dri: 82, def: 90, phy: 91 }, 'tchouameni', '#7c4c28', '#000000', '#ffffff', '#d4af37'),
  createLegend('rm_rudiger', 'Antonio Rüdiger', 'CB', 89, 'Germaniya', 'Real Madrid', { pac: 87, sho: 58, pas: 75, dri: 74, def: 91, phy: 93 }, 'rudiger', '#7c4c28', '#000000', '#ffffff', '#d4af37'),
  createLegend('rm_carvajal', 'Dani Carvajal', 'RB', 87, 'Ispaniya', 'Real Madrid', { pac: 83, sho: 68, pas: 84, dri: 82, def: 87, phy: 85 }, 'carvajal', '#fed7aa', '#1c1917', '#ffffff', '#d4af37'),
  createLegend('rm_alaba', 'David Alaba', 'CB', 87, 'Avstriya', 'Real Madrid', { pac: 82, sho: 74, pas: 86, dri: 83, def: 87, phy: 82 }, 'alaba', '#9f6b43', '#000000', '#ffffff', '#d4af37'),
  // Legends of Bernabeu
  createLegend('rm_raul', 'Raúl González', 'CF', 93, 'Ispaniya', 'Real Madrid Legends', { pac: 87, sho: 93, pas: 85, dri: 89, def: 52, phy: 80 }, 'raul', '#fed7aa', '#1c1917', '#ffffff', '#d4af37'),
  createLegend('rm_ramos', 'Sergio Ramos', 'CB', 93, 'Ispaniya', 'Real Madrid Legends', { pac: 84, sho: 76, pas: 81, dri: 78, def: 94, phy: 94 }, 'ramos', '#fed7aa', '#78350f', '#ffffff', '#d4af37'),
  createLegend('rm_zidane_rm', 'Zinedine Zidane (Madrid)', 'AMF', 95, 'Fransiya', 'Real Madrid Legends', { pac: 84, sho: 90, pas: 98, dri: 97, def: 72, phy: 88 }, 'zidane', '#f4caa1', '#1e293b', '#ffffff', '#d4af37')
];

while (REAL_MADRID_GALACTICOS_50_POOL.length < 50) {
  const i = REAL_MADRID_GALACTICOS_50_POOL.length + 1;
  const p = generateRandomPlayer('CMF', 'Ispaniya');
  p.id = `rm_squad_extra_${i}`;
  p.name = `Madrid Akademia ${i}`;
  p.club = 'Real Madrid';
  p.ovr = 77 + (i % 8);
  REAL_MADRID_GALACTICOS_50_POOL.push(p);
}

// 3. Manchester United 2008 UCL Pool (50 players)
const MAN_UTD_2008_50_POOL: Player[] = [
  createLegend('mu_rooney', 'Wayne Rooney', 'CF', 94, 'Angliya', 'Man United 2008', { pac: 91, sho: 95, pas: 88, dri: 90, def: 64, phy: 92 }, 'rooney', '#f4caa1', '#b45309', '#dc2626', '#ffffff'),
  createLegend('mu_ronaldo_08', 'Cristiano Ronaldo (2008 UCL)', 'LWF', 95, 'Portugaliya', 'Man United 2008', { pac: 95, sho: 94, pas: 84, dri: 96, def: 40, phy: 85 }, 'ronaldo', '#e4af80', '#1c1917', '#dc2626', '#ffffff'),
  createLegend('mu_scholes', 'Paul Scholes', 'CMF', 93, 'Angliya', 'Man United 2008', { pac: 76, sho: 92, pas: 98, dri: 88, def: 78, phy: 82 }, 'scholes', '#f4caa1', '#ea580c', '#dc2626', '#ffffff'),
  createLegend('mu_ferdinand', 'Rio Ferdinand', 'CB', 93, 'Angliya', 'Man United 2008', { pac: 87, sho: 54, pas: 82, dri: 79, def: 95, phy: 91 }, 'ferdinand', '#9f6b43', '#000000', '#dc2626', '#ffffff'),
  createLegend('mu_vidic', 'Nemanja Vidić', 'CB', 93, 'Serbiya', 'Man United 2008', { pac: 80, sho: 58, pas: 74, dri: 70, def: 97, phy: 96 }, 'vidic', '#fed7aa', '#1c1917', '#dc2626', '#ffffff'),
  createLegend('mu_vandersar', 'Edwin van der Sar', 'GK', 93, 'Niderlandiya', 'Man United 2008', { pac: 58, sho: 25, pas: 82, dri: 48, def: 94, phy: 88 }, 'vandersar', '#fed7aa', '#78350f', '#059669', '#ffffff'),
  createLegend('mu_giggs', 'Ryan Giggs', 'LMF', 92, 'Uels', 'Man United 2008', { pac: 91, sho: 84, pas: 91, dri: 92, def: 66, phy: 78 }, 'giggs', '#fed7aa', '#1c1917', '#dc2626', '#ffffff'),
  createLegend('mu_carrick', 'Michael Carrick', 'DMF', 89, 'Angliya', 'Man United 2008', { pac: 76, sho: 78, pas: 92, dri: 84, def: 88, phy: 83 }, 'carrick', '#fed7aa', '#3d2314', '#dc2626', '#ffffff'),
  createLegend('mu_evra', 'Patrice Evra', 'LB', 90, 'Fransiya', 'Man United 2008', { pac: 90, sho: 66, pas: 82, dri: 85, def: 87, phy: 85 }, 'evra', '#7c4c28', '#000000', '#dc2626', '#ffffff'),
  createLegend('mu_tevez', 'Carlos Tevez', 'CF', 90, 'Argentina', 'Man United 2008', { pac: 88, sho: 89, pas: 82, dri: 88, def: 58, phy: 88 }, 'tevez', '#c88c5a', '#1c1917', '#dc2626', '#ffffff'),
  createLegend('mu_neville', 'Gary Neville', 'RB', 88, 'Angliya', 'Man United 2008', { pac: 80, sho: 62, pas: 84, dri: 79, def: 89, phy: 84 }, 'neville', '#fed7aa', '#78350f', '#dc2626', '#ffffff'),
  createLegend('mu_berbatov', 'Dimitar Berbatov', 'CF', 89, 'Bolgariya', 'Man United 2008', { pac: 80, sho: 90, pas: 86, dri: 92, def: 42, phy: 79 }, 'berbatov', '#fed7aa', '#1c1917', '#dc2626', '#ffffff'),
  createLegend('mu_nani', 'Nani', 'RWF', 88, 'Portugaliya', 'Man United 2008', { pac: 92, sho: 84, pas: 84, dri: 91, def: 45, phy: 76 }, 'nani', '#9f6b43', '#000000', '#dc2626', '#ffffff')
];

while (MAN_UTD_2008_50_POOL.length < 50) {
  const i = MAN_UTD_2008_50_POOL.length + 1;
  const p = generateRandomPlayer('CMF', 'Angliya');
  p.id = `mu_squad_extra_${i}`;
  p.name = `Manchester Zaxira ${i}`;
  p.club = 'Manchester United';
  p.ovr = 76 + (i % 9);
  MAN_UTD_2008_50_POOL.push(p);
}

// 4. 100 Stars Mega Box Draw (100 players)
export const MEGA_100_BOX_DRAW_PACK: SpecialPack = {
  id: 'pack_100_stars_mega_box',
  name: '100 Stars Mega Box Draw',
  badge: 'EPIC',
  description: '100 ta haqiqiy futbolchi to‘liq ro‘yxati (John Terry, Gary Cahill, Ashley Cole, Frank Lampard va elit yulduzlar). Har bir ochishda o‘yinchilar qutidan kamayib boradi!',
  themeColor: 'gold',
  expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
  freePullsTotal: 10,
  freePullsRemaining: 10,
  costPer10: 1000,
  costPer1: 100,
  totalPoolCount: 100,
  pulledCount: 0,
  createdAt: Date.now(),
  createdBy: 'Rasmiy eFootball™ 2026 Admin',
  players: ONE_HUNDRED_REAL_PLAYERS_POOL,
  originalPlayers: ONE_HUNDRED_REAL_PLAYERS_POOL
};

// 4 Official Packs Matching Telegram Bot
export const DEFAULT_SPECIAL_PACKS: SpecialPack[] = [
  // 1. Epic Worldwide Legends (150 talik)
  {
    id: 'pack_worldwide_legends_150',
    name: 'Epic Worldwide Legends (150 talik)',
    badge: 'EPIC',
    description: '150 talik afsonaviy koptoklar: Messi (96), Ronaldo (96), Maldini (95), Zidane (95), Ronaldinho (94), Cruyff (95) va jahon futboli buyuklari!',
    themeColor: 'gold',
    expiresAt: Date.now() + 14 * 24 * 60 * 60 * 1000,
    freePullsTotal: 10,
    freePullsRemaining: 10,
    costPer10: 1000,
    costPer1: 100,
    totalPoolCount: 150,
    pulledCount: 0,
    createdAt: Date.now(),
    createdBy: 'Rasmiy eFootball™ 2026 Admin',
    players: WORLDWIDE_LEGENDS_150_POOL,
    originalPlayers: WORLDWIDE_LEGENDS_150_POOL
  },

  // 2. Real Madrid Galacticos (50 talik)
  {
    id: 'pack_real_madrid_galacticos_50',
    name: 'Real Madrid Galacticos (50 talik)',
    badge: 'EPIC',
    description: '50 talik qirollik klubi to‘plami: Mbappé (95), Bellingham (93), Vinícius Jr (93), Modrić (92), Courtois (92) va afsonalar!',
    themeColor: 'cyan',
    expiresAt: Date.now() + 10 * 24 * 60 * 60 * 1000,
    freePullsTotal: 10,
    freePullsRemaining: 10,
    costPer10: 1000,
    costPer1: 100,
    totalPoolCount: 50,
    pulledCount: 0,
    createdAt: Date.now(),
    createdBy: 'Rasmiy eFootball™ 2026 Admin',
    players: REAL_MADRID_GALACTICOS_50_POOL,
    originalPlayers: REAL_MADRID_GALACTICOS_50_POOL
  },

  // 3. Manchester United 2008 UCL (50 talik)
  {
    id: 'pack_manchester_united_2008_50',
    name: 'Manchester United 2008 UCL (50 talik)',
    badge: 'EPIC',
    description: '50 talik Moskva-2008 afsonalari: Wayne Rooney (94), Ronaldo (95), Paul Scholes (93), Rio Ferdinand (93), Nemanja Vidić (93)!',
    themeColor: 'emerald',
    expiresAt: Date.now() + 10 * 24 * 60 * 60 * 1000,
    freePullsTotal: 10,
    freePullsRemaining: 10,
    costPer10: 1000,
    costPer1: 100,
    totalPoolCount: 50,
    pulledCount: 0,
    createdAt: Date.now(),
    createdBy: 'Rasmiy eFootball™ 2026 Admin',
    players: MAN_UTD_2008_50_POOL,
    originalPlayers: MAN_UTD_2008_50_POOL
  },

  // 4. 100 Stars Mega Box Draw (100 talik)
  MEGA_100_BOX_DRAW_PACK
];

