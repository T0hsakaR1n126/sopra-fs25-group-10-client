"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { usePathname, useRouter } from "next/navigation";
import { useApi } from "./useApi";
import { clearUserState } from "@/userSlice";
import { showErrorToast } from "@/utils/showErrorToast";
import { clearGameState } from "@/gameSlice";

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const apiService = useApi();
  const dispatch = useDispatch();
  const router = useRouter();

  const noAuthRoutes = ["/", "/users/login", "/users/register"];

  useEffect(() => {
    const shouldAuth = !noAuthRoutes.includes(pathname);
    if (!shouldAuth) return;

    const token = useSelector((state: { user: { token: string } }) => state.user.token);
    if (token === undefined || token === null) {
      showErrorToast("Token not found! Back to home page...");
      dispatch(clearUserState());
      dispatch(clearGameState());
      router.push("/");
    }

    const verifyToken = async () => {
      try {
        await apiService.post("/auth", {
          token: token,
        });
      } catch (error: any) {
        let message = "Something went wrong during authentication.";
        if (error?.response?.data?.message) {
          message = error.response.data.message;
        } else if (error instanceof Error) {
          message = error.message;
        }

        showErrorToast(message);
        dispatch(clearUserState());
        dispatch(clearGameState());
        router.push("/");
      }
    };

    verifyToken();
  }, [router, apiService]);

  return <>{children}</>;
}
