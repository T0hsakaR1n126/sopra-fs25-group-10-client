// features/game/gameSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CurrentGame {
  gameId: string | null;
  ownerId: string | null;
  gameName: string | null;
  maxPlayersNumber: number | null;
  currentPlayersNumber: number | null;
  password?: string;
  startTime: string | null;
  gameStatus: string | null; // e.g., "CREATED", "STARTED", "FINISHED"
  modeType: 'SOLO' | 'ONE_VS_ONE' | 'TEAM_VS_TEAM' | null;
  accessType: string | null; // e.g., "public", "private"
  endTime: string | null;
  gameCreationDate: string | null;
  maxHints: number | null;
  time: string | null; // Game timer value
  // hints: Map<string, string>[] | null;
  hintUsage: number;
}

interface GameState {
  currentGame: CurrentGame | null;
}

const initialState: GameState = {
  currentGame: null,
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setCurrentGame(state, action: PayloadAction<CurrentGame | null>) {
      state.currentGame = action.payload;
    },
    updateGameStatus(state, action: PayloadAction<string>) {
      if (state.currentGame) {
        state.currentGame.gameStatus = action.payload;
      }
    },
    gameStart(state, action: PayloadAction<{ time: string; hints: Map<string, string>[] }>) {
      if (state.currentGame) {
        state.currentGame.time = action.payload.time;
        // state.currentGame.hints = action.payload.hints;
        state.currentGame.hintUsage = 0;
      }
    },
    resetCurrentGame(state) {
      state.currentGame = null;
    },
    setGameMode(state, action: PayloadAction<'SOLO' | 'ONE_VS_ONE' | 'TEAM_VS_TEAM' | null>) {
      if (state.currentGame) {
        state.currentGame.modeType = action.payload;
      }
    },
  },
});

export const {
  setCurrentGame,
  updateGameStatus,
  gameStart,
  resetCurrentGame,
  setGameMode,
} = gameSlice.actions;

export default gameSlice.reducer;