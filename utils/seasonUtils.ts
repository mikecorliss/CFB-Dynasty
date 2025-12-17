
import { Team, Matchup, Conference, SeasonStage } from '../types';

const shuffle = <T>(array: T[]): T[] => {
    let currentIndex = array.length,  randomIndex;
    while (currentIndex != 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
    return array;
};

export const generateSeasonSchedule = (teams: Team[]): Matchup[] => {
  const schedule: Matchup[] = [];
  const TOTAL_GAMES = 12;
  const WEEKS = 14;
  
  const scheduledPairs = new Set<string>();
  const getPairKey = (id1: string, id2: string) => [id1, id2].sort().join('-');
  const isAlreadyScheduled = (id1: string, id2: string) => scheduledPairs.has(getPairKey(id1, id2));
  const markAsScheduled = (id1: string, id2: string) => scheduledPairs.add(getPairKey(id1, id2));

  const isTeamFree = (teamId: string, week: number) => {
    return !schedule.some(m => m.week === week && (m.homeTeamId === teamId || m.awayTeamId === teamId));
  };

  const getGameCount = (teamId: string) => {
    return schedule.filter(m => m.homeTeamId === teamId || m.awayTeamId === teamId).length;
  };

  const teamsByConf: Record<string, Team[]> = {};
  teams.forEach(t => {
    if (!teamsByConf[t.conference]) teamsByConf[t.conference] = [];
    teamsByConf[t.conference].push(t);
  });

  // Pass 1: Conference Games
  Object.entries(teamsByConf).forEach(([confName, confTeams]) => {
      if (confName === 'Independent') return;
      const numTeams = confTeams.length;
      const confMatchups: {h: Team, a: Team}[] = [];

      if (numTeams <= 10) {
          // ROUND ROBIN: le 10 teams
          for(let i=0; i<numTeams; i++) {
              for(let j=i+1; j<numTeams; j++) {
                  confMatchups.push({h: confTeams[i], a: confTeams[j]});
              }
          }
      } else {
          // GT 10: Exactly 9 games
          const confGameCount: Record<string, number> = {};
          confTeams.forEach(t => confGameCount[t.id] = 0);
          
          for (let round = 0; round < 9; round++) {
             const sortedByNeeds = [...confTeams].sort((a,b) => confGameCount[a.id] - confGameCount[b.id]);
             const unpaired = new Set(sortedByNeeds.filter(t => confGameCount[t.id] < 9).map(t => t.id));

             confTeams.forEach(t1 => {
                 if (!unpaired.has(t1.id)) return;
                 const potential = shuffle(confTeams).filter(t2 => 
                    t1.id !== t2.id && 
                    unpaired.has(t2.id) && 
                    !isAlreadyScheduled(t1.id, t2.id)
                 );
                 if (potential.length > 0) {
                     const t2 = potential[0];
                     confMatchups.push({h: t1, a: t2});
                     markAsScheduled(t1.id, t2.id);
                     confGameCount[t1.id]++;
                     confGameCount[t2.id]++;
                     unpaired.delete(t1.id);
                     unpaired.delete(t2.id);
                 }
             });
          }
      }

      const lateWeeks = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
      const earlyWeeks = [1, 2, 3, 4];
      
      confMatchups.forEach(match => {
          if (numTeams <= 10) markAsScheduled(match.h.id, match.a.id);
          const weeks = shuffle([...lateWeeks, ...earlyWeeks]);
          for (const w of weeks) {
              if (isTeamFree(match.h.id, w) && isTeamFree(match.a.id, w)) {
                  schedule.push({
                      id: `c-${match.h.id}-${match.a.id}-w${w}`,
                      week: w, homeTeamId: match.h.id, awayTeamId: match.a.id,
                      played: false, isUserGame: false, isConferenceGame: true, isPlayoff: false
                  });
                  break;
              }
          }
      });
  });

  // Pass 2: Fill Non-Conference (Prioritize Weeks 1-4)
  const oocPriorityWeeks = [1, 2, 3, 4];
  const oocFillerWeeks = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
  const allOocWeeks = [...oocPriorityWeeks, ...shuffle(oocFillerWeeks)];

  for (let pass = 0; pass < 5; pass++) {
    const needing = teams.filter(t => getGameCount(t.id) < TOTAL_GAMES);
    if (needing.length < 2) break;

    shuffle(needing).forEach(t1 => {
        if (getGameCount(t1.id) >= TOTAL_GAMES) return;
        const potential = shuffle(teams.filter(t2 => 
            t1.id !== t2.id && 
            getGameCount(t2.id) < TOTAL_GAMES &&
            !isAlreadyScheduled(t1.id, t2.id) &&
            (pass < 2 ? t1.conference !== t2.conference : true)
        ));

        for (const opponent of potential) {
            if (getGameCount(t1.id) >= TOTAL_GAMES) break;
            for (const w of allOocWeeks) {
                if (isTeamFree(t1.id, w) && isTeamFree(opponent.id, w)) {
                    schedule.push({
                        id: `o-${t1.id}-${opponent.id}-w${w}`,
                        week: w, homeTeamId: t1.id, awayTeamId: opponent.id,
                        played: false, isUserGame: false, isConferenceGame: t1.conference === opponent.conference, isPlayoff: false
                    });
                    markAsScheduled(t1.id, opponent.id);
                    break;
                }
            }
        }
    });
  }

  return schedule;
};

export const generateConferenceChampionships = (teams: Team[], currentSchedule: Matchup[]): Matchup[] => {
    const champs: Matchup[] = [];
    const conferences: Conference[] = ['SEC', 'Big Ten', 'ACC', 'Big 12', 'Pac-12', 'AAC', 'Mountain West', 'Sun Belt', 'MAC', 'CUSA'];
    
    conferences.forEach(conf => {
        const confTeams = teams.filter(t => t.conference === conf);
        if (confTeams.length < 2) return;

        const sorted = confTeams.sort((a,b) => {
            if (a.stats.confWins !== b.stats.confWins) return b.stats.confWins - a.stats.confWins;
            if (a.stats.wins !== b.stats.wins) return b.stats.wins - a.stats.wins;
            return b.prestige - a.prestige;
        });

        champs.push({
            id: `ccg-${conf}-${sorted[0].id}-${sorted[1].id}`,
            week: 15, homeTeamId: sorted[0].id, awayTeamId: sorted[1].id,
            played: false, isUserGame: false, isConferenceGame: true, isPlayoff: true,
            label: `${conf} Championship`
        });
    });
    return champs;
};

export const simulateMatch = (home: Team, away: Team): { homeScore: number, awayScore: number } => {
  const diff = home.prestige - away.prestige;
  const homeAdv = 3; 
  const winProb = 0.5 + ((diff + homeAdv) / 100);
  const homeWin = Math.random() < winProb;
  const base = 24 + (Math.random() * 14 - 7);
  let hS = base + (diff / 2);
  let aS = base - (diff / 2);
  if (homeWin && hS <= aS) hS = aS + Math.floor(Math.random() * 7) + 1;
  else if (!homeWin && aS <= hS) aS = hS + Math.floor(Math.random() * 7) + 1;
  return { homeScore: Math.max(0, Math.floor(hS)), awayScore: Math.max(0, Math.floor(aS)) };
};

export const getStandings = (teams: Team[]): Team[] => {
  return [...teams].sort((a, b) => {
    if (a.stats.confWins !== b.stats.confWins) return b.stats.confWins - a.stats.confWins;
    if (a.stats.wins !== b.stats.wins) return b.stats.wins - a.stats.wins;
    return b.prestige - a.prestige;
  });
};

export const getAPTop25 = (teams: Team[]): Team[] => {
    return [...teams].sort((a, b) => {
        if (a.stats.wins !== b.stats.wins) return b.stats.wins - a.stats.wins;
        if (a.stats.losses !== b.stats.losses) return a.stats.losses - b.stats.losses;
        return (b.stats.pointsFor - b.stats.pointsAgainst) - (a.stats.pointsFor - a.stats.pointsAgainst) || b.prestige - a.prestige;
    }).slice(0, 25);
}

export const getCoachesTop25 = (teams: Team[]): Team[] => getAPTop25(teams);

export const getCFPTop25 = (teams: Team[]): Team[] => {
    return [...teams].sort((a, b) => {
        const sA = (a.stats.wins * 100) - (a.stats.losses * 120) + a.prestige;
        const sB = (b.stats.wins * 100) - (b.stats.losses * 120) + b.prestige;
        return sB - sA;
    }).slice(0, 25);
}

export const generatePlayoffs = (teams: Team[]): Matchup[] => {
  const ranked = getCFPTop25(teams).slice(0, 12);
  if (ranked.length < 12) return [];
  return [
    { id: 'p1', week: 16, homeTeamId: ranked[4].id, awayTeamId: ranked[11].id, played: false, isUserGame: false, isConferenceGame: false, isPlayoff: true, label: 'CFP Rd 1' },
    { id: 'p2', week: 16, homeTeamId: ranked[5].id, awayTeamId: ranked[10].id, played: false, isUserGame: false, isConferenceGame: false, isPlayoff: true, label: 'CFP Rd 1' },
    { id: 'p3', week: 16, homeTeamId: ranked[6].id, awayTeamId: ranked[9].id, played: false, isUserGame: false, isConferenceGame: false, isPlayoff: true, label: 'CFP Rd 1' },
    { id: 'p4', week: 16, homeTeamId: ranked[7].id, awayTeamId: ranked[8].id, played: false, isUserGame: false, isConferenceGame: false, isPlayoff: true, label: 'CFP Rd 1' }
  ];
};
