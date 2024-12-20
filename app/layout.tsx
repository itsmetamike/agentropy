import './globals.css';
import { ReactNode } from 'react';
import { Providers } from './providers';

export const metadata = {
  title: 'ELIZA News',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="bg-bg text-text">
      <body className="font-mono">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
