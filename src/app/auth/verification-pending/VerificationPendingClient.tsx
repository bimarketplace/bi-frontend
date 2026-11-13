"use client";

import EmailVerificationPending from '@/components/auth/EmailVerificationPending';
import AuthLayout from '@/components/auth/AuthLayout';
import { PENDING_VERIFICATION_EMAIL_KEY } from '@/lib/auth';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export default function VerificationPendingClient() {
    const [email, setEmail] = useState('');
    const [isReady, setIsReady] = useState(false);
    const hasReadEmail = useRef(false);

    useEffect(() => {
        if (hasReadEmail.current) return;

        hasReadEmail.current = true;
        const pendingEmail = sessionStorage.getItem(PENDING_VERIFICATION_EMAIL_KEY);
        sessionStorage.removeItem(PENDING_VERIFICATION_EMAIL_KEY);
        setEmail(pendingEmail?.trim() ?? '');
        setIsReady(true);
    }, []);

    if (!isReady) {
        return <AuthLayout title="Preparing your verification email..." />;
    }

    if (!email) {
        return (
            <AuthLayout title="Verification email unavailable">
                <div className="flex flex-1 flex-col items-center">
                    <p role="alert" className="text-center text-sm leading-5 text-zinc-500">
                        Return to sign in and try again.
                    </p>
                    <Link
                        href="/auth/login"
                        className="auth-primary-button mt-6 no-underline"
                    >
                        Back to Sign In
                    </Link>
                </div>
            </AuthLayout>
        );
    }

    return (
        <EmailVerificationPending
            email={email}
            autoSend
            backHref="/auth/login"
            backLabel="Back to Sign In"
        />
    );
}
