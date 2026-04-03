"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Menu01Icon,
    Alert01Icon,
    Logout01Icon,
    CheckmarkCircle01Icon,
    PlusSignIcon
} from "hugeicons-react";
import { resendEmail } from "@/lib/auth";

// Shared Avatar component
export const Avatar = ({ name, size = "md", variant = "primary", className = "" }: { name: string, size?: "xs" | "sm" | "md" | "lg" | "xl", variant?: "primary" | "light", className?: string }) => {
    const getInitials = (name: string) => {
        if (!name) return "?";
        return name
            .trim()
            .split(/\s+/)
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const sizeClasses = {
        xs: "w-6 h-6 text-[10px]",
        sm: "w-8 h-8 text-xs",
        md: "w-10 h-10 text-sm",
        lg: "w-16 h-16 text-xl",
        xl: "w-24 h-24 text-3xl"
    };

    const variantClasses = {
        primary: "bg-gradient-to-br from-primary-500 to-primary-700 text-white border-primary-400 font-black shadow-inner",
        light: "bg-[#f5f5f5] text-zinc-900 border-zinc-100 font-extrabold shadow-sm"
    };

    return (
        <div className={`${sizeClasses[size]} ${variantClasses[variant]} rounded-full flex items-center justify-center shrink-0 leading-none ${className}`}>
            {getInitials(name)}
        </div>
    );
};

// Shared Close icon
export const CloseIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

export default function Navbar() {
    const { data: session } = useSession();
    const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);
    const [resendStatus, setResendStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [isScrollingDown, setIsScrollingDown] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY && currentScrollY > 50) {
                setIsScrollingDown(true);
            } else if (currentScrollY < lastScrollY) {
                setIsScrollingDown(false);
            }
            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    const user = session?.user;
    const isLoggedIn = !!session;
    const isVerified = (user as any)?.is_verified ?? (user as any)?.email_verified ?? true;

    // Handle session expiry/refresh failure
    useEffect(() => {
        if (session?.error === 'RefreshAccessTokenError') {
            signOut({ callbackUrl: '/auth/login?error=session_expired' });
        }
    }, [session]);

    const handleResendEmail = async () => {
        if (!user?.email) return;
        setResendStatus('loading');
        try {
            await resendEmail(user.email);
            setResendStatus('success');
            setTimeout(() => setResendStatus('idle'), 5000);
        } catch (error) {
            setResendStatus('error');
            setTimeout(() => setResendStatus('idle'), 5000);
        }
    };

    const toggleOffcanvas = () => setIsOffcanvasOpen(!isOffcanvasOpen);
    const closeOffcanvas = () => setIsOffcanvasOpen(false);

    return (
        <>
            {/* Email Verification Banner */}
            {isLoggedIn && !isVerified && (
                <div className="fixed top-0 left-0 w-full bg-[#008000] text-white py-2 px-4 z-[60] flex items-center justify-center gap-3">
                    {resendStatus === 'success' ? (
                        <div className="flex items-center gap-2 text-green-400 animate-in fade-in duration-300">
                            <CheckmarkCircle01Icon size={18} />
                            <p className="text-[13px] font-medium text-white">Verification email sent! Please check your inbox.</p>
                        </div>
                    ) : (
                        <>
                            <Alert01Icon className="text-amber-400" size={18} />
                            <p className="text-[13px] font-medium">
                                {resendStatus === 'error' ? 'Failed to send. Try again.' : 'Please verify your email address. Check your inbox.'}
                                <button
                                    onClick={handleResendEmail}
                                    disabled={resendStatus === 'loading'}
                                    className="ml-3 text-amber-400 hover:text-amber-300 underline font-semibold transition-colors disabled:opacity-50"
                                >
                                    {resendStatus === 'loading' ? 'Sending...' : 'Resend Email'}
                                </button>
                            </p>
                        </>
                    )}
                </div>
            )}

            {/* Fixed Header */}
            <header className={`fixed top-0 left-0 w-full py-4 px-4 sm:px-8 z-50 bg-white/95 backdrop-blur-sm transition-all duration-300 ${isLoggedIn && !isVerified ? 'mt-[40px]' : ''}`}>
                <div className="w-full flex justify-between items-center mx-auto px-[20px] py-[12px]">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="text-[18px] text-primary-950 font-extrabold tracking-tighter italic hover:text-primary-600 transition-colors">
                            BIMARKETPLACE
                        </Link>

                        {isLoggedIn && (
                            <div className="hidden md:flex items-center gap-4 pl-8 border-l border-gray-200">
                                <div className="flex flex-col">
                                    <span className="text-[14px] font-bold text-gray-900 leading-tight">
                                        {user?.name || (user as any)?.username || 'User'}
                                    </span>
                                    <span className="text-[12px] text-gray-500 font-medium leading-tight">
                                        {user?.email}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-6">
                        {!isLoggedIn ? (
                            <div className="hidden sm:flex items-center gap-6">
                                <Link href="/auth/login" className="text-[14px] font-semibold text-gray-600 hover:text-primary-600 transition-colors">
                                    Sign In
                                </Link>
                                <Link href="/auth/signup" className="px-5 py-2.5 bg-[#008000] text-white text-[14px] font-bold rounded-[10px] hover:bg-primary-700 transition-all hover:scale-[1.02] shadow-[0_4px_14px_0_rgba(0,128,0,0.2)]">
                                    Register
                                </Link>
                            </div>
                        ) : (
                            <Link href="/profile" className="hidden sm:flex items-center gap-4 hover:opacity-80 transition-opacity">
                                <Avatar name={user?.name || (user as any)?.username || user?.email || ""} />
                            </Link>
                        )}
                        <div className="flex items-center gap-4 border-l border-gray-100 pl-4 ml-2">
                            {isLoggedIn && (
                                <Link
                                    href="/products/new"
                                    className="hidden sm:flex w-10 h-10 bg-[#008000] text-white rounded-full items-center justify-center hover:bg-primary-700 transition-all hover:scale-110 shadow-[0_4px_14px_0_rgba(0,128,0,0.2)] mr-2"
                                    title="Add Product"
                                >
                                    <PlusSignIcon size={22} strokeWidth={3} />
                                </Link>
                            )}
                            <button onClick={toggleOffcanvas} className="focus:outline-none group">
                                <Menu01Icon size={22} className="text-gray-500 cursor-pointer group-hover:text-primary-600 transition-colors" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Offcanvas Overlay */}
            {isOffcanvasOpen && (
                <div
                    className="fixed inset-0 bg-[#008000]/5 backdrop-blur-sm z-40 transition-opacity"
                    onClick={closeOffcanvas}
                />
            )}

            {/* Offcanvas Menu */}
            <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOffcanvasOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-6 h-full flex flex-col">
                    <div className="flex justify-between items-center mb-10">
                        <h2 className="text-xl font-black text-zinc-900">Menu</h2>
                        <button onClick={closeOffcanvas} className="p-2 hover:bg-zinc-50 rounded-full transition-colors">
                            <CloseIcon />
                        </button>
                    </div>

                    <nav className="space-y-4 flex-1">
                        <Link href="/" onClick={closeOffcanvas} className="block py-3 px-4 text-zinc-600 hover:text-primary-700 hover:bg-primary-50 rounded-xl transition-all font-bold">
                            Home Feed
                        </Link>
                        {isLoggedIn && (
                            <Link href="/profile" onClick={closeOffcanvas} className="block py-3 px-4 text-zinc-600 hover:text-primary-700 hover:bg-primary-50 rounded-xl transition-all font-bold">
                                My Profile & Listings
                            </Link>
                        )}
                        {/* <Link href="/products" onClick={closeOffcanvas} className="block py-3 px-4 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-xl transition-all font-bold">
                            All Products
                        </Link> */}

                        <div className="border-t border-zinc-100 my-6"></div>

                        {!isLoggedIn ? (
                            <>
                                <Link href="/auth/login" onClick={closeOffcanvas} className="block py-3 px-4 text-primary-950 font-bold hover:bg-primary-50 hover:text-primary-700 rounded-xl transition-all">
                                    Sign In
                                </Link>
                                <Link href="/auth/signup" onClick={closeOffcanvas} className="block py-3 px-4 bg-[#008000] text-white rounded-xl transition-all text-center font-bold mt-4 shadow-[0_4px_14px_0_rgba(0,128,0,0.2)] hover:bg-primary-700">
                                    Get Started
                                </Link>
                            </>
                        ) : (
                            <button
                                onClick={() => {
                                    signOut();
                                    closeOffcanvas();
                                }}
                                className="w-full flex items-center gap-3 py-3 px-4 text-red-500 hover:bg-red-50 rounded-xl transition-all font-bold"
                            >
                                <Logout01Icon size={18} />
                                Sign Out
                            </button>
                        )}
                    </nav>

                    <footer className="pt-6 border-t border-zinc-100">
                        {isLoggedIn ? (
                            <div className="flex items-center gap-4">
                                <Avatar name={user?.name || (user as any)?.username || user?.email || ""} />
                                <div className="overflow-hidden">
                                    <p className="text-sm font-bold text-zinc-900 truncate">{user?.name || (user as any)?.username || 'User'}</p>
                                    <p className="text-xs text-zinc-500 truncate font-medium">{user?.email}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-xs text-zinc-400 font-bold text-center tracking-wider uppercase">
                                Join BIMARKETPLACE
                            </div>
                        )}
                    </footer>
                </div>
            </div>

            {/* Mobile Floating Action Button (FAB) */}
            {isLoggedIn && (
                <div
                    className={`fixed bottom-[24px] left-1/2 -translate-x-1/2 z-[60] sm:hidden transition-all duration-300 ease-in-out ${isScrollingDown
                        ? 'opacity-0 translate-y-10 pointer-events-none'
                        : 'opacity-100 translate-y-0'
                        }`}
                >
                    <Link
                        href="/products/new"
                        className="w-14 h-14 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(16,185,129,0.4)] hover:scale-110 active:scale-95 transition-transform"
                        title="Add Product"
                    >
                        <PlusSignIcon size={28} strokeWidth={3} />
                    </Link>
                </div>
            )}
        </>
    );
}
