import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import userReducer from "./userSlice";
import gameReducer from "./gameSlice";
import playerReducer from "./playerSlice";
import historyReducer from "./historySlice"; 
import lobbyReducer from "./lobbySlice";

// Redux Persist configuration
const persistConfig = {
  key: "root",
  storage,
  // Optionally, you can specify which reducers to persist
  // whitelist: ['user', 'game'], // Example: only persist user and game slices
  // blacklist: ['history'], // Example: don't persist the history slice
};

const rootReducer = combineReducers({
  user: userReducer,
  game: gameReducer,
  player: playerReducer,
  history: historyReducer,
  lobby: lobbyReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;

export default store;