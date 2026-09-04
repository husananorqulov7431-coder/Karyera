import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Player } from '../types';
import { CardVideoBackground } from './CardVideoBackground';
import { sfxWalkoutReveal, sfxCardFlip, sfxWhistle, sfxApplause } from '../utils/audio';
import { speakText } from '../utils/speech';
import {
  Sparkles,
  Star,
  Users,
  Check,
  X,
  Award,
  Flame,
  Zap,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface PackOpeningCutsceneProps {
  pulledPlayers: Player[];
  existingSquad: Player[];
  packName: string;
  onClose: () => void;
}

export const PackOpeningCutscene: React.FC<PackOpeningCutsceneProps> = ({
  pulledPlayers = [],
  existingSquad = [],
  packName,
  onClose
}) => {
  // Find the primary featured walkout player (highest rated, or first Epic)
  const featuredPlayer: Player =
    pulledPlayers.find((p) => p.ovr >= 89) ||
    [...pulledPlayers].sort((a, b) => b.ovr - a.ovr)[0] ||
    pulledPlayers[0];

  const isEpic = (featuredPlayer?.ovr ?? 0) >= 89;
  const isHighlight = (featuredPlayer?.ovr ?? 0) >= 84 && !isEpic;

  // Stages:
  // 1. 'suspense' (Card spinning in 3D space with portal rays)
  // 2. 'epic_banner' (If epic, KONAMI gold banner) or 'walkout' (Player lifts card up high)
  // 3. 'welcome_team' (Teammates rush in to embrace and welcome new signing)
  // 4. 'summary' (If 10-pack or user wants to see all cards)
  const [phase, setPhase] = useState<'suspense' | 'epic_banner' | 'card_lift' | 'welcome_team' | 'summary'>(
    'suspense'
  );

  // Random 3 welcoming teammates from existing squad
  const welcomingTeammates = existingSquad.slice(0, 3);

  useEffect(() => {
    if (!featuredPlayer) return;

    // Start with suspense sound
    sfxCardFlip();

    const t1 = setTimeout(() => {
      if (isEpic) {
        setPhase('epic_banner');
        sfxWalkoutReveal(featuredPlayer.ovr);
      } else {
        setPhase('card_lift');
        sfxWalkoutReveal(featuredPlayer.ovr);
      }
    }, 1200);

    const t2 = setTimeout(() => {
      setPhase('card_lift');
      sfxWhistle();
      speakText(`${featuredPlayer.name}! Reytingi ${featuredPlayer.ovr}.`);
    }, isEpic ? 3200 : 1200);

    const t3 = setTimeout(() => {
      setPhase('welcome_team');
      sfxApplause();
      speakText(`Jamoadoshlar ${featuredPlayer.name}ni klubga xush kelibsiz deb kutib olmoqda!`);
    }, isEpic ? 6500 : 4500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [featuredPlayer, isEpic]);

  const handleSkipOrNext = () => {
    if (phase !== 'summary' && pulledPlayers.length > 1) {
      setPhase('summary');
    } else {
      onClose();
    }
  };

  if (!featuredPlayer) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 overflow-hidden select-none">
        {/* Full 3D Stadium Atmosphere Background */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Animated Video Background for Epic Walkout */}
          {isEpic && (
            <CardVideoBackground
              videoType={featuredPlayer.cardBackgroundVideo || 'epic-gold'}
              isEpic={true}
              className="opacity-75"
            />
          )}

          {/* Cyber Lighting & Sky Glow */}
          <div
            className={`absolute top-0 inset-x-0 h-full opacity-60 transition-colors duration-1000 ${
              isEpic
                ? 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/30 via-emerald-950/40 to-slate-950'
                : isHighlight
                ? 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/30 via-blue-950/40 to-slate-950'
                : 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-700/30 via-slate-900/50 to-slate-950'
            }`}
          />

          {/* Animated 3D Stadium Lights & Beams */}
          <div className="absolute -top-40 left-1/4 w-48 h-[1000px] bg-gradient-to-b from-cyan-400/25 via-cyan-400/5 to-transparent rotate-12 blur-3xl animate-pulse" />
          <div className="absolute -top-40 right-1/4 w-48 h-[1000px] bg-gradient-to-b from-amber-400/25 via-amber-400/5 to-transparent -rotate-12 blur-3xl animate-pulse" />

          {/* Stadium Pitch Floor with 3D Grid */}
          <div className="absolute bottom-0 inset-x-0 h-64 [perspective:800px] flex justify-center opacity-40">
            <div className="w-[1200px] h-[400px] border-4 border-cyan-500/30 rounded-full [transform:rotateX(75deg)] bg-gradient-to-t from-emerald-900/40 to-transparent shadow-[0_0_100px_rgba(6,182,212,0.4)]" />
          </div>
        </div>

        {/* Top Floating Controls */}
        <div className="absolute top-5 inset-x-5 z-50 flex items-center justify-between">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-700 text-xs text-slate-300 backdrop-blur">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-white">{packName}</span>
            <span className="text-slate-500">•</span>
            <span className="text-cyan-300">{pulledPlayers.length} ta o‘yinchi</span>
          </div>

          <div className="flex items-center gap-2">
            {pulledPlayers.length > 1 && phase !== 'summary' && (
              <button
                onClick={() => setPhase('summary')}
                className="px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                Barchasini Ko‘rish (Summary)
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================= PHASE 1: SUSPENSE (CARD 3D SPINNING) ================= */}
        {phase === 'suspense' && (
          <motion.div
            initial={{ scale: 0.5, rotateY: 180, opacity: 0 }}
            animate={{ scale: 1, rotateY: 360, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
            className="relative z-30 flex flex-col items-center [perspective:1000px]"
          >
            <div className="w-64 h-96 rounded-3xl p-1 bg-gradient-to-tr from-amber-400 via-cyan-400 to-emerald-400 shadow-[0_0_80px_rgba(245,158,11,0.5)] animate-pulse flex items-center justify-center">
              <div className="w-full h-full rounded-[22px] bg-slate-950 flex flex-col items-center justify-center p-6 text-center border border-slate-800">
                <Sparkles className="w-16 h-16 text-amber-400 animate-spin mb-4" />
                <h3 className="text-2xl font-black text-white tracking-widest uppercase">
                  eFOOTBALL™
                </h3>
                <p className="text-xs text-cyan-300 font-mono mt-2 tracking-widest">
                  OCHILMOQDA...
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ================= PHASE 1.5: KONAMI EPIC TEXT BLAST ================= */}
        {phase === 'epic_banner' && (
          <motion.div
            initial={{ scale: 0.2, opacity: 0, rotateX: 45 }}
            animate={{ scale: 1.1, opacity: 1, rotateX: 0 }}
            exit={{ scale: 1.6, opacity: 0, filter: 'blur(15px)' }}
            transition={{ duration: 0.7, type: 'spring', bounce: 0.3 }}
            className="relative z-30 flex flex-col items-center text-center px-4"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/40 via-yellow-400/50 to-emerald-500/40 blur-3xl -z-10 rounded-full scale-150 animate-pulse" />
            <h1
              className="text-8xl sm:text-9xl font-black tracking-tighter uppercase select-none"
              style={{
                fontFamily: 'system-ui, sans-serif',
                background: 'linear-gradient(180deg, #FFF9C4 0%, #F59E0B 45%, #B45309 85%, #78350F 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 35px rgba(245, 158, 11, 0.95)) drop-shadow(0 0 60px rgba(16, 185, 129, 0.8))'
              }}
            >
              EPIC
            </h1>
            <div className="mt-3 px-6 py-1.5 rounded-full bg-slate-950/80 border border-amber-400/60 text-amber-300 font-mono text-xs sm:text-sm font-black uppercase tracking-[0.3em] shadow-lg shadow-amber-400/30">
              eFootball™ 2026 AFSONA
            </div>
          </motion.div>
        )}

        {/* ================= PHASE 2: PLAYER LIFTS CARD IN 3D ================= */}
        {phase === 'card_lift' && (
          <motion.div
            initial={{ scale: 0.7, opacity: 0, y: 60 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ duration: 0.6, type: 'spring', bounce: 0.3 }}
            className="relative z-30 flex flex-col items-center max-w-md w-full px-4"
          >
            {/* Action Banner: Player Holding Card High */}
            <div className="mb-2 text-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-slate-900 border border-slate-700 text-slate-300 shadow">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Futbolchi o‘z kartasini ko‘tarib chiqmoqda</span>
              </span>
            </div>

            {/* 3D Holographic Player Card Frame */}
            <div
              className={`relative w-72 sm:w-80 rounded-3xl overflow-hidden p-3.5 shadow-2xl transition-all [transform:rotateX(4deg)] ${
                isEpic
                  ? 'border-2 border-amber-400/90 shadow-[0_0_60px_rgba(245,158,11,0.6)] bg-gradient-to-b from-slate-900 via-amber-950/50 to-slate-950'
                  : isHighlight
                  ? 'border-2 border-cyan-400/80 shadow-[0_0_45px_rgba(6,182,212,0.5)] bg-gradient-to-b from-slate-900 via-blue-950 to-slate-950'
                  : 'border border-slate-700 shadow-[0_0_30px_rgba(100,116,139,0.3)] bg-gradient-to-b from-slate-900 to-slate-950'
              }`}
            >
              {/* Card Hologram Glow & Video Background */}
              <CardVideoBackground
                videoType={featuredPlayer.cardBackgroundVideo || 'epic-gold'}
                isEpic={isEpic}
                className="opacity-60"
              />
              <div className="absolute inset-0 opacity-40 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-300/20 via-transparent to-transparent" />

              {/* Card Header: Rating, Position, Flag, Club */}
              <div className="relative flex items-start justify-between z-10">
                <div className="flex flex-col">
                  <span
                    className={`text-4xl sm:text-5xl font-black leading-none drop-shadow-md ${
                      isEpic
                        ? 'text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-amber-500'
                        : isHighlight
                        ? 'text-cyan-300'
                        : 'text-white'
                    }`}
                  >
                    {featuredPlayer.ovr}
                  </span>
                  <span className="text-xs font-black text-white bg-slate-950/80 px-2 py-0.5 rounded border border-slate-700 mt-1 uppercase w-max tracking-wider">
                    {featuredPlayer.role || 'CF'}
                  </span>
                </div>

                <div className="flex flex-col items-end">
                  <div className="text-2xl">{featuredPlayer.nation?.flag || '🌍'}</div>
                  <span className="text-[10px] font-bold text-slate-300 uppercase mt-1 max-w-[110px] truncate text-right">
                    {featuredPlayer.club}
                  </span>
                </div>
              </div>

              {/* Player Avatar & Likeness Stage */}
              <div className="relative my-4 flex flex-col items-center justify-center min-h-[140px]">
                <div className="w-24 h-24 rounded-2xl border-2 border-amber-400/60 p-1 bg-gradient-to-b from-slate-800 to-slate-950 shadow-2xl flex items-center justify-center relative z-10">
                  <div
                    className="w-full h-full rounded-xl flex items-center justify-center font-black text-2xl text-amber-300 uppercase shadow-inner"
                    style={{
                      background: `linear-gradient(135deg, ${
                        featuredPlayer.avatar?.kitPrimaryColor || '#1e3a8a'
                      } 0%, #0f172a 100%)`
                    }}
                  >
                    {featuredPlayer.name.substring(0, 2)}
                  </div>
                </div>

                {/* Stars */}
                <div className="flex items-center gap-1 mt-2.5">
                  {[...Array(isEpic ? 5 : isHighlight ? 4 : 3)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-300" />
                  ))}
                </div>
              </div>

              {/* Player Name Banner */}
              <div className="relative z-10 text-center py-2 px-3 rounded-xl bg-slate-950/90 border border-slate-800 mb-2">
                <h3 className="text-lg font-black text-white uppercase tracking-wide truncate">
                  {featuredPlayer.name}
                </h3>
                <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                  {featuredPlayer.playStyle || (isEpic ? 'Epic Phenomenon' : 'Texnik hujumchi')}
                </p>
              </div>

              {/* Attributes Grid */}
              <div className="grid grid-cols-6 gap-1 text-center bg-slate-950/70 p-2 rounded-xl border border-slate-800 text-[9px] font-mono">
                <div>
                  <div className="text-slate-400">PAC</div>
                  <div className="font-black text-amber-300">{featuredPlayer.attrs?.pac ?? 75}</div>
                </div>
                <div>
                  <div className="text-slate-400">SHO</div>
                  <div className="font-black text-amber-300">{featuredPlayer.attrs?.sho ?? 75}</div>
                </div>
                <div>
                  <div className="text-slate-400">PAS</div>
                  <div className="font-black text-amber-300">{featuredPlayer.attrs?.pas ?? 75}</div>
                </div>
                <div>
                  <div className="text-slate-400">DRI</div>
                  <div className="font-black text-amber-300">{featuredPlayer.attrs?.dri ?? 75}</div>
                </div>
                <div>
                  <div className="text-slate-400">DEF</div>
                  <div className="font-black text-amber-300">{featuredPlayer.attrs?.def ?? 75}</div>
                </div>
                <div>
                  <div className="text-slate-400">PHY</div>
                  <div className="font-black text-amber-300">{featuredPlayer.attrs?.phy ?? 75}</div>
                </div>
              </div>
            </div>

            {/* Next Action: Go to Team Welcome scene */}
            <button
              onClick={() => {
                setPhase('welcome_team');
                sfxApplause();
              }}
              className="mt-4 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <span>Jamoadoshlar bilan kutib olish</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* ================= PHASE 3: TEAM WELCOME & CELEBRATION SCENE ================= */}
        {phase === 'welcome_team' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-30 flex flex-col items-center max-w-2xl w-full px-4 text-center"
          >
            {/* Header Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-xs font-black uppercase tracking-widest mb-3 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
              <Users className="w-4 h-4" />
              <span>JAMOA A’ZOLARI KUTIB OLMOQDA!</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
              {featuredPlayer.name} Jamoamizga Xush Kelibsiz!
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg mt-1 mb-6">
              Muxlislar olqishi va jamoadoshlar tabrigi ostida yangi futbolchi klub libosini qabul qilib oldi.
            </p>

            {/* The Pitch Celebration Lineup (New Player in Center, Teammates Congratulating) */}
            <div className="relative w-full p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur flex items-center justify-center gap-4 sm:gap-6 overflow-hidden">
              {/* Stadium Crowd Flash FX */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent pointer-events-none" />

              {/* Left Teammate (e.g. Captain / Defender) */}
              {welcomingTeammates[0] && (
                <motion.div
                  initial={{ x: -60, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-col items-center text-center opacity-85"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-800 border-2 border-cyan-400/60 flex items-center justify-center text-white font-black text-xl shadow-lg">
                    {welcomingTeammates[0].name.substring(0, 2)}
                  </div>
                  <span className="text-[11px] font-bold text-slate-300 mt-2 truncate max-w-[90px]">
                    {welcomingTeammates[0].name}
                  </span>
                  <span className="text-[9px] text-cyan-400 font-mono">
                    {welcomingTeammates[0].role} • {welcomingTeammates[0].ovr}
                  </span>
                  <span className="text-[9px] text-emerald-400 font-bold mt-0.5">👏 Qarsak</span>
                </motion.div>
              )}

              {/* CENTER: THE NEW STAR SIGNING (HERO CELEBRATION) */}
              <motion.div
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1.08, y: 0 }}
                transition={{ type: 'spring', bounce: 0.4 }}
                className="relative z-10 flex flex-col items-center text-center p-3 rounded-2xl bg-slate-950/80 border-2 border-amber-400/80 shadow-[0_0_35px_rgba(245,158,11,0.4)]"
              >
                <div className="absolute -top-3 px-3 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black uppercase tracking-wider">
                  Yangi Qo‘shilgan
                </div>
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 p-0.5 shadow-xl">
                  <div className="w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center text-amber-300 font-black text-2xl">
                    {featuredPlayer.name.substring(0, 2)}
                  </div>
                </div>
                <span className="text-xs sm:text-sm font-black text-white mt-2 truncate max-w-[120px]">
                  {featuredPlayer.name}
                </span>
                <span className="text-[10px] font-mono text-amber-300 font-black">
                  OVR {featuredPlayer.ovr} • {featuredPlayer.role}
                </span>
                <span className="text-[9px] font-bold text-cyan-300 mt-0.5">
                  ⭐ 100% Stamina & Form
                </span>
              </motion.div>

              {/* Right Teammate (e.g. Midfielder / Striker) */}
              {welcomingTeammates[1] && (
                <motion.div
                  initial={{ x: 60, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-col items-center text-center opacity-85"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-800 border-2 border-cyan-400/60 flex items-center justify-center text-white font-black text-xl shadow-lg">
                    {welcomingTeammates[1].name.substring(0, 2)}
                  </div>
                  <span className="text-[11px] font-bold text-slate-300 mt-2 truncate max-w-[90px]">
                    {welcomingTeammates[1].name}
                  </span>
                  <span className="text-[9px] text-cyan-400 font-mono">
                    {welcomingTeammates[1].role} • {welcomingTeammates[1].ovr}
                  </span>
                  <span className="text-[9px] text-emerald-400 font-bold mt-0.5">🤝 Tabrik</span>
                </motion.div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex items-center justify-center gap-3">
              {pulledPlayers.length > 1 ? (
                <button
                  onClick={() => setPhase('summary')}
                  className="py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-400/25 transition-transform transform active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <span>Barcha 10 ta o‘yinchini ko‘rish</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="py-3 px-8 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-400/25 transition-transform transform active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Jamoaga Qo‘shish & Tugatish</span>
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* ================= PHASE 4: FULL PULL SUMMARY (GRID OF ALL PLAYERS) ================= */}
        {phase === 'summary' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-30 max-w-4xl w-full p-6 bg-slate-900/95 border border-slate-700/80 rounded-3xl shadow-2xl backdrop-blur flex flex-col max-h-[85vh]"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span>To‘plam Natijalari ({pulledPlayers.length} ta futbolchi)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Ushbu ochilishda tushgan barcha o‘yinchilar zaxirangizga muvaffaqiyatli qo‘shildi.
                </p>
              </div>

              <button
                onClick={onClose}
                className="py-2 px-5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Tugatish
              </button>
            </div>

            {/* Players Grid */}
            <div className="overflow-y-auto flex-1 grid grid-cols-2 sm:grid-cols-5 gap-3 pr-1 py-1">
              {pulledPlayers.map((player, idx) => {
                const isPPlayerEpic = player.ovr >= 89;
                const isPPlayerHighlight = player.ovr >= 84 && !isPPlayerEpic;

                return (
                  <div
                    key={player.id || idx}
                    className={`p-3 rounded-2xl flex flex-col items-center text-center transition-all ${
                      isPPlayerEpic
                        ? 'bg-slate-950 border-2 border-amber-400/80 shadow-md shadow-amber-400/20'
                        : isPPlayerHighlight
                        ? 'bg-slate-950 border border-cyan-400/60'
                        : 'bg-slate-950/70 border border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full text-[10px] text-slate-400 font-mono mb-1">
                      <span>{player.role || 'CF'}</span>
                      <span className="text-base">{player.nation?.flag || '🌍'}</span>
                    </div>

                    <div className="w-14 h-14 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-black text-lg text-amber-300 my-1">
                      {player.ovr}
                    </div>

                    <div className="text-xs font-bold text-white truncate w-full mt-1">
                      {player.name}
                    </div>

                    <div className="text-[10px] text-slate-400 truncate w-full">
                      {player.club}
                    </div>

                    {isPPlayerEpic ? (
                      <span className="mt-1.5 px-2 py-0.5 rounded text-[8px] font-black uppercase bg-amber-400 text-slate-950">
                        ★ EPIC
                      </span>
                    ) : isPPlayerHighlight ? (
                      <span className="mt-1.5 px-2 py-0.5 rounded text-[8px] font-black uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        HIGHLIGHT
                      </span>
                    ) : (
                      <span className="mt-1.5 text-[8px] font-mono text-slate-500 uppercase">
                        STANDARD
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
              <div className="text-xs text-slate-400">
                Barcha o‘yinchilar zaxira tarkibiga 100% kuch bilan kiritildi.
              </div>
              <button
                onClick={onClose}
                className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Squadga O‘tish</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
};
