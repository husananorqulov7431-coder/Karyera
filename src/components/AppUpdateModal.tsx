import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  AppVersionInfo,
  GoogleUserAccount
} from '../types';
import {
  getAppVersionInfo,
  publishNewAppVersion,
  markUserVersionApplied
} from '../utils/versionControl';
import { sfxClick, sfxWhistle } from '../utils/audio';
import {
  Rocket,
  X,
  Sparkles,
  CheckCircle2,
  Package,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Layers,
  Flame
} from 'lucide-react';

interface AppUpdateModalProps {
  currentUser: GoogleUserAccount | null;
  isAdmin: boolean;
  onClose: () => void;
  onUpdateCompleted: () => void;
}

export const AppUpdateModal: React.FC<AppUpdateModalProps> = ({
  currentUser,
  isAdmin,
  onClose,
  onUpdateCompleted
}) => {
  const [versionInfo, setVersionInfo] = useState<AppVersionInfo>(() => getAppVersionInfo());
  const [isAdminPublishing, setIsAdminPublishing] = useState(false);

  // Admin form
  const [releaseNotes, setReleaseNotes] = useState('Yangi Epic Kartalar va maxsus eFootball to‘plami qo‘shildi!');
  const [hasPublishedPack, setHasPublishedPack] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleApplyUserUpdate = () => {
    sfxWhistle();
    markUserVersionApplied(versionInfo.version);
    setFeedback('✅ Yangilanish muvaffaqiyatli o‘rnatildi! Barcha yangi packlar faollashtirildi.');
    setTimeout(() => {
      onUpdateCompleted();
      onClose();
    }, 1200);
  };

  const handleAdminPublish = (e: React.FormEvent) => {
    e.preventDefault();
    sfxWhistle();
    const updated = publishNewAppVersion({
      version: `v2.${Math.floor(Date.now() / 100000 % 100)}.0`,
      releaseTitle: 'eFootball™ 2026 Yangi Pack & Versiya',
      releaseNotes: releaseNotes.split('\n').filter(Boolean),
      activePackIds: [],
      hasPublishedPack
    });
    setVersionInfo(updated);
    setIsAdminPublishing(false);
    setFeedback(`🚀 Yangi ${updated.version} versiyasi e’lon qilindi! ${hasPublishedPack ? 'O‘yinchilarga yangilash oynasi ko‘rsatiladi.' : 'O‘yinchilarga bezovta qilmasdan fon rejimida yangilanadi.'}`);
    setTimeout(() => setFeedback(null), 5000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-400/20">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>eFootball Tizim Yangilanishi</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 font-mono font-bold">
                  v{versionInfo.version}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Yangi packlar va kartalar sinxronizatsiyasi
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Main User Notification Card */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-[10px] uppercase tracking-wider">
                Yangi Versiya Chiqdi
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {new Date(versionInfo.releasedAt).toLocaleDateString()}
              </span>
            </div>

            <div>
              <h4 className="text-sm font-black text-white">
                O‘yinda Yangi Pack & Dizaynlar Mavjud!
              </h4>
              <ul className="mt-2 space-y-1.5">
                {Array.isArray(versionInfo.releaseNotes) ? (
                  versionInfo.releaseNotes.map((note, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                      <span>{note}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-slate-300">{versionInfo.releaseNotes}</li>
                )}
              </ul>
            </div>

            {/* Decoupling Guarantee Badge */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-2.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-200 block">Kafolatlangan Xavfsizlik:</strong>
                Avval tushirilgan barcha Epic o‘yinchilaringiz, GP balansingiz va tarkibingiz to‘liq saqlanadi. Studiodan dizayn o‘chirilgan taqdirda ham mavjud kartalaringizga hech qanday ta’sir ko‘rsatilmaydi.
              </div>
            </div>

            <button
              onClick={handleApplyUserUpdate}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:from-cyan-300 hover:to-indigo-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20 active:scale-98"
            >
              <RefreshCw className="w-4 h-4 text-slate-950" />
              <span>Yangilanishni O‘rnatish & Ishga Tushirish</span>
            </button>
          </div>

          {/* Admin Release Management Controls */}
          {isAdmin && (
            <div className="pt-2 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  Admin: Yangi Versiya Chiqarish (Release)
                </span>
                <button
                  type="button"
                  onClick={() => setIsAdminPublishing(!isAdminPublishing)}
                  className="text-xs text-amber-300 hover:text-amber-200 font-bold"
                >
                  {isAdminPublishing ? 'Yopish' : 'Tahrirlash'}
                </button>
              </div>

              {isAdminPublishing && (
                <form onSubmit={handleAdminPublish} className="p-4 rounded-2xl bg-slate-950/90 border border-amber-400/40 space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Versiya Izohi (Release Notes)
                    </label>
                    <textarea
                      rows={3}
                      value={releaseNotes}
                      onChange={(e) => setReleaseNotes(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:border-amber-400 outline-none resize-none"
                    />
                  </div>

                  <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasPublishedPack}
                      onChange={(e) => setHasPublishedPack(e.target.checked)}
                      className="accent-amber-400 rounded"
                    />
                    <span>Yangi Pack Chiqarildi (O‘yinchilarda yangilash tugmasi chiqadi)</span>
                  </label>

                  <p className="text-[10px] text-slate-500 leading-tight">
                    * Qoida: Agar faqat dizayn o'chirilsa yoki kichik tuzatish bo'lsa va yangi pack chiqarilmasa, ushbu katakchani belgilamang — shunda o'yinchilarga yangilanish oynasi chiqmaydi va mavjud epiclar buzilmaydi.
                  </p>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 text-slate-950 font-black text-xs uppercase transition-all shadow-md shadow-amber-400/20 cursor-pointer"
                  >
                    🚀 Yangi Versiyani Rasman E’lon Qilish
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
