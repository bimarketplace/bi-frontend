"use client";

import AuthLayout from '@/components/auth/AuthLayout';
import Link from 'next/link';
import { getAuthErrorMessage, requestPasswordReset } from '@/lib/auth';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsLoading(true);
        setErrorMessage('');

        try {
            await requestPasswordReset(email);
            setIsSubmitted(true);
        } catch (error: unknown) {
            const message = getAuthErrorMessage(error, 'Could not send a reset link. Please try again.');
            setErrorMessage(message);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <AuthLayout title="A password reset link has been sent to your email.">
                <div className="flex flex-1 flex-col items-center pt-[4px]">
                    <a href={`mailto:${email}`} className="auth-primary-button no-underline">
                        Open Email App
                    </a>
                    <p className="mt-4 text-center text-[13px] leading-[18px] text-zinc-500">
                        Check your inbox and spam folder for the reset link.
                    </p>
                    <Link
                        href="/auth/login"
                        className="mt-auto pb-1 text-[13px] leading-[18px] text-zinc-500 no-underline"
                    >
                        Back to Login
                    </Link>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout title="Forgot Password?">
            <div className="flex flex-1 flex-col pt-[12px]">
                <form onSubmit={handleSubmit}>
                    {errorMessage && (
                        <div
                            role="alert"
                            className="mb-3 rounded-[12px] border border-red-100 bg-red-50 px-3 py-2 text-[13px] leading-[18px] text-red-600"
                        >
                            {errorMessage}
                        </div>
                    )}
                    <input
                        type="email"
                        required
                        autoComplete="email"
                        aria-label="Email address"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="auth-input"
                        placeholder="Enter Email Address"
                    />
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="auth-primary-button mt-[24px]"
                    >
                        {isLoading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>
                <Link
                    href="/auth/login"
                    className="mt-auto self-center pb-1 text-[13px] leading-[18px] text-zinc-500 no-underline"
                >
                    Back to Login
                </Link>
            </div>
        </AuthLayout>
    );
}
