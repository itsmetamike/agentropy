'use client';

import { SessionProvider } from 'next-auth/react';
import { WalletProvider } from './components/WalletProvider';
import { ThemeProvider } from './components/ThemeProvider';
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <SessionProvider>
        <WalletProvider>
          {children}
        </WalletProvider>
      </SessionProvider>
    </ThemeProvider>
  )
}