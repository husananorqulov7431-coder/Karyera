import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { SpecialPack, PackOpenLog } from '../types';
import { RAW_100_PLAYERS_JSON_TEMPLATE } from '../data/oneHundredPlayersPack';
import { sfxClick, sfxCardFlip } from '../utils/audio';
import {
  Bot,
  Copy,
  Check,
  Code2,
  FileJson,
  Upload,
  Calendar,
  Clock,
  Users,
  Sparkles,
  AlertTriangle,
  X,
  CheckCircle2,
  ListOrdered,
  Eye,
  EyeOff,
  FileUp,
  ShieldCheck,
  Sliders,
  Flame,
  KeyRound,
  RefreshCw
} from 'lucide-react';

interface TelegramBotManagerProps {
  packs: SpecialPack[];
  packLogs: PackOpenLog[];
  onAddPack: (pack: SpecialPack) => void;
  onDeletePack: (packId: string) => void;
  onClose: () => void;
}

export const TelegramBotManager: React.FC<TelegramBotManagerProps> = ({
  packLogs = [],
  onAddPack,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'upload_json' | 'ai_assistant' | 'logs' | 'google_script'>('upload_json');
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedSampleJson, setCopiedSampleJson] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  // Xavfsiz Token Boshqaruvi
  const [showToken, setShowToken] = useState(false);
  const [customToken, setCustomToken] = useState(() => {
    try {
      return localStorage.getItem('efootball_tg_bot_token') || '';
    } catch {
      return '';
    }
  });

  const DEFAULT_TOKEN = (import.meta as any).env?.VITE_TELEGRAM_BOT_TOKEN || '8747293611:AAHeCI1LrGQgrajvpkG2aganLSUhvUEBA64';
  const activeToken = customToken.trim() || DEFAULT_TOKEN;

  const maskToken = (token: string) => {
    if (!token || token.length < 10) return '••••••••••••••••••••';
    return `${token.substring(0, 6)}••••••••••••••••••••${token.substring(token.length - 4)}`;
  };

  // Manual / Telegram Bot JSON Parser State
  const [jsonInput, setJsonInput] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileSize, setUploadedFileSize] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Pack Sozlamalari
  const [packName, setPackName] = useState('eFootball 2026 Telegram Box Draw');
  const [packDescription, setPackDescription] = useState('Telegram Bot orqali yuklangan maxsus o‘yinchilar to‘plami');
  const [badgeType, setBadgeType] = useState<'EPIC' | 'HIGHLIGHT' | 'SHOWTIME' | 'SPECIAL'>('EPIC');
  const [themeColor, setThemeColor] = useState<'emerald' | 'cyan' | 'amber' | 'purple' | 'rose'>('emerald');
  const [costPer1, setCostPer1] = useState(100);
  const [costPer10, setCostPer10] = useState(1000);
  const [freePulls, setFreePulls] = useState(10);

  // Vaqt Sozlamalari (Taymer)
  const [startType, setStartType] = useState<'now' | '1h' | '6h' | '24h' | 'custom'>('now');
  const [customStartTime, setCustomStartTime] = useState('');
  const [expiryType, setExpiryType] = useState<'1d' | '3d' | '7d' | '14d' | '30d' | 'unlimited'>('7d');

  const [aiAnalysisResult, setAiAnalysisResult] = useState<{
    valid: boolean;
    totalPlayers: number;
    epicsCount: number;
    highlightsCount: number;
    standardsCount: number;
    message: string;
  } | null>(null);

  // Bot Holati va 24/7 Watchdog nazorati
  const [botLiveStatus, setBotLiveStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [isRestartingBot, setIsRestartingBot] = useState(false);
  const [botStatusDetail, setBotStatusDetail] = useState<string>('Tekshirilmoqda...');

  const checkBotHealth = async () => {
    try {
      const res = await fetch('/api/bot-status');
      if (res.ok) {
        const json = await res.json();
        if (json.ok && json.data && json.data.active) {
          setBotLiveStatus('online');
          setBotStatusDetail(`24/7 Faol (PID: ${json.data.pid || 'Watchdog'}, ${json.data.updatesProcessed || 0} ta so'rov bajarildi)`);
          return;
        }
      }
    } catch {
      // Fallback: Agar mahalliy API bo'lmasa, Telegram API ni to'g'ridan-to'g'ri tekshirish
    }

    try {
      const tgRes = await fetch(`https://api.telegram.org/bot${activeToken}/getMe`);
      const tgJson = await tgRes.json();
      if (tgJson.ok) {
        setBotLiveStatus('online');
        setBotStatusDetail(`Ulandi: @${tgJson.result.username}`);
      } else {
        setBotLiveStatus('offline');
        setBotStatusDetail('Telegram API xatosi');
      }
    } catch {
      setBotLiveStatus('offline');
      setBotStatusDetail('Tarmoqqa ulanib bo‘lmadi');
    }
  };

  const handleRestartBot = async () => {
    sfxClick();
    setIsRestartingBot(true);
    setBotStatusDetail('Watchdog qayta yoqilmoqda...');
    try {
      await fetch('/api/bot-restart');
    } catch {}

    setTimeout(async () => {
      await checkBotHealth();
      setIsRestartingBot(false);
    }, 1500);
  };

  useEffect(() => {
    checkBotHealth();
    const interval = setInterval(checkBotHealth, 15000);
    return () => clearInterval(interval);
  }, [activeToken]);

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    sfxClick();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // JSON tahlili va muvozanatini tekshirish
  const handleAiAnalyzeJson = (rawText: string) => {
    if (!rawText.trim()) {
      setAiAnalysisResult(null);
      return;
    }
    try {
      const parsed = JSON.parse(rawText);
      let playersList: any[] = [];
      if (Array.isArray(parsed)) {
        playersList = parsed;
      } else if (parsed.players && Array.isArray(parsed.players)) {
        playersList = parsed.players;
        if (parsed.name && !packName) setPackName(parsed.name);
      } else {
        setAiAnalysisResult({
          valid: false,
          totalPlayers: 0,
          epicsCount: 0,
          highlightsCount: 0,
          standardsCount: 0,
          message: "Xatolik: JSON ichida 'players' massivi yoki o‘yinchilar ro‘yxati topilmadi!"
        });
        return;
      }

      const epics = playersList.filter((p) => (p.ovr || p.rating || 0) >= 89);
      const highlights = playersList.filter((p) => (p.ovr || p.rating || 0) >= 84 && (p.ovr || p.rating || 0) < 89);
      const standards = playersList.filter((p) => (p.ovr || p.rating || 0) < 84);

      let msg = '✅ JSON tuzilishi to‘g‘ri va eFootball 2026 talablariga to‘liq mos keladi!';
      if (epics.length === 0) {
        msg = "Ogohlantirish: Packda bitta ham Epic (89+) o‘yinchi yo‘q. Kamida 2-3 ta 89+ o‘yinchi tavsiya etiladi.";
      } else if (epics.length > 10 && playersList.length < 50) {
        msg = "Maslahat: Epiclar soni juda ko‘p. 100 talik qutida 3-5 ta Epic bo'lishi haqiqiy eFootball 2026 hissini beradi.";
      }

      setAiAnalysisResult({
        valid: true,
        totalPlayers: playersList.length,
        epicsCount: epics.length,
        highlightsCount: highlights.length,
        standardsCount: standards.length,
        message: msg
      });
    } catch (e: any) {
      setAiAnalysisResult({
        valid: false,
        totalPlayers: 0,
        epicsCount: 0,
        highlightsCount: 0,
        standardsCount: 0,
        message: `JSON sintaksisida xatolik: ${e.message}`
      });
    }
  };

  // Fayl yuklash (Drag & Drop va Manual tanlash)
  const handleFileUpload = (file: File) => {
    if (!file) return;
    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      alert("Iltimos, faqat .json kengaytmali fayl yuklang!");
      return;
    }

    setUploadedFileName(file.name);
    setUploadedFileSize((file.size / 1024).toFixed(1) + ' KB');

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setJsonInput(content);
      handleAiAnalyzeJson(content);
      sfxClick();
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Packni hisoblab o'yinga kiritish
  const handleApplyPackFromJson = () => {
    if (!aiAnalysisResult?.valid) return;
    try {
      const parsed = JSON.parse(jsonInput);
      const rawPlayers = Array.isArray(parsed) ? parsed : parsed.players;
      const formattedPlayers = rawPlayers.map((p: any, idx: number) => {
        const ovr = Number(p.ovr || p.rating || 80);
        return {
          id: p.id || `tg_player_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
          name: p.name || 'Noma‘lum Futbolchi',
          role: p.role || p.pos || 'CF',
          displayRole: p.role || p.pos || 'CF',
          naturalPositions: [p.role || 'CF'],
          family: 'ALL_ROUND',
          ovr,
          potential: Math.min(99, ovr + 4),
          nation: { name: p.nation || 'World', code: 'WLD', flag: '🌍' },
          club: p.club || 'eFootball Club',
          league: p.league || 'International',
          cardTier: ovr >= 89 ? 'legend' : ovr >= 84 ? 'show_time' : 'gold',
          trainingLevel: 1,
          maxLevel: 25,
          xp: 0,
          xpToNextLevel: 1000,
          marketValue: ovr * 50000,
          contractWeeks: 52,
          salary: 10000,
          form: 'A',
          morale: 'Yuqori',
          attrs: {
            pac: p.attrs?.pac ?? Math.min(99, ovr - 5),
            sho: p.attrs?.sho ?? Math.min(99, ovr - 6),
            pas: p.attrs?.pas ?? Math.min(99, ovr - 4),
            dri: p.attrs?.dri ?? Math.min(99, ovr - 3),
            def: p.attrs?.def ?? Math.max(40, ovr - 25),
            phy: p.attrs?.phy ?? Math.min(99, ovr - 8)
          },
          playStyle: ovr >= 89 ? 'Epic Phenomenon' : 'Texnik hujumchi',
          skills: ['First-time Shot', 'Speed Dribbling'],
          age: 26,
          foot: 'O‘ng',
          height: 182,
          weight: 78,
          injuryProne: 'Past',
          condition: 'Zo‘r',
          stamina: 100,
          avatar: p.avatar || {
            skinTone: p.skinTone || ['#fed7aa', '#f4caa1', '#e2b389', '#c88c5a', '#9f6b43', '#7c4c28'][idx % 6],
            hairStyle: p.hairStyle || (['short-fade', 'curls', 'buzz', 'parted', 'wavy-headband'][idx % 5] as any),
            hairColor: p.hairColor || (ovr >= 89 ? '#f59e0b' : '#1e293b'),
            facialHair: p.facialHair || (ovr >= 85 ? 'stubble' : 'none'),
            kitPrimaryColor: p.kitPrimaryColor || (ovr >= 89 ? '#f59e0b' : '#0284c7'),
            kitSecondaryColor: p.kitSecondaryColor || '#ffffff',
            likenessName: p.name ? p.name.toLowerCase().replace(/[^a-z0-9]/g, '_') : `tg_player_${idx}`
          }
        };
      });

      // Vaqt hisob-kitobi
      const now = Date.now();
      let startsAt = now;
      if (startType === '1h') startsAt = now + 3600000;
      else if (startType === '6h') startsAt = now + 6 * 3600000;
      else if (startType === '24h') startsAt = now + 24 * 3600000;
      else if (startType === 'custom' && customStartTime) {
        startsAt = new Date(customStartTime).getTime() || now;
      }

      let durationMs = 7 * 86400000; // default 7 kun
      if (expiryType === '1d') durationMs = 86400000;
      else if (expiryType === '3d') durationMs = 3 * 86400000;
      else if (expiryType === '7d') durationMs = 7 * 86400000;
      else if (expiryType === '14d') durationMs = 14 * 86400000;
      else if (expiryType === '30d') durationMs = 30 * 86400000;
      else if (expiryType === 'unlimited') durationMs = 365 * 86400000; // 1 yil

      const expiresAt = startsAt + durationMs;

      const newPack: SpecialPack = {
        id: `pack_tg_${Date.now()}`,
        name: packName || 'eFootball 2026 Special Box',
        badge: badgeType as any,
        description: packDescription,
        themeColor,
        startsAt,
        expiresAt,
        freePullsTotal: freePulls,
        freePullsRemaining: freePulls,
        costPer10,
        costPer1,
        players: formattedPlayers,
        originalPlayers: formattedPlayers,
        totalPoolCount: formattedPlayers.length,
        pulledCount: 0,
        createdAt: now,
        createdBy: 'Telegram Bot (Admin)'
      };

      onAddPack(newPack);
      sfxCardFlip();
      onClose();
    } catch (e: any) {
      alert(`Xatolik: ${e.message}`);
    }
  };

  // Google Apps Script Kod Shablonining to'liq kodi
  const GOOGLE_APPS_SCRIPT_CODE = `/**
 * =========================================================================
 * eFootball 2026 - Telegram Bot Webhook & AI Pack Manager
 * Token: ${activeToken}
 * =========================================================================
 * QO'LLANMA:
 * 1. script.google.com ga kiring va yangi loyiha yarating.
 * 2. Ushbu kodni Code.gs ga joylang va Saqlang (Ctrl+S).
 * 3. "Deploy" -> "New deployment" -> "Web app" ni tanlang.
 *    - Execute as: "Me"
 *    - Who has access: "Anyone"
 * 4. Berilgan Web App URL manzilini nusxalang.
 * 5. Brauzerda Webhook havolasini oching:
 *    https://api.telegram.org/bot${activeToken}/setWebhook?url=SIZNING_WEB_APP_URLINGIZ
 * =========================================================================
 */

const BOT_TOKEN = "${activeToken}";
const TELEGRAM_API = "https://api.telegram.org/bot" + BOT_TOKEN;

function doPost(e) {
  try {
    const update = JSON.parse(e.postData.contents);
    if (update.message) {
      handleMessage(update.message);
    } else if (update.callback_query) {
      handleCallback(update.callback_query);
    }
  } catch (err) {
    Logger.log("doPost Error: " + err);
  }
  return ContentService.createTextOutput("OK");
}

function handleMessage(msg) {
  const chatId = msg.chat.id;
  const text = msg.text || "";

  if (text === "/start") {
    const welcome = "⚽️ *eFootball™ 2026 Botiga Xush Kelibsiz!*\\n\\n" +
      "Bot orqali 100 talik pack JSON faylini olishingiz, vaqtini belgilashingiz va ilovaga kiritishingiz mumkin.";
    sendTelegramMessage(chatId, welcome);
  }
}

function sendTelegramMessage(chatId, text) {
  UrlFetchApp.fetch(TELEGRAM_API + "/sendMessage", {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify({ chat_id: chatId, text: text, parse_mode: "Markdown" }),
    muteHttpExceptions: true
  });
}
`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-3 sm:p-5 select-none overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-4xl bg-slate-900 border border-cyan-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-black uppercase tracking-wider mb-2">
              <Bot className="w-3.5 h-3.5" />
              <span>TELEGRAM BOT & FAYL QABUL QILISH TIZIMI</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span>eFootball 2026 Pack Menejeri</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              JSON fayl qabul qilish, vaqt va muddati taymerlari, himoyalangan token va AI tahlil markazi.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            aria-label="Yopish"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Xavfsiz Token & 24/7 Watchdog Holati Qatori */}
        <div className="px-6 py-3 bg-slate-950/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-slate-300">
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span className="text-slate-400">Bot Tokeni:</span>
              <code className="bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-700 font-mono text-cyan-300 flex items-center gap-2">
                <span>{showToken ? activeToken : maskToken(activeToken)}</span>
                <button
                  onClick={() => setShowToken(!showToken)}
                  className="text-slate-400 hover:text-white cursor-pointer ml-1"
                  title={showToken ? "Tokenni yashirish" : "Tokenni ko'rsatish"}
                >
                  {showToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </code>
            </div>

            {/* Live Watchdog Status Indicator */}
            <div className="flex items-center gap-2">
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold ${
                  botLiveStatus === 'online'
                    ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                    : botLiveStatus === 'checking'
                    ? 'bg-amber-950/70 border-amber-500/50 text-amber-300'
                    : 'bg-rose-950/70 border-rose-500/50 text-rose-300'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    botLiveStatus === 'online'
                      ? 'bg-emerald-400 animate-pulse'
                      : botLiveStatus === 'checking'
                      ? 'bg-amber-400 animate-ping'
                      : 'bg-rose-500'
                  }`}
                />
                <span>{botStatusDetail}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRestartBot}
              disabled={isRestartingBot}
              className="px-3 py-1 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 hover:text-white border border-cyan-700/50 text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              title="Botni qayta yoqish va 24/7 Watchdogni yangilash"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRestartingBot ? 'animate-spin' : ''}`} />
              <span>{isRestartingBot ? 'Yoqilmoqda...' : 'Botni Qayta Yoqish'}</span>
            </button>

            <button
              onClick={() => copyToClipboard(activeToken, setCopiedToken)}
              className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedToken ? 'Nusxalandi' : 'Nusxalash'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 bg-slate-900/50 overflow-x-auto">
          <button
            onClick={() => {
              sfxClick();
              setActiveTab('upload_json');
            }}
            className={`pb-3 px-3 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'upload_json'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Fayl Qabul Qilish & Vaqtni Sozlash</span>
          </button>

          <button
            onClick={() => {
              sfxClick();
              setActiveTab('ai_assistant');
            }}
            className={`pb-3 px-3 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'ai_assistant'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Kichik AI Yordamchi</span>
          </button>

          <button
            onClick={() => {
              sfxClick();
              setActiveTab('logs');
            }}
            className={`pb-3 px-3 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'logs'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Ochish Jurnali ({packLogs.length})</span>
          </button>

          <button
            onClick={() => {
              sfxClick();
              setActiveTab('google_script');
            }}
            className={`pb-3 px-3 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'google_script'
                ? 'border-blue-400 text-blue-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Google Script Kodi</span>
          </button>
        </div>

        {/* TAB 1: ASOSIY FAYL QABUL QILISH VA VAQTNI SOZLASH */}
        {activeTab === 'upload_json' && (
          <div className="p-6 overflow-y-auto space-y-5">
            {/* 1. Drag & Drop File Upload Area */}
            <div>
              <label className="text-xs font-bold text-slate-200 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FileUp className="w-4 h-4 text-amber-400" />
                  <span>JSON Fayl Qabul Qilish Tizimi (Telegram Bot Fayli):</span>
                </span>
                <span className="text-[11px] text-slate-400 font-normal">
                  .json faylni sudrab tashlang yoki tanlang
                </span>
              </label>

              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-6 rounded-2xl border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center text-center ${
                  uploadedFileName
                    ? 'border-emerald-500 bg-emerald-950/20'
                    : 'border-slate-700 bg-slate-950 hover:border-cyan-400 hover:bg-slate-900/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />

                {uploadedFileName ? (
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                    <div>
                      <p className="text-sm font-black text-white">{uploadedFileName}</p>
                      <p className="text-xs text-slate-400">Hajmi: {uploadedFileSize} • Muvaffaqiyatli qabul qilindi</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="mt-2 text-xs text-cyan-400 hover:text-cyan-300 underline font-bold"
                    >
                      Boshqa fayl tanlash
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-10 h-10 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                    <div>
                      <p className="text-sm font-bold text-white">
                        Telegram Botdan olingan <span className="text-amber-400">.json</span> faylni bu yerga tashlang
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">yoki kompyuterdan/telefondan faylni tanlash uchun bosing</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bir bosishda Telegram Namuna 100 talik packni yuklash */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Flame className="w-4 h-4 text-amber-400" />
                <span className="text-xs text-slate-300 font-bold">
                  Fayl qidirmasdan tayyor 100 talik packni yuklamoqchimisiz?
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const sample = JSON.stringify(RAW_100_PLAYERS_JSON_TEMPLATE, null, 2);
                  setJsonInput(sample);
                  setUploadedFileName('100_stars_mega_pack.json');
                  setUploadedFileSize('45.2 KB');
                  handleAiAnalyzeJson(sample);
                  sfxClick();
                }}
                className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors cursor-pointer"
              >
                ⚡️ 100 Talik Namuna Packni Yuklash
              </button>
            </div>

            {/* 2. Pack Asosiy Parametrlari */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Pack Nomi:
                </label>
                <input
                  type="text"
                  value={packName}
                  onChange={(e) => setPackName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-bold focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Nishon (Badge):
                </label>
                <select
                  value={badgeType}
                  onChange={(e) => setBadgeType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-bold focus:border-amber-400 focus:outline-none"
                >
                  <option value="EPIC">EPIC (Oltin)</option>
                  <option value="HIGHLIGHT">HIGHLIGHT (Moviy)</option>
                  <option value="SHOWTIME">SHOWTIME (Zangori)</option>
                  <option value="SPECIAL">SPECIAL (Binafsha)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Mavzu Rangi:
                </label>
                <select
                  value={themeColor}
                  onChange={(e) => setThemeColor(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-bold focus:border-amber-400 focus:outline-none"
                >
                  <option value="emerald">Yashil (Emerald)</option>
                  <option value="cyan">Moviy (Cyan)</option>
                  <option value="amber">Oltin (Amber)</option>
                  <option value="purple">Binafsha (Purple)</option>
                  <option value="rose">Qizil (Rose)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Bepul Ochishlar:
                </label>
                <select
                  value={freePulls}
                  onChange={(e) => setFreePulls(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-bold focus:border-amber-400 focus:outline-none"
                >
                  <option value={0}>0 ta (Faqat GP)</option>
                  <option value={3}>3 ta bepul</option>
                  <option value={5}>5 ta bepul</option>
                  <option value={10}>10 ta bepul</option>
                  <option value={20}>20 ta bepul</option>
                </select>
              </div>
            </div>

            {/* 3. Vaqt Sozlamalari (Taymer & Boshlanish/Tugash) */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-black uppercase text-white tracking-wider">
                  Vaqtni Mukammal Sozlash (Start & Expiry Timers)
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Qachon Faol Bo‘lsin?</span>
                  </label>
                  <select
                    value={startType}
                    onChange={(e) => setStartType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-bold focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="now">Darhol (Hozirning o‘zidayoq faol)</option>
                    <option value="1h">1 soatdan so‘ng boshlansin</option>
                    <option value="6h">6 soatdan so‘ng boshlansin</option>
                    <option value="24h">Ertaga (24 soatdan so‘ng)</option>
                    <option value="custom">Aniq sana va vaqtni kiritish</option>
                  </select>

                  {startType === 'custom' && (
                    <input
                      type="datetime-local"
                      value={customStartTime}
                      onChange={(e) => setCustomStartTime(e.target.value)}
                      className="w-full mt-2 px-3 py-1.5 bg-slate-900 border border-cyan-500/50 rounded-xl text-white text-xs font-bold focus:outline-none"
                    />
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>Amal Qilish Davomiyligi (Muddati):</span>
                  </label>
                  <select
                    value={expiryType}
                    onChange={(e) => setExpiryType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-bold focus:border-amber-400 focus:outline-none"
                  >
                    <option value="1d">24 Soat (1 kun)</option>
                    <option value="3d">3 kun</option>
                    <option value="7d">7 kun (1 hafta - standart)</option>
                    <option value="14d">14 kun (2 hafta)</option>
                    <option value="30d">30 kun (1 oy)</option>
                    <option value="unlimited">Cheksiz (Muddatsiz)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 4. JSON Matnini Ko'rish yoki Qo'lda Tahrirlash (Opsional) */}
            <details className="text-xs text-slate-400">
              <summary className="cursor-pointer hover:text-white font-bold mb-2">
                Qo‘lda JSON kodini ko‘rish yoki tahrirlash (Kengaytirish)
              </summary>
              <textarea
                rows={5}
                value={jsonInput}
                onChange={(e) => {
                  setJsonInput(e.target.value);
                  handleAiAnalyzeJson(e.target.value);
                }}
                placeholder="Fayl yuklanganda bu yerda JSON matni avtomatik paydo bo'ladi..."
                className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-cyan-300 font-mono text-xs focus:border-cyan-400 focus:outline-none"
              />
            </details>

            {/* AI Tekshiruv Natijasi */}
            {aiAnalysisResult && (
              <div
                className={`p-4 rounded-2xl border flex items-start gap-3 ${
                  aiAnalysisResult.valid
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
                }`}
              >
                {aiAnalysisResult.valid ? (
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="text-xs font-bold">{aiAnalysisResult.message}</div>
                  {aiAnalysisResult.valid && (
                    <div className="mt-1 flex flex-wrap gap-3 text-[11px] font-mono text-slate-300">
                      <span>Jami: <strong>{aiAnalysisResult.totalPlayers} ta o‘yinchi</strong></span>
                      <span>Epic (89+): <strong className="text-amber-300">{aiAnalysisResult.epicsCount} ta</strong></span>
                      <span>Highlight (84-88): <strong className="text-cyan-300">{aiAnalysisResult.highlightsCount} ta</strong></span>
                      <span>Standard: <strong>{aiAnalysisResult.standardsCount} ta</strong></span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* O'yinga joylash tugmasi */}
            <button
              onClick={handleApplyPackFromJson}
              disabled={!aiAnalysisResult?.valid}
              className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                aiAnalysisResult?.valid
                  ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 text-slate-950 shadow-lg shadow-amber-400/20 transform active:scale-98'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-50'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Packni O‘yinga Joylash (Barcha Foydalanuvchilar Uchun)</span>
            </button>
          </div>
        )}

        {/* TAB 2: KICHIK AI YORDAMCHI */}
        {activeTab === 'ai_assistant' && (
          <div className="p-6 overflow-y-auto space-y-5">
            <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 flex items-start gap-3">
              <Sparkles className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-black text-white">
                  Kichik AI Yordamchi Nimalar Qilib Bera Oladi?
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Ushbu AI modul Telegram bot orqali va ilovada packlarni yaratish, tahrirlash va eFootball 2026 talablari bo‘yicha tekshirishni to‘liq avtomatlashtiradi:
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-white">1. Avtomatik JSON Tekshiruvi</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Yuborilgan faylda xatolik, yetishmayotgan parametrlar (OVR, klub, pozitsiya) bo‘lsa bir zumda aniqlaydi.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-white">2. PES Ehtimollar Muvozanati</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Packda faqat Epic bo‘lib qolmasligi uchun 89+ (2.5%), 84-88 (15%) va 75-83 (82%) taqsimotini tavsiya etadi.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-white">3. Admin Uchun Doimiy Bepul Ochish</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Admin hisobidan GP talab qilinmaydi va 20 ta o‘yin sharti so‘ralmasdan xohlagancha sinab ko‘rish mumkin.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-white">4. Vaqt Va Muddati Boshqaruvi</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Qachon faol bo‘lishi (masalan 2 soatdan keyin) va necha kun davom etishini qulay hisoblab beradi.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: OCHISH JURNALI */}
        {activeTab === 'logs' && (
          <div className="p-6 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-white">
                  Foydalanuvchilarning Pack Ochish Tarixi
                </h3>
                <p className="text-xs text-slate-400">
                  Kim qachon qaysi packni ochganligi, GP sarflanishi va tushgan yulduzlar:
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-amber-300">
                Jami: {packLogs.length} ta ochilish
              </span>
            </div>

            {packLogs.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-800 rounded-3xl text-slate-400 text-xs">
                Hozircha hech kim pack ochmadi. Foydalanuvchilar yoki Admin pack ochganda barcha ma’lumotlar shu yerda paydo bo‘ladi.
              </div>
            ) : (
              <div className="space-y-2.5">
                {packLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{log.userName || log.userEmail}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-cyan-300">
                          {log.pullCount}x Ochish
                        </span>
                        {log.spentGp === 0 ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                            FREE / ADMIN
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono">
                            -{log.spentGp} GP
                          </span>
                        )}
                      </div>
                      <div className="text-slate-400 text-[11px] mt-0.5">
                        Pack: <strong className="text-slate-300">{log.packName}</strong> • {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto">
                      {log.pulledPlayers.slice(0, 4).map((p, idx) => (
                        <span
                          key={idx}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold font-mono ${
                            p.isEpic
                              ? 'bg-amber-400 text-slate-950'
                              : p.ovr >= 84
                              ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/30'
                              : 'bg-slate-900 text-slate-300'
                          }`}
                        >
                          {p.name} ({p.ovr})
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: GOOGLE APPS SCRIPT KODI */}
        {activeTab === 'google_script' && (
          <div className="p-6 overflow-y-auto space-y-4">
            <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/40">
              <h4 className="text-xs font-black uppercase text-blue-300 mb-1">
                📌 Google Apps Script Bo‘yicha Maslahat va Yechim:
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Google Apps Script 24/7 bepul ishlaydigan eng xavfsiz va qulay vositadir.
                Quyidagi tayyor kodni Google Apps Script'dagi <code>Code.gs</code> fayliga joylab, yangi Web App qilib chiqarsangiz, barcha inline tugmalar va JSON tekshirish botingizda bir zumda ishga tushadi.
              </p>
            </div>

            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-cyan-400" />
                  <span>Tayyor Google Apps Script (Code.gs) Kodi:</span>
                </span>
                <button
                  onClick={() => copyToClipboard(GOOGLE_APPS_SCRIPT_CODE, setCopiedScript)}
                  className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {copiedScript ? <Check className="w-4 h-4 text-emerald-950" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedScript ? 'Nusxalandi!' : 'Kodni Nusxalash'}</span>
                </button>
              </div>

              <pre className="p-4 bg-slate-950 border border-slate-800 rounded-2xl font-mono text-[11px] text-cyan-300 max-h-72 overflow-y-auto leading-relaxed">
                {GOOGLE_APPS_SCRIPT_CODE}
              </pre>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
