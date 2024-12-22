import { useSession, signIn, signOut } from "next-auth/react"
import { useWallet } from '@solana/wallet-adapter-react'
import { create } from 'zustand'
import { useEffect } from 'react'

interface AuthState {
  authMethod: 'github' | 'wallet' | null
  setAuthMethod: (method: 'github' | 'wallet' | null) => void
  user: { name: string; type: 'github' | 'wallet' } | null
  setUser: (user: { name: string; type: 'github' | 'wallet' } | null) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  authMethod: null,
  setAuthMethod: (method) => set({ authMethod: method }),
  user: null,
  setUser: (user) => set({ user }),
}))

export function useAuth() {
  const { data: session, status } = useSession()
  const { connected, publicKey, disconnect } = useWallet()
  const { authMethod, setAuthMethod, setUser } = useAuthStore()

  // Keep dependencies stable by memoizing the session user
  const sessionUser = session?.user
  const walletAddress = publicKey?.toBase58()

  useEffect(() => {
    if (sessionUser && (!authMethod || authMethod === 'github')) {
      setAuthMethod('github')
      setUser({
        name: sessionUser.username || sessionUser.name || sessionUser.email?.split('@')[0] || 'Unknown',
        type: 'github'
      })
    } else if (connected && walletAddress && (!authMethod || authMethod === 'wallet')) {
      setAuthMethod('wallet')
      setUser({
        name: walletAddress.slice(0, 4) + '...' + walletAddress.slice(-4),
        type: 'wallet'
      })
    } else if (!sessionUser && !connected) {
      setAuthMethod(null)
      setUser(null)
    }
  }, [sessionUser, connected, walletAddress, authMethod])

  // Handle automatic cleanup of other auth method
  const cleanup = async () => {
    if (connected && authMethod === 'github') {
      await disconnect()
    }
    if (sessionUser && authMethod === 'wallet') {
      await signOut({ redirect: false })
    }
  }

  // Run cleanup when auth method changes
  useEffect(() => {
    cleanup()
  }, [authMethod, connected, sessionUser])

  const handleSignOut = async () => {
    if (authMethod === 'github') {
      await signOut({ redirect: false })
    } else if (authMethod === 'wallet') {
      await disconnect()
    }
    setAuthMethod(null)
    setUser(null)
  }

  const isAuthenticated = Boolean(
    (authMethod === 'github' && sessionUser) || 
    (authMethod === 'wallet' && connected)
  )

  const user = useAuthStore.getState().user

  return {
    isAuthenticated,
    user,
    authMethod,
    setAuthMethod,
    handleSignOut,
  }
}
