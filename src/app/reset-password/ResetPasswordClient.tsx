"use client";

import AuthLayout from '@/components/auth/AuthLayout';
import PasswordInput from '@/components/auth/PasswordInput';
import { confirmPasswordReset, getAuthErrorMessage } from '@/lib/auth';
import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const uid = searchParams.get('uid') ?? '';
    const token = searchParams.get('token') ?? '';
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setErrorMessage('');

        if (!uid || !token) {
            setErrorMessage('This password reset link is invalid or incomplete.');
            return;
        }

        if (password !== confirmPassword) {
            setErrorMessage('The passwords do not match.');
            return;
        }

        setIsLoading(true);
        try {
            await confirmPasswordReset({
                uid,
                token,
                new_password1: password,
                new_password2: confirmPassword,
            });
            toast.success('Your password has been reset.');
            router.push('/auth/login?reset=true');
        } catch (error: unknown) {
            const message = getAuthErrorMessage(
                error,
                'Could not reset your password. The link may have expired.',
            );
            setErrorMessage(message);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout title="Reset Password">
            <div className="flex flex-1 flex-col pt-[6px]">
                <form onSubmit={handleSubmit}>
                    {errorMessage && (
                        <div
                            role="alert"
                            className="mb-3 rounded-[12px] border border-red-100 bg-red-50 px-3 py-2 text-[10px] leading-[14px] text-red-600"
                        >
                            {errorMessage}
                        </div>
                    )}
                    <PasswordInput
                        value={password}
                        onChange={setPassword}
                        placeholder="Enter New Password"
                        autoComplete="new-password"
                        ariaLabel="New password"
                    />
                    <div className="mt-[14px]">
                        <PasswordInput
                            value={confirmPassword}
                            onChange={setConfirmPassword}
                            placeholder="Confirm New Password"
                            autoComplete="new-password"
                            ariaLabel="Confirm new password"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="auth-primary-button mt-[22px]"
                    >
                        {isLoading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
                <Link
                    href="/auth/login"
                    className="mt-auto self-center pb-[2px] text-[9px] leading-[12px] text-[#aaa] no-underline"
                >
                    Back to Login
                </Link>
            </div>
        </AuthLayout>
    );
}

export default function ResetPasswordClient() {
    return (
        <Suspense fallback={null}>
            <ResetPasswordContent />
        </Suspense>
    );
}
