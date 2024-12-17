import './globals.css';
import { ReactNode } from 'react';
import { Providers } from './providers';

export const metadata = {
  title: 'ELIZA News',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: '0' }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
