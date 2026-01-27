
export enum Position {
  QB = 'QB',
  RB = 'RB',
  WR = 'WR',
  OL = 'OL',
  DL = 'DL',
  LB = 'LB',
  DB = 'DB',
  K = 'K'
}

export enum PlayerYear {
  FR = 'FR',
  SO = 'SO',
  JR = 'JR',
  SR = 'SR',
  RS_FR = 'RS-FR',
  RS_SO = 'RS-SO',
  RS_JR = 'RS-JR',
  RS_SR = 'RS-SR'
}

export type Conference = 
  | 'SEC' | 'Big Ten' | 'ACC' | 'Big 12' | 'Pac-12'
  | 'AAC' | 'Mountain West' | 'Sun Belt' | 'MAC' | 'CUSA' 
  | 'Independent';

export enum SeasonStage {
  PRE_SEASON = 'PRE_SEASON',
  REGULAR_SEASON = 'REGULAR_SEASON',
  CONFERENCE_CHAMPIONSHIP = 'CONFERENCE_CHAMPIONSHIP',
  POST_SEASON = 'POST_SEASON',
  COACHING_CAROUSEL = 'COACHING_CAROUSEL',
  RETENTION = 'RETENTION',
  TRANSFER_PORTAL = 'TRANSFER_PORTAL',
  OFF_SEASON = 'OFF_SEASON'
}

export type AIProvider = 'gemini' | 'ollama';

export interface AISettings {
  provider: AIProvider;
  ollamaUrl: string;
  ollamaModel: string;
}

export interface Coach {
  name: string;
  almaMater: string;
  level: number;
  prestige: number;
  offense: string;
  defense: string;
  history: string[];
  stats: {
    wins: number;
    losses: number;
    confChamps: number;
    natChamps: number;
  };
}

export interface Player {
  id: string;
  name: string;
  position: Position;
  year: PlayerYear;
  rating: number;
  hometown: string;
  stats: {
    games: number;
    yards: number;
    touchdowns: number;
    interceptions?: number;
    tackles?: number;
  };
  potential: number;
  leavingStatus?: 'GRADUATING' | 'NFL' | 'TRANSFER' | null;
  isRedshirting?: boolean;
  marketValue: number; // NIL Value
}

export type RecruitPriority = 'Pro Potential' | 'Playing Time' | 'Academics' | 'Distance' | 'Prestige' | 'Coaching' | 'Financial';

export interface Recruit extends Player {
  interest: number;
  offers: string[];
  committedTo: string | null;
  stars: number;
  scoutingReport?: string;
  isScouted: boolean;
  isOffered: boolean;
  isTargeted: boolean; // Is added to user board
  recruitType: 'HS' | 'TRANSFER';
  priority: RecruitPriority;
  dealBreaker?: RecruitPriority; // If this condition isn't met, interest drops to 0
  nilOffer: number; // Amount offered by user
}

export interface TeamFinancials {
  budget: number; // Total budget
  nilCollective: number; // Money available for NIL deals
  revenueShareCap: number; // Hard cap for rev sharing
  revenueShareAllocated: number; // Currently spent
  marketingBudget: number; // For recruiting resources
}

export interface Team {
  id: string;
  name: string;
  nickname: string;
  abbreviation: string;
  color: string;
  secondaryColor?: string;
  prestige: number;
  stars: number;
  conference: Conference;
  coachHotseat: number; // 0-100 score, higher means closer to being fired
  financials: TeamFinancials;
  stats: {
    wins: number;
    losses: number;
    confWins: number;
    confLosses: number;
    pointsFor: number;
    pointsAgainst: number;
    rank: number;
    streak: number;
  };
  roster: Player[];
  strategy: {
    offense: 'Balanced' | 'Spread' | 'Pro-Style' | 'Option' | 'Air Raid' | 'Run Heavy';
    defense: 'Balanced' | '4-3' | '3-4' | 'Blitz Heavy' | '4-2-5' | '3-3-5';
    aggression: number;
    clockManagement: 'Aggressive' | 'Balanced' | 'Conservative';
    fourthDownTendency: 'Aggressive' | 'Balanced' | 'Conservative';
  };
}

export interface GameStats {
  homeScore: number;
  awayScore: number;
  quarters: number[];
  passingYards: number;
  rushingYards: number;
  turnovers: number;
  possessionTime: string;
}

export interface GameResult {
  week: number;
  opponentId: string;
  isHome: boolean;
  result: 'W' | 'L' | null;
  stats: GameStats | null;
  summary: string;
  playByPlayHighlights: string[];
}

export interface Matchup {
  id: string;
  week: number;
  homeTeamId: string;
  awayTeamId: string;
  played: boolean;
  winnerId?: string;
  homeScore?: number;
  awayScore?: number;
  isUserGame: boolean;
  isConferenceGame: boolean;
  isPlayoff?: boolean;
  label?: string;
}

export interface Storyline {
  id: string;
  title: string;
  content: string;
  importance: 'LOW' | 'MED' | 'HIGH';
  tags: string[];
}
