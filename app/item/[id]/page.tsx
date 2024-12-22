'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getPostById, addCommentToPost, shortenAddress } from '../../../lib/store';
import { useSession } from "next-auth/react";
import { Post } from '../../../lib/store';
import Header from '../../components/Header';
import Link from 'next/link';
import Image from 'next/image';
import ExternalLink from '../../components/ExternalLink';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAuth } from '../../../lib/auth';
import WalletIcon from '../../components/WalletIcon';
import GithubIcon from '../../components/GithubIcon';

export default function ItemPage() {
  const { data: session } = useSession();
  const { publicKey } = useWallet();
  const { isAuthenticated, authMethod } = useAuth();
  const { id } = useParams() as { id: string };
  const [post, setPost] = useState<Post | null>(null);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);

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

  function getDomain(url?: string) {
    if (!url) return null;
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return domain;
    } catch (e) {
      return null;
    }
  }

  useEffect(() => {
    async function fetchPost() {
      setIsLoading(true);
      const fetchedPost = await getPostById(id);
      setPost(fetchedPost);
      setIsLoading(false);
    }
    fetchPost();
  }, [id]);

  async function handleAddComment() {
    if (!isAuthenticated) {
      alert('Please connect with GitHub or a wallet to comment');
      return;
    }

    if (authMethod === 'wallet' && !publicKey) {
      alert('Please connect your wallet to comment');
      return;
    }

    try {
      console.log('Adding comment with wallet address:', publicKey?.toBase58());
      await addCommentToPost(id, comment, publicKey?.toBase58());
      setComment('');
      const updatedPost = await getPostById(id);
      setPost(updatedPost);
    } catch (error: any) {
      console.error('Error adding comment:', error);
      if (error.message) {
        alert(error.message);
      } else if (error.error?.message) {
        alert(error.error.message);
      } else {
        alert('Error adding comment. Please try again.');
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <Header />
        <main className="max-w-content mx-auto p-line">
          <p className="text-text">Loading...</p>
        </main>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <Header />
        <main className="max-w-content mx-auto p-line">
          <p className="text-text mb-line">Post not found.</p>
          <Link href="/" className="text-text underline">
            Go back to homepage
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Header />
      <main className="max-w-content mx-auto p-line">
        <article className="border-2 border-text p-line mb-line">
          <header className="mb-line">
            <div className="flex items-baseline gap-2">
              <h1 className="text-text font-bold m-0">
                {post.url ? (
                  <ExternalLink href={post.url} className="text-text hover:underline">
                    {post.title}
                  </ExternalLink>
                ) : (
                  post.title
                )}
              </h1>
              {post.url && (
                <div className="text-[0.9em] text-[#888] dark:text-[#666] font-mono">
                  [<ExternalLink href={post.url} className="text-[#888] dark:text-[#666] hover:underline">{post.url}</ExternalLink>]
                </div>
              )}
            </div>
            <div className="text-[0.9em] text-[#888] dark:text-[#666] flex flex-wrap items-center gap-x-1">
              <span>{post.points} points</span>
              <span>by {post.username.startsWith('0x') || post.username.length > 30 ? (
                <>
                  {post.username.startsWith('0x') ? null : <WalletIcon />}
                  {shortenAddress(post.username)}
                </>
              ) : (
                <>
                  <GithubIcon />
                  {post.username}
                </>
              )}</span>
              {post.is_token_deployer && (
                <span className="ml-1 px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs rounded-full">
                  deployer
                </span>
              )}
              {post.is_token_holder && (
                <span className="ml-1 px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                  holder
                </span>
              )}
              <span>{getTimeDifference(post.created_at)}</span>
              {post.has_token && (
                <>
                  <span>|</span>
                  <div className="inline-flex items-center gap-1">
                    <Image
                      src={`/${post.token_blockchain === 'ethereum' ? 'eth' : 
                            post.token_blockchain === 'optimism' ? 'op' : 
                            post.token_blockchain === 'solana' ? 'sol' : 
                            post.token_blockchain}.png`}
                      alt={post.token_blockchain}
                      width={12}
                      height={12}
                      className="w-3 h-3"
                    />
                    <ExternalLink 
                      href={`https://dexscreener.com/${post.token_blockchain}/${post.token_contract}`}
                      className="text-[#888] dark:text-[#666] hover:underline"
                      skipWarning={true}
                    >
                      ${post.token_ticker.replace('$', '')}
                    </ExternalLink>
                  </div>
                </>
              )}
            </div>
          </header>
          {post.text && (
            <div className="text-text mb-line whitespace-pre-wrap">{post.text}</div>
          )}
          <div className="space-y-line">
            {post.comments?.map((comment) => (
              <div key={comment.id} className="border-2 border-text p-line">
                <div className="text-[0.9em] text-[#888] dark:text-[#666] mb-2">
                  {comment.username.startsWith('0x') || comment.username.length > 30 ? (
                    <>
                      {comment.username.startsWith('0x') ? null : <WalletIcon />}
                      {shortenAddress(comment.username)}
                    </>
                  ) : (
                    <>
                      <GithubIcon />
                      {comment.username}
                    </>
                  )} {getTimeDifference(comment.created_at)}
                </div>
                <div className="text-text whitespace-pre-wrap">{comment.text}</div>
              </div>
            ))}
            <div className="border-2 border-text p-line">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full p-2 border border-text text-text font-mono text-[0.9em] placeholder:text-[#888] dark:placeholder:text-[#666] h-32 mb-2"
              />
              <button
                onClick={handleAddComment}
                className="border border-hn-orange text-hn-orange hover:bg-hn-orange hover:text-white px-2 py-1 text-[0.9em]"
              >
                add comment
              </button>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}
