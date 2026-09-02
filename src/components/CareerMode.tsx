import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Continent, CONTINENTS, League } from '../data/continents';
import { NATIONS_DATABASE, getRandomNation } from '../data/nations';
import { Player, CareerResult, CardTier, PositionRole } from '../types';
import { FutCard } from './FutCard';
import { sfxClick, sfxCardFlip, sfxWalkoutReveal } from '../utils/audio';
import { speakText } from '../utils/speech';
import {
  Trophy,
  Globe,
  Award,
  Sparkles,
  Download,
  RotateCcw,
  Flame,
  CheckCircle2,
  Zap,
  Volume2,
  FileText,
  Eye,
  Check
} from 'lucide-react';

interface CareerModeProps {
  onSaveToLeaderboard: (result: CareerResult) => void;
  onAddPlayerToSquad: (player: Player) => void;
}

interface LotteryCardItem {
  id: number;
  icon: string;
  title: string;
  value: string;
  sub: string;
  speechText: string;
  accentColor: string;
}

const generateCareerPlayerName = (nationName: string): string => {
  if (nationName === 'O‘zbekiston') {
    const first = ['Jaloliddin', 'Oston', 'Eldor', 'Abbosbek', 'Odil', 'Sardor', 'Dostonbek', 'Otabek', 'Sherzod', 'Azizbek', 'Bobur', 'Husniddin'];
    const last = ['Masharipov', 'O‘runov', 'Shomurodov', 'Fayzullaev', 'Ahmedov', 'Rashidov', 'Hamdamov', 'Shukurov', 'Nasrullaev', 'G‘aniyev', 'Aliqulov', 'Yusupov'];
    return `${first[Math.floor(Math.random() * first.length)]} ${last[Math.floor(Math.random() * last.length)]}`;
  }
  if (['Braziliya', 'Portugaliya'].includes(nationName)) {
    const first = ['Lucas', 'Matheus', 'Gabriel', 'Rafael', 'Rodrigo', 'Thiago', 'Vinicius', 'Bruno', 'Joao', 'Bernardo'];
    const last = ['Silva', 'Santos', 'Ferreira', 'Costa', 'Ramos', 'Pereira', 'Oliveira', 'Alves', 'Dias', 'Carvalho'];
    return `${first[Math.floor(Math.random() * first.length)]} ${last[Math.floor(Math.random() * last.length)]}`;
  }
  if (['Argentina', 'Ispaniya', 'Urugvay', 'Kolumbiya'].includes(nationName)) {
    const first = ['Mateo', 'Julian', 'Enzo', 'Alejandro', 'Federico', 'Rodrigo', 'Lautaro', 'Alvaro', 'Gavi', 'Pedri'];
    const last = ['Fernandez', 'Alvarez', 'Martinez', 'Gomez', 'Romero', 'Perez', 'Garcia', 'Torres', 'Valverde', 'Lopez'];
    return `${first[Math.floor(Math.random() * first.length)]} ${last[Math.floor(Math.random() * last.length)]}`;
  }
  if (['Angliya'].includes(nationName)) {
    const first = ['Harry', 'Jude', 'Phil', 'Bukayo', 'Declan', 'Marcus', 'Cole', 'Trent', 'Jack', 'James'];
    const last = ['Kane', 'Bellingham', 'Foden', 'Saka', 'Rice', 'Rashford', 'Palmer', 'Alexander', 'Grealish', 'Maddison'];
    return `${first[Math.floor(Math.random() * first.length)]} ${last[Math.floor(Math.random() * last.length)]}`;
  }
  if (['Fransiya'].includes(nationName)) {
    const first = ['Kylian', 'Aurelien', 'Eduardo', 'Theo', 'Antoine', 'William', 'Ousmane', 'Kingsley', 'Adrien', 'Bradley'];
    const last = ['Mbappe', 'Tchouameni', 'Camavinga', 'Hernandez', 'Griezmann', 'Saliba', 'Dembele', 'Coman', 'Rabiot', 'Barcola'];
    return `${first[Math.floor(Math.random() * first.length)]} ${last[Math.floor(Math.random() * last.length)]}`;
  }
  if (['Germaniya'].includes(nationName)) {
    const first = ['Florian', 'Jamal', 'Kai', 'Joshua', 'Ilkay', 'Leon', 'Toni', 'Leroy', 'Antonio', 'Marc'];
    const last = ['Wirtz', 'Musiala', 'Havertz', 'Kimmich', 'Gundogan', 'Goretzka', 'Kroos', 'Sane', 'Rudiger', 'Ter Stegen'];
    return `${first[Math.floor(Math.random() * first.length)]} ${last[Math.floor(Math.random() * last.length)]}`;
  }
  if (['Italiya'].includes(nationName)) {
    const first = ['Nicolo', 'Alessandro', 'Federico', 'Gianluigi', 'Lorenzo', 'Sandro', 'Giacomo', 'Davide', 'Marco', 'Andrea'];
    const last = ['Barella', 'Bastoni', 'Chiesa', 'Donnarumma', 'Pellegrini', 'Tonali', 'Raspadori', 'Frattesi', 'Verratti', 'Pirlo'];
    return `${first[Math.floor(Math.random() * first.length)]} ${last[Math.floor(Math.random() * last.length)]}`;
  }
  const globalFirst = ['Alex', 'David', 'Marcus', 'Leo', 'Christian', 'Kevin', 'Luka', 'Erling', 'Robert', 'Milan'];
  const globalLast = ['Novak', 'Petrov', 'Kovacic', 'De Bruyne', 'Haaland', 'Lewandowski', 'Hojlund', 'Osimhen', 'Kvaratskhelia', 'Son'];
  return `${globalFirst[Math.floor(Math.random() * globalFirst.length)]} ${globalLast[Math.floor(Math.random() * globalLast.length)]}`;
};

const getNaturalPositionsForRole = (r: PositionRole): PositionRole[] => {
  switch (r) {
    case 'GK': return ['GK'];
    case 'CB': return ['CB', 'LB', 'RB'];
    case 'LB': return ['LB', 'LWB', 'LMF'];
    case 'RB': return ['RB', 'RWB', 'RMF'];
    case 'DMF': return ['DMF', 'CMF', 'CB'];
    case 'CMF': return ['CMF', 'DMF', 'AMF'];
    case 'AMF': return ['AMF', 'CMF', 'SS', 'LWF', 'RWF'];
    case 'LWF': return ['LWF', 'LMF', 'CF', 'SS'];
    case 'RWF': return ['RWF', 'RMF', 'CF', 'SS'];
    case 'CF': case 'ST': return ['CF', 'ST', 'SS', 'LWF'];
    case 'SS': return ['SS', 'CF', 'AMF'];
    case 'LMF': return ['LMF', 'LWF', 'LB'];
    case 'RMF': return ['RMF', 'RWF', 'RB'];
    default: return [r];
  }
};

export const CareerMode: React.FC<CareerModeProps> = ({ onSaveToLeaderboard, onAddPlayerToSquad }) => {
  const [selectedContinent, setSelectedContinent] = useState<Continent>(CONTINENTS[0]);
  const [selectedLeague, setSelectedLeague] = useState<League>(CONTINENTS[0].leagues[0]);
  const [positionPreference, setPositionPreference] = useState<'ALL' | 'GK' | 'DF' | 'MF' | 'FW'>('ALL');
  const [careerResult, setCareerResult] = useState<CareerResult | null>(null);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [step, setStep] = useState<'setup' | 'lottery' | 'result'>('setup');

  const handleContinentSelect = (c: Continent) => {
    sfxClick();
    setSelectedContinent(c);
    setSelectedLeague(c.leagues[0]);
  };

  const handleStartCareer = () => {
    sfxCardFlip(0);

    let availablePositions: PositionRole[] = ['GK', 'LB', 'CB', 'RB', 'DMF', 'CMF', 'AMF', 'LWF', 'CF', 'ST', 'RWF'];
    if (positionPreference === 'GK') availablePositions = ['GK'];
    else if (positionPreference === 'DF') availablePositions = ['CB', 'LB', 'RB'];
    else if (positionPreference === 'MF') availablePositions = ['DMF', 'CMF', 'AMF'];
    else if (positionPreference === 'FW') availablePositions = ['CF', 'ST', 'LWF', 'RWF'];

    const role = availablePositions[Math.floor(Math.random() * availablePositions.length)];
    const family: 'GK' | 'DF' | 'MF' | 'FW' = role === 'GK' ? 'GK' : ['LB', 'CB', 'RB'].includes(role) ? 'DF' : ['DMF', 'CMF', 'AMF'].includes(role) ? 'MF' : 'FW';

    // Nation affinity (prefer continent of chosen league 65% of the time)
    const matchingNations = NATIONS_DATABASE.filter(n => n.confederation === selectedContinent.id);
    const nation = matchingNations.length > 0 && Math.random() < 0.65
      ? matchingNations[Math.floor(Math.random() * matchingNations.length)]
      : getRandomNation();

    const rawTalent = Math.pow(Math.random(), 2.4);
    const talent = Math.max(0.15, Math.min(0.98, rawTalent));

    const debutAge = Math.floor(Math.random() * 4) + 17; // 17-20
    const primeAge = Math.min(30, debutAge + Math.floor(Math.random() * 6) + 6);
    const retireAge = Math.min(41, primeAge + Math.floor(Math.random() * 8) + 6);
    const careerYears = retireAge - debutAge;

    const matchesPerYear = Math.round(28 + talent * 14 + Math.random() * 6);
    const games = Math.min(960, Math.round(careerYears * matchesPerYear));
    const clubsCount = Math.min(8, Math.max(1, Math.round(careerYears / 4.5)));
    const primaryClub = selectedLeague.clubs[Math.floor(Math.random() * selectedLeague.clubs.length)];

    let goals = 0;
    let assists = 0;
    let cleanSheets = 0;
    let saves = 0;
    let tackles = 0;

    if (family === 'GK') {
      cleanSheets = Math.round(games * (0.32 + talent * 0.2));
      saves = Math.round(games * (3.0 + Math.random() * 1.4));
      goals = Math.random() < 0.05 ? 1 : 0;
      assists = Math.round(Math.random() * 3);
    } else if (family === 'DF') {
      goals = Math.round(games * (0.04 + talent * 0.05));
      assists = Math.round(games * (0.06 + talent * 0.09));
      tackles = Math.round(games * (2.4 + talent * 1.5));
      cleanSheets = Math.round(games * (0.26 + talent * 0.16));
    } else if (family === 'MF') {
      goals = Math.round(games * (0.12 + talent * 0.22));
      assists = Math.round(games * (0.16 + talent * 0.32));
      tackles = Math.round(games * 1.8);
      cleanSheets = Math.round(games * 0.15);
    } else {
      goals = Math.round(games * (0.35 + talent * 0.7));
      assists = Math.round(games * (0.12 + talent * 0.24));
      cleanSheets = 0;
      tackles = Math.round(games * 0.4);
    }

    const yellowCards = Math.round(games * (family === 'DF' ? 0.14 : 0.07));
    const redCards = Math.round(games * 0.012);

    // Trophies
    const trophyFactor = talent * 0.75 + nation.power * 0.25;
    const leagueTitles = Math.round(careerYears * trophyFactor * 0.35);
    const domesticCups = Math.round(careerYears * trophyFactor * 0.25);
    const clTitles = talent > 0.4 ? Math.round(careerYears * (talent - 0.25) * 0.25) : 0;
    const clGoals = family === 'FW' || family === 'MF' ? Math.round(goals * 0.18) : 0;

    const nationalCaps = Math.min(180, Math.round(careerYears * 8 * talent));
    let worldCupTitles = 0;
    let worldCupGoals = 0;
    const worldCupCaps = Math.round(nationalCaps * 0.2);

    if (talent > 0.6 && nation.power > 0.85 && Math.random() < 0.4) {
      worldCupTitles = Math.min(2, Math.floor(Math.random() * 2) + 1);
    }
    if (family === 'FW' || family === 'MF') {
      worldCupGoals = Math.round(talent * (Math.random() * 8 + 2));
    }
    const continentalCupTitles = talent > 0.5 && Math.random() < 0.35 ? 1 : 0;

    // Major personal awards
    let ballonDor = 0;
    if (talent > 0.8) {
      const bdoScore = talent * 0.6 + (worldCupTitles ? 0.3 : 0) + (clTitles ? 0.2 : 0);
      if (bdoScore > 0.72) ballonDor = Math.min(family === 'FW' ? 8 : 3, Math.floor(Math.random() * 4) + 1);
    }
    const goldenBoots = family === 'FW' && talent > 0.7 ? Math.min(6, Math.floor(talent * 5)) : 0;
    const yashinTrophies = family === 'GK' && talent > 0.7 ? Math.min(5, Math.floor(talent * 4) + 1) : 0;
    const bestDefenderTrophies = family === 'DF' && talent > 0.7 ? Math.min(5, Math.floor(talent * 4) + 1) : 0;

    // Harmonized OVR calculation
    let calculatedOvr = Math.round(66 + talent * 31);
    if (ballonDor > 0) calculatedOvr = Math.max(94, calculatedOvr);
    if (worldCupTitles > 0 && clTitles > 0) calculatedOvr = Math.max(92, calculatedOvr);
    calculatedOvr = Math.min(99, calculatedOvr);

    let cardTier: CardTier = 'silver';
    if (calculatedOvr >= 96) cardTier = 'goat';
    else if (calculatedOvr >= 92) cardTier = 'toty';
    else if (calculatedOvr >= 88) cardTier = 'gold';
    else if (calculatedOvr >= 80) cardTier = 'emerald';
    else cardTier = 'silver';

    // Tailored attributes based on PES / FIFA rating standards
    const attrs = family === 'GK'
      ? {
          pac: Math.floor(calculatedOvr * 0.55),
          sho: 25,
          pas: Math.floor(calculatedOvr * 0.72),
          dri: 45,
          def: Math.floor(calculatedOvr * 0.88),
          phy: Math.floor(calculatedOvr * 0.86),
          div: Math.min(99, Math.floor(calculatedOvr * (0.95 + Math.random() * 0.06))),
          ref: Math.min(99, Math.floor(calculatedOvr * (0.96 + Math.random() * 0.06))),
          han: Math.min(99, Math.floor(calculatedOvr * (0.94 + Math.random() * 0.06))),
          pos: Math.min(99, Math.floor(calculatedOvr * (0.95 + Math.random() * 0.06))),
          kic: Math.min(99, Math.floor(calculatedOvr * (0.82 + Math.random() * 0.08))),
          spd: Math.floor(calculatedOvr * 0.55)
        }
      : family === 'DF'
      ? {
          pac: Math.min(99, Math.floor(calculatedOvr * (role === 'LB' || role === 'RB' ? 0.94 : 0.84))),
          sho: Math.min(99, Math.floor(calculatedOvr * 0.55)),
          pas: Math.min(99, Math.floor(calculatedOvr * 0.82)),
          dri: Math.min(99, Math.floor(calculatedOvr * 0.76)),
          def: Math.min(99, Math.floor(calculatedOvr * 0.98)),
          phy: Math.min(99, Math.floor(calculatedOvr * 0.94))
        }
      : family === 'MF'
      ? {
          pac: Math.min(99, Math.floor(calculatedOvr * 0.88)),
          sho: Math.min(99, Math.floor(calculatedOvr * 0.85)),
          pas: Math.min(99, Math.floor(calculatedOvr * 0.98)),
          dri: Math.min(99, Math.floor(calculatedOvr * 0.95)),
          def: Math.min(99, Math.floor(calculatedOvr * (role === 'DMF' ? 0.95 : 0.75))),
          phy: Math.min(99, Math.floor(calculatedOvr * 0.88))
        }
      : {
          pac: Math.min(99, Math.floor(calculatedOvr * 0.97)),
          sho: Math.min(99, Math.floor(calculatedOvr * 0.98)),
          pas: Math.min(99, Math.floor(calculatedOvr * 0.85)),
          dri: Math.min(99, Math.floor(calculatedOvr * 0.96)),
          def: Math.min(99, Math.floor(calculatedOvr * 0.42)),
          phy: Math.min(99, Math.floor(calculatedOvr * 0.88))
        };

    const playerName = generateCareerPlayerName(nation.name);

    // Player Object
    const player: Player = {
      id: `career_${Date.now()}`,
      name: playerName,
      role,
      displayRole: role,
      naturalPositions: getNaturalPositionsForRole(role),
      family,
      ovr: calculatedOvr,
      potential: Math.min(99, calculatedOvr + 2),
      nation,
      club: primaryClub,
      league: selectedLeague.name,
      cardTier,
      attrs,
      avatar: {
        skinTone: ['#fed7aa', '#f4caa1', '#e2b389', '#9f6b43', '#7c4c28'][Math.floor(Math.random() * 5)],
        hairStyle: ['short-fade', 'curls', 'buzz', 'parted', 'wavy-headband'][Math.floor(Math.random() * 5)] as any,
        hairColor: '#1c1917',
        facialHair: Math.random() > 0.5 ? 'stubble' : 'none',
        kitPrimaryColor: '#0284c7',
        kitSecondaryColor: '#ffffff'
      },
      playStyle: family === 'GK' ? 'Darvoza qo‘riqchisi' : family === 'DF' ? 'Klassik himoyachi' : family === 'MF' ? 'Ijodkor pleymeyker' : 'Tezkor hujumchi',
      skills: ['Speed Dribbling', 'First-time Shot', 'Through Passing'],
      age: Math.min(27, primeAge),
      foot: Math.random() > 0.3 ? 'O‘ng' : 'Chap',
      height: 182,
      weight: 77,
      form: 95,
      condition: 95,
      marketValue: Math.round(calculatedOvr * calculatedOvr * 20000),
      level: 15,
      xp: 40,
      stats: {
        games,
        goals,
        assists,
        cleanSheets,
        trophies: leagueTitles + domesticCups + clTitles + worldCupTitles
      }
    };

    setCareerResult({
      player,
      debutAge,
      primeAge,
      retireAge,
      careerYears,
      clubsCount,
      primaryClub,
      games,
      goals,
      assists,
      cleanSheets,
      saves,
      tackles,
      yellowCards,
      redCards,
      leagueTitles,
      domesticCups,
      clTitles,
      clGoals,
      nationalCaps,
      worldCupCaps,
      worldCupGoals,
      worldCupTitles,
      continentalCupTitles,
      ballonDor,
      goldenBoots,
      yashinTrophies,
      bestDefenderTrophies
    });

    setFlippedCards([]);
    setStep('lottery');
    speakText("Karyera lotereyasi boshlandi. Sakkizta sirli kartani oching.", true);
  };

  // Build the 8 Lottery Cards
  const getCards = (r: CareerResult): LotteryCardItem[] => [
    {
      id: 0,
      icon: '📍',
      title: 'Amplua & Millat',
      value: `${r.player.nation.flag} ${r.player.nation.name} (${r.player.role})`,
      sub: r.player.family === 'GK' ? 'Darvozabon' : r.player.family === 'DF' ? 'Himoyachi' : r.player.family === 'MF' ? 'Yarim Himoya' : 'Hujumchi',
      speechText: `1-karta: Amplua va Millat. Davlati ${r.player.nation.name}, Pozitsiyasi ${r.player.role}`,
      accentColor: 'from-blue-600 to-cyan-500'
    },
    {
      id: 1,
      icon: '🏢',
      title: 'Asosiy Klub',
      value: r.primaryClub,
      sub: `${r.careerYears} yillik sadoqatli faoliyat`,
      speechText: `2-karta: Asosiy Klub. ${r.primaryClub}, ${r.careerYears} yillik faoliyat`,
      accentColor: 'from-indigo-600 to-blue-500'
    },
    {
      id: 2,
      icon: '👕',
      title: 'Jami O‘yinlar',
      value: `${r.games} ta rasmiy o‘yin`,
      sub: `${r.debutAge}–${r.retireAge} yosh oralig‘ida`,
      speechText: `3-karta: Jami o‘yinlar. ${r.games} ta rasmiy uchrashuv`,
      accentColor: 'from-purple-600 to-indigo-500'
    },
    {
      id: 3,
      icon: '⚽',
      title: 'Asosiy Statistika',
      value:
        r.player.family === 'GK'
          ? `${r.cleanSheets} ta Quruq O‘yin`
          : `${r.goals} Gol • ${r.assists} Pas`,
      sub: r.player.family === 'GK' ? `${r.saves} ta qahramonona seyv` : `${r.tackles} ta muvaffaqiyatli kurash`,
      speechText:
        r.player.family === 'GK'
          ? `4-karta: Statistika. ${r.cleanSheets} ta quruq o‘yin va ${r.saves} ta seyv`
          : `4-karta: Statistika. ${r.goals} ta gol va ${r.assists} ta golli uzatma`,
      accentColor: 'from-amber-500 to-orange-600'
    },
    {
      id: 4,
      icon: '🏆',
      title: 'Ichki Sovrinlar',
      value: `${r.leagueTitles}x Chempion • ${r.domesticCups}x Kubok`,
      sub: 'Milliy chempionat zafarlari',
      speechText: `5-karta: Ichki sovrinlar. ${r.leagueTitles} karra Chempion va ${r.domesticCups} karra Kubok sohibi`,
      accentColor: 'from-amber-400 to-yellow-600'
    },
    {
      id: 5,
      icon: '⭐',
      title: 'Chempionlar Ligasi',
      value: `${r.clTitles}x Chempionlar Ligasi`,
      sub: selectedContinent.clName,
      speechText: `6-karta: Chempionlar Ligasi. ${r.clTitles} karra g‘olib`,
      accentColor: 'from-cyan-500 to-blue-600'
    },
    {
      id: 6,
      icon: '🌍',
      title: 'Jahon Chempionati',
      value: `${r.worldCupTitles}x JCH Chempioni`,
      sub: `${r.nationalCaps} o‘yin (${r.worldCupGoals} JCH goli)`,
      speechText: `7-karta: Jahon Chempionati. ${r.worldCupTitles} karra Jahon chempioni, terma jamoada ${r.nationalCaps} ta o‘yin`,
      accentColor: 'from-emerald-500 to-teal-600'
    },
    {
      id: 7,
      icon: '👑',
      title: 'Shaxsiy Mukofot',
      value:
        r.ballonDor > 0
          ? `${r.ballonDor}x Oltin To‘p (Ballon d'Or)`
          : r.goldenBoots > 0
          ? `${r.goldenBoots}x Oltin Butsa Sohibi`
          : r.yashinTrophies > 0
          ? `${r.yashinTrophies}x Lev Yashin Mukofoti`
          : r.bestDefenderTrophies > 0
          ? `${r.bestDefenderTrophies}x Eng Yaxshi Himoyachi`
          : 'Klub Afsonasi & Kapitani',
      sub: r.player.ovr >= 90 ? 'Jahon Yulduzi darajasi' : 'Professional afsona',
      speechText:
        r.ballonDor > 0
          ? `8-karta: Shaxsiy mukofot. ${r.ballonDor} karra Oltin To‘p sohibi!`
          : r.goldenBoots > 0
          ? `8-karta: Shaxsiy mukofot. ${r.goldenBoots} karra Oltin Butsa!`
          : r.yashinTrophies > 0
          ? `8-karta: Shaxsiy mukofot. ${r.yashinTrophies} karra Lev Yashin mukofoti!`
          : `8-karta: Shaxsiy mukofot. Jamoa yetakchisi va afsonaviy sardor!`,
      accentColor: 'from-amber-400 to-purple-600'
    }
  ];

  const handleCardFlip = (index: number) => {
    if (flippedCards.includes(index) || !careerResult) return;
    sfxCardFlip(flippedCards.length);
    const updated = [...flippedCards, index];
    setFlippedCards(updated);

    const cards = getCards(careerResult);
    const currentCard = cards[index];
    if (currentCard) {
      speakText(currentCard.speechText, true);
    }
  };

  const handleFlipAll = () => {
    if (!careerResult) return;
    sfxCardFlip(5);
    setFlippedCards([0, 1, 2, 3, 4, 5, 6, 7]);
    speakText("Barcha sakkizta karta ochildi! Futbolchi to‘liq shakllandi. Natijani ko‘rishingiz mumkin.", true);
  };

  const handleProceedToResult = () => {
    if (!careerResult) return;
    sfxWalkoutReveal(careerResult.player.ovr);
    setStep('result');
    onSaveToLeaderboard(careerResult);
    onAddPlayerToSquad(careerResult.player);
    speakText(`Karyera muvaffaqiyatli yakunlandi! Futbolchi: ${careerResult.player.name}, reytingi: ${careerResult.player.ovr}.`, true);
  };

  const handleReadJournalAloud = () => {
    if (!careerResult || flippedCards.length === 0) {
      speakText("Hozircha hech qanday karta ochilmagan. Kartalarni bosing.", true);
      return;
    }
    const cards = getCards(careerResult);
    const revealedTexts = flippedCards
      .map(id => cards[id]?.speechText)
      .filter(Boolean)
      .join(". ");
    speakText(`Ochilgan kartalar qaydnomasi: ${revealedTexts}`, true);
  };

  const downloadReport = () => {
    if (!careerResult) return;
    const r = careerResult;
    const reportText = `========================================
FUTBOLCHINING AFSONAVIY KARYERA HUJJATI
========================================
Futbolchi: ${r.player.name}
Amplua: ${r.player.role} (${r.player.family})
OVR Reytingi: ${r.player.ovr}
Mamlakat: ${r.player.nation.name}
Boshlang'ich Liga: ${r.primaryClub} (${r.player.league})

FAOLIYAT BOSQICHLARI:
- Debyut yoshi: ${r.debutAge} yosh
- Cho'qqi yoshi: ${r.primeAge} yosh
- Butsani mixga ilgan yoshi: ${r.retireAge} yosh
- Karyera davomiyligi: ${r.careerYears} yil
- To'p surgan klublar: ${r.clubsCount} ta

STATISTIKA:
- Jami o'yinlar: ${r.games} ta
- Urilgan gollar: ${r.goals} ta
- Golli uzatmalar: ${r.assists} ta
- Quruq o'yinlar (Clean sheets): ${r.cleanSheets} ta
- Seyvlar: ${r.saves} ta
- Chempionlar Ligasidagi gollar: ${r.clGoals} ta
- Terma jamoada o'yinlar: ${r.nationalCaps} ta (${r.worldCupGoals} JCH goli)
- Sariq / Qizil kartochkalar: ${r.yellowCards} / ${r.redCards}

SOVRINLAR:
- FIFA Jahon Chempioni: ${r.worldCupTitles}x
- Qit'a Chempionlar Ligasi: ${r.clTitles}x
- Milliy Liga Chempioni: ${r.leagueTitles}x
- Milliy Kubok Sohibi: ${r.domesticCups}x
- Oltin To'p (Ballon d'Or): ${r.ballonDor}x
- Yashin Mukofoti: ${r.yashinTrophies}x
- Eng Yaxshi Himoyachi: ${r.bestDefenderTrophies}x
- Oltin Butsa: ${r.goldenBoots}x
========================================`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Karyera_${r.player.name.replace(/\s+/g, '_')}_${r.player.ovr}OVR.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const cards = careerResult ? getCards(careerResult) : [];

  return (
    <div className="w-full flex flex-col items-center gap-6">
      {/* Setup Step: Pick Continent & League */}
      {step === 'setup' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl p-5 sm:p-7 rounded-3xl bg-slate-900/90 border border-white/10 backdrop-blur-xl shadow-2xl flex flex-col gap-6"
        >
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-cyan-400">1-Qadam</span>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">Karyera Shartlari va Ligasini Tanlang</h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Futbolchi karyerasi tanlangan chempionat va amplua qonuniyatlari asosida simulyatsiya qilinadi.
            </p>
          </div>

          {/* Position Preference Selector */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-200">
              Qiziqqan Amplua (Pozitsiya)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'ALL', label: 'Ixtiyoriy' },
                { id: 'GK', label: 'Darvozabon' },
                { id: 'DF', label: 'Himoyachi' },
                { id: 'MF', label: 'Yarim Himoya' },
                { id: 'FW', label: 'Hujumchi' },
              ].map(p => (
                <button
                  key={p.id}
                  onClick={() => {
                    sfxClick();
                    setPositionPreference(p.id as any);
                  }}
                  className={`py-2.5 px-2 text-center rounded-xl text-xs font-black transition-all cursor-pointer border ${
                    positionPreference === p.id
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-cyan-400 shadow-md shadow-cyan-500/25 scale-102'
                      : 'bg-white/[0.05] hover:bg-white/[0.09] text-slate-300 border-white/10'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Continents */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-200">
              Qit‘a va Mintaqa
            </span>
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {CONTINENTS.map(c => (
                <button
                  key={c.id}
                  onClick={() => handleContinentSelect(c)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                    selectedContinent.id === c.id
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 border border-purple-400/60 scale-102'
                      : 'bg-white/[0.06] hover:bg-white/10 text-slate-300 border border-white/5'
                  }`}
                >
                  <span className="text-base">{c.flag}</span>
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Leagues Grid */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-200">
              Boshlang‘ich Chempionat
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selectedContinent.leagues.map(l => (
                <button
                  key={l.id}
                  onClick={() => {
                    sfxClick();
                    setSelectedLeague(l);
                  }}
                  className={`flex items-start gap-3 p-3.5 rounded-2xl text-left transition-all cursor-pointer border ${
                    selectedLeague.id === l.id
                      ? 'bg-gradient-to-r from-cyan-500/25 to-blue-600/25 border-cyan-400 text-white shadow-lg shadow-cyan-500/20'
                      : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-slate-300'
                  }`}
                >
                  <span className="text-2xl">{l.flag}</span>
                  <div className="min-w-0">
                    <h4 className="font-black text-sm text-white truncate">{l.name}</h4>
                    <p className="text-xs text-cyan-300/90 font-bold mt-0.5">{l.cup}</p>
                    <p className="text-[10px] text-slate-400 mt-1 truncate">
                      {l.clubs.slice(0, 3).join(', ')}...
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={handleStartCareer}
            className="w-full py-4 rounded-2xl font-black text-base uppercase tracking-wider bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 shadow-xl shadow-amber-500/25 transition-all hover:scale-101 cursor-pointer"
          >
            Karyera Taqdirini Boshlash
          </button>
        </motion.div>
      )}

      {/* Lottery Step: 8 Crystal-Clear Cards + Chronological Reveal Journal */}
      {step === 'lottery' && careerResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-3xl flex flex-col gap-6"
        >
          {/* Header Panel */}
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-white/10 backdrop-blur-xl shadow-2xl flex flex-col gap-4">
            <div className="flex justify-between items-center flex-wrap gap-3">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Sirli Taqdir Kartalari
                </span>
                <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">
                  Kartalarni Bosing va Taqdirni Kiring
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Har bir karta ochilganda ovozli o‘qib beriladi va quyidagi qaydnomada saqlanadi.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleFlipAll}
                  className="px-3.5 py-2 rounded-2xl text-xs font-black bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 transition-all cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95"
                  aria-label="Barcha kartalarni bittada ochish"
                >
                  ⚡ Barchasini Ochish
                </button>
                <span className="font-black text-xs px-3.5 py-2 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  {flippedCards.length} / 8 ta ochildi
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden" role="progressbar" aria-valuenow={flippedCards.length} aria-valuemin={0} aria-valuemax={8}>
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-amber-400"
                initial={{ width: 0 }}
                animate={{ width: `${(flippedCards.length / 8) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* 8 Mystery & Revealed Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {cards.map(card => {
              const isFlipped = flippedCards.includes(card.id);
              return (
                <div
                  key={card.id}
                  onClick={() => handleCardFlip(card.id)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleCardFlip(card.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={
                    isFlipped
                      ? `${card.id + 1}-karta ochilgan: ${card.title}, ${card.value}, ${card.sub}`
                      : `${card.id + 1}-karta: ${card.title}. Ochish uchun bosing.`
                  }
                  className="h-38 rounded-2xl cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-950"
                >
                  <AnimatePresence mode="wait">
                    {!isFlipped ? (
                      /* UNOPENED MYSTERY CARD */
                      <motion.div
                        key="mystery"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.85, rotateY: 90 }}
                        transition={{ duration: 0.2 }}
                        className="w-full h-full rounded-2xl p-3 flex flex-col items-center justify-between text-center bg-gradient-to-b from-indigo-950/90 via-slate-900 to-purple-950/80 border-2 border-purple-500/40 hover:border-cyan-400 shadow-lg hover:shadow-cyan-500/20 hover:scale-102 transition-all group"
                      >
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white/10 text-cyan-300 border border-white/10">
                          #{card.id + 1} Karta
                        </span>
                        <div className="text-2xl sm:text-3xl my-0.5 filter drop-shadow-md group-hover:scale-110 transition-transform">
                          {card.icon}
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-white group-hover:text-cyan-200 line-clamp-1">
                            {card.title}
                          </h4>
                          <span className="text-[10px] text-amber-300 font-bold block mt-0.5 animate-pulse">
                            Ochish uchun bosing
                          </span>
                        </div>
                      </motion.div>
                    ) : (
                      /* REVEALED CARD (ALWAYS 100% FORWARD-FACING, NEVER MIRRORED OR REVERSED) */
                      <motion.div
                        key="revealed"
                        initial={{ opacity: 0, scale: 0.85, rotateY: -90 }}
                        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                        transition={{ duration: 0.25, type: 'spring', stiffness: 220 }}
                        className="w-full h-full rounded-2xl p-3 flex flex-col items-center justify-between text-center bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 border-2 border-cyan-400 shadow-xl shadow-cyan-500/30 relative overflow-hidden"
                      >
                        {/* Top Indicator */}
                        <div className="w-full flex items-center justify-between">
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-white/10 text-slate-300">
                            #{card.id + 1}
                          </span>
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 flex items-center gap-0.5">
                            <Check className="w-2.5 h-2.5" />
                            Ochildi
                          </span>
                        </div>

                        {/* Title & Value */}
                        <div className="w-full flex flex-col items-center justify-center my-auto px-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300 truncate max-w-full">
                            {card.title}
                          </span>
                          <span className="text-xs sm:text-sm font-black text-white mt-1 leading-snug break-words max-w-full">
                            {card.value}
                          </span>
                          <span className="text-[10px] font-bold text-amber-300 mt-1 truncate max-w-full">
                            {card.sub}
                          </span>
                        </div>

                        {/* Bottom icon badge */}
                        <div className="text-base">{card.icon}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* CHRONOLOGICAL REVEAL JOURNAL (Ochilgan Kartalar Qaydnomasi) */}
          <div className="w-full p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-white/10 backdrop-blur-xl shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center border border-cyan-500/30">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-white">Ochilgan Kartalar Qaydnomasi (Karyera Kundaligi)</h3>
                  <p className="text-[11px] text-slate-400">
                    Ochilgan har bir karta ma’lumoti bu yerda tartib bilan qayd etilib boradi
                  </p>
                </div>
              </div>

              {flippedCards.length > 0 && (
                <button
                  onClick={handleReadJournalAloud}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-cyan-300 border border-cyan-400/30 text-xs font-bold transition-all cursor-pointer"
                  title="Qaydnomadagi ma’lumotlarni ovozli eshitish"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Ovozli Eshitish</span>
                </button>
              )}
            </div>

            {/* List of Revealed Items */}
            {flippedCards.length === 0 ? (
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-center text-xs text-slate-400">
                Hozircha hech qaysi karta ochilmadi. Yuqoridagi kartalardan birini bosing yoki barchasini birdaniga oching!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {flippedCards.map((cardId, index) => {
                  const c = cards[cardId];
                  if (!c) return null;
                  return (
                    <motion.div
                      key={`journal_${cardId}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-cyan-400/40 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xl shrink-0">{c.icon}</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-black text-cyan-400">
                              #{index + 1} {c.title}
                            </span>
                          </div>
                          <h4 className="font-black text-xs text-white truncate">{c.value}</h4>
                          <p className="text-[10px] text-slate-300 truncate">{c.sub}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => speakText(c.speechText, true)}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-cyan-300 transition-colors shrink-0"
                        title="Ushbu ma’lumotni ovozli o‘qish"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* If all 8 cards are opened: Grand Result Proceed Action */}
            {flippedCards.length === 8 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-cyan-500/20 border border-amber-400/50 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl"
              >
                <div>
                  <div className="flex items-center gap-2 text-amber-300 font-black text-sm">
                    <Trophy className="w-4 h-4" />
                    <span>Barcha 8 ta karta to‘liq ochildi!</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Futbolchi karyerasi muvaffaqiyatli simulyatsiya qilindi. Afsonaviy FUT kartani ochishga tayyormisiz?
                  </p>
                </div>
                <button
                  onClick={handleProceedToResult}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 shadow-xl shadow-amber-500/30 transition-all cursor-pointer whitespace-nowrap active:scale-95"
                >
                  🏆 Afsonaviy Kartani Ko‘rish
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* Result Step: Walkout Reveal, FUT Card & Dossier */}
      {step === 'result' && careerResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl flex flex-col items-center gap-6"
        >
          {/* Holographic FUT Card */}
          <div className="relative">
            <FutCard player={careerResult.player} size="lg" isWalkout />
          </div>

          {/* Trophy Cabinet */}
          <div className="w-full p-5 rounded-3xl bg-slate-900/90 border border-white/10 backdrop-blur-xl shadow-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-black text-amber-400">
                <Trophy className="w-4 h-4" />
                <span>Sovrinlar Vitrinasi (Trophy Cabinet)</span>
              </div>
              <button
                onClick={() =>
                  speakText(
                    `Sovrinlar: Jahon chempioni ${careerResult.worldCupTitles} karra, Chempionlar ligasi ${careerResult.clTitles} karra, Milliy liga ${careerResult.leagueTitles} karra g‘olibi.`,
                    true
                  )
                }
                className="p-1 text-slate-400 hover:text-cyan-300 cursor-pointer"
                title="Sovrinlarni ovozli eshitish"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/5 text-center">
                <span className="text-xl font-black text-amber-400">{careerResult.worldCupTitles}x</span>
                <span className="block text-[11px] font-bold text-white mt-1">FIFA Jahon Chempioni</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/5 text-center">
                <span className="text-xl font-black text-cyan-400">{careerResult.clTitles}x</span>
                <span className="block text-[11px] font-bold text-white mt-1">Chempionlar Ligasi</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/5 text-center">
                <span className="text-xl font-black text-purple-400">{careerResult.leagueTitles}x</span>
                <span className="block text-[11px] font-bold text-white mt-1">Milliy Liga Chempioni</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/5 text-center">
                <span className="text-xl font-black text-emerald-400">
                  {careerResult.ballonDor > 0
                    ? `${careerResult.ballonDor}x Oltin To‘p`
                    : careerResult.yashinTrophies > 0
                    ? `${careerResult.yashinTrophies}x Yashin`
                    : `${careerResult.domesticCups}x Kubok`}
                </span>
                <span className="block text-[11px] font-bold text-white mt-1">
                  {careerResult.ballonDor > 0
                    ? "Oltin To'p (Ballon d'Or)"
                    : careerResult.yashinTrophies > 0
                    ? "Yashin Mukofoti"
                    : "Milliy Kubok"}
                </span>
              </div>
            </div>
          </div>

          {/* Lifetime Statistical Dossier */}
          <div className="w-full p-5 rounded-3xl bg-slate-900/90 border border-white/10 backdrop-blur-xl shadow-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-black text-cyan-400">
                <Award className="w-4 h-4" />
                <span>To‘liq Karyera Statistikasi</span>
              </div>
              <button
                onClick={() =>
                  speakText(
                    `To‘liq statistika: Jami o‘yinlar ${careerResult.games} ta. ${
                      careerResult.player.family === 'GK'
                        ? `${careerResult.cleanSheets} ta quruq o‘yin, ${careerResult.saves} ta seyv.`
                        : `${careerResult.goals} ta gol, ${careerResult.assists} ta golli uzatma.`
                    } Terma jamoada ${careerResult.nationalCaps} ta o‘yin.`,
                    true
                  )
                }
                className="p-1 text-slate-400 hover:text-cyan-300 cursor-pointer"
                title="Statistikani ovozli eshitish"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-white/[0.04] flex justify-between items-center">
                <span className="text-slate-400">Jami O‘yinlar:</span>
                <span className="font-black text-white">{careerResult.games} ta</span>
              </div>
              {careerResult.player.family === 'GK' ? (
                <>
                  <div className="p-2.5 rounded-xl bg-white/[0.04] flex justify-between items-center">
                    <span className="text-slate-400">Quruq O‘yinlar:</span>
                    <span className="font-black text-emerald-400">{careerResult.cleanSheets} ta</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.04] flex justify-between items-center">
                    <span className="text-slate-400">Seyvlar:</span>
                    <span className="font-black text-cyan-400">{careerResult.saves} ta</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-2.5 rounded-xl bg-white/[0.04] flex justify-between items-center">
                    <span className="text-slate-400">Urilgan Gollar:</span>
                    <span className="font-black text-amber-400">{careerResult.goals} ta</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.04] flex justify-between items-center">
                    <span className="text-slate-400">Assistlar:</span>
                    <span className="font-black text-cyan-400">{careerResult.assists} ta</span>
                  </div>
                </>
              )}
              <div className="p-2.5 rounded-xl bg-white/[0.04] flex justify-between items-center">
                <span className="text-slate-400">CL Gollari:</span>
                <span className="font-black text-white">{careerResult.clGoals} ta</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.04] flex justify-between items-center">
                <span className="text-slate-400">Terma Jamoada:</span>
                <span className="font-black text-white">{careerResult.nationalCaps} ta</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.04] flex justify-between items-center">
                <span className="text-slate-400">Cho‘qqi Yoshi:</span>
                <span className="font-black text-emerald-400">{careerResult.primeAge} yosh</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="w-full flex flex-col sm:flex-row gap-3">
            <button
              onClick={downloadReport}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider bg-white/[0.08] hover:bg-white/[0.15] text-white border border-white/20 transition-all cursor-pointer active:scale-98"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              Hisobotni Yuklab Olish (.txt)
            </button>
            <button
              onClick={() => {
                sfxClick();
                setStep('setup');
              }}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer active:scale-98"
            >
              <RotateCcw className="w-4 h-4" />
              Yangi Taqdirni Sinab Ko‘rish
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
