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
    const { data: session, status: sessionStatus } = useSession();
    const [messages, setMessages] = useState<Message[]>([]);
    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [connectionError, setConnectionError] = useState("");
    const [isWsOpen, setIsWsOpen] = useState(false);
    const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const wsRef = useRef<WebSocket | null>(null);

    const user = session?.user;
    const accessToken = session?.access_token;
    const currentUsername =
        (user as { username?: string } | undefined)?.username || user?.name || "You";

    function scrollToBottom() {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    }

    useEffect(() => {
        if (sessionStatus === "loading") return;
        if (!accessToken) {
            setIsLoading(false);
            setConversation(null);
            setMessages([]);
            setLoadError("Sign in to view this conversation.");
            return;
        }

        let isActive = true;
        setIsLoading(true);
        setLoadError("");
        setConnectionError("");
        setIsWsOpen(false);

        Promise.all([
            fetchConversation(conversationId, accessToken),
            fetchMessages(conversationId, accessToken)
        ]).then(([convData, msgsData]) => {
            if (!isActive) return;
            setConversation(convData);
            const sortedMsgs = [...msgsData].sort(
                (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
            );
            setMessages(sortedMsgs);
            setIsLoading(false);
            scrollToBottom();
        }).catch(err => {
            if (!isActive) return;
            console.error("Failed to load chat data", err);
            setLoadError("Could not load this conversation. Please try again.");
            setIsLoading(false);
        });

        const wsUrl = getWebSocketUrl(conversationId, accessToken);
        const socket = new WebSocket(wsUrl);

        socket.onopen = () => {
            if (!isActive) return;
            console.log(`WebSocket connected for chat ${conversationId}`);
            setConnectionError("");
            setIsWsOpen(true);
        };
        socket.onmessage = (event) => {
            if (!isActive) return;
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
            if (!isActive) return;
            console.log(`WebSocket disconnected for chat ${conversationId}`);
            setIsWsOpen(false);
            setConnectionError("Live messaging disconnected. Refresh the page to reconnect.");
        };
        socket.onerror = (error) => {
            if (!isActive) return;
            console.error("Chat WebSocket connection failed", error);
            setIsWsOpen(false);
            setConnectionError("Live messaging is unavailable. You can still view loaded messages.");
        };

        wsRef.current = socket;

        return () => {
            isActive = false;
            socket.close();
            if (wsRef.current === socket) wsRef.current = null;
        };
    }, [accessToken, conversationId, sessionStatus]);

    const sendMessage = (body: string) => {
        const socket = wsRef.current;
        const trimmedBody = body.trim();
        if (!trimmedBody || !socket || socket.readyState !== 1) return;

        try {
            socket.send(JSON.stringify({ body: trimmedBody }));
            setNewMessage("");
        } catch (error) {
            console.error("Failed to send chat message", error);
            setConnectionError("Could not send your message. Please try again.");
        }
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(newMessage);
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary-600/20 border-t-primary-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
                <p role="alert" className="text-sm text-zinc-600">{loadError}</p>
                <Link
                    href={accessToken ? "/chat" : "/auth/login"}
                    className="text-sm font-semibold text-[#008000] underline"
                >
                    {accessToken ? "Back to messages" : "Sign in"}
                </Link>
            </div>
        );
    }

    const otherUser = conversation?.participants.find(p => p.username !== currentUsername) || conversation?.participants[0];
    const socketReady = isWsOpen && wsRef.current?.readyState === 1;
    const isSendDisabled = !newMessage.trim() || !socketReady;

    if (!conversation) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center h-full text-zinc-400 p-8 text-center">
                <p>Failed to load conversation.</p>
            </div>
        );
    }

    return (
        <div className="flex h-full min-h-0 w-full flex-col bg-white text-zinc-900">
            <div className="mx-auto flex h-full min-h-0 w-full max-w-[420px] flex-col bg-white">
                <header className="flex h-12 shrink-0 items-center border-b border-zinc-200 bg-white px-4">
                    <div className="flex items-center gap-3">
                        <Link href="/chat" className="text-zinc-700 transition-colors hover:text-zinc-900">
                            <ArrowLeft02Icon size={20} />
                        </Link>
                        <h3 className="truncate text-sm font-semibold text-zinc-900">
                            Messaging {otherUser?.username || "Vendor"}
                        </h3>
                    </div>
                </header>

                {conversation.product && (
                    <div className="shrink-0 border-b border-zinc-200 bg-white px-3 py-2">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded border border-zinc-200 bg-zinc-100">
                                    {conversation.product.image_url ? (
                                        <Image
                                            src={conversation.product.image_url}
                                            alt={conversation.product.name}
                                            fill
                                            sizes="32px"
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="h-full w-full bg-zinc-200" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-xs font-medium text-zinc-900">{conversation.product.name}</p>
                                </div>
                            </div>
                            <Link
                                href={`/products/${conversation.product.id}`}
                                className="shrink-0 rounded-full border border-zinc-800 px-3 py-2 text-xs font-medium text-zinc-900 transition-colors hover:bg-zinc-800 hover:text-white"
                            >
                                Buy Now
                            </Link>
                        </div>
                        <p className="mt-2 text-center text-[9px] leading-3 text-zinc-400">
                            This vendor typically replies within 30 mins.
                        </p>
                    </div>
                )}

                <div className="min-h-0 flex-1 overflow-y-auto bg-white p-3">
                    {messages.map((msg, index) => {
                        const isMe = msg.sender.username === currentUsername;
                        const showDateDivider = index === 0 || new Date(messages[index - 1].created_at).toDateString() !== new Date(msg.created_at).toDateString();

                        return (
                            <div key={msg.id} className="space-y-2">
                                {showDateDivider && (
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
                    })}
                    <div ref={messagesEndRef} />
                </div>

                <div className="relative shrink-0 border-t border-zinc-200 bg-white px-3 pb-[calc(env(safe-area-inset-bottom)_+_12px)] pt-2">
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

                    {messages.length === 0 && (
                        <div className="no-scrollbar mb-3 flex gap-2 overflow-x-auto">
                            {[
                                "Is this still available?",
                                "What is your best price?",
                                "Can you deliver?",
                            ].map((reply) => (
                                <button
                                    key={reply}
                                    type="button"
                                    disabled={!socketReady}
                                    onClick={() => sendMessage(reply)}
                                    className="shrink-0 rounded-full bg-[#f0f7f0] px-3 py-1.5 text-[9px] leading-3 text-zinc-600 disabled:opacity-50"
                                >
                                    {reply}
                                </button>
                            ))}
                        </div>
                    )}
                    {connectionError && (
                        <p role="status" className="mb-2 text-center text-[10px] text-amber-700">
                            {connectionError}
                        </p>
                    )}

                    <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setIsAttachmentMenuOpen((prev) => !prev)}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f5f5f5] text-[24px] leading-none text-zinc-700 transition-colors hover:bg-zinc-200"
                            aria-label="Toggle attachments"
                        >
                            +
                        </button>

                        <div className="flex h-9 min-w-0 flex-1 items-center rounded-full border border-zinc-200 bg-white px-3">
                            <input
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleSendMessage(e);
                                    }
                                }}
                                placeholder="Enter a message"
                                className="w-full border-0 bg-transparent text-xs text-zinc-900 outline-none placeholder:text-zinc-400"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSendDisabled}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#008000] text-white transition-colors hover:bg-[#006000] disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label="Send message"
                        >
                            <SentIcon size={16} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
