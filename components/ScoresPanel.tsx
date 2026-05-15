import React, { useState } from 'react';
import { Matchup, Team } from '../types';

interface ScoresPanelProps {
  schedule: Matchup[];
  league: Team[];
  currentWeek: number;
}

export const ScoresPanel: React.FC<ScoresPanelProps> = ({ schedule, league, currentWeek }) => {
  const [selectedWeek, setSelectedWeek] = useState(currentWeek === 0 ? 1 : currentWeek);

  const maxWeek = Math.max(...schedule.map(m => m.week), 1);
  const weeks = Array.from({ length: maxWeek }, (_, i) => i + 1);

  const matchupsForWeek = schedule.filter(m => m.week === selectedWeek);

  const getTeam = (id: string) => league.find(t => t.id === id);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center bg-white dark:bg-[#111111] p-4 rounded-2xl border border-slate-300 dark:border-[#2a2a2a]">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Scores</h2>
        <select 
          value={selectedWeek}
          onChange={(e) => setSelectedWeek(Number(e.target.value))}
          className="bg-slate-50 dark:bg-black border border-slate-300 dark:border-[#2a2a2a] rounded-lg px-4 py-2 text-slate-900 dark:text-white text-sm font-bold focus:border-emerald-500 outline-none"
        >
          {weeks.map(w => (
            <option key={w} value={w}>Week {w}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {matchupsForWeek.map(match => {
          const homeTeam = getTeam(match.homeTeamId);
          const awayTeam = getTeam(match.awayTeamId);
          if (!homeTeam || !awayTeam) return null;

          return (
            <div key={match.id} className="bg-white dark:bg-[#111111] rounded-2xl border border-slate-300 dark:border-[#2a2a2a] overflow-hidden shadow-lg p-6 flex flex-col gap-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-[#2a2a2a]">
                 <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {match.isConferenceGame ? 'Conference' : 'Non-Con'}
                 </span>
                 <span className={`text-xs font-black uppercase tracking-wider ${match.played ? 'text-slate-600 dark:text-slate-400' : 'text-emerald-500'}`}>
                    {match.played ? 'Final' : 'Scheduled'}
                 </span>
              </div>
              
              <div className="flex flex-col gap-3">
                <div className={`flex justify-between items-center ${match.played && match.winnerId === awayTeam.id ? 'font-black' : 'opacity-80'}`}>
                  <div className="flex items-center gap-3">
                    <img src={awayTeam.logo} alt={awayTeam.name} className="w-8 h-8 object-contain" />
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {awayTeam.stats.rank > 0 && awayTeam.stats.rank <= 25 && <span className="text-[10px] text-emerald-500">#{awayTeam.stats.rank}</span>}
                        {awayTeam.name}
                      </div>
                      <div className="text-[10px] text-slate-500">{awayTeam.stats.wins}-{awayTeam.stats.losses}</div>
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {match.played ? match.awayScore : '-'}
                  </div>
                </div>

                <div className={`flex justify-between items-center ${match.played && match.winnerId === homeTeam.id ? 'font-black' : 'opacity-80'}`}>
                  <div className="flex items-center gap-3">
                    <img src={homeTeam.logo} alt={homeTeam.name} className="w-8 h-8 object-contain" />
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {homeTeam.stats.rank > 0 && homeTeam.stats.rank <= 25 && <span className="text-[10px] text-emerald-500">#{homeTeam.stats.rank}</span>}
                        {homeTeam.name}
                      </div>
                      <div className="text-[10px] text-slate-500">{homeTeam.stats.wins}-{homeTeam.stats.losses}</div>
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {match.played ? match.homeScore : '-'}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {matchupsForWeek.length === 0 && (
           <div className="col-span-full py-20 text-center text-slate-500 font-bold uppercase tracking-widest">
             No games scheduled for Week {selectedWeek}
           </div>
        )}
      </div>
    </div>
  );
};
