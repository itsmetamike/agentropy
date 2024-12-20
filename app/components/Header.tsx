'use client';

import Link from 'next/link';
import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from 'react';

export default function Header() {
  const { data: session } = useSession();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check system preference on load
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
    
    // Check localStorage
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else if (storedTheme === 'light') {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <header className="p-line">
      <table className="w-full border-2 border-text">
        <tbody>
          <tr>
            <td rowSpan={4} className="border-2 border-text p-4">
              <Link href="/" className="no-underline hover:no-underline">
                <h1 className="text-4xl font-bold uppercase m-0 text-text">ELIZA News</h1>
              </Link>
              <span className="text-text-alt block">The latest AI agent news</span>
            </td>
            <th className="border-2 border-text p-2 text-center text-[0.9em]">Status</th>
            <td className="border-2 border-text p-2 w-32 whitespace-nowrap text-center">
              <div className="flex items-center justify-center gap-2">
                <div className={`w-3 h-3 rounded-full ${session?.user ? 'bg-hn-orange' : 'bg-transparent'}`}></div>
                <span className="text-[0.9em] text-[#888] dark:text-[#666]">
                  {session?.user ? 'connected' : 'disconnected'}
                </span>
              </div>
            </td>
          </tr>
          <tr>
            <th className="border-2 border-text p-2 text-center text-[0.9em]">Actions</th>
            <td className="border-2 border-text p-2 text-center bg-hn-orange">
              <Link href="/submit" className="text-[0.9em] text-white no-underline hover:underline">submit</Link>
            </td>
          </tr>
          <tr>
            <th className="border-2 border-text p-2 text-center text-[0.9em] w-24">User</th>
            <td className="border-2 border-text p-2 text-center">
              {session?.user ? (
                <span className="text-[0.9em] text-[#888] dark:text-[#666]">
                  {session.user.name}{' '}
                  <button 
                    onClick={() => signOut()} 
                    className="bg-transparent border-none text-[0.9em] text-[#888] dark:text-[#666] cursor-pointer p-0"
                  >
                    disconnect
                  </button>
                </span>
              ) : (
                <button 
                  onClick={() => signIn('github')} 
                  className="bg-transparent border-none text-[0.9em] text-[#888] dark:text-[#666] cursor-pointer p-0"
                >
                  connect
                </button>
              )}
            </td>
          </tr>
          <tr>
            <th className="border-2 border-text p-2 text-center text-[0.9em] w-24">Theme</th>
            <td className="border-2 border-text p-2 text-center">
              <button
                onClick={toggleDarkMode}
                className="bg-transparent border-none text-[0.9em] text-[#888] dark:text-[#666] cursor-pointer p-0"
              >
                {!darkMode ? 'light mode' : 'dark mode'}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </header>
  );
}