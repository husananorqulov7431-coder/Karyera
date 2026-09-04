import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { SpecialPack, Player, GoogleUserAccount, PackOpenLog } from '../types';
import { sfxClick, sfxCardFlip, sfxWhistle } from '../utils/audio';
import { speakText } from '../utils/speech';
import {
  Download,
  Upload,
  RefreshCw,
  FileJson,
  Github,
  Database,
  CheckCircle2,
  AlertCircle,
  X,
  Copy,
  Check,
  Shield,
  Trash2,
  HardDrive
} from 'lucide-react';

interface DataSyncBackupModalProps {
  specialPacks: SpecialPack[];
  squad: Record<string, Player | null>;
  bench: Player[];
  reserves: Player[];
  currentUser: GoogleUserAccount | null;
  packLogs: PackOpenLog[];
  clubBudget: number;
  onRestoreAllData: (data: {
    specialPacks?: SpecialPack[];
    squad?: Record<string, Player | null>;
    bench?: Player[];
    reserves?: Player[];
    currentUser?: GoogleUserAccount;
    clubBudget?: number;
  }) => void;
  onClose: () => void;
}

export const DataSyncBackupModal: React.FC<DataSyncBackupModalProps> = ({
  specialPacks,
  squad,
  bench,
  reserves,
  currentUser,
  packLogs,
  clubBudget,
  onRestoreAllData,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'backup_export' | 'restore_import' | 'github_sync'>('backup_export');
  const [githubUrl, setGithubUrl] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // JSON Zaxira Faylini Yuklab Olish (Eksport)
  const handleExportBackup = () => {
    sfxClick();
    try {
      const backupData = {
        version: 'efootball_2026_v2',
        exportedAt: new Date().toISOString(),
        user: currentUser,
        clubBudget,
        specialPacks,
        squad,
        bench,
        reserves,
        packLogs
      };

      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `efootball_2026_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setStatusMessage({
        type: 'success',
        text: 'Barcha ma\'lumotlar (packlar, o\'yinchilar, balans) .json fayl sifatida muvaffaqiyatli saqlandi!'
      });
      speakText('Zaxira fayli yuklab olindi.', true);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `Eksport xatosi: ${err.message}` });
    }
  };

  // Fayl orqali Qayta Tiklash (Import)
  const processJsonFile = (file: File) => {
    if (!file.name.endsWith('.json')) {
      setStatusMessage({ type: 'error', text: 'Iltimos, faqat .json formatdagi faylni yuklang!' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);

        // Tekshirish
        if (parsed.specialPacks || parsed.squad || parsed.bench || Array.isArray(parsed)) {
          let packsToRestore = parsed.specialPacks;
          // Agar foydalanuvchi shunchaki bitta pack yoki o'yinchilar massivini yuklagan bo'lsa
          if (!packsToRestore && Array.isArray(parsed)) {
            packsToRestore = parsed;
          }

          onRestoreAllData({
            specialPacks: packsToRestore,
            squad: parsed.squad,
            bench: parsed.bench,
            reserves: parsed.reserves,
            currentUser: parsed.user,
            clubBudget: parsed.clubBudget
          });

          setStatusMessage({
            type: 'success',
            text: 'Fayl muvaffaqiyatli qabul qilindi! Barcha ma\'lumotlar yangilandi.'
          });
          sfxWhistle();
          speakText('Ma\'lumotlar to\'liq tiklandi.', true);
        } else {
          setStatusMessage({
            type: 'error',
            text: 'Fayl ichida kerakli o\'yin ma\'lumotlari topilmadi.'
          });
        }
      } catch (err: any) {
        setStatusMessage({ type: 'error', text: `JSON formati xato: ${err.message}` });
      }
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processJsonFile(file);
    }
  };

  // Drag and drop hodisalari
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processJsonFile(file);
    }
  };

  // GitHub Raw URL dan packlarni tortib olish
  const handleSyncFromGithub = async () => {
    const url = githubUrl.trim();
    if (!url) {
      setStatusMessage({ type: 'error', text: 'Iltimos, GitHub fayl havolasini kiriting!' });
      return;
    }

    setIsSyncing(true);
    sfxClick();
    try {
      // Agar foydalanuvchi oddiy github.com/blob havolasini kiritgan bo'lsa, raw ga aylantirish
      let fetchUrl = url;
      if (fetchUrl.includes('github.com') && fetchUrl.includes('/blob/')) {
        fetchUrl = fetchUrl.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
      }

      const res = await fetch(fetchUrl);
      if (!res.ok) {
        throw new Error(`GitHub bilan bog'lanib bo'lmadi (Status: ${res.status})`);
      }
      const data = await res.json();

      let packsToAdd: SpecialPack[] = [];
      if (Array.isArray(data)) {
        packsToAdd = data;
      } else if (data.specialPacks && Array.isArray(data.specialPacks)) {
        packsToAdd = data.specialPacks;
      } else if (data.players && Array.isArray(data.players)) {
        // Agar bitta pack jsoni bo'lsa
        packsToAdd = [{
          id: `pack_gh_${Date.now()}`,
          name: data.packName || data.name || 'GitHub Special Box Draw',
          badge: data.badge || 'EPIC',
          description: data.description || 'GitHub repozitoriyadan to\'g\'ridan-to\'g\'ri sinxronlangan pack.',
          themeColor: 'cyan',
          startsAt: Date.now(),
          expiresAt: Date.now() + 7 * 86400000,
          freePullsTotal: data.freePulls || 10,
          freePullsRemaining: data.freePulls || 10,
          costPer10: data.costPer10 || 1000,
          costPer1: 100,
          players: data.players,
          totalPoolCount: data.players.length,
          pulledCount: 0,
          createdAt: Date.now(),
          createdBy: 'GitHub Sync'
        }];
      }

      if (packsToAdd.length > 0) {
        onRestoreAllData({ specialPacks: packsToAdd });
        setStatusMessage({
          type: 'success',
          text: `GitHub orqali ${packsToAdd.length} ta pack muvaffaqiyatli sinxronlandi!`
        });
        sfxCardFlip();
      } else {
        setStatusMessage({ type: 'error', text: 'GitHub faylida o\'yinchi yoki pack ma\'lumotlari topilmadi.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `Sinxronizatsiya xatosi: ${err.message}` });
    } finally {
      setIsSyncing(false);
    }
  };

  // LocalStorage hajmini hisoblash
  const getLocalStorageSize = () => {
    try {
      let total = 0;
      for (const x in localStorage) {
        if (localStorage.hasOwnProperty(x)) {
          total += (localStorage[x].length * 2) / 1024;
        }
      }
      return `${total.toFixed(1)} KB`;
    } catch {
      return 'Noma\'lum';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative max-w-2xl w-full bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(0,0,0,0.8)] overflow-hidden"
      >
        {/* Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center text-slate-950 font-black shadow-lg">
            <HardDrive className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-black uppercase tracking-wider">
              <Database className="w-3 h-3" />
              <span>DOIMIY XOTIRA VA GITHUB KO‘PRIGI</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Lokal Xotira & GitHub Sinxronizatsiya Markazi
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Packlar va jamoangiz ma'lumotlarini faylga saqlash, tiklash va GitHub orqali uzluksiz almashish.
            </p>
          </div>
        </div>

        {/* Storage Stats Bar */}
        <div className="grid grid-cols-3 gap-3 mb-5 p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs">
          <div className="flex flex-col">
            <span className="text-slate-500 text-[10px] uppercase font-bold">Faol Packlar</span>
            <span className="text-white font-black text-sm">{specialPacks.length} ta pack</span>
          </div>
          <div className="flex flex-col">
            <span className="text-slate-500 text-[10px] uppercase font-bold">Jamoa O‘yinchilari</span>
            <span className="text-cyan-400 font-black text-sm">
              {Object.values(squad).filter(Boolean).length + bench.length + reserves.length} ta
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-slate-500 text-[10px] uppercase font-bold">Xotira Hajmi</span>
            <span className="text-emerald-400 font-mono font-bold text-sm">{getLocalStorageSize()}</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-2">
          <button
            onClick={() => {
              sfxClick();
              setActiveTab('backup_export');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'backup_export'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Zaxira Yuklab Olish (Eksport)</span>
          </button>

          <button
            onClick={() => {
              sfxClick();
              setActiveTab('restore_import');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'restore_import'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Fayl Qabul Qilish (Import)</span>
          </button>

          <button
            onClick={() => {
              sfxClick();
              setActiveTab('github_sync');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'github_sync'
                ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub Orqali Bog‘lanish</span>
          </button>
        </div>

        {/* Status Alert */}
        {statusMessage && (
          <div
            className={`mb-5 p-3.5 rounded-2xl text-xs flex items-center gap-2.5 border ${
              statusMessage.type === 'success'
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                : statusMessage.type === 'error'
                ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                : 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Tab 1: Export Backup */}
        {activeTab === 'backup_export' && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileJson className="w-4 h-4 text-cyan-400" />
                <span>To‘liq O‘yin Zaxirasini Yaratish</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Ushbu tugmani bosish orqali siz hozirgi barcha maxsus packlar ro'yxatini, jamoangiz tarkibini,
                ochilgan futbolchilar jurnali va balansingizni bitta <strong>.json</strong> fayl qilib yuklab olasiz.
                Brauzer keshini tozalaganda yoki boshqa telefonga o'tganda shu faylni yuklab, 1 soniyada hamma narsani qayta tiklashingiz mumkin!
              </p>
              <button
                onClick={handleExportBackup}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Zaxira Faylini Yuklab Olish (.json)</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Import / File Upload & Drag-and-Drop */}
        {activeTab === 'restore_import' && (
          <div className="space-y-4">
            {/* Drag & Drop Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-8 rounded-3xl border-2 border-dashed text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
                isDragOver
                  ? 'border-emerald-400 bg-emerald-500/10 scale-[1.01]'
                  : 'border-slate-700 hover:border-emerald-500/50 bg-slate-950/50'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
                <Upload className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">
                  JSON Faylni shu yerga tashlang yoki tanlang
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Telegram botdan olingan yoki avval eksport qilingan <strong>.json</strong> fayllarni qabul qiladi
                </p>
              </div>
              <span className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition-colors">
                Faylni tanlash (.json)
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>
        )}

        {/* Tab 3: GitHub Direct Sync */}
        {activeTab === 'github_sync' && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Github className="w-4 h-4 text-cyan-400" />
                <span>GitHub Repozitoriyadan To‘g‘ridan-to‘g‘ri Yuklab Olish</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                GitHub repozitoriyangizdagi packlar JSON fayli havolasini kiriting (masalan, <code>https://raw.githubusercontent.com/.../packs.json</code>).
                Tizim yangi packlarni bevosita GitHub serveridan yuklab, lokal xotirangiz bilan birlashtiradi!
              </p>

              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://raw.githubusercontent.com/.../packs.json"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={handleSyncFromGithub}
                  disabled={isSyncing}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Yuklanmoqda...' : 'Sinxronlash'}</span>
                </button>
              </div>

              {/* Quick Template link */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>Standart namuna repozitoriya havolasi:</span>
                <button
                  onClick={() => setGithubUrl('https://raw.githubusercontent.com/husananorqulov7431-coder/Karyera/main/public/sample_packs.json')}
                  className="text-cyan-400 hover:underline font-mono text-[11px]"
                >
                  Havolani kiritish
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
