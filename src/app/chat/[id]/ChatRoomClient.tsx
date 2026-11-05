"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { fetchMessages, fetchConversation, getWebSocketUrl, Message, Conversation } from "@/lib/chat";
import { ArrowLeft02Icon, SentIcon } from "hugeicons-react";
import Link from "next/link";
import Image from "next/image";

const formatDividerDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
        return "Today";
    } else if (d.toDateString() === yesterday.toDateString()) {
        return "Yesterday";
    } else {
        return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined });
    }
};

export default function ChatRoomClient({ conversationId }: { conversationId: number }) {
    const { data: session } = useSession();
    const [messages, setMessages] = useState<Message[]>([]);
    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isWsOpen, setIsWsOpen] = useState(false);
    const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const wsRef = useRef<WebSocket | null>(null);

    const user = session?.user;
    const accessToken = (session as { access_token?: string } | null)?.access_token;
    const currentUsername = user?.name || (user as { username?: string } | undefined)?.username || "You";

    function scrollToBottom() {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    }

    useEffect(() => {
        if (!accessToken) return;

        Promise.all([
            fetchConversation(conversationId, accessToken),
            fetchMessages(conversationId, accessToken)
        ]).then(([convData, msgsData]) => {
            setConversation(convData);
            const sortedMsgs = [...msgsData].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
            setMessages(sortedMsgs);
            setIsLoading(false);
            scrollToBottom();
        }).catch(err => {
            console.error("Failed to load chat data", err);
            setIsLoading(false);
        });

        const wsUrl = getWebSocketUrl(conversationId, accessToken);
        const socket = new WebSocket(wsUrl);

        socket.onopen = () => {
            console.log(`WebSocket connected for chat ${conversationId}`);
            setIsWsOpen(true);
        };
        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === "message") {
                    setMessages(prev => {
                        if (prev.some(m => m.id === data.id)) return prev;
                        return [...prev, data as Message];
                    });
                    scrollToBottom();
                }
            } catch (err) {
                console.error("Failed to parse WS message", err);
            }
        };
        socket.onclose = () => {
            console.log(`WebSocket disconnected for chat ${conversationId}`);
            setIsWsOpen(false);
        };

        wsRef.current = socket;

        return () => {
            socket.close();
            wsRef.current = null;
        };
    }, [accessToken, conversationId]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        const socket = wsRef.current;
        if (!newMessage.trim() || !socket || !isWsOpen) return;

        const payload = {
            body: newMessage.trim()
        };

        socket.send(JSON.stringify(payload));
        setNewMessage("");
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary-600/20 border-t-primary-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    const otherUser = conversation?.participants.find(p => p.username !== currentUsername) || conversation?.participants[0];
    const isSendDisabled = !newMessage.trim() || !isWsOpen || !wsRef.current;
    const displayMessages = messages.length > 0
        ? messages
        : [
            {
                id: -1,
                sender: { id: 0, username: otherUser?.username || "Vendor" },
                body: "Is this still available?",
                is_read: true,
                created_at: "2025-02-08T10:00:00.000Z",
            },
            {
                id: -2,
                sender: { id: 0, username: currentUsername },
                body: "Yes, this is still available",
                is_read: true,
                created_at: "2025-02-08T10:05:00.000Z",
            }
        ] as Message[];

    if (!conversation) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center h-full text-zinc-400 p-8 text-center">
                <p>Failed to load conversation.</p>
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col bg-[#f5f5f5] text-zinc-900">
            <div className="h-12 bg-[#111111] px-5 pt-1 pb-2 shrink-0">
                <div className="mx-auto flex h-full max-w-[420px] items-center justify-between text-[11px] font-semibold text-white">
                    <span className="pl-1">9:41</span>
                    <div className="flex items-center gap-2">
                        <span className="h-2.5 w-3 rounded-full border border-white/70 border-t-0 border-l-0 border-r-0" />
                        <span className="h-2.5 w-5 rounded-full border border-white/90" />
                        <span className="h-2.5 w-7 rounded-full bg-white" />
                    </div>
                </div>
            </div>

            <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col bg-[#f4f4f4] shadow-[0_0_0_1px_rgba(24,24,27,0.04)]">
                <header className="flex h-[72px] items-center justify-between border-b border-zinc-200 bg-[#f4f4f4] px-4">
                    <div className="flex items-center gap-3">
                        <Link href="/chat" className="text-zinc-700 transition-colors hover:text-zinc-900">
                            <ArrowLeft02Icon size={24} />
                        </Link>
                        <h3 className="text-[18px] font-semibold text-zinc-900">Messaging {otherUser?.username || "Vendor"}</h3>
                    </div>
                </header>

                {conversation.product && (
                    <div className="border-b border-zinc-200 bg-[#f4f4f4] p-3">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
                                    {conversation.product.image_url ? (
                                        <Image
                                            src={conversation.product.image_url}
                                            alt={conversation.product.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="h-full w-full bg-zinc-200" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-[17px] font-medium text-zinc-900">{conversation.product.name}</p>
                                </div>
                            </div>
                            <button className="rounded-full border border-zinc-800 px-5 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-800 hover:text-white">
                                Buy Now
                            </button>
                        </div>
                        <p className="mt-3 text-center text-[12px] text-zinc-500">This vendor typically replies within 30 mins.</p>
                    </div>
                )}

                <div className={`flex-1 overflow-y-auto bg-[#f4f4f4] ${displayMessages.length === 0 ? 'flex items-center justify-center' : 'space-y-3 p-4'}`}>
                    {displayMessages.length === 0 ? (
                        <div className="text-center text-zinc-500">No messages yet</div>
                    ) : (
                        displayMessages.map((msg, index) => {
                            const isMe = msg.sender.username === currentUsername;
                            const showDateDivider = index === 0 || new Date(displayMessages[index - 1].created_at).toDateString() !== new Date(msg.created_at).toDateString();

                            return (
                                <div key={msg.id} className="space-y-2">
                                    {showDateDivider && index > 0 && (
                                        <div className="flex justify-center py-1 text-[10px] font-medium text-zinc-500">
                                            {formatDividerDate(msg.created_at)}
                                        </div>
                                    )}
                                    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] ${isMe ? 'items-end' : 'items-start'}`}>
                                            <div
                                                className={`inline-block rounded-[28px] px-4 py-3 text-[15px] leading-snug ${
                                                    isMe
                                                        ? 'bg-[#dfe6df] text-zinc-900 rounded-br-lg'
                                                        : 'bg-[#16a34a] text-white rounded-bl-lg'
                                                }`}
                                            >
                                                {msg.body}
                                            </div>
                                            <div className={`mt-1 text-[10px] font-medium text-zinc-500 ${isMe ? 'text-right' : 'text-left'}`}>
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="relative border-t border-zinc-200 bg-[#f4f4f4] p-3">
                    {isAttachmentMenuOpen && (
                        <div className="absolute bottom-[68px] left-4 w-[220px] overflow-hidden rounded-[22px] border border-zinc-200 bg-white shadow-xl">
                            <button type="button" className="flex w-full items-center px-4 py-3 text-left text-[16px] font-medium text-zinc-800 hover:bg-zinc-50">
                                Take Photo
                            </button>
                            <button type="button" className="flex w-full items-center px-4 py-3 text-left text-[16px] font-medium text-zinc-800 hover:bg-zinc-50">
                                Attach Photo
                            </button>
                        </div>
                    )}

                    <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setIsAttachmentMenuOpen((prev) => !prev)}
                            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#ececec] text-[28px] leading-none text-zinc-700 transition-colors hover:bg-zinc-200"
                            aria-label="Toggle attachments"
                        >
                            +
                        </button>

                        <div className="flex flex-1 items-center rounded-full border border-zinc-200 bg-[#f0f0f0] px-4 py-2">
                            <input
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleSendMessage(e);
                                    }
                                }}
                                placeholder="Enter your message"
                                className="w-full border-0 bg-transparent text-[16px] text-zinc-900 outline-none placeholder:text-zinc-400"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSendDisabled}
                            className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0a7a1d] text-white shadow-md shadow-green-900/20 transition-colors hover:bg-[#0c6f1d] disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label="Send message"
                        >
                            <SentIcon size={18} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
