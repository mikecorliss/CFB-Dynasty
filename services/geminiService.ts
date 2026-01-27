
import { Team, GameResult, AISettings, Storyline } from '../types';

const CLEAN_JSON_REGEX = /```json\s*([\s\S]*?)\s*```/;

// Helper to clean markdown from JSON responses often returned by LLMs
const cleanJson = (text: string): string => {
  const match = text.match(CLEAN_JSON_REGEX);
  if (match && match[1]) {
    return match[1];
  }
  // Try to find the first { and last }
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
      return text.substring(firstBrace, lastBrace + 1);
  }
  // Bracket search for arrays
  const firstBracket = text.indexOf('[');
  const lastBracket = text.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket !== -1) {
      return text.substring(firstBracket, lastBracket + 1);
  }
  return text;
};

const sanitizeUrl = (url: string): string => {
  return url.replace(/\/$/, '');
};

const callOllama = async (prompt: string, settings: AISettings): Promise<any> => {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (settings.ollamaApiKey) {
      headers['Authorization'] = `Bearer ${settings.ollamaApiKey}`;
    }

    const baseUrl = sanitizeUrl(settings.ollamaUrl);
    
    // Check if we are in a browser environment ensuring we don't block main thread if fetch hangs
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout for better UX

    const response = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        model: settings.ollamaModel,
        prompt: prompt,
        stream: false,
        format: "json",
        options: {
          temperature: 0.8
        }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Ollama API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const cleanText = cleanJson(data.response);
    return JSON.parse(cleanText);
  } catch (error) {
    // Re-throw to be caught by the fallback mechanism
    throw error;
  }
};

// Fallback logic for when API is unavailable
const generateFallbackGameResult = (homeTeam: Team, awayTeam: Team): GameResult => {
  const diff = homeTeam.prestige - awayTeam.prestige + 3; // +3 home field advantage
  const baseScore = 28;
  const variance = 14;
  
  // Randomize scores based on prestige difference
  let hScore = Math.max(0, Math.floor(baseScore + diff/2 + (Math.random() * variance - variance/2)));
  let aScore = Math.max(0, Math.floor(baseScore - diff/2 + (Math.random() * variance - variance/2)));
  
  // Prevent ties
  if (hScore === aScore) hScore += 3;

  const winner = hScore > aScore ? homeTeam : awayTeam;
  const loser = hScore > aScore ? awayTeam : homeTeam;

  return {
    week: 0,
    opponentId: awayTeam.id,
    isHome: true,
    result: hScore > aScore ? 'W' : 'L',
    stats: {
      homeScore: hScore,
      awayScore: aScore,
      quarters: [
        Math.floor(hScore * 0.2), Math.floor(hScore * 0.3), Math.floor(hScore * 0.2), hScore - Math.floor(hScore * 0.7)
      ],
      passingYards: 150 + Math.floor(Math.random() * 200),
      rushingYards: 80 + Math.floor(Math.random() * 120),
      turnovers: Math.floor(Math.random() * 3),
      possessionTime: "30:00"
    },
    summary: `The ${winner.name} defeated the ${loser.name} ${hScore}-${aScore} in a game decided by execution in the red zone. (Offline Simulation)`,
    playByPlayHighlights: [
      `${winner.name} strikes first with a long touchdown drive.`,
      `${loser.name} struggles to convert on 3rd down.`,
      `Defensive stand by ${winner.name} seals the victory.`
    ]
  };
};

export const simulateGameWithAI = async (
  homeTeam: Team, 
  awayTeam: Team,
  settings: AISettings
): Promise<GameResult> => {
  try {
    const prompt = `
      You are a college football simulation engine. 
      Simulate a game between:
      HOME: ${homeTeam.name} (Rank: #${homeTeam.stats.rank || 'NR'}, OVR: ${homeTeam.prestige})
      AWAY: ${awayTeam.name} (Rank: #${awayTeam.stats.rank || 'NR'}, OVR: ${awayTeam.prestige})
      
      Home Strategy: ${homeTeam.strategy.offense} / ${homeTeam.strategy.defense} (Aggression: ${homeTeam.strategy.aggression})
      Away Strategy: ${awayTeam.strategy.offense} / ${awayTeam.strategy.defense}
      
      Output strictly in this JSON format:
      {
        "homeScore": number,
        "awayScore": number,
        "quarters": [q1_score, q2_score, q3_score, q4_score],
        "summary": "4 sentence narrative summary",
        "playByPlayHighlights": ["highlight 1", "highlight 2", "highlight 3"],
        "stats": {
          "passingYards": number,
          "rushingYards": number,
          "turnovers": number,
          "possessionTime": "MM:SS"
        }
      }
      
      Ensure the score reflects the prestige difference realistically, but allow for upsets.
    `;

    const data = await callOllama(prompt, settings);
    
    // Fallback for quarters if model hallucinates format
    const quarters = Array.isArray(data.quarters) && data.quarters.length >= 4 
      ? data.quarters.slice(0, 4) 
      : [0, 0, 0, 0];

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
      summary: data.summary || "The game concludes.",
      playByPlayHighlights: data.playByPlayHighlights || []
    };
  } catch (error) {
    // Quietly log error and use fallback
    console.debug("AI Simulation unavailable, using offline fallback.");
    return generateFallbackGameResult(homeTeam, awayTeam);
  }
};

export const generateWeeklyStorylines = async (
  week: number, 
  topPerformers: string[], 
  settings: AISettings
): Promise<Storyline[]> => {
  try {
    const prompt = `
      Generate 3 fictional college football news headlines and blurbs for Week ${week}.
      Top teams involved: ${topPerformers.join(', ')}.
      
      Output strictly in this JSON format (Array of objects):
      [
        {
          "id": "unique_id_string",
          "title": "Headline",
          "content": "Short paragraph description",
          "importance": "HIGH" or "MED" or "LOW",
          "tags": ["tag1", "tag2"]
        }
      ]
    `;

    const data = await callOllama(prompt, settings);
    
    if (Array.isArray(data)) {
        return data.map((item: any, index: number) => ({
            ...item,
            id: item.id || `ai-story-${Date.now()}-${index}`
        }));
    }
    return [];
  } catch (e) {
    console.debug("Storyline generation unavailable, using offline fallback.");
    return [
      { 
        id: `fallback-${week}-1`, 
        title: `Week ${week} Action Concludes`, 
        content: 'Several top teams made statements this week as conference play heats up.', 
        importance: 'MED', 
        tags: ['Season'] 
      },
      { 
        id: `fallback-${week}-2`, 
        title: 'Recruiting Battles Intensify', 
        content: 'Coaches are hitting the road to secure commitments from top 5-star prospects.', 
        importance: 'LOW', 
        tags: ['Recruiting'] 
      }
    ];
  }
};
