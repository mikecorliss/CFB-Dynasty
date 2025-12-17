import React from 'react';
import { Player, Position } from '../types';

interface PlayerCardProps {
  player: Player;
  compact?: boolean;
}

const getPositionColor = (pos: Position) => {
  switch (pos) {
    case Position.QB: return 'text-red-400 bg-red-400/10';
    case Position.RB:
    case Position.WR: return 'text-blue-400 bg-blue-400/10';
    case Position.OL: return 'text-orange-400 bg-orange-400/10';
    case Position.DL:
    case Position.LB: return 'text-purple-400 bg-purple-400/10';
    default: return 'text-emerald-400 bg-emerald-400/10';
  }
};

export const PlayerCard: React.FC<PlayerCardProps> = ({ player, compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
        <div className="flex items-center space-x-3">
          <span className={`px-2 py-1 rounded text-xs font-bold ${getPositionColor(player.position)}`}>
            {player.position}
          </span>
          <div>
            <div className="font-semibold text-slate-100">{player.name}</div>
            <div className="text-xs text-slate-400">{player.year} • {player.hometown}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-slate-200">{player.rating}</div>
          <div className="text-xs text-slate-500 uppercase">OVR</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 shadow-lg relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <span className="text-6xl font-black">{player.position}</span>
      </div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <span className={`px-3 py-1 rounded-full text-sm font-bold ${getPositionColor(player.position)}`}>
            {player.position}
          </span>
          <span className="text-2xl font-bold text-white">{player.rating}</span>
        </div>
        
        <h3 className="text-xl font-bold text-white mb-1">{player.name}</h3>
        <p className="text-slate-400 text-sm mb-4">{player.year} • {player.hometown}</p>
        
        <div className="grid grid-cols-3 gap-2 py-3 border-t border-slate-700">
           <div className="text-center">
             <div className="text-xs text-slate-500">Gms</div>
             <div className="font-mono text-slate-300">{player.stats.games}</div>
           </div>
           <div className="text-center">
             <div className="text-xs text-slate-500">Yds</div>
             <div className="font-mono text-slate-300">{player.stats.yards}</div>
           </div>
           <div className="text-center">
             <div className="text-xs text-slate-500">TD</div>
             <div className="font-mono text-slate-300">{player.stats.touchdowns}</div>
           </div>
        </div>
      </div>
    </div>
  );
};