
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
  SR = 'SR'
}

export type Conference = 
  | 'SEC' | 'Big Ten' | 'ACC' | 'Big 12' | 'Pac-12'
  | 'AAC' | 'Mountain West' | 'Sun Belt' | 'MAC' | 'CUSA' 
  | 'Independent';

export enum SeasonStage {
  PRE_SEASON = 'PRE_SEASON', // New stage for schedule editing
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
  level: number; // 1 (HS) to 5 (Legend)
  prestige: number; // Dynamic reputation
  offense: string;
  defense: string;
  history: string[]; // Career history
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
  rating: number; // 0-100
  hometown: string;
  stats: {
    games: number;
    yards: number;
    touchdowns: number;
  };
  potential: number; // Hidden stat for development
  leavingStatus?: 'GRADUATING' | 'NFL' | 'TRANSFER' | null;
}

export interface Recruit extends Player {
  interest: number; // 0-100
  offers: string[]; // List of other teams offering
  committedTo: string | null;
  stars: number; // 1-5
  scoutingReport?: string;
  isScouted: boolean;
  isOffered: boolean;
  isTargeted: boolean;
  recruitType: 'HS' | 'TRANSFER';
}

export interface Team {
  id: string;
  name: string;
  nickname: string;
  abbreviation: string;
  color: string;
  prestige: number; // 0-100
  stars: number; // 1-6
  conference: Conference;
  stats: {
    wins: number;
    losses: number;
    confWins: number;
    confLosses: number;
    pointsFor: number;
    pointsAgainst: number;
    rank: number; // 0 for unranked
  };
  roster: Player[];
  strategy: {
    offense: 'Balanced' | 'Spread' | 'Pro-Style' | 'Option' | 'Air Raid' | 'Run Heavy';
    defense: 'Balanced' | '4-3' | '3-4' | 'Blitz Heavy' | '4-2-5' | '3-3-5';
    aggression: number; // 1-10
    clockManagement: 'Aggressive' | 'Balanced' | 'Conservative';
    fourthDownTendency: 'Aggressive' | 'Balanced' | 'Conservative';
  };
}

export interface GameStats {
  homeScore: number;
  awayScore: number;
  quarters: number[]; // Array of 4 numbers
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
  label?: string; // e.g. "Peach Bowl" or "SEC Championship"
}
