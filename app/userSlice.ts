// features/user/userSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  isLoggedIn: boolean;
  userId: string | null;
  username: string | null;
  token: string | null;
  status: string | null; // "ONLINE", "OFFLINE"
  isGuest: boolean;
  name: string | null; // Add name
  avatar: string | null; // Add avatar
  email: string | null; // Add email
  bio: string | null; // Add bio
}

const initialState: UserState = {
  isLoggedIn: false,
  userId: null,
  username: null,
  token: null,
  status: 'OFFLINE',
  isGuest: true,
  name: null,
  avatar: null,
  email: null,
  bio: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login(state, action: PayloadAction<{
      userId: string;
      username: string;
      token: string;
      status: string;
      name: string; // Include name in payload
      avatar: string | null; // Include avatar in payload
      email: string | null; // Include email in payload
      bio: string | null; // Include bio in payload
    }>) {
      state.isLoggedIn = true;
      state.username = action.payload.username;
      state.userId = action.payload.userId;
      state.token = action.payload.token;
      state.status = action.payload.status;
      state.isGuest = false;
      state.name = action.payload.name;
      state.avatar = action.payload.avatar;
      state.email = action.payload.email;
      state.bio = action.payload.bio;
    },
    logout(state) {
      // ... (rest of your logout reducer)
      state.name = null;
      state.avatar = null;
      state.email = null;
      state.bio = null;
    },
    guestLogin(state) {
      // ... (rest of your guestLogin reducer)
      state.name = `Guest User`; // Or some default
      state.avatar = null;
      state.email = null;
      state.bio = null;
    },
    updateUsername(state, action: PayloadAction<string>) {
      state.username = action.payload;
    },
    // You might also want actions to update avatar, email, bio later
    updateProfile(state, action: PayloadAction<{ name?: string; avatar?: string | null; email?: string | null; bio?: string | null }>) {
      state.name = action.payload.name !== undefined ? action.payload.name : state.name;
      state.avatar = action.payload.avatar !== undefined ? action.payload.avatar : state.avatar;
      state.email = action.payload.email !== undefined ? action.payload.email : state.email;
      state.bio = action.payload.bio !== undefined ? action.payload.bio : state.bio;
    },
  },
});

export const { login, logout, guestLogin, updateUsername, updateProfile } = userSlice.actions;
export default userSlice.reducer;