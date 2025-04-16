import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { act } from 'react';

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
  scoreBoard: Map<string, number> | null; // Store the score board
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
  hintUsage: 1, // Number of hints used
  scoreBoard: null, // Store the score board
};

// Create the game slice
const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    gameStart: (state, action: PayloadAction<{ time: string; hints: Map<string, string>[]; gameId: string; scoreBoard: Map<string, number> }>) => {
      state.time = action.payload.time;
      state.hints = action.payload.hints;
      state.gameId = action.payload.gameId;
      state.scoreBoard = action.payload.scoreBoard;
      state.hintUsage = 1; // Reset hint usage when a new game starts
    },
    hintUpdate: (state, action: PayloadAction<Map<string, string>[]>) => {
      state.hints = action.payload;
    },
    hintUsageIncrement: (state) => {
      state.hintUsage += 1;
    },
    hintUsageClear: (state) => {
      state.hintUsage = 1;
    },
    
  },
});

// Export actions for use in components
export const { 
  gameStart, hintUsageIncrement, hintUpdate, hintUsageClear
} = gameSlice.actions;

export default gameSlice.reducer;
