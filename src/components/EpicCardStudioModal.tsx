import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Player,
  SpecialPack,
  CardTier,
  CardBackgroundTheme,
  PlayStyle,
  PositionRole,
  CardDesignTemplate
} from '../types';
import { FutCard, CARD_BG_THEMES } from './FutCard';
import { NATIONS_DATABASE as NATIONS, getNationByName } from '../data/nations';
import { sfxClick, sfxCardFlip, sfxWhistle } from '../utils/audio';
import {
  getSavedCardDesigns,
  saveCardDesign,
  deleteCardDesign,
  exportCardDesignsToJson,
  importCardDesignsFromJson
} from '../utils/cardDesignStore';
import {
  Sparkles,
  X,
  Award,
  Video,
  Layers,
  Palette,
  Check,
  Zap,
  PlusCircle,
  Package,
  Shield,
  Eye,
  Sliders,
  UserCheck,
  Upload,
  Image as ImageIcon,
  RotateCcw,
  ZoomIn,
  Move,
  Link as LinkIcon,
  Film,
  Bookmark,
  Download,
  Trash2,
  Copy
} from 'lucide-react';

interface EpicCardStudioModalProps {
  packs: SpecialPack[];
  onSavePlayerToPack: (player: Player, targetPackId?: string, newPackName?: string) => void;
  onSavePlayerToSquad: (player: Player) => void;
  onTestWalkout: (player: Player) => void;
  onClose: () => void;
}

const PLAYSTYLES: PlayStyle[] = [
  'Tezkor hujumchi',
  'Jarima maydoni ovchisi',
  'Ijodkor pleymeyker',
  'To‘p qaytaruvchi',
  'Box-to-box',
  'Texnik qanot',
  'Tezkor qanot',
  'Himoyaviy tayanch',
  'Pas ustasi',
  'Klassik himoyachi',
  'Darvoza qo‘riqchisi',
  'Pressing mutaxassisi',
  'Uzoq zarba ustasi',
  'Erkin rol',
  'Qanotdan ichkariga kiruvchi',
  'Chuqur pleymeyker',
  'Tezkor himoyachi',
  'Sovuqqon ijodkor',
  'Texnik sehrgar',
  'Texnik kuchli dribling'
];

const ROLES: PositionRole[] = [
  'CF',
  'SS',
  'LWF',
  'RWF',
  'AMF',
  'CMF',
  'DMF',
  'LB',
  'RB',
  'CB',
  'GK'
];

const VIDEO_PRESETS = [
  { id: 'epic-gold', name: '🌟 Konami Epic Golden Dust (Oltin Zarrachalar)', color: 'text-amber-400' },
  { id: 'cosmic-lightning', name: '⚡ Cosmic Electric Lightning (Moviy Chaqmoq)', color: 'text-cyan-400' },
  { id: 'magma-fire', name: '🔥 Magma Fire Explosion (Olovli Lava)', color: 'text-orange-400' },
  { id: 'stadium-tunnel', name: '🏟️ Cyber Stadium Tunnel (Tungi Projektor)', color: 'text-slate-200' }
];

const BOOSTER_PRESETS = [
  '+2 Ball-carrying',
  '+3 Shooting',
  '+2 Speed & Acceleration',
  'Phenomenal Finishing',
  'Fortress (Himoya Devori)',
  'Momentum Dribbling',
  'Blitz Curler (Aylanma Zarba)',
  '+2 Physical Contact',
  'Edge Turning',
  'ShowTime Captain'
];

export const EpicCardStudioModal: React.FC<EpicCardStudioModalProps> = ({
  packs,
  onSavePlayerToPack,
  onSavePlayerToSquad,
  onTestWalkout,
  onClose
}) => {
  // Player Base State
  const [name, setName] = useState('Lionel Messi');
  const [ovr, setOvr] = useState(97);
  const [role, setRole] = useState<PositionRole>('CF');
  const [cardTier, setCardTier] = useState<CardTier>('legend');
  const [nationName, setNationName] = useState('Argentina');
  const [club, setClub] = useState('Inter Miami / FC Barcelona');
  const [playStyle, setPlayStyle] = useState<PlayStyle>('Ijodkor pleymeyker');
  const [boosterSkill, setBoosterSkill] = useState('+2 Ball-carrying');
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');
  const [customBadgeUrl, setCustomBadgeUrl] = useState('');
  const [renderMode, setRenderMode] = useState<'full' | 'circle'>('full');

  // Canva Fine-Tuning State
  const [photoScale, setPhotoScale] = useState(1);
  const [photoOffsetX, setPhotoOffsetX] = useState(0);
  const [photoOffsetY, setPhotoOffsetY] = useState(0);

  // Background & Video FX State
  const [cardBackgroundVideo, setCardBackgroundVideo] = useState('epic-gold');
  const [cardBackgroundTheme, setCardBackgroundTheme] = useState<CardBackgroundTheme>('auto');
  const [customVideoUrl, setCustomVideoUrl] = useState('');
  const [videoOpacity, setVideoOpacity] = useState(0.65);

  // Saved Card Designs & Presets State
  const [savedDesigns, setSavedDesigns] = useState<CardDesignTemplate[]>(() => getSavedCardDesigns());
  const [templateNameInput, setTemplateNameInput] = useState('');
  const [designFeedback, setDesignFeedback] = useState<string | null>(null);

  // Attributes
  const [pac, setPac] = useState(94);
  const [sho, setSho] = useState(96);
  const [pas, setPas] = useState(95);
  const [dri, setDri] = useState(98);
  const [def, setDef] = useState(45);
  const [phy, setPhy] = useState(78);

  // Pack Destination Selection
  const [destMode, setDestMode] = useState<'existing_pack' | 'new_pack' | 'squad'>('existing_pack');
  const [selectedPackId, setSelectedPackId] = useState<string>(packs[0]?.id || '');
  const [newPackName, setNewPackName] = useState('Epic Afsonalar To‘plami');

  const [activeTab, setActiveTab] = useState<'info' | 'canva' | 'designs' | 'stats' | 'background' | 'destination'>('info');

  // Dizayn shablonini saqlash
  const handleSaveCurrentDesign = (customName?: string) => {
    sfxClick();
    const finalName = (customName || templateNameInput || `${name || 'Epic'} Maxsus Dizayni`).trim();
    if (!finalName) return;

    const newTemplate = saveCardDesign({
      name: finalName,
      cardTier,
      cardBackgroundTheme,
      cardBackgroundVideo: customVideoUrl.trim() || cardBackgroundVideo,
      videoOpacity,
      renderMode,
      customPhotoUrl: customPhotoUrl.trim() || undefined,
      customBadgeUrl: customBadgeUrl.trim() || undefined,
      photoScale,
      photoOffsetX,
      photoOffsetY,
      boosterSkill: boosterSkill.trim() || undefined,
      club,
      league: 'Elite League'
    });

    setSavedDesigns(getSavedCardDesigns());
    setTemplateNameInput('');
    setDesignFeedback(`✅ "${finalName}" muvaffaqiyatli saqlandi!`);
    setTimeout(() => setDesignFeedback(null), 4000);
  };

  // Saqlangan dizaynni joriy kartaga qo'llash (Apply)
  const handleApplyDesign = (template: CardDesignTemplate) => {
    sfxClick();
    setCardTier(template.cardTier);
    if (template.cardBackgroundTheme) setCardBackgroundTheme(template.cardBackgroundTheme);
    if (template.cardBackgroundVideo) {
      if (template.cardBackgroundVideo.startsWith('http') || template.cardBackgroundVideo.startsWith('blob:')) {
        setCustomVideoUrl(template.cardBackgroundVideo);
      } else {
        setCardBackgroundVideo(template.cardBackgroundVideo);
        setCustomVideoUrl('');
      }
    }
    if (typeof template.videoOpacity === 'number') setVideoOpacity(template.videoOpacity);
    if (template.renderMode) setRenderMode(template.renderMode);
    if (template.customPhotoUrl) setCustomPhotoUrl(template.customPhotoUrl);
    if (template.customBadgeUrl) setCustomBadgeUrl(template.customBadgeUrl);
    if (typeof template.photoScale === 'number') setPhotoScale(template.photoScale);
    if (typeof template.photoOffsetX === 'number') setPhotoOffsetX(template.photoOffsetX);
    if (typeof template.photoOffsetY === 'number') setPhotoOffsetY(template.photoOffsetY);
    if (template.boosterSkill) setBoosterSkill(template.boosterSkill);
    if (template.club) setClub(template.club);

    setDesignFeedback(`🎨 "${template.name}" dizayni joriy kartaga qo‘llanildi!`);
    setTimeout(() => setDesignFeedback(null), 3500);
  };

  // Dizaynni o'chirish
  const handleDeleteDesign = (id: string, designName: string) => {
    sfxClick();
    const updated = deleteCardDesign(id);
    setSavedDesigns(updated);
    setDesignFeedback(`🗑️ "${designName}" shabloni o‘chirildi.`);
    setTimeout(() => setDesignFeedback(null), 3000);
  };

  // JSON eksport
  const handleExportDesignsJson = () => {
    sfxClick();
    const jsonStr = exportCardDesignsToJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `efootball_card_designs_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setDesignFeedback('📥 Dizaynlar JSON fayl sifatida yuklandi!');
    setTimeout(() => setDesignFeedback(null), 3000);
  };

  // JSON import
  const handleImportDesignsJson = (file: File) => {
    sfxClick();
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const res = importCardDesignsFromJson(e.target.result as string);
        if (res.success) {
          setSavedDesigns(getSavedCardDesigns());
          setDesignFeedback(`✅ ${res.count} ta yangi dizayn muvaffaqiyatli import qilindi!`);
        } else {
          setDesignFeedback(`❌ Xatolik: ${res.error}`);
        }
        setTimeout(() => setDesignFeedback(null), 4000);
      }
    };
    reader.readAsText(file);
  };

  // Fayl yuklash helperlari
  const handlePhotoFileUpload = (file: File) => {
    if (!file) return;
    sfxClick();
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setCustomPhotoUrl(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBadgeFileUpload = (file: File) => {
    if (!file) return;
    sfxClick();
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setCustomBadgeUrl(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleVideoFileUpload = (file: File) => {
    if (!file) return;
    sfxClick();
    const url = URL.createObjectURL(file);
    setCustomVideoUrl(url);
  };

  const handleResetCanva = () => {
    sfxClick();
    setPhotoScale(1);
    setPhotoOffsetX(0);
    setPhotoOffsetY(0);
  };

  // Auto balance attributes based on rating and role
  const handleAutoAttrs = () => {
    sfxClick();
    if (role === 'GK') {
      setPac(Math.max(50, Math.round(ovr * 0.65)));
      setSho(50);
      setPas(Math.max(60, Math.round(ovr * 0.8)));
      setDri(55);
      setDef(Math.max(70, Math.round(ovr * 0.95)));
      setPhy(Math.max(75, Math.round(ovr * 0.9)));
    } else if (['CB', 'LB', 'RB', 'DMF'].includes(role)) {
      setPac(Math.max(65, Math.round(ovr * 0.88)));
      setSho(Math.max(50, Math.round(ovr * 0.65)));
      setPas(Math.max(65, Math.round(ovr * 0.84)));
      setDri(Math.max(65, Math.round(ovr * 0.82)));
      setDef(Math.max(80, Math.min(99, Math.round(ovr * 1.02))));
      setPhy(Math.max(75, Math.min(99, Math.round(ovr * 0.96))));
    } else {
      setPac(Math.max(75, Math.min(99, Math.round(ovr * 0.96))));
      setSho(Math.max(75, Math.min(99, Math.round(ovr * 0.98))));
      setPas(Math.max(70, Math.min(99, Math.round(ovr * 0.92))));
      setDri(Math.max(75, Math.min(99, Math.round(ovr * 0.99))));
      setDef(Math.max(35, Math.round(ovr * 0.5)));
      setPhy(Math.max(65, Math.min(99, Math.round(ovr * 0.84))));
    }
  };

  // Compile full player object for live preview
  const livePlayer: Player = {
    id: `custom_epic_${name.replace(/\s+/g, '_').toLowerCase()}`,
    name,
    ovr,
    role,
    displayRole: role,
    naturalPositions: [role],
    family: role === 'GK' ? 'GK' : ['CB', 'LB', 'RB'].includes(role) ? 'DF' : ['DMF', 'CMF', 'AMF'].includes(role) ? 'MF' : 'FW',
    potential: Math.min(108, ovr + 3),
    nation: getNationByName(nationName),
    club,
    league: 'Elite International',
    cardTier,
    cardBackgroundTheme,
    cardBackgroundVideo: customVideoUrl.trim() || cardBackgroundVideo,
    videoOpacity,
    renderMode,
    boosterSkill: boosterSkill.trim() || undefined,
    customPhotoUrl: customPhotoUrl.trim() || undefined,
    customBadgeUrl: customBadgeUrl.trim() || undefined,
    photoScale,
    photoOffsetX,
    photoOffsetY,
    attrs: {
      pac,
      sho,
      pas,
      dri,
      def,
      phy
    },
    playStyle,
    skills: boosterSkill ? [boosterSkill, 'Double Touch', 'Through Passing'] : ['Double Touch', 'Through Passing'],
    age: 28,
    foot: 'O‘ng',
    height: 180,
    weight: 75,
    form: 8,
    condition: 100,
    marketValue: ovr * 1_200_000,
    level: 1,
    xp: 0
  };

  const handleSave = () => {
    sfxWhistle();
    if (destMode === 'squad') {
      onSavePlayerToSquad(livePlayer);
    } else if (destMode === 'new_pack') {
      onSavePlayerToPack(livePlayer, undefined, newPackName);
    } else {
      onSavePlayerToPack(livePlayer, selectedPackId);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-5xl h-[92vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white"
      >
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-400 flex items-center justify-center border border-amber-400/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>Epic & Futbolchi Card Studio</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-400 text-slate-950">
                  PRO
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Maxsus video fonlar, eFootball 2026 kartalari va packlarga biriktirish markazi
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content: Left Studio Tabs + Right Live Card Preview */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Left Form Controls (7 cols) */}
          <div className="lg:col-span-7 flex flex-col border-r border-slate-800 h-full overflow-hidden bg-slate-900/50">
            {/* Minimal Sub-Tabs */}
            <div className="flex items-center gap-1 p-3 border-b border-slate-800/80 bg-slate-950/30 overflow-x-auto text-xs">
              <button
                onClick={() => { sfxClick(); setActiveTab('info'); }}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'info'
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white bg-slate-800/50'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>1. Ma'lumotlar</span>
              </button>

              <button
                onClick={() => { sfxClick(); setActiveTab('canva'); }}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'canva'
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white bg-slate-800/50'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>2. Canva & Rasm</span>
              </button>

              <button
                onClick={() => { sfxClick(); setActiveTab('designs'); }}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'designs'
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white bg-slate-800/50'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>3. Dizaynlar Shablonlari</span>
                <span className="px-1.5 py-0.2 rounded-full bg-slate-700 text-[10px] font-mono text-amber-300">
                  {savedDesigns.length}
                </span>
              </button>

              <button
                onClick={() => { sfxClick(); setActiveTab('stats'); }}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'stats'
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white bg-slate-800/50'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>4. Ko'rsatkichlar</span>
              </button>

              <button
                onClick={() => { sfxClick(); setActiveTab('background'); }}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'background'
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white bg-slate-800/50'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>5. Fon & Video FX</span>
              </button>

              <button
                onClick={() => { sfxClick(); setActiveTab('destination'); }}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'destination'
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white bg-slate-800/50'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>6. Pack Tanlash</span>
              </button>
            </div>

            {/* Scrollable Tab Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* TAB 1: PLAYER INFO */}
              {activeTab === 'info' && (
                <div className="space-y-4">
                  {/* Name & OVR */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">
                        Futbolchi Ism-Familiyasi
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm font-bold text-white focus:border-amber-400 outline-none"
                        placeholder="Masalan: Cristiano Ronaldo"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-slate-400">OVR (Reyting)</label>
                        <span className="text-xs font-black text-amber-300 font-mono">{ovr}</span>
                      </div>
                      <input
                        type="range"
                        min={75}
                        max={105}
                        value={ovr}
                        onChange={e => setOvr(Number(e.target.value))}
                        className="w-full accent-amber-400 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Role & Card Tier */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">
                        Pozitsiya (Role)
                      </label>
                      <select
                        value={role}
                        onChange={e => setRole(e.target.value as PositionRole)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-white focus:border-amber-400 outline-none"
                      >
                        {ROLES.map(r => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">
                        Karta Toifasi (Tier / Rarity)
                      </label>
                      <select
                        value={cardTier}
                        onChange={e => setCardTier(e.target.value as CardTier)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-white focus:border-amber-400 outline-none"
                      >
                        <option value="legend">👑 Epic Afsona (Konami Gold)</option>
                        <option value="goat">⭐ GOAT Afsona (Oltin)</option>
                        <option value="toty">💎 TOTY Elita (Moviy Kristall)</option>
                        <option value="emerald">🌟 ShowTime / Kelajak Yulduzi</option>
                        <option value="gold">🥇 Highlight (Oltin)</option>
                        <option value="silver">⚽ Standard (Oddiy)</option>
                      </select>
                    </div>
                  </div>

                  {/* Nation & Club */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">Davlat</label>
                      <select
                        value={nationName}
                        onChange={e => setNationName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-white focus:border-amber-400 outline-none"
                      >
                        {NATIONS.map(n => (
                          <option key={n.code} value={n.name}>
                            {n.flag} {n.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">Klub</label>
                      <input
                        type="text"
                        value={club}
                        onChange={e => setClub(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-white focus:border-amber-400 outline-none"
                        placeholder="Masalan: Real Madrid"
                      />
                    </div>
                  </div>

                  {/* PlayStyle & Booster Skill */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">
                        O‘yin Uslubi (Playstyle)
                      </label>
                      <select
                        value={playStyle}
                        onChange={e => setPlayStyle(e.target.value as PlayStyle)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-white focus:border-amber-400 outline-none"
                      >
                        {PLAYSTYLES.map(p => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">
                        Booster Qobiliyati
                      </label>
                      <input
                        type="text"
                        value={boosterSkill}
                        onChange={e => setBoosterSkill(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-amber-300 focus:border-amber-400 outline-none"
                        placeholder="Masalan: +2 Ball-carrying"
                      />
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {BOOSTER_PRESETS.slice(0, 4).map(b => (
                          <button
                            key={b}
                            onClick={() => setBoosterSkill(b)}
                            className="px-2 py-0.5 rounded text-[9px] bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                          >
                            {b}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Quick Photo / Canva Shortcut */}
                  <div className="p-3 rounded-2xl bg-slate-950/40 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">Rasm va Emblem Sozlamalari</span>
                        <span className="text-[10px] text-slate-400">
                          {customPhotoUrl ? 'Maxsus foto yuklangan' : 'Standart 3D avatar faol'}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => { sfxClick(); setActiveTab('canva'); }}
                      className="px-3 py-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                      <span>Canva Sozlamalariga O'tish</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: CANVA & RASM SOZLASH */}
              {activeTab === 'canva' && (
                <div className="space-y-4">
                  {/* Render Mode Toggle: Full Body PNG vs Circle Avatar */}
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <span className="font-bold text-xs text-white flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-amber-400" />
                      Karta Bo‘ylab Ko‘rinish Uslubi (Render Mode)
                    </span>
                    <p className="text-[10px] text-slate-400">
                      Futbolchi rasmini to‘liq karta bo‘ylab yoki dumaloq avatar shaklida ko‘rsatish
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => { sfxClick(); setRenderMode('full'); }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                          renderMode === 'full'
                            ? 'bg-amber-400/20 border-amber-400 text-white shadow-lg'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-black text-xs text-amber-300">🖼️ Butun Karta PNG Render</span>
                          {renderMode === 'full' && <Check className="w-4 h-4 text-amber-400" />}
                        </div>
                        <p className="text-[10px] text-slate-400 leading-tight">
                          Shaffof fonli PNG rasm butun karta bo‘ylab tana va libos bilan aks etadi (Big Time & Epic uslubi)
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => { sfxClick(); setRenderMode('circle'); }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                          renderMode === 'circle'
                            ? 'bg-cyan-400/20 border-cyan-400 text-white shadow-lg'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-black text-xs text-cyan-300">🔘 Dumaloq Avatar (Portret)</span>
                          {renderMode === 'circle' && <Check className="w-4 h-4 text-cyan-400" />}
                        </div>
                        <p className="text-[10px] text-slate-400 leading-tight">
                          Faqat markaziy dumaloq oltin ramka ichida portret yuz qismi ko‘rinadi
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Player Photo Upload & Link */}
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-xs text-white flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                          Futbolchi Rasmi (Avatar / Foto)
                        </span>
                        <p className="text-[10px] text-slate-400">
                          Faylni sudrab tashlang, qurilmadan tanlang yoki to'g'ridan-to'g'ri rasm havolasini kiriting
                        </p>
                      </div>
                      {customPhotoUrl && (
                        <button
                          onClick={() => { sfxClick(); setCustomPhotoUrl(''); handleResetCanva(); }}
                          className="text-[10px] text-rose-400 hover:text-rose-300 font-bold px-2 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 cursor-pointer"
                        >
                          Tozalash
                        </button>
                      )}
                    </div>

                    {/* Drag and Drop Zone */}
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (e.dataTransfer.files?.[0]) {
                          handlePhotoFileUpload(e.dataTransfer.files[0]);
                        }
                      }}
                      className="border-2 border-dashed border-slate-700 hover:border-amber-400/70 rounded-2xl p-4 text-center bg-slate-900/40 transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer relative group"
                      onClick={() => {
                        const input = document.getElementById('player-photo-input') as HTMLInputElement;
                        input?.click();
                      }}
                    >
                      <input
                        id="player-photo-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handlePhotoFileUpload(e.target.files[0]);
                          }
                        }}
                      />
                      <div className="w-10 h-10 rounded-full bg-amber-400/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">
                          Rasm faylini yuklash uchun bosing yoki shu yerga tashlang
                        </span>
                        <span className="text-[10px] text-slate-400">
                          PNG, JPG, WEBP yoki SVG (tiniq fonli rasm tavsiya etiladi)
                        </span>
                      </div>
                    </div>

                    {/* Alternative: Link Input */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1 flex items-center gap-1">
                        <LinkIcon className="w-3 h-3 text-cyan-400" />
                        Yoki Internetdagi Rasm Havolasi (URL)
                      </label>
                      <input
                        type="url"
                        value={customPhotoUrl}
                        onChange={(e) => setCustomPhotoUrl(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-300 focus:border-amber-400 outline-none"
                        placeholder="https://... rasm linkini joylang"
                      />
                    </div>
                  </div>

                  {/* Canva Fine Tuning Controls (Zoom, Offset X, Offset Y, Reset) */}
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-xs text-white flex items-center gap-1.5">
                          <ZoomIn className="w-3.5 h-3.5 text-amber-400" />
                          Canva: Rasm Joylashuvi va Masshtabini Sozlash
                        </span>
                        <p className="text-[10px] text-slate-400">
                          Karta bo‘ylab futbolchi suratini o'zingizga qulay qilib to'g'rilang
                        </p>
                      </div>
                      <button
                        onClick={handleResetCanva}
                        className="text-[10px] text-amber-300 hover:text-amber-200 font-bold px-2 py-1 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Markazga qaytarish
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      {/* Scale Slider */}
                      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                        <div className="flex justify-between items-center mb-1 text-[11px]">
                          <span className="font-bold text-slate-300 flex items-center gap-1">
                            <ZoomIn className="w-3 h-3 text-amber-400" />
                            Masshtab (Zoom)
                          </span>
                          <span className="font-mono font-black text-amber-300">{photoScale.toFixed(2)}x</span>
                        </div>
                        <input
                          type="range"
                          min={0.3}
                          max={3.0}
                          step={0.05}
                          value={photoScale}
                          onChange={(e) => setPhotoScale(Number(e.target.value))}
                          className="w-full accent-amber-400 cursor-pointer"
                        />
                        <div className="flex justify-between text-[9px] text-slate-500 mt-1">
                          <span>0.3x (Kichik)</span>
                          <span>1.0x</span>
                          <span>3.0x (Katta)</span>
                        </div>
                      </div>

                      {/* Offset X Slider */}
                      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                        <div className="flex justify-between items-center mb-1 text-[11px]">
                          <span className="font-bold text-slate-300 flex items-center gap-1">
                            <Move className="w-3 h-3 text-cyan-400" />
                            Gorizontal (X)
                          </span>
                          <span className="font-mono font-black text-cyan-300">{photoOffsetX}px</span>
                        </div>
                        <input
                          type="range"
                          min={-150}
                          max={150}
                          step={1}
                          value={photoOffsetX}
                          onChange={(e) => setPhotoOffsetX(Number(e.target.value))}
                          className="w-full accent-cyan-400 cursor-pointer"
                        />
                        <div className="flex justify-between text-[9px] text-slate-500 mt-1">
                          <span>Chap (-150)</span>
                          <span>0</span>
                          <span>O'ng (+150)</span>
                        </div>
                      </div>

                      {/* Offset Y Slider */}
                      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                        <div className="flex justify-between items-center mb-1 text-[11px]">
                          <span className="font-bold text-slate-300 flex items-center gap-1">
                            <Move className="w-3 h-3 text-purple-400" />
                            Vertikal (Y)
                          </span>
                          <span className="font-mono font-black text-purple-300">{photoOffsetY}px</span>
                        </div>
                        <input
                          type="range"
                          min={-150}
                          max={150}
                          step={1}
                          value={photoOffsetY}
                          onChange={(e) => setPhotoOffsetY(Number(e.target.value))}
                          className="w-full accent-purple-400 cursor-pointer"
                        />
                        <div className="flex justify-between text-[9px] text-slate-500 mt-1">
                          <span>Yuqori (-150)</span>
                          <span>0</span>
                          <span>Past (+150)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Custom Badge / Club Logo Upload */}
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-xs text-white flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5 text-amber-400" />
                          Klub Logosi / Maxsus Emblema (Badge)
                        </span>
                        <p className="text-[10px] text-slate-400">
                          Karta burchagida ko'rinadigan klub emblemasini fayl yuklash yoki havola orqali o'zgartiring
                        </p>
                      </div>
                      {customBadgeUrl && (
                        <button
                          onClick={() => { sfxClick(); setCustomBadgeUrl(''); }}
                          className="text-[10px] text-rose-400 hover:text-rose-300 font-bold px-2 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 cursor-pointer"
                        >
                          Tozalash
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (e.dataTransfer.files?.[0]) {
                            handleBadgeFileUpload(e.dataTransfer.files[0]);
                          }
                        }}
                        onClick={() => {
                          const input = document.getElementById('badge-file-input') as HTMLInputElement;
                          input?.click();
                        }}
                        className="border border-dashed border-slate-700 hover:border-amber-400/70 rounded-xl p-3 text-center bg-slate-900/40 cursor-pointer flex items-center justify-center gap-2"
                      >
                        <input
                          id="badge-file-input"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleBadgeFileUpload(e.target.files[0]);
                            }
                          }}
                        />
                        <Upload className="w-4 h-4 text-amber-400" />
                        <span className="text-[11px] font-bold text-white">Logotip faylini tanlash</span>
                      </div>

                      <div>
                        <input
                          type="url"
                          value={customBadgeUrl}
                          onChange={(e) => setCustomBadgeUrl(e.target.value)}
                          className="w-full h-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-300 focus:border-amber-400 outline-none"
                          placeholder="Yoki emblema URL linki..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: DIZAYNLAR MENYUSI & SHABLONLAR (SAVED PRESETS) */}
              {activeTab === 'designs' && (
                <div className="space-y-4">
                  {/* Feedback Banner */}
                  {designFeedback && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-2xl bg-amber-400/20 border border-amber-400/50 text-amber-300 text-xs font-bold flex items-center gap-2 shadow-lg"
                    >
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{designFeedback}</span>
                    </motion.div>
                  )}

                  {/* Save Current Design Box */}
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-xs text-white flex items-center gap-1.5">
                          <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                          Hozirgi Karta Dizaynini Shablon Sifatida Saqlash
                        </span>
                        <p className="text-[10px] text-slate-400">
                          Barcha orqa fon, video, ranglar, render rejimi va masshtab sozlamalari nomlanib saqlanadi
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={templateNameInput}
                        onChange={(e) => setTemplateNameInput(e.target.value)}
                        placeholder="Dizayn nomini kiriting (masalan: Real Madrid Ballon d'Or 2026)"
                        className="flex-1 px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:border-amber-400 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveCurrentDesign()}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-400/20 active:scale-95 whitespace-nowrap"
                      >
                        <Bookmark className="w-3.5 h-3.5 text-slate-950" />
                        <span>Dizaynni Saqlash</span>
                      </button>
                    </div>
                  </div>

                  {/* JSON Export & Import Tools */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-slate-300 block">Dizaynlar Fayli (JSON)</span>
                      <span className="text-[10px] text-slate-500">
                        Dizaynlaringizni fayl sifatida saqlang yoki boshqa qurilmadan yuklang
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleExportDesignsJson}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Download className="w-3 h-3 text-cyan-400" />
                        <span>JSON Eksport</span>
                      </button>

                      <label className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5">
                        <Upload className="w-3 h-3 text-amber-400" />
                        <span>JSON Import</span>
                        <input
                          type="file"
                          accept=".json,application/json"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleImportDesignsJson(e.target.files[0]);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Saved Designs List */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
                      <span>Saqlangan Shablonlar ({savedDesigns.length})</span>
                      <span className="text-[10px] text-slate-500">Bir bosishda kartaga qo‘llanadi</span>
                    </div>

                    {savedDesigns.length === 0 ? (
                      <div className="p-8 rounded-2xl bg-slate-950/40 border border-slate-800 text-center text-xs text-slate-500">
                        Hozircha saqlangan dizaynlar mavjud emas. Yuqoridagi formadan yangi dizayn saqlang.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {savedDesigns.map((template) => (
                          <div
                            key={template.id}
                            className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/90 hover:border-amber-400/50 transition-all flex flex-col justify-between gap-3 group"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-black text-white truncate group-hover:text-amber-300 transition-colors">
                                  {template.name}
                                </h4>
                                <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400">
                                  <span className="px-1.5 py-0.2 rounded bg-amber-400/10 text-amber-300 font-mono font-bold">
                                    {template.cardTier}
                                  </span>
                                  <span>•</span>
                                  <span>{template.renderMode === 'circle' ? '🔘 Avatar' : '🖼️ Full Body'}</span>
                                  {template.boosterSkill && (
                                    <>
                                      <span>•</span>
                                      <span className="text-cyan-300 truncate max-w-[90px]">{template.boosterSkill}</span>
                                    </>
                                  )}
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleDeleteDesign(template.id, template.name)}
                                className="text-slate-500 hover:text-rose-400 p-1 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                                title="Shablonni o'chirish"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                              <span className="text-[9px] text-slate-500 font-mono">
                                {new Date(template.createdAt).toLocaleDateString()}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleApplyDesign(template)}
                                className="px-3 py-1 rounded-xl bg-amber-400/20 hover:bg-amber-400 text-amber-300 hover:text-slate-950 font-bold text-xs transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                              >
                                <Sparkles className="w-3 h-3" />
                                <span>Qo‘llash</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: ATTRIBUTES */}
              {activeTab === 'stats' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                    <div>
                      <span className="font-bold text-xs text-white">Avtomatik Balanslash</span>
                      <p className="text-[10px] text-slate-400">
                        {role} pozitsiyasi va {ovr} OVR reytingiga moslab barcha 6 ta ko'rsatkichni sozlaydi
                      </p>
                    </div>
                    <button
                      onClick={handleAutoAttrs}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Avto Sozlash</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: 'Tezlik (PAC)', val: pac, setVal: setPac },
                      { label: 'Zarba (SHO)', val: sho, setVal: setSho },
                      { label: 'Pas (PAS)', val: pas, setVal: setPas },
                      { label: 'Dribling (DRI)', val: dri, setVal: setDri },
                      { label: 'Himoya (DEF)', val: def, setVal: setDef },
                      { label: 'Jismoniy Kuch (PHY)', val: phy, setVal: setPhy }
                    ].map(attr => (
                      <div key={attr.label} className="p-3 rounded-2xl bg-slate-950/40 border border-slate-800">
                        <div className="flex justify-between items-center mb-1 text-xs">
                          <span className="font-bold text-slate-300">{attr.label}</span>
                          <span className="font-mono font-black text-amber-300">{attr.val}</span>
                        </div>
                        <input
                          type="range"
                          min={50}
                          max={99}
                          value={attr.val}
                          onChange={e => attr.setVal(Number(e.target.value))}
                          className="w-full accent-amber-400 cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: BACKGROUND & VIDEO FX */}
              {activeTab === 'background' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Maxsus Video Fon Tanlash (Animated Video Presets)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {VIDEO_PRESETS.map(v => (
                        <button
                          key={v.id}
                          onClick={() => {
                            sfxClick();
                            setCardBackgroundVideo(v.id);
                            setCustomVideoUrl('');
                          }}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                            cardBackgroundVideo === v.id && !customVideoUrl
                              ? 'bg-amber-400/10 border-amber-400 shadow-md'
                              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <span className={`text-xs font-bold ${v.color}`}>{v.name}</span>
                          {cardBackgroundVideo === v.id && !customVideoUrl && (
                            <Check className="w-4 h-4 text-amber-400" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Video File Upload & Direct / YouTube Link */}
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-xs text-white flex items-center gap-1.5">
                          <Film className="w-3.5 h-3.5 text-amber-400" />
                          O‘zingizning Maxsus Video Fonini Yuklash
                        </span>
                        <p className="text-[10px] text-slate-400">
                          MP4/WebM fayl yuklang yoki to'g'ridan-to'g'ri video/YouTube havolasini kiriting
                        </p>
                      </div>
                      {customVideoUrl && (
                        <button
                          type="button"
                          onClick={() => { sfxClick(); setCustomVideoUrl(''); }}
                          className="text-[10px] text-rose-400 hover:text-rose-300 font-bold px-2 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 cursor-pointer"
                        >
                          Videoni O'chirish
                        </button>
                      )}
                    </div>

                    {/* Video Drag and Drop */}
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (e.dataTransfer.files?.[0]) {
                          handleVideoFileUpload(e.dataTransfer.files[0]);
                        }
                      }}
                      onClick={() => {
                        const input = document.getElementById('card-video-input') as HTMLInputElement;
                        input?.click();
                      }}
                      className="border-2 border-dashed border-slate-700 hover:border-amber-400/70 rounded-2xl p-4 text-center bg-slate-900/40 transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer relative group"
                    >
                      <input
                        id="card-video-input"
                        type="file"
                        accept="video/mp4,video/webm,video/ogg,video/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleVideoFileUpload(e.target.files[0]);
                          }
                        }}
                      />
                      <div className="w-10 h-10 rounded-full bg-amber-400/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">
                          Video faylini (.mp4, .webm, .mov) yuklash uchun bosing yoki tashlang
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Karta orqa fonida avtomatik ravishda ovozsiz tsiklda (loop) aylanadi
                        </span>
                      </div>
                    </div>

                    {/* Video URL input */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1 flex items-center gap-1">
                        <LinkIcon className="w-3 h-3 text-cyan-400" />
                        Yoki To'g'ridan-to'g'ri Video URL / YouTube Linki
                      </label>
                      <input
                        type="url"
                        value={customVideoUrl}
                        onChange={(e) => setCustomVideoUrl(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-300 focus:border-amber-400 outline-none"
                        placeholder="https://...mp4 yoki YouTube Shorts / Video linki"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">
                        Kiritilsa, yuqoridagi video shablon o'rniga to'g'ridan-to'g'ri o'yin kartasi orqa fonida aylanadi.
                      </p>
                    </div>
                  </div>

                  {/* Video Opacity Slider */}
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-300 flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-amber-400" />
                        Video Fon Shaffofligi (Opacity)
                      </span>
                      <span className="font-mono font-black text-amber-300">
                        {Math.round(videoOpacity * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.1}
                      max={1.0}
                      step={0.05}
                      value={videoOpacity}
                      onChange={(e) => setVideoOpacity(Number(e.target.value))}
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] text-slate-500">
                      <span>Yumshoq (10%)</span>
                      <span>Standart (65%)</span>
                      <span>Yorqin (100%)</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Karta Rang Mavzusi (Gradient Theme)
                    </label>
                    <select
                      value={cardBackgroundTheme}
                      onChange={e => setCardBackgroundTheme(e.target.value as CardBackgroundTheme)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-white focus:border-amber-400 outline-none"
                    >
                      {Object.entries(CARD_BG_THEMES).map(([key, theme]) => (
                        <option key={key} value={key}>
                          {theme.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* TAB 4: PACK DESTINATION */}
              {activeTab === 'destination' && (
                <div className="space-y-4">
                  <label className="text-[11px] font-bold text-slate-400 block">
                    Ushbu Epic futbolchini qayerga saqlamoqchisiz?
                  </label>

                  <div className="space-y-2.5">
                    {/* Option 1: Existing Pack */}
                    <div
                      onClick={() => setDestMode('existing_pack')}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        destMode === 'existing_pack'
                          ? 'bg-amber-400/10 border-amber-400 shadow-md'
                          : 'bg-slate-950/60 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="radio"
                          name="dest"
                          checked={destMode === 'existing_pack'}
                          onChange={() => setDestMode('existing_pack')}
                          className="accent-amber-400"
                        />
                        <span className="text-xs font-black text-white">Mavjud Maxsus Packga Qo‘shish</span>
                      </div>

                      {destMode === 'existing_pack' && (
                        <div className="mt-2">
                          {packs.length === 0 ? (
                            <p className="text-xs text-amber-400">
                              Hozirda faol packlar mavjud emas. Pastdagi "Yangi Pack Yaratish" opsiyasini tanlang!
                            </p>
                          ) : (
                            <select
                              value={selectedPackId}
                              onChange={e => setSelectedPackId(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white outline-none"
                            >
                              {packs.map(p => (
                                <option key={p.id} value={p.id}>
                                  {p.name} ({p.players?.length || 0} ta o'yinchi)
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Option 2: Create New Pack */}
                    <div
                      onClick={() => setDestMode('new_pack')}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        destMode === 'new_pack'
                          ? 'bg-amber-400/10 border-amber-400 shadow-md'
                          : 'bg-slate-950/60 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="radio"
                          name="dest"
                          checked={destMode === 'new_pack'}
                          onChange={() => setDestMode('new_pack')}
                          className="accent-amber-400"
                        />
                        <span className="text-xs font-black text-white">
                          Yangi Maxsus Pack Yaratish va Unga Biriktirish
                        </span>
                      </div>

                      {destMode === 'new_pack' && (
                        <div className="mt-2">
                          <label className="text-[10px] text-slate-400 block mb-1">Yangi Pack Nomi:</label>
                          <input
                            type="text"
                            value={newPackName}
                            onChange={e => setNewPackName(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white outline-none"
                            placeholder="Masalan: 2026 Golden Legends Box"
                          />
                        </div>
                      )}
                    </div>

                    {/* Option 3: Add to Squad */}
                    <div
                      onClick={() => setDestMode('squad')}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        destMode === 'squad'
                          ? 'bg-amber-400/10 border-amber-400 shadow-md'
                          : 'bg-slate-950/60 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="dest"
                          checked={destMode === 'squad'}
                          onChange={() => setDestMode('squad')}
                          className="accent-amber-400"
                        />
                        <span className="text-xs font-black text-white">
                          To‘g‘ridan-to‘g‘ri Jamoa Zaxirasiga (Squad) Qo‘shish
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 ml-5">
                        Futbolchi darhol klubingiz zaxira ro'yxatiga kiritiladi va uni maydonga tushirish mumkin bo'ladi.
                      </p>
                    </div>

                    {/* Design Preset Selector for Pack / Player */}
                    {savedDesigns.length > 0 && (
                      <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-amber-400/30 space-y-2">
                        <span className="font-bold text-xs text-amber-300 flex items-center gap-1.5">
                          <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                          Saqlangan Dizayn Shablonini Qo‘llash
                        </span>
                        <p className="text-[10px] text-slate-400">
                          Ushbu o‘yinchi uchun studioda saqlangan dizaynlardan birini tezkor biriktirishingiz mumkin
                        </p>
                        <select
                          onChange={(e) => {
                            const found = savedDesigns.find(d => d.id === e.target.value);
                            if (found) handleApplyDesign(found);
                          }}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:border-amber-400 outline-none"
                        >
                          <option value="">-- Saqlangan dizaynni tanlang --</option>
                          {savedDesigns.map(d => (
                            <option key={d.id} value={d.id}>
                              🎨 {d.name} ({d.cardTier} • {d.renderMode === 'circle' ? 'Avatar' : 'Full PNG'})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Action Buttons */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  sfxClick();
                  onTestWalkout(livePlayer);
                }}
                className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border border-slate-700"
              >
                <Eye className="w-4 h-4 text-cyan-400" />
                <span>Test Walkout Chiqishi</span>
              </button>

              <button
                onClick={handleSave}
                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-amber-400/20 flex items-center gap-2"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Saqlash va Biriktirish</span>
              </button>
            </div>
          </div>

          {/* Right Live Card Stage (5 cols) */}
          <div className="lg:col-span-5 p-6 flex flex-col items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
            {/* Ambient Background Aura */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-72 h-72 rounded-full bg-amber-500/10 blur-3xl" />
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="mb-3 text-center">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-800">
                  Jonli 3D Karta Ko‘rinishi
                </span>
              </div>

              {/* Large Interactive Card */}
              <FutCard player={livePlayer} size="md" />

              <div className="mt-4 text-center">
                <div className="text-xs font-bold text-white">{name}</div>
                <div className="text-[10px] text-slate-400">
                  {role} • {club} • {livePlayer.nation.flag}
                </div>
                {boosterSkill && (
                  <div className="mt-1 inline-flex items-center gap-1 text-[9px] font-black text-amber-400 uppercase">
                    <Zap className="w-3 h-3 fill-amber-400" />
                    <span>{boosterSkill}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
