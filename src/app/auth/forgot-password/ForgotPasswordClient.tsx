"use client";

import AuthLayout from '@/components/auth/AuthLayout';
import Link from 'next/link';
import { Mail01Icon, ArrowLeft01Icon } from 'hugeicons-react';
import { useState } from 'react';

export default function ForgotPasswordPage() {
    const [isSubmitted, setIsSubmitted] = useState(false);

    if (isSubmitted) {
        return (
            <AuthLayout
                title="Check your email"
                subtitle="We've sent a password reset link to your email address"
            >
                <div className="text-center space-y-6">
                    <div className="mx-auto w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center text-primary-950 mb-4">
                        <Mail01Icon size={32} />
                    </div>
                    <p className="text-sm text-gray-600">
                        If you don't receive the email within a few minutes, please check your spam folder.
                    </p>
                    <button
                        onClick={() => setIsSubmitted(false)}
                        className="w-full border border-gray-200 text-primary-950 rounded-[12px] py-3 text-sm font-semibold hover:bg-gray-50 transition-colors"
                    >
                        Try again
                    </button>
                    <Link
                        href="/auth/login"
                        className="flex items-center justify-center gap-2 text-sm font-semibold text-gray-500 hover:text-primary-950 transition-colors"
                    >
                        <ArrowLeft01Icon size={18} />
                        Back to login
                    </Link>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout
            title="Forgot password?"
            subtitle="No worries, we'll send you reset instructions"
        >
            <div className="space-y-6">
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setIsSubmitted(true); }}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Mail01Icon size={18} />
                            </div>
                            <input
                                type="email"
                                required
                                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-primary-600/5 focus:border-primary-600 transition-all text-sm"
                                placeholder="name@example.com"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-[#008000] text-white rounded-[12px] py-3 text-sm font-semibold hover:bg-zinc-800 transition-colors shadow-lg shadow-primary-900/10 mt-2"
                    >
                        Reset password
                    </button>
                </form>

                <Link
                    href="/auth/login"
                    className="flex items-center justify-center gap-2 text-sm font-semibold text-gray-500 hover:text-primary-950 transition-colors"
                >
                    <ArrowLeft01Icon size={18} />
                    Back to login
                </Link>
            </div>
        </AuthLayout>
    );
}
