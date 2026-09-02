import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Player, CardTier } from '../types';
import { PlayerAvatar } from './PlayerAvatar';
import { Shield, Sparkles, Award } from 'lucide-react';

interface FutCardProps {
  player: Player;
  size?: 'sm' | 'md' | 'lg';
  isWalkout?: boolean;
  onClick?: () => void;
  className?: string;
}

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
  className = ''
}) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const tier = TIER_STYLES[player.cardTier] || TIER_STYLES.gold;
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
        className={`relative w-full h-full rounded-2xl p-3 flex flex-col justify-between overflow-hidden border-2 bg-gradient-to-b ${tier.bgGradient} ${tier.border} backdrop-blur-md`}
      >
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
        <div className="relative z-10 flex justify-between items-start">
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

          {/* Rarity Emblem / Walkout Star */}
          <div className="flex flex-col items-end">
            <span
              className={`inline-flex items-center gap-1 font-black px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider ${tier.badgeBg} shadow-md`}
            >
              <Award className="w-3 h-3" />
              {tier.title}
            </span>
            <span className="text-[10px] font-bold text-white/80 mt-1 truncate max-w-[90px] text-right">
              {player.club}
            </span>
          </div>
        </div>

        {/* Center: Stylized Likeness Avatar */}
        <div className="relative z-10 flex justify-center items-center my-auto -mt-2">
          <PlayerAvatar avatar={player.avatar} size={avatarSize} />
        </div>

        {/* Player Name Banner */}
        <div className="relative z-10 text-center">
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
        <div className="relative z-10 mt-1 pt-1.5 border-t border-white/25">
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
  );
};
