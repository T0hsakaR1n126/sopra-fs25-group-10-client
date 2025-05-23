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
  gameCode: string | null;
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
  answer: string | null; // Store the answer
  playersNumber: number | null; // Store the number of players
  questionCount: number; //Keeps individual user score
  correctCount: number; //keeps correct answers of individual user
  lastSubmitTime: number,
  guessTimeList: number[],
}

// Initial state setup for each game
const initialState: GameState = {
  gameId: null,
  gameCode: null,
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
  answer: null, // Store the answer
  playersNumber: null, // Store the number of players
  questionCount: 0,
  correctCount: 0,
  lastSubmitTime: 0,
  guessTimeList: [],
};

// Create the game slice
const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    gameInitialize: (state, action: PayloadAction<GameState>) => {
      state.gameId = action.payload.gameId;
      state.gameCode = action.payload.gameCode;
      state.gamename = action.payload.gamename;
      state.gameStarted = action.payload.gameStarted;
      state.modeType = action.payload.modeType;
      state.time = action.payload.time;
      state.playersNumber = action.payload.playersNumber;
    },

    gameStart: (state, action: PayloadAction<{ hints: Map<string, string>[]; gameId: string; scoreBoard: Map<string, number>, modeType: string, answer: string }>) => {
      state.hints = action.payload.hints;
      state.gameId = action.payload.gameId;
      state.scoreBoard = action.payload.scoreBoard;
      state.hintUsage = 1; // Reset hint usage when a new game starts
      state.gameStarted = true; // Set gameStarted to true when the game starts
      state.modeType = action.payload.modeType; // Set the game mode type
      state.answer = action.payload.answer; // Reset the answer when the game starts
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

    clearGameState: () => initialState,

    answerUpdate: (state, action: PayloadAction<string>) => {
      state.answer = action.payload;
    },

    incrementQuestionCount: (state) => {
      state.questionCount += 1;
    },

    incrementCorrectCount: (state) => {
      state.correctCount += 1;
    },

    resetQuestionStats: (state) => {
      state.questionCount = 0;
      state.correctCount = 0;
      state.lastSubmitTime = 0;
      state.guessTimeList = [];
    },

    setLastSubmitTime: (state, action) => {
      state.lastSubmitTime = action.payload;
    },
    collectGuessTime: (state, action) => {
      state.guessTimeList.push(action.payload);
    },
    resetHintUsage: (state) => {
      state.hintUsage = 1; // Reset hint usage when a new game starts
    },
  },
});

// Export actions for use in components
export const {
  gameStart, gameInitialize, gameTimeInitialize, hintUsageIncrement, hintUpdate, hintUsageClear,
  scoreBoardResultSet, gameIdUpdate, ownerUpdate, clearGameState, answerUpdate,
  incrementQuestionCount, incrementCorrectCount, resetQuestionStats, setLastSubmitTime, collectGuessTime
  , resetHintUsage
} = gameSlice.actions;

export default gameSlice.reducer;
