"use client";

import AuthDivider from '@/components/auth/AuthDivider';
import AuthLayout from '@/components/auth/AuthLayout';
import GoogleLoginButton from '@/components/auth/GoogleLoginButton';
import PasswordInput from '@/components/auth/PasswordInput';
import Link from 'next/link';
import { getAuthErrorMessage, register, resendEmail } from '@/lib/auth';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function SignupPage() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password1: '',
        password2: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [resendSeconds, setResendSeconds] = useState(45);

    useEffect(() => {
        if (status !== 'success' || resendSeconds === 0) return;

        const timer = window.setTimeout(() => {
            setResendSeconds((seconds) => Math.max(seconds - 1, 0));
        }, 1000);

        return () => window.clearTimeout(timer);
    }, [resendSeconds, status]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus('idle');
        setErrorMessage('');

        try {
            await register({
                username: formData.username,
                email: formData.email,
                password1: formData.password1,
                password2: formData.password2,
            });
            setStatus('success');
            setResendSeconds(45);
        } catch (error: unknown) {
            setStatus('error');
            const message = getAuthErrorMessage(error, 'Registration failed. Please try again.');
            setErrorMessage(message);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        setIsResending(true);
        setErrorMessage('');

        try {
            await resendEmail(formData.email);
            setResendSeconds(45);
        } catch (error: unknown) {
            const message = getAuthErrorMessage(error, 'Could not resend the verification email.');
            setErrorMessage(message);
            toast.error(message);
        } finally {
            setIsResending(false);
        }
    };

    if (status === 'success') {
        return (
            <AuthLayout title="A verification link has been sent to your email.">
                <div className="flex flex-1 flex-col items-center pt-[4px]">
                    <a
                        href={`mailto:${formData.email}`}
                        className="auth-primary-button no-underline"
                    >
                        Open Email App
                    </a>
                    {errorMessage && (
                        <p role="alert" className="mt-[10px] text-center text-[9px] leading-[14px] text-red-500">
                            {errorMessage}
                        </p>
                    )}
                    <div className="mt-[14px] min-h-[14px] text-center text-[9px] leading-[14px] text-[#aaa]">
                        {resendSeconds > 0 ? (
                            `Didn't receive the link? Resend in 0:${String(resendSeconds).padStart(2, '0')}`
                        ) : (
                            <button
                                type="button"
                                disabled={isResending}
                                onClick={handleResend}
                                className="text-[#aaa] underline disabled:opacity-60"
                            >
                                {isResending ? 'Resending...' : "Didn't receive the link? Resend"}
                            </button>
                        )}
                    </div>
                    <Link
                        href="/auth/signup"
                        className="mt-auto pb-[2px] text-[9px] leading-[12px] text-[#aaa] no-underline"
                    >
                        Back to Sign Up
                    </Link>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout title="Welcome to BI Marketplace.">
            <div className="flex flex-1 flex-col pt-[3px]">
                <form className="flex flex-col gap-[16px]" onSubmit={handleSubmit}>
                    {status === 'error' && (
                        <div
                            role="alert"
                            className="rounded-[12px] border border-red-100 bg-red-50 px-3 py-2 text-[10px] leading-[14px] text-red-600"
                        >
                            {errorMessage}
                        </div>
                    )}
                    <input
                        type="text"
                        required
                        autoComplete="username"
                        aria-label="Username"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="auth-input"
                        placeholder="Enter Username"
                    />
                    <input
                        type="email"
                        required
                        autoComplete="email"
                        aria-label="Email address"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="auth-input"
                        placeholder="Enter Email Address"
                    />
                    <PasswordInput
                        value={formData.password1}
                        onChange={(password1) => setFormData({
                            ...formData,
                            password1,
                            password2: password1,
                        })}
                        placeholder="Enter Password"
                        autoComplete="new-password"
                        ariaLabel="Password"
                    />

                    <p className="mt-[4px] px-1 text-sm leading-5 text-[#aaa]">
                        By continuing, you agree to our{' '}
                        <Link href="/terms" className="text-[#008000] underline">Terms</Link>
                        {' '}&amp;{' '}
                        <Link href="/privacy" className="text-[#008000] underline">Privacy Policy</Link>.
                    </p>

                    <button type="submit" disabled={isLoading} className="auth-primary-button -mt-[8px]">
                        {isLoading ? 'Signing Up...' : 'Sign Up'}
                    </button>
                </form>

                <div className="mt-[26px]">
                    <AuthDivider />
                    <div className="mt-[25px]">
                        <GoogleLoginButton />
                    </div>
                </div>

                <p className="mt-auto pt-8 text-center text-sm leading-5 text-[#aaa]">
                    Already have a personal account?{' '}
                    <Link href="/auth/login" className="font-semibold text-[#008000] no-underline">
                        Log In
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
}
