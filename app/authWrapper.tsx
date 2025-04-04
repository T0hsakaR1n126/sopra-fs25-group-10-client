"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "./";
import Navbar from "./navbar";

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const publicRoutes = ["/", "/users/login", "/users/register"];
  const isPublic = publicRoutes.includes(pathname);

  const isLoggedIn = useSelector((state: RootState) => state.user.isLoggedIn);

  useEffect(() => {
    if (!isLoggedIn && !isPublic) {
      router.push("/users/login");
    }
  }, [isLoggedIn, isPublic, router]);

  const excludeNavbar = ["/"];

  return (
    <>
      {!excludeNavbar.includes(pathname) && <Navbar />}
      {children}
    </>
  );
}
