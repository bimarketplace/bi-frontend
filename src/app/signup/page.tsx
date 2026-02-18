'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';

export default function Signup() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const externalError = searchParams?.get('error') || '';

  const handleGoogleSignup = async () => {
    // Redirect after sign-in to profile
    await signIn('google', { callbackUrl: '/profile' });
  };

  return (
    <div style={{ maxWidth: '480px', margin: '50px auto', padding: '20px' }}>
      <h1>Sign up</h1>
      <p>Sign up quickly using your Google account.</p>
      {externalError && <p style={{ color: 'red' }}>{externalError}</p>}
      <button
        onClick={handleGoogleSignup}
        style={{
          width: '100%',
          padding: '10px',
          backgroundColor: '#ea4335',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Sign up with Google
      </button>
    </div>
  );
}
