import React, { useState, useEffect } from 'react';
import { Player, FormationKey, CareerResult, LeaderboardItem, PositionRole, SpecialPack, GoogleUserAccount, PackOpenLog } from './types';
import { REAL_STAR_PLAYERS, generateRandomPlayer } from './data/realPlayers';
import { FORMATION_CONFIGS, remapSquadToFormation } from './data/formations';
import { DEFAULT_SPECIAL_PACKS } from './data/defaultPacks';
import { PitchBoard } from './components/PitchBoard';
import { CareerMode } from './components/CareerMode';
import { MatchSimulator } from './components/MatchSimulator';
import { TransferMarket } from './components/TransferMarket';
import { PlayerTraining } from './components/PlayerTraining';
import { Leaderboard } from './components/Leaderboard';
import { MultiplayerRoom } from './components/MultiplayerRoom';
import { EntranceSplashScreen } from './components/EntranceSplashScreen';
import { SpecialPacksMarket } from './components/SpecialPacksMarket';
import { EpicWalkoutModal } from './components/EpicWalkoutModal';
import { PackOpeningCutscene } from './components/PackOpeningCutscene';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import { AdminPackManager } from './components/AdminPackManager';
import { TelegramBotManager } from './components/TelegramBotManager';
import { DataSyncBackupModal } from './components/DataSyncBackupModal';
import { EpicCardStudioModal } from './components/EpicCardStudioModal';
import { AppUpdateModal } from './components/AppUpdateModal';
import { shouldPromptUserUpdate } from './utils/versionControl';
import { toggleAudio, isAudioEnabled, sfxClick, sfxCardFlip, sfxWhistle, sfxSpendCoins } from './utils/audio';
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
  X,
  Shield,
  Zap,
  LogIn,
  Gift
} from 'lucide-react';

type TabType = 'pitch' | 'special_packs' | 'career' | 'multiplayer' | 'match' | 'transfer' | 'training' | 'leaderboard';

const DEFAULT_AVATAR_FALLBACK = {
  skinTone: '#f4caa1',
  hairStyle: 'short-fade' as const,
  hairColor: '#1e293b',
  facialHair: 'none' as const,
  kitPrimaryColor: '#0284c7',
  kitSecondaryColor: '#ffffff',
  likenessName: 'player'
};

function safeSanitizePlayer(p: any): Player | null {
  if (!p || typeof p !== 'object') return null;
  if (!p.avatar || typeof p.avatar !== 'object' || !p.avatar.skinTone) {
    p.avatar = {
      ...DEFAULT_AVATAR_FALLBACK,
      ...(p.avatar || {})
    };
  }
  const ovr = typeof p.ovr === 'number' && !isNaN(p.ovr) ? p.ovr : 75;
  p.ovr = ovr;
  if (!p.attrs || typeof p.attrs !== 'object') {
    p.attrs = {
      pac: Math.max(50, ovr - 4),
      sho: Math.max(50, ovr - 7),
      pas: Math.max(50, ovr - 5),
      dri: Math.max(50, ovr - 4),
      def: 65,
      phy: 70
    };
  }
  if (!p.name) p.name = 'Futbolchi';
  if (!p.role) p.role = 'CMF';
  if (!p.nation || typeof p.nation !== 'object') {
    p.nation = { code: 'UZ', name: 'O‘zbekiston', flag: '🇺🇿', power: 0.8, confederation: 'afc' };
  }
  return p as Player;
}

function loadAndSyncSpecialPacks(): SpecialPack[] {
  try {
    const saved = localStorage.getItem('efootball_packs_v1');
    if (saved !== null) {
      const parsed: SpecialPack[] = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        // Filter out legacy default packs to satisfy the user request: "Oyinda hozir hech qanday pack bolmasin"
        const customPacks = parsed
          .filter(sp => !DEFAULT_SPECIAL_PACKS.some(dp => dp.id === sp.id || dp.name.toLowerCase().trim() === sp.name?.toLowerCase().trim()))
          .map(sp => ({
            ...sp,
            players: (sp.players || []).map(p => safeSanitizePlayer(p)!).filter(Boolean),
            originalPlayers: (sp.originalPlayers || sp.players || []).map(p => safeSanitizePlayer(p)!).filter(Boolean)
          }))
          .filter(sp => Boolean(sp && sp.id && sp.name));
        return customPacks;
      }
    }
    return [];
  } catch (e) {
    console.warn('Pack yuklashda xatolik:', e);
    return [];
  }
}

export default function App() {
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [showExitModal, setShowExitModal] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<TabType>('pitch');
  const [soundActive, setSoundActive] = useState(true);
  const [clubBudget, setClubBudget] = useState(120000000); // €120M

  // Google User Account (Mehmon sifatida boshlanadi, faqat Google va 2FA Tasdiq orqali Admin bo'ladi)
  const [currentUser, setCurrentUser] = useState<GoogleUserAccount | null>(() => {
    try {
      const saved = localStorage.getItem('efootball_user_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Faqat haqiqiy Google va 2FA Tasdiq Amallari orqali tasdiqlangan bo'lsagina admin huquqi beriladi
        const isOwner = parsed?.email && ['husananorqulov7431@gmail.com', 'geminiai7431@gmail.com'].includes(parsed.email.toLowerCase());
        if (!isOwner || !parsed.adminVerified) {
          parsed.isAdmin = false;
        }
        return parsed;
      }
    } catch {}
    return {
      email: '',
      displayName: 'Mehmon Menejer',
      isAdmin: false,
      isGoogleVerified: false,
      adminVerified: false,
      gp: 1000,
      eCoins: 100,
      matchesPlayed: 0,
      matchesWon: 0,
      matchesDrawn: 0,
      matchesLost: 0,
      goalsScored: 0,
      goalsConceded: 0,
      signedInAt: Date.now()
    };
  });
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showAdminPackModal, setShowAdminPackModal] = useState<boolean>(false);
  const [showTelegramBotModal, setShowTelegramBotModal] = useState<boolean>(false);
  const [showSyncModal, setShowSyncModal] = useState<boolean>(false);
  const [epicWalkoutPlayer, setEpicWalkoutPlayer] = useState<Player | null>(null);
  const [activeCutscenePull, setActiveCutscenePull] = useState<{
    players: Player[];
    packName: string;
  } | null>(null);

  // Pack open history logs for Telegram Bot & statistics
  const [packOpenLogs, setPackOpenLogs] = useState<PackOpenLog[]>(() => {
    try {
      const saved = localStorage.getItem('efootball_pack_open_logs_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('efootball_pack_open_logs_v1', JSON.stringify(packOpenLogs));
    } catch {}
  }, [packOpenLogs]);

  // eFootball 2026 Special Packs State (Sinxronlashtirilgan va xatoliklardan himoyalangan)
  const [specialPacks, setSpecialPacks] = useState<SpecialPack[]>(() => {
    return loadAndSyncSpecialPacks();
  });
  const [showEpicStudioModal, setShowEpicStudioModal] = useState<boolean>(false);
  const [showGlobalUpdateModal, setShowGlobalUpdateModal] = useState<boolean>(false);
  const [syncToastMessage, setSyncToastMessage] = useState<string | null>(null);

  // Check if a new pack release is available on app entry
  useEffect(() => {
    if (shouldPromptUserUpdate(specialPacks)) {
      setShowGlobalUpdateModal(true);
    }
  }, [specialPacks]);

  // Auto-sync packs to persistent storage and live backend for Telegram Bot
  useEffect(() => {
    try {
      localStorage.setItem('efootball_packs_v1', JSON.stringify(specialPacks));
      fetch('/api/packs/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(specialPacks)
      }).catch(() => {});
    } catch (e) {
      console.error('Packlarni sinxronlashda xatolik:', e);
    }
  }, [specialPacks]);

  const handleForceSyncPacks = () => {
    if (!currentUser?.isAdmin) {
      setSyncToastMessage("⚠️ Faqat Bosh Admin packlarni sinxronlashi mumkin. Iltimos, admin bilan bog'laning.");
      setTimeout(() => setSyncToastMessage(null), 5000);
      sfxWhistle();
      speakText("Faqat Bosh Admin packlarni sinxronlashi mumkin. Iltimos, admin bilan bog'laning.", true);
      return;
    }

    fetch('/api/packs/sync')
      .then(r => r.json())
      .then(res => {
        if (res.ok && Array.isArray(res.packs)) {
          setSpecialPacks(res.packs);
          localStorage.setItem('efootball_packs_v1', JSON.stringify(res.packs));
        }
      })
      .catch(() => {});

    sfxWhistle();
    setSyncToastMessage("✅ Packlar va Telegram Bot muvaffaqiyatli sinxronlashtirildi!");
    setTimeout(() => setSyncToastMessage(null), 5000);
    speakText("Packlar Telegram Bot bilan muvaffaqiyatli sinxronlashtirildi!", true);
  };

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
          const player = safeSanitizePlayer(p);
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
        return Array.from(new Map(parsed.map(p => safeSanitizePlayer(p)).filter((p): p is Player => Boolean(p)).map(p => [p.id, p])).values());
      }
    } catch {}
    // Pick players that are not in default top 11
    return REAL_STAR_PLAYERS.slice(1, 8);
  });

  const [reserves, setReserves] = useState<Player[]>(() => {
    return [
      REAL_STAR_PLAYERS.find(p => p.name.includes('Fayzullaev')),
      REAL_STAR_PLAYERS.find(p => p.name.includes('Shomurodov'))
    ].map(p => safeSanitizePlayer(p)).filter(Boolean) as Player[];
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

  // Persist squad, formation, bench, packs & user
  useEffect(() => {
    try {
      localStorage.setItem('fut_squad_v1', JSON.stringify(squad));
      localStorage.setItem('fut_bench_v1', JSON.stringify(bench));
      localStorage.setItem('fut_formation_v1', formation);
      localStorage.setItem('fut_leaderboard_v1', JSON.stringify(leaderboard));
      if (currentUser) {
        localStorage.setItem('efootball_user_v1', JSON.stringify(currentUser));
      }
      localStorage.setItem('efootball_packs_v1', JSON.stringify(specialPacks));
    } catch {}
  }, [squad, bench, formation, leaderboard, currentUser, specialPacks]);

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

  const handleRestoreStamina = () => {
    sfxWhistle();
    setSquad(prev => {
      const updated: Record<string, Player | null> = {};
      (Object.entries(prev) as [string, Player | null][]).forEach(([k, p]) => {
        if (p) updated[k] = { ...p, stamina: 100 };
        else updated[k] = null;
      });
      return updated;
    });
    setBench(prev => prev.map(p => ({ ...p, stamina: 100 })));
    setReserves(prev => prev.map(p => ({ ...p, stamina: 100 })));
    speakText("Barcha futbolchilarning joni va charchoqlari 100% ga tiklandi!", true);
  };

  const handleMatchComplete = (res: {
    won: boolean;
    isDraw?: boolean;
    rewardMoney: number;
    xpReward: number;
    userGoals?: number;
    oppGoals?: number;
  }) => {
    setClubBudget(b => b + res.rewardMoney);

    // GP Reward & match stats tracker for official player profile:
    // Win = +50 GP, Draw = +20 GP, Loss = +10 GP (20 wins = 1000 GP = 10-pack pull)
    const gpGain = res.won ? 50 : res.isDraw ? 20 : 10;
    setCurrentUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        gp: prev.gp + gpGain,
        matchesPlayed: (prev.matchesPlayed || 0) + 1,
        matchesWon: prev.matchesWon + (res.won ? 1 : 0),
        matchesDrawn: (prev.matchesDrawn || 0) + (res.isDraw ? 1 : 0),
        matchesLost: (prev.matchesLost || 0) + (!res.won && !res.isDraw ? 1 : 0),
        goalsScored: (prev.goalsScored || 0) + (res.userGoals ?? (res.won ? 2 : 1)),
        goalsConceded: (prev.goalsConceded || 0) + (res.oppGoals ?? (res.won ? 0 : 2))
      };
    });

    // Real game fatigue mechanics: On-pitch starters consume 15-22% stamina
    setSquad(prev => {
      const updated: Record<string, Player | null> = {};
      (Object.entries(prev) as [string, Player | null][]).forEach(([k, p]) => {
        if (p) {
          const xp = Math.min(100, p.xp + res.xpReward);
          const currentStamina = p.stamina ?? 100;
          const drain = 15 + Math.floor(Math.random() * 8);
          const stamina = Math.max(10, currentStamina - drain);
          updated[k] = { ...p, xp, stamina };
        } else {
          updated[k] = null;
        }
      });
      return updated;
    });

    // Bench & reserves players rest and recover stamina: +25%
    setBench(prev =>
      prev.map(p => ({
        ...p,
        stamina: Math.min(100, (p.stamina ?? 100) + 25)
      }))
    );
    setReserves(prev =>
      prev.map(p => ({
        ...p,
        stamina: Math.min(100, (p.stamina ?? 100) + 25)
      }))
    );
  };

  const handleDeletePack = (packId: string) => {
    setSpecialPacks(prev => {
      const next = prev.filter(p => p.id !== packId);
      try {
        localStorage.setItem('efootball_packs_v1', JSON.stringify(next));
      } catch {}
      return next;
    });
    sfxCardFlip();
    speakText("Pack muvaffaqiyatli o'chirildi.", true);
  };

  // Box Draw qutisini boshlang'ich holatiga qayta to'ldirish
  const handleResetPackBox = (packId: string) => {
    setSpecialPacks(prev => {
      const next = prev.map(p => {
        if (p.id !== packId) return p;
        const restored = p.originalPlayers && p.originalPlayers.length > 0 ? [...p.originalPlayers] : [...p.players];
        return {
          ...p,
          players: restored,
          pulledCount: 0,
          totalPoolCount: restored.length
        };
      });
      try {
        localStorage.setItem('efootball_packs_v1', JSON.stringify(next));
      } catch {}
      return next;
    });
    sfxCardFlip();
    speakText("Quti o'yinchilari qayta to'ldirildi.", true);
  };

  const handleSavePlayerToPack = (player: Player, targetPackId?: string, newPackName?: string) => {
    setSpecialPacks(prev => {
      let updatedPacks = [...prev];
      if (targetPackId === 'new_pack' || (!targetPackId && newPackName)) {
        const newPack: SpecialPack = {
          id: `custom_pack_${Date.now()}`,
          name: newPackName || `${player.name} & Afsonalar Packi`,
          badge: 'EPIC',
          description: `Maxsus ${player.name} va tanlangan o'yinchilar qutisi`,
          themeColor: 'amber',
          expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
          freePullsTotal: 10,
          freePullsRemaining: 10,
          costPer1: 100,
          costPer10: 1000,
          pulledCount: 0,
          totalPoolCount: 100,
          players: [player],
          originalPlayers: [player],
          createdAt: Date.now(),
          createdBy: 'admin'
        };
        updatedPacks = [newPack, ...updatedPacks];
      } else if (targetPackId) {
        updatedPacks = updatedPacks.map(p => {
          if (p.id !== targetPackId) return p;
          const exists = p.players.some(pl => pl.id === player.id);
          const nextPlayers = exists ? p.players.map(pl => pl.id === player.id ? player : pl) : [player, ...p.players];
          return {
            ...p,
            players: nextPlayers,
            originalPlayers: nextPlayers,
            totalPoolCount: Math.max(p.totalPoolCount || 100, nextPlayers.length)
          };
        });
      }
      return updatedPacks;
    });
    sfxWhistle();
    setSyncToastMessage(`✅ ${player.name} packga muvaffaqiyatli saqlandi!`);
    setTimeout(() => setSyncToastMessage(null), 4000);
  };

  const handleOpenPack = (pack: SpecialPack, pullCount: 1 | 10) => {
    const isAdmin = currentUser?.isAdmin || false;
    const hasFree = (pack.freePullsRemaining ?? 0) >= pullCount;
    const cost = pullCount === 10 ? (pack.costPer10 || 1000) : (pack.costPer1 || 100);
    const userGp = currentUser?.gp ?? 0;

    // Check GP only if not admin and has no free pulls
    if (!isAdmin && !hasFree && userGp < cost) {
      speakText("GP yetarli emas! 20 ta matchda g'alaba qozonib 1000 GP yig'ing.", true);
      return;
    }

    let spentGp = 0;
    // Admin opens completely FREE!
    if (isAdmin) {
      spentGp = 0;
      sfxSpendCoins();
    } else if (hasFree) {
      spentGp = 0;
      sfxSpendCoins();
    } else {
      spentGp = cost;
      sfxSpendCoins();
      setCurrentUser(prev => (prev ? { ...prev, gp: Math.max(0, prev.gp - cost) } : null));
    }

    // PES Box Draw: mavjud o'yinchilar qutisi
    let currentPool = pack.players && pack.players.length > 0 ? [...pack.players] : [];
    const originalPool = pack.originalPlayers && pack.originalPlayers.length > 0
      ? [...pack.originalPlayers]
      : (pack.players && pack.players.length > 0 ? [...pack.players] : [generateRandomPlayer()]);

    // Agar quti o'yinchilari tugab qolgan bo'lsa, uni avtomatik qayta tiklaymiz
    if (currentPool.length === 0) {
      currentPool = [...originalPool];
    }

    const actualPullsCount = Math.min(pullCount, currentPool.length);
    const pulledPlayers: Player[] = [];
    const chosenPlayerIds = new Set<string>();

    for (let i = 0; i < actualPullsCount; i++) {
      // Qutidagi tanlanmagan qolgan o'yinchilar
      const remainingCandidates = currentPool.filter(p => !chosenPlayerIds.has(p.id));
      if (remainingCandidates.length === 0) break;

      const epics = remainingCandidates.filter(p => p.ovr >= 89);
      const highlights = remainingCandidates.filter(p => p.ovr >= 84 && p.ovr < 89);

      // Haqiqiy eFootball Omadli Baraban (Genuine Luck Box Draw) tizimi:
      // Har bir aylantirishda (hatto bitta free'da ham!) sof omadli zarba ehtimoli bor.
      const luckRoll = Math.random() * 100;
      let chosen: Player;

      // 1. Omad Chaqnashi (Lucky Strike): Agar omad kelsa (~12% imkoniyat), darhol mavjud Epic tanlanadi!
      // 10 talik ochishda so'nggi kartalarda omad ehtimoli yanada oshadi.
      const isLuckyEpic = epics.length > 0 && (luckRoll <= 12.0 || (pullCount === 10 && i === actualPullsCount - 1 && Math.random() < 0.20));
      const isLuckyHighlight = !isLuckyEpic && highlights.length > 0 && luckRoll <= 38.0;

      if (isLuckyEpic) {
        chosen = epics[Math.floor(Math.random() * epics.length)];
      } else if (isLuckyHighlight) {
        chosen = highlights[Math.floor(Math.random() * highlights.length)];
      } else {
        // 2. Haqiqiy Tasodifiy Baraban: Qutidagi har bitta qolgan koptok to'laqonli teng imkoniyatga ega.
        // Bu orqali Epic koptogi tabiiy lotereya orqali ham to'g'ridan-to'g'ri ilinib qolishi mumkin!
        chosen = remainingCandidates[Math.floor(Math.random() * remainingCandidates.length)];
      }

      chosenPlayerIds.add(chosen.id);
      pulledPlayers.push({
        ...chosen,
        id: `${chosen.id}_pull_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`,
        stamina: 100
      });
    }

    // Tushgan o'yinchilar qutidan chiqarib tashlanadi (Box Draw tamoyili)
    const updatedPool = currentPool.filter(p => !chosenPlayerIds.has(p.id));

    // SpecialPack holatini yangilash va localStorage ga yozish
    setSpecialPacks(prev => {
      const next = prev.map(p => {
        if (p.id !== pack.id) return p;
        return {
          ...p,
          players: updatedPool,
          originalPlayers: originalPool,
          totalPoolCount: originalPool.length,
          pulledCount: (p.pulledCount ?? 0) + pulledPlayers.length,
          freePullsRemaining: hasFree ? Math.max(0, (p.freePullsRemaining ?? 0) - actualPullsCount) : p.freePullsRemaining
        };
      });
      try {
        localStorage.setItem('efootball_packs_v1', JSON.stringify(next));
      } catch {}
      return next;
    });

    // Add all to squad bench safely
    setBench(prev => [...pulledPlayers, ...prev]);

    // Record open log for Telegram Bot & statistics
    const newLog: PackOpenLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      packId: pack.id,
      packName: pack.name,
      userEmail: currentUser?.email || 'guest@efootball.app',
      userName: currentUser?.displayName || 'O\'yinchi',
      pullCount,
      spentGp,
      pulledPlayers: pulledPlayers.map(p => ({
        id: p.id,
        name: p.name,
        ovr: p.ovr,
        role: p.role,
        isEpic: p.ovr >= 89
      })),
      timestamp: Date.now()
    };
    setPackOpenLogs(prev => [newLog, ...prev]);

    // Trigger full 3D Cutscene: Suspense -> 3D Card Lift -> Team Welcome & Cheers
    setActiveCutscenePull({
      players: pulledPlayers,
      packName: pack.name
    });
  };

  const handleCreateCustomPack = (newPack: SpecialPack) => {
    setSpecialPacks(prev => {
      const next = [newPack, ...prev];
      try {
        localStorage.setItem('efootball_packs_v1', JSON.stringify(next));
      } catch {}
      return next;
    });
    setShowAdminPackModal(false);
    sfxCardFlip();
    speakText(`Yangi maxsus pack muvaffaqiyatli yuklandi va barcha foydalanuvchilar uchun ochildi!`, true);
  };

  // LocalStorage va GitHub orqali ma'lumotlarni tiklash
  const handleImportFromSync = (
    importedPacks?: SpecialPack[],
    importedUser?: GoogleUserAccount | null,
    importedSquad?: Record<string, Player | null>
  ) => {
    if (importedPacks && Array.isArray(importedPacks)) {
      setSpecialPacks(importedPacks);
      try {
        localStorage.setItem('efootball_packs_v1', JSON.stringify(importedPacks));
      } catch {}
    }
    if (importedUser) {
      setCurrentUser(importedUser);
      try {
        localStorage.setItem('efootball_user_v1', JSON.stringify(importedUser));
      } catch {}
    }
    if (importedSquad) {
      setSquad(importedSquad);
      try {
        localStorage.setItem('fut_squad_v1', JSON.stringify(importedSquad));
      } catch {}
    }
    sfxWhistle();
    speakText("Ma'lumotlar muvaffaqiyatli tiklandi va yangilandi!", true);
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
      {showSplash && (
        <EntranceSplashScreen
          onComplete={() => {
            setShowSplash(false);
            // After entrance splash animation, open Google account registration / welcome modal
            const hasSeen = localStorage.getItem('efootball_auth_prompted_v1');
            if (!hasSeen) {
              setShowAuthModal(true);
              localStorage.setItem('efootball_auth_prompted_v1', 'true');
            }
          }}
        />
      )}

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

          {/* Right Header Badges: Google Profile, GP, Budget, Audio, Exit */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
            {/* Google Profile & GP Currency */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => {
                  sfxClick();
                  setShowAuthModal(true);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-2xl border border-white/15 bg-white/[0.06] hover:bg-white/10 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
                title="O‘yinchi Profilini Ko‘rish"
              >
                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-xs font-black text-slate-900 shadow-sm">
                  {currentUser?.photoURL ? (
                    <img src={currentUser.photoURL} alt="avatar" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    'G'
                  )}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] sm:text-xs font-black leading-none text-white">
                    {currentUser?.displayName || 'Google bilan kirish'}
                  </span>
                  <span className="text-[9px] text-slate-400 leading-tight truncate max-w-[120px]">
                    {currentUser?.email ? 'O‘yinchi Profili' : 'Hisobga ulanish'}
                  </span>
                </div>
              </button>

              {/* GP Balance with 20-win tooltip */}
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-500/15 border border-amber-400/40 backdrop-blur-md"
                title={`${currentUser?.matchesWon ?? 0} ta g‘alaba. 20 ta g‘alaba = 1000 GP = 1 ta 10 talik pack!`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="text-xs font-black text-amber-300">
                  {(currentUser?.gp ?? 0).toLocaleString()} GP
                </span>
              </div>
            </div>

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
              <span className="hidden sm:inline">Ovoz</span>
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
            { id: 'special_packs', label: 'eFootball 2026 Packlar', icon: <Gift className="w-3.5 h-3.5 text-amber-400" /> },
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
            onRestoreStamina={handleRestoreStamina}
          />
        )}

        {/* Floating Sync & Success Notification Banner */}
        {syncToastMessage && (
          <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/20 border border-emerald-500/50 shadow-xl shadow-emerald-500/10 flex items-center justify-between text-emerald-300 text-xs font-bold animate-bounce-subtle">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span>{syncToastMessage}</span>
            </div>
            <button
              onClick={() => setSyncToastMessage(null)}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {activeTab === 'special_packs' && (
          <SpecialPacksMarket
            packs={specialPacks}
            currentUser={currentUser}
            onOpenPack={handleOpenPack}
            onOpenAdminManager={() => setShowAdminPackModal(true)}
            onOpenEpicStudio={() => setShowEpicStudioModal(true)}
            onSelectPlayerPreview={(player) =>
              setActiveCutscenePull({ players: [player], packName: 'O‘yinchi Ko‘rigi' })
            }
            onDeletePack={handleDeletePack}
            onResetPackBox={handleResetPackBox}
            onOpenTelegramHub={() => setShowTelegramBotModal(true)}
            onOpenSyncHub={() => setShowSyncModal(true)}
            onSyncPacks={handleForceSyncPacks}
          />
        )}

        {activeTab === 'multiplayer' && (
          <MultiplayerRoom mySquad={squad} myClubName="Mening FC" onUpdateSquad={setSquad} />
        )}

        {activeTab === 'career' && (
          <CareerMode
            onSaveToLeaderboard={handleSaveToLeaderboard}
            onAddPlayerToSquad={handleAddPlayerToSquad}
            userDisplayName={currentUser?.displayName}
            onTriggerEpicWalkout={p => setEpicWalkoutPlayer(p)}
            onRewardGp={amt =>
              setCurrentUser(prev => (prev ? { ...prev, gp: prev.gp + amt } : null))
            }
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
        <p>Futbol Taqdiri & Karyera — eFootball 2026 uslubidagi maxsus packlar va animatsiyalar bilan.</p>
      </footer>

      {/* 3D Walkout, Card Lift & Team Welcome Cutscene Modal */}
      {activeCutscenePull && (
        <PackOpeningCutscene
          pulledPlayers={activeCutscenePull.players}
          existingSquad={starterList.length ? starterList : allSquadPlayers}
          packName={activeCutscenePull.packName}
          onClose={() => setActiveCutscenePull(null)}
        />
      )}

      {/* Single player walkout cutscene (from Career Mode or direct preview) */}
      {epicWalkoutPlayer && !activeCutscenePull && (
        <PackOpeningCutscene
          pulledPlayers={[epicWalkoutPlayer]}
          existingSquad={starterList.length ? starterList : allSquadPlayers}
          packName="eFootball™ 2026 Walkout"
          onClose={() => setEpicWalkoutPlayer(null)}
        />
      )}

      {/* Google Authentication & Official Player Profile Modal */}
      {showAuthModal && (
        <GoogleAuthModal
          currentUser={currentUser}
          onLogin={(user) => {
            setCurrentUser(user);
            setShowAuthModal(false);
          }}
          onLogout={() => {
            const guestUser: GoogleUserAccount = {
              email: '',
              displayName: 'Mehmon Menejer',
              isAdmin: false,
              isGoogleVerified: false,
              adminVerified: false,
              gp: 1000,
              eCoins: 100,
              matchesPlayed: 0,
              matchesWon: 0,
              matchesDrawn: 0,
              matchesLost: 0,
              goalsScored: 0,
              goalsConceded: 0,
              signedInAt: Date.now()
            };
            setCurrentUser(guestUser);
            try {
              localStorage.setItem('efootball_user_v1', JSON.stringify(guestUser));
            } catch {}
            setShowAuthModal(false);
          }}
          onClose={() => setShowAuthModal(false)}
          onOpenAdminManager={() => {
            setShowAuthModal(false);
            setShowAdminPackModal(true);
          }}
        />
      )}

      {/* Epic Card Studio Modal (Admin & Maxsus Kartalar Ustaxonasi) */}
      {showEpicStudioModal && (
        <EpicCardStudioModal
          packs={specialPacks}
          onSavePlayerToPack={handleSavePlayerToPack}
          onSavePlayerToSquad={handleAddPlayerToSquad}
          onTestWalkout={(player) =>
            setActiveCutscenePull({ players: [player], packName: 'Epic Walkout Sinovi' })
          }
          onClose={() => setShowEpicStudioModal(false)}
        />
      )}

      {/* Admin Custom Pack Creator Modal */}
      {showAdminPackModal && currentUser?.isAdmin && (
        <AdminPackManager
          onAddPack={handleCreateCustomPack}
          onClose={() => setShowAdminPackModal(false)}
          onTestWalkout={(player) =>
            setActiveCutscenePull({ players: [player], packName: 'Walkout Sinovi' })
          }
        />
      )}

      {/* Telegram Bot & AI Pack Manager Modal */}
      {showTelegramBotModal && (
        <TelegramBotManager
          packs={specialPacks}
          packLogs={packOpenLogs}
          onAddPack={handleCreateCustomPack}
          onDeletePack={handleDeletePack}
          onClose={() => setShowTelegramBotModal(false)}
        />
      )}

      {/* LocalStorage & GitHub Data Sync, File Upload & Backup Modal */}
      {showSyncModal && (
        <DataSyncBackupModal
          specialPacks={specialPacks}
          currentUser={currentUser}
          squad={squad}
          bench={bench}
          onImportData={handleImportFromSync}
          onClose={() => setShowSyncModal(false)}
        />
      )}

      {/* Global App Release & Version Update Modal */}
      {showGlobalUpdateModal && (
        <AppUpdateModal
          currentUser={currentUser as any}
          isAdmin={currentUser?.isAdmin || false}
          onClose={() => setShowGlobalUpdateModal(false)}
          onUpdateCompleted={() => {
            handleForceSyncPacks();
          }}
        />
      )}
    </div>
  );
}
