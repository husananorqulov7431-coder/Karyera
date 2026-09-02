import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Peer, { DataConnection } from 'peerjs';
import { Player } from '../types';
import { FutCard } from './FutCard';
import { PlayerAvatar } from './PlayerAvatar';
import { sfxClick, sfxCardFlip, sfxGoal, sfxWhistle } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  Users,
  Copy,
  Check,
  Radio,
  Play,
  Flame,
  Shield,
  MessageSquare,
  Send,
  Zap,
  RotateCcw,
  Trophy,
  AlertCircle
} from 'lucide-react';

interface MultiplayerRoomProps {
  mySquad: Record<string, Player | null>;
  myClubName?: string;
  onUpdateSquad?: (squad: Record<string, Player | null>) => void;
}

interface PeerMessage {
  type: 'SYNC_TEAM' | 'START_MATCH' | 'MATCH_EVENT' | 'TACTIC_CHANGE' | 'REACTION' | 'CHAT';
  payload: any;
}

interface LiveEvent {
  minute: number;
  text: string;
  type: 'goal' | 'save' | 'foul' | 'card' | 'tactic' | 'info';
  isHome: boolean;
}

export const MultiplayerRoom: React.FC<MultiplayerRoomProps> = ({
  mySquad,
  myClubName = 'Mening Klubim'
}) => {
  const [peerId, setPeerId] = useState<string>('');
  const [targetPeerId, setTargetPeerId] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Opponent Data
  const [opponentName, setOpponentName] = useState<string>('Raqib Jamoa');
  const [opponentSquad, setOpponentSquad] = useState<Record<string, Player | null>>({});
  const [opponentConnected, setOpponentConnected] = useState<boolean>(false);

  // Chat & Reactions
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string; time: string }[]>([]);
  const [chatInput, setChatInput] = useState<string>('');
  const [lastReaction, setLastReaction] = useState<string | null>(null);

  // Live Multiplayer Match State
  const [isMatchActive, setIsMatchActive] = useState<boolean>(false);
  const [isHost, setIsHost] = useState<boolean>(false);
  const [matchTime, setMatchTime] = useState<number>(0);
  const [homeScore, setHomeScore] = useState<number>(0);
  const [awayScore, setAwayScore] = useState<number>(0);
  const [matchEvents, setMatchEvents] = useState<LiveEvent[]>([]);
  const [myTactic, setMyTactic] = useState<'normal' | 'attack' | 'defense' | 'press'>('normal');
  const [matchEnded, setMatchEnded] = useState<boolean>(false);

  const peerRef = useRef<Peer | null>(null);
  const connRef = useRef<DataConnection | null>(null);
  const matchTimerRef = useRef<any>(null);

  // Calculate my team rating
  const myStarters = Object.values(mySquad).filter((p): p is Player => Boolean(p));
  const myOvr = myStarters.length
    ? Math.round(myStarters.reduce((acc, p) => acc + p.ovr, 0) / myStarters.length)
    : 75;

  // Calculate opponent rating
  const oppStarters = Object.values(opponentSquad).filter((p): p is Player => Boolean(p));
  const oppOvr = oppStarters.length
    ? Math.round(oppStarters.reduce((acc, p) => acc + p.ovr, 0) / oppStarters.length)
    : 80;

  // Initialize Peer
  useEffect(() => {
    // Generate clean 5-digit room ID suffix
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const customId = `karyera-${randomCode}`;

    const peer = new Peer(customId, {
      debug: 1
    });

    peerRef.current = peer;

    peer.on('open', id => {
      setPeerId(id);
      setStatus('idle');
    });

    peer.on('connection', conn => {
      connRef.current = conn;
      setIsHost(true);
      setupConnectionHandlers(conn);
    });

    peer.on('error', err => {
      console.warn('PeerJS connection warning:', err);
      // Fallback with auto-assigned ID if custom ID collided
      if (err.type === 'unavailable-id') {
        const fallbackPeer = new Peer();
        peerRef.current = fallbackPeer;
        fallbackPeer.on('open', id => setPeerId(id));
        fallbackPeer.on('connection', conn => {
          connRef.current = conn;
          setIsHost(true);
          setupConnectionHandlers(conn);
        });
      } else {
        setErrorMessage('Tarmoqqa ulanishda xatolik yuz berdi. Qayta urinib ko‘ring.');
      }
    });

    return () => {
      if (matchTimerRef.current) clearInterval(matchTimerRef.current);
      peer.destroy();
    };
  }, []);

  const setupConnectionHandlers = (conn: DataConnection) => {
    conn.on('open', () => {
      setStatus('connected');
      setOpponentConnected(true);
      sfxCardFlip(2);

      // Send my team data to peer
      sendPayload({
        type: 'SYNC_TEAM',
        payload: {
          clubName: myClubName,
          squad: mySquad,
          ovr: myOvr
        }
      });
    });

    conn.on('data', data => {
      handleIncomingData(data as PeerMessage);
    });

    conn.on('close', () => {
      setStatus('idle');
      setOpponentConnected(false);
      setErrorMessage('Raqib o‘yindan chiqib ketdi');
    });
  };

  const handleIncomingData = (msg: PeerMessage) => {
    if (!msg || !msg.type) return;

    switch (msg.type) {
      case 'SYNC_TEAM':
        setOpponentName(msg.payload.clubName || 'Raqib FC');
        setOpponentSquad(msg.payload.squad || {});
        break;

      case 'START_MATCH':
        setIsMatchActive(true);
        setMatchEnded(false);
        setMatchTime(0);
        setHomeScore(0);
        setAwayScore(0);
        setMatchEvents([
          { minute: 1, text: 'Hakam hushtagi chalindi! O‘yin boshlandi!', type: 'info', isHome: true }
        ]);
        sfxWhistle();
        break;

      case 'MATCH_EVENT':
        const ev: LiveEvent = msg.payload.event;
        setMatchEvents(prev => [ev, ...prev]);
        if (msg.payload.homeScore !== undefined) setHomeScore(msg.payload.homeScore);
        if (msg.payload.awayScore !== undefined) setAwayScore(msg.payload.awayScore);
        if (msg.payload.minute !== undefined) setMatchTime(msg.payload.minute);
        if (msg.payload.ended) {
          setMatchEnded(true);
          sfxWhistle();
          confetti({ particleCount: 70, spread: 80 });
        }
        if (ev.type === 'goal') {
          sfxGoal();
        }
        break;

      case 'REACTION':
        setLastReaction(msg.payload.emoji);
        setTimeout(() => setLastReaction(null), 2500);
        break;

      case 'CHAT':
        setChatMessages(prev => [
          ...prev,
          {
            sender: msg.payload.sender,
            text: msg.payload.text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        break;
    }
  };

  const sendPayload = (msg: PeerMessage) => {
    if (connRef.current && connRef.current.open) {
      connRef.current.send(msg);
    }
  };

  // Connect to friend's room ID
  const connectToOpponent = () => {
    if (!targetPeerId.trim() || !peerRef.current) return;
    setStatus('connecting');
    setErrorMessage('');
    sfxClick();

    const conn = peerRef.current.connect(targetPeerId.trim());
    connRef.current = conn;
    setIsHost(false);
    setupConnectionHandlers(conn);
  };

  // Host launches match
  const startMultiplayerMatch = () => {
    if (!connRef.current || !opponentConnected) return;
    sfxClick();
    sfxWhistle();

    setIsMatchActive(true);
    setMatchEnded(false);
    setMatchTime(0);
    setHomeScore(0);
    setAwayScore(0);
    setMatchEvents([
      { minute: 1, text: 'Hakam hushtagi chalindi! 1v1 Real-vaqt bahsi boshlandi!', type: 'info', isHome: true }
    ]);

    sendPayload({
      type: 'START_MATCH',
      payload: {}
    });

    // Run host match simulation loop
    let currentMinute = 1;
    let hScore = 0;
    let aScore = 0;

    if (matchTimerRef.current) clearInterval(matchTimerRef.current);

    matchTimerRef.current = setInterval(() => {
      currentMinute += 3;
      setMatchTime(currentMinute);

      // Random goal or dramatic chance calculation based on OVR & Tactics
      const homeAdvantage = (myOvr - oppOvr) * 0.02;
      const roll = Math.random();

      let eventGenerated: LiveEvent | null = null;

      if (roll < 0.14 + homeAdvantage) {
        // Goal by Home team
        hScore += 1;
        setHomeScore(hScore);
        sfxGoal();
        const scorers = myStarters.filter(p => p.family === 'FW' || p.family === 'MF');
        const scorer = scorers[Math.floor(Math.random() * scorers.length)] || myStarters[0];
        eventGenerated = {
          minute: currentMinute,
          text: `GOOOOL! ${scorer?.name || 'Hujumchi'} to‘pni darvoza to‘riga joyladi! (${hScore}-${aScore})`,
          type: 'goal',
          isHome: true
        };
      } else if (roll > 0.86 - homeAdvantage) {
        // Goal by Away team
        aScore += 1;
        setAwayScore(aScore);
        sfxGoal();
        const oppScorers = oppStarters.filter(p => p.family === 'FW' || p.family === 'MF');
        const scorer = oppScorers[Math.floor(Math.random() * oppScorers.length)] || oppStarters[0];
        eventGenerated = {
          minute: currentMinute,
          text: `GOL! Raqib o‘yinchisi ${scorer?.name || 'Raqib'} gol urdi! (${hScore}-${aScore})`,
          type: 'goal',
          isHome: false
        };
      } else if (roll > 0.45 && roll < 0.53) {
        eventGenerated = {
          minute: currentMinute,
          text: `Xavfli hujum! Darvozabon seyv amalga oshirdi! 🧤`,
          type: 'save',
          isHome: roll > 0.49
        };
      }

      if (eventGenerated) {
        setMatchEvents(prev => [eventGenerated!, ...prev]);
        sendPayload({
          type: 'MATCH_EVENT',
          payload: {
            event: eventGenerated,
            homeScore: hScore,
            awayScore: aScore,
            minute: currentMinute,
            ended: false
          }
        });
      }

      if (currentMinute >= 90) {
        clearInterval(matchTimerRef.current);
        setMatchEnded(true);
        sfxWhistle();
        confetti({ particleCount: 90, spread: 100 });
        sendPayload({
          type: 'MATCH_EVENT',
          payload: {
            event: {
              minute: 90,
              text: `O‘yin yakunlandi! Yakuniy hisob: ${hScore} - ${aScore}`,
              type: 'info',
              isHome: true
            },
            homeScore: hScore,
            awayScore: aScore,
            minute: 90,
            ended: true
          }
        });
      }
    }, 1800);
  };

  const sendReaction = (emoji: string) => {
    sfxClick();
    setLastReaction(emoji);
    setTimeout(() => setLastReaction(null), 2000);
    sendPayload({
      type: 'REACTION',
      payload: { emoji }
    });
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const text = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [
      ...prev,
      {
        sender: 'Men',
        text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    sendPayload({
      type: 'CHAT',
      payload: { sender: myClubName, text }
    });
  };

  return (
    <div className="w-full flex flex-col gap-5">
      {/* Header Banner */}
      <div className="w-full p-5 rounded-3xl bg-gradient-to-r from-blue-900/80 via-indigo-950/90 to-purple-950/80 border border-cyan-400/20 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
            <h2 className="text-xl font-black text-white tracking-wide">
              Real-Vaqt Onlayn Multiplayer (1v1 P2P)
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Do‘stingiz bilan to‘g‘ridan-to‘g‘ri internet orqali xonaga ulanib o‘ynang va tarkiblaringizni sinang!
          </p>
        </div>

        {/* Room ID Sharing Badge */}
        <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-white/[0.08] border border-white/15">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-black text-cyan-300 tracking-wider">
              Mening Xona Kodim:
            </span>
            <span className="font-mono font-black text-sm text-white">{peerId || 'Yuklanmoqda...'}</span>
          </div>
          {peerId && (
            <button
              onClick={() => {
                navigator.clipboard.writeText(peerId);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="p-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 cursor-pointer transition-all"
              title="Kodni nusxalash"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Connection Setup Area if Not Connected */}
      {!opponentConnected ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Share My Room */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 font-black text-sm">
                <Users className="w-4 h-4" />
                <span>1-USUL: XONA ECHASI BO‘LISH</span>
              </div>
              <h3 className="text-base font-bold text-white mt-1">Do‘stingizni O‘yinga Taklif Qiling</h3>
              <p className="text-xs text-slate-400 mt-1">
                Yuqoridagi xona kodini do‘stingizga yuboring. U sizning kodingizni kiritishi bilan bir zumda o‘yin boshlanadi!
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/5 flex items-center justify-between">
              <span className="text-xs text-slate-300">Ulanish holati:</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                Do‘st ulanishi kutilmoqda...
              </span>
            </div>
          </div>

          {/* Card 2: Join Friend's Room */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-purple-400 font-black text-sm">
                <Zap className="w-4 h-4" />
                <span>2-USUL: DO‘STNING XONASIGA ULANISH</span>
              </div>
              <h3 className="text-base font-bold text-white mt-1">Do‘st Bergan Kodni Kiriting</h3>
              <p className="text-xs text-slate-400 mt-1">
                Do‘stingiz yuborgan xona kodini (masalan: karyera-1234) quyidagi maydonga yozing:
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Xona kodini kiriting..."
                value={targetPeerId}
                onChange={e => setTargetPeerId(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-2xl bg-white/[0.07] border border-white/15 text-white font-mono text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <button
                onClick={connectToOpponent}
                disabled={status === 'connecting' || !targetPeerId.trim()}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20 cursor-pointer disabled:opacity-50 transition-all"
              >
                {status === 'connecting' ? 'Ulanmoqda...' : 'Ulanish'}
              </button>
            </div>

            {errorMessage && (
              <p className="text-xs text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errorMessage}
              </p>
            )}
          </div>
        </div>
      ) : (
        /* Connected 1v1 Arena Screen */
        <div className="flex flex-col gap-5">
          {/* Teams Confrontation Matchup Header */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-5 rounded-3xl bg-slate-900/90 border border-white/15 backdrop-blur-md items-center">
            {/* My Team */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-black text-lg text-slate-950 shadow-lg">
                ME
              </div>
              <div className="flex flex-col">
                <span className="font-black text-base text-white">{myClubName}</span>
                <span className="text-xs font-bold text-cyan-300">Reyting (OVR): {myOvr}</span>
              </div>
            </div>

            {/* Score / Center Match Action */}
            <div className="flex flex-col items-center justify-center text-center">
              {isMatchActive ? (
                <div className="flex flex-col items-center">
                  <span className="text-xs font-black text-amber-400 uppercase tracking-widest animate-pulse">
                    {matchEnded ? 'O‘yin Tugadi' : `${matchTime}' Daqiqa`}
                  </span>
                  <div className="text-4xl font-black text-white drop-shadow tracking-widest mt-1">
                    {homeScore} : {awayScore}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <span className="text-xs font-black text-slate-400 uppercase">Ulanildi • 1v1 Tayyor</span>
                  <button
                    onClick={startMultiplayerMatch}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/30 transition-all cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Real-Vaqt O‘yinini Boshlash!</span>
                  </button>
                </div>
              )}
            </div>

            {/* Opponent Team */}
            <div className="flex items-center justify-end gap-3 text-right">
              <div className="flex flex-col">
                <span className="font-black text-base text-white">{opponentName}</span>
                <span className="text-xs font-bold text-purple-300">Reyting (OVR): {oppOvr}</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center font-black text-lg text-white shadow-lg">
                VS
              </div>
            </div>
          </div>

          {/* Floating Live Reaction Overlay */}
          <AnimatePresence>
            {lastReaction && (
              <motion.div
                initial={{ scale: 0, y: 30 }}
                animate={{ scale: 1.5, y: -20 }}
                exit={{ scale: 0, opacity: 0 }}
                className="fixed inset-0 pointer-events-none flex items-center justify-center z-50"
              >
                <span className="text-7xl filter drop-shadow-2xl">{lastReaction}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Reaction Bar */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.04] border border-white/10">
            <span className="text-xs font-bold text-slate-300">Raqibga Reaksiya Yuborish:</span>
            <div className="flex items-center gap-2">
              {['⚽', '🔥', '✊', '🏆', '👏', '🧤'].map(em => (
                <button
                  key={em}
                  onClick={() => sendReaction(em)}
                  className="p-2 text-xl hover:scale-125 transition-transform cursor-pointer"
                  title="Reaksiya yuborish"
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          {/* Live Match Commentary Log & Tactics (if match active) */}
          {isMatchActive && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Live Commentary Feed */}
              <div className="md:col-span-2 p-5 rounded-3xl bg-slate-900/80 border border-white/10 flex flex-col gap-3">
                <h3 className="font-black text-sm text-white flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Jonli O‘yin Voqealari & Xronologiya</span>
                </h3>

                <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
                  {matchEvents.map((ev, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl border text-xs flex items-center gap-2.5 ${
                        ev.type === 'goal'
                          ? 'bg-amber-500/20 border-amber-400 text-amber-200 font-bold shadow'
                          : ev.type === 'save'
                          ? 'bg-blue-500/15 border-blue-400 text-blue-200'
                          : 'bg-white/[0.03] border-white/5 text-slate-300'
                      }`}
                    >
                      <span className="font-mono font-black text-cyan-400 shrink-0">{ev.minute}'</span>
                      <span>{ev.text}</span>
                    </div>
                  ))}
                </div>

                {matchEnded && (
                  <div className="mt-2 p-3 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/40 text-center flex flex-col items-center gap-2">
                    <Trophy className="w-6 h-6 text-amber-400" />
                    <span className="font-black text-sm text-white">
                      {homeScore > awayScore
                        ? 'Tabriklaymiz! Siz G‘alaba Qozondingiz! 🏆'
                        : homeScore < awayScore
                        ? 'Raqib g‘alaba qozondi. Keyingi safar revansh oling!'
                        : 'Do‘stona durang qayd etildi! 🤝'}
                    </span>
                    <button
                      onClick={startMultiplayerMatch}
                      className="px-4 py-2 rounded-xl bg-cyan-400 text-slate-950 font-black text-xs cursor-pointer hover:bg-cyan-300"
                    >
                      Qaytadan O‘ynash (Revansh)
                    </button>
                  </div>
                )}
              </div>

              {/* Real-time Tactical Orders */}
              <div className="p-5 rounded-3xl bg-slate-900/80 border border-white/10 flex flex-col gap-3">
                <h3 className="font-black text-sm text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  <span>Jonli Taktik Buyruqlar</span>
                </h3>

                <div className="flex flex-col gap-2">
                  {[
                    { key: 'attack', label: 'Barcha Kuch Hujumga!', desc: 'Hujumchilar oldinga siljiydi' },
                    { key: 'press', label: 'Yuqori Pressing', desc: 'Raqibni to‘p bilan qisish' },
                    { key: 'defense', label: 'Avtobus (Mustahkam Himoya)', desc: 'Hisobni ushlab qolish' },
                    { key: 'normal', label: 'Muvozanatli O‘yin', desc: 'Standart reja' }
                  ].map(tac => (
                    <button
                      key={tac.key}
                      onClick={() => {
                        sfxClick();
                        setMyTactic(tac.key as any);
                        sendPayload({
                          type: 'TACTIC_CHANGE',
                          payload: { tactic: tac.key }
                        });
                      }}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                        myTactic === tac.key
                          ? 'bg-cyan-500/20 border-cyan-400 text-white font-bold'
                          : 'bg-white/[0.03] hover:bg-white/[0.08] border-white/5 text-slate-300'
                      }`}
                    >
                      <div className="font-bold text-cyan-300">{tac.label}</div>
                      <div className="text-[10px] text-slate-400">{tac.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Real-time Match Chat */}
          <div className="p-4 rounded-3xl bg-slate-900/80 border border-white/10 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs font-black text-white">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              <span>O‘yin Ichidagi Jonli Chat</span>
            </div>

            <div className="h-32 overflow-y-auto flex flex-col gap-1.5 p-2 rounded-2xl bg-black/40 border border-white/5 text-xs">
              {chatMessages.length === 0 ? (
                <span className="text-slate-500 text-center my-auto">Hali xabarlar yo‘q...</span>
              ) : (
                chatMessages.map((m, i) => (
                  <div key={i} className="flex items-baseline gap-2">
                    <span className="font-bold text-cyan-300">{m.sender}:</span>
                    <span className="text-slate-200">{m.text}</span>
                    <span className="text-[9px] text-slate-500 ml-auto">{m.time}</span>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSendChat} className="flex gap-2">
              <input
                type="text"
                placeholder="Raqibga xabar yozing..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-cyan-400 text-slate-950 font-black text-xs hover:bg-cyan-300 transition-all cursor-pointer flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Yuborish</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
