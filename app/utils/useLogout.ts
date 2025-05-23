"use client";

import { useRouter } from "next/navigation";
import { message } from "antd";
import { useApi } from "@/hooks/useApi";
import { useDispatch, useSelector } from "react-redux"; // Import useDispatch and useSelector
import { logout } from "@/userSlice"; // Import the logout action from userSlice
import { RootState } from "../"; // Import RootState to type the useSelector hook
import { User } from "@/types/user";
import { showSuccessToast } from "./showSuccessToast";
import { disableHeartbeat } from "@/heartbeatSlice";

export const useLogout = () => {
  const router = useRouter();
  const apiService = useApi();
  const dispatch = useDispatch(); // To dispatch actions to Redux
  const messageApi = message;

  // Select the current user's data from the Redux store
  const currentUserId = useSelector((state: RootState) => state.user.userId);
  const userToken = useSelector((state: RootState) => state.user.token);

  const handleLogout = async (): Promise<void> => {
    if (!currentUserId || !userToken) {
      dispatch(disableHeartbeat());
      dispatch(logout());
      router.push("/");
      return;
    }

    try {


      // Call the API to log out the user
      // await apiService.put(`/logout/${currentUserId}`, {}, {
      await apiService.post<User>(`/logout`, { token: userToken });

      // Dispatch the logout action to reset Redux state
      dispatch(disableHeartbeat());
      setTimeout(() => {
        dispatch(logout());
      }
      , 500);

      showSuccessToast("Logged Out!");
      router.push("/");
    } catch (error) {
      messageApi.error(`Error logging out: ${String(error)}`);
    }
  };

  return handleLogout;
};
