import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Player } from '../types';
import { sfxWalkoutReveal, sfxCardFlip, sfxWhistle } from '../utils/audio';
import { speakText } from '../utils/speech';
import { Sparkles, Trophy, Star, Shield, Zap, X, Check, Award } from 'lucide-react';

interface EpicWalkoutModalProps {
  player: Player | null;
  onClose: () => void;
  onClaim?: (player: Player) => void;
}

export const EpicWalkoutModal: React.FC<EpicWalkoutModalProps> = ({ player, onClose, onClaim }) => {
  const [phase, setPhase] = useState<'intro' | 'epic_text' | 'card_reveal'>('intro');

  useEffect(() => {
    if (!player) return;

    // Trigger walkout sounds and transitions
    sfxWalkoutReveal(player?.ovr ?? 90);

    const t1 = setTimeout(() => {
      setPhase('epic_text');
    }, 400);

    const t2 = setTimeout(() => {
      setPhase('card_reveal');
      sfxWhistle();
      if (player.ovr >= 90) {
        speakText(`Epic kartasi! ${player.name}, reytingi ${player.ovr}!`);
      }
    }, 2400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [player]);

  if (!player) return null;

  const isEpicOrHigher = player.ovr >= 89;

  const handleClaim = () => {
    sfxCardFlip();
    if (onClaim) onClaim(player);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 overflow-hidden select-none"
      >
        {/* Stadium Background Atmosphere */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Cyber Stadium Lights */}
          <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-blue-600/30 via-cyan-500/10 to-transparent blur-3xl" />
          <div className="absolute bottom-0 inset-x-0 h-96 bg-gradient-to-t from-emerald-950/60 via-slate-950 to-transparent" />
          
          {/* Spotlight Beams */}
          <div className="absolute -top-32 left-1/4 w-32 h-[800px] bg-cyan-400/20 rotate-12 blur-2xl animate-pulse" />
          <div className="absolute -top-32 right-1/4 w-32 h-[800px] bg-yellow-400/20 -rotate-12 blur-2xl animate-pulse" />

          {/* eFootball Neon Pitch Ground Graphic */}
          <div className="absolute bottom-0 inset-x-0 h-48 flex justify-center opacity-30">
            <div className="w-[800px] h-[300px] border-4 border-cyan-400/40 rounded-full [transform:rotateX(75deg)] shadow-[0_0_80px_rgba(6,182,212,0.4)]" />
          </div>
        </div>

        {/* Top Controls */}
        <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 text-xs font-bold uppercase tracking-wider backdrop-blur transition-all flex items-center gap-1.5"
          >
            <span>O‘tkazib yuborish</span>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Phase 1: Massive 3D "Epic" Title (Exactly matching Konami Screenshot 1) */}
        {phase === 'epic_text' && (
          <motion.div
            initial={{ scale: 0.3, opacity: 0, rotateX: 30 }}
            animate={{ scale: 1.05, opacity: 1, rotateX: 0 }}
            exit={{ scale: 1.4, opacity: 0, filter: 'blur(10px)' }}
            transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
            className="relative z-30 flex flex-col items-center justify-center text-center px-4"
          >
            {/* Background energy blast */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 via-emerald-500/40 to-yellow-500/30 blur-3xl -z-10 rounded-full scale-150 animate-pulse" />

            {/* Glowing 3D "Epic" block text */}
            <div className="relative py-4 px-8">
              <h1
                className="text-7xl sm:text-9xl font-black tracking-tighter uppercase select-none"
                style={{
                  fontFamily: 'system-ui, sans-serif',
                  background: 'linear-gradient(180deg, #FFF6A9 0%, #F59E0B 45%, #B45309 80%, #78350F 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 0 25px rgba(245, 158, 11, 0.9)) drop-shadow(0 0 50px rgba(16, 185, 129, 0.8))',
                  letterSpacing: '2px'
                }}
              >
                EPIC
              </h1>

              {/* Sub-badge neon glow */}
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="h-0.5 w-12 bg-gradient-to-r from-transparent to-cyan-400" />
                <span className="text-xs sm:text-sm font-black text-cyan-300 tracking-[0.3em] uppercase bg-cyan-950/70 px-4 py-1 rounded-full border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.6)]">
                  eFootball™ 2026 Special
                </span>
                <span className="h-0.5 w-12 bg-gradient-to-l from-transparent to-cyan-400" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Phase 2: Card Reveal + Player Presentation (Matching Screenshot 2) */}
        {phase === 'card_reveal' && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="relative z-30 flex flex-col items-center max-w-lg w-full px-4"
          >
            {/* eFootball Yellow Branding Ribbon Top */}
            <div className="w-full mb-3 flex items-center justify-between px-3 py-1.5 rounded-lg bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 text-slate-950 font-black text-xs uppercase tracking-widest shadow-lg">
              <span className="flex items-center gap-1.5 font-extrabold">
                <Sparkles className="w-4 h-4 fill-current" />
                eFOOTBALL™ EPIC REVEAL
              </span>
              <span className="bg-slate-950 text-amber-300 px-2 py-0.5 rounded text-[10px] font-black">
                OVR {player.ovr}
              </span>
            </div>

            {/* The Authentic eFootball 2026 Epic Card Frame */}
            <div className="relative w-72 sm:w-80 rounded-2xl overflow-hidden border-2 border-amber-400/90 shadow-[0_0_50px_rgba(245,158,11,0.6)] bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-950 p-3">
              {/* Card Hologram Concentric Rings (Screenshot 2 likeness) */}
              <div className="absolute inset-0 opacity-40 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-300/30 via-emerald-500/20 to-transparent" />
              
              {/* Card Header: Rating + Position */}
              <div className="relative flex items-start justify-between z-10">
                <div className="flex flex-col">
                  <span className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-yellow-300 to-amber-500 leading-none drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                    {player.ovr}
                  </span>
                  <span className="text-sm font-black text-white bg-slate-950/80 px-2 py-0.5 rounded border border-amber-400/50 mt-1 uppercase w-max tracking-wider">
                    {player.role || player.displayRole || 'CF'}
                  </span>
                </div>

                <div className="flex flex-col items-end">
                  <div className="text-xl">{player.nation?.flag || '🌍'}</div>
                  <span className="text-[10px] font-bold text-amber-200/90 uppercase mt-0.5 max-w-[100px] truncate text-right">
                    {player.club}
                  </span>
                </div>
              </div>

              {/* Player Visual Avatar / Likeness */}
              <div className="relative my-4 flex flex-col items-center justify-center min-h-[160px]">
                {/* Podium Glow */}
                <div className="absolute inset-x-8 bottom-0 h-16 bg-gradient-to-t from-amber-400/30 via-cyan-400/20 to-transparent rounded-full blur-xl" />

                {/* Player Illustration Avatar */}
                <div className="w-28 h-28 rounded-full border-2 border-amber-400/80 p-1 bg-gradient-to-b from-slate-800 to-slate-950 shadow-2xl flex items-center justify-center relative z-10">
                  <div
                    className="w-full h-full rounded-full flex items-center justify-center font-black text-3xl text-amber-300 uppercase shadow-inner"
                    style={{
                      background: `linear-gradient(135deg, ${player.avatar?.kitPrimaryColor || '#1e3a8a'} 0%, #0f172a 100%)`
                    }}
                  >
                    {player.name.substring(0, 2)}
                  </div>
                </div>

                {/* 5-Star Epic Emblem Rating */}
                <div className="flex items-center gap-1 mt-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-300 drop-shadow" />
                  ))}
                </div>
              </div>

              {/* Player Name Banner */}
              <div className="relative z-10 text-center py-1.5 px-3 rounded-lg bg-slate-950/80 border border-amber-400/40 backdrop-blur mb-3">
                <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-wide truncate">
                  {player.name}
                </h3>
                <p className="text-[10px] font-semibold text-cyan-300 uppercase tracking-wider">
                  {player.playStyle || 'Epic Phenomenon'}
                </p>
              </div>

              {/* Statistics Grid (Clean real numbers - strictly no fake names) */}
              <div className="grid grid-cols-6 gap-1 text-center bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                <div>
                  <div className="text-[9px] font-bold text-slate-400">PAC</div>
                  <div className="text-xs font-black text-amber-300">{player.attrs?.pac ?? 80}</div>
                </div>
                <div>
                  <div className="text-[9px] font-bold text-slate-400">SHO</div>
                  <div className="text-xs font-black text-amber-300">{player.attrs?.sho ?? 80}</div>
                </div>
                <div>
                  <div className="text-[9px] font-bold text-slate-400">PAS</div>
                  <div className="text-xs font-black text-amber-300">{player.attrs?.pas ?? 80}</div>
                </div>
                <div>
                  <div className="text-[9px] font-bold text-slate-400">DRI</div>
                  <div className="text-xs font-black text-amber-300">{player.attrs?.dri ?? 80}</div>
                </div>
                <div>
                  <div className="text-[9px] font-bold text-slate-400">DEF</div>
                  <div className="text-xs font-black text-amber-300">{player.attrs?.def ?? 80}</div>
                </div>
                <div>
                  <div className="text-[9px] font-bold text-slate-400">PHY</div>
                  <div className="text-xs font-black text-amber-300">{player.attrs?.phy ?? 80}</div>
                </div>
              </div>

              {/* Card Footer: eFootball Branding */}
              <div className="mt-2 flex items-center justify-between text-[9px] text-amber-400/70 font-mono">
                <span>KONAMI / eFOOTBALL</span>
                <span>EPIC #2026</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-5 flex items-center gap-3 w-full max-w-sm">
              <button
                onClick={handleClaim}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5 stroke-[3]" />
                <span>Jamoaga Qabul Qilish</span>
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
