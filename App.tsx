
import React, { useState, useEffect } from 'react';
import { ICONS, INITIAL_LEAGUE, generateBalancedRoster, calculateStars, generateRandomPlayer } from './constants';
import { Team, GameResult, Recruit, Position, Matchup, SeasonStage, Coach, PlayerYear, Player, AISettings } from './types';
import { PlayerCard } from './components/PlayerCard';
import { StrategyPanel } from './components/StrategyPanel';
import { simulateGameWithAI, generateRecruits } from './services/geminiService';
import { generateSeasonSchedule, simulateMatch, getStandings, generatePlayoffs, getAPTop25, getCoachesTop25, getCFPTop25, generateConferenceChampionships } from './utils/seasonUtils';

const TABS = {
  DASHBOARD: 'Dashboard',
  RESULTS: 'Scoreboard',
  SCHEDULE: 'Schedule',
  RANKINGS: 'Rankings',
  ROSTER: 'Depth Chart',
  RECRUITING: 'Recruiting',
  STRATEGY: 'Strategy',
  STANDINGS: 'Standings',
  PROFILE: 'Coach Profile',
  SETTINGS: 'Settings'
};

// Filter Definitions
const OFFENSE_POSITIONS = [Position.QB, Position.RB, Position.WR, Position.OL];
const DEFENSE_POSITIONS = [Position.DL, Position.LB, Position.DB];

const WEEKLY_RECRUITING_POINTS_BASE = 100;

type ViewState = 'CREATE_COACH' | 'JOB_OFFERS' | 'DYNASTY_HUB';

// Helper: Shuffle array to ensure randomness in job offers and recruiting
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

// Helper: Calculate realistic interest based on team prestige vs recruit stars
const calculateRecruitInterest = (recruit: Recruit, teamPrestige: number): number => {
  let base = Math.floor(Math.random() * 10) + 1; // 1-10 random variance
  
  // Prestige Base: Higher prestige = higher baseline interest generally
  const prestigeBase = (teamPrestige / 100) * 30;
  
  // Alignment: Does the recruit "fit" this level of program?
  let alignmentMod = 0;
  const { stars } = recruit;

  if (stars === 5) {
      if (teamPrestige >= 90) alignmentMod = 40; 
      else if (teamPrestige >= 80) alignmentMod = 20; 
      else if (teamPrestige >= 60) alignmentMod = -20; 
      else alignmentMod = -60; 
  } 
  else if (stars === 4) {
      if (teamPrestige >= 80) alignmentMod = 25;
      else if (teamPrestige >= 60) alignmentMod = 10;
      else if (teamPrestige >= 40) alignmentMod = -10;
      else alignmentMod = -40;
  }
  else if (stars === 3) {
      if (teamPrestige >= 60) alignmentMod = 15;
      else if (teamPrestige >= 40) alignmentMod = 20; 
      else alignmentMod = 0;
  }
  else {
      if (teamPrestige < 50) alignmentMod = 35; 
      else alignmentMod = 10; 
  }

  // Transfer Portal Logic
  if (recruit.recruitType === 'TRANSFER') {
      if (teamPrestige > 75) alignmentMod += 10;
  }

  let total = base + prestigeBase + alignmentMod;
  
  // Clamp between 5 and 90 (leaving room for recruiting actions to boost to 100)
  return Math.max(5, Math.min(90, Math.floor(total)));
};

const App = () => {
  // App Mode State
  const [viewState, setViewState] = useState<ViewState>('CREATE_COACH');
  const [seasonStage, setSeasonStage] = useState<SeasonStage>(SeasonStage.PRE_SEASON);
  const [coach, setCoach] = useState<Coach>({
    name: '',
    almaMater: '',
    level: 1,
    prestige: 10, // Starting career prestige
    offense: 'Balanced',
    defense: '4-3',
    history: [],
    stats: {
      wins: 0,
      losses: 0,
      confChamps: 0,
      natChamps: 0
    }
  });

  // Data State
  const [league, setLeague] = useState<Team[]>(INITIAL_LEAGUE);
  const [userTeamId, setUserTeamId] = useState<string>('');
  const [jobOffers, setJobOffers] = useState<Team[]>([]);
  const [schedule, setSchedule] = useState<Matchup[]>([]);
  
  // AI Settings
  const [aiSettings, setAiSettings] = useState<AISettings>(() => {
    const saved = localStorage.getItem('cfb_ai_settings');
    return saved ? JSON.parse(saved) : {
      provider: 'gemini',
      ollamaUrl: 'http://localhost:11434',
      ollamaModel: 'llama3'
    };
  });

  useEffect(() => {
    localStorage.setItem('cfb_ai_settings', JSON.stringify(aiSettings));
  }, [aiSettings]);

  // UI State
  const [activeTab, setActiveTab] = useState(TABS.SCHEDULE); // Default to schedule initially so they can see preseason
  const [week, setWeek] = useState(0); // 0 = Preseason/Scheduling
  const [resultsWeek, setResultsWeek] = useState(1);
  const [simResult, setSimResult] = useState<GameResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [draggedPlayerId, setDraggedPlayerId] = useState<string | null>(null);
  const [portalWeek, setPortalWeek] = useState(1);
  const [editingWeek, setEditingWeek] = useState<number | null>(null);
  const [hasRefreshedOffers, setHasRefreshedOffers] = useState(false);

  // Recruiting
  const [recruits, setRecruits] = useState<Recruit[]>([]);
  const [scholarshipsAvailable, setScholarshipsAvailable] = useState(25);
  const [recruitingPoints, setRecruitingPoints] = useState(WEEKLY_RECRUITING_POINTS_BASE);
  const [recruitingFilter, setRecruitingFilter] = useState('All');
  const [recruitingView, setRecruitingView] = useState<'HS' | 'TRANSFER'>('HS');
  const [sortOrder, setSortOrder] = useState<'RANK' | 'INTEREST'>('RANK');

  // Computed
  const userTeam = league.find(t => t.id === userTeamId);
  const weeklySchedule = schedule.filter(m => m.week === week);
  const userMatchup = weeklySchedule.find(m => m.homeTeamId === userTeamId || m.awayTeamId === userTeamId);
  const currentOpponent = userMatchup 
    ? league.find(t => t.id === (userMatchup.homeTeamId === userTeamId ? userMatchup.awayTeamId : userMatchup.homeTeamId))
    : null;

  const filters = ['All', 'Offense', 'Defense', ...Object.values(Position)];

  // --- Helpers ---

  const createRecruitBatch = async (targetCount: number, type: 'HS' | 'TRANSFER') => {
    const positions = Object.values(Position);
    let newRecruits: Recruit[] = [];
    
    const distribution = {
        [Position.QB]: 0.1,
        [Position.RB]: 0.12,
        [Position.WR]: 0.15,
        [Position.OL]: 0.15,
        [Position.DL]: 0.15,
        [Position.LB]: 0.13,
        [Position.DB]: 0.15,
        [Position.K]: 0.05
    };

    for (const pos of positions) {
        let count = Math.max(pos === Position.K ? 2 : 3, Math.floor(targetCount * (distribution[pos] || 0.1)));
        if (['WR', 'DB', 'OL', 'DL'].includes(pos)) count += 2;

        for (let i = 0; i < count; i++) {
             const isTransfer = type === 'TRANSFER';
             const year = isTransfer ? ['SO', 'JR', 'SR'][Math.floor(Math.random() * 3)] : 'FR';
             const minR = isTransfer ? 68 : 55;
             const maxR = isTransfer ? 88 : 82;
             
             const basePlayer = generateRandomPlayer(`r-${type}-${Date.now()}-${pos}-${i}`, pos, minR, maxR);
             
             let stars = 1;
             if (basePlayer.rating >= 80) stars = 5;
             else if (basePlayer.rating >= 75) stars = 4;
             else if (basePlayer.rating >= 70) stars = 3;
             else if (basePlayer.rating >= 62) stars = 2;
             
             newRecruits.push({
                ...basePlayer,
                id: `r-${type}-${pos}-${i}-${Math.random().toString(36).substr(2, 9)}`,
                year: year as PlayerYear,
                interest: 0,
                offers: [],
                committedTo: null,
                stars: stars,
                scoutingReport: "Athletic prospect with upside.",
                isScouted: false,
                isOffered: false,
                isTargeted: false,
                recruitType: type
             });
        }
    }
    return newRecruits.sort(() => Math.random() - 0.5);
  };

  // --- Initialization ---

  useEffect(() => {
    const initRecruiting = async () => {
        const hsRecruits = await createRecruitBatch(60, 'HS');
        setRecruits(hsRecruits);
    };
    initRecruiting();
  }, []);

  // --- Handlers ---

  const calculateWeeklyPoints = (prestige: number) => {
    return Math.floor(100 + (prestige * 1.5));
  };

  const generateJobOffers = (currentCoach: Coach, currentLeague: Team[]) => {
    let minP = 40, maxP = 60;
    let coachPrestige = 10;

    switch(currentCoach.level) {
      case 1: minP = 45; maxP = 60; coachPrestige = 15; break;
      case 2: minP = 50; maxP = 75; coachPrestige = 30; break;
      case 3: minP = 65; maxP = 85; coachPrestige = 50; break;
      case 4: minP = 75; maxP = 90; coachPrestige = 70; break;
      case 5: minP = 85; maxP = 99; coachPrestige = 90; break;
    }

    const availableTeams = currentLeague.filter(t => t.prestige >= minP && t.prestige <= maxP);
    const shuffled = shuffleArray(availableTeams);
    const offers = shuffled.slice(0, 5);
    
    return { offers, coachPrestige };
  };

  const handleCreateCoach = () => {
    if (!coach.name || !coach.almaMater) {
       alert("Please enter your name and alma mater.");
       return;
    }
    
    const { offers, coachPrestige } = generateJobOffers(coach, league);
    
    setCoach(prev => ({ ...prev, prestige: coachPrestige }));
    setJobOffers(offers);
    setViewState('JOB_OFFERS');
  };

  const handleRefreshJobOffers = () => {
    if (hasRefreshedOffers) return;
    
    let offers: Team[] = [];
    if (seasonStage === SeasonStage.COACHING_CAROUSEL) {
      // Logic for end-of-season coaching carousel refresh
      // Filter teams excluding the user's current team
      const potentialOffers = league.filter(t => 
        t.id !== userTeamId && 
        t.prestige >= coach.prestige - 15 && 
        t.prestige <= coach.prestige + 10
      );
      offers = shuffleArray(potentialOffers).slice(0, 5);
    } else {
      // Logic for initial job creation refresh
      const result = generateJobOffers(coach, league);
      offers = result.offers;
    }
    
    setJobOffers(offers);
    setHasRefreshedOffers(true);
  };

  const handleSelectJob = (teamId: string) => {
    const team = league.find(t => t.id === teamId)!;
    
    const updatedLeague = league.map(t => {
       if (t.id === teamId && t.roster.length === 0) {
          return { 
            ...t, 
            roster: generateBalancedRoster(teamId, t.prestige),
            strategy: { ...t.strategy, offense: coach.offense as any, defense: coach.defense as any } 
          };
       }
       return t;
    });
    
    setLeague(updatedLeague);
    setUserTeamId(teamId);

    if (seasonStage === SeasonStage.PRE_SEASON || seasonStage === SeasonStage.OFF_SEASON) {
         setRecruits(prev => prev.map(r => ({
            ...r,
            interest: calculateRecruitInterest(r, team.prestige)
          })));
    }
    
    if (viewState === 'JOB_OFFERS' || seasonStage === SeasonStage.COACHING_CAROUSEL) {
        const newSchedule = generateSeasonSchedule(updatedLeague);
        setSchedule(newSchedule);
        setWeek(0); // Return to preseason for new job
        setResultsWeek(1);
        setSeasonStage(SeasonStage.PRE_SEASON);
        setRecruitingPoints(calculateWeeklyPoints(team.prestige));
        setViewState('DYNASTY_HUB');
        setActiveTab(TABS.SCHEDULE);
        
        setCoach(prev => ({
            ...prev, 
            history: [...prev.history, `Hired by ${team.name} (${new Date().getFullYear()})`]
         }));
    } else {
        startRetentionPhase(teamId);
    }
  };

  const handleScheduleSwap = (targetTeamId: string, weekToSwap: number) => {
      const newSchedule = [...schedule];
      const userMatchIdx = newSchedule.findIndex(m => m.week === weekToSwap && (m.homeTeamId === userTeamId || m.awayTeamId === userTeamId));
      const targetMatchIdx = newSchedule.findIndex(m => m.week === weekToSwap && (m.homeTeamId === targetTeamId || m.awayTeamId === targetTeamId));

      if (userMatchIdx > -1) newSchedule.splice(userMatchIdx, 1);
      if (targetMatchIdx > -1) newSchedule.splice(newSchedule.findIndex(m => m.week === weekToSwap && (m.homeTeamId === targetTeamId || m.awayTeamId === targetTeamId)), 1);

      newSchedule.push({
          id: `custom-w${weekToSwap}-${userTeamId}-${targetTeamId}`,
          week: weekToSwap,
          homeTeamId: userTeamId,
          awayTeamId: targetTeamId,
          played: false,
          isUserGame: true,
          isConferenceGame: false,
          isPlayoff: false
      });

      setSchedule(newSchedule);
      setEditingWeek(null);
  };

  const startRetentionPhase = (teamId: string) => {
      const team = league.find(t => t.id === teamId);
      if (!team) return;

      const updatedRoster = team.roster.map(p => {
          let status: Player['leavingStatus'] = null;
          if (p.year === PlayerYear.SR) {
              status = 'GRADUATING';
          } else if (p.rating > 92 && (p.year === PlayerYear.JR || p.year === PlayerYear.SO)) {
               if (Math.random() < 0.7) status = 'NFL';
          } else {
              let transferChance = 0.05;
              if (p.rating < 75 && team.prestige > 80) transferChance = 0.15;
              if (Math.random() < transferChance) status = 'TRANSFER';
          }
          return { ...p, leavingStatus: status };
      });

      setLeague(prev => prev.map(t => t.id === teamId ? { ...t, roster: updatedRoster } : t));
      setSeasonStage(SeasonStage.RETENTION);
      setViewState('DYNASTY_HUB');
      setActiveTab(TABS.DASHBOARD);
  };

  const startTransferPortalPhase = async () => {
      const transferRecruits = await createRecruitBatch(40, 'TRANSFER');
      const currentUserTeam = league.find(t => t.id === userTeamId);
      const prestige = currentUserTeam ? currentUserTeam.prestige : 50;
      
      const recruitsWithInterest = transferRecruits.map(r => ({
          ...r,
          interest: calculateRecruitInterest(r, prestige)
      }));

      setRecruits(recruitsWithInterest);
      setRecruitingView('TRANSFER');
      setSeasonStage(SeasonStage.TRANSFER_PORTAL);
      setPortalWeek(1);
      setScholarshipsAvailable(prev => Math.min(25, prev + 5));
      setRecruitingPoints(calculateWeeklyPoints(prestige) + 200);
      setActiveTab(TABS.RECRUITING);
  };

  const startNewSeason = async () => {
      const updatedLeague = league.map(t => {
          let newRoster = [...t.roster];
          if (t.id === userTeamId) {
             newRoster = newRoster.filter(p => !p.leavingStatus);
          } else {
             newRoster = newRoster.filter(p => {
                 if (p.year === PlayerYear.SR) return false;
                 if (p.rating > 94 && Math.random() < 0.8) return false;
                 if (Math.random() < 0.1) return false;
                 return true;
             });
          }

          newRoster = newRoster.map(p => {
              let nextYear = p.year;
              if (p.year === PlayerYear.FR) nextYear = PlayerYear.SO;
              else if (p.year === PlayerYear.SO) nextYear = PlayerYear.JR;
              else if (p.year === PlayerYear.JR) nextYear = PlayerYear.SR;
              const improvement = Math.floor(Math.random() * 4); 
              return { ...p, year: nextYear, rating: Math.min(99, p.rating + improvement) };
          });

          const signees = recruits.filter(r => r.committedTo === t.id);
          signees.forEach((s, idx) => {
              newRoster.push({
                  id: `${t.id}-s-${Date.now()}-${idx}`,
                  name: s.name,
                  position: s.position,
                  year: s.recruitType === 'TRANSFER' ? s.year : PlayerYear.FR,
                  rating: s.rating,
                  hometown: s.hometown,
                  stats: { games: 0, yards: 0, touchdowns: 0 },
                  potential: s.potential
              });
          });
          
          if (t.id !== userTeamId && newRoster.length < 45) {
               const needed = 45 - newRoster.length;
               for(let i=0; i<needed; i++) {
                   newRoster.push(generateRandomPlayer(`${t.id}-walkon-${i}`, undefined, 60, 75));
               }
          }

          return {
              ...t,
              roster: newRoster,
              wins: 0, losses: 0,
              stats: { wins: 0, losses: 0, confWins: 0, confLosses: 0, rank: 0, pointsFor: 0, pointsAgainst: 0 }
          };
      });

      setLeague(updatedLeague);
      
      const newSchedule = generateSeasonSchedule(updatedLeague);
      setSchedule(newSchedule);
      
      const hsRecruits = await createRecruitBatch(60, 'HS');
      const currentUserTeam = updatedLeague.find(t => t.id === userTeamId);
      const prestige = currentUserTeam ? currentUserTeam.prestige : 50;
      
      setRecruits(hsRecruits.map(r => ({...r, interest: calculateRecruitInterest(r, prestige)})));
      
      setWeek(0);
      setResultsWeek(1);
      setSeasonStage(SeasonStage.PRE_SEASON);
      setActiveTab(TABS.SCHEDULE);
      setRecruitingView('HS');
      setRecruitingPoints(calculateWeeklyPoints(prestige));
      setScholarshipsAvailable(25);
  };

  const handleSimulateGame = async () => {
    if (loading || !userTeam || !currentOpponent) return;
    setLoading(true);

    const result = await simulateGameWithAI(userTeam, currentOpponent, aiSettings);
    
    if (result) {
      result.week = week;
      setSimResult(result);
    }
    setLoading(false);
  };

  const generateEndOfSeasonOffers = () => {
    if (!userTeam) return;

    // Coach Progression based on Season
    const actualWins = userTeam.stats.wins;
    const expectedWins = Math.max(1, Math.round(userTeam.prestige / 10));
    const winDiff = actualWins - expectedWins;

    // Calculate coach prestige gains
    // Win bonus: +2.5 per win over expected, -1.5 per win under expected
    let prestigeBonus = winDiff > 0 ? winDiff * 2.5 : winDiff * 1.5;
    
    // Conference/Championship bonuses
    const userMatches = schedule.filter(m => (m.homeTeamId === userTeamId || m.awayTeamId === userTeamId) && m.played);
    const wonConfChamp = userMatches.some(m => m.week === 15 && m.winnerId === userTeamId);
    if (wonConfChamp) prestigeBonus += 10;
    
    const playoffWins = userMatches.filter(m => m.isPlayoff && m.week >= 16 && m.winnerId === userTeamId).length;
    const wonNatChamp = userMatches.some(m => m.isPlayoff && m.week === 18 && m.winnerId === userTeamId); // Assuming week 18 is final
    prestigeBonus += playoffWins * 8;
    if (wonNatChamp) prestigeBonus += 15;

    const newPrestige = Math.max(5, Math.min(99, coach.prestige + prestigeBonus));
    const newLevel = Math.min(5, Math.floor(newPrestige / 20) + 1);

    const updatedCoach = { 
        ...coach, 
        prestige: newPrestige, 
        level: newLevel,
        history: [...coach.history, `2025: ${userTeam.name} (${actualWins}-${userTeam.stats.losses})`],
        stats: {
          ...coach.stats,
          wins: coach.stats.wins + userTeam.stats.wins,
          losses: coach.stats.losses + userTeam.stats.losses,
          confChamps: coach.stats.confChamps + (wonConfChamp ? 1 : 0),
          natChamps: coach.stats.natChamps + (wonNatChamp ? 1 : 0)
        }
    };

    setCoach(updatedCoach);

    // End of season offers
    const potentialOffers = league.filter(t => 
       t.id !== userTeamId && 
       t.prestige >= newPrestige - 15 && 
       t.prestige <= newPrestige + 10
    );

    const offers = shuffleArray(potentialOffers).slice(0, 5);
    setJobOffers(offers);
    setHasRefreshedOffers(false);
    setSeasonStage(SeasonStage.COACHING_CAROUSEL);
  };

  const advanceWeek = () => {
    if (week === 0) {
        setWeek(1);
        setResultsWeek(1);
        setSeasonStage(SeasonStage.REGULAR_SEASON);
        setActiveTab(TABS.DASHBOARD);
        return;
    }

    if (seasonStage === SeasonStage.COACHING_CAROUSEL) {
         startRetentionPhase(userTeamId);
         return;
    }
    
    if (seasonStage === SeasonStage.RETENTION) {
        startTransferPortalPhase();
        return;
    }

    if (seasonStage === SeasonStage.TRANSFER_PORTAL) {
        if (portalWeek < 2) {
             setPortalWeek(p => p + 1);
             if (userTeam) setRecruitingPoints(calculateWeeklyPoints(userTeam.prestige) + 100);
        } else {
             startNewSeason();
        }
        return;
    }

    const updatedLeague = [...league];
    const updatedSchedule = schedule.map(match => {
      if (match.week !== week) return match;
      if (match.played) return match;

      let homeScore = 0, awayScore = 0, winnerId = '';

      if (match.id === userMatchup?.id && simResult) {
        const userScore = simResult.stats?.homeScore || 0;
        const oppScore = simResult.stats?.awayScore || 0;
        if (match.homeTeamId === userTeamId) {
           homeScore = userScore;
           awayScore = oppScore;
        } else {
           homeScore = oppScore;
           awayScore = userScore;
        }
        winnerId = homeScore > awayScore ? match.homeTeamId : match.awayTeamId;
      } else {
        const home = updatedLeague.find(t => t.id === match.homeTeamId)!;
        const away = updatedLeague.find(t => t.id === match.awayTeamId)!;
        const result = simulateMatch(home, away);
        homeScore = result.homeScore;
        awayScore = result.awayScore;
        winnerId = homeScore > awayScore ? match.homeTeamId : match.awayTeamId;
      }

      const homeTeam = updatedLeague.find(t => t.id === match.homeTeamId)!;
      const awayTeam = updatedLeague.find(t => t.id === match.awayTeamId)!;
      homeTeam.stats.pointsFor += homeScore;
      homeTeam.stats.pointsAgainst += awayScore;
      awayTeam.stats.pointsFor += awayScore;
      awayTeam.stats.pointsAgainst += homeScore;
      if (winnerId === match.homeTeamId) {
        homeTeam.stats.wins++;
        awayTeam.stats.losses++;
        if (match.isConferenceGame) { homeTeam.stats.confWins++; awayTeam.stats.confLosses++; }
      } else {
        awayTeam.stats.wins++;
        homeTeam.stats.losses++;
        if (match.isConferenceGame) { awayTeam.stats.confWins++; homeTeam.stats.confLosses++; }
      }
      return { ...match, played: true, homeScore, awayScore, winnerId };
    });

    const rankedTeams = week >= 8 ? getCFPTop25(updatedLeague) : getAPTop25(updatedLeague);
    updatedLeague.forEach(t => {
      const r = rankedTeams.findIndex(rt => rt.id === t.id);
      t.stats.rank = r >= 0 ? r + 1 : 0;
    });

    setLeague(updatedLeague);
    setSchedule(updatedSchedule);
    setSimResult(null);
    setResultsWeek(week);
    
    setRecruits(prevRecruits => prevRecruits.map(r => {
        if (r.committedTo) return r;
        const cpuCommitChance = (week * 0.01) + (r.isTargeted ? 0 : 0.05); 
        if (Math.random() < cpuCommitChance) {
             const randomTeam = league.filter(t => t.id !== userTeamId)[Math.floor(Math.random() * (league.length - 1))];
             if (randomTeam) return { ...r, committedTo: randomTeam.id };
        }
        return r;
    }));
    
    const currentUserTeam = updatedLeague.find(t => t.id === userTeamId);
    if (currentUserTeam) {
        const basePoints = calculateWeeklyPoints(currentUserTeam.prestige);
        const rollover = Math.min(recruitingPoints, 20);
        setRecruitingPoints(basePoints + rollover);
    }
    
    if (week === 14) {
       setSeasonStage(SeasonStage.CONFERENCE_CHAMPIONSHIP);
       const champs = generateConferenceChampionships(updatedLeague, updatedSchedule);
       setSchedule([...updatedSchedule, ...champs]);
       setWeek(15);
    } else if (week === 15 && seasonStage === SeasonStage.CONFERENCE_CHAMPIONSHIP) {
       setSeasonStage(SeasonStage.POST_SEASON);
       const playoffs = generatePlayoffs(updatedLeague);
       setSchedule([...updatedSchedule, ...playoffs]);
       setWeek(16);
    } else if (week >= 16 && seasonStage === SeasonStage.POST_SEASON) {
       // Check if post season games are done
       const nextPlayoffRound = schedule.filter(m => m.week === week + 1);
       if (nextPlayoffRound.length === 0) {
           generateEndOfSeasonOffers();
       } else {
           setWeek(w => w + 1);
       }
    } else {
       setWeek(w => w + 1);
    }
  };

  const handlePersuade = (playerId: string) => {
      if (recruitingPoints < 50) {
          alert("Not enough points to persuade (Need 50).");
          return;
      }
      setRecruitingPoints(p => p - 50);
      const team = league.find(t => t.id === userTeamId);
      const successChance = (team?.prestige || 50) / 100;
      if (Math.random() < successChance) {
          setLeague(prev => prev.map(t => {
              if (t.id !== userTeamId) return t;
              return { ...t, roster: t.roster.map(p => p.id === playerId ? { ...p, leavingStatus: null } : p) }
          }));
          alert("Success! Player convinced to stay.");
      } else {
          alert("Persuasion failed. Player is still leaving.");
      }
  };

  const getFilteredItems = (items: any[], filter: string) => {
    if (filter === 'All') return items;
    if (filter === 'Offense') return items.filter((i: any) => OFFENSE_POSITIONS.includes(i.position));
    if (filter === 'Defense') return items.filter((i: any) => DEFENSE_POSITIONS.includes(i.position));
    return items.filter((i: any) => i.position === filter);
  };

  const handleRecruitAction = (action: 'SCOUT' | 'CALL' | 'VISIT' | 'OFFER' | 'RESCIND', recruitId: string) => {
    const COSTS = { SCOUT: 10, CALL: 5, VISIT: 25, OFFER: 0, RESCIND: 0 };
    const cost = COSTS[action];
    
    if (recruitingPoints < cost) return;
    const recruit = recruits.find(r => r.id === recruitId);
    if (recruit?.committedTo) return;

    if (action === 'OFFER' && scholarshipsAvailable <= 0) {
        alert("No scholarships available!");
        return;
    }

    if (cost > 0) setRecruitingPoints(p => p - cost);
    
    setRecruits(prev => prev.map(r => {
      if (r.id !== recruitId) return r;
      let updates: Partial<Recruit> = { isTargeted: true }; 
      let boost = 0;
      switch(action) {
        case 'SCOUT': updates.isScouted = true; boost = 2; break;
        case 'CALL': boost = Math.floor(Math.random() * 4) + 2; break;
        case 'VISIT': boost = Math.floor(Math.random() * 10) + 10; break;
        case 'OFFER': if(!r.isOffered) { updates.isOffered = true; boost = 15; } break;
        case 'RESCIND': if (r.isOffered) { updates.isOffered = false; setScholarshipsAvailable(prev => prev + 1); boost = -25; } break;
      }
      const newInterest = Math.max(0, Math.min(100, r.interest + boost));
      const isNowOffered = (r.isOffered || action === 'OFFER') && action !== 'RESCIND';
      if (isNowOffered && newInterest >= 100 && !r.committedTo) {
         if (scholarshipsAvailable > 0) {
            updates.committedTo = userTeamId;
            setScholarshipsAvailable(prev => prev - 1);
            // Career reward for signing high-level players
            setCoach(c => ({ ...c, prestige: Math.min(99, c.prestige + (r.stars * 0.5)) }));
         }
      }
      return { ...r, ...updates, interest: newInterest };
    }));
  };

  const handleDragStart = (e: React.DragEvent, playerId: string) => {
    setDraggedPlayerId(playerId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetPlayerId: string) => {
    e.preventDefault();
    if (!userTeam || !draggedPlayerId || draggedPlayerId === targetPlayerId) { setDraggedPlayerId(null); return; }
    const newRoster = [...userTeam.roster];
    const draggedIndex = newRoster.findIndex(p => p.id === draggedPlayerId);
    const targetIndex = newRoster.findIndex(p => p.id === targetPlayerId);
    if (draggedIndex === -1 || targetIndex === -1) { setDraggedPlayerId(null); return; }
    if (newRoster[draggedIndex].position !== newRoster[targetIndex].position) { setDraggedPlayerId(null); return; }
    const [draggedItem] = newRoster.splice(draggedIndex, 1);
    newRoster.splice(targetIndex, 0, draggedItem);
    setLeague(prev => prev.map(t => t.id === userTeamId ? { ...t, roster: newRoster } : t));
    setDraggedPlayerId(null);
  };

  const renderSettings = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-xl">
        <h2 className="text-3xl font-black text-white mb-6 flex items-center gap-3">
          <ICONS.Settings className="text-emerald-500 w-8 h-8" /> AI Integration Settings
        </h2>
        
        <div className="space-y-8">
          <div>
            <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">AI Provider</label>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setAiSettings({...aiSettings, provider: 'gemini'})}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${aiSettings.provider === 'gemini' ? 'bg-emerald-600/20 border-emerald-500' : 'bg-slate-900 border-slate-700'}`}
              >
                <div className="text-lg font-bold text-white">Google Gemini</div>
                <div className="text-xs text-slate-500">Cloud-based, high reasoning.</div>
              </button>
              <button 
                onClick={() => setAiSettings({...aiSettings, provider: 'ollama'})}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${aiSettings.provider === 'ollama' ? 'bg-orange-600/20 border-orange-500' : 'bg-slate-900 border-slate-700'}`}
              >
                <div className="text-lg font-bold text-white">Ollama (Local)</div>
                <div className="text-xs text-slate-500">Run LLMs on your own machine.</div>
              </button>
            </div>
          </div>

          {aiSettings.provider === 'ollama' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Ollama API URL</label>
                  <input 
                    type="text" 
                    value={aiSettings.ollamaUrl}
                    onChange={(e) => setAiSettings({...aiSettings, ollamaUrl: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white focus:border-orange-500 outline-none"
                    placeholder="http://localhost:11434"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Model Name</label>
                  <input 
                    type="text" 
                    value={aiSettings.ollamaModel}
                    onChange={(e) => setAiSettings({...aiSettings, ollamaModel: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white focus:border-orange-500 outline-none"
                    placeholder="llama3"
                  />
                </div>
              </div>
              <div className="p-4 bg-orange-900/10 border border-orange-500/20 rounded-lg">
                <p className="text-xs text-orange-300 leading-relaxed">
                  <strong>Note:</strong> Ensure Ollama is running locally and CORS is enabled (usually default for localhost). 
                  Models like <code>llama3</code> or <code>mistral</code> are recommended for JSON output.
                </p>
              </div>
            </div>
          )}

          {aiSettings.provider === 'gemini' && (
            <div className="p-4 bg-emerald-900/10 border border-emerald-500/20 rounded-lg">
              <p className="text-xs text-emerald-300 leading-relaxed">
                Gemini is using the pre-configured API key provided by the environment.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (viewState === 'CREATE_COACH') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
         <div className="max-w-2xl w-full bg-slate-800 rounded-xl border border-slate-700 p-8 shadow-2xl">
            <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-2">
              <ICONS.Users className="text-emerald-500"/> Coach Creation
            </h1>
            <p className="text-slate-400 mb-6">Build your persona. Your background determines your starting offers.</p>

            <div className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">Coach Name</label>
                    <input 
                      type="text" 
                      value={coach.name} 
                      onChange={e => setCoach({...coach, name: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white focus:border-emerald-500 outline-none"
                      placeholder="e.g. Nick Saban"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">Alma Mater</label>
                    <input 
                      type="text" 
                      value={coach.almaMater} 
                      onChange={e => setCoach({...coach, almaMater: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white focus:border-emerald-500 outline-none"
                      placeholder="e.g. Kent State"
                    />
                  </div>
               </div>

               <div>
                 <label className="block text-sm font-bold text-slate-300 mb-2">Starting Background</label>
                 <div className="grid grid-cols-1 gap-2">
                    {[
                      { l: 1, title: 'High School Coach', desc: 'Starting from scratch. (Teams: 45-60 OVR)' },
                      { l: 2, title: 'Position Coach', desc: 'Rising assistant. (Teams: 50-75 OVR)' },
                      { l: 3, title: 'G5 Head Coach', desc: 'Mid-major success. (Teams: 65-85 OVR)' },
                      { l: 4, title: 'P4 Head Coach', desc: 'Power conference veteran. (Teams: 75-90 OVR)' },
                      { l: 5, title: 'College Legend', desc: 'Elite champion status. (Teams: 85-99 OVR)' }
                    ].map(opt => (
                       <button
                         key={opt.l}
                         onClick={() => setCoach({...coach, level: opt.l})}
                         className={`p-3 rounded text-left border transition-all ${
                           coach.level === opt.l 
                           ? 'bg-emerald-600/20 border-emerald-500' 
                           : 'bg-slate-900 border-slate-700 hover:border-slate-500'
                         }`}
                       >
                          <div className={`font-bold ${coach.level === opt.l ? 'text-emerald-400' : 'text-white'}`}>{opt.title}</div>
                          <div className="text-xs text-slate-500">{opt.desc}</div>
                       </button>
                    ))}
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">Offensive Style</label>
                    <select value={coach.offense} onChange={e => setCoach({...coach, offense: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white">
                      {['Balanced', 'Spread', 'Pro-Style', 'Option', 'Air Raid', 'Run Heavy'].map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">Defensive Scheme</label>
                    <select value={coach.defense} onChange={e => setCoach({...coach, defense: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white">
                      {['Balanced', '4-3', '3-4', 'Blitz Heavy', '4-2-5', '3-3-5'].map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
               </div>

               <button onClick={handleCreateCoach} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-lg shadow-emerald-900/50 transition-all mt-4">
                 Generate Offers
               </button>
            </div>
         </div>
      </div>
    )
  }

  if (viewState === 'JOB_OFFERS') {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-200 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
            <div>
              <h1 className="text-4xl font-black text-white mb-2">Contract Offers</h1>
              <p className="text-slate-400 max-w-lg">Choose where to start your dynasty. These programs have reached out based on your background.</p>
            </div>
            <div className="flex items-center gap-6">
                {!hasRefreshedOffers && (
                    <button 
                        onClick={handleRefreshJobOffers}
                        className="px-6 py-3 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 border border-indigo-500/50 rounded-lg font-bold transition-all flex items-center gap-2"
                    >
                        <ICONS.Lightning className="w-4 h-4"/> One-Time Refresh
                    </button>
                )}
                <div className="text-right">
                    <div className="text-sm font-bold text-slate-500 uppercase">Your Prestige</div>
                    <div className="text-3xl font-black text-emerald-400">{coach.prestige} OVR</div>
                </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {jobOffers.map(team => (
               <div key={team.id} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden group hover:border-emerald-500 transition-all relative">
                 <div className={`h-2 ${team.color} w-full`}></div>
                 <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                       <div>
                          <h2 className="text-2xl font-black text-white leading-tight">{team.name}</h2>
                          <div className="text-sm text-slate-400">{team.conference}</div>
                       </div>
                       <div className="flex">
                         {Array.from({length: calculateStars(team.prestige)}).map((_, i) => (
                            <svg key={i} className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                         ))}
                       </div>
                    </div>
                    <div className="space-y-2 mb-6 bg-slate-900/40 p-3 rounded-lg">
                       <div className="flex justify-between text-sm">
                         <span className="text-slate-500 font-medium">Program Prestige</span>
                         <span className="font-bold text-white">{team.prestige}</span>
                       </div>
                    </div>
                    <button onClick={() => handleSelectJob(team.id)} className="w-full py-3 bg-slate-700 hover:bg-emerald-600 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg">
                       <ICONS.Briefcase className="w-4 h-4"/> Accept Contract
                    </button>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    );
  }

  if (seasonStage === SeasonStage.COACHING_CAROUSEL) {
     return (
        <div className="min-h-screen bg-slate-900 text-slate-200 p-8 flex flex-col items-center">
           <div className="max-w-4xl w-full">
              <h1 className="text-4xl font-black text-white mb-6 text-center">Coaching Carousel</h1>
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-8 flex flex-col md:flex-row gap-8">
                 <div className="flex-1">
                    <h2 className="text-xl font-bold text-white mb-2">Career Update</h2>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="text-4xl font-black text-emerald-400">Level {coach.level}</div>
                        <div className="bg-slate-700 h-2 flex-1 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full" style={{ width: `${coach.prestige % 20 * 5}%` }}></div>
                        </div>
                    </div>
                    <p className="text-slate-400 mb-4">Your current career prestige is <span className="text-white font-bold">{coach.prestige}</span>. You led {userTeam?.name} to {userTeam?.stats.wins} wins this season.</p>
                    <div className="flex gap-4">
                      <button onClick={() => handleSelectJob(userTeamId)} className="flex-1 px-6 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-lg">
                        Stay at {userTeam?.name}
                      </button>
                      {!hasRefreshedOffers && (
                          <button onClick={handleRefreshJobOffers} className="px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow-lg flex items-center gap-2">
                             <ICONS.Lightning className="w-5 h-5"/> Refresh Offers
                          </button>
                      )}
                    </div>
                 </div>
                 <div className="w-full md:w-64 bg-slate-900/50 p-4 rounded-lg">
                    <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Career History</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                        {coach.history.slice().reverse().map((h, i) => (
                            <div key={i} className="text-xs text-slate-400 border-l-2 border-slate-700 pl-2 py-1">{h}</div>
                        ))}
                    </div>
                 </div>
              </div>

              <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-white">Interested Programs</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {jobOffers.map(team => (
                   <div key={team.id} className="bg-slate-800 rounded-xl border border-slate-700 p-6 hover:border-emerald-500 transition-colors cursor-pointer group" onClick={() => handleSelectJob(team.id)}>
                      <div className="flex justify-between mb-2">
                         <h3 className="font-bold text-lg text-white group-hover:text-emerald-400">{team.name}</h3>
                         <span className="text-yellow-400 font-bold">{calculateStars(team.prestige)} ★</span>
                      </div>
                      <p className="text-sm text-slate-400 mb-4">{team.conference}</p>
                      <div className="text-emerald-500 text-xs font-bold uppercase flex items-center gap-1">Sign &rarr;</div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
     )
  }

  if (!userTeam) return null;

  const renderCoachProfile = () => {
    const winPct = coach.stats.wins + coach.stats.losses > 0 
      ? ((coach.stats.wins / (coach.stats.wins + coach.stats.losses)) * 100).toFixed(1)
      : '0.0';

    return (
      <div className="space-y-8 animate-fade-in">
        <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <ICONS.Users className="w-64 h-64" />
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
            <div className="w-24 h-24 bg-emerald-600 rounded-2xl flex items-center justify-center text-4xl font-black text-white shadow-lg">
              {coach.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-black text-white mb-1">{coach.name}</h1>
              <p className="text-slate-400 text-lg flex items-center gap-2">
                Alma Mater: <span className="text-slate-200 font-semibold">{coach.almaMater}</span>
              </p>
              <div className="mt-4 flex flex-wrap gap-4">
                <span className="px-3 py-1 bg-slate-700 rounded-full text-xs font-bold text-emerald-400 uppercase tracking-wider">Level {coach.level} Specialist</span>
                <span className="px-3 py-1 bg-slate-700 rounded-full text-xs font-bold text-blue-400 uppercase tracking-wider">{coach.offense} Expert</span>
                <span className="px-3 py-1 bg-slate-700 rounded-full text-xs font-bold text-red-400 uppercase tracking-wider">{coach.defense} Guru</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-slate-500 uppercase mb-1">Career Prestige</div>
              <div className="text-5xl font-black text-emerald-500">{coach.prestige}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 text-center">
            <div className="text-3xl font-black text-white">{coach.stats.wins} - {coach.stats.losses}</div>
            <div className="text-xs font-bold text-slate-500 uppercase mt-1">Career Record</div>
          </div>
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 text-center">
            <div className="text-3xl font-black text-white">{winPct}%</div>
            <div className="text-xs font-bold text-slate-500 uppercase mt-1">Win Percentage</div>
          </div>
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 text-center">
            <div className="text-3xl font-black text-emerald-400">{coach.stats.confChamps}</div>
            <div className="text-xs font-bold text-slate-500 uppercase mt-1">Conf Championships</div>
          </div>
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 text-center">
            <div className="text-3xl font-black text-yellow-500">{coach.stats.natChamps}</div>
            <div className="text-xs font-bold text-slate-500 uppercase mt-1">National Titles</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <ICONS.Calendar className="text-emerald-500" /> Career Timeline
            </h2>
            <div className="space-y-4">
              {coach.history.length === 0 ? (
                <div className="p-8 bg-slate-800/50 rounded-xl border border-dashed border-slate-700 text-center text-slate-500">
                  Your journey has just begun. Complete seasons to build your history.
                </div>
              ) : (
                coach.history.slice().reverse().map((entry, idx) => (
                  <div key={idx} className="relative pl-8 pb-8 border-l-2 border-slate-700 last:border-0 last:pb-0">
                    <div className="absolute left-[-9px] top-0 w-4 h-4 bg-emerald-500 rounded-full border-4 border-slate-900 shadow-sm"></div>
                    <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-sm">
                      <div className="text-white font-bold text-lg">{entry}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <ICONS.Clipboard className="text-emerald-500" /> Coaching Style
            </h2>
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <div className="p-6 space-y-6">
                <div>
                  <div className="text-sm font-bold text-slate-400 mb-2 uppercase tracking-widest">Base Offense</div>
                  <div className="text-xl font-bold text-white bg-slate-900 p-3 rounded-lg border border-slate-700">{coach.offense}</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-400 mb-2 uppercase tracking-widest">Base Defense</div>
                  <div className="text-xl font-bold text-white bg-slate-900 p-3 rounded-lg border border-slate-700">{coach.defense}</div>
                </div>
                <div className="pt-4 border-t border-slate-700">
                  <div className="text-xs text-slate-500 leading-relaxed italic">
                    "A coach's style determines their program's identity. Your choices here influence simulation outcomes and player development over time."
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderRetention = () => {
      const leavingPlayers = userTeam.roster.filter(p => p.leavingStatus);
      const stayPlayers = userTeam.roster.filter(p => !p.leavingStatus);
      return (
        <div className="space-y-6 animate-fade-in">
           <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6 flex justify-between items-center">
               <div>
                   <h2 className="text-2xl font-black text-white">Offseason: Player Retention</h2>
                   <p className="text-slate-400">Review players leaving the program. You can try to persuade transfers to stay.</p>
               </div>
               <div className="text-right">
                    <div className="text-3xl font-black text-emerald-400">{recruitingPoints} <span className="text-sm font-normal text-slate-400">PTS</span></div>
                    <div className="text-xs text-slate-500">Retention Budget</div>
               </div>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-4">
                   <h3 className="text-xl font-bold text-white border-b border-slate-700 pb-2">Departing Players</h3>
                   {leavingPlayers.length === 0 ? <div className="text-slate-500 italic">No players leaving this season.</div> : leavingPlayers.map(p => (
                           <div key={p.id} className="bg-slate-800 border border-slate-700 p-4 rounded-lg flex justify-between items-center">
                               <div>
                                   <div className="font-bold text-white">{p.name} <span className="text-slate-400 text-sm">({p.position})</span></div>
                                   <div className="text-xs text-slate-500">{p.year} • OVR: {p.rating}</div>
                                   <div className={`text-xs font-bold mt-1 ${p.leavingStatus === 'GRADUATING' ? 'text-blue-400' : p.leavingStatus === 'NFL' ? 'text-green-400' : 'text-orange-400'}`}>{p.leavingStatus}</div>
                               </div>
                               <div>{p.leavingStatus === 'TRANSFER' && <button onClick={() => handlePersuade(p.id)} className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded">Persuade (50)</button>}</div>
                           </div>
                       ))
                   }
               </div>
               <div className="space-y-4">
                   <h3 className="text-xl font-bold text-white border-b border-slate-700 pb-2">Returning Roster</h3>
                   <div className="h-96 overflow-y-auto pr-2 space-y-2">
                       {stayPlayers.map(p => (
                           <div key={p.id} className="bg-slate-800/50 border border-slate-700/50 p-2 rounded flex justify-between items-center text-sm">
                               <span className="text-slate-300">{p.name} ({p.position})</span>
                               <span className="font-bold text-emerald-500">{p.rating}</span>
                           </div>
                       ))}
                   </div>
               </div>
           </div>
           <div className="flex justify-end mt-6"><button onClick={advanceWeek} className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-lg">Advance Phase &rarr;</button></div>
        </div>
      )
  };

  const renderDashboard = () => {
    const tickerWeek = week > 1 ? week - 1 : 0;
    const tickerGames = schedule.filter(m => {
        if (m.week !== tickerWeek || !m.played) return false;
        const h = league.find(t => t.id === m.homeTeamId);
        const a = league.find(t => t.id === m.awayTeamId);
        return h?.conference === userTeam.conference || a?.conference === userTeam.conference;
    });
    return (
    <div className="space-y-6 animate-fade-in">
      {seasonStage === SeasonStage.RETENTION ? renderRetention() : (
      <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex items-center space-x-4">
          <div className={`p-3 rounded-lg text-white shadow-lg ${userTeam.color}`}><div className="font-bold text-xl">{userTeam.abbreviation}</div></div>
          <div><div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Record</div><div className="text-2xl font-black text-white">{userTeam.stats.wins} - {userTeam.stats.losses}</div></div>
        </div>
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex items-center space-x-4">
          <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400"><ICONS.Calendar /></div>
          <div><div className="text-slate-400 text-xs font-bold uppercase tracking-wider">{seasonStage === SeasonStage.TRANSFER_PORTAL ? 'Portal Wk' : 'Week'}</div><div className="text-2xl font-black text-white">{seasonStage === SeasonStage.TRANSFER_PORTAL ? `${portalWeek}/2` : week}</div></div>
        </div>
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex items-center space-x-4">
           <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400"><ICONS.Clipboard /></div>
           <div><div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Prestige</div><div className="text-2xl font-black text-white flex items-center gap-2">{userTeam.prestige} <span className="text-sm font-normal text-yellow-500 bg-yellow-500/10 px-2 rounded flex items-center gap-1">{calculateStars(userTeam.prestige)} <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></span></div></div>
        </div>
         <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex items-center space-x-4">
           <div className="p-3 bg-yellow-500/10 rounded-lg text-yellow-400"><ICONS.Trophy /></div>
           <div><div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Rank</div><div className="text-2xl font-black text-white">{userTeam.stats.rank > 0 ? `#${userTeam.stats.rank}` : 'NR'}</div></div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 overflow-hidden relative">
           <div className="p-6 border-b border-slate-700/50 flex justify-between items-center"><h2 className="text-lg font-bold text-white flex items-center gap-2"><ICONS.Football className="w-5 h-5 text-emerald-400"/> {seasonStage}</h2>{simResult && <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">Final</span>}</div>
           <div className="p-8">
             {seasonStage === SeasonStage.TRANSFER_PORTAL ? <div className="text-center"><h3 className="text-2xl font-bold text-white mb-2">Transfer Portal Open</h3><p className="text-slate-400 mb-6">Recruit experienced players to fill roster gaps immediately.</p><button onClick={advanceWeek} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded">Advance Week ({portalWeek}/2)</button></div> : 
              seasonStage === SeasonStage.CONFERENCE_CHAMPIONSHIP ? <div className="text-center"><h3 className="text-2xl font-bold text-white mb-4">Championship Week</h3><button onClick={advanceWeek} className="w-full py-3 bg-indigo-600 text-white font-bold rounded">Simulate Week</button></div> : 
              !currentOpponent ? <div className="text-center py-12"><div className="text-slate-500 mb-4 text-xl">Bye Week</div><button onClick={advanceWeek} className="px-6 py-2 bg-slate-700 text-white rounded font-bold">Advance Week</button></div> : 
              !simResult ? <div className="text-center"><div className="flex justify-center items-center gap-8 mb-8"><div className="text-center"><div className={`w-16 h-16 ${userTeam.color} rounded-full flex items-center justify-center text-xl font-black text-white shadow-lg mx-auto mb-3`}>{userTeam.abbreviation}</div><div className="font-bold text-white">{userTeam.name}</div></div><div className="text-2xl font-black text-slate-600">VS</div><div className="text-center"><div className={`w-16 h-16 ${currentOpponent.color} rounded-full flex items-center justify-center text-xl font-black text-white shadow-lg mx-auto mb-3`}>{currentOpponent.abbreviation}</div><div className="font-bold text-white">{currentOpponent.name}</div></div></div><button onClick={handleSimulateGame} disabled={loading} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-bold rounded-lg transition-all">{loading ? 'Simulating...' : 'Simulate Game'}</button></div> : 
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500"><div className="flex justify-between items-center mb-6"><div className="text-center"><div className="text-4xl font-black text-white mb-1">{simResult.stats?.homeScore}</div><div className="text-emerald-400 font-bold">{userTeam.abbreviation}</div></div><div className="text-slate-500 text-sm font-medium uppercase tracking-widest">Final</div><div className="text-center"><div className="text-4xl font-black text-white mb-1">{simResult.stats?.awayScore}</div><div className="text-slate-400 font-bold">{currentOpponent.abbreviation}</div></div></div><div className="bg-slate-950/50 rounded-lg p-4 mb-6 text-sm text-slate-300 leading-relaxed border border-slate-800">{simResult.summary}</div><button onClick={advanceWeek} className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg">Advance Week</button></div>}
           </div>
        </div>
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 h-[400px] overflow-y-auto">
           <h3 className="text-slate-200 font-bold mb-4 sticky top-0 bg-slate-800 pb-2">Coach Profile Summary</h3>
           <div className="mb-4">
                <div className="flex justify-between text-xs font-bold text-slate-500 uppercase mb-1"><span>Career Prestige</span><span>LVL {coach.level}</span></div>
                <div className="bg-slate-900 h-2 w-full rounded-full overflow-hidden mb-2">
                    <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${coach.prestige}%` }}></div>
                </div>
                <div className="text-xs text-slate-400">Visit the Profile tab for full career stats.</div>
           </div>
           <div className="space-y-2 mt-6">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 border-b border-slate-700 pb-1">{userTeam.conference} Scores</h4>
              {tickerGames.map(m => {
                 const h = league.find(t => t.id === m.homeTeamId);
                 const a = league.find(t => t.id === m.awayTeamId);
                 if (!h || !a) return null;
                 const winner = m.homeScore! > m.awayScore! ? h : a;
                 return (
                   <div key={m.id} className="flex justify-between items-center text-sm p-2 bg-slate-700/30 rounded border border-slate-700/50">
                      <div className="flex gap-2"><span className={winner === h ? 'text-emerald-400 font-bold' : 'text-slate-400'}>{h.abbreviation} {m.homeScore}</span><span className="text-slate-600">-</span><span className={winner === a ? 'text-emerald-400 font-bold' : 'text-slate-400'}>{a.abbreviation} {m.awayScore}</span></div>
                   </div>
                 )
              })}
           </div>
        </div>
      </div>
      </>
      )}
    </div>
  )};

  const renderScheduleTab = () => {
    const scheduleItems = [];
    for (let w = 1; w <= 14; w++) {
        const game = schedule.find(m => m.week === w && (m.homeTeamId === userTeamId || m.awayTeamId === userTeamId));
        scheduleItems.push({ week: w, game });
    }
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-center bg-slate-800 p-6 rounded-xl border border-slate-700">
           <div><h2 className="text-2xl font-black text-white">Season Schedule</h2><div className="text-slate-400">{week === 0 ? 'Pre-Season: Customize your schedule below.' : `Week ${week} of Regular Season`}</div></div>
           {week === 0 && <button onClick={advanceWeek} className="mt-4 md:mt-0 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded shadow-lg shadow-emerald-900/50">Start Season &rarr;</button>}
        </div>
        {editingWeek !== null && (
             <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 fixed inset-0 z-50 flex flex-col justify-center items-center bg-opacity-95">
                 <div className="bg-slate-900 border border-slate-600 rounded-xl p-6 w-full max-w-2xl h-[80vh] flex flex-col">
                     <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold text-white">Select Opponent (Week {editingWeek})</h3><button onClick={() => setEditingWeek(null)} className="text-slate-400 hover:text-white">Close</button></div>
                     <div className="overflow-y-auto flex-1 space-y-2 pr-2">
                         {league.filter(t => t.id !== userTeamId).sort((a,b) => b.prestige - a.prestige).map(t => (
                             <button key={t.id} onClick={() => handleScheduleSwap(t.id, editingWeek!)} className="w-full p-3 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 flex justify-between items-center transition-colors">
                                 <div className="flex items-center gap-3"><div className={`w-8 h-8 ${t.color} rounded-full flex items-center justify-center text-[10px] font-bold text-white`}>{t.abbreviation}</div><div className="text-left"><div className="font-bold text-white">{t.name}</div><div className="text-xs text-slate-400">{t.conference} • {t.prestige} OVR</div></div></div>
                                 <div className="text-xs text-emerald-400 font-bold uppercase">Select</div>
                             </button>
                         ))}
                     </div>
                 </div>
             </div>
        )}
        <div className="grid grid-cols-1 gap-3">
            {scheduleItems.map(({ week: w, game: m }) => {
                if (!m) return <div key={w} className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 flex items-center gap-6 opacity-60"><div className="w-16 text-center"><div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Week</div><div className="text-2xl font-black text-slate-400">{w}</div></div><div className="text-xl font-bold text-slate-500 uppercase tracking-widest">Bye Week</div>{week === 0 && <div className="ml-auto"><button onClick={() => setEditingWeek(w)} className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded text-xs font-bold transition-colors"><ICONS.Edit className="w-3 h-3"/> Add Game</button></div>}</div>;
                const isHome = m.homeTeamId === userTeamId;
                const opponent = isHome ? league.find(t => t.id === m.awayTeamId) : league.find(t => t.id === m.homeTeamId);
                if (!opponent) return null;
                const isWin = m.winnerId === userTeamId;
                return (
                    <div key={m.id} className="p-4 bg-slate-800 rounded-xl border border-slate-700 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-6 w-full md:w-auto">
                             <div className="w-16 text-center"><div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Week</div><div className="text-2xl font-black text-white">{m.week}</div></div>
                             <div className="flex items-center gap-4 flex-1"><div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm ${opponent.color}`}>{opponent.abbreviation}</div><div><div className="flex items-center gap-2"><span className="text-slate-400 font-bold">{isHome ? 'vs' : '@'}</span><span className="font-bold text-white text-lg">{opponent.name}</span>{opponent.stats.rank > 0 && <span className="text-xs bg-slate-700 text-slate-300 px-1.5 rounded">#{opponent.stats.rank}</span>}</div><div className="text-xs text-slate-500">{opponent.conference} • {opponent.stats.wins}-{opponent.stats.losses}</div></div></div>
                        </div>
                        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                            <div className="text-right">{m.played ? <div className={`text-xl font-black ${isWin ? 'text-emerald-400' : 'text-red-400'}`}>{isWin ? 'W' : 'L'} {m.homeScore}-{m.awayScore}</div> : <div className={`text-xs font-bold px-2 py-0.5 rounded ${m.isConferenceGame ? 'bg-indigo-900/50 text-indigo-400 border border-indigo-500/30' : 'bg-slate-700 text-slate-400'}`}>{m.isConferenceGame ? 'Conference' : 'Non-Conf'}</div>}</div>
                            {week === 0 && !m.played && <button onClick={() => setEditingWeek(m.week)} className="px-4 py-2 bg-slate-700 hover:bg-yellow-600 text-white text-sm font-bold rounded flex items-center gap-2"><ICONS.Edit className="w-3 h-3"/> Change</button>}
                        </div>
                    </div>
                );
            })}
        </div>
      </div>
    );
  };
  
  const renderResults = () => {
      const displayedGames = schedule.filter(m => m.week === resultsWeek && m.played);
      const conferences = ['SEC', 'Big Ten', 'ACC', 'Big 12', 'Pac-12', 'AAC', 'Mountain West', 'Sun Belt', 'MAC', 'CUSA', 'Independent'];
      const sortedConferences = [userTeam.conference, ...conferences.filter(c => c !== userTeam.conference)];
      return (
          <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center bg-slate-800 p-4 rounded-xl border border-slate-700"><button onClick={() => setResultsWeek(w => Math.max(1, w - 1))} disabled={resultsWeek <= 1} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded text-white font-bold">&larr; Prev Week</button><h2 className="text-2xl font-black text-white">Week {resultsWeek} Results</h2><button onClick={() => setResultsWeek(w => Math.min(16, w + 1))} disabled={resultsWeek >= 16 || resultsWeek >= week} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded text-white font-bold">Next Week &rarr;</button></div>
              {displayedGames.length === 0 ? <div className="text-center p-12 text-slate-500">No games played for this week yet.</div> : <div className="space-y-8">{sortedConferences.map(conf => {
                          const confGames = displayedGames.filter(m => {
                              const h = league.find(t => t.id === m.homeTeamId);
                              const a = league.find(t => t.id === m.awayTeamId);
                              return h?.conference === conf || a?.conference === conf;
                          });
                          if (confGames.length === 0) return null;
                          return (
                              <div key={conf} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                                  <div className="bg-slate-700 px-4 py-2 font-bold text-white">{conf}</div>
                                  <div className="divide-y divide-slate-700/50">{confGames.map(m => {
                                          const h = league.find(t => t.id === m.homeTeamId)!;
                                          const a = league.find(t => t.id === m.awayTeamId)!;
                                          const winner = m.homeScore! > m.awayScore! ? h : a;
                                          return (
                                              <div key={m.id} className="p-4 flex justify-between items-center"><div className="flex flex-col gap-1 w-1/3 text-right"><div className={winner === h ? 'text-emerald-400 font-bold' : 'text-slate-300'}>{h.name} {h.stats.rank > 0 && <span className="text-[10px] text-slate-500">#{h.stats.rank}</span>}</div></div><div className="w-1/3 text-center flex flex-col items-center"><div className="text-2xl font-black text-white">{m.homeScore} - {m.awayScore}</div><div className="text-xs text-slate-500">Final</div></div><div className="flex flex-col gap-1 w-1/3 text-left"><div className={winner === a ? 'text-emerald-400 font-bold' : 'text-slate-300'}>{a.name} {a.stats.rank > 0 && <span className="text-[10px] text-slate-500">#{a.stats.rank}</span>}</div></div></div>
                                          )
                                      })}</div>
                              </div>
                          )
                      })}</div>
              }
          </div>
      )
  };

  const renderStandings = () => {
    const conferences = ['SEC', 'Big Ten', 'ACC', 'Big 12', 'Pac-12', 'AAC', 'Mountain West', 'Sun Belt', 'MAC', 'CUSA', 'Independent'];
    const sortedConferences = [userTeam.conference, ...conferences.filter(c => c !== userTeam.conference)];
    return (
    <div className="space-y-6 animate-fade-in"><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{sortedConferences.map(conf => (
           <div key={conf} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden"><div className="bg-slate-700 px-4 py-3 font-bold text-white border-b border-slate-600">{conf}</div><div className="p-2"><table className="w-full text-sm"><thead><tr className="text-slate-500 text-xs uppercase text-left"><th className="p-2">Team</th><th className="p-2 text-center">Conf</th><th className="p-2 text-center">Ovr</th></tr></thead><tbody>{getStandings(league.filter(t => t.conference === conf)).map((t, i) => (
                       <tr key={t.id} className={`border-b border-slate-700/50 last:border-0 ${t.id === userTeamId ? 'bg-emerald-500/10' : ''}`}><td className="p-2 font-medium text-slate-200 flex items-center gap-2">{i < 2 && <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>}{t.name}</td><td className="p-2 text-center text-slate-400">{t.stats.confWins}-{t.stats.confLosses}</td><td className="p-2 text-center font-bold text-white">{t.stats.wins}-{t.stats.losses}</td></tr>
                     ))}</tbody></table></div></div>
         ))}</div></div>
    )};

  const renderRankings = () => {
    const apPoll = getAPTop25(league);
    const coachesPoll = getCoachesTop25(league);
    const cfpPoll = week >= 8 ? getCFPTop25(league) : null;
    const RankingList = ({ title, teams }: { title: string, teams: Team[] }) => (
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden h-full"><div className="bg-slate-700 px-4 py-3 font-bold text-white border-b border-slate-600 flex justify-between items-center"><span>{title}</span><span className="text-xs font-normal text-slate-400 bg-slate-800 px-2 py-1 rounded">Week {week}</span></div><div className="p-0"><table className="w-full text-sm"><thead className="bg-slate-750"><tr className="text-slate-500 text-xs uppercase text-left"><th className="p-3 w-8">#</th><th className="p-3">Team</th><th className="p-3 text-center">Rec</th></tr></thead><tbody>{teams.map((t, i) => (
                  <tr key={t.id} className={`border-b border-slate-700/50 last:border-0 hover:bg-slate-700/50 transition-colors ${t.id === userTeamId ? 'bg-emerald-500/10' : ''}`}><td className="p-3 font-bold text-slate-400">{i + 1}</td><td className="p-3 font-medium text-slate-200 flex items-center gap-2"><div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${t.color}`}>{t.abbreviation}</div>{t.name}</td><td className="p-3 text-center font-bold text-white">{t.stats.wins}-{t.stats.losses}</td></tr>
                ))}</tbody></table></div></div>
    );
    return (<div className="space-y-6 animate-fade-in"><div className={`grid grid-cols-1 ${cfpPoll ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-6`}><RankingList title="AP Poll" teams={apPoll} /><RankingList title="Coaches Poll" teams={coachesPoll} />{cfpPoll && <RankingList title="CFP Rankings" teams={cfpPoll} />}</div></div>);
  };

  const renderRoster = () => {
    const groups: Partial<Record<Position, any[]>> = {};
    const positions = Object.values(Position);
    positions.forEach(p => groups[p] = []);
    userTeam?.roster.forEach((p) => { if (!groups[p.position]) groups[p.position] = []; groups[p.position]?.push(p); });
    return (
      <div className="space-y-6 animate-fade-in">
        {positions.map(pos => {
          const players = groups[pos] || [];
          if (players.length === 0) return null;
          return (
            <div key={pos} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <div className="bg-slate-700 px-4 py-2 font-bold text-white flex justify-between items-center">
                <span>{pos} Depth Chart</span>
                <span className="text-xs text-slate-400 font-normal">{players.length} Players</span>
              </div>
              <div className="divide-y divide-slate-700/50">
                {players.map((p, idx) => (
                  <div key={p.id} className={`p-3 flex items-center justify-between transition-colors cursor-move ${draggedPlayerId === p.id ? 'bg-emerald-900/40 opacity-50' : 'hover:bg-slate-700/30'}`} draggable onDragStart={(e) => handleDragStart(e, p.id)} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, p.id)}>
                    <div className="flex items-center gap-4">
                      <div className="w-6 text-center font-bold text-slate-500">{idx + 1}</div>
                      <div>
                        <div className="font-bold text-white flex items-center gap-2">
                          {p.name}
                        </div>
                        <div className="text-xs text-slate-400">{p.year} • {p.hometown}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right mr-4">
                        <div className="text-xl font-bold text-white">{p.rating}</div>
                        <div className="text-[10px] text-slate-500 uppercase">OVR</div>
                        {p.leavingStatus && <span className="text-[9px] bg-red-600 text-white px-1 rounded block text-center">LEAVING</span>}
                      </div>
                      <ICONS.List className="w-4 h-4 text-slate-600" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderRecruiting = () => {
      const targets = recruits.filter(r => r.isTargeted);
      const searchPool = recruits.filter(r => !r.isTargeted);
      const RecruitRow = ({ r, showActions = true }: { r: Recruit, showActions?: boolean }) => {
        const isCommittedToUser = r.committedTo === userTeamId;
        const isCommittedToOther = r.committedTo && !isCommittedToUser;
        const committedTeamName = isCommittedToOther ? league.find(t => t.id === r.committedTo)?.name : null;
        const isTransfer = r.recruitType === 'TRANSFER';
        return (<div className={`p-4 rounded-xl border flex flex-col sm:flex-row justify-between gap-4 transition-all ${isCommittedToUser ? 'bg-emerald-900/20 border-emerald-500/50' : isCommittedToOther ? 'bg-slate-800 border-red-900/30 opacity-60' : 'bg-slate-800 border-slate-700 hover:border-slate-600'}`}><div className="flex gap-4"><div className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg font-bold border ${isTransfer ? 'bg-purple-900/20 border-purple-500/50 text-purple-400' : 'bg-slate-700 border-transparent text-yellow-400'}`}>{isTransfer ? 'TR' : `${r.stars}★`}</div><div><div className="font-bold text-white text-lg flex items-center gap-2">{r.name}{isCommittedToUser ? (<span className="text-sm px-2 py-0.5 rounded bg-emerald-500 text-white font-black">COMMITTED</span>) : isCommittedToOther ? (<span className="text-sm px-2 py-0.5 rounded bg-red-600 text-white font-bold">SIGNED: {committedTeamName}</span>) : (<span className={`text-sm px-2 py-0.5 rounded ${r.interest >= 80 ? 'bg-emerald-500/20 text-emerald-400' : r.interest >= 50 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-600 text-slate-400'}`}>{r.interest}% Int</span>)}</div><div className="text-sm text-slate-400 flex items-center gap-2"><span>{r.position}</span><span className="text-slate-600">•</span><span>{r.year}</span><span className="text-slate-600">•</span><span>{r.hometown}</span></div>{r.isScouted && <div className="mt-1 text-xs text-indigo-300 italic">"{r.scoutingReport}"</div>}</div></div>{showActions && !r.committedTo && (<div className="flex flex-wrap sm:flex-nowrap gap-2 items-center"><button onClick={() => handleRecruitAction('SCOUT', r.id)} disabled={r.isScouted} className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 rounded text-xs font-bold text-white">Scout (10)</button><button onClick={() => handleRecruitAction('CALL', r.id)} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-xs font-bold text-white">Call (5)</button><button onClick={() => handleRecruitAction('VISIT', r.id)} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-xs font-bold text-white">Visit (25)</button>{r.isOffered ? (<button onClick={() => handleRecruitAction('RESCIND', r.id)} className="px-3 py-2 bg-red-600 hover:bg-red-500 rounded text-xs font-bold text-white">Rescind</button>) : (<button onClick={() => handleRecruitAction('OFFER', r.id)} className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 rounded text-xs font-bold text-white">Offer</button>)}</div>)}</div>)};
      let filteredByView = searchPool;
      if (seasonStage === SeasonStage.TRANSFER_PORTAL) filteredByView = searchPool.filter(r => r.recruitType === 'TRANSFER');
      else filteredByView = searchPool.filter(r => r.recruitType === 'HS');
      const filteredByPos = getFilteredItems(filteredByView, recruitingFilter);
      const sortedRecruits = filteredByPos.sort((a,b) => { if (sortOrder === 'RANK') { if (a.stars !== b.stars) return b.stars - a.stars; return b.rating - a.rating; } else { if (a.interest !== b.interest) return b.interest - a.interest; return b.stars - a.stars; } });
      return (<div className="space-y-8 animate-fade-in"><div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4"><div><h2 className="text-2xl font-black text-white">{seasonStage === SeasonStage.TRANSFER_PORTAL ? 'Transfer Portal' : 'High School Recruiting'}</h2><p className="text-slate-400">Build your career by signing the best talent.</p></div><div className="flex items-center gap-6"><div className="flex flex-col items-end"><div className="text-3xl font-black text-white">{scholarshipsAvailable}</div><div className="text-xs text-slate-500">Scholarships</div></div><div className="flex flex-col items-end"><div className="text-3xl font-black text-emerald-400">{recruitingPoints} <span className="text-sm font-normal text-slate-400">PTS</span></div><div className="text-xs text-slate-500">Weekly Budget</div></div></div></div><div className="space-y-4"><h3 className="text-xl font-bold text-white flex items-center gap-2"><ICONS.Clipboard className="text-emerald-500"/> Target Board <span className="text-sm font-normal text-slate-500">({targets.length})</span></h3>{targets.length === 0 ? (<div className="p-8 border-2 border-dashed border-slate-700 rounded-xl text-center text-slate-500">No active targets.</div>) : (<div className="grid grid-cols-1 gap-4">{targets.map(r => <RecruitRow key={r.id} r={r} />)}</div>)}</div><div className="border-t border-slate-800 my-4"></div><div className="space-y-4"><div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4"><h3 className="text-xl font-bold text-white flex items-center gap-2"><ICONS.Search className="text-slate-500"/> Prospects</h3><div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto"><div className="bg-slate-800 p-1 rounded-lg border border-slate-700 flex"><button onClick={() => setSortOrder('RANK')} className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${sortOrder === 'RANK' ? 'bg-slate-600 text-white' : 'text-slate-400'}`}>Rank</button><button onClick={() => setSortOrder('INTEREST')} className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${sortOrder === 'INTEREST' ? 'bg-slate-600 text-white' : 'text-slate-400'}`}>Interest</button></div><div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 sm:pb-0">{filters.map(f => (<button key={f} onClick={() => setRecruitingFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors border ${recruitingFilter === f ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/50' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>{f}</button>))}</div></div></div><div className="grid grid-cols-1 gap-4">{sortedRecruits.map((r: any) => (<RecruitRow key={r.id} r={r} showActions={true} />))}</div></div></div>);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-emerald-500/30">
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 backdrop-blur-md bg-opacity-80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3"><div className="w-8 h-8 bg-emerald-600 rounded flex items-center justify-center"><ICONS.Football className="text-white w-5 h-5" /></div><span className="font-black text-xl tracking-tight text-white hidden sm:block">CFB <span className="text-emerald-500">Dynasty</span></span></div>
            {viewState === 'DYNASTY_HUB' && (<nav className="flex gap-1 md:gap-4 overflow-x-auto">{Object.values(TABS).map((tab) => { if (seasonStage === SeasonStage.RETENTION && tab === TABS.RECRUITING) return null; return (<button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === tab ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>{tab}</button>); })}</nav>)}
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === TABS.DASHBOARD && renderDashboard()}
        {activeTab === TABS.SCHEDULE && renderScheduleTab()}
        {activeTab === TABS.RESULTS && renderResults()}
        {activeTab === TABS.STANDINGS && renderStandings()}
        {activeTab === TABS.RANKINGS && renderRankings()}
        {activeTab === TABS.ROSTER && renderRoster()}
        {activeTab === TABS.RECRUITING && renderRecruiting()}
        {activeTab === TABS.PROFILE && renderCoachProfile()}
        {activeTab === TABS.SETTINGS && renderSettings()}
        {activeTab === TABS.STRATEGY && userTeam && (<StrategyPanel strategy={userTeam.strategy} onUpdate={(s) => setLeague(l => l.map(t => t.id === userTeamId ? { ...t, strategy: s } : t))} />)}
      </main>
    </div>
  );
};

export default App;
