'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { signIn } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import dynamic from 'next/dynamic'
import WalletIcon from './WalletIcon'
import GithubIcon from './GithubIcon'
import { shortenAddress } from '@/lib/store'

const WalletMultiButtonDynamic = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then((mod) => mod.WalletMultiButton),
  { ssr: false }
)

export function ConnectButton() {
  const [showModal, setShowModal] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { isAuthenticated, user, authMethod, setAuthMethod, handleSignOut } = useAuth()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleConnect = () => {
    setShowModal(true)
  }

  const handleWalletSelect = () => {
    setAuthMethod('wallet')
    // Don't hide our modal until they actually connect
    // This way if they cancel Phantom's modal, they can still see our options
    const walletButton = document.querySelector('.wallet-adapter-button-trigger')
    if (walletButton instanceof HTMLElement) {
      walletButton.click()
    }
  }

  const handleGithubLogin = async () => {
    setShowModal(false)
    await signIn('github', { callbackUrl: window.location.href })
  }

  // Hide WalletMultiButton but keep it in DOM for functionality
  const buttonStyle = {
    position: 'absolute',
    visibility: 'hidden',
    pointerEvents: authMethod === 'wallet' ? 'auto' : 'none'
  } as const;

  return (
    <>
      {/* Keep the actual wallet button hidden but functional */}
      <div style={buttonStyle}>
        <WalletMultiButtonDynamic />
      </div>

      {!mounted ? (
        <button className="bg-transparent border-none text-[0.9em] text-[#888] dark:text-[#666] cursor-pointer p-0">
          connect
        </button>
      ) : isAuthenticated && user ? (
        <div className="flex items-center justify-center gap-2">
          <div className="flex items-center gap-1">
            {authMethod === 'wallet' ? <WalletIcon /> : <GithubIcon />}
            <span className="text-[0.9em] text-[#888] dark:text-[#666]">
              {authMethod === 'wallet' ? shortenAddress(user.name) : user.name}
            </span>
          </div>
          <button
            onClick={handleSignOut}
            className="bg-transparent border-none text-[0.9em] text-[#888] dark:text-[#666] cursor-pointer p-0"
          >
            disconnect
          </button>
        </div>
      ) : (
        <>
          <button 
            onClick={handleConnect}
            className="bg-transparent border-none text-[0.9em] text-[#888] dark:text-[#666] cursor-pointer p-0"
          >
            connect
          </button>

          {showModal && (
            <div 
              className="fixed inset-0 bg-black/50 dark:bg-white/20 flex items-center justify-center z-50"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setShowModal(false)
                }
              }}
            >
              <div className="bg-white dark:bg-black border-2 border-text p-line w-[400px]">
                <div className="mb-line">
                  <h2 className="text-text text-xl font-bold m-0 mb-2">Connect a Wallet</h2>
                  <p className="text-[#888] dark:text-[#666] text-[0.9em] m-0">Choose your preferred login method:</p>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={handleWalletSelect}
                    className="w-full flex items-center gap-2 p-2 border-2 border-text text-[0.9em] text-text hover:bg-text hover:text-white dark:hover:text-black transition-colors"
                  >
                    <WalletIcon />
                    connect with phantom
                  </button>
                  <button
                    onClick={handleGithubLogin}
                    className="w-full flex items-center gap-2 p-2 border-2 border-text text-[0.9em] text-text hover:bg-text hover:text-white dark:hover:text-black transition-colors"
                  >
                    <GithubIcon />
                    connect with github
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
