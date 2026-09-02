import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Player, FormationKey, SlotDef, CardBackgroundTheme, PositionRole } from '../types';
import { FORMATION_CONFIGS, determineRoleFromCoordinates } from '../data/formations';
import { FutCard } from './FutCard';
import { PlayerAvatar } from './PlayerAvatar';
import { sfxClick, sfxCardFlip } from '../utils/audio';
import {
  Users,
  Trash2,
  ArrowRightLeft,
  X,
  Repeat,
  RotateCcw,
  Sliders,
  Move,
  Flame,
  Shield,
  Zap,
  Target,
  Eye,
  EyeOff,
  Compass,
  Layers,
  ChevronDown
} from 'lucide-react';

interface PitchBoardProps {
  squad: Record<string, Player | null>;
  bench: Player[];
  reserves: Player[];
  formation: FormationKey;
  onFormationChange: (f: FormationKey) => void;
  onAssignPlayer: (slotId: string, player: Player) => void;
  onRemovePlayer: (slotId: string) => void;
  onSwapPositions?: (fromSlotId: string, toSlotId: string) => void;
  onSwapBenchPlayer?: (benchPlayerId: string, slotId: string) => void;
  onUpdatePlayer?: (player: Player) => void;
  onClearSquad: () => void;
  availablePlayers: Player[];
}

type PESPlaystyle = 'quick-counter' | 'possession' | 'out-wide' | 'long-ball' | 'press';

export const PitchBoard: React.FC<PitchBoardProps> = ({
  squad,
  bench,
  reserves,
  formation,
  onFormationChange,
  onAssignPlayer,
  onRemovePlayer,
  onSwapPositions,
  onSwapBenchPlayer,
  onUpdatePlayer,
  onClearSquad,
  availablePlayers
}) => {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [inspectedPlayer, setInspectedPlayer] = useState<Player | null>(null);
  const [pickerModalOpen, setPickerModalOpen] = useState(false);

  // Position / Bench Swap State
  const [swapSourceSlot, setSwapSourceSlot] = useState<string | null>(null);
  const [swapSourceBenchPlayer, setSwapSourceBenchPlayer] = useState<Player | null>(null);

  // PES 2026 Features State
  const [showTacticalZones, setShowTacticalZones] = useState<boolean>(true);
  const [customPositions, setCustomPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [draggingSlotId, setDraggingSlotId] = useState<string | null>(null);
  const [teamPlaystyle, setTeamPlaystyle] = useState<PESPlaystyle>('quick-counter');
  const [attackDefLevel, setAttackDefLevel] = useState<number>(0); // -2 to +2 PES D-Pad Attack/Def balance

  // Ref for the pitch container to compute exact pointer coordinates
  const pitchRef = useRef<HTMLDivElement | null>(null);
  const dragStartRef = useRef<{
    startX: number;
    startY: number;
    initialSlotX: number;
    initialSlotY: number;
  } | null>(null);

  // Reset custom positions when formation changes to keep it clean
  useEffect(() => {
    setCustomPositions({});
  }, [formation]);

  const currentConfig = FORMATION_CONFIGS[formation] || FORMATION_CONFIGS['4-3-3'];
  const currentSlots = currentConfig.slots;

  // Helper to get active coordinate of a slot (either custom dragged or formation default)
  const getSlotPosition = (slot: SlotDef) => {
    if (customPositions[slot.id]) {
      return customPositions[slot.id];
    }
    return { x: slot.x, y: slot.y };
  };

  // Calculate team metrics safely
  const activeStarters = currentSlots
    .map(s => squad[s.id])
    .filter((p): p is Player => Boolean(p));
  const starterCount = activeStarters.length;
  const teamOvr = starterCount
    ? Math.round(activeStarters.reduce((acc, p) => acc + (p?.ovr || 75), 0) / starterCount)
    : 0;

  // Chemistry calculation
  let chemistry = 0;
  if (starterCount > 0) {
    let linksScore = 0;
    activeStarters.forEach((p, i) => {
      activeStarters.slice(i + 1).forEach(other => {
        if (p?.nation?.name && other?.nation?.name && p.nation.name === other.nation.name) linksScore += 4;
        if (p?.club && other?.club && p.club === other.club) linksScore += 6;
        if (p?.league && other?.league && p.league === other.league) linksScore += 2;
      });
    });
    chemistry = Math.min(100, Math.round((starterCount / 11) * 60 + (linksScore / 10) * 40));
  }

  // Attack, Mid, Def ratings with Playstyle modifier
  const attackRating = starterCount
    ? Math.round(
        activeStarters.reduce(
          (acc, p) => acc + (p?.family === 'FW' ? p.ovr : (p?.attrs?.sho || 70) * 0.7 + (p?.attrs?.pac || 70) * 0.3),
          0
        ) / starterCount
      )
    : 0;

  const midRating = starterCount
    ? Math.round(
        activeStarters.reduce(
          (acc, p) => acc + (p?.family === 'MF' ? p.ovr : (p?.attrs?.pas || 70) * 0.6 + (p?.attrs?.dri || 70) * 0.4),
          0
        ) / starterCount
      )
    : 0;

  const defRating = starterCount
    ? Math.round(
        activeStarters.reduce(
          (acc, p) =>
            acc + (p?.family === 'DF' || p?.family === 'GK' ? p.ovr : (p?.attrs?.def || 70) * 0.8),
          0
        ) / starterCount
      )
    : 0;

  // --- POINTER DRAG & DROP FOR PES 2026 TACTICAL POSITIONING ---
  const handleSlotPointerDown = (slotId: string, e: React.PointerEvent) => {
    // If in swap mode, do not trigger drag
    if (swapSourceSlot || swapSourceBenchPlayer) return;

    const targetSlot = currentSlots.find(s => s.id === slotId);
    if (!targetSlot) return;

    const currentPos = getSlotPosition(targetSlot);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialSlotX: currentPos.x,
      initialSlotY: currentPos.y
    };
    setDraggingSlotId(slotId);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePitchPointerMove = (e: React.PointerEvent) => {
    if (!draggingSlotId || !dragStartRef.current || !pitchRef.current) return;

    const rect = pitchRef.current.getBoundingClientRect();
    const deltaX = e.clientX - dragStartRef.current.startX;
    const deltaY = e.clientY - dragStartRef.current.startY;

    const deltaPercentX = (deltaX / rect.width) * 100;
    const deltaPercentY = (deltaY / rect.height) * 100;

    const newX = Math.max(10, Math.min(90, dragStartRef.current.initialSlotX + deltaPercentX));
    const newY = Math.max(10, Math.min(91, dragStartRef.current.initialSlotY + deltaPercentY));

    setCustomPositions(prev => ({
      ...prev,
      [draggingSlotId]: { x: Math.round(newX * 10) / 10, y: Math.round(newY * 10) / 10 }
    }));
  };

  const handlePitchPointerUp = (e: React.PointerEvent) => {
    if (draggingSlotId) {
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      setDraggingSlotId(null);
      dragStartRef.current = null;
    }
  };

  // Reset custom player coordinates to standard formation
  const handleResetPositions = () => {
    sfxClick();
    setCustomPositions({});
  };

  // Handle Slot Click (either normal or in swap mode)
  const handleSlotClick = (slotId: string) => {
    sfxClick();

    // If we are currently in Swap Mode from a field slot:
    if (swapSourceSlot) {
      if (swapSourceSlot === slotId) {
        setSwapSourceSlot(null);
        return;
      }
      if (onSwapPositions) {
        onSwapPositions(swapSourceSlot, slotId);
      }
      setSwapSourceSlot(null);
      return;
    }

    // If we are currently in Swap Mode from a bench player:
    if (swapSourceBenchPlayer) {
      if (onSwapBenchPlayer) {
        onSwapBenchPlayer(swapSourceBenchPlayer.id, slotId);
      }
      setSwapSourceBenchPlayer(null);
      return;
    }

    // Normal slot click:
    const playerInSlot = squad[slotId];
    if (playerInSlot) {
      sfxCardFlip();
      setInspectedPlayer(playerInSlot);
    } else {
      setSelectedSlot(slotId);
      setPickerModalOpen(true);
    }
  };

  const handlePickPlayer = (player: Player) => {
    if (selectedSlot) {
      onAssignPlayer(selectedSlot, player);
      setPickerModalOpen(false);
      setSelectedSlot(null);
      sfxClick();
    }
  };

  const handleThemeChangeForPlayer = (theme: CardBackgroundTheme) => {
    if (inspectedPlayer && onUpdatePlayer) {
      onUpdatePlayer({ ...inspectedPlayer, cardTheme: theme });
      setInspectedPlayer(prev => (prev ? { ...prev, cardTheme: theme } : null));
    }
  };

  // PES Player Condition Helper (⬆️ Ajoyib, ↗️ Yaxshi, ➡️ O'rtacha)
  const getConditionBadge = (ovr: number, id: string) => {
    const hash = (id.charCodeAt(0) + id.charCodeAt(id.length - 1)) % 3;
    if (hash === 0) {
      return { icon: '⬆️', label: 'Ajoyib forma', color: 'text-cyan-400 bg-cyan-950/80 border-cyan-500/40' };
    }
    if (hash === 1) {
      return { icon: '↗️', label: 'Yaxshi', color: 'text-emerald-400 bg-emerald-950/80 border-emerald-500/40' };
    }
    return { icon: '➡️', label: 'Barqaror', color: 'text-amber-400 bg-amber-950/80 border-amber-500/40' };
  };

  return (
    <div className="w-full flex flex-col gap-4 max-w-7xl mx-auto pb-12">
      {/* Top Banner: Metrics & PES Tactical Control Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        {/* Rating & Chemistry Dashboard */}
        <div className="lg:col-span-8 p-4 rounded-3xl bg-slate-900/90 border border-white/10 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-3">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-lg shadow-amber-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex flex-col items-center justify-center">
                  <span className="text-[10px] uppercase font-black tracking-widest text-amber-400">OVR</span>
                  <span className="text-xl font-black text-white">{teamOvr || '--'}</span>
                </div>
              </div>
              <div>
                <h2 className="font-black text-sm tracking-wide text-white">Jamoa Reytingi</h2>
                <p className="text-xs text-slate-400">
                  {starterCount}/11 Maydonda • {starterCount === 11 ? 'To‘liq tarkib' : `${11 - starterCount} bo‘sh joy`}
                </p>
              </div>
            </div>

            {/* Chemistry Ring */}
            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-500 p-0.5 shadow-lg shadow-cyan-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex flex-col items-center justify-center">
                  <span className="text-[10px] uppercase font-black tracking-widest text-cyan-400">KIMYO</span>
                  <span className="text-xl font-black text-white">{chemistry}</span>
                </div>
              </div>
              <div className="hidden sm:block">
                <span className="text-xs font-bold text-slate-300">Bog‘lanish</span>
                <p className="text-[11px] text-slate-400">Klub va millat uyg‘unligi</p>
              </div>
            </div>
          </div>

          {/* Sector Ratings: ATT / MID / DEF */}
          <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-2xl border border-white/5">
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-red-400">HUJ</span>
              <p className="text-sm font-black text-white">{attackRating}</p>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-emerald-400">YAR</span>
              <p className="text-sm font-black text-white">{midRating}</p>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-blue-400">HIM</span>
              <p className="text-sm font-black text-white">{defRating}</p>
            </div>
          </div>

          {/* Clear Button */}
          <button
            onClick={() => {
              sfxClick();
              onClearSquad();
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/20 text-xs font-bold transition-colors cursor-pointer"
            title="Tarkibni tozalash"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tozalash</span>
          </button>
        </div>

        {/* PES 2026 Attack / Defense Balance Level */}
        <div className="lg:col-span-4 p-4 rounded-3xl bg-slate-900/90 border border-white/10 backdrop-blur-xl flex flex-col justify-between gap-2 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span className="font-black text-xs uppercase tracking-wider text-white">PES 2026 Taktik Balans</span>
            </div>
            <span
              className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                attackDefLevel === 2
                  ? 'bg-red-500/30 text-red-300 border-red-500/50'
                  : attackDefLevel === 1
                  ? 'bg-amber-500/30 text-amber-300 border-amber-500/50'
                  : attackDefLevel === -1
                  ? 'bg-blue-500/30 text-blue-300 border-blue-500/50'
                  : attackDefLevel === -2
                  ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50'
                  : 'bg-slate-700/30 text-slate-300 border-slate-600/50'
              }`}
            >
              {attackDefLevel === 2
                ? 'Hamma Hujumda! (+2)'
                : attackDefLevel === 1
                ? 'Hujumkor (+1)'
                : attackDefLevel === -1
                ? 'Himoyaviy (-1)'
                : attackDefLevel === -2
                ? 'Ultra Himoya (-2)'
                : 'Muvozanatli (0)'}
            </span>
          </div>

          {/* 5-step PES Level Selector */}
          <div className="grid grid-cols-5 gap-1.5 bg-black/40 p-1.5 rounded-2xl border border-white/5">
            {[-2, -1, 0, 1, 2].map(level => (
              <button
                key={level}
                onClick={() => {
                  sfxClick();
                  setAttackDefLevel(level);
                }}
                className={`py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  attackDefLevel === level
                    ? level > 0
                      ? 'bg-gradient-to-r from-red-600 to-amber-500 text-white shadow-lg shadow-red-500/30 scale-105'
                      : level < 0
                      ? 'bg-gradient-to-r from-blue-700 to-indigo-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                      : 'bg-slate-200 text-slate-950 font-black scale-105'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {level > 0 ? `+${level}` : level}
              </button>
            ))}
          </div>

          <p className="text-[10px] text-slate-400 text-center">
            {attackDefLevel > 0
              ? 'Markaziy himoyachilar ham raqib jarima maydoniga ko‘tariladi'
              : attackDefLevel < 0
              ? 'Tarkib o‘z darvozasi oldida zich himoyaga chekinadi'
              : 'Standart taktik tartib va barqaror pozitsion o‘yin'}
          </p>
        </div>
      </div>

      {/* Formation Selector & PES Tactical Controls Bar */}
      <div className="p-4 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-lg">
        {/* Horizontal Formations Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {(Object.keys(FORMATION_CONFIGS) as FormationKey[]).map(fk => {
            const conf = FORMATION_CONFIGS[fk];
            const isSelected = formation === fk;
            return (
              <button
                key={fk}
                onClick={() => {
                  sfxClick();
                  onFormationChange(fk);
                }}
                className={`px-3 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-lg shadow-cyan-500/25 scale-[1.02]'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                }`}
              >
                <span>{fk}</span>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />}
              </button>
            );
          })}
        </div>

        {/* PES Controls: Toggle Zones & Reset Drag */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              sfxClick();
              setShowTacticalZones(prev => !prev);
            }}
            className={`px-3 py-2 rounded-2xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer border ${
              showTacticalZones
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
            }`}
            title="PES 2026 Taktik Zonalari"
          >
            {showTacticalZones ? <Eye className="w-3.5 h-3.5 text-cyan-400" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>PES Zonalar</span>
          </button>

          {Object.keys(customPositions).length > 0 && (
            <button
              onClick={handleResetPositions}
              className="px-3 py-2 rounded-2xl text-xs font-black flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-all cursor-pointer animate-pulse"
              title="O‘yinchilarni standart joylashuviga qaytarish"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Standart Joylashuv</span>
            </button>
          )}
        </div>
      </div>

      {/* SWAP MODE BANNER (When active) */}
      <AnimatePresence>
        {(swapSourceSlot || swapSourceBenchPlayer) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border border-amber-500/40 text-amber-200 flex items-center justify-between shadow-lg shadow-amber-500/10"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center animate-spin">
                <Repeat className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <p className="text-xs font-black text-white">
                  {swapSourceBenchPlayer
                    ? `Zaxiradagi ${swapSourceBenchPlayer.name} uchun maydondagi o‘yinchini tanlang`
                    : `Pozitsiyani almashtirish uchun maydondagi ikkinchi o‘yinchini bosing`}
                </p>
                <p className="text-[10px] text-amber-300">
                  Kerakli katakchani bosishingiz bilan joylar avtomatik almashadi
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setSwapSourceSlot(null);
                setSwapSourceBenchPlayer(null);
              }}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Bekor qilish
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN PES 2026 TACTICAL PITCH */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        <div className="xl:col-span-8 flex flex-col gap-2">
          <div
            ref={pitchRef}
            onPointerMove={handlePitchPointerMove}
            onPointerUp={handlePitchPointerUp}
            className="relative w-full aspect-[1/1.38] sm:aspect-[1/1.32] md:aspect-[1/1.25] rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-800 bg-[#0c3b1a] select-none touch-none cursor-default"
          >
            {/* Realistic Stadium Grass Texture with PES Emerald Stripes */}
            <div className="absolute inset-0 bg-[repeating-linear-gradient(to_bottom,#0e451f,#0e451f_9.09%,#0c3d1b_9.09%,#0c3d1b_18.18%)]" />

            {/* Stadium Pitch Floodlight Lighting Glows */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.08)_0%,transparent_75%)] pointer-events-none" />

            {/* Official Football Pitch Markings (SVG) */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none stroke-white/40 fill-none"
              strokeWidth="2"
            >
              {/* Boundary Outer Line */}
              <rect x="5%" y="4%" width="90%" height="92%" rx="10" />

              {/* Halfway Line */}
              <line x1="5%" y1="50%" x2="95%" y2="50%" />

              {/* Center Circle & Spot */}
              <circle cx="50%" cy="50%" r="13%" />
              <circle cx="50%" cy="50%" r="2" fill="white" />

              {/* Top Penalty Box (Opponent End) */}
              <rect x="25%" y="4%" width="50%" height="16%" />
              <rect x="36%" y="4%" width="28%" height="6%" />
              <circle cx="50%" cy="14%" r="2" fill="white" />
              <path d="M 40% 20% A 12% 12% 0 0 0 60% 20%" />

              {/* Bottom Penalty Box (My Team End) */}
              <rect x="25%" y="80%" width="50%" height="16%" />
              <rect x="36%" y="90%" width="28%" height="6%" />
              <circle cx="50%" cy="86%" r="2" fill="white" />
              <path d="M 40% 80% A 12% 12% 0 0 1 60% 80%" />

              {/* Corner Arcs */}
              <path d="M 5% 7% A 3% 3% 0 0 0 8% 4%" />
              <path d="M 95% 7% A 3% 3% 0 0 1 92% 4%" />
              <path d="M 5% 93% A 3% 3% 0 0 1 8% 96%" />
              <path d="M 95% 93% A 3% 3% 0 0 0 92% 96%" />
            </svg>

            {/* PES 2026 TACTICAL ZONES OVERLAY */}
            {showTacticalZones && (
              <div className="absolute inset-0 pointer-events-none">
                {/* Horizontal Tactical Sectors */}
                {/* 1. Hujum Zonasi (FWD Zone - 0% to 34%) */}
                <div className="absolute top-[4%] left-[5%] right-[5%] h-[30%] border-b-2 border-dashed border-red-400/40 bg-red-500/[0.04]">
                  <div className="absolute top-2 left-3 px-2 py-0.5 rounded-md bg-red-500/20 text-red-300 border border-red-500/30 text-[9px] font-black uppercase tracking-wider backdrop-blur-sm">
                    ⚡ Hujum Zonasi (FWD)
                  </div>
                </div>

                {/* 2. Markaziy Maydon Zonasi (MF Zone - 34% to 65%) */}
                <div className="absolute top-[34%] left-[5%] right-[5%] h-[31%] border-b-2 border-dashed border-emerald-400/40 bg-emerald-500/[0.04]">
                  <div className="absolute top-2 left-3 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-black uppercase tracking-wider backdrop-blur-sm">
                    🎯 Markaziy Maydon (MF)
                  </div>
                </div>

                {/* 3. Himoya Zonasi (DF Zone - 65% to 96%) */}
                <div className="absolute top-[65%] left-[5%] right-[5%] bottom-[4%] bg-blue-500/[0.04]">
                  <div className="absolute top-2 left-3 px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[9px] font-black uppercase tracking-wider backdrop-blur-sm">
                    🛡️ Himoya Zonasi (DF)
                  </div>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[8px] font-black uppercase">
                    Darvozabon (GK)
                  </div>
                </div>

                {/* Vertical Tactical 5-Corridors (PES / Guardiola Pitch Matrix) */}
                <div className="absolute inset-0 flex justify-between px-[5%]">
                  {/* Left Flank (0-22%) */}
                  <div className="w-[20%] h-full border-r border-dashed border-white/10" />
                  {/* Left Half-Space */}
                  <div className="w-[18%] h-full border-r border-dashed border-white/10" />
                  {/* Central Corridor */}
                  <div className="w-[24%] h-full border-r border-dashed border-white/10" />
                  {/* Right Half-Space */}
                  <div className="w-[18%] h-full border-r border-dashed border-white/10" />
                  {/* Right Flank */}
                  <div className="w-[20%] h-full" />
                </div>
              </div>
            )}

            {/* PLAYER SLOTS ON PITCH */}
            {currentSlots.map(slot => {
              const player = squad[slot.id];
              const pos = getSlotPosition(slot);
              const isDragging = draggingSlotId === slot.id;
              const isSwapTarget = swapSourceSlot === slot.id;

              // Calculate dynamic PES role at current coordinates
              const dynamicEval = determineRoleFromCoordinates(pos.x, pos.y);
              const displayRole = dynamicEval.role;

              // Condition arrow
              const condition = player ? getConditionBadge(player.ovr, player.id) : null;

              return (
                <div
                  key={slot.id}
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: isDragging ? 40 : 20
                  }}
                  className="absolute cursor-pointer transition-transform duration-75"
                >
                  {/* Outer Glow / Drag Active Ring */}
                  {isDragging && (
                    <div className="absolute -inset-4 rounded-full border-2 border-cyan-400/80 animate-ping pointer-events-none" />
                  )}

                  {/* Slot Token Container */}
                  <motion.div
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative flex flex-col items-center group ${
                      isSwapTarget ? 'ring-4 ring-amber-400 rounded-2xl animate-pulse' : ''
                    }`}
                  >
                    {/* Drag Handle (PES 2026 Move Trigger) */}
                    <div
                      onPointerDown={e => {
                        e.stopPropagation();
                        handleSlotPointerDown(slot.id, e);
                      }}
                      className="absolute -top-3.5 -right-3.5 z-30 w-7 h-7 rounded-full bg-slate-900/95 border border-cyan-400/60 flex items-center justify-center text-cyan-300 shadow-md hover:bg-cyan-500 hover:text-slate-950 transition-colors cursor-grab active:cursor-grabbing"
                      title="Ushlab surish (Pozitsiyani PES 2026 kabi o‘zgartirish)"
                    >
                      <Move className="w-3.5 h-3.5" />
                    </div>

                    {/* Condition Arrow Badge */}
                    {player && condition && (
                      <div
                        className={`absolute -top-3.5 -left-3.5 z-30 px-1 py-0.5 rounded-full border text-[10px] font-black shadow-md ${condition.color}`}
                        title={condition.label}
                      >
                        {condition.icon}
                      </div>
                    )}

                    {/* Slot Token Content */}
                    <div
                      onClick={() => handleSlotClick(slot.id)}
                      className={`relative w-14 sm:w-16 md:w-18 h-17 sm:h-20 md:h-22 rounded-2xl p-1 flex flex-col items-center justify-between shadow-2xl transition-all ${
                        player
                          ? 'bg-slate-950/95 border-2 border-white/20 hover:border-cyan-400'
                          : 'bg-black/60 border-2 border-dashed border-white/30 hover:border-cyan-400/80'
                      }`}
                    >
                      {player ? (
                        <>
                          {/* Role Tag & Rating */}
                          <div className="w-full flex items-center justify-between px-1">
                            <span
                              className={`text-[9px] font-black uppercase px-1 rounded ${
                                slot.zone === 'FWD'
                                  ? 'bg-red-500/30 text-red-300'
                                  : slot.zone === 'MID'
                                  ? 'bg-emerald-500/30 text-emerald-300'
                                  : slot.zone === 'DEF'
                                  ? 'bg-blue-500/30 text-blue-300'
                                  : 'bg-amber-500/30 text-amber-300'
                              }`}
                            >
                              {displayRole}
                            </span>
                            <span className="text-[10px] font-black text-amber-400">{player.ovr}</span>
                          </div>

                          {/* Player Avatar */}
                          <div className="relative my-auto">
                            <PlayerAvatar avatar={player.avatar} size={38} />
                            {player.nation?.flag && (
                              <span className="absolute -bottom-1 -right-1 text-[11px] drop-shadow">
                                {player.nation.flag}
                              </span>
                            )}
                          </div>

                          {/* Player Name */}
                          <div className="w-full text-center truncate px-0.5">
                            <span className="text-[10px] font-black text-white tracking-tight truncate block">
                              {player.name.split(' ').pop()}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                          <span className="text-xs font-black text-cyan-300">{displayRole}</span>
                          <span className="text-[16px] text-white/50">+</span>
                          <span className="text-[8px] font-bold text-slate-400 uppercase">Tanlash</span>
                        </div>
                      )}
                    </div>

                    {/* Coordinates Crosshair when dragging */}
                    {isDragging && (
                      <div className="absolute top-full mt-1.5 px-2 py-0.5 rounded-lg bg-black/90 border border-cyan-400 text-cyan-300 text-[10px] font-black whitespace-nowrap z-50">
                        {displayRole} ({Math.round(pos.x)}%, {Math.round(pos.y)}%)
                      </div>
                    )}
                  </motion.div>
                </div>
              );
            })}
          </div>

          {/* Quick Help / PES Hints */}
          <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 px-2 py-1">
            <span>💡 Har qanday futbolchini burchakdagi ✥ tugmachasi orqali maydon bo‘ylab erkin surishingiz mumkin</span>
            <span className="text-cyan-400 font-bold">PES 2026 Game Plan Engine</span>
          </div>
        </div>

        {/* RIGHT SIDEBAR: Bench, Reserves & PES Playstyle Tactics */}
        <div className="xl:col-span-4 flex flex-col gap-4">
          {/* PES 2026 Playstyles Selector */}
          <div className="p-4 rounded-3xl bg-slate-900/90 border border-white/10 backdrop-blur-xl flex flex-col gap-3 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                <h3 className="font-black text-sm text-white">PES O‘yin Uslubi (Playstyle)</h3>
              </div>
              <span className="text-[10px] font-black uppercase text-cyan-300 px-2 py-0.5 rounded-md bg-cyan-500/20">
                Taktika
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {[
                {
                  id: 'quick-counter',
                  name: 'Tezkor qarshi hujum (Quick Counter)',
                  desc: 'To‘pni oliboq vingerlar sprint qiladi va forvardga pas beriladi',
                  icon: Zap,
                  color: 'from-amber-500 to-orange-500'
                },
                {
                  id: 'possession',
                  name: 'To‘p nazorati (Possession Game)',
                  desc: 'Qisqa uzatmalar, markaziy ustunlik va bo‘sh zonalarni ochish',
                  icon: Target,
                  color: 'from-cyan-500 to-blue-500'
                },
                {
                  id: 'out-wide',
                  name: 'Qanot orqali yorib o‘tish (Out Wide)',
                  desc: 'Qanot himoyachilari oldinga chiqadi va jarimaga kross oshiradi',
                  icon: Flame,
                  color: 'from-emerald-500 to-teal-500'
                },
                {
                  id: 'press',
                  name: 'Yuqori Pressing (All-out Press)',
                  desc: 'Raqib maydonida agressiv bosim o‘tkazib xatoga majbur qilish',
                  icon: Shield,
                  color: 'from-red-500 to-pink-500'
                }
              ].map(style => {
                const isSelected = teamPlaystyle === style.id;
                const IconComponent = style.icon;
                return (
                  <button
                    key={style.id}
                    onClick={() => {
                      sfxClick();
                      setTeamPlaystyle(style.id as PESPlaystyle);
                    }}
                    className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? 'bg-white/10 border-cyan-400 shadow-md shadow-cyan-500/10'
                        : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.06] hover:border-white/10'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${style.color} flex items-center justify-center shrink-0 shadow-sm`}
                    >
                      <IconComponent className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white truncate">{style.name}</span>
                        {isSelected && <span className="text-[10px] text-cyan-400 font-black">✓ Faol</span>}
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{style.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* BENCH (Zaxira O‘yinchilari) */}
          <div className="p-4 rounded-3xl bg-slate-900/90 border border-white/10 backdrop-blur-xl flex flex-col gap-3 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <h3 className="font-black text-sm text-white">Zaxira O‘yinchilari ({bench.length})</h3>
              </div>
              <span className="text-[10px] text-slate-400">Maydonga tushirish uchun bosing</span>
            </div>

            {bench.length === 0 ? (
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-dashed border-white/10 text-center">
                <p className="text-xs text-slate-400">Zaxirada o‘yinchi mavjud emas</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-1">
                {bench.map(player => {
                  const isSelectedBench = swapSourceBenchPlayer?.id === player.id;
                  return (
                    <div
                      key={`bench_${player.id}`}
                      className={`p-2 rounded-2xl border transition-all flex items-center justify-between gap-2 ${
                        isSelectedBench
                          ? 'bg-amber-500/20 border-amber-400 shadow-md shadow-amber-500/20'
                          : 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08]'
                      }`}
                    >
                      <div
                        onClick={() => {
                          sfxCardFlip();
                          setInspectedPlayer(player);
                        }}
                        className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
                      >
                        <PlayerAvatar avatar={player.avatar} size={34} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-white truncate">{player.name}</span>
                            <span className="text-[10px] font-black text-amber-400">{player.ovr}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400">
                            <span className="font-bold text-cyan-400">{player.role}</span>
                            <span>•</span>
                            <span className="truncate">{player.club}</span>
                            <span>{player.nation?.flag}</span>
                          </div>
                        </div>
                      </div>

                      {/* Quick Swap Button */}
                      <button
                        onClick={() => {
                          sfxClick();
                          if (isSelectedBench) {
                            setSwapSourceBenchPlayer(null);
                          } else {
                            setSwapSourceBenchPlayer(player);
                            setSwapSourceSlot(null);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1 ${
                          isSelectedBench
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30'
                        }`}
                      >
                        <ArrowRightLeft className="w-3 h-3" />
                        <span>{isSelectedBench ? 'Tanlandi' : 'Tushirish'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PLAYER INSPECTION MODAL */}
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
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Holographic FUT Card Preview with Theme Selector */}
              <FutCard
                player={inspectedPlayer}
                size="md"
                showThemeSelector={true}
                onThemeChange={handleThemeChangeForPlayer}
              />

              {/* Detailed Skills & Information */}
              <div className="w-full flex flex-col gap-2 mt-2">
                <div className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-white/[0.04]">
                  <span className="text-slate-400">O‘yin uslubi (Playstyle):</span>
                  <span className="font-black text-cyan-300">{inspectedPlayer.playStyle}</span>
                </div>
                <div className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-white/[0.04]">
                  <span className="text-slate-400">Bo‘yi / Vazni:</span>
                  <span className="font-bold text-white">
                    {inspectedPlayer.height} sm • {inspectedPlayer.weight} kg
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-white/[0.04]">
                  <span className="text-slate-400">Transfer Bahosi:</span>
                  <span className="font-black text-amber-400">
                    €{(inspectedPlayer.marketValue / 1_000_000).toFixed(1)}M
                  </span>
                </div>
              </div>

              {/* Actions: Swap or Remove */}
              <div className="w-full flex flex-col gap-2 mt-1">
                {(Object.entries(squad) as [string, Player | null][]).some(([_, p]) => p?.id === inspectedPlayer.id) ? (
                  <>
                    <button
                      onClick={() => {
                        const slotEntry = (Object.entries(squad) as [string, Player | null][]).find(
                          ([_, p]) => p?.id === inspectedPlayer.id
                        );
                        if (slotEntry) {
                          setSwapSourceSlot(slotEntry[0]);
                          setSwapSourceBenchPlayer(null);
                          setInspectedPlayer(null);
                        }
                      }}
                      className="w-full py-3 rounded-2xl font-black text-xs bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Repeat className="w-4 h-4" />
                      <span>Pozitsiyani Almashtirish (Boshqa O‘yinchi bilan)</span>
                    </button>

                    <button
                      onClick={() => {
                        const slotEntry = (Object.entries(squad) as [string, Player | null][]).find(
                          ([_, p]) => p?.id === inspectedPlayer.id
                        );
                        if (slotEntry) {
                          onRemovePlayer(slotEntry[0]);
                          setInspectedPlayer(null);
                        }
                      }}
                      className="w-full py-2.5 rounded-2xl font-bold text-xs bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 transition-colors cursor-pointer"
                    >
                      Maydondan Olish (Zaxiraga O‘tkazish)
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setSwapSourceBenchPlayer(inspectedPlayer);
                      setSwapSourceSlot(null);
                      setInspectedPlayer(null);
                    }}
                    className="w-full py-3 rounded-2xl font-black text-xs bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Repeat className="w-4 h-4" />
                    <span>Maydondagi O‘yinchi bilan Almashtirish (Tushirish)</span>
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PLAYER PICKER MODAL (Assign player to empty slot) */}
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
              className="relative max-w-xl w-full max-h-[85vh] p-6 rounded-3xl bg-slate-900 border border-white/20 shadow-2xl flex flex-col gap-4 text-white overflow-hidden"
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
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable list of available players */}
              <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2.5 pr-1 max-h-[420px]">
                {availablePlayers.map((player, idx) => (
                  <button
                    key={`pick_${player.id}_${idx}`}
                    onClick={() => handlePickPlayer(player)}
                    className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 hover:border-cyan-400/50 transition-all text-left cursor-pointer group"
                  >
                    <PlayerAvatar avatar={player.avatar} size={40} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-sm text-white group-hover:text-cyan-300 truncate">
                          {player.name}
                        </span>
                        <span className="font-black text-xs text-amber-400">{player.ovr}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span className="text-cyan-400 font-bold">{player.role}</span>
                        <span>•</span>
                        <span className="truncate">{player.club}</span>
                        <span>{player.nation?.flag}</span>
                      </div>
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
