
import React, { useState, useEffect } from 'react';
import { ICONS, INITIAL_LEAGUE, generateBalancedRoster, calculateStars, generateRandomPlayer } from './constants';
import { Team, GameResult, Recruit, Position, Matchup, SeasonStage, Coach, PlayerYear, Player, AISettings, Storyline, RecruitPriority } from './types';
import { PlayerCard } from './components/PlayerCard';
import { StrategyPanel } from './components/StrategyPanel';
import { RecruitingBoard } from './components/RecruitingBoard';
import { FinancialPanel } from './components/FinancialPanel';
import { simulateGameWithAI, generateWeeklyStorylines } from './services/geminiService';
import { generateSeasonSchedule, simulateMatch, getStandings, generatePlayoffs, getAPTop25, getCFPTop25, generateConferenceChampionships } from './utils/seasonUtils';

const TABS = {
  DASHBOARD: 'Home',
  RESULTS: 'Scores',
  RANKINGS: 'Polls',
  ROSTER: 'Roster',
  RECRUITING: 'Recruiting',
  FINANCE: 'Front Office',
  STRATEGY: 'Strategy',
  STANDINGS: 'Conferences',
  SETTINGS: 'Settings'
};

const PRIORITIES: RecruitPriority[] = ['Pro Potential', 'Playing Time', 'Academics', 'Distance', 'Prestige', 'Coaching', 'Financial'];

const App = () => {
  const [appReady, setAppReady] = useState(false);
  const [viewState, setViewState] = useState<'SETUP_AI' | 'CREATE_COACH' | 'JOB_OFFERS' | 'DYNASTY_HUB' | 'FIRED'>('SETUP_AI');
  const [seasonStage, setSeasonStage] = useState<SeasonStage>(SeasonStage.PRE_SEASON);
  const [coach, setCoach] = useState<Coach>({
    name: '', almaMater: '', level: 1, prestige: 10, offense: 'Balanced', defense: '4-3', history: [], stats: { wins: 0, losses: 0, confChamps: 0, natChamps: 0 }
  });

  const [league, setLeague] = useState<Team[]>(INITIAL_LEAGUE);
  const [userTeamId, setUserTeamId] = useState<string>('');
  const [userHotseat, setUserHotseat] = useState<number>(0);
  const [jobOffers, setJobOffers] = useState<Team[]>([]);
  const [schedule, setSchedule] = useState<Matchup[]>([]);
  const [storylines, setStorylines] = useState<Storyline[]>([]);
  const [activeTab, setActiveTab] = useState(TABS.DASHBOARD);
  const [week, setWeek] = useState(0);
  const [simResult, setSimResult] = useState<GameResult | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Recruiting & Finance State
  const [recruitingHours, setRecruitingHours] = useState(500);
  const [recruits, setRecruits] = useState<Recruit[]>([]);
  
  // AI Settings State
  const [aiSettings, setAiSettings] = useState<AISettings>({ provider: 'ollama', ollamaUrl: 'http://localhost:11434', ollamaModel: 'llama3', ollamaApiKey: '' });
  const [aiConnectionStatus, setAiConnectionStatus] = useState<'IDLE' | 'TESTING' | 'SUCCESS' | 'ERROR' | 'OFFLINE'>('IDLE');
  const [aiErrorDetails, setAiErrorDetails] = useState<string>('');

  useEffect(() => {
    const storedSettings = localStorage.getItem('cfb_dynasty_ai_settings');
    if (storedSettings) {
      setAiSettings(JSON.parse(storedSettings));
      setViewState('CREATE_COACH');
    }
    setAppReady(true);
  }, []);

  const saveAiSettings = () => {
    const sanitizedSettings = {
      ...aiSettings,
      ollamaUrl: aiSettings.ollamaUrl.replace(/\/$/, '')
    };
    localStorage.setItem('cfb_dynasty_ai_settings', JSON.stringify(sanitizedSettings));
    setAiSettings(sanitizedSettings);
    setViewState('CREATE_COACH');
  };

  const testOllamaConnection = async () => {
    setAiConnectionStatus('TESTING');
    setAiErrorDetails('');
    try {
      const headers: HeadersInit = {};
      if (aiSettings.ollamaApiKey) {
        headers['Authorization'] = `Bearer ${aiSettings.ollamaApiKey}`;
      }
      
      const baseUrl = aiSettings.ollamaUrl.replace(/\/$/, '');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); 

      const res = await fetch(`${baseUrl}/api/tags`, {
        headers: headers,
        signal: controller.signal
      }).catch(err => {
        if (err.name === 'AbortError') throw new Error('Connection timed out');
        throw err;
      });
      
      clearTimeout(timeoutId);
      
      if (res.ok) {
        setAiConnectionStatus('SUCCESS');
      } else {
        setAiConnectionStatus('ERROR');
        setAiErrorDetails(`Status: ${res.status} ${res.statusText}`);
      }
    } catch (e: any) {
      if (e.message.includes('Failed to fetch') || e.message.includes('NetworkError') || e.message.includes('Connection timed out')) {
        setAiConnectionStatus('OFFLINE');
        setAiErrorDetails('CORS or Network Error. The browser blocked the request.');
      } else {
        console.error(e);
        setAiConnectionStatus('ERROR');
        setAiErrorDetails(e.message || 'Unknown Error');
      }
    }
  };

  const userTeam = league.find(t => t.id === userTeamId);
  const weeklySchedule = schedule.filter(m => m.week === week);
  const userMatchup = weeklySchedule.find(m => m.homeTeamId === userTeamId || m.awayTeamId === userTeamId);
  const currentOpponent = userMatchup 
    ? league.find(t => t.id === (userMatchup.homeTeamId === userTeamId ? userMatchup.awayTeamId : userMatchup.homeTeamId))
    : null;

  const initRecruitingPool = (teamPrestige: number) => {
    const newRecruits: Recruit[] = [];
    for (let i = 0; i < 150; i++) {
      const p = generateRandomPlayer(`rec-${i}`, undefined, 60, 99);
      const isFiveStar = p.rating >= 80;
      // High prestige teams get more initial interest
      const interestBase = Math.floor(Math.random() * 20);
      const prestigeBonus = teamPrestige > 80 && isFiveStar ? 10 : 0;

      newRecruits.push({
        ...p,
        interest: interestBase + prestigeBonus,
        offers: [],
        committedTo: null,
        stars: p.rating >= 80 ? 5 : p.rating >= 75 ? 4 : 3,
        isScouted: false,
        isOffered: false,
        isTargeted: false,
        recruitType: 'HS',
        priority: PRIORITIES[Math.floor(Math.random() * PRIORITIES.length)],
        marketValue: p.rating * 1500 * (1 + Math.random()), // Recruits are cheaper than transfers initially
        nilOffer: 0,
        dealBreaker: Math.random() > 0.7 ? 'Financial' : undefined
      });
    }
    setRecruits(newRecruits.sort((a,b) => b.rating - a.rating));
  };

  const handleCreateCoach = () => {
    if (!coach.name) return;
    const potentialTeams = league.filter(t => t.prestige < 75 || t.coachHotseat > 60);
    setJobOffers(potentialTeams.sort((a, b) => b.coachHotseat - a.coachHotseat).slice(0, 6));
    setViewState('JOB_OFFERS');
  };

  const handleSelectJob = (teamId: string) => {
    const team = league.find(t => t.id === teamId)!;
    // Calculate initial payroll based on roster market values
    const roster = generateBalancedRoster(teamId, team.prestige);
    const payroll = roster.reduce((acc, p) => acc + p.marketValue, 0);

    setLeague(prev => prev.map(t => t.id === teamId ? { 
        ...t, 
        roster: roster, 
        coachHotseat: 10,
        financials: { ...t.financials, revenueShareAllocated: payroll }
    } : t));
    
    setUserTeamId(teamId);
    setUserHotseat(10);
    setSchedule(generateSeasonSchedule(league));
    initRecruitingPool(team.prestige);
    setViewState('DYNASTY_HUB');
    setSeasonStage(SeasonStage.PRE_SEASON);
  };

  const calculateHotseatChange = (team: Team, isUser: boolean) => {
    const expectedWinRate = (team.prestige / 100) * 0.8;
    const currentWinRate = team.stats.wins / Math.max(1, team.stats.wins + team.stats.losses);
    let change = 0;
    const diff = currentWinRate - expectedWinRate;
    if (diff < -0.3) change += 20;
    else if (diff < -0.1) change += 10;
    else if (diff > 0.2) change -= 15;
    else if (diff > 0) change -= 5;
    if (team.stats.losses > team.stats.wins) change += 5;
    return change;
  };

  const updateLeagueHotseats = (currentLeague: Team[]) => {
    return currentLeague.map(team => {
      const change = calculateHotseatChange(team, team.id === userTeamId);
      const newScore = Math.min(100, Math.max(0, team.coachHotseat + change));
      if (team.id === userTeamId) {
        setUserHotseat(newScore);
      }
      return { ...team, coachHotseat: newScore };
    });
  };

  const handleRecruitAction = (recruitId: string, action: string, cost: number, data?: any) => {
      if (!userTeam) return;

      if (action === 'nil_offer') {
          const offer = data?.amount || 0;
          // Check NIL budget
          if (userTeam.financials.nilCollective < offer) {
              alert("Insufficient funds in NIL Collective.");
              return;
          }
          
          setRecruits(prev => prev.map(r => {
             if (r.id === recruitId) {
                 const prevOffer = r.nilOffer;
                 const diff = offer - prevOffer;
                 // Interest formula based on offer vs market value
                 const valueRatio = offer / Math.max(1, r.marketValue);
                 const interestGain = Math.floor(valueRatio * 20); 
                 
                 return { ...r, nilOffer: offer, interest: Math.min(100, r.interest + interestGain) };
             }
             return r;
          }));
          
          setLeague(prev => prev.map(t => t.id === userTeamId ? {
              ...t, financials: { ...t.financials, nilCollective: t.financials.nilCollective - (offer - (recruits.find(r=>r.id===recruitId)?.nilOffer||0)) }
          } : t));
          return;
      }

      // Standard actions
      setRecruitingHours(prev => prev - cost);
      setRecruits(prev => prev.map(r => {
          if (r.id === recruitId) {
              let interestGain = 0;
              let extra = {};
              switch(action) {
                  case 'scout':
                      interestGain = 5;
                      extra = { isScouted: true };
                      break;
                  case 'contact': interestGain = 3; break;
                  case 'soft_sell': interestGain = 10; break;
                  case 'visit': interestGain = 25; break;
                  case 'scholarship': 
                      interestGain = 15; 
                      extra = { isOffered: true };
                      break;
              }
              return { ...r, interest: Math.min(100, r.interest + interestGain), ...extra };
          }
          return r;
      }));
  };

  const toggleTarget = (recruitId: string) => {
      setRecruits(prev => prev.map(r => r.id === recruitId ? { ...r, isTargeted: !r.isTargeted } : r));
  };

  const advanceWeek = async () => {
    setLoading(true);
    let tempLeague = [...league];

    // Simulate Games
    const updatedSchedule = schedule.map(match => {
      if (match.week !== week || match.played) return match;
      let res;
      if (match.id === userMatchup?.id && simResult) {
         res = { homeScore: simResult.stats?.homeScore || 0, awayScore: simResult.stats?.awayScore || 0 };
      } else {
        const home = tempLeague.find(t => t.id === match.homeTeamId)!;
        const away = tempLeague.find(t => t.id === match.awayTeamId)!;
        res = simulateMatch(home, away);
      }

      tempLeague = tempLeague.map(t => {
        if (t.id === match.homeTeamId || t.id === match.awayTeamId) {
          const isHome = t.id === match.homeTeamId;
          const score = isHome ? res.homeScore : res.awayScore;
          const oppScore = isHome ? res.awayScore : res.homeScore;
          const isWin = score > oppScore;
          return {
            ...t,
            stats: {
              ...t.stats,
              wins: t.stats.wins + (isWin ? 1 : 0),
              losses: t.stats.losses + (isWin ? 0 : 1),
              pointsFor: t.stats.pointsFor + score,
              pointsAgainst: t.stats.pointsAgainst + oppScore
            }
          };
        }
        return t;
      });

      return { ...match, played: true, homeScore: res.homeScore, awayScore: res.awayScore, winnerId: res.homeScore > res.awayScore ? match.homeTeamId : match.awayTeamId };
    });

    const updatedLeague = updateLeagueHotseats(tempLeague);
    const newWeek = week + 1;
    
    // Simulate CPU Recruiting
    const updatedRecruits = recruits.map(r => {
        if (r.committedTo) return r;
        
        // Randomly simulate interest from other teams based on stars
        // 5 stars get more attention
        const attentionChance = r.stars * 0.1;
        if (Math.random() < attentionChance) {
            // Check if user is ignoring a target
            if (r.isTargeted && r.interest < 50) {
                 // Risk of losing ground
                 r.interest -= 5;
            }
            
            // Logic for CPU commitment
            // If interest is not high enough for user, they might commit elsewhere
            if (r.interest < 80 && Math.random() < 0.05) {
                const randomTeam = league[Math.floor(Math.random() * league.length)];
                if (randomTeam.id !== userTeamId) {
                    return { ...r, committedTo: randomTeam.abbreviation, interest: 0 };
                }
            }
        }
        
        // User commitment logic
        if (r.interest >= 100 && r.isOffered && !r.committedTo) {
             return { ...r, committedTo: userTeam?.abbreviation || 'USR' };
        }

        return r;
    });

    setRecruits(updatedRecruits);

    const user = updatedLeague.find(t => t.id === userTeamId);
    if (user && user.coachHotseat >= 100) {
      setViewState('FIRED');
      setLoading(false);
      return;
    }

    const topTeams = getAPTop25(updatedLeague).slice(0, 5).map(t => t.name);
    const newStorylines = await generateWeeklyStorylines(newWeek, topTeams, aiSettings);

    setLeague(updatedLeague);
    setSchedule(updatedSchedule);
    setWeek(newWeek);
    setStorylines(newStorylines);
    setSimResult(null);
    setRecruitingHours(500); // Reset hours
    setLoading(false);
  };

  const handleSimulateUserGame = async () => {
    if (!userTeam || !currentOpponent) return;
    setLoading(true);
    const result = await simulateGameWithAI(userTeam, currentOpponent, aiSettings);
    setSimResult(result);
    setLoading(false);
  };

  const getHotseatStatus = (score: number) => {
    if (score >= 90) return { label: 'ON FIRE', color: 'text-red-500 bg-red-500/20', desc: 'The fans are calling for your head.' };
    if (score >= 70) return { label: 'CRITICAL', color: 'text-red-400 bg-red-400/10', desc: 'One more loss could be the end.' };
    if (score >= 50) return { label: 'WARM', color: 'text-orange-500 bg-orange-500/10', desc: 'Seat is getting uncomfortable.' };
    if (score >= 30) return { label: 'STABLE', color: 'text-yellow-500 bg-yellow-500/10', desc: 'Administration is watching closely.' };
    return { label: 'SECURE', color: 'text-emerald-500 bg-emerald-500/10', desc: 'Job security is safe for now.' };
  };

  const renderDashboard = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
      <div className="lg:col-span-2 space-y-8">
        <section className="bg-slate-800 rounded-3xl border border-slate-700 overflow-hidden shadow-2xl relative">
          <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-8 py-4 flex justify-between items-center">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Next Matchup • Week {week}</h2>
            <div className="flex items-center gap-3">
               <span className="text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full font-bold">LIVE BROADCAST</span>
            </div>
          </div>
          
          <div className="p-10 text-center">
            {!currentOpponent ? (
              <div className="py-12">
                <ICONS.Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white">Bye Week</h3>
                <p className="text-slate-400">Rest up and focus on recruiting.</p>
                <button onClick={advanceWeek} className="mt-8 px-10 py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-2xl transition-all">Advance Week</button>
              </div>
            ) : simResult ? (
              <div className="animate-in zoom-in-95 duration-500">
                <div className="flex justify-around items-center mb-10">
                  <div className="text-center">
                    <div className="text-6xl font-black text-white mb-2">{simResult.stats?.homeScore}</div>
                    <div className="text-emerald-400 font-black tracking-tighter uppercase">{userTeam?.abbreviation}</div>
                  </div>
                  <div className="text-slate-500 font-bold uppercase text-xs">Final</div>
                  <div className="text-center">
                    <div className="text-6xl font-black text-white mb-2">{simResult.stats?.awayScore}</div>
                    <div className="text-slate-400 font-black tracking-tighter uppercase">{currentOpponent.abbreviation}</div>
                  </div>
                </div>
                <p className="text-slate-300 italic mb-8 max-w-lg mx-auto leading-relaxed">"{simResult.summary}"</p>
                <button onClick={advanceWeek} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-900/40">Finish Week</button>
              </div>
            ) : (
              <div>
                <div className="flex justify-center items-center gap-12 mb-10">
                  <div className="text-center group">
                    <div className={`w-24 h-24 ${userTeam?.color} rounded-3xl flex items-center justify-center text-3xl font-black text-white shadow-2xl mb-4 group-hover:scale-105 transition-transform`}>{userTeam?.abbreviation}</div>
                    <div className="font-black text-white text-xl">{userTeam?.nickname}</div>
                    <div className="text-xs text-slate-500">{userTeam?.stats.wins}-{userTeam?.stats.losses}</div>
                  </div>
                  <div className="text-4xl font-black text-slate-700 italic">VS</div>
                  <div className="text-center group">
                    <div className={`w-24 h-24 ${currentOpponent.color} rounded-3xl flex items-center justify-center text-3xl font-black text-white shadow-2xl mb-4 group-hover:scale-105 transition-transform`}>{currentOpponent.abbreviation}</div>
                    <div className="font-black text-white text-xl">{currentOpponent.nickname}</div>
                    <div className="text-xs text-slate-500">{currentOpponent.stats.wins}-{currentOpponent.stats.losses}</div>
                  </div>
                </div>
                <button onClick={handleSimulateUserGame} disabled={loading} className="w-full py-5 bg-white text-slate-900 font-black text-lg rounded-2xl hover:bg-emerald-400 transition-colors disabled:opacity-50">
                  {loading ? 'SIMULATING BROADCAST...' : 'KICKOFF GAME'}
                </button>
              </div>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <ICONS.Lightning className="text-emerald-500" /> Around the League
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {storylines.map(s => (
              <div key={s.id} className="bg-slate-800 p-6 rounded-3xl border border-slate-700 hover:border-slate-500 transition-colors group">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">{s.title}</h4>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded ${s.importance === 'HIGH' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {s.importance}
                  </span>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">{s.content}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="space-y-8">
        <section className="bg-slate-800 rounded-3xl border border-slate-700 p-6 overflow-hidden relative">
          <div className="absolute -top-4 -right-4 opacity-10">
            <ICONS.Briefcase className="w-24 h-24" />
          </div>
          <h3 className="text-sm font-black text-slate-500 uppercase mb-4 tracking-widest">Coaching Hotseat</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <div className={`text-2xl font-black ${getHotseatStatus(userHotseat).color.split(' ')[0]}`}>{userHotseat}%</div>
                <div className={`text-[10px] font-black px-2 py-0.5 rounded uppercase inline-block ${getHotseatStatus(userHotseat).color}`}>
                  {getHotseatStatus(userHotseat).label}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-black text-slate-600 uppercase">Expectations</div>
                <div className="text-sm font-bold text-slate-300">Bowl Game or Better</div>
              </div>
            </div>
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ${userHotseat > 80 ? 'bg-red-600' : userHotseat > 50 ? 'bg-orange-500' : 'bg-emerald-500'}`} 
                style={{ width: `${userHotseat}%` }}
              ></div>
            </div>
            <p className="text-xs text-slate-500 italic">{getHotseatStatus(userHotseat).desc}</p>
          </div>
        </section>

        <section className="bg-slate-800 rounded-3xl border border-slate-700 p-6">
          <h3 className="text-sm font-black text-slate-500 uppercase mb-4 tracking-widest">Conference Standings</h3>
          <div className="space-y-3">
            {getStandings(league.filter(t => t.conference === userTeam?.conference)).slice(0, 5).map((t, i) => (
              <div key={t.id} className={`flex justify-between items-center p-2 rounded-xl ${t.id === userTeamId ? 'bg-emerald-500/10' : ''}`}>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-600 w-4">{i+1}</span>
                  <div className={`w-2 h-2 rounded-full ${t.color}`}></div>
                  <span className={`text-sm font-bold ${t.id === userTeamId ? 'text-white' : 'text-slate-300'}`}>{t.name}</span>
                </div>
                <span className="text-xs font-mono text-slate-500">{t.stats.wins}-{t.stats.losses}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );

  if (!appReady) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <header className="bg-slate-900/50 border-b border-slate-800 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-20">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <ICONS.Football className="text-white w-6 h-6" />
            </div>
            <div className="leading-tight">
              <span className="block font-black text-xl tracking-tighter text-white uppercase">DYNASTY <span className="text-emerald-500 italic">25</span></span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Manager</span>
            </div>
          </div>
          {viewState === 'DYNASTY_HUB' && (
            <nav className="hidden lg:flex gap-2">
              {Object.values(TABS).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-xs font-black rounded-xl transition-all uppercase tracking-widest ${activeTab === tab ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          )}
          {userTeam && viewState !== 'SETUP_AI' && (
            <div className="flex items-center gap-4">
               <div className="text-right hidden sm:block">
                  <div className="text-[10px] font-black text-slate-500 uppercase">{userTeam.nickname}</div>
                  <div className="text-sm font-black text-white">{userTeam.stats.wins}-{userTeam.stats.losses}</div>
               </div>
               <div className={`w-10 h-10 rounded-xl ${userTeam.color} shadow-lg border border-white/10`}></div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {viewState === 'SETUP_AI' && (
          <div className="max-w-xl mx-auto bg-slate-800 rounded-3xl border border-slate-700 p-10 shadow-3xl text-center">
             <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-900/20">
               <ICONS.Settings className="text-white w-8 h-8" />
             </div>
             <h1 className="text-3xl font-black text-white mb-2">AI Setup (Ollama)</h1>
             <p className="text-slate-400 mb-8 text-sm">Configure your Ollama instance. Use local URL or Cloud URL with API Key.</p>
             
             <div className="space-y-6 text-left">
               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-2">Ollama URL</label>
                 <input 
                   type="text" 
                   value={aiSettings.ollamaUrl} 
                   onChange={e => setAiSettings({...aiSettings, ollamaUrl: e.target.value})} 
                   className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white font-mono text-sm focus:border-blue-500 outline-none" 
                   placeholder="http://localhost:11434"
                 />
                 <p className="text-[10px] text-slate-600 mt-2 ml-2">Default: http://localhost:11434</p>
               </div>
               
               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-2">Model Name</label>
                 <input 
                   type="text" 
                   value={aiSettings.ollamaModel} 
                   onChange={e => setAiSettings({...aiSettings, ollamaModel: e.target.value})} 
                   className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white font-mono text-sm focus:border-blue-500 outline-none" 
                   placeholder="llama3"
                 />
                 <p className="text-[10px] text-slate-600 mt-2 ml-2">Examples: llama3, mistral, gemma</p>
               </div>

               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-2">API Key (Optional)</label>
                 <input 
                   type="password" 
                   value={aiSettings.ollamaApiKey || ''} 
                   onChange={e => setAiSettings({...aiSettings, ollamaApiKey: e.target.value})} 
                   className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white font-mono text-sm focus:border-blue-500 outline-none" 
                   placeholder="sk-..."
                 />
                 <p className="text-[10px] text-slate-600 mt-2 ml-2">Required for Cloud endpoints (Bearer Token)</p>
               </div>
               
               {aiErrorDetails && (
                  <div className={`p-4 rounded-xl border ${aiConnectionStatus === 'OFFLINE' ? 'bg-yellow-500/10 border-yellow-500/50' : 'bg-red-500/10 border-red-500/50'}`}>
                    <div className="flex items-center gap-2 mb-1">
                       <span className={`${aiConnectionStatus === 'OFFLINE' ? 'text-yellow-400' : 'text-red-400'} font-bold text-xs uppercase`}>
                         {aiConnectionStatus === 'OFFLINE' ? 'Offline Mode Active' : 'Connection Error'}
                       </span>
                    </div>
                    <p className={`text-xs ${aiConnectionStatus === 'OFFLINE' ? 'text-yellow-300' : 'text-red-300'} font-mono break-all`}>{aiErrorDetails}</p>
                    {aiConnectionStatus === 'OFFLINE' && <p className="text-[10px] text-slate-400 mt-2">The game will use simulated stats instead of AI.</p>}
                  </div>
               )}

               <div className="flex gap-4">
                  <button 
                    onClick={testOllamaConnection}
                    disabled={aiConnectionStatus === 'TESTING'}
                    className={`flex-1 py-4 font-bold rounded-xl transition-all border ${
                      aiConnectionStatus === 'SUCCESS' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' :
                      aiConnectionStatus === 'ERROR' ? 'bg-red-500/10 border-red-500 text-red-400' :
                      aiConnectionStatus === 'OFFLINE' ? 'bg-yellow-500/10 border-yellow-500 text-yellow-400' :
                      'bg-slate-700 border-transparent text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {aiConnectionStatus === 'TESTING' ? 'Testing...' : 
                     aiConnectionStatus === 'SUCCESS' ? 'Connected!' : 
                     aiConnectionStatus === 'OFFLINE' ? 'Offline Mode' : 
                     aiConnectionStatus === 'ERROR' ? 'Retry' : 'Test Connection'}
                  </button>
                  <button 
                    onClick={saveAiSettings}
                    className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl transition-all shadow-xl"
                  >
                    {aiConnectionStatus === 'OFFLINE' ? 'PLAY OFFLINE' : 'SAVE & CONTINUE'}
                  </button>
               </div>
             </div>
          </div>
        )}

        {viewState === 'CREATE_COACH' && (
          <div className="max-w-2xl mx-auto bg-slate-800 rounded-3xl border border-slate-700 p-10 shadow-3xl text-center">
            <h1 className="text-4xl font-black text-white mb-2">Build Your Legacy</h1>
            <p className="text-slate-400 mb-8">Win games, manage boosters, and survive the hotseat.</p>
            <div className="space-y-6 text-left">
              <input type="text" placeholder="COACH NAME" value={coach.name} onChange={e => setCoach({...coach, name: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-5 text-white font-black text-lg focus:border-emerald-500 outline-none" />
              <input type="text" placeholder="ALMA MATER" value={coach.almaMater} onChange={e => setCoach({...coach, almaMater: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-5 text-white font-bold focus:border-emerald-500 outline-none" />
              <button onClick={handleCreateCoach} className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xl rounded-2xl transition-all shadow-2xl">FIND A PROGRAM</button>
            </div>
            <button onClick={() => setViewState('SETUP_AI')} className="mt-6 text-xs text-slate-500 hover:text-white underline">Change AI Settings</button>
          </div>
        )}

        {viewState === 'JOB_OFFERS' && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center">
              <h1 className="text-5xl font-black text-white tracking-tighter mb-4">The Carousel</h1>
              <p className="text-slate-400">Programs looking for a new leader. Higher prestige teams expect immediate results.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {jobOffers.map(t => (
                <div key={t.id} className="bg-slate-800 rounded-3xl border border-slate-700 p-8 hover:border-emerald-500 transition-all group relative overflow-hidden">
                  <div className="flex justify-between items-start mb-1">
                    <h2 className="text-3xl font-black text-white group-hover:text-emerald-400 transition-colors">{t.name}</h2>
                    <div className={`px-2 py-1 rounded text-[10px] font-black uppercase ${getHotseatStatus(t.coachHotseat).color}`}>
                      {getHotseatStatus(t.coachHotseat).label}
                    </div>
                  </div>
                  <div className="text-sm font-bold text-slate-500 mb-6 uppercase tracking-widest">{t.conference}</div>
                  <div className="space-y-2 mb-8">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Program Prestige</span>
                      <span className="text-white font-black">{t.prestige}</span>
                    </div>
                    <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500" style={{ width: `${t.prestige}%` }}></div>
                    </div>
                  </div>
                  <button onClick={() => handleSelectJob(t.id)} className="w-full py-4 bg-slate-700 hover:bg-emerald-600 text-white font-black rounded-2xl transition-all shadow-lg">SIGN CONTRACT</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {viewState === 'FIRED' && (
          <div className="max-w-2xl mx-auto bg-slate-900 border-2 border-red-900/50 rounded-3xl p-16 text-center animate-bounce-in">
            <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-red-900/50">
               <ICONS.Briefcase className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-6xl font-black text-white tracking-tighter mb-4 uppercase">You're Fired</h1>
            <p className="text-slate-400 mb-10 leading-relaxed text-lg">
              The Board of Trustees has terminated your contract. 
              The fans have stormed the building and your office has been cleared out.
              Your final record at {userTeam?.name}: <span className="text-white font-bold">{userTeam?.stats.wins}-{userTeam?.stats.losses}</span>.
            </p>
            <button 
              onClick={() => {
                setViewState('JOB_OFFERS');
                const potentialTeams = league.filter(t => t.prestige < 70 || t.coachHotseat > 65);
                setJobOffers(potentialTeams.sort((a, b) => b.coachHotseat - a.coachHotseat).slice(0, 5));
              }}
              className="px-12 py-5 bg-white text-slate-950 font-black rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-2xl"
            >
              HIT THE CAROUSEL
            </button>
          </div>
        )}

        {viewState === 'DYNASTY_HUB' && userTeam && (
          <>
            {activeTab === TABS.DASHBOARD && renderDashboard()}
            {activeTab === TABS.STRATEGY && <StrategyPanel strategy={userTeam.strategy} onUpdate={s => setLeague(l => l.map(t => t.id === userTeamId ? {...t, strategy: s} : t))} />}
            {activeTab === TABS.RECRUITING && (
               <RecruitingBoard 
                  recruits={recruits} 
                  team={userTeam} 
                  hoursAvailable={recruitingHours} 
                  onAction={handleRecruitAction}
                  onToggleTarget={toggleTarget}
               />
            )}
            {activeTab === TABS.FINANCE && <FinancialPanel team={userTeam} onUpdate={()=>{}} />}
            {activeTab === TABS.ROSTER && (
              <div className="bg-slate-800 rounded-3xl border border-slate-700 overflow-hidden">
                <div className="p-8 border-b border-slate-700 flex justify-between items-center">
                  <h2 className="text-2xl font-black text-white">Depth Chart</h2>
                  <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">{userTeam?.roster.length} Active Players</span>
                </div>
                <div className="divide-y divide-slate-700/50">
                  {userTeam?.roster.sort((a,b) => b.rating - a.rating).map(p => (
                    <div key={p.id} className="p-6 flex justify-between items-center hover:bg-slate-700/20 transition-colors">
                      <div className="flex items-center gap-6">
                        <div className="text-xl font-black text-slate-700 w-8">{p.position}</div>
                        <div>
                          <div className="font-black text-white text-lg">{p.name}</div>
                          <div className="text-xs text-slate-500 font-bold uppercase tracking-widest">{p.year} • {p.hometown}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-center">
                          <div className="text-2xl font-black text-emerald-400">{p.rating}</div>
                          <div className="text-[10px] font-black text-slate-600 uppercase">OVR</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App;
