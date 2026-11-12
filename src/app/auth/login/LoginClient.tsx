"use client";

import AuthDivider from '@/components/auth/AuthDivider';
import AuthLayout from '@/components/auth/AuthLayout';
import GoogleLoginButton from '@/components/auth/GoogleLoginButton';
import PasswordInput from '@/components/auth/PasswordInput';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    useEffect(() => {
        if (searchParams.get('verified') === 'true') {
            toast.success('Email verified successfully! You can now sign in.', {
                duration: 5000,
            });
        } else if (searchParams.get('reset') === 'true') {
            toast.success('Your password has been reset. You can now sign in.', {
                duration: 5000,
            });
        }
    }, [searchParams]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const result = await signIn('credentials', {
                redirect: false,
                username: formData.email,
                password: formData.password,
            });

            if (result?.error) {
                setError(result.error);
                toast.error(result.error);
            } else if (result?.ok) {
                router.push('/');
                router.refresh();
            }
        } catch {
            setError('An unexpected error occurred. Please try again later.');
            toast.error('An unexpected error occurred. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout title="Log into your BI account." titleAlignment="left">
            <div className="flex flex-1 flex-col pt-[12px]">
                <form className="flex flex-col" onSubmit={handleLogin}>
                    {error && (
                        <div
                            role="alert"
                            className="mb-3 rounded-[12px] border border-red-100 bg-red-50 px-3 py-2 text-[10px] leading-[14px] text-red-600"
                        >
                            {error}
                        </div>
                    )}
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
                    <div className="mt-[14px]">
                        <PasswordInput
                            value={formData.password}
                            onChange={(password) => setFormData({ ...formData, password })}
                            placeholder="Enter Password"
                            autoComplete="current-password"
                            ariaLabel="Password"
                        />
                    </div>
                    <Link
                        href="/auth/forgot-password"
                        className="mt-[5px] self-end text-[8px] leading-[10px] text-[#aaa] no-underline"
                    >
                        Forgot password?
                    </Link>
                    <button type="submit" disabled={isLoading} className="auth-primary-button mt-[22px]">
                        {isLoading ? 'Logging In...' : 'Log In'}
                    </button>
                </form>

                <div className="mt-[26px]">
                    <AuthDivider />
                    <div className="mt-[25px]">
                        <GoogleLoginButton />
                    </div>
                </div>

                <p className="mt-auto pt-8 text-center text-sm leading-5 text-[#aaa]">
                    Don&apos;t have a personal account?{' '}
                    <Link href="/auth/signup" className="font-semibold text-[#008000] no-underline">
                        Sign Up
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={null}>
            <LoginContent />
        </Suspense>
    );
}
