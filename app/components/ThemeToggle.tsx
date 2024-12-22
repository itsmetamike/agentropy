'use client';

import { useTheme } from './ThemeProvider';

export function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();
  
  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <button className="bg-transparent border-none text-[0.9em] text-[#888] dark:text-[#666] cursor-pointer p-0">
        loading...
      </button>
    );
  }
  
  return (
    <button
      onClick={toggleTheme}
      className="bg-transparent border-none text-[0.9em] text-[#888] dark:text-[#666] cursor-pointer p-0"
    >
      {theme === 'light' ? 'light mode' : 'dark mode'}
    </button>
  );
}
