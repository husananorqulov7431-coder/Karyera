import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Player, CardTier, CardBackgroundTheme } from '../types';
import { PlayerAvatar } from './PlayerAvatar';
import { CardVideoBackground } from './CardVideoBackground';
import { Sparkles, Award, Palette, Zap } from 'lucide-react';

interface FutCardProps {
  player: Player;
  size?: 'sm' | 'md' | 'lg';
  isWalkout?: boolean;
  onClick?: () => void;
  className?: string;
  showThemeSelector?: boolean;
  onThemeChange?: (theme: CardBackgroundTheme) => void;
}

export const CARD_BG_THEMES: Record<
  CardBackgroundTheme,
  {
    name: string;
    bgGradient: string;
    border: string;
    glow: string;
    patternType: 'stadium' | 'stars' | 'cyber' | 'magma' | 'pitch' | 'ice' | 'royal' | 'tier';
    textColor: string;
    accentColor: string;
  }
> = {
  auto: {
    name: 'Asl Rarity Foni',
    bgGradient: '',
    border: '',
    glow: '',
    patternType: 'tier',
    textColor: 'text-white',
    accentColor: 'text-amber-300'
  },
  'gold-stadium': {
    name: 'Oltin Arena & Stadion',
    bgGradient: 'from-amber-200 via-yellow-600 via-70% to-stone-950',
    border: 'border-yellow-300/80 shadow-[0_0_35px_rgba(234,179,8,0.6)]',
    glow: 'rgba(234,179,8,0.5)',
    patternType: 'stadium',
    textColor: 'text-amber-100',
    accentColor: 'text-yellow-200'
  },
  'champions-galaxy': {
    name: 'Chempionlar Galaktikasi',
    bgGradient: 'from-blue-500 via-indigo-900 to-slate-950',
    border: 'border-cyan-300/80 shadow-[0_0_35px_rgba(59,130,246,0.6)]',
    glow: 'rgba(59,130,246,0.5)',
    patternType: 'stars',
    textColor: 'text-cyan-100',
    accentColor: 'text-cyan-300'
  },
  'neon-cyber': {
    name: 'Kiber Neon & Matritsa',
    bgGradient: 'from-fuchsia-500 via-purple-900 to-slate-950',
    border: 'border-fuchsia-400/90 shadow-[0_0_35px_rgba(217,70,239,0.6)]',
    glow: 'rgba(217,70,239,0.5)',
    patternType: 'cyber',
    textColor: 'text-fuchsia-100',
    accentColor: 'text-fuchsia-300'
  },
  'magma-fire': {
    name: 'Olovli Magma & Lava',
    bgGradient: 'from-amber-500 via-red-700 to-stone-950',
    border: 'border-red-400/80 shadow-[0_0_35px_rgba(239,68,68,0.6)]',
    glow: 'rgba(239,68,68,0.5)',
    patternType: 'magma',
    textColor: 'text-red-100',
    accentColor: 'text-amber-300'
  },
  'emerald-pitch': {
    name: 'Zumrad Maydon & Chim',
    bgGradient: 'from-emerald-400 via-teal-800 to-slate-950',
    border: 'border-emerald-300/80 shadow-[0_0_35px_rgba(16,185,129,0.6)]',
    glow: 'rgba(16,185,129,0.5)',
    patternType: 'pitch',
    textColor: 'text-emerald-100',
    accentColor: 'text-emerald-300'
  },
  'ice-diamond': {
    name: 'Muzli Olmos & Kristall',
    bgGradient: 'from-sky-200 via-cyan-700 to-slate-950',
    border: 'border-sky-200/90 shadow-[0_0_35px_rgba(56,189,248,0.6)]',
    glow: 'rgba(56,189,248,0.5)',
    patternType: 'ice',
    textColor: 'text-sky-100',
    accentColor: 'text-sky-200'
  },
  'royal-purple': {
    name: 'Qirollik Amethyst',
    bgGradient: 'from-purple-300 via-indigo-950 to-stone-950',
    border: 'border-purple-300/80 shadow-[0_0_35px_rgba(168,85,247,0.6)]',
    glow: 'rgba(168,85,247,0.5)',
    patternType: 'royal',
    textColor: 'text-purple-100',
    accentColor: 'text-amber-300'
  }
};

const TIER_STYLES: Record<CardTier, {
  bgGradient: string;
  border: string;
  glow: string;
  badgeBg: string;
  textColor: string;
  title: string;
}> = {
  goat: {
    bgGradient: 'from-amber-300 via-amber-600 to-stone-950',
    border: 'border-yellow-200/90 shadow-[0_0_35px_rgba(250,204,21,0.65)]',
    glow: 'rgba(234,179,8,0.5)',
    badgeBg: 'bg-gradient-to-r from-amber-400 to-yellow-600 text-stone-950',
    textColor: 'text-amber-100',
    title: 'GOAT AFSONA'
  },
  toty: {
    bgGradient: 'from-cyan-400 via-blue-700 to-slate-950',
    border: 'border-cyan-300/80 shadow-[0_0_35px_rgba(6,182,212,0.65)]',
    glow: 'rgba(6,182,212,0.5)',
    badgeBg: 'bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950',
    textColor: 'text-cyan-100',
    title: 'TOTY ELITA'
  },
  legend: {
    bgGradient: 'from-purple-400 via-indigo-800 to-slate-950',
    border: 'border-purple-300/80 shadow-[0_0_35px_rgba(168,85,247,0.65)]',
    glow: 'rgba(168,85,247,0.5)',
    badgeBg: 'bg-gradient-to-r from-purple-400 to-indigo-600 text-slate-950',
    textColor: 'text-purple-100',
    title: 'ICON AFSONASI'
  },
  gold: {
    bgGradient: 'from-amber-200 via-yellow-700 to-amber-950',
    border: 'border-amber-300/60 shadow-[0_0_25px_rgba(245,158,11,0.45)]',
    glow: 'rgba(245,158,11,0.4)',
    badgeBg: 'bg-gradient-to-r from-amber-300 to-yellow-600 text-stone-900',
    textColor: 'text-amber-100',
    title: 'OLTIN YULDUZ'
  },
  emerald: {
    bgGradient: 'from-emerald-300 via-teal-700 to-slate-950',
    border: 'border-emerald-300/70 shadow-[0_0_30px_rgba(16,185,129,0.5)]',
    glow: 'rgba(16,185,129,0.4)',
    badgeBg: 'bg-gradient-to-r from-emerald-300 to-teal-600 text-slate-950',
    textColor: 'text-emerald-100',
    title: 'KELAJAK YULDUZI'
  },
  silver: {
    bgGradient: 'from-slate-300 via-slate-600 to-slate-900',
    border: 'border-slate-300/50 shadow-[0_0_20px_rgba(148,163,184,0.3)]',
    glow: 'rgba(148,163,184,0.25)',
    badgeBg: 'bg-gradient-to-r from-slate-200 to-slate-400 text-slate-900',
    textColor: 'text-slate-100',
    title: 'PROFESSIONAL'
  }
};

export const FutCard: React.FC<FutCardProps> = ({
  player,
  size = 'md',
  isWalkout = false,
  onClick,
  className = '',
  showThemeSelector = false,
  onThemeChange
}) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [themePickerOpen, setThemePickerOpen] = useState(false);

  const currentThemeKey: CardBackgroundTheme = player.cardBackgroundTheme || 'auto';
  const customTheme = CARD_BG_THEMES[currentThemeKey] || CARD_BG_THEMES.auto;
  const tier = TIER_STYLES[player.cardTier] || TIER_STYLES.gold;

  const activeGradient = currentThemeKey === 'auto' ? tier.bgGradient : customTheme.bgGradient;
  const activeBorder = currentThemeKey === 'auto' ? tier.border : customTheme.border;
  const activePattern = currentThemeKey === 'auto' ? 'tier' : customTheme.patternType;

  const isGK = player.role === 'GK';

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: x * 20, y: -y * 20 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  // Dimensions
  const dim = size === 'sm'
    ? 'w-[140px] h-[210px] text-[9px]'
    : size === 'lg'
    ? 'w-[320px] h-[480px] text-sm'
    : 'w-[250px] h-[375px] text-xs';

  const avatarSize = size === 'sm' ? 64 : size === 'lg' ? 140 : 110;

  return (
    <div className="relative inline-block">
      <motion.div
        className={`relative select-none cursor-pointer perspective-[1000px] ${dim} ${className}`}
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        animate={{
          rotateY: tilt.x,
          rotateX: tilt.y,
          scale: isHovered ? 1.03 : 1
        }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      >
        {/* Outer Card Container */}
        <div
          className={`relative w-full h-full rounded-2xl p-3 flex flex-col justify-between overflow-hidden border-2 bg-gradient-to-b ${activeGradient} ${activeBorder} backdrop-blur-md`}
        >
          {/* Detailed Background Texture & Geometric Patterns */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-35">
            {activePattern === 'stadium' && (
              <svg className="w-full h-full" viewBox="0 0 200 300" fill="none">
                <circle cx="100" cy="150" r="80" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
                <circle cx="100" cy="150" r="130" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                <path d="M0 0 L200 300 M200 0 L0 300" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
                <path d="M100 0 L100 300 M0 150 L200 150" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4 4" />
              </svg>
            )}
            {activePattern === 'stars' && (
              <svg className="w-full h-full" viewBox="0 0 200 300" fill="none">
                <polygon points="100,10 115,50 160,50 125,75 140,115 100,90 60,115 75,75 40,50 85,50" fill="rgba(255,255,255,0.12)" />
                <circle cx="40" cy="80" r="2" fill="white" />
                <circle cx="160" cy="70" r="3" fill="white" />
                <circle cx="130" cy="220" r="2.5" fill="white" />
                <circle cx="50" cy="230" r="2" fill="white" />
                <line x1="40" y1="80" x2="160" y2="70" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
              </svg>
            )}
            {activePattern === 'cyber' && (
              <svg className="w-full h-full" viewBox="0 0 200 300" fill="none">
                <path d="M 0 50 H 200 M 0 100 H 200 M 0 150 H 200 M 0 200 H 200 M 0 250 H 200" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                <path d="M 50 0 V 300 M 100 0 V 300 M 150 0 V 300" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                <circle cx="100" cy="150" r="40" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeDasharray="6 3" />
              </svg>
            )}
            {activePattern === 'magma' && (
              <svg className="w-full h-full" viewBox="0 0 200 300" fill="none">
                <path d="M 20 0 Q 70 80 40 160 T 110 300" stroke="rgba(255,200,50,0.3)" strokeWidth="2.5" />
                <path d="M 180 0 Q 130 90 160 170 T 90 300" stroke="rgba(255,100,50,0.3)" strokeWidth="2.5" />
                <circle cx="70" cy="120" r="20" fill="rgba(255,80,0,0.15)" />
                <circle cx="140" cy="180" r="25" fill="rgba(255,150,0,0.15)" />
              </svg>
            )}
            {activePattern === 'pitch' && (
              <svg className="w-full h-full" viewBox="0 0 200 300" fill="none">
                <rect x="20" y="20" width="160" height="260" rx="8" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
                <line x1="20" y1="150" x2="180" y2="150" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
                <circle cx="100" cy="150" r="35" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
              </svg>
            )}
            {activePattern === 'ice' && (
              <svg className="w-full h-full" viewBox="0 0 200 300" fill="none">
                <polygon points="100,20 180,90 150,220 50,220 20,90" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
                <polygon points="100,60 150,110 130,190 70,190 50,110" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
              </svg>
            )}
            {activePattern === 'royal' && (
              <svg className="w-full h-full" viewBox="0 0 200 300" fill="none">
                <path d="M 50 40 L 75 25 L 100 45 L 125 25 L 150 40 L 140 70 L 60 70 Z" fill="rgba(250,204,21,0.2)" stroke="rgba(250,204,21,0.4)" strokeWidth="1" />
                <circle cx="100" cy="170" r="50" stroke="rgba(250,204,21,0.2)" strokeWidth="1.5" />
              </svg>
            )}
            {activePattern === 'tier' && (
              <div
                className="w-full h-full"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(45deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 2px, transparent 2px, transparent 16px)'
                }}
              />
            )}
          </div>

          {/* Video Background for Epic cards and Custom Video Themes */}
          {(player.cardBackgroundVideo || player.ovr >= 89 || player.cardTier === 'goat' || player.cardTier === 'legend') && (
            <CardVideoBackground
              videoType={player.cardBackgroundVideo || 'epic-gold'}
              isEpic={player.ovr >= 89}
              opacity={player.videoOpacity ?? 0.65}
            />
          )}

          {/* Prismatic Holo Foil Reflection */}
          <div
            className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay transition-opacity duration-300"
            style={{
              background: isHovered
                ? `radial-gradient(circle at ${50 + tilt.x * 2}% ${50 - tilt.y * 2}%, rgba(255,255,255,0.7) 0%, transparent 65%)`
                : 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%, rgba(255,255,255,0.2) 100%)'
            }}
          />

          {/* Card Header: Rating, Position, Flag, Club */}
          <div className="relative z-20 flex justify-between items-start">
            <div className="flex flex-col items-center leading-none">
              <span
                className={`font-black tracking-tight ${
                  size === 'sm' ? 'text-2xl' : size === 'lg' ? 'text-5xl' : 'text-4xl'
                } text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]`}
              >
                {player.ovr}
              </span>
              <span
                className={`font-black mt-0.5 tracking-wider ${
                  size === 'sm' ? 'text-[10px]' : size === 'lg' ? 'text-base' : 'text-xs'
                } text-cyan-300 drop-shadow`}
              >
                {player.role}
              </span>
              <div className="w-5 h-[1px] bg-white/40 my-1" />
              <span className={`${size === 'sm' ? 'text-base' : 'text-xl'} filter drop-shadow`}>
                {player.nation.flag}
              </span>
            </div>

            {/* Rarity Emblem / Walkout Star & Booster */}
            <div className="flex flex-col items-end gap-1">
              <span
                className={`inline-flex items-center gap-1 font-black px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider ${tier.badgeBg} shadow-md`}
              >
                <Award className="w-3 h-3" />
                {tier.title}
              </span>
              {player.boosterSkill && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-400/90 text-slate-950 font-black text-[8px] uppercase tracking-tight shadow-sm">
                  <Zap className="w-2.5 h-2.5 fill-slate-950" />
                  <span>{player.boosterSkill}</span>
                </span>
              )}
              <div className="flex items-center gap-1 text-[10px] font-bold text-white/80 truncate max-w-[100px] text-right">
                {player.customBadgeUrl ? (
                  <img
                    src={player.customBadgeUrl}
                    alt="Club"
                    referrerPolicy="no-referrer"
                    className="w-3.5 h-3.5 object-contain inline-block drop-shadow"
                  />
                ) : null}
                <span className="truncate">{player.club}</span>
              </div>
            </div>
          </div>

          {/* Center / Full Body Player Visual */}
          {player.customPhotoUrl ? (
            player.renderMode === 'circle' ? (
              <div className="relative z-10 flex justify-center items-center my-auto -mt-2 overflow-hidden rounded-full">
                <div
                  className="rounded-full overflow-hidden border-2 border-amber-300/70 shadow-xl flex items-center justify-center bg-black/30"
                  style={{ width: avatarSize, height: avatarSize }}
                >
                  <img
                    src={player.customPhotoUrl}
                    alt={player.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-200"
                    style={{
                      transform: `scale(${player.photoScale ?? 1}) translate(${player.photoOffsetX ?? 0}px, ${player.photoOffsetY ?? 0}px)`
                    }}
                  />
                </div>
              </div>
            ) : (
              /* BUTUN KARTA BO'YLAB (Full-body Cutout / Big Time Render) */
              <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center overflow-hidden">
                <img
                  src={player.customPhotoUrl}
                  alt={player.name}
                  referrerPolicy="no-referrer"
                  className="max-h-[90%] max-w-[95%] object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.85)] filter transition-transform duration-200"
                  style={{
                    transform: `scale(${player.photoScale ?? 1}) translate(${player.photoOffsetX ?? 0}px, ${player.photoOffsetY ?? 0}px)`,
                    maskImage: 'linear-gradient(to bottom, black 65%, rgba(0,0,0,0.7) 85%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, black 65%, rgba(0,0,0,0.7) 85%, transparent 100%)'
                  }}
                />
              </div>
            )
          ) : (
            <div className="relative z-10 flex justify-center items-center my-auto -mt-2 overflow-hidden rounded-full">
              <PlayerAvatar avatar={player.avatar} size={avatarSize} />
            </div>
          )}

          {/* Player Name Banner */}
          <div className="relative z-20 text-center mt-auto">
            <h3
              className={`font-black uppercase tracking-wider text-white truncate drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] ${
                size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-lg' : 'text-sm'
              }`}
            >
              {player.name}
            </h3>
            <div className="flex items-center justify-center gap-1 text-[10px] text-white/80 font-bold -mt-0.5">
              <span>{player.club}</span>
              <span>•</span>
              <span className="text-cyan-300">{player.playStyle}</span>
            </div>
          </div>

          {/* Bottom Stats Grid */}
          <div className="relative z-20 mt-1 pt-1.5 border-t border-white/25">
            {isGK ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-center font-bold text-white drop-shadow">
                <div className="flex justify-between">
                  <span className="text-white/70">DIV</span>
                  <span>{player.attrs.div ?? Math.round(player.ovr * 0.98)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">REF</span>
                  <span>{player.attrs.ref ?? Math.round(player.ovr * 1.01)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">HAN</span>
                  <span>{player.attrs.han ?? Math.round(player.ovr * 0.96)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">SPD</span>
                  <span>{player.attrs.spd ?? Math.round(player.ovr * 0.6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">KIC</span>
                  <span>{player.attrs.kic ?? Math.round(player.ovr * 0.82)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">POS</span>
                  <span>{player.attrs.pos ?? Math.round(player.ovr * 0.98)}</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-center font-bold text-white drop-shadow">
                <div className="flex justify-between">
                  <span className="text-white/70">PAC</span>
                  <span>{player.attrs.pac}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">DRI</span>
                  <span>{player.attrs.dri}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">SHO</span>
                  <span>{player.attrs.sho}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">DEF</span>
                  <span>{player.attrs.def}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">PAS</span>
                  <span>{player.attrs.pas}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">PHY</span>
                  <span>{player.attrs.phy}</span>
                </div>
              </div>
            )}
          </div>

          {/* Walkout particle badge */}
          {isWalkout && (
            <div className="absolute top-2 right-2 text-amber-300 animate-pulse">
              <Sparkles className="w-5 h-5" />
            </div>
          )}
        </div>
      </motion.div>

      {/* Background Theme Selector dropdown/modal if enabled */}
      {showThemeSelector && onThemeChange && (
        <div className="mt-2 flex flex-col items-center gap-1.5 w-full">
          <button
            onClick={e => {
              e.stopPropagation();
              setThemePickerOpen(!themePickerOpen);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 text-xs font-bold text-cyan-300 transition-all cursor-pointer"
          >
            <Palette className="w-3.5 h-3.5 text-cyan-400" />
            <span>Karta Fonini O‘zgartirish / Yaxshilash</span>
          </button>

          {themePickerOpen && (
            <div
              className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-2.5 rounded-2xl bg-slate-900 border border-white/20 shadow-2xl z-50 flex flex-col gap-1.5 text-xs text-white"
              onClick={e => e.stopPropagation()}
            >
              <span className="font-black text-slate-300 text-[11px] px-1 uppercase tracking-wider">
                Fon Uslubini Tanlang:
              </span>
              <div className="max-h-48 overflow-y-auto flex flex-col gap-1 pr-1">
                {(Object.entries(CARD_BG_THEMES) as [CardBackgroundTheme, typeof customTheme][]).map(
                  ([key, th]) => (
                    <button
                      key={key}
                      onClick={() => {
                        onThemeChange(key);
                        setThemePickerOpen(false);
                      }}
                      className={`flex items-center justify-between p-2 rounded-xl border text-left transition-all cursor-pointer ${
                        currentThemeKey === key
                          ? 'bg-cyan-500/20 border-cyan-400 text-white font-black'
                          : 'bg-white/[0.04] hover:bg-white/[0.1] border-white/5 text-slate-300'
                      }`}
                    >
                      <span className="truncate">{th.name}</span>
                      {currentThemeKey === key && <span className="text-cyan-400 text-xs">✓</span>}
                    </button>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
