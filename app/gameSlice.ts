import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CurrentGame {
  gameId: string | null;
  ownerId: number | null;
  gameName: string | null;
  maxPlayersNumber: number | null;
  currentPlayersNumber: number | null;
  password?: string | null;
  startTime: string | null;
  gameStatus: string | null;
  modeType: 'SOLO' | 'ONE_VS_ONE' | 'TEAM_VS_TEAM' | null;
  accessType?: string | null;
  endTime: string | null;
  gameCreationDate: string | null;
  maxHints: number | null;
  time: number | null;
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
    setGameStartTime(state, action: PayloadAction<string | null>) {
      if (state.currentGame) {
        state.currentGame.startTime = action.payload;
      }
    },
    setGameEndTime(state, action: PayloadAction<string | null>) {
      if (state.currentGame) {
        state.currentGame.endTime = action.payload;
      }
    },
    setGameTime(state, action: PayloadAction<number | null>) { // Updated type to number | null
      if (state.currentGame) {
        state.currentGame.time = action.payload;
      }
    },
    updateCurrentPlayersNumber(state, action: PayloadAction<number>) {
      if (state.currentGame && state.currentGame.currentPlayersNumber !== null) {
        state.currentGame.currentPlayersNumber = action.payload;
      }
    },
    resetCurrentGame(state) {
      state.currentGame = null;
    },
  },
});

export const {
  setCurrentGame,
  updateGameStatus,
  setGameStartTime,
  setGameEndTime,
  setGameTime,
  updateCurrentPlayersNumber,
  resetCurrentGame,
} = gameSlice.actions;

export default gameSlice.reducer;