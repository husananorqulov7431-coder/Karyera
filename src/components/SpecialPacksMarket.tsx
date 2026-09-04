import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SpecialPack, Player, GoogleUserAccount } from '../types';
import { FutCard } from './FutCard';
import { NewsBoardModal } from './NewsBoardModal';
import { AppUpdateModal } from './AppUpdateModal';
import { getUserVisibleNews } from '../utils/newsStore';
import { shouldPromptUserUpdate } from '../utils/versionControl';
import { sfxClick, sfxCardFlip, sfxWhistle } from '../utils/audio';
import { speakText } from '../utils/speech';
import {
  Sparkles,
  Clock,
  Gift,
  Coins,
  Shield,
  PlusCircle,
  Eye,
  Check,
  ChevronRight,
  Flame,
  Award,
  Zap,
  RotateCcw,
  Percent,
  X,
  HelpCircle,
  Trash2,
  Bot,
  HardDrive,
  Upload,
  RefreshCw,
  Sliders,
  Layers,
  Package,
  Newspaper,
  Rocket
} from 'lucide-react';

interface SpecialPacksMarketProps {
  packs: SpecialPack[];
  currentUser: GoogleUserAccount | null;
  onOpenPack: (pack: SpecialPack, pullCount: 1 | 10) => void;
  onOpenAdminManager?: () => void;
  onOpenEpicStudio?: () => void;
  onSelectPlayerPreview?: (player: Player) => void;
  onDeletePack?: (packId: string) => void;
  onResetPackBox?: (packId: string) => void;
  onOpenTelegramHub?: () => void;
  onOpenSyncHub?: () => void;
  onSyncPacks?: () => void;
}

export const SpecialPacksMarket: React.FC<SpecialPacksMarketProps> = ({
  packs = [],
  currentUser,
  onOpenPack,
  onOpenAdminManager,
  onOpenEpicStudio,
  onSelectPlayerPreview,
  onDeletePack,
  onResetPackBox,
  onOpenTelegramHub,
  onOpenSyncHub,
  onSyncPacks
}) => {
  const [selectedPackForDetails, setSelectedPackForDetails] = useState<SpecialPack | null>(null);
  const [inspectingPlayer, setInspectingPlayer] = useState<Player | null>(null);
  const [showOddsModal, setShowOddsModal] = useState(false);
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [now, setNow] = useState(Date.now());

  const userGp = currentUser?.gp ?? 0;
  const matchesWon = currentUser?.matchesWon ?? 0;
  const isAdmin = currentUser?.isAdmin || false;

  const visibleNewsCount = getUserVisibleNews(isAdmin).length;
  const updateAvailable = shouldPromptUserUpdate(packs);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimeLeft = (expiresAt: number) => {
    const diff = (expiresAt || Date.now() + 86400000) - now;
    if (diff <= 0) return 'Muddati tugagan';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    return `${days}k ${hours}s ${minutes}m ${seconds}s`;
  };

  return (
    <div className="space-y-6 select-none">
      {/* Top Banner: eFootball 2026 Packs Header & Balance */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-cyan-500/40 p-6 sm:p-8 shadow-2xl">
        {/* Glow & Stadium FX */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 text-xs font-black tracking-widest uppercase mb-3 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>eFOOTBALL™ 2026 MAXSUS PACKLAR</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
              Epic & Afsonaviy O‘yinchilar Lotereyasi
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mt-1.5 leading-relaxed">
              O‘yinlarda g‘alaba qozonib <span className="text-amber-400 font-bold">GP</span> yig‘ing yoki berilgan <span className="text-emerald-400 font-bold">Free imkoniyatlar</span>dan foydalaning. 89+ reytingli yulduz tushganda haqiqiy eFootball Epic animatsiyasi faollashadi!
            </p>
          </div>

          {/* User Currency & Admin Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* GP Balance Card */}
            <div className="bg-slate-950/80 border border-amber-400/40 px-4 py-3 rounded-2xl flex items-center gap-3 backdrop-blur shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center font-black">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  Sizning Balansingiz
                </div>
                <div className="text-lg font-black text-amber-300 flex items-center gap-1.5">
                  <span>{userGp.toLocaleString()} GP</span>
                  <span className="text-[10px] font-normal text-slate-400">({matchesWon} g‘alaba)</span>
                </div>
              </div>
            </div>

            {/* Epic & Card Studio Button */}
            {onOpenEpicStudio && (
              <button
                onClick={() => {
                  sfxClick();
                  onOpenEpicStudio();
                }}
                className="px-3.5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-400/20 active:scale-95"
              >
                <Award className="w-4 h-4 text-slate-950" />
                <span>Epic Studio</span>
              </button>
            )}

            {/* Force Sync with Bot & Default Packs Button (Faqat Bosh Admin uchun) */}
            {onSyncPacks && currentUser?.isAdmin && (
              <button
                onClick={() => {
                  sfxClick();
                  onSyncPacks();
                }}
                className="px-3.5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-95"
                title="Eski keshni tozalash va 4 ta rasmiy packni Telegram bot bilan sinxronlash"
              >
                <RefreshCw className="w-4 h-4 text-slate-950 animate-spin-slow" />
                <span>Packlarni Sinxronlash</span>
              </button>
            )}

            {/* Telegram Bot & AI Hub Button */}
            <button
              onClick={() => {
                sfxClick();
                if (onOpenTelegramHub) onOpenTelegramHub();
              }}
              className="px-3.5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              <Bot className="w-4 h-4 text-slate-950" />
              <span>Telegram Bot & AI Hub</span>
            </button>

            {/* LocalStorage & GitHub Sync Hub Button */}
            <button
              onClick={() => {
                sfxClick();
                if (onOpenSyncHub) onOpenSyncHub();
              }}
              className="px-3.5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white border border-cyan-500/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg"
            >
              <HardDrive className="w-4 h-4 text-cyan-400" />
              <span>Zaxira & GitHub</span>
            </button>

            {/* News Board (Yangiliklar) Button */}
            <button
              onClick={() => {
                sfxClick();
                setShowNewsModal(true);
              }}
              className="relative px-3.5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-white border border-amber-500/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg active:scale-95"
            >
              <Newspaper className="w-4 h-4 text-amber-400" />
              <span>Yangiliklar</span>
              {visibleNewsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-mono font-black animate-pulse shadow-md">
                  {visibleNewsCount}
                </span>
              )}
            </button>

            {/* Version Update Button */}
            <button
              onClick={() => {
                sfxClick();
                setShowUpdateModal(true);
              }}
              className={`relative px-3.5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg active:scale-95 ${
                updateAvailable
                  ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-500 text-slate-950 font-black shadow-amber-400/30 ring-2 ring-amber-300 animate-bounce-short'
                  : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white border border-cyan-500/30'
              }`}
            >
              <Rocket className={`w-4 h-4 ${updateAvailable ? 'text-slate-950' : 'text-cyan-400'}`} />
              <span>{updateAvailable ? 'Yangi Versiya!' : 'Versiya'}</span>
              {updateAvailable && (
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 absolute -top-1 -right-1 animate-ping" />
              )}
            </button>

            {/* Probability Odds Info Button */}
            <button
              onClick={() => setShowOddsModal(true)}
              className="px-3.5 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Percent className="w-4 h-4 text-cyan-400" />
              <span>Ehtimollar</span>
            </button>
          </div>
        </div>

        {/* Currency Explainer Ribbon */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>1 ta o‘yinda g‘alaba = <strong className="text-amber-300">+50 GP</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>10 talik pack ochish uchun = <strong className="text-cyan-300">20 ta o‘yin yutish</strong> (1000 GP) kerak</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-yellow-400" />
            <span>Har bir packda <strong className="text-emerald-300">10 ta Free imkoniyat</strong> mavjud!</span>
          </div>
        </div>
      </div>

      {/* Packs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {packs.length === 0 ? (
          <div className="col-span-full p-12 rounded-3xl bg-slate-900/60 border border-slate-800 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-3xl bg-slate-800/80 text-amber-400 flex items-center justify-center mb-4 border border-slate-700">
              <Package className="w-8 h-8 text-amber-400" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-white mb-1.5">
              Hozirda O‘yinda Faol Packlar Mavjud Emas
            </h3>
            <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
              O‘yindagi barcha eski packlar tozalandi. Yuqoridagi <strong className="text-amber-300">Epic Studio</strong> orqali o‘zingiz xohlagan yangi Epic afsonalarni yarating yoki yangi packlar qo‘shing!
            </p>
            {onOpenEpicStudio && (
              <button
                onClick={() => {
                  sfxClick();
                  onOpenEpicStudio();
                }}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-amber-400/20 flex items-center gap-2"
              >
                <Award className="w-4 h-4 text-slate-950" />
                <span>👑 Yangi Epic / Pack Yaratish</span>
              </button>
            )}
          </div>
        ) : (
          packs.map((pack) => {
          const playersList = pack.players || [];
          const freeRem = pack.freePullsRemaining ?? 0;
          const cost10 = pack.costPer10 || 1000;
          const cost1 = pack.costPer1 || 100;
          const hasFree = freeRem > 0;
          const canAfford10 = isAdmin || (hasFree ? freeRem >= 10 : userGp >= cost10);
          const canAfford1 = isAdmin || (hasFree ? freeRem >= 1 : userGp >= cost1);

          // PES Box Draw calculation
          const totalPool = pack.totalPoolCount || playersList.length || 100;
          const remainingCount = Math.max(0, totalPool - (pack.pulledCount || 0));

          return (
            <motion.div
              key={pack.id}
              whileHover={{ y: -3 }}
              className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition-all shadow-xl flex flex-col justify-between"
            >
              {/* Pack Card Header & Banner */}
              <div
                className="relative p-6 bg-gradient-to-b from-blue-900/40 to-transparent border-b border-slate-800"
                style={{
                  background:
                    pack.badge === 'EPIC'
                      ? 'linear-gradient(180deg, rgba(16, 185, 129, 0.2) 0%, rgba(15, 23, 42, 0.8) 100%)'
                      : 'linear-gradient(180deg, rgba(245, 158, 11, 0.2) 0%, rgba(15, 23, 42, 0.8) 100%)'
                }}
              >
                {/* Top Badge & Timer */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase shadow-md ${
                        pack.badge === 'EPIC'
                          ? 'bg-amber-400 text-slate-950 shadow-amber-400/30'
                          : 'bg-cyan-500 text-slate-950 shadow-cyan-500/30'
                      }`}
                    >
                      {pack.badge || 'SPECIAL'}
                    </span>
                    {totalPool >= 50 && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-600/30 border border-blue-400/40 text-blue-300 text-[9px] font-black uppercase font-mono">
                        {totalPool} BOX DRAW
                      </span>
                    )}
                  </div>

                  {/* Right: Timer & Admin Delete Button */}
                  <div className="flex items-center gap-2">
                    {isAdmin && onDeletePack && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          sfxClick();
                          if (window.confirm(`"${pack.name}" nomli packni o'chirishni tasdiqlaysizmi?`)) {
                            onDeletePack(pack.id);
                          }
                        }}
                        className="p-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/40 transition-colors cursor-pointer"
                        title="Packni o'chirish (Admin)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/80 border border-slate-700/80 text-[11px] font-mono font-bold text-amber-300">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{formatTimeLeft(pack.expiresAt)}</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-black text-white tracking-wide">
                  {pack.name}
                </h3>
                <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                  {pack.description}
                </p>

                {/* Free Pulls Badge & Pool Count */}
                {(() => {
                  const epicsRemaining = playersList.filter(p => p.ovr >= 89).length;
                  const totalEpics = (pack.originalPlayers || playersList).filter(p => p.ovr >= 89).length || epicsRemaining;

                  return (
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                        <Gift className="w-4 h-4" />
                        <span>Free: <strong>{freeRem} / {pack.freePullsTotal || 10}</strong></span>
                      </div>

                      <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-mono font-bold">
                        Qolgan: <strong className="text-white">{playersList.length} / {totalPool}</strong>
                      </div>

                      <div className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${
                        epicsRemaining > 0
                          ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                          : 'bg-slate-800/40 border-slate-700 text-slate-500'
                      }`}>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Epic: <strong>{epicsRemaining} / {totalEpics}</strong></span>
                      </div>

                      <button
                        onClick={() => {
                          sfxClick();
                          setSelectedPackForDetails(pack);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ro‘yxat ({playersList.length})</span>
                      </button>

                      {onResetPackBox && playersList.length < totalPool && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            sfxClick();
                            onResetPackBox(pack.id);
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-blue-500/15 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          title="Qutini (Box Draw) qayta to'ldirish"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Qayta to‘ldirish</span>
                        </button>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Pack Featured Players Preview Row */}
              <div className="p-4 bg-slate-950/40 flex items-center gap-2 overflow-x-auto">
                {playersList.slice(0, 5).map((player) => (
                  <div
                    key={player.id}
                    onClick={() => {
                      sfxCardFlip();
                      setInspectingPlayer(player);
                    }}
                    title="Ko‘rik rejimi: Futbolchi kartasini ko‘rish (bosganda olinmaydi)"
                    className="flex-shrink-0 w-24 p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-400/60 cursor-pointer transition-all text-center group"
                  >
                    <div className="text-[10px] font-bold text-slate-400 uppercase truncate">
                      {player.role || 'FW'}
                    </div>
                    <div className="text-base font-black text-amber-300 group-hover:scale-110 transition-transform">
                      {player.ovr}
                    </div>
                    <div className="text-[10px] font-bold text-white truncate">
                      {player.name}
                    </div>
                    {player.ovr >= 89 && (
                      <span className="text-[8px] font-black text-emerald-400 block uppercase">
                        ★ EPIC
                      </span>
                    )}
                  </div>
                ))}
                {playersList.length > 5 && (
                  <button
                    onClick={() => {
                      sfxClick();
                      setSelectedPackForDetails(pack);
                    }}
                    className="flex-shrink-0 px-3 py-4 text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
                  >
                    +{playersList.length - 5} yana
                  </button>
                )}
              </div>

              {/* Action Buttons: 1x Pull & 10x Pull */}
              <div className="p-5 border-t border-slate-800 bg-slate-900/60 grid grid-cols-2 gap-3">
                {/* 1x Pull */}
                <button
                  onClick={() => {
                    sfxClick();
                    onOpenPack(pack, 1);
                  }}
                  disabled={!canAfford1}
                  className={`py-3 px-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                    canAfford1
                      ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-cyan-400'
                      : 'bg-slate-850 text-slate-500 border border-slate-800 cursor-not-allowed opacity-60'
                  }`}
                >
                  <span className="text-xs font-black">1x Ochish</span>
                  <span className="text-[10px] text-amber-300 font-mono">
                    {isAdmin ? 'ADMIN: TEKIN' : hasFree ? '1 ta FREE' : `${cost1} GP`}
                  </span>
                </button>

                {/* 10x Pull (Target of 20 matches won) */}
                <button
                  onClick={() => {
                    sfxClick();
                    onOpenPack(pack, 10);
                  }}
                  disabled={!canAfford10}
                  className={`py-3 px-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-0.5 shadow-lg cursor-pointer ${
                    canAfford10
                      ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 shadow-amber-400/20 transform hover:scale-[1.02] active:scale-98'
                      : 'bg-slate-850 text-slate-500 border border-slate-800 cursor-not-allowed opacity-60'
                  }`}
                >
                  <span className="text-xs flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 fill-current" />
                    <span>10x Ochish</span>
                  </span>
                  <span className="text-[10px] font-mono">
                    {isAdmin ? 'ADMIN: TEKIN' : freeRem >= 10 ? '10 ta FREE' : `${cost10} GP (20 yutuq)`}
                  </span>
                </button>
              </div>
            </motion.div>
          );
        })
      )}
      </div>

      {/* Players List Modal in Pack */}
      <AnimatePresence>
        {selectedPackForDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-2xl w-full bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <div>
                  <h3 className="text-lg font-black text-white">
                    {selectedPackForDetails.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    To‘plamdagi barcha {selectedPackForDetails.players?.length || 0} nafar haqiqiy o‘yinchilar ro‘yxati
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPackForDetails(null)}
                  className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Odds summary in modal */}
              <div className="grid grid-cols-3 gap-2 mb-3 text-center text-xs p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="p-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
                  <div className="text-[10px] text-amber-400 font-bold uppercase">Epic (89+)</div>
                  <div className="text-xs font-black text-white">
                    {(selectedPackForDetails.players || []).filter(p => p.ovr >= 89).length} ta (Omad Zarb)
                  </div>
                </div>
                <div className="p-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                  <div className="text-[10px] text-cyan-400 font-bold uppercase">Highlight (84-88)</div>
                  <div className="text-xs font-black text-white">
                    {(selectedPackForDetails.players || []).filter(p => p.ovr >= 84 && p.ovr < 89).length} ta futbolchi
                  </div>
                </div>
                <div className="p-1.5 rounded-xl bg-slate-800/40 border border-slate-700">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Standard (75-83)</div>
                  <div className="text-xs font-black text-white">
                    {(selectedPackForDetails.players || []).filter(p => p.ovr < 84).length} ta futbolchi
                  </div>
                </div>
              </div>

              {/* Scrollable Player Cards List */}
              <div className="overflow-y-auto space-y-2 pr-1 flex-1">
                {(selectedPackForDetails.players || []).map((p, idx) => (
                  <div
                    key={p.id || idx}
                    onClick={() => {
                      sfxCardFlip();
                      setInspectingPlayer(p);
                    }}
                    title="Ko‘rik rejimi: Futbolchi kartasini ko‘rish uchun bosing"
                    className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between hover:border-amber-400/50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 text-amber-300 font-black flex items-center justify-center text-sm border border-slate-700 group-hover:scale-105 transition-transform">
                        {p.ovr}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          <span className="group-hover:text-amber-300 transition-colors">{p.name}</span>
                          {p.ovr >= 89 && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-amber-400 text-slate-950">
                              EPIC
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2">
                          <span>{p.role || 'CF'}</span>
                          <span>•</span>
                          <span>{p.club || 'Klub'}</span>
                          <span>•</span>
                          <span>{p.nation?.name || 'Davlat'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right text-[11px] font-mono text-slate-400 hidden sm:block">
                        PAC: {p.attrs?.pac ?? 75} | SHO: {p.attrs?.sho ?? 70}
                      </div>
                      <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-white/5 group-hover:bg-amber-400/20 text-slate-400 group-hover:text-amber-300 transition-all">
                        Ko‘rish
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PLAYER CARD INSPECTION MODAL (View only - strictly prevents accidental taking) */}
      <AnimatePresence>
        {inspectingPlayer && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none"
            onClick={() => setInspectingPlayer(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-sm w-full bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setInspectingPlayer(null)}
                className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-4">
                <FutCard player={inspectingPlayer} size="md" />
              </div>

              {/* Informative Security Notice Banner */}
              <div className="w-full p-3.5 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs mb-4 text-left">
                <div className="font-bold flex items-center gap-1.5 mb-1 text-amber-300">
                  <Eye className="w-4 h-4 text-amber-400" />
                  <span>Ko‘rik Rejimi (Namoyish)</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Futbolchi faqat ko‘rish uchun ochildi. Uni tarkibga qo‘shish uchun packni GP orqali ochishingiz kerak. O‘yinchini shunchaki bosish orqali olish xatosi butunlay bartaraf etildi!
                </p>
              </div>

              <button
                onClick={() => setInspectingPlayer(null)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase cursor-pointer"
              >
                Yopish
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PES Probability / Odds Explainer Modal */}
      <AnimatePresence>
        {showOddsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-md w-full bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl"
            >
              <button
                onClick={() => setShowOddsModal(false)}
                className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-black">
                  <Percent className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    PES / eFootball Tasodifiy Tizimi
                  </h3>
                  <p className="text-xs text-slate-400">
                    O‘yinchilar tushish ehtimollari (Probabilities)
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/40">
                  <div className="flex items-center justify-between font-bold text-amber-400 mb-1">
                    <span>★ EPIC (OVR 89+) — Haqiqiy Omad & Box Draw</span>
                    <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono">Dinamik + Omad</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Juda qimmatli afsonalar. Yangilangan tizimda sun'iy to'siqlar yo'q — hatto bitta Bepul (Free) spin bilan ham omadingiz kelsa Epic ilinib qolish ehtimoli to‘liq mavjud!
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-cyan-500/40">
                  <div className="flex items-center justify-between font-bold text-cyan-400 mb-1">
                    <span>★ HIGHLIGHT (OVR 84 - 88)</span>
                    <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-mono">~35% Omad Zarb</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Top klublar yetakchilari (Haaland, Mbappe, Bellingham, Vinicius, De Bruyne).
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-700">
                  <div className="flex items-center justify-between font-bold text-slate-400 mb-1">
                    <span>STANDARD (OVR 75 - 83)</span>
                    <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">Baraban Asosi</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Elit ligalarning ishonchli asosiy tarkib va rotatsiya o‘yinchilari.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowOddsModal(false)}
                className="w-full mt-5 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase"
              >
                Tushunarli
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* News Board (Yangiliklar) Modal */}
      <AnimatePresence>
        {showNewsModal && (
          <NewsBoardModal
            currentUser={currentUser as any}
            isAdmin={isAdmin}
            onClose={() => setShowNewsModal(false)}
          />
        )}
      </AnimatePresence>

      {/* App Version & Update Modal */}
      <AnimatePresence>
        {showUpdateModal && (
          <AppUpdateModal
            currentUser={currentUser as any}
            isAdmin={isAdmin}
            onClose={() => setShowUpdateModal(false)}
            onUpdateCompleted={() => {
              if (onSyncPacks) onSyncPacks();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
