import React, { useState } from 'react';
import { motion } from 'motion/react';
import { SpecialPack, Player, RawJsonPackInput, RawJsonPlayerInput } from '../types';
import { getNationByName } from '../data/nations';
import { RAW_100_PLAYERS_JSON_TEMPLATE } from '../data/oneHundredPlayersPack';
import { sfxClick, sfxCardFlip, sfxWhistle } from '../utils/audio';
import { speakText } from '../utils/speech';
import {
  Upload,
  FileCode,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  Calendar,
  Gift,
  Coins,
  X,
  Code,
  Copy,
  Check,
  Eye,
  Play,
  RotateCcw,
  Clock
} from 'lucide-react';

interface AdminPackManagerProps {
  onAddPack: (newPack: SpecialPack) => void;
  onClose: () => void;
  onTestWalkout?: (player: Player) => void;
}

export const AdminPackManager: React.FC<AdminPackManagerProps> = ({
  onAddPack,
  onClose,
  onTestWalkout
}) => {
  const [jsonText, setJsonText] = useState(JSON.stringify(RAW_100_PLAYERS_JSON_TEMPLATE, null, 2));
  const [packName, setPackName] = useState(RAW_100_PLAYERS_JSON_TEMPLATE.packName);
  const [badge, setBadge] = useState<'EPIC' | 'SHOW TIME' | 'HIGHLIGHT' | 'SPECIAL'>('EPIC');
  const [durationDays, setDurationDays] = useState(7);
  const [freePulls, setFreePulls] = useState(10);
  const [costPer10, setCostPer10] = useState(1000);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('preview');
  const [testResult, setTestResult] = useState<Player | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const parsed = JSON.parse(text);
        setJsonText(JSON.stringify(parsed, null, 2));
        if (parsed.packName) setPackName(parsed.packName);
        if (parsed.badge) setBadge(parsed.badge);
        if (parsed.expiresInDays) setDurationDays(parsed.expiresInDays);
        if (parsed.freePulls) setFreePulls(parsed.freePulls);
        if (parsed.costPer10) setCostPer10(parsed.costPer10);

        setStatusMessage({ type: 'success', text: '100 ta o‘yinchi JSON fayli muvaffaqiyatli yuklandi!' });
        sfxCardFlip();
      } catch (err) {
        setStatusMessage({ type: 'error', text: 'JSON formati xato! Faylni tekshiring.' });
      }
    };
    reader.readAsText(file);
  };

  const handleLoad100Template = () => {
    sfxClick();
    setJsonText(JSON.stringify(RAW_100_PLAYERS_JSON_TEMPLATE, null, 2));
    setPackName(RAW_100_PLAYERS_JSON_TEMPLATE.packName);
    setBadge('EPIC');
    setDurationDays(7);
    setFreePulls(10);
    setCostPer10(1000);
    setStatusMessage({ type: 'success', text: '100 ta haqiqiy o‘yinchidan iborat PES namuna yuklandi!' });
  };

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(jsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const parseAndConvertPlayers = (): Player[] => {
    try {
      const parsed: RawJsonPackInput = JSON.parse(jsonText);
      const playersList: RawJsonPlayerInput[] = parsed.players || (Array.isArray(parsed) ? parsed : []);

      return playersList.map((p, idx) => {
        const ovr = Number(p.ovr) || 85;
        const role = p.role || 'CF';
        const isEpic = ovr >= 89;

        const baseAttrs = {
          pac: p.attrs?.pac ?? Math.min(99, Math.max(70, ovr - 4)),
          sho: p.attrs?.sho ?? Math.min(99, Math.max(65, role === 'CF' ? ovr + 2 : ovr - 8)),
          pas: p.attrs?.pas ?? Math.min(99, Math.max(65, ovr - 5)),
          dri: p.attrs?.dri ?? Math.min(99, Math.max(68, ovr - 4)),
          def: p.attrs?.def ?? Math.min(99, Math.max(35, ['CB', 'LB', 'RB', 'DMF'].includes(role) ? ovr + 4 : 42)),
          phy: p.attrs?.phy ?? Math.min(99, Math.max(60, ovr - 6))
        };

        return {
          id: `custom_${Date.now()}_${idx}_${(p.name || 'player').replace(/\s+/g, '_').toLowerCase()}`,
          name: p.name || `Futbolchi #${idx + 1}`,
          role: role,
          displayRole: role,
          naturalPositions: [role],
          family: (['GK'].includes(role) ? 'GK' : ['CB', 'LB', 'RB'].includes(role) ? 'DF' : ['DMF', 'CMF', 'AMF'].includes(role) ? 'MF' : 'FW') as any,
          ovr: ovr,
          potential: Math.min(99, ovr + 2),
          nation: getNationByName(p.nation || 'Angliya'),
          club: p.club || 'Elit Klub',
          league: p.league || 'Top Liga',
          cardTier: isEpic ? 'legend' : ovr >= 85 ? 'toty' : 'gold',
          attrs: baseAttrs,
          avatar: {
            skinTone: '#f4caa1',
            hairStyle: 'short-fade',
            hairColor: '#1c1917',
            facialHair: 'stubble',
            kitPrimaryColor: isEpic ? '#f59e0b' : '#1e3a8a',
            kitSecondaryColor: '#ffffff'
          },
          playStyle: isEpic ? 'Texnik sehrgar' : 'Tezkor hujumchi',
          skills: ['Speed Dribbling', 'First-time Shot'],
          age: 26,
          foot: 'O‘ng',
          height: 183,
          weight: 77,
          form: 95,
          condition: 92,
          marketValue: ovr * 750000,
          level: 20,
          xp: 0,
          stamina: 100
        };
      });
    } catch (e) {
      return [];
    }
  };

  // Simulate PES probability pull test
  const handleTestDraw = () => {
    const list = parseAndConvertPlayers();
    if (list.length === 0) return;

    sfxWhistle();
    // Haqiqiy Omadli Box Draw Lotereyasi:
    const epics = list.filter((p) => p.ovr >= 89);
    const highlights = list.filter((p) => p.ovr >= 84 && p.ovr < 89);

    const luckRoll = Math.random() * 100;
    let chosen: Player;

    if (epics.length > 0 && luckRoll <= 12.0) {
      chosen = epics[Math.floor(Math.random() * epics.length)];
    } else if (highlights.length > 0 && luckRoll <= 38.0) {
      chosen = highlights[Math.floor(Math.random() * highlights.length)];
    } else {
      chosen = list[Math.floor(Math.random() * list.length)];
    }

    setTestResult(chosen);
    if (chosen.ovr >= 89 && onTestWalkout) {
      onTestWalkout(chosen);
    }
  };

  const handleCreatePack = () => {
    sfxClick();
    try {
      const parsed: RawJsonPackInput = JSON.parse(jsonText);
      const convertedPlayers = parseAndConvertPlayers();

      if (!convertedPlayers.length) {
        setStatusMessage({ type: 'error', text: 'JSON faylda futbolchilar ro‘yxati (players) topilmadi!' });
        return;
      }

      const newPack: SpecialPack = {
        id: `pack_${Date.now()}`,
        name: parsed.packName || packName,
        badge: parsed.badge || badge,
        description: parsed.description || `${convertedPlayers.length} ta yulduz futbolchi to‘plami (eFootball 2026 formatida).`,
        themeColor: badge === 'EPIC' ? 'gold' : 'cyan',
        expiresAt: Date.now() + (parsed.expiresInDays || durationDays) * 24 * 60 * 60 * 1000,
        freePullsTotal: parsed.freePulls || freePulls,
        freePullsRemaining: parsed.freePulls || freePulls,
        costPer10: parsed.costPer10 || costPer10,
        costPer1: Math.round((parsed.costPer10 || costPer10) / 10),
        players: convertedPlayers,
        totalPoolCount: convertedPlayers.length,
        pulledCount: 0,
        createdAt: Date.now(),
        createdBy: 'Bosh Admin'
      };

      onAddPack(newPack);
      speakText(`Yangi maxsus pack muvaffaqiyatli qo‘shildi!`);
      setStatusMessage({ type: 'success', text: `Tabriklaymiz! "${newPack.name}" qo‘shildi!` });

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `Xatolik: ${err.message || 'JSON formati noto‘g‘ri'}` });
    }
  };

  const currentParsedPlayers = parseAndConvertPlayers();
  const epicCount = currentParsedPlayers.filter((p) => p.ovr >= 89).length;
  const highlightCount = currentParsedPlayers.filter((p) => p.ovr >= 84 && p.ovr < 89).length;
  const standardCount = currentParsedPlayers.filter((p) => p.ovr < 84).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative max-w-4xl w-full bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">
                Maxsus Pack Boshqaruvi & JSON Namunasi
              </h2>
              <p className="text-xs text-slate-400">
                100 talik pack namunasi, ko‘rinishi, vaqti va PES ehtimollik tizimini sinash
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle: Preview vs JSON Editor */}
        <div className="flex items-center gap-3 mt-4 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Pack Ko‘rinishi & Sinash (Live Preview)</span>
          </button>

          <button
            onClick={() => setActiveTab('editor')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'editor'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Code className="w-4 h-4" />
            <span>JSON Kod Muharriri (100 ta O‘yinchi)</span>
          </button>

          <button
            onClick={handleLoad100Template}
            className="ml-auto px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-amber-300 border border-amber-400/30 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>100 ta O‘yinchi Standartini Yuklash</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {statusMessage && (
            <div
              className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-red-500/20 text-red-300 border border-red-500/40'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{statusMessage.text}</span>
            </div>
          )}

          {activeTab === 'preview' ? (
            /* ================= LIVE PACK PREVIEW & SIMULATION ================= */
            <div className="space-y-4">
              {/* Pack Simulation Card */}
              <div className="rounded-3xl border border-amber-400/50 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-6 relative overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider">
                      {badge}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-mono font-bold">
                      100 BOX DRAW
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/80 border border-slate-700 text-amber-300 text-xs font-mono font-bold">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{durationDays} kun qoldi</span>
                  </div>
                </div>

                <h3 className="text-2xl font-black text-white">{packName}</h3>
                <p className="text-xs text-slate-300 mt-1 max-w-xl">
                  {currentParsedPlayers.length} ta haqiqiy o‘yinchi. PES ehtimollik qoidalari asosida Epic tushishi juda qiyin qilib sozlangan.
                </p>

                {/* Pool Counts & Odds Grid */}
                <div className="grid grid-cols-3 gap-3 my-4">
                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-amber-500/40 text-center">
                    <div className="text-[10px] uppercase font-bold text-amber-400">Epic (89+)</div>
                    <div className="text-base font-black text-white">{epicCount} ta futbolchi</div>
                    <div className="text-[10px] text-amber-300 font-mono">
                      ~{currentParsedPlayers.length > 0 ? ((epicCount / currentParsedPlayers.length) * 100).toFixed(1) : '0'}% + Omad Zarb
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-cyan-500/40 text-center">
                    <div className="text-[10px] uppercase font-bold text-cyan-400">Highlight (84-88)</div>
                    <div className="text-base font-black text-white">{highlightCount} ta futbolchi</div>
                    <div className="text-[10px] text-cyan-300 font-mono">
                      ~{currentParsedPlayers.length > 0 ? ((highlightCount / currentParsedPlayers.length) * 100).toFixed(1) : '0'}%
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-700 text-center">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Standard (75-83)</div>
                    <div className="text-base font-black text-white">{standardCount} ta futbolchi</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      ~{currentParsedPlayers.length > 0 ? ((standardCount / currentParsedPlayers.length) * 100).toFixed(1) : '0'}%
                    </div>
                  </div>
                </div>

                {/* Preview Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <span>Bepul urinish: <strong className="text-emerald-400">{freePulls} ta FREE</strong></span>
                    <span>•</span>
                    <span>10 talik: <strong className="text-amber-300">{costPer10} GP</strong> (20 g‘alaba)</span>
                  </div>

                  {/* Test Draw Button */}
                  <button
                    onClick={handleTestDraw}
                    className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Sinov Tariqasida Ochib Ko‘rish (Test Draw)</span>
                  </button>
                </div>
              </div>

              {/* Test Draw Result Banner */}
              {testResult && (
                <div className="p-4 rounded-2xl bg-slate-950/90 border border-cyan-500/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-lg font-black text-amber-300">
                      {testResult.ovr}
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Sinov natijasi (Tushgan futbolchi):</div>
                      <div className="text-sm font-black text-white flex items-center gap-2">
                        <span>{testResult.name}</span>
                        {testResult.ovr >= 89 && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-amber-400 text-slate-950">
                            ★ EPIC (89+)
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {testResult.role} • {testResult.club} • {testResult.nation?.name}
                      </div>
                    </div>
                  </div>

                  {testResult.ovr >= 89 && (
                    <button
                      onClick={() => onTestWalkout && onTestWalkout(testResult)}
                      className="px-3 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs uppercase"
                    >
                      Epic Animatsiyasini Ko‘rish
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* ================= JSON EDITOR & UPLOAD ================= */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-cyan-400" />
                  <span>100 ta O‘yinchi JSON Kiritish yoki Fayl Yuklash:</span>
                </label>

                <div className="flex items-center gap-2">
                  <label className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 cursor-pointer flex items-center gap-1.5 border border-slate-700">
                    <Upload className="w-3.5 h-3.5" />
                    <span>JSON Fayl Tanlash (.json)</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  <button
                    onClick={handleCopyTemplate}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Nusxalandi!' : 'JSON Nusxalash'}</span>
                  </button>
                </div>
              </div>

              <textarea
                rows={12}
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-cyan-300 font-mono text-xs focus:outline-none focus:border-cyan-400 resize-none leading-relaxed"
                spellCheck={false}
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Jami: <strong className="text-white">{currentParsedPlayers.length} ta futbolchi</strong> tayyorlandi
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
            >
              Bekor Qilish
            </button>

            <button
              onClick={handleCreatePack}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 cursor-pointer transition-transform transform active:scale-95"
            >
              <Sparkles className="w-4 h-4 fill-current" />
              <span>Packni Rasman Qo‘shish</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
