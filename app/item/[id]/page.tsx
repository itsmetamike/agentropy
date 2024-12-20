'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getPostById, addCommentToPost } from '../../../lib/store';
import { useSession, signIn } from "next-auth/react";
import { Post } from '../../../lib/store';
import Header from '../../components/Header';
import Link from 'next/link';
import Image from 'next/image';
import ExternalLink from '../../components/ExternalLink';

export default function ItemPage() {
  const { data: session } = useSession();
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
    if (!session?.user?.name) {
      signIn('github');
      return;
    }
    await addCommentToPost(id, comment, session.user.name);
    setComment('');
    const updatedPost = await getPostById(id);
    setPost(updatedPost);
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
              <span>by {post.username}</span>
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
                  {comment.username} {getTimeDifference(comment.created_at)}
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
