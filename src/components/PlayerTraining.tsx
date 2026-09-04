import React, { useState } from 'react';
import { Player, PlayerAttributes } from '../types';
import { PlayerAvatar } from './PlayerAvatar';
import { sfxClick, sfxWalkoutReveal } from '../utils/audio';
import { speakText } from '../utils/speech';
import { Dumbbell, Sparkles, Shield, Zap, Target } from 'lucide-react';

interface PlayerTrainingProps {
  userSquad: Player[];
  onUpdatePlayer: (updated: Player) => void;
}

type DrillKey = keyof PlayerAttributes;

interface DrillConfig {
  key: DrillKey;
  name: string;
  desc: string;
  icon: string;
}

const getDrillsForPlayer = (p: Player): DrillConfig[] => {
  if (p.family === 'GK' || p.role === 'GK') {
    return [
      { key: 'div', name: 'Sakrash & Seyv (Diving)', desc: 'Burchaklarga parvoz va qiyin to‘plarni qaytarish', icon: '🧤' },
      { key: 'ref', name: 'Reaksiya & Refleks (Reflexes)', desc: 'Yaqin masofadan berilgan zarbalarni qaytarish', icon: '⚡' },
      { key: 'han', name: 'To‘pni Mahkam Ushlash (Handling)', desc: 'Kuchli zarbalarni qo‘ldan chiqarmasdan tutish', icon: '✊' },
      { key: 'pos', name: 'Pozitsiya Tanlash (Positioning)', desc: 'Darvoza va burchaklarni to‘g‘ri yopish', icon: '🎯' },
      { key: 'kic', name: 'To‘pni Kiritish (GK Kicking)', desc: 'Hujumni tezkor va aniq pas bilan boshlash', icon: '🚀' },
      { key: 'spd', name: '1-ga-1 Chiqish & Tezlik (Rush)', desc: 'Hujumchi oyog‘iga dadil tashlanish', icon: '🛡️' }
    ];
  }
  if (p.family === 'DF') {
    return [
      { key: 'def', name: 'To‘p Olib Qo‘yish & Podkat', desc: '1v1 himoya va xavfli zonalarni tozalash', icon: '🛡️' },
      { key: 'phy', name: 'Bosh bilan Kurash & Kuch', desc: 'Havo kurashlari va jismoniy ustunlik', icon: '💪' },
      { key: 'pac', name: 'Sug‘urtalash Tezligi (Pace)', desc: 'Raqib hujumchisini quvib yetish', icon: '⚡' },
      { key: 'pas', name: 'Himoyadan Chiqish & Pas', desc: 'Hujumni birinchi aniq uzatma bilan boshlash', icon: '🎯' },
      { key: 'dri', name: 'Pressingdan Chiqish & Nazorat', desc: 'Bosim ostida sovuqqonlik bilan to‘pni saqlash', icon: '✨' },
      { key: 'sho', name: 'Uzoqdan Tozalash & Bosh Zarbasi', desc: 'Burchak to‘plarida gol urish va tozalash', icon: '⚽' }
    ];
  }
  if (p.family === 'MF') {
    return [
      { key: 'pas', name: 'Vizion & Zargarona Paslar', desc: 'Himoyani tilka-pora qiluvchi uzatmalar', icon: '🎯' },
      { key: 'dri', name: 'Maydon Markazini Boshqarish', desc: 'To‘pni saqlash va 360 daraja burilish', icon: '✨' },
      { key: 'def', name: 'Markazda Pressing & To‘p Qaytarish', desc: 'Raqib hujumlarini oldindan to‘xtatish', icon: '🛡️' },
      { key: 'sho', name: 'Uzoq Masofadan Zarba', desc: 'Jarima maydoni tashqarisidan aniq zarba', icon: '⚽' },
      { key: 'phy', name: 'Box-to-Box Chidamlilik', desc: '90 daqiqa tinimsiz harakat va kurash', icon: '💪' },
      { key: 'pac', name: 'Markazdan Portlovchi O‘tish', desc: 'Himoyadan hujumga tezkor o‘tish', icon: '⚡' }
    ];
  }
  // FW
  return [
    { key: 'sho', name: 'Sovuqqon Yakunlash & Zarba', desc: 'Darvozaning aniq burchagiga zarba', icon: '⚽' },
    { key: 'pac', name: 'Portlovchi Tezlik & Sprint', desc: 'Himoyachilar ortiga yorib kirish', icon: '⚡' },
    { key: 'dri', name: 'Finlar & Dribling', desc: '1v1 aldab o‘tish va bo‘sh hudud ochish', icon: '✨' },
    { key: 'phy', name: 'Korpus bilan Saqlash & Bosh', desc: 'Hujumda to‘pni saqlash va bosh bilan gol', icon: '💪' },
    { key: 'pas', name: 'Hamkorlik & Golli Pas', desc: 'Sheriklariga qulay imkoniyat yaratish', icon: '🎯' },
    { key: 'def', name: 'Oldingi Chiziqda Bosim', desc: 'Himoyachilardan to‘pni olib qo‘yish', icon: '🛡️' }
  ];
};

export const PlayerTraining: React.FC<PlayerTrainingProps> = ({ userSquad, onUpdatePlayer }) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(userSquad[0]?.id || '');
  const [levelUpAnimation, setLevelUpAnimation] = useState(false);

  const player = userSquad.find(p => p.id === selectedPlayerId) || userSquad[0];

  if (!player) {
    return (
      <div className="p-8 rounded-3xl bg-slate-900/80 border border-white/10 text-center text-slate-400">
        Mashg‘ulot o‘tkazish uchun jamoangizda kamida bitta futbolchi bo‘lishi lozim.
      </div>
    );
  }

  const drills = getDrillsForPlayer(player);

  const handleTrain = (statKey: DrillKey) => {
    sfxClick();
    const updated = { ...player, attrs: { ...player.attrs } };
    const xpGain = Math.floor(Math.random() * 20) + 30; // 30-50 XP
    let newXp = updated.xp + xpGain;
    let newLevel = updated.level;
    let newOvr = updated.ovr;

    const currentVal = (updated.attrs[statKey] as number) || Math.floor(updated.ovr * 0.85);
    const drill = drills.find(d => d.key === statKey);

    if (newXp >= 100) {
      newXp -= 100;
      newLevel += 1;
      // If below potential ceiling, boost OVR
      if (newOvr < updated.potential) {
        newOvr += 1;
        setLevelUpAnimation(true);
        sfxWalkoutReveal(newOvr);
        setTimeout(() => setLevelUpAnimation(false), 2000);
      }
      // Boost the specific trained stat
      if (currentVal < 99) {
        (updated.attrs as any)[statKey] = Math.min(99, currentVal + 2);
      }
      speakText(`Ajoyib! ${player.name} yangi daraja ${newLevel} ga chiqdi! Reyting: ${newOvr}!`, true);
    } else {
      if (currentVal < 99 && Math.random() < 0.5) {
        (updated.attrs as any)[statKey] = Math.min(99, currentVal + 1);
      }
      if (drill) {
        speakText(`${drill.name} mashqi bajarildi. Tajriba ${newXp} ga yetdi.`, false);
      }
    }

    updated.xp = newXp;
    updated.level = newLevel;
    updated.ovr = newOvr;

    onUpdatePlayer(updated);
  };

  const getPositionLabel = (p: Player) => {
    if (p.family === 'GK') return 'Darvozabon (Goalkeeper)';
    if (p.family === 'DF') return 'Himoyachi (Defender)';
    if (p.family === 'MF') return 'Yarim Himoyachi (Midfielder)';
    return 'Hujumchi (Forward)';
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
      {/* Player Selection Carousel */}
      <div className="p-4 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl flex flex-col gap-3 shadow-xl">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-widest text-cyan-400">
            Mashg‘ulot Uchun Futbolchini Tanlang
          </span>
          <span className="text-[11px] font-bold text-slate-400">
            Pozitsiyasiga mos maxsus mashqlar
          </span>
        </div>
        <div className="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar">
          {userSquad.map((p, idx) => (
            <button
              key={`train_${p.id}_${idx}`}
              onClick={() => {
                sfxClick();
                setSelectedPlayerId(p.id);
                speakText(`${p.name} tanlandi. Reyting: ${p.ovr}, Amplua: ${p.role}`, true);
              }}
              aria-label={`${p.name}, reyting ${p.ovr}, pozitsiya ${p.role}. Tanlash uchun bosing.`}
              className={`flex items-center gap-2.5 p-2 rounded-2xl border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                selectedPlayerId === p.id
                  ? 'bg-gradient-to-r from-cyan-500/25 to-blue-600/25 border-cyan-400 text-white shadow-lg shadow-cyan-500/20 scale-102'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-slate-300'
              }`}
            >
              <PlayerAvatar avatar={p.avatar} size={36} />
              <div className="text-left">
                <div className="flex items-center gap-1">
                  <span className="font-black text-xs text-amber-400">{p.ovr}</span>
                  <span className="text-[10px] font-bold text-cyan-300">{p.role}</span>
                </div>
                <span className="font-bold text-xs text-white block max-w-[100px] truncate">{p.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Training Gym Stage */}
      <div className="relative p-5 sm:p-7 rounded-3xl bg-gradient-to-b from-slate-900 via-indigo-950/80 to-slate-900 border border-white/15 backdrop-blur-xl shadow-2xl flex flex-col lg:flex-row items-center lg:items-start gap-7">
        {/* Left: Player Profile & Level */}
        <div className="flex flex-col items-center text-center w-full lg:w-72 shrink-0">
          <div className="relative">
            <PlayerAvatar avatar={player.avatar} size={110} />
            {levelUpAnimation && (
              <div className="absolute -top-2 -right-2 text-amber-300 animate-bounce">
                <Sparkles className="w-8 h-8" />
              </div>
            )}
          </div>

          <h3 className="font-black text-lg text-white mt-3">{player.name}</h3>
          <p className="text-xs text-slate-300 font-bold">{player.club} • {player.role}</p>
          <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
            {getPositionLabel(player)}
          </span>

          <div className="flex items-center justify-center gap-3 mt-4 w-full">
            <div className="flex-1 flex flex-col items-center p-2 rounded-xl bg-white/[0.05] border border-white/5">
              <span className="text-xl font-black text-amber-400">{player.ovr}</span>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Joriy OVR</span>
            </div>
            <div className="flex-1 flex flex-col items-center p-2 rounded-xl bg-white/[0.05] border border-white/5">
              <span className="text-xl font-black text-emerald-400">{player.potential}</span>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Salohiyat</span>
            </div>
            <div className="flex-1 flex flex-col items-center p-2 rounded-xl bg-white/[0.05] border border-white/5">
              <span className="text-xl font-black text-cyan-400">{player.level}</span>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Daraja</span>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="w-full mt-4 flex flex-col gap-1">
            <div className="flex justify-between text-[11px] font-bold text-slate-300">
              <span>Tajriba (XP):</span>
              <span className="text-cyan-400">{player.xp} / 100 XP</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-amber-400 transition-all duration-300"
                style={{ width: `${player.xp}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right: Training Drills */}
        <div className="flex-1 w-full min-w-0 flex flex-col gap-3.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-sm font-black text-white">
              <Dumbbell className="w-4 h-4 text-amber-400" />
              <span>{player.role} Ampluasi Uchun Maxsus Mashqlar</span>
            </div>
            <span className="text-[11px] text-emerald-400 font-bold">
              Har mashg‘ulot +XP beradi
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            {drills.map(drill => {
              const currentVal = (player.attrs[drill.key] as number) || Math.floor(player.ovr * 0.85);
              return (
                <button
                  key={drill.key}
                  onClick={() => handleTrain(drill.key)}
                  role="button"
                  tabIndex={0}
                  aria-label={`${drill.name}, joriy ko‘rsatkich ${currentVal}. Mashq o‘tkazish.`}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.05] hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-600/20 border border-white/10 hover:border-cyan-400/50 transition-all cursor-pointer text-left group w-full min-w-0"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <span className="text-2xl shrink-0 filter drop-shadow-sm">{drill.icon}</span>
                    <div className="min-w-0">
                      <h4 className="font-black text-xs text-white group-hover:text-cyan-300 truncate">
                        {drill.name}
                      </h4>
                      <p className="text-[10px] text-slate-300 line-clamp-1">{drill.desc}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-black text-amber-300">{currentVal}</span>
                    <span className="block text-[9px] font-black text-cyan-400 group-hover:underline">+XP</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
