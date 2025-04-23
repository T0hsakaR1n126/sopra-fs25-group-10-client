// features/lobby/lobbySlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LobbyGame {
  gameId: string;
  gameName: string;
  ownerName: string; // You might need to fetch this
  maxPlayersNumber: number;
  currentPlayersNumber: number;
  modeType: 'SOLO' | 'ONE_VS_ONE' | 'TEAM_VS_TEAM';
  accessType: string;
  // ... other relevant lobby info
}

interface LobbyState {
  availableGames: LobbyGame[] | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: LobbyState = {
  availableGames: null,
  isLoading: false,
  error: null,
};

const lobbySlice = createSlice({
  name: 'lobby',
  initialState,
  reducers: {
    setAvailableGames(state, action: PayloadAction<LobbyGame[]>) {
      state.availableGames = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setLoading(state) {
      state.isLoading = true;
      state.error = null;
    },
    setError(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
      state.availableGames = null;
    },
  },
});

export const { setAvailableGames, setLoading, setError } = lobbySlice.actions;
export default lobbySlice.reducer;