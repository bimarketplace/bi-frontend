"use client";

import AuthLayout from '@/components/auth/AuthLayout';
import GoogleLoginButton from '@/components/auth/GoogleLoginButton';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail01Icon, LockPasswordIcon, ViewIcon, ViewOffIcon, CheckmarkCircle01Icon, AlertCircleIcon } from 'hugeicons-react';
import { Suspense, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    useEffect(() => {
        if (searchParams?.get('verified') === 'true') {
            toast.success('Email verified successfully! You can now sign in.', {
                duration: 5000,
            });
        }
    }, [searchParams]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            const result = await signIn('credentials', {
                redirect: true,
                callbackUrl: '/',
                username: formData.email,
                password: formData.password
            });

            if (result?.error) {
                toast.error('Invalid email or password. Please try again.');
                setIsLoading(false);
            }
        } catch (err) {
            toast.error('An unexpected error occurred. Please try again later.');
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <GoogleLoginButton />

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200"></span>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">or continue with email</span>
                </div>
            </div>


            <form className="space-y-4" onSubmit={handleLogin}>
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
                    <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <Link
                            href="/auth/forgot-password"
                            className="text-xs font-semibold text-primary-950 hover:underline"
                        >
                            Forgot password?
                        </Link>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <LockPasswordIcon size={18} />
                        </div>
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-primary-600/5 focus:border-primary-600 transition-all text-sm"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                            {showPassword ? <ViewOffIcon size={18} /> : <ViewIcon size={18} />}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#008000] text-white rounded-[12px] py-3 text-sm font-semibold hover:bg-zinc-800 transition-colors shadow-lg shadow-primary-900/10 mt-2 disabled:opacity-50 flex justify-center items-center gap-2"
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : 'Sign in'}
                </button>
            </form>

            <p className="text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <Link href="/auth/signup" className="font-semibold text-primary-950 hover:underline">
                    Create account
                </Link>
            </p>
        </div>
    );
}

export default function LoginPage() {
    return (
        <AuthLayout
            title="Welcome back"
            subtitle="Enter your details to access your account"
        >
            <Suspense fallback={
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
                </div>
            }>
                <LoginContent />
            </Suspense>
        </AuthLayout>
    );
}
