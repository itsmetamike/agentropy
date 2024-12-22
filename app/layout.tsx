import './globals.css';
import { ReactNode } from 'react';
import { Providers } from './providers';

export const metadata = {
  title: 'agentropy',
  icons: {
    icon: '/icon.png',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="font-mono">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
