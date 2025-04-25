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
  gameStarted: boolean;
  modeType: string | null; // "solo" or "combat"
  ownerId: string | null;
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
  gameStarted: false,
  modeType: null,
  time: null,
  hints: [],
  ownerId: null,
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
    gameStart: (state, action: PayloadAction<{ hints: Map<string, string>[]; gameId: string; scoreBoard: Map<string, number>, modeType: string }>) => {
      state.hints = action.payload.hints;
      state.gameId = action.payload.gameId;
      state.scoreBoard = action.payload.scoreBoard;
      state.hintUsage = 1; // Reset hint usage when a new game starts
      state.gameStarted = true; // Set gameStarted to true when the game starts
      state.modeType = action.payload.modeType; // Set the game mode type
    },

    gameTimeInitialize: (state, action: PayloadAction<string>) => {
      state.time = action.payload;
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
    scoreBoardResultSet: (state, action: PayloadAction<Map<string, number>>) => {
      state.scoreBoard = action.payload;
    },
    gameIdUpdate: (state, action: PayloadAction<string>) => {
      state.gameId = action.payload;
    },
    ownerUpdate: (state, action: PayloadAction<string>) => {
      state.ownerId = action.payload;
    },
    clearGameState: (state) => {
      state.gameId = null;
      state.gamename = null;
      state.gameStarted = false;
      state.modeType = null;
      state.time = null;
      state.hints = [];
      state.ownerId = null;
      state.gameHistory = [];
      state.learningProgress = [];
      state.currentGameMode = null;
      state.currentTeamId = null;
      state.gameResults = null;
      state.hintUsage = 1; // Reset hint usage when a new game starts
      state.scoreBoard = null; // Reset score board
    },
  },
});

// Export actions for use in components
export const { 
  gameStart, gameTimeInitialize, hintUsageIncrement, hintUpdate, hintUsageClear, scoreBoardResultSet, gameIdUpdate, ownerUpdate, clearGameState
} = gameSlice.actions;

export default gameSlice.reducer;
