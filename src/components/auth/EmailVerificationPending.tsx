"use client";

import AuthLayout from '@/components/auth/AuthLayout';
import { getAuthErrorMessage, resendEmail } from '@/lib/auth';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';

interface EmailVerificationPendingProps {
    email: string;
    autoSend?: boolean;
    backHref: string;
    backLabel: string;
}

export default function EmailVerificationPending({
    email,
    autoSend = false,
    backHref,
    backLabel,
}: EmailVerificationPendingProps) {
    const [sendStatus, setSendStatus] = useState<'sending' | 'sent' | 'error'>(
        autoSend ? 'sending' : 'sent',
    );
    const [errorMessage, setErrorMessage] = useState('');
    const [resendSeconds, setResendSeconds] = useState(autoSend ? 0 : 45);
    const autoSendStarted = useRef(false);
    const requestInFlight = useRef(false);

    const sendVerificationEmail = useCallback(async () => {
        if (requestInFlight.current) return;

        requestInFlight.current = true;
        setSendStatus('sending');
        setErrorMessage('');

        try {
            await resendEmail(email);
            setSendStatus('sent');
            setResendSeconds(45);
        } catch (error: unknown) {
            const message = getAuthErrorMessage(error, 'Could not send the verification email. Please try again.');
            setErrorMessage(message);
            setSendStatus('error');
            toast.error(message);
        } finally {
            requestInFlight.current = false;
        }
    }, [email]);

    useEffect(() => {
        if (!autoSend || !email || autoSendStarted.current) return;

        autoSendStarted.current = true;
        void sendVerificationEmail();
    }, [autoSend, email, sendVerificationEmail]);

    useEffect(() => {
        if (sendStatus !== 'sent' || resendSeconds === 0) return;

        const timer = window.setTimeout(() => {
            setResendSeconds((seconds) => Math.max(seconds - 1, 0));
        }, 1000);

        return () => window.clearTimeout(timer);
    }, [resendSeconds, sendStatus]);

    const title = sendStatus === 'sending'
        ? 'Sending a verification link...'
        : sendStatus === 'error'
            ? 'We could not send the verification link.'
            : 'A verification link has been sent to your email.';

    return (
        <AuthLayout title={title}>
            <div className="flex flex-1 flex-col items-center pt-1">
                {sendStatus === 'sent' && (
                    <a
                        href={`mailto:${email}`}
                        className="auth-primary-button no-underline"
                    >
                        Open Email App
                    </a>
                )}
                {sendStatus === 'sending' && (
                    <p role="status" className="text-center text-sm leading-5 text-zinc-500">
                        Sending a verification email to your address...
                    </p>
                )}
                {sendStatus === 'error' && (
                    <p role="alert" className="text-center text-[13px] leading-[18px] text-red-600">
                        {errorMessage}
                    </p>
                )}
                <div className="mt-4 min-h-[18px] text-center text-[13px] leading-[18px] text-zinc-500">
                    {sendStatus === 'sent' && resendSeconds > 0 && (
                        `Didn't receive the link? Resend in 0:${String(resendSeconds).padStart(2, '0')}`
                    )}
                    {sendStatus === 'sent' && resendSeconds === 0 && (
                        <button
                            type="button"
                            onClick={sendVerificationEmail}
                            className="underline"
                        >
                            Didn&apos;t receive the link? Resend
                        </button>
                    )}
                    {sendStatus === 'sending' && 'Please wait...'}
                    {sendStatus === 'error' && (
                        <button
                            type="button"
                            onClick={sendVerificationEmail}
                            className="underline"
                        >
                            Try sending again
                        </button>
                    )}
                </div>
                <Link
                    href={backHref}
                    className="mt-auto pb-1 text-[13px] leading-[18px] text-zinc-500 no-underline"
                >
                    {backLabel}
                </Link>
            </div>
        </AuthLayout>
    );
}
