"use client";

import React from "react";
import { 
    FavouriteIcon, 
    CheckmarkCircle01Icon, 
    ArrowLeft02Icon,
    Notification03Icon,
    StarIcon,
    ThumbsUpIcon
} from "hugeicons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function NotificationsPage() {
    const router = useRouter();
    const { data: session } = useSession();

    if (!session) {
        return (
            <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-400 mb-4">
                    <Notification03Icon size={32} />
                </div>
                <h1 className="text-xl font-bold text-zinc-900 mb-2">Please sign in</h1>
                <p className="text-zinc-500 mb-6 font-medium">To view your activity and notifications, you need to be logged in.</p>
                <Link 
                    href="/auth/login" 
                    className="px-8 py-3 bg-[#008000] text-white rounded-xl font-bold shadow-lg shadow-[#008000]/20 hover:scale-[1.02] transition-transform"
                >
                    Sign In
                </Link>
            </div>
        );
    }

    const notifications = [
        {
            id: 1,
            type: 'like',
            title: 'Sarah liked your Gig',
            message: '"Premium UI Dashboard Design" was favorited by a buyer.',
            time: '2 minutes ago',
            isRead: false,
            icon: <FavouriteIcon size={18} className="fill-current" />,
            iconBg: 'bg-red-50 text-red-500'
        },
        {
            id: 2,
            type: 'purchase',
            title: 'New Purchase Inquiry',
            message: 'Someone is trying to purchase "Web Deployment" services.',
            time: '15 minutes ago',
            isRead: false,
            icon: <CheckmarkCircle01Icon size={18} />,
            iconBg: 'bg-green-50 text-[#008000]'
        },
        {
            id: 3,
            type: 'review',
            title: 'Congratulations! New Five Star Review',
            message: 'Alex left a review for "Mobile App Development".',
            time: '4 hours ago',
            isRead: true,
            icon: <StarIcon size={18} className="fill-current" />,
            iconBg: 'bg-amber-50 text-amber-500'
        },
        {
            id: 4,
            type: 'recommend',
            title: 'Trusted Vendor Badge Earned',
            message: 'You have been recommended by 5 customers this week.',
            time: '1 day ago',
            isRead: true,
            icon: <ThumbsUpIcon size={18} />,
            iconBg: 'bg-blue-50 text-blue-500'
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-zinc-100 px-4 sm:px-8 py-4 mt-20">
                <div className="max-w-2xl mx-auto flex items-center gap-4">
                    <button 
                        onClick={() => router.back()}
                        className="p-2 hover:bg-zinc-50 rounded-full transition-colors text-zinc-600"
                    >
                        <ArrowLeft02Icon size={24} />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-zinc-900 leading-none">Notifications</h1>
                        <p className="text-xs text-zinc-500 font-bold mt-1 uppercase tracking-wider">Stay updated with your shop</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <main className="max-w-2xl mx-auto py-6">
                <div className="px-4 mb-4 flex justify-between items-center px-6">
                    <span className="text-[13px] font-extrabold text-zinc-950">Recent Activity</span>
                    <button className="text-[12px] font-bold text-[#008000] hover:underline">Mark all as read</button>
                </div>

                <div className="space-y-1">
                    {notifications.map((notification) => (
                        <div 
                            key={notification.id}
                            className={`px-4 sm:px-6 py-5 flex gap-4 items-start transition-all ${
                                notification.isRead ? 'opacity-70 grayscale-[0.2]' : 'bg-white border-l-4 border-l-[#008000]'
                            } hover:bg-zinc-50 cursor-pointer border-b border-zinc-50/50 relative overflow-hidden group`}
                        >
                            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-300 ${notification.iconBg}`}>
                                {notification.icon}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start gap-2">
                                    <h3 className={`text-[15px] font-bold ${notification.isRead ? 'text-zinc-700' : 'text-zinc-950'}`}>
                                        {notification.title}
                                    </h3>
                                    <span className="text-[11px] text-zinc-400 font-medium whitespace-nowrap">{notification.time}</span>
                                </div>
                                <p className="text-[13px] text-zinc-600 mt-1 leading-relaxed font-medium">
                                    {notification.message}
                                </p>
                            </div>
                            {!notification.isRead && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#008000] rounded-full"></div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-10 mb-20 text-center pb-20">
                    <div className="inline-flex items-center gap-2 text-zinc-400 font-bold text-xs uppercase tracking-widest ">
                        <div className="h-[1px] w-8 bg-zinc-200"></div>
                        <span>End of updates</span>
                        <div className="h-[1px] w-8 bg-zinc-200"></div>
                    </div>
                </div>
            </main>
        </div>
    );
}
