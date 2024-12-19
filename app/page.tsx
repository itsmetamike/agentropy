'use client';

import { useState, useEffect } from 'react';
import { getPosts, upvotePost, Post } from '../lib/store';
import { useSession, signIn, signOut } from "next-auth/react";
import Link from 'next/link';

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
    let sorted = [...posts];
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

  function handleUpvote(i: number) {
    const postToUpvote = postsState[i];
    if (!session?.user) {
      signIn('github');
      return;
    }
    upvotePost(postToUpvote, session.user.username!);
    applySorting();
  }

  function handleDisconnect() {
    signOut();
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

  return (
    <div style={{ backgroundColor: '#f6f6ef', minHeight: '100vh', fontFamily: 'Verdana, Geneva, sans-serif', fontSize: '10pt', color: '#333' }}>
      {/* Top bar */}
      <table style={{ width: '100%', backgroundColor: '#ff6600', padding: '2px' }} cellPadding="0" cellSpacing="0" border={0}>
        <tbody>
          <tr>
            <td style={{ width: '18px', padding: '0 2px' }}>
              <a href="/" style={{ color: '#000' }}>
                <img src="/favicon.ico" alt="Y" style={{ border: '1px solid #ff6600', width: '16px', height: '16px' }} />
              </a>
            </td>
            <td style={{ lineHeight: '12pt' }}>
              <span className="pagetop">
                <b className="hnname"><a href="/" style={{ color: '#000', textDecoration: 'none' }}>ELIZA News</a></b>
                {' '}| <a href="/submit" style={{ color: '#000', textDecoration: 'none' }}>submit</a>
              </span>
            </td>
            <td style={{ textAlign: 'right', paddingRight: '20px' }}>
              {session?.user ? (
                <span style={{ color: '#000' }}>
                  {session.user.username} | <a onClick={handleDisconnect} style={{ cursor: 'pointer', color: '#000', textDecoration: 'none' }}>disconnect</a>
                </span>
              ) : (
                <span style={{ color: '#000' }}>not connected</span>
              )}
            </td>
          </tr>
        </tbody>
      </table>

      <div style={{ padding: '0 20px' }}>
        <br />
        {/* Sorting Controls */}
        <div style={{ marginBottom: '10px', fontSize: '10pt', color: '#828282' }}>
          sort by:
          {' '}<a href="#" onClick={() => setSortMode('hot')} style={{ color: sortMode === 'hot' ? '#000' : '#828282', marginLeft: '5px', textDecoration: 'none' }}>hot</a> |
          <a href="#" onClick={() => setSortMode('new')} style={{ color: sortMode === 'new' ? '#000' : '#828282', marginLeft: '5px', textDecoration: 'none' }}>new</a> |
          <a href="#" onClick={() => setSortMode('top')} style={{ color: sortMode === 'top' ? '#000' : '#828282', marginLeft: '5px', textDecoration: 'none' }}>top</a>
        </div>

        <table cellPadding={0} cellSpacing={0}>
          <tbody>
            {postsState.map((post, i) => {
              const rank = i + 1;
              const domain = getDomain(post.url);
              const link = post.url ? post.url : `/item/${post.id}`;

              return (
                <tr key={post.id}>
                  <td valign="top" style={{ textAlign: 'right', paddingRight: '5px' }}>
                    <span style={{ color: '#828282' }}>{rank}.</span>
                  </td>
                  <td valign="top">
                    {/* Upvote as a unicode arrow ↑ */}
                    <span onClick={() => handleUpvote(i)} style={{ cursor: session?.user ? 'pointer' : 'default', marginRight: '5px', color: '#828282' }}>
                      ↑
                    </span>
                  </td>
                  <td>
                    <a href={link} style={{ color: '#000', textDecoration: 'none' }}>{post.title}</a>
                    {domain && <span style={{ fontSize: '8pt', color: '#828282' }}> ({domain})</span>}
                    <br />
                    <span style={{ fontSize: '8pt', color: '#828282' }}>
                      {post.points} points by {post.username} {getTimeDifference(post.created_at)} | {' '}
                      <Link href={`/item/${post.id}`} style={{ textDecoration: 'none', color: '#828282' }}>
                        {post.comments_count === 0 ? 'discuss' : `${post.comments_count} comments`}
                      </Link>
                    </span>
                    <br /><br />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
