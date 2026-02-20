"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { verifyEmail } from '@/lib/auth';
import AuthLayout from '@/components/auth/AuthLayout';
import { CheckmarkCircle01Icon, AlertCircleIcon, Loading03Icon } from 'hugeicons-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState('');
    const key = searchParams?.get('key');

    useEffect(() => {
        const performVerification = async () => {
            if (!key) {
                setStatus('error');
                setErrorMessage('No verification key found in the URL.');
                return;
            }

            try {
                await verifyEmail(key);
                setStatus('success');
                toast.success('Email verified successfully!');
                // Redirect to login after 3 seconds
                setTimeout(() => {
                    router.push('/auth/login?verified=true');
                }, 3000);
            } catch (error: any) {
                setStatus('error');
                const msg = error.response?.data?.detail || 'Verification failed. The key may be expired or invalid.';
                setErrorMessage(msg);
                toast.error(msg);
            }
        };

        performVerification();
    }, [key, router]);

    return (
        <div className="flex flex-col items-center py-10 text-center">
            {status === 'loading' && (
                <>
                    <div className="mb-6">
                        <Loading03Icon className="animate-spin text-black" size={48} />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Verifying your email</h2>
                    <p className="text-gray-500">Please wait while we confirm your account...</p>
                </>
            )}

            {status === 'success' && (
                <>
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-6">
                        <CheckmarkCircle01Icon className="text-green-500" size={32} />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Email Verified!</h2>
                    <p className="text-gray-500 mb-8">
                        Your account is now active. You can start using BI Marketplace.
                        Redirecting you to login...
                    </p>
                    <Link
                        href="/auth/login"
                        className="w-full bg-black text-white rounded-[12px] py-3 text-sm font-semibold hover:bg-zinc-800 transition-colors shadow-lg shadow-black/10"
                    >
                        Sign in now
                    </Link>
                </>
            )}

            {status === 'error' && (
                <>
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
                        <AlertCircleIcon className="text-red-500" size={32} />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Verification Failed</h2>
                    <p className="text-red-500/80 mb-8 text-sm px-4">
                        {errorMessage}
                    </p>
                    <div className="flex flex-col gap-3 w-full">
                        <Link
                            href="/auth/signup"
                            className="w-full bg-black text-white rounded-[12px] py-3 text-sm font-semibold hover:bg-zinc-800 transition-colors"
                        >
                            Back to Register
                        </Link>
                        <Link
                            href="/"
                            className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
                        >
                            Go Home
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <AuthLayout
            title="Email Verification"
            subtitle="Securely activating your BI Marketplace account"
        >
            <Suspense fallback={
                <div className="flex justify-center py-20">
                    <Loading03Icon className="animate-spin text-black" size={32} />
                </div>
            }>
                <VerifyEmailContent />
            </Suspense>
        </AuthLayout>
    );
}
