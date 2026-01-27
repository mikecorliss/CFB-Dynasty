
import React, { useState, useMemo } from 'react';
import { Recruit, RecruitPriority, Team, Position } from '../types';
import { ICONS } from '../constants';

interface RecruitingBoardProps {
  recruits: Recruit[];
  team: Team;
  hoursAvailable: number;
  onAction: (recruitId: string, action: string, cost: number, data?: any) => void;
  onToggleTarget: (recruitId: string) => void;
}

interface FilterState {
  status: 'ALL' | 'TARGETS';
  position: 'ALL' | string;
  state: 'ALL' | string;
  minStars: number;
  minInterest: number;
}

export const RecruitingBoard: React.FC<RecruitingBoardProps> = ({ recruits, team, hoursAvailable, onAction, onToggleTarget }) => {
  const [filters, setFilters] = useState<FilterState>({
    status: 'TARGETS',
    position: 'ALL',
    state: 'ALL',
    minStars: 0,
    minInterest: 0
  });

  const [selectedRecruitId, setSelectedRecruitId] = useState<string | null>(null);
  const [nilOfferAmount, setNilOfferAmount] = useState(0);

  // Extract unique states for dropdown
  const availableStates = useMemo(() => {
    const states = new Set<string>();
    recruits.forEach(r => {
      const parts = r.hometown.split(',');
      if (parts.length > 1) {
        states.add(parts[1].trim());
      }
    });
    return Array.from(states).sort();
  }, [recruits]);

  const displayedRecruits = useMemo(() => {
    return recruits
      .filter(r => {
        if (filters.status === 'TARGETS' && !r.isTargeted) return false;
        if (filters.position !== 'ALL' && r.position !== filters.position) return false;
        if (filters.state !== 'ALL' && !r.hometown.includes(filters.state)) return false;
        if (r.stars < filters.minStars) return false;
        if (r.interest < filters.minInterest) return false;
        return true;
      })
      .sort((a, b) => (b.isTargeted ? 1 : 0) - (a.isTargeted ? 1 : 0) || b.rating - a.rating);
  }, [recruits, filters]);

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const ACTIONS = [
    { id: 'scout', label: 'Scout', cost: 10, desc: 'Reveal potential & interest' },
    { id: 'contact', label: 'DM/Text', cost: 5, desc: 'Low impact, maintain interest' },
    { id: 'soft_sell', label: 'Soft Sell', cost: 20, desc: 'Pitch program fit' },
    { id: 'visit', label: 'Official Visit', cost: 50, desc: 'High impact, very expensive' },
    { id: 'scholarship', label: 'Offer Scholarship', cost: 0, desc: 'Formal offer' },
  ];

  const getPriorityColor = (p: RecruitPriority) => {
    switch(p) {
        case 'Financial': return 'text-green-400 bg-green-400/10';
        case 'Pro Potential': return 'text-blue-400 bg-blue-400/10';
        case 'Playing Time': return 'text-orange-400 bg-orange-400/10';
        default: return 'text-slate-400 bg-slate-400/10';
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-800 p-6 rounded-xl border border-slate-700">
        <div>
          <h2 className="text-2xl font-black text-white">Recruiting Board</h2>
          <p className="text-slate-400 text-sm">Target players, allocate hours, and manage NIL offers.</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-emerald-400">{hoursAvailable}</div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Weekly Hours</div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 grid grid-cols-2 md:grid-cols-5 gap-4">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Board Status</label>
          <select 
            value={filters.status}
            onChange={(e) => updateFilter('status', e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs font-bold focus:border-emerald-500 outline-none"
          >
            <option value="TARGETS">My Targets</option>
            <option value="ALL">All Recruits</option>
          </select>
        </div>
        
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Position</label>
          <select 
            value={filters.position}
            onChange={(e) => updateFilter('position', e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs font-bold focus:border-emerald-500 outline-none"
          >
            <option value="ALL">All Positions</option>
            {Object.values(Position).map(pos => (
              <option key={pos} value={pos}>{pos}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">State</label>
          <select 
            value={filters.state}
            onChange={(e) => updateFilter('state', e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs font-bold focus:border-emerald-500 outline-none"
          >
            <option value="ALL">All States</option>
            {availableStates.map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Min Stars</label>
          <select 
            value={filters.minStars}
            onChange={(e) => updateFilter('minStars', parseInt(e.target.value))}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs font-bold focus:border-emerald-500 outline-none"
          >
            <option value={0}>Any Rating</option>
            <option value={3}>3 Stars +</option>
            <option value={4}>4 Stars +</option>
            <option value={5}>5 Stars Only</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Interest</label>
          <select 
            value={filters.minInterest}
            onChange={(e) => updateFilter('minInterest', parseInt(e.target.value))}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs font-bold focus:border-emerald-500 outline-none"
          >
            <option value={0}>Any Interest</option>
            <option value={1}>Open ({'>'}0%)</option>
            <option value={25}>Interested ({'>'}25%)</option>
            <option value={50}>High Interest ({'>'}50%)</option>
            <option value={80}>Lock ({'>'}80%)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {displayedRecruits.map(recruit => {
          const isSelected = selectedRecruitId === recruit.id;
          const stars = Array(recruit.stars).fill('★').join('');
          
          return (
            <div key={recruit.id} className={`bg-slate-800 rounded-xl border transition-all ${isSelected ? 'border-emerald-500 shadow-xl shadow-emerald-900/20' : 'border-slate-700 hover:border-slate-600'}`}>
              <div className="p-5 flex flex-col md:flex-row justify-between md:items-center gap-4 cursor-pointer" onClick={() => setSelectedRecruitId(isSelected ? null : recruit.id)}>
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center font-black text-white text-lg">{recruit.position}</div>
                   <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-white text-lg">{recruit.name}</span>
                        <span className="text-yellow-500 text-xs">{stars}</span>
                      </div>
                      <div className="text-xs text-slate-400">{recruit.hometown} • {recruit.isScouted ? `Potential: ${recruit.potential}` : 'Unscouted'}</div>
                   </div>
                </div>
                
                <div className="flex items-center gap-6">
                  {recruit.committedTo ? (
                    <div className="bg-red-500/20 text-red-400 px-3 py-1 rounded text-xs font-bold uppercase">Committed to {recruit.committedTo}</div>
                  ) : (
                    <div className="flex flex-col items-end">
                       <div className="w-32 h-2 bg-slate-900 rounded-full overflow-hidden mb-1">
                          <div className="h-full bg-emerald-500 transition-all duration-500" style={{width: `${recruit.interest}%`}}></div>
                       </div>
                       <div className="text-[10px] text-slate-500 font-bold uppercase">{recruit.interest}% Interest</div>
                    </div>
                  )}
                  <button 
                    onClick={(e) => { e.stopPropagation(); onToggleTarget(recruit.id); }}
                    className={`p-2 rounded-lg border ${recruit.isTargeted ? 'bg-red-500/10 border-red-500 text-red-400' : 'bg-emerald-500/10 border-emerald-500 text-emerald-400'}`}
                  >
                    {recruit.isTargeted ? <ICONS.Filter className="w-4 h-4" /> : <ICONS.Users className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {isSelected && !recruit.committedTo && (
                <div className="p-5 border-t border-slate-700 bg-slate-900/50 rounded-b-xl animate-in slide-in-from-top-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                    <div>
                       <h4 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-3">Player Info</h4>
                       <div className="space-y-2 text-sm">
                          <div className="flex justify-between"><span className="text-slate-400">Top Priority</span> <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getPriorityColor(recruit.priority)}`}>{recruit.priority}</span></div>
                          <div className="flex justify-between"><span className="text-slate-400">Deal Breaker</span> <span className="text-red-400 font-bold">{recruit.dealBreaker || 'None'}</span></div>
                          <div className="flex justify-between"><span className="text-slate-400">Market Value</span> <span className="text-emerald-400 font-mono">${recruit.marketValue.toLocaleString()}</span></div>
                          <div className="flex justify-between"><span className="text-slate-400">Scholarship</span> <span className={recruit.isOffered ? "text-emerald-400 font-bold" : "text-slate-500"}>{recruit.isOffered ? 'Offered' : 'None'}</span></div>
                       </div>
                    </div>
                    <div>
                       <h4 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-3">NIL Offer</h4>
                       <div className="flex gap-2 mb-2">
                         <input 
                            type="number" 
                            value={nilOfferAmount} 
                            onChange={(e) => setNilOfferAmount(Number(e.target.value))}
                            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white w-full font-mono text-sm"
                            placeholder="Amount..."
                         />
                         <button 
                           onClick={() => onAction(recruit.id, 'nil_offer', 0, { amount: nilOfferAmount })}
                           className="bg-green-600 hover:bg-green-500 text-white font-bold px-4 py-2 rounded-lg text-xs"
                         >
                           OFFER
                         </button>
                       </div>
                       <p className="text-[10px] text-slate-500">Current Offer: <span className="text-green-400 font-mono">${recruit.nilOffer.toLocaleString()}</span></p>
                    </div>
                  </div>

                  <h4 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-3">Weekly Actions</h4>
                  <div className="flex flex-wrap gap-2">
                    {ACTIONS.map(action => (
                      <button
                        key={action.id}
                        disabled={hoursAvailable < action.cost || (action.id === 'scholarship' && recruit.isOffered)}
                        onClick={() => onAction(recruit.id, action.id, action.cost)}
                        className={`px-4 py-3 rounded-lg border text-left min-w-[140px] transition-all disabled:opacity-50 disabled:cursor-not-allowed ${hoursAvailable >= action.cost ? 'bg-slate-800 border-slate-600 hover:bg-slate-700 hover:border-emerald-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-600'}`}
                      >
                        <div className="text-sm font-bold mb-1">{action.label}</div>
                        <div className="flex justify-between text-[10px]">
                           <span className="text-slate-400">{action.desc}</span>
                           {action.cost > 0 && <span className="text-emerald-400 font-bold">{action.cost} hrs</span>}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {displayedRecruits.length === 0 && (
          <div className="text-center py-20 text-slate-500">No recruits found. Try changing filters or scouting more players.</div>
        )}
      </div>
    </div>
  );
};
