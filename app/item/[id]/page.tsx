'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getPostById, addCommentToPost } from '../../../lib/store';
import { useSession, signIn } from "next-auth/react";
import { Post } from '../../../lib/store';
import Header from '../../components/Header';

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
      <div style={{ backgroundColor: '#f6f6ef', minHeight: '100vh', fontFamily: 'Verdana, Geneva, sans-serif', fontSize: '10pt', color: '#333' }}>
        <Header />
        <div style={{ padding: '20px' }}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div style={{ backgroundColor: '#f6f6ef', minHeight: '100vh', fontFamily: 'Verdana, Geneva, sans-serif', fontSize: '10pt', color: '#333' }}>
        <Header />
        <div style={{ padding: '20px' }}>
          <p>Post not found.</p>
          <a href="/" style={{ textDecoration: 'none', color: '#ff6600' }}>Go back to homepage</a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f6f6ef', minHeight: '100vh', fontFamily: 'Verdana, Geneva, sans-serif', fontSize: '10pt', color: '#333' }}>
      <Header />
      <div style={{ padding: '10px' }}>
        <div style={{ marginBottom: '10px' }}>
          <h1 style={{ fontSize: '10pt', margin: '0', fontWeight: 'normal' }}>
            {post.title}
            {post.url && (
              <span style={{ fontSize: '8pt', color: '#828282', marginLeft: '5px' }}>
                (<a href={post.url} style={{ color: '#828282' }}>{getDomain(post.url)}</a>)
              </span>
            )}
          </h1>
          <div style={{ fontSize: '8pt', color: '#828282', marginTop: '3px' }}>
            {post.points} points by {post.username}
          </div>
        </div>

        {post.text && (
          <p style={{ margin: '10px 0', fontSize: '9pt' }}>{post.text}</p>
        )}

        <div style={{ marginTop: '20px' }}>
          <textarea 
            value={comment} 
            onChange={(e) => setComment(e.target.value)}
            style={{
              width: '100%',
              minHeight: '100px',
              marginBottom: '10px',
              fontFamily: 'Verdana, Geneva, sans-serif',
              fontSize: '9pt',
              padding: '5px'
            }}
          />
          <button 
            onClick={handleAddComment}
            style={{
              fontFamily: 'monospace',
              color: '#000',
              backgroundColor: '#f6f6ef',
              border: '1px solid #000',
              padding: '2px 4px',
              cursor: 'pointer'
            }}
          >
            Add Comment
          </button>
        </div>

        <div style={{ marginTop: '20px' }}>
          {post.comments?.map((c, i) => (
            <div key={i} style={{ margin: '10px 0', borderLeft: '2px solid #ff6600', paddingLeft: '10px' }}>
              <div style={{ fontSize: '8pt', color: '#828282' }}>
                {c.username} {getTimeDifference(c.created_at)}
              </div>
              <p style={{ margin: '5px 0', fontSize: '9pt' }}>{c.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
