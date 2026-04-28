import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

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
                    {/* <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
                        <Image 
                            src="/assets/images/bi.png" 
                            alt="BIMARKETPLACE" 
                            width={150} 
                            height={40} 
                            className="h-10 w-auto object-contain mx-auto"
                        />
                    </Link> */}
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
