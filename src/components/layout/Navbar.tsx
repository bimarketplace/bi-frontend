"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
    Menu01Icon,
    Alert01Icon,
    Logout01Icon,
    CheckmarkCircle01Icon,
    PlusSignIcon,
    Notification03Icon,
    FavouriteIcon,
    ShoppingBag01Icon,
    Store01Icon,
    WhatsappIcon,
    UserCircleIcon,
    Login01Icon,
    Search02Icon,
    ArrowDown01Icon,
    ArrowRight01Icon,
    Briefcase02Icon,
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
        primary: "bg-[#F5F5F5] text-zinc-800 font-bold",
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
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
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

    const phoneNumber = "2349124848282";
    const message = "Hello BIMARKETPLACE Customer Service, I need assistance.";
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

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

    const isHomePage = pathname === '/';
    const [showSearch, setShowSearch] = useState(!isHomePage);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const isSearchablePage = pathname === '/' || pathname === '/vendors' || pathname.startsWith('/vendors/') || pathname.startsWith('/products');

    useEffect(() => {
        const handleScroll = () => {
            if (isHomePage) {
                if (window.scrollY > 350) {
                    setShowSearch(true);
                } else {
                    setShowSearch(false);
                    setIsMobileSearchOpen(false); // Close mobile search if scrolled back up
                }
            } else {
                setShowSearch(true);
            }
        };
        
        // Initial check
        handleScroll();
        
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isHomePage]);

    useEffect(() => {
        setSearchQuery(searchParams.get('search') || '');
    }, [searchParams]);

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
            <header className={`fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-sm transition-all duration-300 ${isLoggedIn && !isVerified ? 'mt-[40px]' : ''}`}>
                <Container className="flex flex-col py-3 md:py-4">
                    <div className="flex items-center justify-between w-full gap-4">
                        <div className="flex items-center gap-4 lg:gap-8 flex-1">
                            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0">
                                <Image 
                                    src="/assets/images/bi.png" 
                                    alt="BIMARKETPLACE" 
                                    width={200} 
                                    height={120} 
                                    className="h-8 w-auto object-contain"
                                />
                                <span className="text-[#008102] text-sm font-medium">BIMARKETPLACE</span>
                            </Link>

                            {/* Header Search Bar (Desktop) - After Logo */}
                            {isSearchablePage && (
                                <form 
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        handleSearch(searchQuery);
                                    }}
                                    className={`hidden md:flex flex-1 max-w-[280px] lg:max-w-md xl:max-w-[500px] transition-all duration-500 overflow-hidden ${showSearch ? 'opacity-100 translate-x-0 w-full ml-4' : 'opacity-0 -translate-x-4 w-0 ml-0 pointer-events-none'}`}
                                >
                                    <div className="relative w-full flex items-center bg-[#F3F4F6] rounded-full p-[6px] transition-all hover:bg-gray-200/80">
                                        <input
                                            type="text"
                                            placeholder="Search BI Marketplace"
                                            className="flex-1 bg-transparent px-4 py-1 text-[14px] focus:outline-none text-gray-800 placeholder:text-gray-400 font-medium min-w-[120px]"
                                            value={searchQuery}
                                            onChange={(e) => handleSearch(e.target.value)}
                                        />
                                        <button 
                                            type="submit"
                                            className="h-[36px] w-[36px] bg-[#008000] text-white rounded-full hover:bg-green-700 transition-all hover:scale-105 active:scale-95 flex items-center justify-center shrink-0 shadow-sm"
                                        >
                                            <Search02Icon size={18} />
                                        </button>
                                    </div>
                                </form>
                            )}

                            <div className={`hidden lg:flex items-center gap-6 shrink-0 transition-all duration-500 ${!showSearch ? 'ml-4 lg:ml-8' : 'ml-0'}`}>
                            {/* Marketplace Mega Menu */}
                            <div className="relative group">
                                <button className="flex items-center gap-1 text-[15px] font-semibold text-gray-800 hover:text-[#008000] py-2 transition-colors">
                                    Marketplace
                                    <ArrowDown01Icon size={14} className="group-hover:rotate-180 transition-transform duration-200" />
                                </button>
                                {/* Mega Menu Panel */}
                                <div className="absolute top-[100%] left-0 pt-4 w-[750px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                                    <div className="bg-white border border-gray-100 rounded-2xl shadow-2xl p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 flex gap-8">
                                        
                                        {/* Products Column */}
                                        <div className="flex-1">
                                            <h3 className="text-xs font-semibold text-black uppercase tracking-wider mb-5 flex items-center gap-2">
                                                <ShoppingBag01Icon size={16} /> Products
                                            </h3>
                                            <div className="space-y-4">
                                                <Link href="/products?category=electronics" className="group/link flex flex-col">
                                                    <span className="text-[14px] font-bold text-gray-900 group-hover/link:text-[#008000] transition-colors">Electronics & Gadgets</span>
                                                    <span className="text-[12px] text-gray-500 font-medium mt-0.5">Phones, Laptops, Accessories</span>
                                                </Link>
                                                <Link href="/products?category=fashion" className="group/link flex flex-col">
                                                    <span className="text-[14px] font-bold text-gray-900 group-hover/link:text-[#008000] transition-colors">Fashion & Apparel</span>
                                                    <span className="text-[12px] text-gray-500 font-medium mt-0.5">Clothing, Shoes, Jewelry</span>
                                                </Link>
                                                <Link href="/products?category=home" className="group/link flex flex-col">
                                                    <span className="text-[14px] font-bold text-gray-900 group-hover/link:text-[#008000] transition-colors">Home & Kitchen</span>
                                                    <span className="text-[12px] text-gray-500 font-medium mt-0.5">Furniture, Decor, Appliances</span>
                                                </Link>
                                                <Link href="/products" className="inline-flex items-center gap-1 text-[13px] font-bold text-[#008000] hover:underline mt-2">
                                                    View All Categories <ArrowRight01Icon size={14} />
                                                </Link>
                                            </div>
                                        </div>

                                        <div className="w-px bg-gray-100"></div>

                                        {/* Services Column */}
                                        <div className="flex-1">
                                            <h3 className="text-xs font-semibold text-black uppercase tracking-wider mb-5 flex items-center gap-2">
                                                <Briefcase02Icon size={16} /> Services
                                            </h3>
                                            <div className="space-y-4">
                                                <Link href="/services?category=tech" className="group/link flex flex-col">
                                                    <span className="text-[14px] font-bold text-gray-900 group-hover/link:text-[#008000] transition-colors">Tech & Programming</span>
                                                    <span className="text-[12px] text-gray-500 font-medium mt-0.5">Web Dev, Mobile Apps</span>
                                                </Link>
                                                <Link href="/services?category=design" className="group/link flex flex-col">
                                                    <span className="text-[14px] font-bold text-gray-900 group-hover/link:text-[#008000] transition-colors">Design & Creative</span>
                                                    <span className="text-[12px] text-gray-500 font-medium mt-0.5">Logos, UI/UX, Graphics</span>
                                                </Link>
                                                <Link href="/services?category=marketing" className="group/link flex flex-col">
                                                    <span className="text-[14px] font-bold text-gray-900 group-hover/link:text-[#008000] transition-colors">Digital Marketing</span>
                                                    <span className="text-[12px] text-gray-500 font-medium mt-0.5">SEO, Social Media</span>
                                                </Link>
                                                <Link href="/services" className="inline-flex items-center gap-1 text-[13px] font-bold text-[#008000] hover:underline mt-2">
                                                    Explore Services <ArrowRight01Icon size={14} />
                                                </Link>
                                            </div>
                                        </div>

                                        <div className="w-px bg-gray-100"></div>

                                        {/* Vendors Column */}
                                        <div className="flex-1">
                                            <h3 className="text-xs font-semibold text-black uppercase tracking-wider mb-5 flex items-center gap-2">
                                                <Store01Icon size={16} /> Vendors
                                            </h3>
                                            <div className="space-y-4">
                                                <Link href="/vendors?type=verified" className="group/link flex flex-col">
                                                    <span className="text-[14px] font-bold text-gray-900 group-hover/link:text-[#008000] transition-colors">Verified Stores</span>
                                                    <span className="text-[12px] text-gray-500 font-medium mt-0.5">Top rated sellers</span>
                                                </Link>
                                                <Link href="/vendors?type=local" className="group/link flex flex-col">
                                                    <span className="text-[14px] font-bold text-gray-900 group-hover/link:text-[#008000] transition-colors">Local Businesses</span>
                                                    <span className="text-[12px] text-gray-500 font-medium mt-0.5">Find shops near you</span>
                                                </Link>
                                                <div className="mt-6 p-4 bg-[#008000]/5 rounded-xl border border-[#008000]/10 hover:border-[#008000]/30 transition-colors">
                                                    <p className="text-[13px] font-bold text-[#006000] mb-2">Want to sell on BI?</p>
                                                    <Link href="/auth/signup" className="text-[13px] font-black text-white bg-[#008000] py-2 px-3 rounded-lg block text-center hover:bg-[#006000] transition-all hover:scale-[1.02]">
                                                        Become a Vendor
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>

                            {/* Contact Dropdown */}
                            <div className="relative group">
                                <button className="flex items-center gap-1 text-[15px] font-semibold text-black hover:text-[#008000] py-2 transition-colors">
                                    Contact
                                    <ArrowDown01Icon size={14} className="group-hover:rotate-180 transition-transform duration-200" />
                                </button>
                                <div className="absolute top-[100%] left-0 pt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                    <div className="bg-white border border-gray-100 rounded-xl shadow-xl py-2 translate-y-2 group-hover:translate-y-0 transition-transform duration-200">
                                        <Link href="/contact" className="block px-4 py-2 text-[13px] font-medium text-black hover:bg-gray-50 hover:text-[#008000]">Get in Touch</Link>
                                        <Link href="/support" className="block px-4 py-2 text-[13px] font-medium text-black hover:bg-gray-50 hover:text-[#008000]">Support Center</Link>
                                    </div>
                                </div>
                            </div>

                            {/* Help Dropdown */}
                            <div className="relative group">
                                <button className="flex items-center gap-1 text-[15px] font-semibold text-black hover:text-[#008000] py-2 transition-colors">
                                    Help
                                    <ArrowDown01Icon size={14} className="group-hover:rotate-180 transition-transform duration-200" />
                                </button>
                                <div className="absolute top-[100%] left-0 pt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                    <div className="bg-white border border-gray-100 rounded-xl shadow-xl py-2 translate-y-2 group-hover:translate-y-0 transition-transform duration-200">
                                        <Link href="/faq" className="block px-4 py-2 text-[13px] font-medium text-black hover:bg-gray-50 hover:text-[#008000]">FAQ</Link>
                                        <Link href="/terms" className="block px-4 py-2 text-[13px] font-medium text-black hover:bg-gray-50 hover:text-[#008000]">Terms of Service</Link>
                                        <Link href="/privacy" className="block px-4 py-2 text-[13px] font-medium text-black hover:bg-gray-50 hover:text-[#008000]">Privacy Policy</Link>
                                    </div>
                                </div>
                            </div>
                            </div>
                        </div>

                        {/* Right side actions & Menu Toggle */}
                        <div className="flex items-center gap-4 sm:gap-5">
                            {/* 1. Mobile Search Icon */}
                            {isSearchablePage && (
                                <button 
                                    onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)} 
                                    className={`md:hidden focus:outline-none group p-1 transition-all duration-300 ${showSearch ? 'opacity-100 w-auto translate-y-0 scale-100' : 'opacity-0 w-0 -translate-y-2 scale-90 pointer-events-none'}`}
                                >
                                    <Search02Icon size={24} className="text-zinc-800 cursor-pointer group-hover:text-[#008000] transition-colors" />
                                </button>
                            )}

                            {/* 2. Avatar / Auth Buttons */}
                            {isLoggedIn ? (
                                <Link href="/profile" className="flex items-center text-zinc-800 hover:text-[#008000] transition-colors rounded-full overflow-hidden" title="Profile">
                                    <Avatar name={user?.name || (user as any)?.username || user?.email || "U"} size="md" className="ring-3 ring-transparent hover:ring-[#008000]/30 transition-all" />
                                </Link>
                            ) : (
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <Link href="/auth/signup" className="hidden md:block text-[13px] font-semibold text-gray-600 hover:text-black transition-colors">
                                        Sign Up
                                    </Link>
                                    <Link href="/auth/login" className="px-4 py-2 sm:px-6 sm:py-3 bg-[#008000] text-white text-[13px] sm:text-[14px] font-medium rounded-full hover:bg-primary-700 transition-all hover:scale-[1.02]">
                                        Log in
                                    </Link>
                                </div>
                            )}
                            
                            {/* 3. Mobile Menu Toggle */}
                            <button onClick={toggleOffcanvas} className="lg:hidden focus:outline-none group p-1">
                                <Menu01Icon size={24} className="text-zinc-800 cursor-pointer group-hover:text-[#008000] transition-colors" />
                            </button>
                        </div>
                    </div>

                    {/* Mobile Search Bar (Beneath Logo/Menu) */}
                    {isSearchablePage && (
                        <form 
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSearch(searchQuery);
                                setIsMobileSearchOpen(false);
                            }}
                            className={`md:hidden w-full transition-all duration-300 overflow-hidden ${isMobileSearchOpen ? 'mt-3 h-auto opacity-100' : 'mt-0 h-0 opacity-0 pointer-events-none'}`}
                        >
                            <div className="relative w-full flex items-center bg-[#F3F4F6] rounded-[5px] p-[5px] transition-all">
                                <input
                                    type="text"
                                    placeholder="Search BI Marketplace"
                                    className="flex-1 bg-transparent px-4 py-2 text-[14px] focus:outline-none text-gray-800 placeholder:text-gray-400 font-medium"
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                                <button 
                                    type="submit"
                                    className="p-[5px] rounded-[5px] text-zinc-900 hover:text-[#008000] transition-all flex items-center justify-center shrink-0"
                                >
                                    <Search02Icon size={18} />
                                </button>
                            </div>
                        </form>
                    )}
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

                    <nav className="space-y-1 flex-1 overflow-y-auto">
                        <Link href="/products" onClick={closeOffcanvas} className="flex items-center gap-3 py-3 px-4 text-zinc-600 hover:text-primary-700 hover:bg-primary-50 rounded-xl transition-all font-bold">
                            <ShoppingBag01Icon size={20} />
                            Products
                        </Link>
                        <Link href="/services" onClick={closeOffcanvas} className="flex items-center gap-3 py-3 px-4 text-zinc-600 hover:text-primary-700 hover:bg-primary-50 rounded-xl transition-all font-bold">
                            <Briefcase02Icon size={20} />
                            Services
                        </Link>
                        <Link href="/vendors" onClick={closeOffcanvas} className="flex items-center gap-3 py-3 px-4 text-zinc-600 hover:text-primary-700 hover:bg-primary-50 rounded-xl transition-all font-bold">
                            <Store01Icon size={20} />
                            Vendors
                        </Link>
                        
                        <div className="border-t border-zinc-100 my-4"></div>
                        
                        <Link href="/about" onClick={closeOffcanvas} className="block py-3 px-4 text-zinc-600 hover:text-primary-700 hover:bg-primary-50 rounded-xl transition-all font-bold">
                            About
                        </Link>
                        <Link href="/contact" onClick={closeOffcanvas} className="block py-3 px-4 text-zinc-600 hover:text-primary-700 hover:bg-primary-50 rounded-xl transition-all font-bold">
                            Contact
                        </Link>
                        <Link href="/faq" onClick={closeOffcanvas} className="block py-3 px-4 text-zinc-600 hover:text-primary-700 hover:bg-primary-50 rounded-xl transition-all font-bold">
                            Help & FAQ
                        </Link>

                        {isLoggedIn && (
                            <>
                                <div className="border-t border-zinc-100 my-4"></div>
                                <Link href="/profile" onClick={closeOffcanvas} className="flex items-center gap-3 py-3 px-4 text-zinc-600 hover:text-primary-700 hover:bg-primary-50 rounded-xl transition-all font-bold">
                                    <Store01Icon size={20} />
                                    My Store
                                </Link>
                            </>
                        )}

                        <div className="border-t border-zinc-100 my-6"></div>

                        {!isLoggedIn ? (
                            <>
                                <Link href="/auth/login" onClick={closeOffcanvas} className="flex items-center gap-3 py-3 px-4 text-primary-950 font-bold hover:bg-primary-50 hover:text-primary-700 rounded-xl transition-all">
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


        </>
    );
}
