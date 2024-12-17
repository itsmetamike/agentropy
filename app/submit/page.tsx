'use client';

import { useState } from 'react';
import { addPost } from '../../lib/store';
import { useRouter } from 'next/navigation';

export default function SubmitPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');

  function handleSubmit() {
    if (!title.trim()) {
      alert('Title is required');
      return;
    }
    addPost({ title: title.trim(), url: url.trim() || undefined, text: text.trim() || undefined });
    router.push('/');
  }

  return (
    <div style={{ backgroundColor: '#f6f6ef', minHeight: '100vh', fontFamily: 'Verdana, Geneva, sans-serif', fontSize: '10pt', color: '#333' }}>
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
              {/* Will show wallet address or not connected here as well. For simplicity, just show on homepage and item page */}
            </td>
          </tr>
        </tbody>
      </table>

      <div style={{ padding: '20px' }}>
        <table cellSpacing={0} cellPadding={0}>
          <tbody>
            <tr>
              <td style={{ textAlign: 'right', verticalAlign: 'top', paddingRight: '5px' }}>title</td>
              <td><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: '300px' }} /></td>
            </tr>
            <tr style={{ height: '10px' }}></tr>
            <tr>
              <td style={{ textAlign: 'right', verticalAlign: 'top', paddingRight: '5px' }}>url</td>
              <td><input type="text" value={url} onChange={(e) => setUrl(e.target.value)} style={{ width: '300px' }} /></td>
            </tr>
            <tr style={{ height: '10px' }}></tr>
            <tr>
              <td style={{ textAlign: 'right', verticalAlign: 'top', paddingRight: '5px' }}>text</td>
              <td>
                <textarea value={text} onChange={(e) => setText(e.target.value)} style={{ width: '300px', height: '100px' }}></textarea>
              </td>
            </tr>
            <tr style={{ height: '10px' }}></tr>
            <tr>
              <td></td>
              <td>
                <input type="button" value="submit" onClick={handleSubmit} style={{ padding: '4px', cursor: 'pointer' }} />
              </td>
            </tr>
          </tbody>
        </table>
        <p style={{ marginTop: '20px', fontSize: '8pt', color: '#828282' }}>
          Leave url blank to submit a question for discussion. If there is no url, the post is self-hosted.
        </p>
      </div>
    </div>
  );
}
