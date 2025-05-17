'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/navbar';
import { motion } from "framer-motion";
import { useEffect, useState } from 'react';

const excludeNavbar = ["/", "/users/login", "/users/register"];

export default function NavbarWrapper({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [hasShown, setHasShown] = useState(false);
  const hideNavbar = excludeNavbar.includes(path) ||
   /^\/game\/[^\/]+$/.test(path) ||
   /^\/game\/results\/.+$/.test(path) ||
   /^\/game\/start\/.+$/.test(path);

   useEffect(() => {
    if (!hideNavbar && !hasShown) {
      setHasShown(true);
    }
  }, [hideNavbar]);

  return (
    <>
      {!hideNavbar && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Navbar />
        </motion.div>
      )}
      {children}
    </>
  );
}
