import { Game } from '@/types/game';
import { ApiService } from '@/api/apiService';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { showErrorToast } from "@/utils/showErrorToast";

export const handleJoinGame = async (game: Game, userId: string, apiService: ApiService, router: AppRouterInstance): Promise<void> => {
  if (game.password) {
    const password = prompt("Enter the game password:");
    if (password === null || password.trim() === "") {
      return;
    }
    game.password = password;
  } else {
    game.password = "";
  }
  try {
    await apiService.put<Game>(`/lobbyIn/${userId}`, game);
    router.push(`/game/start/${game.gameId}`);
  } catch (error) {
    if (error instanceof Error) {
      showErrorToast(`${error.message}`);
    } else {
      console.error("An unknown error occurred during game joining.");
      showErrorToast("An unknown error occurred during game joining.");
    }
  }
};
