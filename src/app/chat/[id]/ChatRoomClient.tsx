"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { fetchMessages, fetchConversation, getWebSocketUrl, Message, Conversation } from "@/lib/chat";
import { Avatar } from "@/components/layout/Navbar";
import { ArrowLeft02Icon, SentIcon, Store01Icon } from "hugeicons-react";
import Link from "next/link";
import Image from "next/image";

export default function ChatRoomClient({ conversationId }: { conversationId: number }) {
    const { data: session } = useSession();
    const [messages, setMessages] = useState<Message[]>([]);
    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [ws, setWs] = useState<WebSocket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const user = session?.user;
    const currentUsername = user?.name || (user as any)?.username;

    useEffect(() => {
        if (!session?.access_token) return;

        // Fetch conversation details and messages
        Promise.all([
            fetchConversation(conversationId, (session as any).access_token),
            fetchMessages(conversationId, (session as any).access_token)
        ]).then(([convData, msgsData]) => {
            setConversation(convData);
            // Sort messages chronologically
            const sortedMsgs = msgsData.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
            setMessages(sortedMsgs);
            setIsLoading(false);
            scrollToBottom();
        }).catch(err => {
            console.error("Failed to load chat data", err);
            setIsLoading(false);
        });

        // Initialize WebSocket
        const wsUrl = getWebSocketUrl(conversationId, (session as any).access_token);
        const socket = new WebSocket(wsUrl);

        socket.onopen = () => console.log(`WebSocket connected for chat ${conversationId}`);
        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === "message") {
                    setMessages(prev => {
                        // Prevent duplicates
                        if (prev.some(m => m.id === data.id)) return prev;
                        return [...prev, data as Message];
                    });
                    scrollToBottom();
                }
            } catch (err) {
                console.error("Failed to parse WS message", err);
            }
        };
        socket.onclose = () => console.log(`WebSocket disconnected for chat ${conversationId}`);

        setWs(socket);

        return () => {
            socket.close();
        };
    }, [conversationId, session]);

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !ws || ws.readyState !== WebSocket.OPEN) return;

        const payload = {
            body: newMessage.trim()
        };

        ws.send(JSON.stringify(payload));
        setNewMessage("");
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary-600/20 border-t-primary-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!conversation) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center h-full text-zinc-400 p-8 text-center">
                <p>Failed to load conversation.</p>
            </div>
        );
    }

    const otherUser = conversation.participants.find(p => p.username !== currentUsername) || conversation.participants[0];

    return (
        <div className="flex flex-col h-full bg-[#f8f9fa] relative z-10">
            {/* Header */}
            <div className="h-[72px] bg-white border-b border-zinc-100 flex items-center px-4 md:px-6 justify-between shrink-0 shadow-sm z-20">
                <div className="flex items-center gap-4">
                    <Link href="/chat" className="md:hidden text-zinc-500 hover:text-zinc-900 transition-colors">
                        <ArrowLeft02Icon size={24} />
                    </Link>
                    <Avatar name={otherUser?.username || "User"} size="md" />
                    <div>
                        <h3 className="font-bold text-zinc-900 leading-none">{otherUser?.username}</h3>
                        <Link href={`/vendors/${otherUser?.username}`} className="text-xs text-[#008000] font-medium hover:underline mt-1 flex items-center gap-1">
                            <Store01Icon size={12} />
                            View Store
                        </Link>
                    </div>
                </div>
            </div>

            {/* Product Context Banner (Optional) */}
            {conversation.product && (
                <div className="bg-white border-b border-zinc-100 p-3 flex items-center gap-4 shrink-0 shadow-sm z-10 relative">
                    {conversation.product.image_url ? (
                        <div className="w-12 h-12 relative rounded-lg overflow-hidden shrink-0 border border-zinc-100">
                            <Image 
                                src={conversation.product.image_url} 
                                alt={conversation.product.name}
                                fill
                                className="object-cover"
                            />
                        </div>
                    ) : (
                        <div className="w-12 h-12 bg-zinc-100 rounded-lg shrink-0"></div>
                    )}
                    <div className="min-w-0 flex-1">
                        <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-0.5">Inquiring about</p>
                        <Link href={`/products/${conversation.product.id}`} className="text-sm font-bold text-zinc-900 hover:text-[#008000] truncate block hover:underline transition-colors">
                            {conversation.product.name}
                        </Link>
                    </div>
                </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                {messages.map((msg, index) => {
                    const isMe = msg.sender.username === currentUsername;
                    const showAvatar = !isMe && (index === 0 || messages[index - 1].sender.username !== msg.sender.username);
                    
                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}>
                            <div className={`flex gap-3 max-w-[85%] md:max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                {!isMe && (
                                    <div className="w-8 shrink-0 flex items-end">
                                        {showAvatar && <Avatar name={msg.sender.username} size="sm" />}
                                    </div>
                                )}
                                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                    <div className={`
                                        px-5 py-3 rounded-[20px] shadow-sm relative
                                        ${isMe 
                                            ? 'bg-[#008000] text-white rounded-br-sm' 
                                            : 'bg-white text-zinc-800 border border-zinc-100 rounded-bl-sm'
                                        }
                                    `}>
                                        <p className="text-[15px] font-medium whitespace-pre-wrap leading-relaxed">{msg.body}</p>
                                    </div>
                                    <span className="text-[10px] font-bold text-zinc-400 mt-1.5 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-zinc-100 shrink-0 z-20 relative">
                <form onSubmit={handleSendMessage} className="relative flex items-end gap-3 max-w-4xl mx-auto">
                    <div className="flex-1 bg-zinc-50 border border-zinc-200 rounded-[24px] focus-within:border-[#008000] focus-within:ring-4 focus-within:ring-[#008000]/10 transition-all flex items-center px-2 py-1 relative">
                        <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage(e);
                                }
                            }}
                            placeholder="Type your message..."
                            rows={1}
                            className="w-full bg-transparent border-none focus:ring-0 resize-none max-h-[120px] py-3 px-4 text-[15px] font-medium text-zinc-800 placeholder-zinc-400 min-h-[44px] scrollbar-thin"
                            style={{
                                height: "auto",
                            }}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || !ws || ws.readyState !== WebSocket.OPEN}
                        className="w-12 h-12 rounded-full bg-[#008000] text-white flex items-center justify-center shrink-0 hover:bg-primary-700 hover:scale-105 active:scale-95 transition-all shadow-md shadow-[#008000]/20 disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none"
                    >
                        <SentIcon size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
}
