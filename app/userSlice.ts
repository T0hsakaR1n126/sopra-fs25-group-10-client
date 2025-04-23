import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the type for our slice's state
interface GameHistory {
  gameType: string; // "solo" or "combat"
  score: number;
  date: string;
  opponentId?: string; // For combat mode, opponent info
  teamId?: string; // For team mode, team info
}

interface LearningProgress {
  country: string;
  uniqueQuestionsAnswered: number;
  correctGuesses: number;
}

interface GameResults {
  mode: "SOLO" | "ONE_VS_ONE" | "TEAM_V_TEAM";
  winningTeam: string | null;
  team1: { name: string; players?: string[]; score: number };
  team2: { name: string; players?: string[]; score: number };
}

interface UserState {
  isLoggedIn: boolean;
  userId: string | null; // For logged-in users
  username: string | null;
  token: string | null;
  status: string | null; // "ONLINE", "OFFLINE"
  gameHistory: GameHistory[];
  learningProgress: LearningProgress[];
  currentGameMode: string | null; // "solo" or "combat"
  currentTeamId: string | null;
  gameResults: GameResults | null; // Store the last game result
  isGuest: boolean; // To track if the user is a guest
}

// Initial state setup for both guest and registered users
const initialState: UserState = {
  isLoggedIn: false,
  userId: null,
  username: null,
  token: null,
  status: "OFFLINE",
  gameHistory: [],
  learningProgress: [],
  currentGameMode: null,
  currentTeamId: null,
  gameResults: null, // Initially, there are no results
  isGuest: true, // Initially, user is a guest
};

// Create the user slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Login action for registered users
    login(state, action: PayloadAction<{ username: string; userId: string; token: string; status: string }>) {
      state.isLoggedIn = true;
      state.username = action.payload.username;
      state.userId = action.payload.userId;
      state.token = action.payload.token;
      state.status = action.payload.status;
      state.isGuest = false;
    },
    // Logout action to reset the user state
    logout(state) {
      state.isLoggedIn = false;
      state.username = null;
      state.userId = null;
      state.token = null;
      state.status = "OFFLINE";
      state.gameHistory = [];
      state.learningProgress = [];
      state.gameResults = null; // Clear the game results
      state.isGuest = true;
      state.currentGameMode = null;
      state.currentTeamId = null;
    },
    // Guest login (temporary user)
    guestLogin(state) {
      state.isLoggedIn = true;
      state.isGuest = true;
      state.userId = `guest-${Date.now()}`; // Create a unique guest ID based on timestamp
      state.username = `Guest ${state.userId}`;
      state.token = null; // No token for guests
      state.status = "OFFLINE"; // Default status for guest
      state.gameHistory = [];
      state.learningProgress = [];
    },
    // Update the user details (username, etc.)
    updateUsername(state, action: PayloadAction<string>) {
      state.username = action.payload;
    },
    // Update the user's game mode (solo or combat)
    setCurrentGameMode(state, action: PayloadAction<string | null>) {
      state.currentGameMode = action.payload;
    },
    // Update game history
    addGameHistory(state, action: PayloadAction<GameHistory>) {
      state.gameHistory.push(action.payload);
    },
    // Update learning progress for each country
    updateLearningProgress(state, action: PayloadAction<LearningProgress>) {
      const existingProgress = state.learningProgress.find(
        (progress) => progress.country === action.payload.country
      );

      if (existingProgress) {
        // Update existing learning progress
        existingProgress.uniqueQuestionsAnswered += action.payload.uniqueQuestionsAnswered;
        existingProgress.correctGuesses += action.payload.correctGuesses;
      } else {
        // Add new country learning progress
        state.learningProgress.push(action.payload);
      }
    },
    // Set the team ID for the user (used in combat mode)
    setTeamId(state, action: PayloadAction<string | null>) {
      state.currentTeamId = action.payload;
    },
    // Set the game results (new action to store game results)
    setGameResults(state, action: PayloadAction<GameResults>) {
      state.gameResults = action.payload; // Store the game results
    },
  },
});

// Export actions for use in components
export const { 
  login, logout, guestLogin, updateUsername, setCurrentGameMode, 
  addGameHistory, updateLearningProgress, setTeamId, setGameResults 
} = userSlice.actions;

export default userSlice.reducer;
