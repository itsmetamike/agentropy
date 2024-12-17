'use client';

import { useState } from 'react';
import { useSession, signIn } from "next-auth/react";
import { useRouter } from 'next/navigation';
import { addPost } from '../../lib/store';
import Header from './Header';

export default function SubmitForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');

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
    addPost(
      { title: title.trim(), url: url.trim() || undefined, text: text.trim() || undefined },
      session.user.name
    );
    router.push('/');
  }

  return (
    <div style={{ backgroundColor: '#f6f6ef', minHeight: '100vh', fontFamily: 'Verdana, Geneva, sans-serif', fontSize: '10pt', color: '#333' }}>
      <Header />
      
      <div style={{ padding: '20px' }}>
        {status === "loading" ? (
          <div>Loading...</div>
        ) : !session ? (
          <div>
            <p>You must be logged in to submit.</p>
            <button 
              onClick={() => signIn('github')}
              style={{
                fontFamily: 'Verdana, Geneva, sans-serif',
                fontSize: '10pt',
                color: '#000',
                backgroundColor: 'transparent',
                border: 'none',
                padding: '4px 8px',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              login
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '10px' }}>
                <label>title: </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{ width: '500px' }}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>url: </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  style={{ width: '500px' }}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>text: </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  style={{ width: '500px', height: '100px' }}
                />
              </div>
              <div>
                <button
                  type="submit"
                  style={{
                    fontFamily: 'Verdana, Geneva, sans-serif',
                    fontSize: '10pt',
                    color: '#000',
                    backgroundColor: 'transparent',
                    border: 'none',
                    padding: '4px 8px',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  submit
                </button>
              </div>
            </form>
            
            <div style={{ marginTop: '10px', color: '#828282', fontSize: '9pt' }}>
              Leave url blank to submit a question for discussion. If there is no url, the text (if any) will appear at the top of the thread.
            </div>
          </>
        )}
      </div>
    </div>
  );
} 