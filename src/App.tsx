import React, { useState, useEffect } from 'react';
import { Player, FormationKey, CareerResult, LeaderboardItem, PositionRole } from './types';
import { REAL_STAR_PLAYERS, generateRandomPlayer } from './data/realPlayers';
import { FORMATION_CONFIGS, remapSquadToFormation } from './data/formations';
import { PitchBoard } from './components/PitchBoard';
import { CareerMode } from './components/CareerMode';
import { MatchSimulator } from './components/MatchSimulator';
import { TransferMarket } from './components/TransferMarket';
import { PlayerTraining } from './components/PlayerTraining';
import { Leaderboard } from './components/Leaderboard';
import { MultiplayerRoom } from './components/MultiplayerRoom';
import { EntranceSplashScreen } from './components/EntranceSplashScreen';
import { toggleAudio, isAudioEnabled, sfxClick, sfxCardFlip } from './utils/audio';
import { speakText } from './utils/speech';
import {
  Trophy,
  Users,
  Swords,
  ShoppingBag,
  Dumbbell,
  Sparkles,
  Volume2,
  VolumeX,
  Coins,
  Radio,
  Headphones,
  X
} from 'lucide-react';

type TabType = 'pitch' | 'career' | 'multiplayer' | 'match' | 'transfer' | 'training' | 'leaderboard';

export default function App() {
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [showExitModal, setShowExitModal] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<TabType>('pitch');
  const [soundActive, setSoundActive] = useState(true);
  const [clubBudget, setClubBudget] = useState(120000000); // €120M
  const [formation, setFormation] = useState<FormationKey>(() => {
    try {
      const saved = localStorage.getItem('fut_formation_v1') as FormationKey;
      if (saved && FORMATION_CONFIGS[saved]) return saved;
    } catch {}
    return '4-3-3';
  });

  // Starter 11 Squad
  const [squad, setSquad] = useState<Record<string, Player | null>>(() => {
    const defaultSquad: Record<string, Player | null> = {
      gk: REAL_STAR_PLAYERS.find(p => p.role === 'GK') || REAL_STAR_PLAYERS[10],
      lb: REAL_STAR_PLAYERS.find(p => p.role === 'LB') || generateRandomPlayer('LB', 'Braziliya'),
      cb1: REAL_STAR_PLAYERS.find(p => p.role === 'CB') || REAL_STAR_PLAYERS[9],
      cb2: generateRandomPlayer('CB', 'Germaniya'),
      rb: generateRandomPlayer('RB', 'Angliya'),
      cm1: REAL_STAR_PLAYERS.find(p => p.role === 'CMF') || REAL_STAR_PLAYERS[6],
      cdm: REAL_STAR_PLAYERS.find(p => p.role === 'DMF') || REAL_STAR_PLAYERS[7],
      cm2: REAL_STAR_PLAYERS.find(p => p.name.includes('Modrić')) || REAL_STAR_PLAYERS[8],
      lw: REAL_STAR_PLAYERS.find(p => p.role === 'LWF') || REAL_STAR_PLAYERS[2],
      st: REAL_STAR_PLAYERS.find(p => p.role === 'CF') || REAL_STAR_PLAYERS[0],
      rw: REAL_STAR_PLAYERS.find(p => p.role === 'RWF') || REAL_STAR_PLAYERS[12]
    };

    try {
      const saved = localStorage.getItem('fut_squad_v1');
      if (saved) {
        const raw = JSON.parse(saved);
        const seen = new Set<string>();
        const clean: Record<string, Player | null> = {};
        for (const [k, p] of Object.entries(raw)) {
          const player = p as Player | null;
          if (player && !seen.has(player.id)) {
            seen.add(player.id);
            clean[k] = player;
          } else {
            clean[k] = null;
          }
        }
        return clean;
      }
    } catch {}

    return defaultSquad;
  });

  // Bench and Reserves
  const [bench, setBench] = useState<Player[]>(() => {
    try {
      const saved = localStorage.getItem('fut_bench_v1');
      if (saved) {
        const parsed: Player[] = JSON.parse(saved);
        return Array.from(new Map(parsed.map(p => [p.id, p])).values());
      }
    } catch {}
    // Pick players that are not in default top 11
    return REAL_STAR_PLAYERS.slice(1, 8);
  });

  const [reserves, setReserves] = useState<Player[]>(() => {
    return [
      REAL_STAR_PLAYERS.find(p => p.name.includes('Fayzullaev')),
      REAL_STAR_PLAYERS.find(p => p.name.includes('Shomurodov'))
    ].filter(Boolean) as Player[];
  });

  // Ensure no starter is duplicated in bench or reserves on load
  useEffect(() => {
    const starterIds = new Set(
      Object.values(squad)
        .filter((p): p is Player => Boolean(p))
        .map(p => p.id)
    );
    setBench(prev => {
      const filtered = prev.filter(p => !starterIds.has(p.id));
      return Array.from(new Map(filtered.map(p => [p.id, p])).values());
    });
    setReserves(prev => {
      const filtered = prev.filter(p => !starterIds.has(p.id));
      return Array.from(new Map(filtered.map(p => [p.id, p])).values());
    });
  }, [squad]);

  // Hall of Fame entries
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>(() => {
    try {
      const saved = localStorage.getItem('fut_leaderboard_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Persist squad, formation & bench
  useEffect(() => {
    try {
      localStorage.setItem('fut_squad_v1', JSON.stringify(squad));
      localStorage.setItem('fut_bench_v1', JSON.stringify(bench));
      localStorage.setItem('fut_formation_v1', formation);
      localStorage.setItem('fut_leaderboard_v1', JSON.stringify(leaderboard));
    } catch {}
  }, [squad, bench, formation, leaderboard]);

  // Intelligent Formation Switcher (Remaps 11 starters so no player is lost and screen never goes blank)
  const handleFormationChange = (newFormation: FormationKey) => {
    setFormation(newFormation);
    const { newSquad, updatedBench } = remapSquadToFormation(squad, newFormation, bench);
    setSquad(newSquad);
    setBench(updatedBench);
    speakText(`Sxema ${newFormation} ga o‘zgartirildi`, true);
  };

  const toggleSound = () => {
    const next = toggleAudio();
    setSoundActive(next);
  };

  const handleAssignPlayer = (slotId: string, player: Player) => {
    setSquad(prev => {
      const updated: Record<string, Player | null> = {};
      (Object.entries(prev) as [string, Player | null][]).forEach(([key, p]) => {
        if (p && p.id === player.id) {
          updated[key] = null;
        } else {
          updated[key] = p;
        }
      });
      updated[slotId] = player;
      return updated;
    });
    // Remove from bench and reserves if was there
    setBench(prev => prev.filter(p => p.id !== player.id));
    setReserves(prev => prev.filter(p => p.id !== player.id));
  };

  const handleRemovePlayer = (slotId: string) => {
    const current = squad[slotId];
    if (current) {
      setBench(prev => (prev.some(p => p.id === current.id) ? prev : [...prev, current]));
      setSquad(prev => ({ ...prev, [slotId]: null }));
    }
  };

  // Swap positions on pitch
  const handleSwapPositions = (fromSlotId: string, toSlotId: string) => {
    setSquad(prev => {
      const copy = { ...prev };
      const temp = copy[fromSlotId];
      copy[fromSlotId] = copy[toSlotId];
      copy[toSlotId] = temp;
      return copy;
    });
  };

  // Swap bench player with pitch slot
  const handleSwapBenchPlayer = (benchPlayerId: string, targetSlotId: string) => {
    const benchPlayer =
      bench.find(p => p.id === benchPlayerId) || reserves.find(p => p.id === benchPlayerId);
    if (!benchPlayer) return;
    const currentStarter = squad[targetSlotId];
    setSquad(prev => ({ ...prev, [targetSlotId]: benchPlayer }));
    setBench(prev => {
      const filtered = prev.filter(p => p.id !== benchPlayerId);
      if (currentStarter) filtered.push(currentStarter);
      return filtered;
    });
  };

  const handleClearSquad = () => {
    const cleared: Record<string, Player | null> = {};
    Object.keys(squad).forEach(k => {
      if (squad[k]) {
        setBench(b => (b.some(x => x.id === squad[k]?.id) ? b : [...b, squad[k]!]));
      }
      cleared[k] = null;
    });
    setSquad(cleared);
  };

  const handleSaveToLeaderboard = (result: CareerResult) => {
    const newEntry: LeaderboardItem = {
      id: `lead_${Date.now()}`,
      name: result.player.name,
      pos: result.player.role,
      nation: `${result.player.nation.flag} ${result.player.nation.name}`,
      rating: result.player.ovr,
      bdo: result.ballonDor,
      wc: result.worldCupTitles,
      cl: result.clTitles,
      isUser: true,
      avatar: result.player.avatar
    };
    setLeaderboard(prev => [newEntry, ...prev]);
  };

  const handleAddPlayerToSquad = (player: Player) => {
    setBench(prev => (prev.some(p => p.id === player.id) ? prev : [player, ...prev]));
  };

  const handleMatchComplete = (res: { won: boolean; rewardMoney: number; xpReward: number }) => {
    setClubBudget(b => b + res.rewardMoney);
    // Give XP to starters
    setSquad(prev => {
      const updated: Record<string, Player | null> = {};
      (Object.entries(prev) as [string, Player | null][]).forEach(([k, p]) => {
        if (p) {
          const xp = Math.min(100, p.xp + res.xpReward);
          updated[k] = { ...p, xp };
        } else {
          updated[k] = null;
        }
      });
      return updated;
    });
  };

  const handleBuyPlayer = (player: Player) => {
    if (clubBudget < player.marketValue) return;
    setClubBudget(b => b - player.marketValue);
    setBench(b => (b.some(p => p.id === player.id) ? b : [player, ...b]));
  };

  const handleSellPlayer = (player: Player) => {
    setClubBudget(b => b + player.marketValue);
    setBench(b => b.filter(p => p.id !== player.id));
    setSquad(prev => {
      const updated = { ...prev };
      (Object.entries(updated) as [string, Player | null][]).forEach(([k, p]) => {
        if (p && p.id === player.id) updated[k] = null;
      });
      return updated;
    });
  };

  const handleUpdatePlayer = (updated: Player) => {
    setSquad(prev => {
      const copy = { ...prev };
      (Object.entries(copy) as [string, Player | null][]).forEach(([k, p]) => {
        if (p && p.id === updated.id) copy[k] = updated;
      });
      return copy;
    });
    setBench(prev => prev.map(p => (p.id === updated.id ? updated : p)));
  };

  const starterList = Object.values(squad).filter((p): p is Player => Boolean(p));
  // Ensure unique list of all squad players across pitch, bench, and reserves
  const allSquadPlayers = React.useMemo(() => {
    const map = new Map<string, Player>();
    for (const p of [...starterList, ...bench, ...reserves]) {
      if (p && !map.has(p.id)) {
        map.set(p.id, p);
      }
    }
    return Array.from(map.values());
  }, [starterList, bench, reserves]);

  return (
    <div className="min-h-screen w-full bg-[#070a1a] text-white flex flex-col font-sans relative overflow-x-hidden selection:bg-cyan-500 selection:text-black">
      {/* Smooth Entrance / Loading Splash Screen */}
      {showSplash && <EntranceSplashScreen onComplete={() => setShowSplash(false)} />}

      {/* Stadium Atmospheric Glows */}
      <div className="fixed -top-40 -left-40 w-96 h-96 rounded-full bg-purple-600/20 filter blur-[100px] pointer-events-none" />
      <div className="fixed -bottom-40 -right-40 w-96 h-96 rounded-full bg-cyan-500/20 filter blur-[100px] pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-blue-600/10 filter blur-[140px] pointer-events-none" />

      {/* Main Glass Header */}
      <header className="sticky top-0 z-40 w-full px-4 py-3 bg-slate-950/80 border-b border-white/10 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-3">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 via-blue-600 to-purple-600 flex items-center justify-center text-xl shadow-lg shadow-cyan-500/30">
              ⚽
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-lg tracking-tight bg-gradient-to-r from-white via-cyan-200 to-amber-300 bg-clip-text text-transparent">
                  Futbol Taqdiri & Karyera
                </h1>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  PRO v4.2
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Haqiqiy futbol qonuniyatlari, 1v1 multiplayer va taktik simulyatsiya
              </p>
            </div>
          </div>

          {/* Right Header Badges: Exit Emoji, Budget, Audio Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => {
                sfxClick();
                speakText(
                  "Futbol Taqdiri o'yini: Ovozli sharh faol. Lotereya, o'yinchi mashg'ulotlari va transfer bozorida ovozli eshittirish yoqilgan.",
                  true
                );
              }}
              title="Ko'zi ojizlar uchun ovozli sharhni sinash"
              aria-label="Ovozli sharh yordamchisini eshitish"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-bold transition-all cursor-pointer"
            >
              <Headphones className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
              <span className="hidden sm:inline">Ovozli Sharh</span>
            </button>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/[0.05] border border-white/10 backdrop-blur-md">
              <Coins className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-black text-amber-300">
                €{(clubBudget / 1_000_000).toFixed(1)}M
              </span>
            </div>

            <button
              onClick={toggleSound}
              className="p-2 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
              title={soundActive ? 'Ovozni o‘chirish' : 'Ovozni yoqish'}
              aria-label={soundActive ? 'Tovush effektlarini o‘chirish' : 'Tovush effektlarini yoqish'}
            >
              {soundActive ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-red-400" />}
            </button>

            {/* Requested Small Emoji-Only Exit Button */}
            <button
              onClick={() => {
                sfxClick();
                setShowExitModal(true);
              }}
              className="p-2 rounded-2xl bg-white/[0.05] hover:bg-red-500/20 hover:border-red-400/40 border border-white/10 text-lg transition-all cursor-pointer select-none"
              title="Ilovadan Chiqish"
              aria-label="Ilovadan chiqish"
            >
              🚪
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div
          role="tablist"
          aria-label="Asosiy bo'limlar"
          className="max-w-7xl mx-auto mt-3 flex gap-1.5 overflow-x-auto pb-1 no-scrollbar"
        >
          {[
            { id: 'pitch', label: 'Taktik Plan & Jamoa', icon: <Users className="w-3.5 h-3.5" /> },
            { id: 'career', label: 'Karyera Lotereyasi', icon: <Sparkles className="w-3.5 h-3.5" /> },
            { id: 'multiplayer', label: '1v1 Onlayn Multiplayer', icon: <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" /> },
            { id: 'match', label: 'Jonli Match', icon: <Swords className="w-3.5 h-3.5" /> },
            { id: 'transfer', label: 'Transfer Bozori', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
            { id: 'training', label: 'Rivojlantirish', icon: <Dumbbell className="w-3.5 h-3.5" /> },
            { id: 'leaderboard', label: 'Shon-sharaf Zali', icon: <Trophy className="w-3.5 h-3.5" /> }
          ].map(tab => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-label={`${tab.label} bo‘limi`}
              onClick={() => {
                sfxClick();
                setActiveTab(tab.id as TabType);
                speakText(`${tab.label} bo‘limiga o‘tildi`, true);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black tracking-wide whitespace-nowrap transition-all cursor-pointer border ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-cyan-500/20 via-blue-600/30 to-purple-600/20 border-cyan-400 text-white shadow-lg shadow-cyan-500/25 scale-102'
                  : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <span className={activeTab === tab.id ? 'text-cyan-300' : 'text-slate-400'}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'pitch' && (
          <PitchBoard
            squad={squad}
            bench={bench}
            reserves={reserves}
            formation={formation}
            onFormationChange={handleFormationChange}
            onAssignPlayer={handleAssignPlayer}
            onRemovePlayer={handleRemovePlayer}
            onSwapPositions={handleSwapPositions}
            onSwapBenchPlayer={handleSwapBenchPlayer}
            onUpdatePlayer={handleUpdatePlayer}
            onClearSquad={handleClearSquad}
            availablePlayers={allSquadPlayers}
          />
        )}

        {activeTab === 'multiplayer' && (
          <MultiplayerRoom mySquad={squad} myClubName="Mening FC" onUpdateSquad={setSquad} />
        )}

        {activeTab === 'career' && (
          <CareerMode
            onSaveToLeaderboard={handleSaveToLeaderboard}
            onAddPlayerToSquad={handleAddPlayerToSquad}
          />
        )}

        {activeTab === 'match' && (
          <MatchSimulator
            userSquad={starterList.length ? starterList : allSquadPlayers}
            clubBudget={clubBudget}
            onMatchComplete={handleMatchComplete}
          />
        )}

        {activeTab === 'transfer' && (
          <TransferMarket
            clubBudget={clubBudget}
            userSquad={allSquadPlayers}
            onBuyPlayer={handleBuyPlayer}
            onSellPlayer={handleSellPlayer}
          />
        )}

        {activeTab === 'training' && (
          <PlayerTraining userSquad={allSquadPlayers} onUpdatePlayer={handleUpdatePlayer} />
        )}

        {activeTab === 'leaderboard' && (
          <Leaderboard
            entries={leaderboard}
            onSimulateRivals={() => {
              const bot = generateRandomPlayer();
              const newEntry: LeaderboardItem = {
                id: `bot_${Date.now()}`,
                name: bot.name,
                pos: bot.role,
                nation: `${bot.nation.flag} ${bot.nation.name}`,
                rating: bot.ovr,
                bdo: bot.ovr >= 95 ? 1 : 0,
                wc: bot.ovr >= 93 ? 1 : 0,
                cl: bot.ovr >= 90 ? 2 : 0,
                isUser: false,
                avatar: bot.avatar
              };
              setLeaderboard(prev => [newEntry, ...prev]);
            }}
          />
        )}
      </main>

      {/* Exit Confirmation Modal */}
      {showExitModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setShowExitModal(false)}
        >
          <div
            className="relative max-w-sm w-full p-6 rounded-3xl bg-slate-900 border border-white/20 shadow-2xl flex flex-col items-center gap-4 text-center"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-16 h-16 rounded-3xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-3xl">
              🚪
            </div>
            <h3 className="text-lg font-black text-white">Ilovadan Chiqish</h3>
            <p className="text-xs text-slate-300">
              Bosh sahifa / Kirish animatsiyasiga qaytishni yoki seansni to‘xtatishni xohlaysizmi?
            </p>
            <div className="flex gap-2 w-full mt-2">
              <button
                onClick={() => {
                  setShowExitModal(false);
                  setShowSplash(true);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-black text-xs transition-colors cursor-pointer"
              >
                Kirish ekraniga qaytish
              </button>
              <button
                onClick={() => setShowExitModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-slate-300 font-bold text-xs transition-colors cursor-pointer"
              >
                Bekor qilish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Note */}
      <footer className="w-full py-4 border-t border-white/5 text-center text-xs text-slate-500">
        <p>Futbol Taqdiri & Karyera — GitHub Pages va istalgan brauzerda 100% mustaqil ishlaydi.</p>
      </footer>
    </div>
  );
}
