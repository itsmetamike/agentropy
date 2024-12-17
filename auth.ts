import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import type { NextAuthConfig } from "next-auth"

declare module 'next-auth' {
  interface User {
    username?: string;
  }
  
  interface Session {
    user: User & {
      username?: string;
    };
  }
}

export const config = {
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    })
  ],
  callbacks: {
    jwt({ token, profile }) {
      if (profile) {
        token.username = profile.login
      }
      return token
    },
    session({ session, token }) {
      if (session.user && token.username) {
        session.user.username = token.username as string
      }
      return session
    }
  }
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(config) 