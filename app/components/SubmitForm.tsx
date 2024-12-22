'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addPost, BlockchainType, validateTokenStatus } from '../../lib/store';
import Header from './Header';
import { useAuth } from '@/lib/auth';
import { useWallet } from '@solana/wallet-adapter-react';

export default function SubmitForm() {
  const router = useRouter();
  const { isAuthenticated, authMethod } = useAuth();
  const { publicKey } = useWallet();
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [hasToken, setHasToken] = useState(false);
  const [tokenTicker, setTokenTicker] = useState('');
  const [tokenBlockchain, setTokenBlockchain] = useState<BlockchainType>('solana');
  const [tokenContract, setTokenContract] = useState('');
  const [claimedDeployer, setClaimedDeployer] = useState(false);
  const [claimedHolder, setClaimedHolder] = useState(false);
  const [verifiedDeployer, setVerifiedDeployer] = useState(false);
  const [verifiedHolder, setVerifiedHolder] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

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

  const handleVerifyClaims = async () => {
    if (!hasToken || !tokenContract) return;
    
    if (!publicKey) {
      setVerificationError('Connect with your wallet to verify');
      return;
    }
    
    setVerificationError(null);
    setIsVerifying(true);
    try {
      const { isDeployer, isHolder } = await validateTokenStatus(
        tokenBlockchain,
        tokenContract.trim(),
        publicKey.toBase58()
      );
      
      setVerifiedDeployer(isDeployer);
      setVerifiedHolder(isHolder);
      
      if (!isDeployer && claimedDeployer) {
        setClaimedDeployer(false);
        alert('Could not verify deployer status');
      }
      if (!isHolder && claimedHolder) {
        setClaimedHolder(false);
        alert('Could not verify holder status. Please make sure you have tokens in your wallet.');
      }
      
      if ((claimedDeployer && isDeployer) || (claimedHolder && isHolder)) {
        alert('Successfully verified your claims!');
      }
    } catch (error) {
      console.error('Error verifying token status:', error);
      if (error instanceof Error) {
        setVerificationError(error.message);
      } else {
        setVerificationError('Error verifying token status. Please try again.');
      }
      if (claimedDeployer) setClaimedDeployer(false);
      if (claimedHolder) setClaimedHolder(false);
    } finally {
      setIsVerifying(false);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!isAuthenticated) {
      alert('You must be logged in to submit');
      return;
    }

    if (authMethod === 'wallet' && !publicKey) {
      alert('Wallet not connected');
      return;
    }

    if (!title.trim()) {
      alert('Title is required');
      return;
    }

    let post = {
      title: title.trim(),
      url: url.trim() || undefined,
      text: text.trim() || undefined,
      has_token: hasToken,
      token_ticker: hasToken ? tokenTicker.trim() : undefined,
      token_blockchain: hasToken ? tokenBlockchain : undefined,
      token_contract: hasToken ? tokenContract.trim() : undefined,
      is_token_deployer: hasToken ? verifiedDeployer && claimedDeployer : undefined,
      is_token_holder: hasToken ? verifiedHolder && claimedHolder : undefined
    };

    try {
      console.log('Submitting post with wallet address:', publicKey?.toBase58());
      console.log('Post data:', post);
      await addPost(post, publicKey?.toBase58());
      router.push('/');
    } catch (error: any) {
      console.error('Error submitting post:', error);
      if (error.message) {
        alert(error.message);
      } else if (error.error?.message) {
        alert(error.error.message);
      } else {
        alert('Error submitting post. Please try again.');
      }
    }
  }

  if (!isAuthenticated) {
    return (
      <div>
        <Header />
        <div className="p-line">
          <div className="border-2 border-text p-4">
            <p>You must be logged in to submit.</p>
            <p>
              <a href="/login" className="text-[#666] hover:underline">
                login
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="p-line">
        <form onSubmit={handleSubmit} className="border-2 border-text p-4">
          <table className="w-full">
            <tbody>
              <tr>
                <td className="py-2">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="title"
                    className="w-full p-1 bg-transparent border border-[#666] text-text"
                  />
                </td>
              </tr>
              <tr>
                <td className="py-2">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="url"
                    className="w-full p-1 bg-transparent border border-[#666] text-text"
                  />
                </td>
              </tr>
              <tr>
                <td className="py-2">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="text"
                    className="w-full p-1 bg-transparent border border-[#666] text-text"
                    rows={4}
                  />
                </td>
              </tr>
              <tr>
                <td className="py-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={hasToken}
                      onChange={(e) => setHasToken(e.target.checked)}
                      className="form-checkbox"
                    />
                    <span className="text-text">has token?</span>
                  </label>
                </td>
              </tr>
              {hasToken && (
                <>
                  <tr>
                    <td className="py-2">
                      <div className="relative w-full">
                        <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-[#666]">$</span>
                        <input
                          type="text"
                          value={tokenTicker}
                          onChange={handleTokenTickerChange}
                          placeholder="token ticker (e.g., BONK)"
                          className="w-full p-1 pl-6 bg-transparent border border-[#666] text-text"
                        />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2">
                      <select
                        value={tokenBlockchain}
                        onChange={(e) => {
                          // Only allow changing if selecting Solana
                          if (e.target.value === 'solana') {
                            setTokenBlockchain(e.target.value as BlockchainType);
                          }
                        }}
                        className="w-full p-1 bg-transparent border border-[#666] text-text"
                      >
                        {blockchains.map((chain) => (
                          <option 
                            key={chain} 
                            value={chain}
                            className={chain !== 'solana' ? 'text-[#666]' : ''}
                            disabled={chain !== 'solana'}
                          >
                            {chain}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2">
                      <div className="mb-2">
                        <label className="block text-text mb-2 font-bold">Token Contract</label>
                        <input
                          type="text"
                          value={tokenContract}
                          onChange={(e) => setTokenContract(e.target.value)}
                          className="w-full p-2 border border-text text-text font-mono text-[0.9em] placeholder:text-[#888] dark:placeholder:text-[#666]"
                          placeholder="0x..."
                        />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2">
                      <div className="mt-2 mb-4">
                        <h3 className="text-text mb-3 font-bold">Token Badges</h3>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="deployer"
                              checked={claimedDeployer}
                              onChange={(e) => setClaimedDeployer(e.target.checked)}
                              className="border-text"
                            />
                            <label htmlFor="deployer" className="text-text flex items-center gap-2">
                              I am the token deployer
                              <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                                verifiedDeployer 
                                  ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200' 
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                              }`}>
                                deployer
                              </span>
                              {verifiedDeployer && (
                                <span className="text-green-600 dark:text-green-400 text-sm flex items-center gap-1">
                                  <span className="text-lg">✓</span> Verified
                                </span>
                              )}
                            </label>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="holder"
                              checked={claimedHolder}
                              onChange={(e) => setClaimedHolder(e.target.checked)}
                              className="border-text"
                            />
                            <label htmlFor="holder" className="text-text flex items-center gap-2">
                              I hold tokens from this contract
                              <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                                verifiedHolder 
                                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' 
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                              }`}>
                                holder
                              </span>
                              {verifiedHolder && (
                                <span className="text-green-600 dark:text-green-400 text-sm flex items-center gap-1">
                                  <span className="text-lg">✓</span> Verified
                                </span>
                              )}
                            </label>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleVerifyClaims}
                            disabled={isVerifying || !tokenContract}
                            className="border border-text text-text px-4 py-1 text-sm disabled:opacity-50 hover:bg-text hover:text-white dark:hover:text-black"
                          >
                            {isVerifying ? 'Verifying...' : 'Verify Claims'}
                          </button>
                          {verificationError && (
                            <span className="text-red-500 text-sm">{verificationError}</span>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                </>
              )}
              <tr>
                <td className="py-2">
                  <button
                    type="submit"
                    className="bg-hn-orange text-white px-4 py-1 rounded hover:bg-opacity-90"
                  >
                    submit
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </form>
      </div>
    </div>
  );
}