// features/player/playerSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PlayerState {
  playerId: string | null;
  playerName: string | null;
  teamId: string | null;
  teamName: string | null;
  userId: string | null;
  gameId: string | null;
  score: number | null;
  token: string | null;
  isOwner: boolean | null;
  hintUsage: number | null; // Add this
}

const initialState: PlayerState = {
  playerId: null,
  playerName: null,
  teamId: null,
  teamName: null,
  userId: null,
  gameId: null,
  score: null,
  token: null,
  isOwner: null,
  hintUsage: 0, // Initialize to 0
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setCurrentPlayer(state, action: PayloadAction<PlayerState>) {
      return action.payload;
    },
    updatePlayerScore(state, action: PayloadAction<number>) {
      if (state.playerId !== null) {
        state.score = action.payload;
      }
    },
    resetCurrentPlayer(state) {
      return initialState;
    },
    setPlayerToken(state, action: PayloadAction<string | null>) {
      state.token = action.payload;
    },
    hintUsageIncrement(state) { // Add this reducer
      if (state.hintUsage !== null) {
        state.hintUsage += 1;
      }
    },
    resetHintUsage(state) { // Optional: to reset hint usage for a player
      state.hintUsage = 0;
    },
  },
});

export const {
  setCurrentPlayer,
  updatePlayerScore,
  resetCurrentPlayer,
  setPlayerToken,
  hintUsageIncrement,
  resetHintUsage,
} = playerSlice.actions;

export default playerSlice.reducer;