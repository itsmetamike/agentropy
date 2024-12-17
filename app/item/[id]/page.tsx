'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getPostById, addCommentToPost, getCurrentUserWallet, disconnectWallet } from '../../../lib/store';

export default function ItemPage() {
  const { id } = useParams() as { id: string };
  const postId = parseInt(id, 10);

  const [post, setPost] = useState(null);
  const [comment, setComment] = useState('');
  const [wallet, setWallet] = useState(getCurrentUserWallet());

  useEffect(() => {
    const fetchedPost = getPostById(postId);
    console.log('Fetching post for ID:', postId, 'Result:', fetchedPost);
    if (fetchedPost) {
      setPost(fetchedPost);
    }
  }, [postId]);

  function handleAddComment() {
    if (!wallet) {
      alert('You must be connected to comment.');
      return;
    }
    addCommentToPost(postId, comment);
    setComment('');
    setPost(getPostById(postId)); // Update post with new comments
  }

  function handleDisconnect() {
    disconnectWallet();
    setWallet(getCurrentUserWallet());
  }

  if (!post) {
    return (
      <div>
        <p>Post not found.</p>
        <a href="/" style={{ textDecoration: 'none', color: '#ff6600' }}>Go back to homepage</a>
      </div>
    );
  }

  return (
    <div>
      <h1>{post.title}</h1>
      {post.url && <a href={post.url}>{post.url}</a>}
      <p>{post.text}</p>
      <p>{post.points} points by {post.walletAddress}</p>

      <textarea value={comment} onChange={(e) => setComment(e.target.value)} />
      <button onClick={handleAddComment}>Add Comment</button>

      {post.comments?.map((c, i) => (
        <div key={i}>
          <p>{c.walletAddress} says:</p>
          <p>{c.text}</p>
        </div>
      ))}
    </div>
  );
}
