// index.ts
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import userReducer from "./userSlice";
import gameReducer from "./gameSlice";
import playerReducer from "./playerSlice"; // Import the player slice reducer
import historyReducer from "./historySlice"; // Import the history slice reducer
import lobbyReducer from "./lobbySlice"; // Import the lobby slice reducer (if you have one)

// Redux Persist configuration
const persistConfig = {
  key: "root",
  storage,
  // Optionally, you can specify which reducers to persist
  // whitelist: ['user', 'game'], // Example: only persist user and game slices
  // blacklist: ['history'], // Example: don't persist the history slice
};

// Combine reducers
const rootReducer = combineReducers({
  user: userReducer,
  game: gameReducer,
  player: playerReducer, // Include the player reducer
  history: historyReducer, // Include the history reducer
  lobby: lobbyReducer, // Include the lobby reducer (if you have one)
});

// Wrap the rootReducer with persistReducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure the store with the persisted reducer and middleware
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // required for redux-persist
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>; // Automatically infers the state shape

export default store;