'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/navbar';

const excludeNavbar = ["/", "/users/login", "/users/register"];

export default function NavbarWrapper({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const hideNavbar = excludeNavbar.includes(path) || /^\/game\/[^\/]+$/.test(path);

  return (
    <>
      {!hideNavbar && <Navbar />}
      {children}
    </>
  );
}
