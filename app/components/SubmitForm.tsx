'use client';

import { useState } from 'react';
import { useSession, signIn } from "next-auth/react";
import { useRouter } from 'next/navigation';
import { addPost, BlockchainType } from '../../lib/store';
import Header from './Header';

export default function SubmitForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [hasToken, setHasToken] = useState(false);
  const [tokenTicker, setTokenTicker] = useState('');
  const [tokenBlockchain, setTokenBlockchain] = useState<BlockchainType>('solana');
  const [tokenContract, setTokenContract] = useState('');

  const blockchains: BlockchainType[] = ['solana', 'base', 'ethereum', 'arbitrum', 'optimism'];

  const formatTokenTicker = (value: string) => {
    // Remove any existing $ and spaces
    let formatted = value.replace(/[\$\s]/g, '');
    // Convert to uppercase
    formatted = formatted.toUpperCase();
    return formatted;
  };

  const handleTokenTickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatTokenTicker(e.target.value);
    setTokenTicker(formatted);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.user?.name) {
      signIn('github');
      return;
    }
    if (!title.trim()) {
      alert('Title is required');
      return;
    }
    if (hasToken) {
      if (!tokenTicker.trim()) {
        alert('Token ticker is required when token is enabled');
        return;
      }
      if (!tokenContract.trim()) {
        alert('Contract address is required when token is enabled');
        return;
      }
    }
    
    await addPost(
      { 
        title: title.trim(), 
        url: url.trim() || undefined, 
        text: text.trim() || undefined,
        has_token: hasToken,
        token_ticker: hasToken ? `$${tokenTicker.trim()}` : undefined,
        token_blockchain: hasToken ? tokenBlockchain : undefined,
        token_contract: hasToken ? tokenContract.trim() : undefined
      },
      session.user.name
    );
    router.push('/');
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-content mx-auto p-line">
        {status === "loading" ? (
          <div className="text-text-alt">Loading...</div>
        ) : !session ? (
          <div className="space-y-line">
            <p>You must be logged in to submit.</p>
            <button 
              onClick={() => signIn('github')}
              className="bg-transparent border-none text-text cursor-pointer p-0 underline"
            >
              login
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-line">
              <div className="space-y-2">
                <label className="block text-text">title: </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 border border-text text-text font-mono"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-text">url: </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full p-2 border border-text text-text font-mono"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-text">text:</label>
                <div className="text-[0.9em] text-[#888] dark:text-[#666]">
                  Leave url blank to submit a question for discussion. If there is no url, text will appear at the top of the thread.
                </div>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full p-2 border border-text text-text font-mono h-32"
                />
              </div>
              <div className="space-y-4 pt-4 border-t border-text">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="hasToken"
                    checked={hasToken}
                    onChange={(e) => setHasToken(e.target.checked)}
                    className="border border-text bg-background-color accent-[#ff6600]"
                  />
                  <label htmlFor="hasToken" className="text-text">
                    This post is associated with a token
                  </label>
                </div>
                {hasToken && (
                  <div className="space-y-4 pl-6">
                    <div className="space-y-2">
                      <label className="block text-text">token ticker: </label>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-text-alt">$</span>
                        <input
                          type="text"
                          value={tokenTicker}
                          onChange={handleTokenTickerChange}
                          className="w-full p-2 pl-6 border border-text text-text font-mono"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-text">contract address: </label>
                      <input
                        type="text"
                        value={tokenContract}
                        onChange={(e) => setTokenContract(e.target.value)}
                        className="w-full p-2 border border-text text-text font-mono placeholder:text-[#888] dark:placeholder:text-[#666]"
                        placeholder="0x..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-text">blockchain: </label>
                      <select
                        value={tokenBlockchain}
                        onChange={(e) => setTokenBlockchain(e.target.value as BlockchainType)}
                        className="w-full p-2 border border-text text-text font-mono bg-transparent [&>option]:bg-white dark:[&>option]:bg-black [&>option]:text-black dark:[&>option]:text-white"
                      >
                        {blockchains.map(chain => (
                          <option key={chain} value={chain}>
                            {chain}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="bg-transparent border border-[#ff6600] text-[#ff6600] px-4 py-2 hover:bg-[#ff6600] hover:text-white"
                >
                  submit
                </button>
              </div>
            </form>
          </>
        )}
      </main>
    </div>
  );
}