'use client';

import { useSession, signIn } from "next-auth/react";
import { useEffect } from "react";
import Header from "./Header";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      signIn('github');
    }
  }, [status]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="max-w-content mx-auto p-line">
          <div className="text-text">Loading...</div>
        </main>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return <>{children}</>;
}