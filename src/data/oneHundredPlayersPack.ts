import { Player, SpecialPack, RawJsonPackInput } from '../types';
import { REAL_STAR_PLAYERS } from './realPlayers';
import { getNationByName } from './nations';

// 100 Real Football Stars curated for eFootball 2026 100-Box Draw
export const ONE_HUNDRED_REAL_PLAYERS_POOL: Player[] = [
  // 1. Gary Cahill (Epic)
  {
    id: 'pack100_cahill',
    name: 'Gary Cahill',
    role: 'CB',
    displayRole: 'CB',
    naturalPositions: ['CB', 'LB'],
    family: 'DF',
    ovr: 89,
    potential: 91,
    nation: getNationByName('Angliya'),
    club: 'Chelsea Legends',
    league: 'Angliya Premer-ligasi',
    cardTier: 'legend',
    attrs: { pac: 83, sho: 61, pas: 76, dri: 74, def: 93, phy: 91 },
    avatar: {
      skinTone: '#f4caa1',
      hairStyle: 'short-fade',
      hairColor: '#3a2510',
      facialHair: 'stubble',
      kitPrimaryColor: '#1d4ed8',
      kitSecondaryColor: '#ffffff',
      likenessName: 'cahill'
    },
    playStyle: 'Klassik himoyachi',
    skills: ['Man Marking', 'Interception', 'Aerial Superiority', 'Acrobatic Clearance'],
    age: 32,
    foot: 'O‘ng',
    height: 193,
    weight: 86,
    form: 95,
    condition: 94,
    marketValue: 35000000,
    level: 20,
    xp: 0,
    stamina: 100
  },
  // 2. Lionel Messi (Epic)
  { ...REAL_STAR_PLAYERS[0], id: 'pack100_messi', ovr: 96, stamina: 100 },
  // 3. Cristiano Ronaldo (Epic)
  { ...REAL_STAR_PLAYERS[1], id: 'pack100_ronaldo', ovr: 96, stamina: 100 },

  // Highlight Stars (OVR 84 - 88)
  { ...REAL_STAR_PLAYERS[2], id: 'pack100_mbappe', ovr: 88, stamina: 100 },
  { ...REAL_STAR_PLAYERS[3], id: 'pack100_haaland', ovr: 88, stamina: 100 },
  { ...REAL_STAR_PLAYERS[4], id: 'pack100_bellingham', ovr: 88, stamina: 100 },
  { ...REAL_STAR_PLAYERS[5], id: 'pack100_vinicius', ovr: 88, stamina: 100 },
  { ...REAL_STAR_PLAYERS[6], id: 'pack100_rodri', ovr: 88, stamina: 100 },
  { ...REAL_STAR_PLAYERS[7], id: 'pack100_salah', ovr: 87, stamina: 100 },
  { ...REAL_STAR_PLAYERS[8], id: 'pack100_kane', ovr: 87, stamina: 100 },
  { ...REAL_STAR_PLAYERS[9], id: 'pack100_vandijk', ovr: 88, stamina: 100 },
  { ...REAL_STAR_PLAYERS[10], id: 'pack100_courtois', ovr: 88, stamina: 100 },
  { ...REAL_STAR_PLAYERS[11], id: 'pack100_debruyne', ovr: 88, stamina: 100 },
  { ...REAL_STAR_PLAYERS[12], id: 'pack100_yamal', ovr: 86, stamina: 100 },
  { ...REAL_STAR_PLAYERS[14], id: 'pack100_musiala', ovr: 87, stamina: 100 },
  { ...REAL_STAR_PLAYERS[15], id: 'pack100_wirtz', ovr: 87, stamina: 100 },
  { ...REAL_STAR_PLAYERS[16], id: 'pack100_foden', ovr: 86, stamina: 100 },
  { ...REAL_STAR_PLAYERS[17], id: 'pack100_valverde', ovr: 86, stamina: 100 },
  { ...REAL_STAR_PLAYERS[18], id: 'pack100_saka', ovr: 86, stamina: 100 },
  { ...REAL_STAR_PLAYERS[19], id: 'pack100_saliba', ovr: 85, stamina: 100 },
  { ...REAL_STAR_PLAYERS[20], id: 'pack100_alisson', ovr: 86, stamina: 100 },
  { ...REAL_STAR_PLAYERS[21], id: 'pack100_griezmann', ovr: 86, stamina: 100 },
  { ...REAL_STAR_PLAYERS[22], id: 'pack100_lewandowski', ovr: 86, stamina: 100 },
  { ...REAL_STAR_PLAYERS[23], id: 'pack100_son', ovr: 85, stamina: 100 },
  { ...REAL_STAR_PLAYERS[24], id: 'pack100_kimmich', ovr: 85, stamina: 100 },
  { ...REAL_STAR_PLAYERS[25], id: 'pack100_rudiger', ovr: 85, stamina: 100 },
  { ...REAL_STAR_PLAYERS[26], id: 'pack100_modric', ovr: 85, stamina: 100 },
  { ...REAL_STAR_PLAYERS[27], id: 'pack100_bernardo', ovr: 85, stamina: 100 },
  { ...REAL_STAR_PLAYERS[28], id: 'pack100_rice', ovr: 85, stamina: 100 },
  { ...REAL_STAR_PLAYERS[29], id: 'pack100_davies', ovr: 84, stamina: 100 },
  { ...REAL_STAR_PLAYERS[30], id: 'pack100_hakimi', ovr: 84, stamina: 100 },
  { ...REAL_STAR_PLAYERS[31], id: 'pack100_theo', ovr: 84, stamina: 100 },
  { ...REAL_STAR_PLAYERS[32], id: 'pack100_ederson', ovr: 84, stamina: 100 },
  { ...REAL_STAR_PLAYERS[33], id: 'pack100_terstegen', ovr: 84, stamina: 100 },
  { ...REAL_STAR_PLAYERS[34], id: 'pack100_barella', ovr: 84, stamina: 100 },
  { ...REAL_STAR_PLAYERS[35], id: 'pack100_bastoni', ovr: 84, stamina: 100 },
  { ...REAL_STAR_PLAYERS[36], id: 'pack100_camavinga', ovr: 84, stamina: 100 },
  { ...REAL_STAR_PLAYERS[37], id: 'pack100_tchouameni', ovr: 84, stamina: 100 },
  { ...REAL_STAR_PLAYERS[38], id: 'pack100_palmer', ovr: 84, stamina: 100 },
  { ...REAL_STAR_PLAYERS[39], id: 'pack100_pedri', ovr: 84, stamina: 100 },
  { ...REAL_STAR_PLAYERS[40], id: 'pack100_gavi', ovr: 84, stamina: 100 },
  { ...REAL_STAR_PLAYERS[41], id: 'pack100_martinez', ovr: 84, stamina: 100 },
  { ...REAL_STAR_PLAYERS[42], id: 'pack100_shomurodov', ovr: 84, stamina: 100 },
  { ...REAL_STAR_PLAYERS[43], id: 'pack100_fayzullaev', ovr: 84, stamina: 100 }
];

// Complete the remaining to reach exactly 100 real players
const REAL_SQUAD_NAMES: { name: string; club: string; league: string; nation: string; role: string; ovr: number }[] = [
  { name: 'Declan Rice', club: 'Arsenal', league: 'Angliya Premer-ligasi', nation: 'Angliya', role: 'DMF', ovr: 83 },
  { name: 'Gabriel Magalhaes', club: 'Arsenal', league: 'Angliya Premer-ligasi', nation: 'Braziliya', role: 'CB', ovr: 83 },
  { name: 'Martin Odegaard', club: 'Arsenal', league: 'Angliya Premer-ligasi', nation: 'Norvegiya', role: 'AMF', ovr: 83 },
  { name: 'Kai Havertz', club: 'Arsenal', league: 'Angliya Premer-ligasi', nation: 'Germaniya', role: 'CF', ovr: 82 },
  { name: 'David Raya', club: 'Arsenal', league: 'Angliya Premer-ligasi', nation: 'Ispaniya', role: 'GK', ovr: 83 },
  { name: 'Ben White', club: 'Arsenal', league: 'Angliya Premer-ligasi', nation: 'Angliya', role: 'RB', ovr: 82 },
  { name: 'Manuel Akanji', club: 'Manchester City', league: 'Angliya Premer-ligasi', nation: 'Shveytsariya', role: 'CB', ovr: 83 },
  { name: 'Ruben Dias', club: 'Manchester City', league: 'Angliya Premer-ligasi', nation: 'Portugaliya', role: 'CB', ovr: 83 },
  { name: 'Josko Gvardiol', club: 'Manchester City', league: 'Angliya Premer-ligasi', nation: 'Xorvatiya', role: 'LB', ovr: 83 },
  { name: 'Jeremy Doku', club: 'Manchester City', league: 'Angliya Premer-ligasi', nation: 'Belgiya', role: 'LWF', ovr: 81 },
  { name: 'Mateo Kovacic', club: 'Manchester City', league: 'Angliya Premer-ligasi', nation: 'Xorvatiya', role: 'CMF', ovr: 82 },
  { name: 'Alexis Mac Allister', club: 'Liverpool', league: 'Angliya Premer-ligasi', nation: 'Argentina', role: 'CMF', ovr: 83 },
  { name: 'Dominik Szoboszlai', club: 'Liverpool', league: 'Angliya Premer-ligasi', nation: 'Vengriya', role: 'AMF', ovr: 82 },
  { name: 'Trent Alexander-Arnold', club: 'Liverpool', league: 'Angliya Premer-ligasi', nation: 'Angliya', role: 'RB', ovr: 83 },
  { name: 'Andrew Robertson', club: 'Liverpool', league: 'Angliya Premer-ligasi', nation: 'Shotlandiya', role: 'LB', ovr: 82 },
  { name: 'Ibrahima Konate', club: 'Liverpool', league: 'Angliya Premer-ligasi', nation: 'Fransiya', role: 'CB', ovr: 82 },
  { name: 'Darwin Nunez', club: 'Liverpool', league: 'Angliya Premer-ligasi', nation: 'Urugvay', role: 'CF', ovr: 81 },
  { name: 'Cody Gakpo', club: 'Liverpool', league: 'Angliya Premer-ligasi', nation: 'Niderlandiya', role: 'LWF', ovr: 81 },
  { name: 'Cole Palmer', club: 'Chelsea', league: 'Angliya Premer-ligasi', nation: 'Angliya', role: 'AMF', ovr: 83 },
  { name: 'Moises Caicedo', club: 'Chelsea', league: 'Angliya Premer-ligasi', nation: 'Ekvador', role: 'DMF', ovr: 82 },
  { name: 'Enzo Fernandez', club: 'Chelsea', league: 'Angliya Premer-ligasi', nation: 'Argentina', role: 'CMF', ovr: 82 },
  { name: 'Nicolas Jackson', club: 'Chelsea', league: 'Angliya Premer-ligasi', nation: 'Senegal', role: 'CF', ovr: 80 },
  { name: 'Marc Cucurella', club: 'Chelsea', league: 'Angliya Premer-ligasi', nation: 'Ispaniya', role: 'LB', ovr: 81 },
  { name: 'Levi Colwill', club: 'Chelsea', league: 'Angliya Premer-ligasi', nation: 'Angliya', role: 'CB', ovr: 80 },
  { name: 'Bruno Fernandes', club: 'Manchester United', league: 'Angliya Premer-ligasi', nation: 'Portugaliya', role: 'AMF', ovr: 83 },
  { name: 'Kobbie Mainoo', club: 'Manchester United', league: 'Angliya Premer-ligasi', nation: 'Angliya', role: 'CMF', ovr: 81 },
  { name: 'Alejandro Garnacho', club: 'Manchester United', league: 'Angliya Premer-ligasi', nation: 'Argentina', role: 'LWF', ovr: 81 },
  { name: 'Lisandro Martinez', club: 'Manchester United', league: 'Angliya Premer-ligasi', nation: 'Argentina', role: 'CB', ovr: 82 },
  { name: 'Andre Onana', club: 'Manchester United', league: 'Angliya Premer-ligasi', nation: 'Kamerun', role: 'GK', ovr: 82 },
  { name: 'Son Heung-min', club: 'Tottenham', league: 'Angliya Premer-ligasi', nation: 'Janubiy Koreya', role: 'LWF', ovr: 83 },
  { name: 'James Maddison', club: 'Tottenham', league: 'Angliya Premer-ligasi', nation: 'Angliya', role: 'AMF', ovr: 82 },
  { name: 'Cristian Romero', club: 'Tottenham', league: 'Angliya Premer-ligasi', nation: 'Argentina', role: 'CB', ovr: 83 },
  { name: 'Micky van de Ven', club: 'Tottenham', league: 'Angliya Premer-ligasi', nation: 'Niderlandiya', role: 'CB', ovr: 82 },
  { name: 'Guglielmo Vicario', club: 'Tottenham', league: 'Angliya Premer-ligasi', nation: 'Italiya', role: 'GK', ovr: 82 },
  { name: 'Ollie Watkins', club: 'Aston Villa', league: 'Angliya Premer-ligasi', nation: 'Angliya', role: 'CF', ovr: 82 },
  { name: 'Youri Tielemans', club: 'Aston Villa', league: 'Angliya Premer-ligasi', nation: 'Belgiya', role: 'CMF', ovr: 81 },
  { name: 'Emiliano Martinez', club: 'Aston Villa', league: 'Angliya Premer-ligasi', nation: 'Argentina', role: 'GK', ovr: 83 },
  { name: 'Alexander Isak', club: 'Newcastle', league: 'Angliya Premer-ligasi', nation: 'Shvetsiya', role: 'CF', ovr: 82 },
  { name: 'Bruno Guimaraes', club: 'Newcastle', league: 'Angliya Premer-ligasi', nation: 'Braziliya', role: 'CMF', ovr: 82 },
  { name: 'Anthony Gordon', club: 'Newcastle', league: 'Angliya Premer-ligasi', nation: 'Angliya', role: 'LWF', ovr: 81 },
  { name: 'Dani Carvajal', club: 'Real Madrid', league: 'La Liga', nation: 'Ispaniya', role: 'RB', ovr: 83 },
  { name: 'Eder Militao', club: 'Real Madrid', league: 'La Liga', nation: 'Braziliya', role: 'CB', ovr: 83 },
  { name: 'Ferland Mendy', club: 'Real Madrid', league: 'La Liga', nation: 'Fransiya', role: 'LB', ovr: 81 },
  { name: 'Rodrygo Goes', club: 'Real Madrid', league: 'La Liga', nation: 'Braziliya', role: 'RWF', ovr: 83 },
  { name: 'Endrick Felipe', club: 'Real Madrid', league: 'La Liga', nation: 'Braziliya', role: 'CF', ovr: 80 },
  { name: 'Raphinha Dias', club: 'FC Barcelona', league: 'La Liga', nation: 'Braziliya', role: 'RWF', ovr: 83 },
  { name: 'Jules Kounde', club: 'FC Barcelona', league: 'La Liga', nation: 'Fransiya', role: 'RB', ovr: 83 },
  { name: 'Pau Cubarsi', club: 'FC Barcelona', league: 'La Liga', nation: 'Ispaniya', role: 'CB', ovr: 81 },
  { name: 'Fermin Lopez', club: 'FC Barcelona', league: 'La Liga', nation: 'Ispaniya', role: 'CMF', ovr: 81 },
  { name: 'Dani Olmo', club: 'FC Barcelona', league: 'La Liga', nation: 'Ispaniya', role: 'AMF', ovr: 83 },
  { name: 'Marc Casado', club: 'FC Barcelona', league: 'La Liga', nation: 'Ispaniya', role: 'DMF', ovr: 79 },
  { name: 'Julian Alvarez', club: 'Atlético Madrid', league: 'La Liga', nation: 'Argentina', role: 'CF', ovr: 83 },
  { name: 'Rodrigo De Paul', club: 'Atlético Madrid', league: 'La Liga', nation: 'Argentina', role: 'CMF', ovr: 82 },
  { name: 'Jan Oblak', club: 'Atlético Madrid', league: 'La Liga', nation: 'Sloveniya', role: 'GK', ovr: 83 },
  { name: 'Robin Le Normand', club: 'Atlético Madrid', league: 'La Liga', nation: 'Ispaniya', role: 'CB', ovr: 81 },
  { name: 'Nico Williams', club: 'Athletic Bilbao', league: 'La Liga', nation: 'Ispaniya', role: 'LWF', ovr: 83 },
  { name: 'Abbosbek Fayzullaev', club: 'SSKA Moskva', league: 'Rossiya Premer-ligasi', nation: 'O‘zbekiston', role: 'AMF', ovr: 82 },
  { name: 'Oston Urunov', club: 'Persepolis', league: 'Osiyo Chempionlar Ligasi', nation: 'O‘zbekiston', role: 'LWF', ovr: 81 },
  { name: 'Jaloliddin Masharipov', club: 'Esteghlal', league: 'Osiyo Chempionlar Ligasi', nation: 'O‘zbekiston', role: 'LWF', ovr: 80 },
  { name: 'Abduqodir Husanov', club: 'RC Lens', league: 'Fransiya Liga 1', nation: 'O‘zbekiston', role: 'CB', ovr: 81 },
  { name: 'Odiljon Hamrobekov', club: 'Navbahor', league: 'O‘zbekiston Superligasi', nation: 'O‘zbekiston', role: 'DMF', ovr: 79 }
];

// Populate up to 100
while (ONE_HUNDRED_REAL_PLAYERS_POOL.length < 100 && REAL_SQUAD_NAMES.length > 0) {
  const item = REAL_SQUAD_NAMES.shift()!;
  const idx = ONE_HUNDRED_REAL_PLAYERS_POOL.length + 1;
  ONE_HUNDRED_REAL_PLAYERS_POOL.push({
    id: `pack100_${idx}_${item.name.toLowerCase().replace(/\s+/g, '_')}`,
    name: item.name,
    role: item.role,
    displayRole: item.role,
    naturalPositions: [item.role],
    family: (['GK'].includes(item.role) ? 'GK' : ['CB', 'LB', 'RB'].includes(item.role) ? 'DF' : ['CMF', 'DMF', 'AMF'].includes(item.role) ? 'MF' : 'FW') as any,
    ovr: item.ovr,
    potential: item.ovr + 3,
    nation: getNationByName(item.nation),
    club: item.club,
    league: item.league,
    cardTier: item.ovr >= 85 ? 'gold' : 'emerald',
    attrs: {
      pac: Math.min(95, item.ovr + (item.role === 'GK' ? -35 : -3)),
      sho: Math.min(95, item.ovr + (item.role === 'FW' ? 5 : -10)),
      pas: Math.min(95, item.ovr + (item.role === 'MF' ? 6 : -5)),
      dri: Math.min(95, item.ovr + (item.role === 'DF' ? -15 : 2)),
      def: Math.min(95, item.ovr + (item.role === 'DF' ? 8 : -20)),
      phy: Math.min(95, item.ovr + (item.role === 'GK' ? -10 : 3))
    },
    avatar: {
      skinTone: '#f4caa1',
      hairStyle: 'short-fade',
      hairColor: '#1c1917',
      facialHair: 'stubble',
      kitPrimaryColor: '#1e3a8a',
      kitSecondaryColor: '#ffffff'
    },
    playStyle: 'Texnik sehrgar',
    skills: ['Through Passing', 'Speed Dribbling'],
    age: 25,
    foot: 'O‘ng',
    height: 182,
    weight: 76,
    form: 90,
    condition: 90,
    marketValue: item.ovr * item.ovr * 18000,
    level: 15,
    xp: 0,
    stamina: 100
  });
}

// 100-Player PES / eFootball Box Draw Special Pack
export const OFFICIAL_100_BOX_DRAW_PACK: SpecialPack = {
  id: 'pack_100_world_legends_2026',
  name: 'eFootball™ 2026: 100 Box Draw Selection',
  badge: 'EPIC',
  description: '100 nafar haqiqiy yulduzlar: Gary Cahill (Epic 89+), Messi, Ronaldo va dunyo yetakchilari. PES ehtimollik qoidalari asosida (Epic tushish darajasi juda qiyin ~3%).',
  themeColor: 'gold',
  expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days countdown
  freePullsTotal: 10,
  freePullsRemaining: 10,
  costPer10: 1000, // 20 matches won * 50 GP = 1000 GP
  costPer1: 100,
  totalPoolCount: 100,
  pulledCount: 0,
  createdAt: Date.now(),
  createdBy: 'Rasmiy eFootball™ 2026 Admin',
  players: ONE_HUNDRED_REAL_PLAYERS_POOL
};

// Raw JSON Template for 100 players that user can inspect, copy, and test
export const RAW_100_PLAYERS_JSON_TEMPLATE: RawJsonPackInput = {
  packName: 'eFootball 2026: 100 Stars Special Pack',
  badge: 'EPIC',
  description: '100 ta haqiqiy futbolchi to‘plami (soxta ismlarsiz). Haqiqiy tasodifiy omad va baraban tizimi!',
  expiresInDays: 7,
  freePulls: 10,
  costPer10: 1000,
  players: ONE_HUNDRED_REAL_PLAYERS_POOL.map(p => ({
    name: p.name,
    role: p.role,
    ovr: p.ovr,
    club: p.club,
    league: p.league,
    nation: p.nation?.name || 'Angliya',
    cardTier: p.cardTier,
    attrs: p.attrs
  }))
};
