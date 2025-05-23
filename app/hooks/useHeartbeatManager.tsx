import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "..";
import { useApi } from "./useApi";
import { User } from "@/types/user";
import { useRouter } from "next/navigation";
import { clearGameState } from "@/gameSlice";
import { logout } from "@/userSlice";
import { disableHeartbeat } from "@/heartbeatSlice";

export const useHeartbeatManager = () => {
  const token = useSelector((state: RootState) => state.user.token);
  const userId = useSelector((state: RootState) => state.user.userId);
  const enabled = useSelector((state: RootState) => state.heartbeat.enabled);
  const dispatch = useDispatch();
  const router = useRouter();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const apiService = useApi();

  useEffect(() => {
    if (!enabled || !token) return;

    intervalRef.current = setInterval(async () => {
      try {
        const response: User[] = await apiService.post(`/heartbeat/${userId}`, {});
        const user = response.find((user) => String(user.userId) === String(userId));
        if (!user) {
          dispatch(disableHeartbeat());
          dispatch(clearGameState());
          dispatch(logout());
          router.push("/");
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
