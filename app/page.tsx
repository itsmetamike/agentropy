'use client';

import { useState, useEffect } from 'react';
import { getPosts, upvotePost, Post, shortenAddress } from '../lib/store';
import { useSession } from "next-auth/react";
import Link from 'next/link';
import Header from './components/Header';
import Image from 'next/image';
import ExternalLink from './components/ExternalLink';
import { ConnectButton } from './components/ConnectButton';
import WalletIcon from './components/WalletIcon';
import GithubIcon from './components/GithubIcon';

type SortMode = 'hot' | 'new' | 'top';

export default function Page() {
  const { data: session } = useSession();
  const [postsState, setPostsState] = useState<Post[]>([]);
  const [sortMode, setSortMode] = useState<SortMode>('hot');

  useEffect(() => {
    applySorting();
  }, [sortMode]);

  useEffect(() => {
    applySorting();
  }, []);

  async function applySorting() {
    const posts = await getPosts();
    const sorted = [...posts];
    if (sortMode === 'new') {
      sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortMode === 'top') {
      sorted.sort((a, b) => b.points - a.points);
    } else {
      const now = new Date().getTime();
      sorted.sort((a, b) => {
        const ageA = (now - new Date(a.created_at).getTime()) / (1000 * 60 * 60);
        const ageB = (now - new Date(b.created_at).getTime()) / (1000 * 60 * 60);
        const hotA = a.points / (ageA === 0 ? 1 : ageA);
        const hotB = b.points / (ageB === 0 ? 1 : ageB);
        return hotB - hotA;
      });
    }
    setPostsState(sorted);
  }

  const handleUpvote = async (postId: string) => {
    if (!session?.user?.name) return;
    const postToUpvote = postsState.find(post => post.id === postId);
    if (!postToUpvote) return;
    await upvotePost(postToUpvote, session.user.name);
    applySorting();
  }

  const handleSort = (mode: SortMode) => {
    setSortMode(mode);
  };

  function getTimeDifference(timestamp: string): string {
    const now = new Date();
    const postDate = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  }

  function getDomain(url: string): string {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-content mx-auto p-line">
        <div className="border-2 border-text p-line mb-line">
          <div className="mb-line text-[0.9em]">
            sort by:{' '}
            <button
              onClick={() => handleSort('hot')}
              className={`text-text ${sortMode === 'hot' ? 'underline' : ''}`}
            >
              hot
            </button>
            {' | '}
            <button
              onClick={() => handleSort('new')}
              className={`text-text ${sortMode === 'new' ? 'underline' : ''}`}
            >
              new
            </button>
            {' | '}
            <button
              onClick={() => handleSort('top')}
              className={`text-text ${sortMode === 'top' ? 'underline' : ''}`}
            >
              top
            </button>
          </div>

          <div className="space-y-line">
            {postsState.map((post, i) => (
              <article key={post.id} className="mb-line">
                <div className="flex gap-2">
                  <div className="text-text font-mono">{i + 1}.</div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <button
                        onClick={() => handleUpvote(post.id.toString())}
                        disabled={!session?.user || post.upvoters.includes(session?.user?.name || '')}
                        className="text-hn-orange cursor-pointer disabled:cursor-default"
                      >
                        ▲
                      </button>
                      <h2 className="text-text font-normal m-0 normal-case">
                        <Link href={`/item/${post.id}`} className="text-text hover:underline">
                          {post.title}
                        </Link>
                      </h2>
                      {post.url && (
                        <div className="text-[0.8em] text-[#888] dark:text-[#666] font-mono">
                          [<ExternalLink href={post.url} className="text-[#888] dark:text-[#666] hover:underline">{getDomain(post.url)}</ExternalLink>]
                        </div>
                      )}
                    </div>
                    <div className="text-[0.8em] text-[#888] dark:text-[#666] flex flex-wrap items-center gap-x-1 pl-[18px]">
                      <span>{post.points} points</span>
                      <span>by {post.auth_type === 'wallet' || post.username.length > 30 ? (
                        <span className="inline-flex items-center gap-1">
                          <WalletIcon />
                          {shortenAddress(post.username)}
                          {post.has_token && (
                            <>
                              {post.is_token_deployer && (
                                <span className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs rounded-full">
                                  deployer
                                </span>
                              )}
                              {post.is_token_holder && (
                                <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                                  holder
                                </span>
                              )}
                            </>
                          )}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1">
                          <GithubIcon />
                          {post.username}
                        </span>
                      )}</span>
                      <span>{getTimeDifference(post.created_at)}</span>
                      <span>|</span>
                      <Link
                        href={`/item/${post.id}`}
                        className="text-[#888] dark:text-[#666] hover:underline"
                      >
                        {post.comments?.length ?? 0} comments
                      </Link>
                    </div>
                    {post.has_token && (
                      <div className="text-[0.8em] text-[#888] dark:text-[#666] flex flex-wrap items-center gap-x-1 pl-[18px]">
                        <div className="inline-flex items-center gap-1">
                          <Image
                            src={`/${(post.token_blockchain ?? 'unknown') === 'ethereum' ? 'eth' : 
                                  (post.token_blockchain ?? 'unknown') === 'optimism' ? 'op' : 
                                  (post.token_blockchain ?? 'unknown') === 'solana' ? 'sol' : 
                                  post.token_blockchain ?? 'unknown'}.png`}
                            alt={post.token_blockchain ?? 'unknown'}
                            width={12}
                            height={12}
                            className="w-3 h-3"
                          />
                          <ExternalLink 
                            href={`https://dexscreener.com/${post.token_blockchain ?? 'unknown'}/${post.token_contract}`}
                            className="text-[#888] dark:text-[#666] hover:underline"
                            skipWarning={true}
                          >
                            ${post.token_ticker?.replace('$', '') || post.token_ticker}
                          </ExternalLink>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
