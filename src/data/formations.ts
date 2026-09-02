import { FormationKey, SlotDef, Player, PositionRole, PositionZone } from '../types';

export interface FormationDetail {
  name: string;
  description: string;
  category: 'Hujumkor' | 'Muvozanatli' | 'Himoyaviy' | 'Taktik';
  slots: SlotDef[];
}

export const FORMATION_CONFIGS: Record<FormationKey, FormationDetail> = {
  '4-3-3': {
    name: '4-3-3 Hujumkor',
    description: 'Qanot hujumchilari va faol markaz bilan keng maydonda o‘ynash',
    category: 'Hujumkor',
    slots: [
      { id: 'gk', role: 'GK', x: 50, y: 88, zone: 'GK' },
      { id: 'lb', role: 'LB', x: 16, y: 72, zone: 'DEF' },
      { id: 'cb1', role: 'CB', x: 38, y: 74, zone: 'DEF' },
      { id: 'cb2', role: 'CB', x: 62, y: 74, zone: 'DEF' },
      { id: 'rb', role: 'RB', x: 84, y: 72, zone: 'DEF' },
      { id: 'cm1', role: 'CMF', x: 28, y: 52, zone: 'MID' },
      { id: 'cdm', role: 'DMF', x: 50, y: 58, zone: 'MID' },
      { id: 'cm2', role: 'CMF', x: 72, y: 52, zone: 'MID' },
      { id: 'lw', role: 'LWF', x: 18, y: 22, zone: 'FWD' },
      { id: 'st', role: 'CF', x: 50, y: 16, zone: 'FWD' },
      { id: 'rw', role: 'RWF', x: 82, y: 22, zone: 'FWD' }
    ]
  },
  '4-2-3-1': {
    name: '4-2-3-1 Muvozanatli',
    description: 'Ikkita tayanch yarim himoyachi va erkin pleymeyker orqali boshqaruv',
    category: 'Muvozanatli',
    slots: [
      { id: 'gk', role: 'GK', x: 50, y: 88, zone: 'GK' },
      { id: 'lb', role: 'LB', x: 16, y: 72, zone: 'DEF' },
      { id: 'cb1', role: 'CB', x: 38, y: 74, zone: 'DEF' },
      { id: 'cb2', role: 'CB', x: 62, y: 74, zone: 'DEF' },
      { id: 'rb', role: 'RB', x: 84, y: 72, zone: 'DEF' },
      { id: 'cdm1', role: 'DMF', x: 36, y: 58, zone: 'MID' },
      { id: 'cdm2', role: 'DMF', x: 64, y: 58, zone: 'MID' },
      { id: 'lam', role: 'LMF', x: 20, y: 36, zone: 'MID' },
      { id: 'cam', role: 'AMF', x: 50, y: 34, zone: 'MID' },
      { id: 'ram', role: 'RMF', x: 80, y: 36, zone: 'MID' },
      { id: 'st', role: 'CF', x: 50, y: 16, zone: 'FWD' }
    ]
  },
  '4-4-2': {
    name: '4-4-2 Klassik',
    description: 'Klassik ingliz uslubi, qanotlar orqali uzatmalar va ikkita kuchli hujumchi',
    category: 'Muvozanatli',
    slots: [
      { id: 'gk', role: 'GK', x: 50, y: 88, zone: 'GK' },
      { id: 'lb', role: 'LB', x: 16, y: 72, zone: 'DEF' },
      { id: 'cb1', role: 'CB', x: 38, y: 74, zone: 'DEF' },
      { id: 'cb2', role: 'CB', x: 62, y: 74, zone: 'DEF' },
      { id: 'rb', role: 'RB', x: 84, y: 72, zone: 'DEF' },
      { id: 'lm', role: 'LMF', x: 16, y: 48, zone: 'MID' },
      { id: 'cm1', role: 'CMF', x: 38, y: 52, zone: 'MID' },
      { id: 'cm2', role: 'CMF', x: 62, y: 52, zone: 'MID' },
      { id: 'rm', role: 'RMF', x: 84, y: 48, zone: 'MID' },
      { id: 'st1', role: 'CF', x: 36, y: 18, zone: 'FWD' },
      { id: 'st2', role: 'ST', x: 64, y: 18, zone: 'FWD' }
    ]
  },
  '3-5-2': {
    name: '3-5-2 Dominant',
    description: 'Markazni to‘liq egallash, 3 markaziy himoyachi va agressiv qanotlar',
    category: 'Taktik',
    slots: [
      { id: 'gk', role: 'GK', x: 50, y: 88, zone: 'GK' },
      { id: 'cb1', role: 'CB', x: 26, y: 74, zone: 'DEF' },
      { id: 'cb2', role: 'CB', x: 50, y: 76, zone: 'DEF' },
      { id: 'cb3', role: 'CB', x: 74, y: 74, zone: 'DEF' },
      { id: 'lm', role: 'LMF', x: 14, y: 48, zone: 'MID' },
      { id: 'cdm1', role: 'DMF', x: 36, y: 58, zone: 'MID' },
      { id: 'cam', role: 'AMF', x: 50, y: 38, zone: 'MID' },
      { id: 'cdm2', role: 'DMF', x: 64, y: 58, zone: 'MID' },
      { id: 'rm', role: 'RMF', x: 86, y: 48, zone: 'MID' },
      { id: 'st1', role: 'CF', x: 36, y: 18, zone: 'FWD' },
      { id: 'st2', role: 'ST', x: 64, y: 18, zone: 'FWD' }
    ]
  },
  '3-4-3': {
    name: '3-4-3 Yuqori Pressing',
    description: 'Yuqori pressing va uch nafar hujumchi orqali doimiy xavf yaratish',
    category: 'Hujumkor',
    slots: [
      { id: 'gk', role: 'GK', x: 50, y: 88, zone: 'GK' },
      { id: 'cb1', role: 'CB', x: 26, y: 74, zone: 'DEF' },
      { id: 'cb2', role: 'CB', x: 50, y: 76, zone: 'DEF' },
      { id: 'cb3', role: 'CB', x: 74, y: 74, zone: 'DEF' },
      { id: 'lm', role: 'LMF', x: 16, y: 50, zone: 'MID' },
      { id: 'cm1', role: 'CMF', x: 38, y: 52, zone: 'MID' },
      { id: 'cm2', role: 'CMF', x: 62, y: 52, zone: 'MID' },
      { id: 'rm', role: 'RMF', x: 84, y: 50, zone: 'MID' },
      { id: 'lw', role: 'LWF', x: 20, y: 22, zone: 'FWD' },
      { id: 'st', role: 'CF', x: 50, y: 16, zone: 'FWD' },
      { id: 'rw', role: 'RWF', x: 80, y: 22, zone: 'FWD' }
    ]
  },
  '5-3-2': {
    name: '5-3-2 Mustahkam Himoya',
    description: 'Beton himoya, xavfsizlik va qarshi hujumga tayanuvchi o‘yin',
    category: 'Himoyaviy',
    slots: [
      { id: 'gk', role: 'GK', x: 50, y: 88, zone: 'GK' },
      { id: 'lwb', role: 'LWB', x: 12, y: 68, zone: 'DEF' },
      { id: 'cb1', role: 'CB', x: 30, y: 74, zone: 'DEF' },
      { id: 'cb2', role: 'CB', x: 50, y: 76, zone: 'DEF' },
      { id: 'cb3', role: 'CB', x: 70, y: 74, zone: 'DEF' },
      { id: 'rwb', role: 'RWB', x: 88, y: 68, zone: 'DEF' },
      { id: 'cm1', role: 'CMF', x: 30, y: 50, zone: 'MID' },
      { id: 'cdm', role: 'DMF', x: 50, y: 56, zone: 'MID' },
      { id: 'cm2', role: 'CMF', x: 70, y: 50, zone: 'MID' },
      { id: 'st1', role: 'CF', x: 36, y: 18, zone: 'FWD' },
      { id: 'st2', role: 'ST', x: 64, y: 18, zone: 'FWD' }
    ]
  },
  '4-1-2-1-2': {
    name: '4-1-2-1-2 Olmos (Diamond)',
    description: 'Markaziy olmos kombinatsiyasi va ikkita markaziy forvard',
    category: 'Taktik',
    slots: [
      { id: 'gk', role: 'GK', x: 50, y: 88, zone: 'GK' },
      { id: 'lb', role: 'LB', x: 16, y: 72, zone: 'DEF' },
      { id: 'cb1', role: 'CB', x: 38, y: 74, zone: 'DEF' },
      { id: 'cb2', role: 'CB', x: 62, y: 74, zone: 'DEF' },
      { id: 'rb', role: 'RB', x: 84, y: 72, zone: 'DEF' },
      { id: 'cdm', role: 'DMF', x: 50, y: 60, zone: 'MID' },
      { id: 'lm', role: 'LMF', x: 22, y: 46, zone: 'MID' },
      { id: 'rm', role: 'RMF', x: 78, y: 46, zone: 'MID' },
      { id: 'cam', role: 'AMF', x: 50, y: 34, zone: 'MID' },
      { id: 'st1', role: 'CF', x: 36, y: 18, zone: 'FWD' },
      { id: 'st2', role: 'ST', x: 64, y: 18, zone: 'FWD' }
    ]
  },
  '4-3-1-2': {
    name: '4-3-1-2 Tor Markaz',
    description: 'Markazda zich blok, pleymeyker va ikki qanot himoyachisining oldinga chiqishi',
    category: 'Taktik',
    slots: [
      { id: 'gk', role: 'GK', x: 50, y: 88, zone: 'GK' },
      { id: 'lb', role: 'LB', x: 16, y: 72, zone: 'DEF' },
      { id: 'cb1', role: 'CB', x: 38, y: 74, zone: 'DEF' },
      { id: 'cb2', role: 'CB', x: 62, y: 74, zone: 'DEF' },
      { id: 'rb', role: 'RB', x: 84, y: 72, zone: 'DEF' },
      { id: 'cm1', role: 'CMF', x: 28, y: 56, zone: 'MID' },
      { id: 'cm2', role: 'CMF', x: 50, y: 58, zone: 'MID' },
      { id: 'cm3', role: 'CMF', x: 72, y: 56, zone: 'MID' },
      { id: 'cam', role: 'AMF', x: 50, y: 36, zone: 'MID' },
      { id: 'st1', role: 'CF', x: 36, y: 18, zone: 'FWD' },
      { id: 'st2', role: 'ST', x: 64, y: 18, zone: 'FWD' }
    ]
  },
  '5-2-3': {
    name: '5-2-3 Qanot Hujum',
    description: 'Himoyada 5 kishi, hujumda tezkor qanot vingerlari bilan zarba berish',
    category: 'Hujumkor',
    slots: [
      { id: 'gk', role: 'GK', x: 50, y: 88, zone: 'GK' },
      { id: 'lwb', role: 'LWB', x: 14, y: 68, zone: 'DEF' },
      { id: 'cb1', role: 'CB', x: 32, y: 75, zone: 'DEF' },
      { id: 'cb2', role: 'CB', x: 50, y: 77, zone: 'DEF' },
      { id: 'cb3', role: 'CB', x: 68, y: 75, zone: 'DEF' },
      { id: 'rwb', role: 'RWB', x: 86, y: 68, zone: 'DEF' },
      { id: 'cm1', role: 'CMF', x: 38, y: 52, zone: 'MID' },
      { id: 'cm2', role: 'CMF', x: 62, y: 52, zone: 'MID' },
      { id: 'lw', role: 'LWF', x: 20, y: 22, zone: 'FWD' },
      { id: 'st', role: 'CF', x: 50, y: 16, zone: 'FWD' },
      { id: 'rw', role: 'RWF', x: 80, y: 22, zone: 'FWD' }
    ]
  },
  '4-5-1': {
    name: '4-5-1 Markaziy Blok',
    description: 'Yarim himoyada son jihatdan ustunlik va yagona hujumchi orqali hujumlar',
    category: 'Himoyaviy',
    slots: [
      { id: 'gk', role: 'GK', x: 50, y: 88, zone: 'GK' },
      { id: 'lb', role: 'LB', x: 16, y: 72, zone: 'DEF' },
      { id: 'cb1', role: 'CB', x: 38, y: 74, zone: 'DEF' },
      { id: 'cb2', role: 'CB', x: 62, y: 74, zone: 'DEF' },
      { id: 'rb', role: 'RB', x: 84, y: 72, zone: 'DEF' },
      { id: 'lm', role: 'LMF', x: 16, y: 46, zone: 'MID' },
      { id: 'cm1', role: 'CMF', x: 34, y: 52, zone: 'MID' },
      { id: 'cdm', role: 'DMF', x: 50, y: 58, zone: 'MID' },
      { id: 'cm2', role: 'CMF', x: 66, y: 52, zone: 'MID' },
      { id: 'rm', role: 'RMF', x: 84, y: 46, zone: 'MID' },
      { id: 'st', role: 'CF', x: 50, y: 18, zone: 'FWD' }
    ]
  }
};

/**
 * PES 2026 Game Plan Style:
 * Determine dynamic role and tactical zone based on coordinates on the tactical pitch.
 */
export function determineRoleFromCoordinates(
  x: number,
  y: number
): { role: PositionRole; zone: PositionZone } {
  // Goalkeeper Zone (Bottom box)
  if (y >= 82) {
    return { role: 'GK', zone: 'GK' };
  }

  // Defensive Zone (65% <= y < 82%)
  if (y >= 65) {
    if (x <= 25) {
      return { role: y < 72 ? 'LWB' : 'LB', zone: 'DEF' };
    }
    if (x >= 75) {
      return { role: y < 72 ? 'RWB' : 'RB', zone: 'DEF' };
    }
    return { role: 'CB', zone: 'DEF' };
  }

  // Midfield Zone (34% <= y < 65%)
  if (y >= 34) {
    if (y >= 54) {
      // Defensive Midfielder
      return { role: 'DMF', zone: 'MID' };
    }
    if (y <= 43) {
      // Attacking Midfielder or Wide Midfield
      if (x <= 25) return { role: 'LMF', zone: 'MID' };
      if (x >= 75) return { role: 'RMF', zone: 'MID' };
      return { role: 'AMF', zone: 'MID' };
    }
    // Central Midfield
    if (x <= 24) return { role: 'LMF', zone: 'MID' };
    if (x >= 76) return { role: 'RMF', zone: 'MID' };
    return { role: 'CMF', zone: 'MID' };
  }

  // Attacking Zone (y < 34%)
  if (x <= 28) {
    return { role: 'LWF', zone: 'FWD' };
  }
  if (x >= 72) {
    return { role: 'RWF', zone: 'FWD' };
  }
  if (y <= 20) {
    return { role: 'CF', zone: 'FWD' };
  }
  return { role: 'SS', zone: 'FWD' };
}

/**
 * Intelligently remaps current active starters into new formation slots
 * so that no player is lost, all slots are populated, and the screen never breaks.
 */
export function remapSquadToFormation(
  currentSquad: Record<string, Player | null>,
  newFormation: FormationKey,
  benchPlayers: Player[] = []
): {
  newSquad: Record<string, Player | null>;
  updatedBench: Player[];
} {
  const targetConfig = FORMATION_CONFIGS[newFormation] || FORMATION_CONFIGS['4-3-3'];
  const targetSlots = targetConfig.slots;

  // Extract all existing active starting players
  const availableStarters: Player[] = Object.values(currentSquad).filter(
    (p): p is Player => Boolean(p)
  );

  const assignedPlayers = new Set<string>();
  const newSquad: Record<string, Player | null> = {};

  // First Pass: Find exact role matches from available starters
  targetSlots.forEach(slot => {
    const exactMatch = availableStarters.find(
      p => !assignedPlayers.has(p.id) && p.role === slot.role
    );
    if (exactMatch) {
      newSquad[slot.id] = exactMatch;
      assignedPlayers.add(exactMatch.id);
    } else {
      newSquad[slot.id] = null;
    }
  });

  // Second Pass: Find natural position matches
  targetSlots.forEach(slot => {
    if (newSquad[slot.id]) return;
    const naturalMatch = availableStarters.find(
      p =>
        !assignedPlayers.has(p.id) &&
        p.naturalPositions &&
        p.naturalPositions.includes(slot.role as PositionRole)
    );
    if (naturalMatch) {
      newSquad[slot.id] = naturalMatch;
      assignedPlayers.add(naturalMatch.id);
    }
  });

  // Third Pass: Find zone matches (e.g. DEF -> DEF, MID -> MID, FWD -> FWD, GK -> GK)
  targetSlots.forEach(slot => {
    if (newSquad[slot.id]) return;
    const zoneMatch = availableStarters.find(
      p => !assignedPlayers.has(p.id) && p.family === (slot.zone === 'DEF' ? 'DF' : slot.zone === 'MID' ? 'MF' : slot.zone === 'FWD' ? 'FW' : 'GK')
    );
    if (zoneMatch) {
      newSquad[slot.id] = zoneMatch;
      assignedPlayers.add(zoneMatch.id);
    }
  });

  // Fourth Pass: Assign any remaining available starters
  targetSlots.forEach(slot => {
    if (newSquad[slot.id]) return;
    const anyStarter = availableStarters.find(p => !assignedPlayers.has(p.id));
    if (anyStarter) {
      newSquad[slot.id] = anyStarter;
      assignedPlayers.add(anyStarter.id);
    }
  });

  // Fifth Pass: If any slots are STILL empty and bench has players, fill from bench
  let currentBenchPool = [...benchPlayers];
  targetSlots.forEach(slot => {
    if (newSquad[slot.id]) return;
    const benchMatch = currentBenchPool.find(
      p => !assignedPlayers.has(p.id) && (p.role === slot.role || p.family === (slot.zone === 'DEF' ? 'DF' : slot.zone === 'MID' ? 'MF' : slot.zone === 'FWD' ? 'FW' : 'GK'))
    ) || currentBenchPool.find(p => !assignedPlayers.has(p.id));

    if (benchMatch) {
      newSquad[slot.id] = benchMatch;
      assignedPlayers.add(benchMatch.id);
      currentBenchPool = currentBenchPool.filter(p => p.id !== benchMatch.id);
    }
  });

  // Any starter not placed on the pitch is safely moved to bench (no one is lost!)
  const unassignedStarters = availableStarters.filter(p => !assignedPlayers.has(p.id));
  const finalBench = [
    ...unassignedStarters,
    ...currentBenchPool.filter(p => !assignedPlayers.has(p.id))
  ];

  // Unique bench list
  const uniqueBench = Array.from(new Map(finalBench.map(p => [p.id, p])).values());

  return {
    newSquad,
    updatedBench: uniqueBench
  };
}
