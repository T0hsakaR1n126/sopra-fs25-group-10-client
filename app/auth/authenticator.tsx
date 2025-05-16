"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { User } from "@/types/user";
import { useApi } from "@/hooks/useApi";
import { RootState } from "../"; // import RootState to type the useSelector
import { logout } from "@/userSlice"; // Assuming you have a logout action in your userSlice

const Authenticator = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const apiService = useApi();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);

  // Access token from the Redux store
  const token = useSelector((state: RootState) => state.user.token); // replace with the actual path to token in your state

  useEffect(() => {
    const authenticateUser = async () => {
      if (!token) {
        console.warn("Authentication Failed: No token in Redux store");
        dispatch(logout()); // Clear token from Redux
        router.replace("/login");
        return;
      }

      try {
        // Call your API to verify the token, assuming /auth endpoint
        const response: User = await apiService.post<User>(`/auth`, { token });

        // If authentication is successful, you can update the Redux store
        if (response) {

        }
      } catch (error) {
        if (error instanceof Error) {
          alert(`Something went wrong while authenticating:\n${error.message}`);
        } else {
          console.error("An unknown error occurred while authenticating.");
        }
        dispatch(logout()); // Clear token from Redux if authentication fails
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    // If there is no token in the store, redirect to login
    if (token) {
      authenticateUser();
    } else {
      dispatch(logout()); // Clear token from Redux if it's not in the store
      router.push("/login");
      setIsLoading(false);
    }
  }, [token, router, apiService, dispatch]);

  if (isLoading) return null; // no flash

  return <>{children}</>;
};

export default Authenticator;
