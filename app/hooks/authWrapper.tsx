"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { usePathname, useRouter } from "next/navigation";
import { useApi } from "./useApi"; 
import { clearUserState } from "@/userSlice";

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const token = useSelector((state: { user: { token: string } }) => state.user.token);
  const [authChecked, setAuthChecked] = useState(false);
  const [authFailed, setAuthFailed] = useState(false);
  const pathname = usePathname();
  const apiService = useApi();
  const dispatch = useDispatch();
  const router = useRouter(); 

  const noAuthRoutes = ["/", "/users/login", "/users/register"];
  const shouldAuth = !noAuthRoutes.includes(pathname);

  useEffect(() => {
    if (token === undefined || token === null) {
      return;
    }
    
    if (!shouldAuth) {
      setAuthChecked(true); 
      return;
    }

    if (!token) {
      setAuthFailed(true);
      setAuthChecked(true);
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await apiService.post("/auth", {
          token: token,
        });

        if (response) {
          setAuthFailed(false);
        } else {
          setAuthFailed(true);
        }
      } catch (error) {
        console.error("Auth check error", error);
        setAuthFailed(true);
      } finally {
        setAuthChecked(true);
      }
    };

    verifyToken();
  }, [token, pathname]);

  useEffect(() => {
    if (shouldAuth && authChecked && authFailed) {
      dispatch(clearUserState());
      router.push("/users/login");
    }
  }, [shouldAuth, authChecked, authFailed, dispatch, router]);

  return <>{children}</>;
}
