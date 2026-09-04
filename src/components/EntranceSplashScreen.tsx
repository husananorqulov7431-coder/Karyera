import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { sfxWhistle, sfxCardFlip } from '../utils/audio';
import { Sparkles, Trophy, Shield, Zap, Play } from 'lucide-react';

interface EntranceSplashScreenProps {
  onComplete: () => void;
}

export const EntranceSplashScreen: React.FC<EntranceSplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Stadion chiroqlari yoqilmoqda...');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const steps = [
      { p: 20, text: 'Yulduz futbolchilar kartalari yuklanmoqda...' },
      { p: 45, text: 'Taktik maydon va o‘yin mexanikasi sozlanmoqda...' },
      { p: 70, text: 'Ovoz effektlari va sharhlovchi tayyorlanmoqda...' },
      { p: 90, text: 'Chempionlar ligasi atmosferasi faollashtirilmoqda...' },
      { p: 100, text: 'Tayyor! Maydonga xush kelibsiz!' }
    ];

    let currentStepIdx = 0;
    const interval = setInterval(() => {
      if (currentStepIdx < steps.length) {
        const step = steps[currentStepIdx];
        setProgress(step.p);
        setStatusText(step.text);
        currentStepIdx++;
      } else {
        clearInterval(interval);
        setReady(true);
      }
    }, 450);

    return () => clearInterval(interval);
  }, []);

  const handleStart = () => {
    sfxWhistle();
    onComplete();
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-slate-950 select-none"
    >
      {/* Dynamic Stadium Background Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-b from-cyan-500/20 via-blue-600/10 to-transparent rounded-full filter blur-[120px]" />
        <div className="absolute bottom-0 inset-x-0 h-64 bg-gradient-to-t from-emerald-950/40 to-transparent" />

        {/* Tactical Pitch Lines in Background */}
        <svg className="absolute inset-0 w-full h-full opacity-10 stroke-white" strokeWidth="1.5" fill="none">
          <circle cx="50%" cy="50%" r="180" />
          <line x1="0" y1="50%" x2="100%" y2="50%" />
        </svg>
      </div>

      {/* Main Content Presentation */}
      <div className="relative z-10 flex flex-col items-center max-w-md w-full px-6 text-center">
        {/* Animated Emblem */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, type: 'spring' }}
          className="relative mb-6"
        >
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-400 via-yellow-500 to-amber-600 p-0.5 shadow-[0_0_50px_rgba(245,158,11,0.5)] flex items-center justify-center">
            <div className="w-full h-full rounded-[22px] bg-slate-950 flex flex-col items-center justify-center">
              <Trophy className="w-11 h-11 text-amber-400 drop-shadow" />
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-cyan-500 text-slate-950 shadow-md">
            <Zap className="w-4 h-4 fill-current" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 tracking-wider uppercase drop-shadow"
        >
          KARYERA ULTIMATE
        </motion.h1>

        <motion.p
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xs font-bold text-cyan-300 uppercase tracking-widest mt-1"
        >
          Professional Futbol Menejeri & Karta Simulyatori
        </motion.p>

        {/* Loading Progress Bar */}
        <div className="w-full mt-8 flex flex-col items-center gap-2">
          <div className="w-full h-2 rounded-full bg-white/[0.08] overflow-hidden border border-white/10 p-0.5">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-amber-400"
              style={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut', duration: 0.3 }}
            />
          </div>

          <div className="w-full flex justify-between items-center text-[11px] text-slate-400 font-bold px-1 mt-1">
            <span className="truncate max-w-[280px]">{statusText}</span>
            <span className="font-mono text-cyan-400 font-black">{progress}%</span>
          </div>
        </div>

        {/* Action Button once ready */}
        <div className="mt-8 h-12 flex items-center justify-center">
          {ready ? (
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStart}
              className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-[0_0_35px_rgba(245,158,11,0.6)] cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Maydonga Kirish</span>
            </motion.button>
          ) : (
            <button
              onClick={handleStart}
              className="text-[11px] font-bold text-slate-500 hover:text-slate-300 underline cursor-pointer transition-colors"
            >
              Kutmasdan o‘tkazib yuborish
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
