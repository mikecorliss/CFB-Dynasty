import React from 'react';
import { Team } from '../types';

interface StrategyPanelProps {
  strategy: Team['strategy'];
  onUpdate: (newStrategy: Team['strategy']) => void;
}

export const StrategyPanel: React.FC<StrategyPanelProps> = ({ strategy, onUpdate }) => {
  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-8">
      <div>
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          Gameplan Strategy
        </h2>

        <div className="space-y-6">
          {/* Offense */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Offensive Scheme</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['Balanced', 'Spread', 'Pro-Style', 'Option', 'Air Raid', 'Run Heavy'].map((scheme) => (
                <button
                  key={scheme}
                  onClick={() => onUpdate({ ...strategy, offense: scheme as any })}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    strategy.offense === scheme
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50 ring-1 ring-emerald-400'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {scheme}
                </button>
              ))}
            </div>
          </div>

          {/* Defense */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Defensive Front</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['Balanced', '4-3', '3-4', 'Blitz Heavy', '4-2-5', '3-3-5'].map((scheme) => (
                <button
                  key={scheme}
                  onClick={() => onUpdate({ ...strategy, defense: scheme as any })}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    strategy.defense === scheme
                      ? 'bg-red-600 text-white shadow-lg shadow-red-900/50 ring-1 ring-red-400'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {scheme}
                </button>
              ))}
            </div>
          </div>

          {/* Aggression Slider */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="block text-sm font-medium text-slate-400">Playcalling Aggression</label>
              <span className="text-emerald-400 font-bold">{strategy.aggression}/10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={strategy.aggression}
              onChange={(e) => onUpdate({ ...strategy, aggression: parseInt(e.target.value) })}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>Conservative</span>
              <span>Risky</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-slate-700">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          Game Management
        </h2>

        <div className="space-y-6">
          {/* Clock Management */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Clock Management Style</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { id: 'Aggressive', desc: 'Up-tempo, snap early' },
                { id: 'Balanced', desc: 'Situational pacing' },
                { id: 'Conservative', desc: 'Bleed clock, limit pos' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => onUpdate({ ...strategy, clockManagement: opt.id as any })}
                  className={`px-4 py-3 rounded-lg text-left transition-all border ${
                    strategy.clockManagement === opt.id
                      ? 'bg-emerald-600/10 border-emerald-500 ring-1 ring-emerald-500'
                      : 'bg-slate-700 border-transparent text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <div className={`font-bold text-sm ${strategy.clockManagement === opt.id ? 'text-emerald-400' : 'text-white'}`}>{opt.id}</div>
                  <div className="text-xs text-slate-500">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Fourth Down Tendencies */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Fourth Down Tendency</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { id: 'Aggressive', label: 'Go For It Often', desc: 'Always trust the analytics' },
                { id: 'Balanced', label: 'Situational', desc: 'Standard field pos logic' },
                { id: 'Conservative', label: 'Punt / Field Goal', desc: 'Trust the defense, play safe' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => onUpdate({ ...strategy, fourthDownTendency: opt.id as any })}
                  className={`px-4 py-3 rounded-lg text-left transition-all border ${
                    strategy.fourthDownTendency === opt.id
                      ? 'bg-indigo-600/10 border-indigo-500 ring-1 ring-indigo-500'
                      : 'bg-slate-700 border-transparent text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <div className={`font-bold text-sm ${strategy.fourthDownTendency === opt.id ? 'text-indigo-400' : 'text-white'}`}>{opt.label}</div>
                  <div className="text-xs text-slate-500">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};