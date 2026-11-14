"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
    // Menu01Icon,
    Alert01Icon,
    Logout01Icon,
    CheckmarkCircle01Icon,
    PlusSignIcon,
    Home01Icon,
    Notification01Icon,
    ShoppingBag01Icon,
    ShoppingCart02Icon,
    Store01Icon,
    WhatsappIcon,
    UserCircleIcon,
    Login01Icon,
    Search01Icon,
    TruckIcon,
    Message02Icon
} from "hugeicons-react";
import { resendEmail } from "@/lib/auth";
import { Container } from './Container';

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

    // const toggleOffcanvas = () => setIsOffcanvasOpen(!isOffcanvasOpen);
    const closeOffcanvas = () => setIsOffcanvasOpen(false);

    const phoneNumber = "2349124848282";
    const message = "Hello BIMARKETPLACE Customer Service, I need assistance.";
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
    const isAuthPage = pathname.startsWith('/auth/') || pathname === '/reset-password';
    const isChatRoom = pathname.startsWith('/chat/') && pathname !== '/chat';
    const showMobileBottomNav = !isAuthPage && !isChatRoom;

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set('search', value);
        } else {
            params.delete('search');
        }
        // Always redirect to home page for search results
        router.push(`/?${params.toString()}`);
    };

    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

    useEffect(() => {
        setSearchQuery(searchParams.get('search') || '');
    }, [searchParams]);

    if (isAuthPage) return null;

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
            <header className={`fixed top-0 left-0 w-full z-50 bg-white transition-all duration-300 shadow-sm ${isLoggedIn && !isVerified ? 'mt-[40px]' : ''}`}>
                <Container className="!px-8 sm:!px-10 flex flex-col py-0">
                    <div className="flex items-center justify-between w-full gap-4">
                        <Link href="/" aria-label="BI Marketplace home" className="-ml-4 flex h-[60px] items-center hover:opacity-80 transition-opacity">
                            <Image
                                src="/assets/images/bi.png"
                                alt="BI Marketplace"
                                width={84}
                                height={84}
                                className="h-[44px] w-[44px] object-contain"
                            />
                        </Link>

                        {/* Right side actions & Menu Toggle */}
                        <div className="flex items-center gap-4 sm:gap-2">
                            {!isLoggedIn ? (
                                <Link
                                    href="/auth/signup"
                                    className="inline-flex min-h-[42px] items-center justify-center rounded-full border border-black bg-[#008000] px-5 text-sm font-semibold text-white shadow-[0_3px_0_#000] transition-transform active:translate-y-0.5"
                                >
                                    Sign Up
                                </Link>
                            ) : (
                                <div className="flex gap-6 items-center justify-end max-[639px]:w-auto max-[639px]:gap-6">
                                    <button
                                        type="button"
                                        onClick={() => setIsMobileSearchOpen((isOpen) => !isOpen)}
                                        aria-label="Search"
                                        aria-expanded={isMobileSearchOpen}
                                        className="flex w-fit items-center justify-center text-black transition-opacity hover:opacity-60"
                                    >
                                        <Search01Icon size={24} strokeWidth={1.7} />
                                    </button>
                                    <Link
                                        href="/cart"
                                        aria-label="Shopping cart"
                                        className="flex w-fit items-center justify-center text-black transition-opacity hover:opacity-60"
                                    >
                                        <ShoppingCart02Icon size={24} strokeWidth={1.7} />
                                    </Link>
                                    <Link
                                        href="/notifications"
                                        aria-label="Notifications"
                                        className="flex w-fit items-center justify-center text-black transition-opacity hover:opacity-60"
                                    >
                                        <Notification01Icon size={24} strokeWidth={1.7} />
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Search Bar (Beneath Logo/Menu) */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSearch(searchQuery);
                            setIsMobileSearchOpen(false);
                        }}
                        className={`w-full overflow-hidden transition-all duration-300 ${isMobileSearchOpen ? 'mt-3 h-auto opacity-100' : 'mt-0 h-0 opacity-0 pointer-events-none'}`}
                    >
                        <div className="relative w-full flex items-center bg-[#F3F4F6] rounded-[5px] p-[5px] transition-all">
                            <input
                                type="text"
                                placeholder="Search BI Marketplace"
                                aria-label="Search BI Marketplace"
                                autoFocus={isMobileSearchOpen}
                                className="flex-1 bg-transparent px-4 py-2 text-[14px] focus:outline-none text-gray-800 placeholder:text-gray-400 font-medium"
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                            <button
                                type="submit"
                                aria-label="Submit search"
                                className="p-[5px] rounded-[5px] text-zinc-900 hover:text-[#008000] transition-all flex items-center justify-center shrink-0"
                            >
                                <Search01Icon size={18} />
                            </button>
                        </div>
                    </form>
                </Container>
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
                        <Link href="/" onClick={closeOffcanvas} className="flex items-center gap-3 py-3 px-4 text-zinc-600 hover:text-primary-700 hover:bg-primary-50 rounded-xl transition-all font-bold">
                            <ShoppingBag01Icon size={20} />
                            Marketplace
                        </Link>
                        <Link href="/vendors" onClick={closeOffcanvas} className="flex items-center gap-3 py-3 px-4 text-zinc-600 hover:text-primary-700 hover:bg-primary-50 rounded-xl transition-all font-bold">
                            <Store01Icon size={20} />
                            Vendors
                        </Link>
                        <Link href="/logistics" onClick={closeOffcanvas} className="flex items-center gap-3 py-3 px-4 text-zinc-600 hover:text-primary-700 hover:bg-primary-50 rounded-xl transition-all font-bold">
                            <TruckIcon size={20} />
                            Logistic Service
                        </Link>
                        {isLoggedIn && (
                            <>
                                <Link href="/chat" onClick={closeOffcanvas} className="flex items-center gap-3 py-3 px-4 text-zinc-600 hover:text-primary-700 hover:bg-primary-50 rounded-xl transition-all font-bold">
                                    <Message02Icon size={20} />
                                    Messages
                                </Link>
                                <Link href="/profile" onClick={closeOffcanvas} className="flex items-center gap-3 py-3 px-4 text-zinc-600 hover:text-primary-700 hover:bg-primary-50 rounded-xl transition-all font-bold">
                                    <Store01Icon size={20} />
                                    My Store
                                </Link>
                            </>
                        )}
                        <Link href={whatsappUrl} onClick={closeOffcanvas} className="flex items-center gap-3 py-3 px-4 text-zinc-600 hover:text-primary-700 hover:bg-primary-50 rounded-xl transition-all font-bold">
                            <WhatsappIcon size={20} />
                            Contact Support
                        </Link>
                        {/* <Link href="/products" onClick={closeOffcanvas} className="block py-3 px-4 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-xl transition-all font-bold">
                            All Products
                        </Link> */}

                        <div className="border-t border-zinc-100 my-6"></div>

                        {!isLoggedIn ? (
                            <>
                                <Link href="/auth/account-type" onClick={closeOffcanvas} className="flex items-center gap-3 py-3 px-4 text-primary-950 font-bold hover:bg-primary-50 hover:text-primary-700 rounded-xl transition-all">
                                    <Login01Icon size={20} />
                                    Sign In
                                </Link>
                                <Link href="/auth/signup" onClick={closeOffcanvas} className="flex items-center justify-center gap-2 py-3 px-4 bg-[#008000] text-white rounded-xl transition-all font-bold mt-4 shadow-[0_4px_14px_0_rgba(0,128,0,0.2)] hover:bg-primary-700">
                                    <PlusSignIcon size={20} />
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

            {showMobileBottomNav && (
                <nav
                    aria-label="Primary navigation"
                    className="fixed inset-x-0 bottom-0 z-[60] border-t border-zinc-200 bg-white shadow-[0_-4px_16px_rgba(0,0,0,0.04)] md:hidden"
                    style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
                >
                    <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-2">
                        {[
                            { label: "Home", href: "/", Icon: Home01Icon, active: pathname === "/" },
                            { label: "Categories", href: "/categories", Icon: ShoppingBag01Icon, active: pathname.startsWith("/categories") },
                            { label: "Messages", href: "/chat", Icon: Message02Icon, active: pathname.startsWith("/chat") },
                            { label: "Profile", href: "/profile", Icon: UserCircleIcon, active: pathname.startsWith("/profile") },
                        ].map(({ label, href, Icon, active }) => (
                            <Link
                                key={label}
                                href={href}
                                aria-label={label}
                                aria-current={active ? "page" : undefined}
                                className={`flex h-full flex-1 flex-col items-center justify-center gap-1 text-[13px] transition-colors ${
                                    active ? "text-black" : "text-zinc-500 hover:text-zinc-800"
                                }`}
                            >
                                <span className={`flex h-9 w-[52px] items-center justify-center rounded-full transition-colors ${
                                    active ? "bg-[#008000] text-white" : "text-zinc-500"
                                }`}>
                                    <Icon size={24} strokeWidth={1.7} />
                                </span>
                                <span className="leading-none">{label}</span>
                            </Link>
                        ))}
                    </div>
                </nav>
            )}

        </>
    );
}