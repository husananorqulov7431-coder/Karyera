import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Player, MatchEvent, OpponentTeam } from '../types';
import { sfxWhistle, sfxGoal, sfxClick } from '../utils/audio';
import { Play, Pause, RotateCcw, Shield, Swords, Flame, Trophy, Award } from 'lucide-react';

interface MatchSimulatorProps {
  userSquad: Player[];
  clubBudget: number;
  onMatchComplete: (result: { won: boolean; rewardMoney: number; xpReward: number }) => void;
}

const OPPONENT_TEAMS: OpponentTeam[] = [
  {
    id: 'opp_real',
    name: 'Real Madrid',
    league: 'La Liga',
    rating: 93,
    color: '#ffffff',
    badge: '👑',
    tactics: 'Yulduzli hujumkor qarshi hujum'
  },
  {
    id: 'opp_mancity',
    name: 'Manchester City',
    league: 'Premier League',
    rating: 93,
    color: '#38bdf8',
    badge: '⚡',
    tactics: 'Tiki-taka va maydon nazorati'
  },
  {
    id: 'opp_bayern',
    name: 'Bayern Munich',
    league: 'Bundesliga',
    rating: 91,
    color: '#dc2626',
    badge: '🛡️',
    tactics: 'Nemis jismoniy pressingi'
  },
  {
    id: 'opp_inter',
    name: 'Inter Milan',
    league: 'Serie A',
    rating: 90,
    color: '#1d4ed8',
    badge: '🐍',
    tactics: 'Mustahkam 3-5-2 himoya bloki'
  },
  {
    id: 'opp_alhilal',
    name: 'Al-Hilal',
    league: 'Roshn Saudi League',
    rating: 87,
    color: '#2563eb',
    badge: '🌙',
    tactics: 'Tezkor qanot reydlari'
  }
];

export const MatchSimulator: React.FC<MatchSimulatorProps> = ({ userSquad, clubBudget, onMatchComplete }) => {
  const [selectedOpponent, setSelectedOpponent] = useState<OpponentTeam>(OPPONENT_TEAMS[0]);
  const [minute, setMinute] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userScore, setUserScore] = useState(0);
  const [oppScore, setOppScore] = useState(0);
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [tactic, setTactic] = useState<'balanced' | 'attack' | 'defense' | 'press'>('balanced');
  const [matchDone, setMatchDone] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const teamOvr = userSquad.length
    ? Math.round(userSquad.reduce((acc, p) => acc + p.ovr, 0) / userSquad.length)
    : 75;

  const startMatch = () => {
    sfxWhistle();
    setMinute(0);
    setUserScore(0);
    setOppScore(0);
    setEvents([
      {
        minute: 1,
        type: 'whistle',
        text: `Hakam uchrashuvni boshlab berdi! Sizning jamoangiz vs ${selectedOpponent.name}.`,
        team: 1
      }
    ]);
    setMatchDone(false);
    setIsPlaying(true);
  };

  const resetMatch = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsPlaying(false);
    setMinute(0);
    setUserScore(0);
    setOppScore(0);
    setEvents([]);
    setMatchDone(false);
  };

  useEffect(() => {
    if (!isPlaying) return;

    timerRef.current = setInterval(() => {
      setMinute(prev => {
        if (prev >= 90) return 90;
        return prev + 1;
      });
    }, 280); // Speed of match clock

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying || minute === 0) return;

    if (minute >= 90) {
      setIsPlaying(false);
      setMatchDone(true);
      sfxWhistle();

      // Calculate match reward safely in effect
      const won = userScore > oppScore;
      const reward = won ? 3500000 : userScore === oppScore ? 1200000 : 400000;
      onMatchComplete({ won, rewardMoney: reward, xpReward: won ? 35 : 15 });
      return;
    }

    // Event chances
    const attackBoost = tactic === 'attack' ? 1.3 : tactic === 'defense' ? 0.7 : 1.0;
    const defenseBoost = tactic === 'defense' ? 1.3 : tactic === 'attack' ? 0.8 : 1.0;

    const ourGoalProb = ((teamOvr - 65) / 100) * 0.045 * attackBoost;
    const oppGoalProb = ((selectedOpponent.rating - 65) / 100) * 0.042 * (1 / defenseBoost);

    // User goal event
    if (Math.random() < ourGoalProb) {
      sfxGoal();
      setUserScore(s => s + 1);
      const scorer = userSquad[Math.floor(Math.random() * userSquad.length)]?.name || 'Hujumchi';
      setEvents(ev => [
        {
          minute,
          type: 'goal',
          text: `GOOOOL! ${scorer} ajoyib zarba bilan hisobni o‘zgartirdi!`,
          team: 1,
          player: scorer
        },
        ...ev
      ]);
    }
    // Opponent goal event
    else if (Math.random() < oppGoalProb) {
      setOppScore(s => s + 1);
      setEvents(ev => [
        {
          minute,
          type: 'goal',
          text: `${selectedOpponent.name} hujumi gol bilan yakunlandi!`,
          team: 2
        },
        ...ev
      ]);
    }
    // Dramatic moments (saves, cards)
    else if (Math.random() < 0.08) {
      const randAction = Math.random();
      if (randAction < 0.4) {
        setEvents(ev => [
          {
            minute,
            type: 'save',
            text: `Darvozabon aqlbovar qilmas seyv bilan to‘pni burchakka chiqarib yubordi!`,
            team: 1
          },
          ...ev
        ]);
      } else if (randAction < 0.7) {
        setEvents(ev => [
          {
            minute,
            type: 'foul',
            text: `Markazda shiddatli to‘qnashuv. Hakam og‘zaki ogohlantirish berdi.`,
            team: 2
          },
          ...ev
        ]);
      } else {
        setEvents(ev => [
          {
            minute,
            type: 'card',
            text: `Qo‘pollik uchun sariq kartochka ko‘rsatildi.`,
            team: 1
          },
          ...ev
        ]);
      }
    }
  }, [minute, isPlaying]);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-5">
      {/* Opponent Selection Pills */}
      {!isPlaying && minute === 0 && (
        <div className="p-4 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl flex flex-col gap-3">
          <span className="text-xs font-black uppercase tracking-widest text-cyan-400">Raqibni Tanlang</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {OPPONENT_TEAMS.map(opp => (
              <button
                key={opp.id}
                onClick={() => {
                  sfxClick();
                  setSelectedOpponent(opp);
                }}
                className={`flex items-center justify-between p-3 rounded-2xl text-left transition-all cursor-pointer border ${
                  selectedOpponent.id === opp.id
                    ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-lg shadow-cyan-500/20'
                    : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{opp.badge}</span>
                  <div>
                    <h4 className="font-black text-sm text-white">{opp.name}</h4>
                    <p className="text-[11px] text-slate-400">{opp.tactics}</p>
                  </div>
                </div>
                <span className="font-black text-sm text-amber-400">{opp.rating} OVR</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Scoreboard Display (Glassmorphism HUD) */}
      <div className="relative p-6 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-indigo-950/90 border border-white/15 backdrop-blur-2xl shadow-2xl flex flex-col items-center gap-4 overflow-hidden">
        {/* Top Match Clock */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span className="text-xs font-black tracking-widest text-white">{minute}′ DAQIQA</span>
        </div>

        {/* Big Match Score */}
        <div className="w-full flex items-center justify-around">
          {/* User Team */}
          <div className="flex flex-col items-center text-center max-w-[140px]">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-2xl shadow-lg shadow-cyan-500/30">
              ⚡
            </div>
            <h3 className="font-black text-sm text-white mt-2 truncate w-full">Sizning Jamoangiz</h3>
            <span className="text-xs font-bold text-cyan-400">{teamOvr} OVR</span>
          </div>

          {/* Center Scores */}
          <div className="flex items-center gap-3">
            <span className="text-5xl font-black text-white tracking-tight drop-shadow-[0_2px_12px_rgba(255,255,255,0.4)]">
              {userScore}
            </span>
            <span className="text-2xl font-black text-slate-500">:</span>
            <span className="text-5xl font-black text-white tracking-tight drop-shadow-[0_2px_12px_rgba(255,255,255,0.4)]">
              {oppScore}
            </span>
          </div>

          {/* Opponent Team */}
          <div className="flex flex-col items-center text-center max-w-[140px]">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.08] border border-white/15 flex items-center justify-center text-2xl shadow-lg">
              {selectedOpponent.badge}
            </div>
            <h3 className="font-black text-sm text-white mt-2 truncate w-full">{selectedOpponent.name}</h3>
            <span className="text-xs font-bold text-amber-400">{selectedOpponent.rating} OVR</span>
          </div>
        </div>

        {/* In-Match Live Tactics Selector */}
        {isPlaying && (
          <div className="w-full mt-2 flex flex-col gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 text-center">
              Jonli Taktik Ko‘rsatma
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'attack', label: 'Hujumkor' },
                { id: 'balanced', label: 'Muvozanat' },
                { id: 'press', label: 'Pressing' },
                { id: 'defense', label: 'Himoya' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => {
                    sfxClick();
                    setTactic(t.id as any);
                  }}
                  className={`py-1.5 rounded-xl text-[11px] font-black transition-all cursor-pointer ${
                    tactic === t.id
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md'
                      : 'bg-white/[0.06] text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Start / Pause Controls */}
        <div className="w-full mt-3 flex items-center justify-center gap-3">
          {!isPlaying && !matchDone && (
            <button
              onClick={startMatch}
              className="flex-1 py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-slate-950 shadow-xl shadow-emerald-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              O‘yinni Boshlash
            </button>
          )}

          {isPlaying && (
            <button
              onClick={() => setIsPlaying(false)}
              className="px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer flex items-center gap-2"
            >
              <Pause className="w-4 h-4" />
              Pauza
            </button>
          )}

          {matchDone && (
            <button
              onClick={resetMatch}
              className="flex-1 py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-xl shadow-cyan-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Yangi O‘yin
            </button>
          )}
        </div>
      </div>

      {/* Match Events & Live Commentary Feed */}
      <div className="w-full p-4 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl flex flex-col gap-2.5 max-h-[300px] overflow-y-auto">
        <span className="text-xs font-black uppercase tracking-widest text-slate-400">
          Uchrashuv Xronikasi & Sharhi
        </span>

        {events.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">
            O‘yin boshlanganda muhim voqealar va gol sharhlari shu yerda ko‘rinadi.
          </p>
        ) : (
          events.map((ev, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 p-2.5 rounded-xl text-xs font-bold border ${
                ev.type === 'goal'
                  ? 'bg-amber-500/15 border-amber-400/40 text-amber-200'
                  : ev.type === 'card'
                  ? 'bg-yellow-500/10 border-yellow-400/30 text-yellow-200'
                  : 'bg-white/[0.04] border-white/5 text-slate-300'
              }`}
            >
              <span className="font-black text-cyan-400 whitespace-nowrap">{ev.minute}′</span>
              <span>{ev.text}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
