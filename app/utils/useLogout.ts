"use client";

import { useRouter } from "next/navigation";
import { message } from "antd";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";

export const useLogout = () => {
  const router = useRouter();
  const apiService = useApi();
  const { clear: clearToken } = useLocalStorage("token", "");
  const messageApi = message; 

  const handleLogout = async (): Promise<void> => {
    const currentUserId = localStorage.getItem("currentUserId");
    const userToken = localStorage.getItem("token")?.replace(/^"|"$/g, "");

    if (!currentUserId) {
      router.push("/login");
      return;
    }

    try {
      await apiService.put(`/logout/${currentUserId}`, {}, {
        headers: { userToken: userToken || "" },
      });

      clearToken();
      localStorage.removeItem("currentUserId");

      console.log("Logged out successfully!");
      router.push("/login");
    } catch (error) {
      messageApi.error(`Error logging out: ${String(error)}`);
    }
  };

  return handleLogout;
};
