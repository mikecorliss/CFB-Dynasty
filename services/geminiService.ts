
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Team, GameResult, AISettings } from '../types';

// Gemini Initialization
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Game Simulation Schema
const gameSimulationSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    homeScore: { type: Type.INTEGER },
    awayScore: { type: Type.INTEGER },
    quarters: { 
      type: Type.ARRAY, 
      items: { type: Type.INTEGER },
      description: "Scores for Home team by quarter" 
    },
    summary: { type: Type.STRING, description: "A 3-sentence summary of the game narrative." },
    playByPlayHighlights: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "5 key moments from the game with timestamps"
    },
    stats: {
      type: Type.OBJECT,
      properties: {
        passingYards: { type: Type.INTEGER },
        rushingYards: { type: Type.INTEGER },
        turnovers: { type: Type.INTEGER },
        possessionTime: { type: Type.STRING }
      }
    }
  },
  required: ["homeScore", "awayScore", "summary", "playByPlayHighlights", "stats"]
};

const getGamePrompt = (homeTeam: Team, awayTeam: Team) => `
  Simulate a college football game between:
  HOME: ${homeTeam.name} (OVR: ${homeTeam.prestige}, Offense: ${homeTeam.strategy.offense})
  AWAY: ${awayTeam.name} (OVR: ${awayTeam.prestige}, Offense: ${awayTeam.strategy.offense})
  
  Strategy Factors: 
  Aggression: ${homeTeam.strategy.aggression}/10
  Clock Management: ${homeTeam.strategy.clockManagement}
  4th Down Tendency: ${homeTeam.strategy.fourthDownTendency}
  
  Return a JSON object with: homeScore, awayScore, quarters (home team scores per qtr), summary (3 sentences), playByPlayHighlights (5 moments), stats (passingYards, rushingYards, turnovers, possessionTime).
`;

export const simulateGameWithAI = async (
  homeTeam: Team, 
  awayTeam: Team,
  settings: AISettings
): Promise<GameResult | null> => {
  try {
    const prompt = getGamePrompt(homeTeam, awayTeam);
    let data;

    if (settings.provider === 'ollama') {
      const response = await fetch(`${settings.ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: settings.ollamaModel,
          prompt: prompt + " Output MUST be pure JSON and follow this structure: " + JSON.stringify(gameSimulationSchema.properties),
          format: 'json',
          stream: false
        })
      });
      const json = await response.json();
      data = JSON.parse(json.response);
    } else {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: gameSimulationSchema,
          temperature: 0.7
        }
      });
      data = JSON.parse(response.text || '{}');
    }
    
    const quarters = data.quarters && data.quarters.length === 4 ? data.quarters : [0,0,0,0];

    return {
      week: 0,
      opponentId: awayTeam.id,
      isHome: true,
      result: data.homeScore > data.awayScore ? 'W' : 'L',
      stats: {
        homeScore: data.homeScore,
        awayScore: data.awayScore,
        quarters: quarters,
        passingYards: data.stats?.passingYards || 0,
        rushingYards: data.stats?.rushingYards || 0,
        turnovers: data.stats?.turnovers || 0,
        possessionTime: data.stats?.possessionTime || "30:00"
      },
      summary: data.summary || "Game simulated.",
      playByPlayHighlights: data.playByPlayHighlights || []
    };

  } catch (error) {
    console.error("AI Simulation failed:", error);
    return {
      week: 0,
      opponentId: awayTeam.id,
      isHome: true,
      result: 'W',
      stats: {
        homeScore: 21, awayScore: 17, quarters: [7, 0, 7, 7],
        passingYards: 200, rushingYards: 100, turnovers: 1, possessionTime: "30:00"
      },
      summary: "Simulation fallback used due to error.",
      playByPlayHighlights: ["Game played offline."]
    };
  }
};

const recruitSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING },
      position: { type: Type.STRING },
      hometown: { type: Type.STRING },
      scoutingReport: { type: Type.STRING },
      stars: { type: Type.INTEGER }
    }
  }
};

export const generateRecruits = async (count: number, settings: AISettings): Promise<any[]> => {
  try {
    const prompt = `Generate ${count} realistic high school football recruits with names, positions, hometowns, star ratings (1-5), and a brief scouting report. Output as a JSON array.`;
    
    if (settings.provider === 'ollama') {
      const response = await fetch(`${settings.ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: settings.ollamaModel,
          prompt: prompt,
          format: 'json',
          stream: false
        })
      });
      const json = await response.json();
      return JSON.parse(json.response);
    } else {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: recruitSchema
        }
      });
      return JSON.parse(response.text || '[]');
    }
  } catch (e) {
    console.error(e);
    return [];
  }
};
