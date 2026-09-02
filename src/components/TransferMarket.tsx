import React, { useState } from 'react';
import { Player } from '../types';
import { REAL_STAR_PLAYERS } from '../data/realPlayers';
import { PlayerAvatar } from './PlayerAvatar';
import { sfxCardFlip, sfxClick } from '../utils/audio';
import { speakText } from '../utils/speech';
import { ShoppingBag, Search, Filter, Coins, Check, ArrowDownUp } from 'lucide-react';

interface TransferMarketProps {
  clubBudget: number;
  userSquad: Player[];
  onBuyPlayer: (player: Player) => void;
  onSellPlayer: (player: Player) => void;
}

export const TransferMarket: React.FC<TransferMarketProps> = ({
  clubBudget,
  userSquad,
  onBuyPlayer,
  onSellPlayer
}) => {
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [filterPos, setFilterPos] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const marketPlayers = REAL_STAR_PLAYERS.filter(p => !userSquad.some(u => u.name === p.name));

  const filteredMarket = marketPlayers.filter(p => {
    const matchesPos = filterPos === 'ALL' || p.family === filterPos;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.club.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.nation.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPos && matchesSearch;
  });

  const filteredSquadToSell = userSquad.filter(p => {
    const matchesPos = filterPos === 'ALL' || p.family === filterPos;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPos && matchesSearch;
  });

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-5">
      {/* Top Banner: Club Budget & Tabs */}
      <div className="p-4 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl flex flex-wrap justify-between items-center gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Klub Budjeti</span>
            <h2 className="text-2xl font-black text-amber-400 leading-none mt-0.5">
              €{(clubBudget / 1_000_000).toFixed(1)}M
            </h2>
          </div>
        </div>

        {/* Buy / Sell Tabs */}
        <div className="flex rounded-2xl p-1 bg-white/[0.05] border border-white/10">
          <button
            onClick={() => {
              sfxClick();
              setActiveTab('buy');
              speakText("Transfer bozori: Yangi o'yinchilarni sotib olish bo'limi", true);
            }}
            aria-label="Sotib olish bo'limi"
            className={`px-5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'buy'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/30'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Sotib Olish (Bozor)
          </button>
          <button
            onClick={() => {
              sfxClick();
              setActiveTab('sell');
              speakText("Transfer ro'yxati: Jamoangizdagi o'yinchilarni sotish bo'limi", true);
            }}
            aria-label="Sotish bo'limi"
            className={`px-5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'sell'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/30'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Sotish (Transfer Ro‘yxati)
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-md">
        {/* Position filters */}
        <div className="flex gap-1.5 overflow-x-auto">
          {['ALL', 'FW', 'MF', 'DF', 'GK'].map(pos => (
            <button
              key={pos}
              onClick={() => {
                sfxClick();
                setFilterPos(pos);
              }}
              aria-label={`Filtr: ${pos}`}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                filterPos === pos
                  ? 'bg-white/20 text-cyan-300 border border-cyan-400/50'
                  : 'bg-white/[0.04] text-slate-400 hover:text-white'
              }`}
            >
              {pos === 'ALL' ? 'Barchasi' : pos === 'FW' ? 'Hujum' : pos === 'MF' ? 'Markaz' : pos === 'DF' ? 'Himoya' : 'Darvozabon'}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            aria-label="Futbolchi yoki klub qidirish"
            placeholder="Futbolchi yoki klub qidirish..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white/[0.06] border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* Players Grid */}
      {activeTab === 'buy' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filteredMarket.map((player, idx) => {
            const canAfford = clubBudget >= player.marketValue;
            return (
              <div
                key={`mkt_${player.id}_${idx}`}
                className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl flex flex-col justify-between gap-3 hover:border-cyan-500/40 transition-all hover:scale-101 shadow-lg"
              >
                <div className="flex items-start gap-3">
                  <PlayerAvatar avatar={player.avatar} size={50} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-sm text-amber-400">{player.ovr}</span>
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300">
                        {player.role}
                      </span>
                      <span className="text-xs">{player.nation.flag}</span>
                    </div>
                    <h4 className="font-black text-xs text-white truncate mt-0.5">{player.name}</h4>
                    <p className="text-[10px] text-slate-400 truncate">{player.club} • {player.league}</p>
                    <p className="text-[10px] text-cyan-400/80 font-bold mt-0.5">{player.playStyle}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <span className="text-xs font-black text-amber-300">
                    €{(player.marketValue / 1_000_000).toFixed(1)}M
                  </span>
                  <button
                    disabled={!canAfford}
                    onClick={() => {
                      sfxCardFlip(2);
                      onBuyPlayer(player);
                      speakText(`${player.name} sotib olindi. Narxi: ${(player.marketValue / 1_000_000).toFixed(1)} million yevro`, true);
                    }}
                    aria-label={`${player.name} ni sotib olish, narxi ${(player.marketValue / 1_000_000).toFixed(1)} million`}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                      canAfford
                        ? 'bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 shadow-md shadow-emerald-500/20'
                        : 'bg-white/10 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {canAfford ? 'Sotib Olish' : 'Mablag‘ Yetarli Emas'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filteredSquadToSell.map((player, idx) => (
            <div
              key={`sell_${player.id}_${idx}`}
              className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl flex flex-col justify-between gap-3 shadow-lg"
            >
              <div className="flex items-start gap-3">
                <PlayerAvatar avatar={player.avatar} size={50} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-sm text-amber-400">{player.ovr}</span>
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300">
                      {player.role}
                    </span>
                    <span className="text-xs">{player.nation.flag}</span>
                  </div>
                  <h4 className="font-black text-xs text-white truncate mt-0.5">{player.name}</h4>
                  <p className="text-[10px] text-slate-400 truncate">{player.club}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <span className="text-xs font-black text-amber-300">
                  €{(player.marketValue / 1_000_000).toFixed(1)}M
                </span>
                <button
                  onClick={() => {
                    sfxClick();
                    onSellPlayer(player);
                    speakText(`${player.name} sotildi. Klub budjetiga ${(player.marketValue / 1_000_000).toFixed(1)} million yevro qo'shildi`, true);
                  }}
                  aria-label={`${player.name} ni sotish`}
                  className="px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 transition-all cursor-pointer"
                >
                  Sotish (Pulga Almashtirish)
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
