
import React from 'react';
import { Team } from '../types';
import { ICONS } from '../constants';

interface FinancialPanelProps {
  team: Team;
  onUpdate: (type: 'revenue_share' | 'marketing', value: number) => void;
}

export const FinancialPanel: React.FC<FinancialPanelProps> = ({ team, onUpdate }) => {
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  };

  const capSpace = team.financials.revenueShareCap - team.financials.revenueShareAllocated;
  const nilBalance = team.financials.nilCollective;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5"><ICONS.Banknote className="w-24 h-24" /></div>
          <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">NIL Collective</div>
          <div className="text-3xl font-black text-emerald-400 mb-2">{formatMoney(nilBalance)}</div>
          <div className="text-xs text-slate-500">Available for recruiting & retention</div>
        </div>

        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-5"><ICONS.Coins className="w-24 h-24" /></div>
          <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Rev Share Cap Space</div>
          <div className={`text-3xl font-black mb-2 ${capSpace > 0 ? 'text-white' : 'text-red-500'}`}>{formatMoney(capSpace)}</div>
          <div className="text-xs text-slate-500">Of {formatMoney(team.financials.revenueShareCap)} Cap</div>
        </div>

        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-5"><ICONS.Briefcase className="w-24 h-24" /></div>
          <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Marketing Budget</div>
          <div className="text-3xl font-black text-blue-400 mb-2">{formatMoney(team.financials.marketingBudget)}</div>
          <div className="text-xs text-slate-500">Used for official visits & scouting</div>
        </div>
      </div>

      <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700">
        <h3 className="text-xl font-bold text-white mb-6">Payroll Management</h3>
        
        <div className="space-y-6">
           <div>
              <div className="flex justify-between mb-2">
                 <label className="text-sm font-bold text-slate-300">Revenue Share Allocation (Current Roster)</label>
                 <span className="text-emerald-400 font-mono">{formatMoney(team.financials.revenueShareAllocated)}</span>
              </div>
              <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden">
                 <div className="h-full bg-blue-500 striped-bar" style={{width: `${(team.financials.revenueShareAllocated / team.financials.revenueShareCap) * 100}%`}}></div>
              </div>
              <p className="text-xs text-slate-500 mt-2">Allocating revenue share increases team morale and prevents transfers, but limits flexibility.</p>
           </div>
        </div>
      </div>
      
      <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700">
         <h3 className="text-xl font-bold text-white mb-4">Top Earners (Projected)</h3>
         <div className="space-y-3">
            {team.roster.sort((a,b) => b.marketValue - a.marketValue).slice(0, 5).map(player => (
               <div key={player.id} className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg">
                  <div className="flex items-center gap-3">
                     <span className="bg-slate-700 text-white text-xs font-bold px-2 py-1 rounded">{player.position}</span>
                     <span className="font-bold text-slate-200">{player.name}</span>
                  </div>
                  <div className="font-mono text-emerald-400">{formatMoney(player.marketValue)}</div>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
};
