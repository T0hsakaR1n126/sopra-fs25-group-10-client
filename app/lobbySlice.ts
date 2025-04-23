import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LobbyGame {
  ownerName: string | null;
  ownerId: number | null;
  totalScore: number | null;
  startTime: string | null;
  gameId: number;
  gameStatus: string;
  gameName: string | null;
  time: number | null;
  accessType: 'PRIVATE' | 'PUBLIC' | null;
  maxPlayersNumber: number | null;
  currentPlayersNumber: number | null;
  password?: string | null;
  modeType: 'SOLO' | 'ONE_VS_ONE' | 'TEAM_VS_TEAM' | null;
  endTime: string | null;
  maxHints: number | null;
  gameCreationDate: string | null;
  resultSummary: string | null;
  starTime: string | null;
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