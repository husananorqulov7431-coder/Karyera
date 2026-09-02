import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Player, FormationKey, SlotDef } from '../types';
import { FutCard } from './FutCard';
import { PlayerAvatar } from './PlayerAvatar';
import { sfxClick, sfxCardFlip } from '../utils/audio';
import { Sparkles, Users, RefreshCw, Trash2, ArrowRightLeft, ShieldAlert, Zap, X } from 'lucide-react';

interface PitchBoardProps {
  squad: Record<string, Player | null>;
  bench: Player[];
  reserves: Player[];
  formation: FormationKey;
  onFormationChange: (f: FormationKey) => void;
  onAssignPlayer: (slotId: string, player: Player) => void;
  onRemovePlayer: (slotId: string) => void;
  onRandomSquad: () => void;
  onClearSquad: () => void;
  availablePlayers: Player[];
}

const FORMATION_CONFIGS: Record<FormationKey, { name: string; slots: SlotDef[] }> = {
  '4-3-3': {
    name: '4-3-3 Hujumkor',
    slots: [
      { id: 'gk', role: 'GK', x: 50, y: 88, zone: 'GK' },
      { id: 'lb', role: 'LB', x: 16, y: 72, zone: 'DEF' },
      { id: 'cb1', role: 'CB', x: 38, y: 74, zone: 'DEF' },
      { id: 'cb2', role: 'CB', x: 62, y: 74, zone: 'DEF' },
      { id: 'rb', role: 'RB', x: 84, y: 72, zone: 'DEF' },
      { id: 'cm1', role: 'CMF', x: 28, y: 50, zone: 'MID' },
      { id: 'cdm', role: 'DMF', x: 50, y: 54, zone: 'MID' },
      { id: 'cm2', role: 'CMF', x: 72, y: 50, zone: 'MID' },
      { id: 'lw', role: 'LWF', x: 18, y: 24, zone: 'FWD' },
      { id: 'st', role: 'CF', x: 50, y: 18, zone: 'FWD' },
      { id: 'rw', role: 'RWF', x: 82, y: 24, zone: 'FWD' }
    ]
  },
  '4-2-3-1': {
    name: '4-2-3-1 Muvozanatli',
    slots: [
      { id: 'gk', role: 'GK', x: 50, y: 88, zone: 'GK' },
      { id: 'lb', role: 'LB', x: 16, y: 72, zone: 'DEF' },
      { id: 'cb1', role: 'CB', x: 38, y: 74, zone: 'DEF' },
      { id: 'cb2', role: 'CB', x: 62, y: 74, zone: 'DEF' },
      { id: 'rb', role: 'RB', x: 84, y: 72, zone: 'DEF' },
      { id: 'cdm1', role: 'DMF', x: 36, y: 56, zone: 'MID' },
      { id: 'cdm2', role: 'DMF', x: 64, y: 56, zone: 'MID' },
      { id: 'lam', role: 'LMF', x: 20, y: 36, zone: 'MID' },
      { id: 'cam', role: 'AMF', x: 50, y: 34, zone: 'MID' },
      { id: 'ram', role: 'RMF', x: 80, y: 36, zone: 'MID' },
      { id: 'st', role: 'CF', x: 50, y: 16, zone: 'FWD' }
    ]
  },
  '4-4-2': {
    name: '4-4-2 Klassik',
    slots: [
      { id: 'gk', role: 'GK', x: 50, y: 88, zone: 'GK' },
      { id: 'lb', role: 'LB', x: 16, y: 72, zone: 'DEF' },
      { id: 'cb1', role: 'CB', x: 38, y: 74, zone: 'DEF' },
      { id: 'cb2', role: 'CB', x: 62, y: 74, zone: 'DEF' },
      { id: 'rb', role: 'RB', x: 84, y: 72, zone: 'DEF' },
      { id: 'lm', role: 'LMF', x: 16, y: 48, zone: 'MID' },
      { id: 'cm1', role: 'CMF', x: 38, y: 50, zone: 'MID' },
      { id: 'cm2', role: 'CMF', x: 62, y: 50, zone: 'MID' },
      { id: 'rm', role: 'RMF', x: 84, y: 48, zone: 'MID' },
      { id: 'st1', role: 'CF', x: 36, y: 20, zone: 'FWD' },
      { id: 'st2', role: 'ST', x: 64, y: 20, zone: 'FWD' }
    ]
  },
  '3-5-2': {
    name: '3-5-2 Dominant',
    slots: [
      { id: 'gk', role: 'GK', x: 50, y: 88, zone: 'GK' },
      { id: 'cb1', role: 'CB', x: 25, y: 74, zone: 'DEF' },
      { id: 'cb2', role: 'CB', x: 50, y: 76, zone: 'DEF' },
      { id: 'cb3', role: 'CB', x: 75, y: 74, zone: 'DEF' },
      { id: 'lm', role: 'LMF', x: 14, y: 48, zone: 'MID' },
      { id: 'cdm1', role: 'DMF', x: 36, y: 56, zone: 'MID' },
      { id: 'cam', role: 'AMF', x: 50, y: 40, zone: 'MID' },
      { id: 'cdm2', role: 'DMF', x: 64, y: 56, zone: 'MID' },
      { id: 'rm', role: 'RMF', x: 86, y: 48, zone: 'MID' },
      { id: 'st1', role: 'CF', x: 36, y: 20, zone: 'FWD' },
      { id: 'st2', role: 'ST', x: 64, y: 20, zone: 'FWD' }
    ]
  },
  '3-4-3': {
    name: '3-4-3 Yuqori Pressing',
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
    slots: [
      { id: 'gk', role: 'GK', x: 50, y: 88, zone: 'GK' },
      { id: 'lwb', role: 'LWB', x: 12, y: 68, zone: 'DEF' },
      { id: 'cb1', role: 'CB', x: 30, y: 74, zone: 'DEF' },
      { id: 'cb2', role: 'CB', x: 50, y: 76, zone: 'DEF' },
      { id: 'cb3', role: 'CB', x: 70, y: 74, zone: 'DEF' },
      { id: 'rwb', role: 'RWB', x: 88, y: 68, zone: 'DEF' },
      { id: 'cm1', role: 'CMF', x: 30, y: 48, zone: 'MID' },
      { id: 'cdm', role: 'DMF', x: 50, y: 52, zone: 'MID' },
      { id: 'cm2', role: 'CMF', x: 70, y: 48, zone: 'MID' },
      { id: 'st1', role: 'CF', x: 36, y: 20, zone: 'FWD' },
      { id: 'st2', role: 'ST', x: 64, y: 20, zone: 'FWD' }
    ]
  },
  '4-1-2-1-2': {
    name: '4-1-2-1-2 Olmos (Diamond)',
    slots: [
      { id: 'gk', role: 'GK', x: 50, y: 88, zone: 'GK' },
      { id: 'lb', role: 'LB', x: 16, y: 72, zone: 'DEF' },
      { id: 'cb1', role: 'CB', x: 38, y: 74, zone: 'DEF' },
      { id: 'cb2', role: 'CB', x: 62, y: 74, zone: 'DEF' },
      { id: 'rb', role: 'RB', x: 84, y: 72, zone: 'DEF' },
      { id: 'cdm', role: 'DMF', x: 50, y: 60, zone: 'MID' },
      { id: 'cm1', role: 'CMF', x: 28, y: 46, zone: 'MID' },
      { id: 'cm2', role: 'CMF', x: 72, y: 46, zone: 'MID' },
      { id: 'cam', role: 'AMF', x: 50, y: 34, zone: 'MID' },
      { id: 'st1', role: 'CF', x: 36, y: 18, zone: 'FWD' },
      { id: 'st2', role: 'ST', x: 64, y: 18, zone: 'FWD' }
    ]
  },
  '4-3-1-2': {
    name: '4-3-1-2 Yilqir Markaz',
    slots: [
      { id: 'gk', role: 'GK', x: 50, y: 88, zone: 'GK' },
      { id: 'lb', role: 'LB', x: 16, y: 72, zone: 'DEF' },
      { id: 'cb1', role: 'CB', x: 38, y: 74, zone: 'DEF' },
      { id: 'cb2', role: 'CB', x: 62, y: 74, zone: 'DEF' },
      { id: 'rb', role: 'RB', x: 84, y: 72, zone: 'DEF' },
      { id: 'cm1', role: 'CMF', x: 28, y: 54, zone: 'MID' },
      { id: 'cdm', role: 'DMF', x: 50, y: 58, zone: 'MID' },
      { id: 'cm2', role: 'CMF', x: 72, y: 54, zone: 'MID' },
      { id: 'cam', role: 'AMF', x: 50, y: 36, zone: 'MID' },
      { id: 'st1', role: 'CF', x: 36, y: 18, zone: 'FWD' },
      { id: 'st2', role: 'ST', x: 64, y: 18, zone: 'FWD' }
    ]
  },
  '5-2-3': {
    name: '5-2-3 Qarshi Hujum',
    slots: [
      { id: 'gk', role: 'GK', x: 50, y: 88, zone: 'GK' },
      { id: 'lwb', role: 'LWB', x: 12, y: 68, zone: 'DEF' },
      { id: 'cb1', role: 'CB', x: 30, y: 74, zone: 'DEF' },
      { id: 'cb2', role: 'CB', x: 50, y: 76, zone: 'DEF' },
      { id: 'cb3', role: 'CB', x: 70, y: 74, zone: 'DEF' },
      { id: 'rwb', role: 'RWB', x: 88, y: 68, zone: 'DEF' },
      { id: 'cm1', role: 'CMF', x: 38, y: 50, zone: 'MID' },
      { id: 'cm2', role: 'CMF', x: 62, y: 50, zone: 'MID' },
      { id: 'lw', role: 'LWF', x: 20, y: 22, zone: 'FWD' },
      { id: 'st', role: 'CF', x: 50, y: 16, zone: 'FWD' },
      { id: 'rw', role: 'RWF', x: 80, y: 22, zone: 'FWD' }
    ]
  },
  '4-5-1': {
    name: '4-5-1 Zirhli Blok',
    slots: [
      { id: 'gk', role: 'GK', x: 50, y: 88, zone: 'GK' },
      { id: 'lb', role: 'LB', x: 16, y: 72, zone: 'DEF' },
      { id: 'cb1', role: 'CB', x: 38, y: 74, zone: 'DEF' },
      { id: 'cb2', role: 'CB', x: 62, y: 74, zone: 'DEF' },
      { id: 'rb', role: 'RB', x: 84, y: 72, zone: 'DEF' },
      { id: 'lm', role: 'LMF', x: 14, y: 44, zone: 'MID' },
      { id: 'cm1', role: 'CMF', x: 32, y: 48, zone: 'MID' },
      { id: 'cdm', role: 'DMF', x: 50, y: 54, zone: 'MID' },
      { id: 'cm2', role: 'CMF', x: 68, y: 48, zone: 'MID' },
      { id: 'rm', role: 'RMF', x: 86, y: 44, zone: 'MID' },
      { id: 'st', role: 'CF', x: 50, y: 18, zone: 'FWD' }
    ]
  }
};

export const PitchBoard: React.FC<PitchBoardProps> = ({
  squad,
  bench,
  reserves,
  formation,
  onFormationChange,
  onAssignPlayer,
  onRemovePlayer,
  onRandomSquad,
  onClearSquad,
  availablePlayers
}) => {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [inspectedPlayer, setInspectedPlayer] = useState<Player | null>(null);
  const [pickerModalOpen, setPickerModalOpen] = useState(false);

  const currentSlots = FORMATION_CONFIGS[formation]?.slots || FORMATION_CONFIGS['4-3-3'].slots;

  // Calculate team metrics
  const activeStarters = currentSlots.map(s => squad[s.id]).filter((p): p is Player => p !== null);

  const starterCount = activeStarters.length;
  const teamOvr = starterCount
    ? Math.round(activeStarters.reduce((acc, p) => acc + p.ovr, 0) / starterCount)
    : 0;

  // Chemistry calculation
  let chemistry = 0;
  if (starterCount > 0) {
    let linksScore = 0;
    activeStarters.forEach((p, i) => {
      activeStarters.slice(i + 1).forEach(other => {
        if (p.nation.name === other.nation.name) linksScore += 4;
        if (p.club === other.club) linksScore += 6;
        if (p.league === other.league) linksScore += 2;
      });
    });
    chemistry = Math.min(100, Math.round((starterCount / 11) * 60 + (linksScore / 10) * 40));
  }

  const attackRating = starterCount
    ? Math.round(
        activeStarters.reduce((acc, p) => acc + (p.family === 'FW' ? p.ovr : p.attrs.sho * 0.7 + p.attrs.pac * 0.3), 0) /
          starterCount
      )
    : 0;

  const midRating = starterCount
    ? Math.round(
        activeStarters.reduce((acc, p) => acc + (p.family === 'MF' ? p.ovr : p.attrs.pas * 0.6 + p.attrs.dri * 0.4), 0) /
          starterCount
      )
    : 0;

  const defRating = starterCount
    ? Math.round(
        activeStarters.reduce((acc, p) => acc + (p.family === 'DF' || p.family === 'GK' ? p.ovr : p.attrs.def * 0.8), 0) /
          starterCount
      )
    : 0;

  const handleSlotClick = (slotId: string) => {
    sfxClick();
    const existing = squad[slotId];
    if (existing) {
      setInspectedPlayer(existing);
    } else {
      setSelectedSlot(slotId);
      setPickerModalOpen(true);
    }
  };

  const handlePickPlayer = (player: Player) => {
    if (!selectedSlot) return;
    sfxCardFlip(3);
    onAssignPlayer(selectedSlot, player);
    setPickerModalOpen(false);
    setSelectedSlot(null);
  };

  return (
    <div className="w-full flex flex-col gap-5">
      {/* Top HUD: Team Metrics Bar in Glassmorphic styling */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-6 gap-3 p-4 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/[0.04] border border-white/5">
          <span className="text-2xl font-black text-amber-400 drop-shadow">{teamOvr}</span>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Jamoa OVR</span>
        </div>
        <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/[0.04] border border-white/5" title="Futbolchilar klubi, ligasi va millatining o‘zaro mosligi hisobiga jamoaviy tushunish darajasi">
          <span className="text-2xl font-black text-cyan-400 drop-shadow">{chemistry}</span>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Hamjihatlik (100)</span>
        </div>
        <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/[0.04] border border-white/5">
          <span className="text-2xl font-black text-red-400 drop-shadow">{attackRating}</span>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Hujum</span>
        </div>
        <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/[0.04] border border-white/5">
          <span className="text-2xl font-black text-emerald-400 drop-shadow">{midRating}</span>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Markaz</span>
        </div>
        <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/[0.04] border border-white/5">
          <span className="text-2xl font-black text-blue-400 drop-shadow">{defRating}</span>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Himoya</span>
        </div>
        <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/[0.04] border border-white/5">
          <span className="text-2xl font-black text-purple-300 drop-shadow">{starterCount}/11</span>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tarkib</span>
        </div>
      </div>

      {/* Control Actions & Formation selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/60 border border-white/10 backdrop-blur-md">
        {/* Formation dropdown pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
          <span className="text-xs font-black text-cyan-400 uppercase tracking-wider mr-1 shrink-0">Taktika:</span>
          {(Object.keys(FORMATION_CONFIGS) as FormationKey[]).map(fk => (
            <button
              key={fk}
              onClick={() => {
                sfxClick();
                onFormationChange(fk);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all shrink-0 ${
                formation === fk
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/30'
                  : 'bg-white/[0.06] text-slate-300 hover:bg-white/10 border border-white/5'
              }`}
            >
              {fk}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sfxClick();
              onRandomSquad();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Tasodifiy Yulduzlar
          </button>
          <button
            onClick={() => {
              sfxClick();
              onClearSquad();
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-white/[0.06] hover:bg-red-500/20 text-red-300 border border-white/5 transition-all cursor-pointer"
            title="Tarkibni tozalash"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Tozalash
          </button>
        </div>
      </div>

      {/* Main Tactical Pitch Stage */}
      <div className="relative w-full aspect-[1/1.3] max-w-[620px] mx-auto rounded-3xl overflow-hidden border-2 border-emerald-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_0_80px_rgba(6,78,59,0.3)] bg-gradient-to-b from-[#06381e] via-[#052b17] to-[#041c0f]">
        {/* Lawn mowing grass stripes */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 48px, transparent 48px, transparent 96px)'
          }}
        />

        {/* Floodlight beams */}
        <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full bg-cyan-400/10 filter blur-3xl pointer-events-none" />
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-emerald-400/10 filter blur-3xl pointer-events-none" />

        {/* Pitch Tactical Markings (SVG overlay) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-white/40" strokeWidth="2" fill="none">
          {/* Border */}
          <rect x="18" y="18" width="calc(100% - 36px)" height="calc(100% - 36px)" rx="16" />
          {/* Halfway line */}
          <line x1="18" y1="50%" x2="calc(100% - 18px)" y2="50%" />
          {/* Center circle */}
          <circle cx="50%" cy="50%" r="48" />
          <circle cx="50%" cy="50%" r="3" fill="rgba(255,255,255,0.7)" />

          {/* Top Penalty Box (Opponent) */}
          <rect x="25%" y="18" width="50%" height="15%" />
          <rect x="37%" y="18" width="26%" height="6%" />
          <circle cx="50%" cy="13%" r="2" fill="rgba(255,255,255,0.7)" />

          {/* Bottom Penalty Box (Our Goal) */}
          <rect x="25%" y="calc(85% - 18px)" width="50%" height="15%" />
          <rect x="37%" y="calc(94% - 18px)" width="26%" height="6%" />
          <circle cx="50%" cy="87%" r="2" fill="rgba(255,255,255,0.7)" />

          {/* Corner arcs */}
          <path d="M 18 34 A 16 16 0 0 0 34 18" />
          <path d="M calc(100% - 34px) 18 A 16 16 0 0 0 calc(100% - 18px) 34" />
          <path d="M 18 calc(100% - 34px) A 16 16 0 0 0 34 calc(100% - 18px)" />
          <path d="M calc(100% - 34px) calc(100% - 18px) A 16 16 0 0 0 calc(100% - 18px) calc(100% - 34px)" />
        </svg>

        {/* Player Pitch Slots */}
        {currentSlots.map(slot => {
          const player = squad[slot.id];
          const isMatch = player
            ? player.role === slot.role || (player.naturalPositions && player.naturalPositions.includes(slot.role))
            : true;

          return (
            <div
              key={slot.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
              style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
            >
              <button
                onClick={() => handleSlotClick(slot.id)}
                className={`group relative flex flex-col items-center justify-center rounded-2xl p-1.5 transition-all duration-200 cursor-pointer ${
                  player
                    ? `w-16 h-18 sm:w-20 sm:h-22 bg-slate-950/85 hover:bg-slate-900 border ${
                        isMatch
                          ? 'border-emerald-400/40 hover:border-emerald-400 shadow-xl shadow-black/80'
                          : 'border-amber-400/60 hover:border-amber-400 shadow-xl shadow-amber-950/40'
                      } hover:scale-105`
                    : 'w-14 h-16 sm:w-16 sm:h-18 bg-white/10 hover:bg-white/20 border-2 border-dashed border-white/40 hover:border-cyan-300'
                }`}
                title={player && !isMatch ? `${player.name} (${player.role}) bu ${slot.role} pozitsiyasiga mos emas` : undefined}
              >
                {player ? (
                  <>
                    <div className="relative">
                      <PlayerAvatar avatar={player.avatar} size={36} />
                      <span className="absolute -bottom-1 -right-1 text-[10px] leading-none">
                        {player.nation.flag}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="font-black text-xs text-amber-300 leading-none">{player.ovr}</span>
                      <span className={`font-black text-[9px] leading-none ${isMatch ? 'text-cyan-300' : 'text-amber-400'}`}>
                        {player.role}
                      </span>
                    </div>
                    <span className="text-[9px] font-bold text-white truncate max-w-[62px] mt-0.5 leading-none">
                      {player.name.split(' ').pop()}
                    </span>
                    {!isMatch && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-500 text-slate-950 text-[9px] font-black flex items-center justify-center shadow">
                        !
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <span className="text-lg text-white/70 group-hover:text-cyan-300 group-hover:scale-125 transition-transform">
                      +
                    </span>
                    <span className="text-[10px] font-black text-white/80 group-hover:text-cyan-300 tracking-wider">
                      {slot.role}
                    </span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Bench (Zaxira) & Reserves (Rezerv) */}
      <div className="w-full p-4 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-sm font-black text-white">
            <Users className="w-4 h-4 text-cyan-400" />
            <span>Zaxira O‘yinchilari (Bench & Reserves)</span>
          </div>
          <span className="text-xs font-bold text-slate-400">{bench.length} nafar zaxirada</span>
        </div>

        {/* Bench list */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {bench.map((player, idx) => (
            <div
              key={`bench_${player.id}_${idx}`}
              onClick={() => {
                sfxClick();
                setInspectedPlayer(player);
              }}
              className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 cursor-pointer transition-all hover:scale-102"
            >
              <PlayerAvatar avatar={player.avatar} size={30} />
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1">
                  <span className="font-black text-xs text-amber-400">{player.ovr}</span>
                  <span className="text-[9px] font-bold text-cyan-300">{player.role}</span>
                </div>
                <span className="text-[10px] font-bold text-white truncate max-w-[70px]">
                  {player.name.split(' ').pop()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Player Inspection Modal / Drawer */}
      <AnimatePresence>
        {inspectedPlayer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setInspectedPlayer(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative max-w-md w-full p-6 rounded-3xl bg-slate-900 border border-white/20 shadow-2xl flex flex-col items-center gap-4 text-white"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setInspectedPlayer(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Holographic FUT Card Preview */}
              <FutCard player={inspectedPlayer} size="md" />

              {/* Detailed Skills & Information */}
              <div className="w-full flex flex-col gap-2 mt-2">
                <div className="flex justify-between items-center text-xs p-2 rounded-lg bg-white/[0.04]">
                  <span className="text-slate-400">O‘yin uslubi (Playstyle):</span>
                  <span className="font-black text-cyan-300">{inspectedPlayer.playStyle}</span>
                </div>
                <div className="flex justify-between items-center text-xs p-2 rounded-lg bg-white/[0.04]">
                  <span className="text-slate-400">Bo‘yi / Vazni:</span>
                  <span className="font-bold text-white">
                    {inspectedPlayer.height} sm • {inspectedPlayer.weight} kg
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs p-2 rounded-lg bg-white/[0.04]">
                  <span className="text-slate-400">Transfer Bahosi:</span>
                  <span className="font-black text-amber-400">
                    €{(inspectedPlayer.marketValue / 1_000_000).toFixed(1)}M
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {inspectedPlayer.skills.map((s, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30"
                    >
                      ★ {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Slot removal button if on field */}
              {Object.entries(squad).some(([_, p]) => (p as Player | null)?.id === inspectedPlayer.id) && (
                <button
                  onClick={() => {
                    const slotEntry = Object.entries(squad).find(([_, p]) => (p as Player | null)?.id === inspectedPlayer.id);
                    if (slotEntry) {
                      onRemovePlayer(slotEntry[0]);
                      setInspectedPlayer(null);
                    }
                  }}
                  className="w-full py-2.5 rounded-xl font-black text-xs bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 transition-colors"
                >
                  Pozitsiyadan Olish (Zaxiraga Qaytarish)
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Player Picker Modal (assign player to clicked slot) */}
      <AnimatePresence>
        {pickerModalOpen && selectedSlot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setPickerModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative max-w-xl w-full max-h-[85vh] p-5 rounded-3xl bg-slate-900 border border-white/20 shadow-2xl flex flex-col gap-4 text-white overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <div>
                  <h3 className="font-black text-base text-cyan-300">
                    {selectedSlot.toUpperCase()} Pozitsiyasi Uchun Futbolchi Tanlang
                  </h3>
                  <p className="text-xs text-slate-400">Mavjud barcha yulduzlar va zaxira o‘yinchilari</p>
                </div>
                <button
                  onClick={() => setPickerModalOpen(false)}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable list of available players */}
              <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2 pr-1 max-h-[420px]">
                {availablePlayers.map((player, idx) => (
                  <button
                    key={`pick_${player.id}_${idx}`}
                    onClick={() => handlePickPlayer(player)}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.05] hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-400 transition-all text-left cursor-pointer"
                  >
                    <PlayerAvatar avatar={player.avatar} size={42} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-sm text-amber-400">{player.ovr}</span>
                        <span className="font-black text-xs text-cyan-300 px-1.5 py-0.5 rounded bg-cyan-950/60">
                          {player.role}
                        </span>
                        <span className="text-xs">{player.nation.flag}</span>
                      </div>
                      <h4 className="font-bold text-xs text-white truncate mt-0.5">{player.name}</h4>
                      <p className="text-[10px] text-slate-400 truncate">{player.club}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
