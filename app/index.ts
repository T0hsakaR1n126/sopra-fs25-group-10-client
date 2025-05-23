import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import userReducer from "./userSlice";
import gameReducer from "./gameSlice"; // Import your game slice reducer
import heartbeatReducer from "./heartbeatSlice"; // Import your heartbeat slice reducer

// Redux Persist configuration
const persistConfig = {
  key: "root",
  storage,
};

// Combine reducers
const rootReducer = combineReducers({
  user: userReducer, // user slice
  game: gameReducer,
  heartbeat: heartbeatReducer,
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
