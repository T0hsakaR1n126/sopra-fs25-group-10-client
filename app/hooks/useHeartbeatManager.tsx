import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "..";
import { useApi } from "./useApi";
import { User } from "@/types/user";
import { showSuccessToast } from "@/utils/showSuccessToast";
import { useRouter } from "next/navigation";
import { clearGameState, resetHintUsage } from "@/gameSlice";
import { resetJustLoggedIn } from "@/userSlice";

export const useHeartbeatManager = () => {
  const token = useSelector((state: RootState) => state.user.token);
  const userId = useSelector((state: RootState) => state.user.userId);
  const enabled = useSelector((state: RootState) => state.heartbeat.enabled);
  const gameId = useSelector((state: RootState) => state.game.gameId);
  const justLoggedIn = useSelector((state: RootState) => state.user.justLoggedIn);
  const dispatch = useDispatch();
  const router = useRouter();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const apiService = useApi();

  const hasReconnectedRef = useRef(false);

  useEffect(() => {
    if (!enabled || !token) return;

    intervalRef.current = setInterval(async () => {
      try {
        const response: User[] = await apiService.post(`/heartbeat/${userId}`, {});
        const user = response.find((user) => String(user.userId) === String(userId));
        if (!user) {
          dispatch(clearGameState());
        } else {
          if (!hasReconnectedRef.current && !justLoggedIn) {
            hasReconnectedRef.current = true;
            if (user.isPlayingGame) {
              showSuccessToast("You are reconnected! Redirecting to your game...");
              setTimeout(() => {
                dispatch(resetHintUsage());
                router.push(`/game/${gameId}`);
              }, 800);
            } else {
              showSuccessToast("You are reconnected! Redirecting to game hall...");
              setTimeout(() => {
                dispatch(clearGameState());
                router.push("/game");
              }, 800);
            }
          }
        }
        if (justLoggedIn) {
          dispatch(resetJustLoggedIn());
        }
      } catch (error) {
        console.error("Error sending heartbeat:", error);
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [enabled, token, userId]);
};
