"use client";

import AuthLayout from '@/components/auth/AuthLayout';
import GoogleLoginButton from '@/components/auth/GoogleLoginButton';
import Link from 'next/link';
import { register } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { Mail01Icon, LockPasswordIcon, UserIcon, CheckmarkCircle01Icon, AlertCircleIcon } from 'hugeicons-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function SignupPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password1: '',
        password2: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus('idle');

        try {
            await register({
                username: formData.username,
                email: formData.email,
                password1: formData.password1,
                password2: formData.password1
            });
            setStatus('success');
            toast.success('Account created successfully! Check your email.', {
                duration: 5000,
            });
            setTimeout(() => {
                router.push('/auth/login');
            }, 3000);
        } catch (error: any) {
            setStatus('error');
            const msg = error.response?.data?.detail || 'Registration failed. Please try again.';
            setErrorMessage(msg);
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    if (status === 'success') {
        return (
            <AuthLayout title="Account created!" subtitle="We've sent a verification link to your email.">
                <div className="flex flex-col items-center py-6 text-center">
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                        <CheckmarkCircle01Icon className="text-green-500" size={32} />
                    </div>
                    <p className="text-gray-600 mb-6">
                        Registration successful! Please check your inbox and verify your email to get started.
                        Redirecting to login...
                    </p>
                    <Link href="/auth/login" className="text-sm font-semibold text-primary-950 underline">
                        Go to login now
                    </Link>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout
            title="Create an account"
            subtitle="Join BI Marketplace to start trading"
        >
            <div className="space-y-6">
                <GoogleLoginButton />

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-200"></span>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">or sign up with email</span>
                    </div>
                </div>

                {status === 'error' && (
                    <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-4 rounded-[12px] flex items-start gap-3">
                        <AlertCircleIcon size={18} className="mt-0.5 shrink-0" />
                        <p>{errorMessage}</p>
                    </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <UserIcon size={18} />
                            </div>
                            <input
                                type="text"
                                required
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-primary-600/5 focus:border-primary-600 transition-all text-sm"
                                placeholder="johndoe"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Mail01Icon size={18} />
                            </div>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-primary-600/5 focus:border-primary-600 transition-all text-sm"
                                placeholder="name@example.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <LockPasswordIcon size={18} />
                            </div>
                            <input
                                type="password"
                                required
                                value={formData.password1}
                                onChange={(e) => setFormData({ ...formData, password1: e.target.value, password2: e.target.value })}
                                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-primary-600/5 focus:border-primary-600 transition-all text-sm"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <p className="text-[11px] text-gray-500 leading-relaxed px-1">
                        By creating an account, you agree to our{' '}
                        <Link href="/terms" className="underline hover:text-primary-950 transition-colors">Terms of Service</Link>{' '}
                        and{' '}
                        <Link href="/privacy" className="underline hover:text-primary-950 transition-colors">Privacy Policy</Link>.
                    </p>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary-600 text-white rounded-[12px] py-3 text-sm font-semibold hover:bg-zinc-800 transition-colors shadow-lg shadow-primary-900/10 mt-2 disabled:opacity-50 flex justify-center items-center gap-2"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : 'Create account'}
                    </button>
                    <p className="text-[11px] text-gray-400 text-center mt-2 italic">
                        * You will need to verify your email address after registration.
                    </p>
                </form>

                <p className="text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link href="/auth/login" className="font-semibold text-primary-950 hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
}
