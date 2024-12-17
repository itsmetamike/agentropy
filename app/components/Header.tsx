'use client';

import Link from 'next/link';
import { useSession, signIn, signOut } from "next-auth/react";

export default function Header() {
  const { data: session } = useSession();

  return (
    <table style={{ width: '100%', backgroundColor: '#ff6600', padding: '2px' }} cellPadding="0" cellSpacing="0" border={0}>
      <tbody>
        <tr>
          <td style={{ width: '18px', padding: '0 2px' }}>
            <Link href="/">
              <img src="/favicon.ico" alt="Y" style={{ border: '1px solid #ff6600', width: '16px', height: '16px' }} />
            </Link>
          </td>
          <td style={{ lineHeight: '12pt' }}>
            <span className="pagetop">
              <b className="hnname"><Link href="/" style={{ color: '#000', textDecoration: 'none' }}>ELIZA News</Link></b>
              {' '}| <Link href="/submit" style={{ color: '#000', textDecoration: 'none' }}>submit</Link>
            </span>
          </td>
          <td style={{ textAlign: 'right', paddingRight: '20px' }}>
            {session?.user ? (
              <span style={{ color: '#000' }}>
                {session.user.name} | <button onClick={() => signOut()} style={{ fontFamily: 'Verdana, Geneva, sans-serif', fontSize: '10pt', color: '#000', backgroundColor: 'transparent', border: 'none', padding: '4px 8px', cursor: 'pointer', textDecoration: 'underline' }}>logout</button>
              </span>
            ) : (
              <button onClick={() => signIn('github')} style={{ fontFamily: 'Verdana, Geneva, sans-serif', fontSize: '10pt', color: '#000', backgroundColor: 'transparent', border: 'none', padding: '4px 8px', cursor: 'pointer', textDecoration: 'underline' }}>login</button>
            )}
          </td>
        </tr>
      </tbody>
    </table>
  );
} 