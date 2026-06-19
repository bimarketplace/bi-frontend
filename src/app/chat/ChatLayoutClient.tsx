"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { fetchConversations, Conversation } from "@/lib/chat";
import { Container } from "@/components/layout/Container";
import Link from "next/link";
import { Avatar } from "@/components/layout/Navbar";
import { usePathname } from "next/navigation";
import { Message02Icon } from "hugeicons-react";

export default function ChatLayoutClient({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const pathname = usePathname();

    useEffect(() => {
        if (session?.access_token) {
            fetchConversations((session as any).access_token)
                .then((data) => {
                    setConversations(data);
                    setIsLoading(false);
                })
                .catch((err) => {
                    console.error("Failed to fetch conversations", err);
                    setIsLoading(false);
                });
        }
    }, [session]);

    // Refresh conversations every 10 seconds or when focusing back
    useEffect(() => {
        const interval = setInterval(() => {
            if (session?.access_token) {
                fetchConversations((session as any).access_token)
                    .then(setConversations)
                    .catch(console.error);
            }
        }, 10000);
        return () => clearInterval(interval);
    }, [session]);

    const user = session?.user;
    const currentUsername = user?.name || (user as any)?.username;

    // Determine if we are on a mobile view and viewing a specific chat
    const isMobileChatView = pathname !== '/chat' && pathname.startsWith('/chat/');

    return (
      <div className="min-h-screen bg-[#FAFAFA] pt-20 pb-8 flex flex-col">
    <div className="flex-1 flex flex-col w-full h-[calc(100vh-9rem)] max-h-[870px]">
        <div className="bg-white overflow-hidden border border-gray-100 shadow-xl shadow-zinc-200/50 flex flex-1 w-full h-full relative">
            {/* Sidebar (Conversations List) */}
            <div className={`w-full md:w-[350px] lg:w-[400px] flex-shrink-0 border-r border-zinc-100 flex flex-col h-full bg-white transition-all ${isMobileChatView ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-6 border-b border-zinc-100 flex items-center gap-3">
                    <Message02Icon size={24} className="text-[#008000]" />
                    <h2 className="text-2xl font-black text-zinc-900">Messages</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {isLoading ? (
                        <div className="p-6 text-center text-zinc-400 font-medium">Loading...</div>
                    ) : conversations.length === 0 ? (
                        <div className="p-6 text-center text-zinc-500 font-medium">No conversations yet.</div>
                    ) : (
                        conversations.map(conv => {
                            const otherUser = conv.participants.find(p => p.username !== currentUsername) || conv.participants[0];
                            const isActive = pathname === `/chat/${conv.id}`;

                            return (
                                <Link 
                                    key={conv.id} 
                                    href={`/chat/${conv.id}`}
                                    className={`flex items-center gap-4 p-4 border-b border-zinc-50 transition-colors hover:bg-zinc-50 ${isActive ? 'bg-zinc-50 border-l-4 border-l-[#008000]' : 'border-l-4 border-l-transparent'}`}
                                >
                                    <Avatar name={otherUser?.username || "User"} size="md" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h3 className="font-bold text-zinc-900 truncate">{otherUser?.username}</h3>
                                            {conv.last_message && (
                                                <span className="text-xs font-medium text-zinc-400 shrink-0 ml-2">
                                                    {new Date(conv.last_message.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center gap-2">
                                            <p className={`text-sm truncate font-medium ${conv.unread_count > 0 ? 'text-zinc-900 font-bold' : 'text-zinc-500'}`}>
                                                {conv.last_message ? (conv.last_message.sender.username === currentUsername ? `You: ${conv.last_message.body}` : conv.last_message.body) : (conv.product ? `Inquiring about ${conv.product.name}` : "Started a conversation")}
                                            </p>
                                            {conv.unread_count > 0 && (
                                                <span className="bg-[#008000] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full flex-shrink-0">
                                                    {conv.unread_count}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className={`flex-1 flex-col h-full bg-zinc-50/30 ${isMobileChatView ? 'flex' : 'hidden md:flex'}`}>
                {children}
            </div>
        </div>
    </div>
</div>
    );
}
