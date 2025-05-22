"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function LockOverlay() {
  const [locked, setLocked] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const lock = () => setLocked(true);
    const unlock = () => setLocked(false);

    window.addEventListener("globalLock", lock);
    window.addEventListener("globalUnlock", unlock);

    return () => {
      window.removeEventListener("globalLock", lock);
      window.removeEventListener("globalUnlock", unlock);
    };
  }, []);

  useEffect(() => {
    setLocked(false);
  }, [pathname]);

  if (!locked) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 99999,
        pointerEvents: "all",
        backgroundColor: "rgba(0, 0, 0, 0)",
      }}
    />
  );
}
