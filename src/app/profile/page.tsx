'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h1>Profile</h1>
      <p>Welcome, {session?.user?.username || 'User'}</p>
      {session?.access_token && <p>✓ Authenticated</p>}
      
      <button
        onClick={() => signOut({ callbackUrl: '/login' })}
        style={{
          padding: '10px 20px',
          backgroundColor: '#ff4757',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginTop: '20px',
        }}
      >
        Logout
      </button>
    </div>
  );
}
