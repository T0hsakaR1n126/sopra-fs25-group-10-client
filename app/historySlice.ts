// features/history/historySlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface GameHistory {
  gameType: 'SOLO' | 'ONE_VS_ONE' | 'TEAM_VS_TEAM';
  score: number;
  date: string;
  opponentId?: string;
  teamId?: string;
}

interface LearningProgress {
  country: string;
  uniqueQuestionsAnswered: number;
  correctGuesses: number;
}

interface GameResults {
  mode: 'SOLO' | 'ONE_VS_ONE' | 'TEAM_VS_TEAM';
  winningTeam: string | null;
  team1: { name: string; players?: string[]; score: number };
  team2: { name: string; players?: string[]; score: number };
}

interface HistoryState {
  gameHistory: GameHistory[];
  learningProgress: LearningProgress[];
  gameResults: GameResults | null;
}

const initialState: HistoryState = {
  gameHistory: [],
  learningProgress: [],
  gameResults: null,
};

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    addGameHistory(state, action: PayloadAction<GameHistory>) {
      state.gameHistory.push(action.payload);
    },
    updateLearningProgress(state, action: PayloadAction<LearningProgress>) {
      const existingProgress = state.learningProgress.find(
        (progress) => progress.country === action.payload.country
      );
      if (existingProgress) {
        existingProgress.uniqueQuestionsAnswered += action.payload.uniqueQuestionsAnswered;
        existingProgress.correctGuesses += action.payload.correctGuesses;
      } else {
        state.learningProgress.push(action.payload);
      }
    },
    setGameResults(state, action: PayloadAction<GameResults>) {
      state.gameResults = action.payload;
    },
    clearHistory(state) {
      state.gameHistory = [];
      state.learningProgress = [];
      state.gameResults = null;
    },
  },
});

export const { addGameHistory, updateLearningProgress, setGameResults, clearHistory } = historySlice.actions;
export default historySlice.reducer;