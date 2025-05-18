'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/navbar';
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from 'react';

const excludeNavbar = ["/", "/users/login", "/users/register"];

export default function NavbarWrapper({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [shouldShow, setShouldShow] = useState(false);
  const hideNavbar = excludeNavbar.includes(path) ||
    /^\/game\/[^\/]+$/.test(path) ||
    /^\/game\/results\/.+$/.test(path) ||
    /^\/game\/start\/.+$/.test(path);

  useEffect(() => {
    setShouldShow(!hideNavbar);
    if (!hideNavbar) {
      setExit(false);
    }
  }, [path]);

  const [exit, setExit] = useState(false);
  useEffect(() => {
    const handler = () => {
      setExit(true);
    };
    window.addEventListener("navbarExit", handler);
    return () => window.removeEventListener("navbarExit", handler);
  }, []);

  return (
    <>
      <AnimatePresence>
        {shouldShow && !exit && (
          <motion.div
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Navbar />
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </>
  );
}
