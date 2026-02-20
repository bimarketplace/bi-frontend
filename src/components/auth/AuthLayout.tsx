import React from 'react';
import Link from 'next/link';

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-10">
                    <Link href="/" className="text-[20px] font-bold text-black tracking-tighter">
                        BIMARKETPLACE
                    </Link>
                    <h2 className="text-2xl font-semibold text-gray-900 mt-6">{title}</h2>
                    <p className="text-gray-500 mt-2">{subtitle}</p>
                </div>

                <div className="bg-white rounded-[20px] p-8 shadow-sm border border-gray-200/50">
                    {children}
                </div>

                <p className="text-center mt-8 text-sm text-gray-500">
                    &copy; {new Date().getFullYear()} BI Marketplace. All rights reserved.
                </p>
            </div>
        </div>
    );
}
