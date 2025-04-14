import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the type for our slice's state
interface GameHistory {
  gameType: string; // "solo" or "combat"
  score: number;
  date: string;
  opponentId?: string; // For combat mode, opponent info
  teamId?: string; // For team mode, team info
}

interface LearningProgress {
  country: string;
  uniqueQuestionsAnswered: number;
  correctGuesses: number;
}

interface GameResults {
  mode: "solo" | "combat";
  winningTeam: string | null;
  team1: { name: string; players?: string[]; score: number };
  team2: { name: string; players?: string[]; score: number };
}

interface GameState {
  gameId: string | null;
  gamename: string | null;
  time: string | null;
  hints: Map<string, string>[] | null;
  gameHistory: GameHistory[];
  learningProgress: LearningProgress[];
  currentGameMode: string | null; // "solo" or "combat"
  currentTeamId: string | null;
  gameResults: GameResults | null; // Store the last game result
  hintUsage: number; // Number of hints used
}

// Initial state setup for each game
const initialState: GameState = {
  gameId: null,
  gamename: null,
  time: null,
  hints: null,
  gameHistory: [],
  learningProgress: [],
  currentGameMode: null,
  currentTeamId: null,
  gameResults: null,
  hintUsage: 0, // Number of hints used
};

// Create the game slice
const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    gameStart: (state, action: PayloadAction<{ time: string; hints: Map<string, string>[] }>) => {
      state.time = action.payload.time;
      state.hints = action.payload.hints;
    },
    hintUpdate: (state, action: PayloadAction<Map<string, string>[]>) => {
      state.hints = action.payload;
    },
    hintUsageIncrement: (state) => {
      state.hintUsage += 1;
    },
    
  },
});

// Export actions for use in components
export const { 
  gameStart, hintUsageIncrement
} = gameSlice.actions;

export default gameSlice.reducer;
