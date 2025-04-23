// features/user/userSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  isLoggedIn: boolean;
  userId: string | null;
  username: string | null;
  token: string | null;
  status: string | null; // "ONLINE", "OFFLINE"
  isGuest: boolean;
}

const initialState: UserState = {
  isLoggedIn: false,
  userId: null,
  username: null,
  token: null,
  status: 'OFFLINE',
  isGuest: true,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login(state, action: PayloadAction<{ username: string; userId: string; token: string; status: string }>) {
      state.isLoggedIn = true;
      state.username = action.payload.username;
      state.userId = action.payload.userId;
      state.token = action.payload.token;
      state.status = action.payload.status;
      state.isGuest = false;
    },
    logout(state) {
      state.isLoggedIn = false;
      state.userId = null;
      state.username = null;
      state.token = null;
      state.status = 'OFFLINE';
      state.isGuest = true;
    },
    guestLogin(state) {
      state.isLoggedIn = true;
      state.isGuest = true;
      state.userId = `guest-${Date.now()}`;
      state.username = `Guest ${state.userId}`;
      state.token = null;
      state.status = 'OFFLINE';
    },
    updateUsername(state, action: PayloadAction<string>) {
      state.username = action.payload;
    },
  },
});

export const { login, logout, guestLogin, updateUsername } = userSlice.actions;
export default userSlice.reducer;