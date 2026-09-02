import React, { useState } from 'react';
import { LeaderboardItem } from '../types';
import { PlayerAvatar } from './PlayerAvatar';
import { sfxClick, sfxCardFlip } from '../utils/audio';
import { Trophy, Award, Sparkles, Filter } from 'lucide-react';

interface LeaderboardProps {
  entries: LeaderboardItem[];
  onSimulateRivals: () => void;
}

const HISTORICAL_LEGENDS: LeaderboardItem[] = [
  {
    id: 'legend_messi',
    name: 'Lionel Messi',
    pos: 'CF',
    nation: '🇦🇷 Argentina',
    rating: 99,
    bdo: 8,
    wc: 1,
    cl: 4,
    isUser: false,
    avatar: {
      skinTone: '#f4caa1',
      hairStyle: 'parted',
      hairColor: '#4a2f18',
      facialHair: 'full-beard',
      kitPrimaryColor: '#1e3a8a',
      kitSecondaryColor: '#ffffff'
    }
  },
  {
    id: 'legend_ronaldo',
    name: 'Cristiano Ronaldo',
    pos: 'ST',
    nation: '🇵🇹 Portugaliya',
    rating: 99,
    bdo: 5,
    wc: 0,
    cl: 5,
    isUser: false,
    avatar: {
      skinTone: '#e4af80',
      hairStyle: 'short-fade',
      hairColor: '#1c1917',
      facialHair: 'stubble',
      kitPrimaryColor: '#ffffff',
      kitSecondaryColor: '#d4af37'
    }
  },
  {
    id: 'legend_pele',
    name: 'Pelé',
    pos: 'CF',
    nation: '🇧🇷 Braziliya',
    rating: 98,
    bdo: 0,
    wc: 3,
    cl: 2,
    isUser: false,
    avatar: {
      skinTone: '#7c4c28',
      hairStyle: 'buzz',
      hairColor: '#1c1917',
      facialHair: 'none',
      kitPrimaryColor: '#eab308',
      kitSecondaryColor: '#15803d'
    }
  },
  {
    id: 'legend_maradona',
    name: 'Diego Maradona',
    pos: 'AMF',
    nation: '🇦🇷 Argentina',
    rating: 97,
    bdo: 0,
    wc: 1,
    cl: 0,
    isUser: false,
    avatar: {
      skinTone: '#f4caa1',
      hairStyle: 'afro',
      hairColor: '#1c1917',
      facialHair: 'none',
      kitPrimaryColor: '#38bdf8',
      kitSecondaryColor: '#ffffff'
    }
  },
  {
    id: 'legend_maldini',
    name: 'Paolo Maldini',
    pos: 'CB',
    nation: '🇮🇹 Italiya',
    rating: 97,
    bdo: 0,
    wc: 0,
    cl: 5,
    isUser: false,
    avatar: {
      skinTone: '#fed7aa',
      hairStyle: 'curls',
      hairColor: '#3d2314',
      facialHair: 'none',
      kitPrimaryColor: '#dc2626',
      kitSecondaryColor: '#000000'
    }
  },
  {
    id: 'legend_buffon',
    name: 'Gianluigi Buffon',
    pos: 'GK',
    nation: '🇮🇹 Italiya',
    rating: 97,
    bdo: 0,
    wc: 1,
    cl: 0,
    isUser: false,
    avatar: {
      skinTone: '#f4caa1',
      hairStyle: 'short-fade',
      hairColor: '#1c1917',
      facialHair: 'stubble',
      kitPrimaryColor: '#1e3a8a',
      kitSecondaryColor: '#ffffff'
    }
  },
  {
    id: 'legend_zidane',
    name: 'Zinedine Zidane',
    pos: 'AMF',
    nation: '🇫🇷 Fransiya',
    rating: 96,
    bdo: 1,
    wc: 1,
    cl: 1,
    isUser: false,
    avatar: {
      skinTone: '#fed7aa',
      hairStyle: 'buzz',
      hairColor: '#3d2314',
      facialHair: 'none',
      kitPrimaryColor: '#ffffff',
      kitSecondaryColor: '#1e3a8a'
    }
  }
];

export const Leaderboard: React.FC<LeaderboardProps> = ({ entries, onSimulateRivals }) => {
  const [filterPos, setFilterPos] = useState<string>('ALL');

  const combinedList = [...HISTORICAL_LEGENDS, ...entries];

  const filtered = combinedList.filter(item => {
    if (filterPos === 'ALL') return true;
    if (filterPos === 'FW') return ['CF', 'ST', 'LWF', 'RWF', 'SS'].includes(item.pos);
    if (filterPos === 'MF') return ['CMF', 'AMF', 'DMF', 'LMF', 'RMF'].includes(item.pos);
    if (filterPos === 'DF') return ['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(item.pos);
    if (filterPos === 'GK') return item.pos === 'GK';
    return true;
  });

  filtered.sort((a, b) => b.rating - a.rating);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-5">
      {/* Top Banner */}
      <div className="p-4 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl flex flex-wrap justify-between items-center gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white leading-none">Jahon Shon-sharaf Zali (Hall of Fame)</h2>
            <p className="text-xs text-slate-400 mt-1">
              Dunyo futboli afsonalari va sizning yaratgan eng kuchli yulduzlaringiz reytingi
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            sfxCardFlip(2);
            onSimulateRivals();
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          Yangi Raqiblarni Simulyatsiya Qilish
        </button>
      </div>

      {/* Position Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { id: 'ALL', label: 'Barcha O‘yinchilar' },
          { id: 'FW', label: 'Hujumkor (FW)' },
          { id: 'MF', label: 'Yarim Himoya (MF)' },
          { id: 'DF', label: 'Himoyachilar (DF)' },
          { id: 'GK', label: 'Darvozabonlar (GK)' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              sfxClick();
              setFilterPos(tab.id);
            }}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
              filterPos === tab.id
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                : 'bg-white/[0.05] hover:bg-white/10 text-slate-300 border border-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Leaderboard Table / Cards */}
      <div className="p-4 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl flex flex-col gap-2 shadow-2xl">
        <div className="grid grid-cols-12 text-[11px] font-black text-slate-400 uppercase tracking-wider px-3 pb-2 border-b border-white/10">
          <span className="col-span-1">#</span>
          <span className="col-span-6 sm:col-span-7">Futbolchi & Millat</span>
          <span className="col-span-2 text-center">Pozitsiya</span>
          <span className="col-span-3 sm:col-span-2 text-right">Reyting</span>
        </div>

        {filtered.slice(0, 30).map((item, index) => {
          const isTop3 = index < 3;
          return (
            <div
              key={`lead_${item.id || item.name}_${index}`}
              className={`grid grid-cols-12 items-center p-3 rounded-2xl transition-all border ${
                item.isUser
                  ? 'bg-cyan-500/15 border-cyan-400/40 shadow-md shadow-cyan-500/10'
                  : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/5'
              }`}
            >
              {/* Rank */}
              <div className="col-span-1 flex items-center">
                <span
                  className={`font-black text-sm ${
                    index === 0
                      ? 'text-amber-400'
                      : index === 1
                      ? 'text-slate-300'
                      : index === 2
                      ? 'text-amber-600'
                      : 'text-slate-400'
                  }`}
                >
                  {index + 1}
                </span>
              </div>

              {/* Player details */}
              <div className="col-span-6 sm:col-span-7 flex items-center gap-3 min-w-0">
                {item.avatar && (
                  <div className="shrink-0 hidden sm:block">
                    <PlayerAvatar avatar={item.avatar} size={36} />
                  </div>
                )}
                <div className="min-w-0">
                  <h4 className="font-black text-xs sm:text-sm text-white truncate flex items-center gap-1.5">
                    <span>{item.name}</span>
                    {item.isUser && (
                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-cyan-400 text-slate-950">
                        SIZNING KARYERANGIZ
                      </span>
                    )}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold mt-0.5">
                    <span>{item.nation}</span>
                    {item.wc > 0 && <span className="text-amber-300">🏆 {item.wc}x JCH</span>}
                    {item.bdo > 0 && <span className="text-amber-300">🥇 {item.bdo}x BDO</span>}
                    {item.cl > 0 && <span className="text-cyan-300">⭐ {item.cl}x UCL</span>}
                  </div>
                </div>
              </div>

              {/* Position */}
              <div className="col-span-2 text-center">
                <span className="font-black text-xs px-2 py-0.5 rounded-lg bg-white/10 text-cyan-300">
                  {item.pos}
                </span>
              </div>

              {/* OVR */}
              <div className="col-span-3 sm:col-span-2 text-right">
                <span
                  className={`text-base font-black ${
                    item.rating >= 95 ? 'text-amber-400' : item.rating >= 90 ? 'text-cyan-300' : 'text-white'
                  }`}
                >
                  {item.rating}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
