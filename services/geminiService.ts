
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Team, GameResult, AISettings, Storyline } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
    summary: { type: Type.STRING, description: "A detailed 4-sentence summary of the game narrative." },
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

const storylineSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING },
      title: { type: Type.STRING },
      content: { type: Type.STRING },
      importance: { type: Type.STRING, enum: ["LOW", "MED", "HIGH"] },
      tags: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ["id", "title", "content", "importance", "tags"]
  }
};

export const simulateGameWithAI = async (
  homeTeam: Team, 
  awayTeam: Team,
  settings: AISettings
): Promise<GameResult | null> => {
  try {
    const prompt = `
      Simulate a college football game between:
      HOME: ${homeTeam.name} (Rank: #${homeTeam.stats.rank || 'NR'}, OVR: ${homeTeam.prestige})
      AWAY: ${awayTeam.name} (Rank: #${awayTeam.stats.rank || 'NR'}, OVR: ${awayTeam.prestige})
      
      Home Strategy: ${homeTeam.strategy.offense} / ${homeTeam.strategy.defense} (Aggression: ${homeTeam.strategy.aggression})
      Away Strategy: ${awayTeam.strategy.offense} / ${awayTeam.strategy.defense}
      
      Create a realistic score based on team prestige. High prestige teams should usually beat low prestige ones unless it's a major upset.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: gameSimulationSchema,
        temperature: 0.8
      }
    });
    
    const data = JSON.parse(response.text || '{}');
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
      summary: data.summary || "The game concludes with standard results.",
      playByPlayHighlights: data.playByPlayHighlights || []
    };
  } catch (error) {
    console.error("AI Simulation failed:", error);
    return null;
  }
};

export const generateWeeklyStorylines = async (
  week: number, 
  topPerformers: string[], 
  settings: AISettings
): Promise<Storyline[]> => {
  try {
    const prompt = `
      Generate 3 compelling college football news storylines for Week ${week}.
      Context: Top teams: ${topPerformers.join(', ')}.
      Include topics like:
      - A major upset rumor.
      - A player entering the Heisman conversation.
      - A coaching rumor or "hot seat" news.
      Output as a JSON array of Storyline objects.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: storylineSchema
      }
    });

    return JSON.parse(response.text || '[]');
  } catch (e) {
    return [
      { id: '1', title: 'Season Heating Up', content: 'As the schedule reaches its midpoint, every game has playoff implications.', importance: 'MED', tags: ['Season'] }
    ];
  }
};
