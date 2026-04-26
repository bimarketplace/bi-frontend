"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchProductById, addComment, castVote, shareProduct } from "@/lib/products";
import { toast } from "react-hot-toast";
import {
    ArrowLeft02Icon,
    ThumbsUpIcon,
    ThumbsDownIcon,
    Message01Icon,
    Share01Icon,
    SentIcon,
    Message02Icon,
    UserIcon,
    WhatsappIcon
} from "hugeicons-react";
import Link from "next/link";
import Image from "next/image";
import { Avatar } from "@/components/layout/Navbar";

interface Comment {
    id: number;
    user: {
        username: string;
        avatar_url?: string;
    };
    text: string;
    created_at: string;
}

interface Product {
    id: number;
    name: string;
    seller: {
        username: string;
        email: string;
        avatar_url?: string;
    };
    price: string;
    description: string;
    image_url: string;
    vote_score: number;
    share_count: number;
    whatsapp_link?: string;
    comments: Comment[];
    user_vote: number;
    product_type: string;
}

export default function ProductDetails({ initialProduct, id }: { initialProduct: Product; id: string }) {
    const { data: session } = useSession();
    const router = useRouter();
    const [product, setProduct] = useState<Product>(initialProduct);
    const [commentText, setCommentText] = useState("");
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [isSharing, setIsSharing] = useState(false);

    useEffect(() => {
        // Refresh product data if session changes (for user specific votes)
        if (session?.access_token) {
            fetchProductById(parseInt(id), (session as any).access_token)
                .then(setProduct)
                .catch(console.error);
        }
    }, [id, session]);

    const handleVote = async (value: number) => {
        if (!session?.access_token) {
            toast.error("Please sign in to access this feature");
            return;
        }

        const originalProduct = { ...product };

        let newVoteScore = product.vote_score;
        let newUserVote = 0;

        if (product.user_vote === value) {
            newVoteScore -= value;
            newUserVote = 0;
        } else if (product.user_vote === 0) {
            newVoteScore += value;
            newUserVote = value;
        } else {
            newVoteScore += (value * 2);
            newUserVote = value;
        }

        setProduct({
            ...product,
            vote_score: newVoteScore,
            user_vote: newUserVote
        });

        try {
            await castVote(product.id, value, (session as any).access_token);
            const updatedProduct = await fetchProductById(product.id, (session as any).access_token);
            setProduct(updatedProduct);
            
            if (newUserVote === 0) {
                toast.success("Vote removed");
            } else {
                toast.success(value > 0 ? "Upvoted!" : "Downvoted!");
            }
        } catch (error) {
            setProduct(originalProduct);
            toast.error("Failed to cast vote");
        }
    };

    const handleShare = async () => {
        setIsSharing(true);
        const toastId = toast.loading("Preparing share...");
        try {
            shareProduct(product.id).catch(console.error);

            setProduct(prev => ({ ...prev, share_count: (prev.share_count || 0) + 1 }));

            const currentUrl = window.location.href;
            const fullText = `${product.name}\n${product.description}\n\nCheck it out: ${currentUrl}`;

            if (navigator.share) {
                await navigator.share({
                    title: product.name,
                    text: fullText,
                    url: currentUrl
                });
                toast.success("Shared!", { id: toastId });
            } else {
                await navigator.clipboard.writeText(fullText);
                toast.success("Link copied!", { id: toastId });
            }
        } catch (error) {
            console.error("Share error:", error);
        } finally {
            setIsSharing(false);
        }
    };

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session?.access_token) {
            toast.error("Please sign in to access this feature");
            return;
        }
        if (!commentText.trim()) return;

        setIsSubmittingComment(true);
        try {
            await addComment(product.id, commentText, (session as any).access_token);
            setCommentText("");
            const updatedProduct = await fetchProductById(product.id);
            setProduct(updatedProduct);
            toast.success("Comment added!");
        } catch (error) {
            toast.error("Failed to add comment");
        } finally {
            setIsSubmittingComment(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] pt-32 pb-20 px-4 sm:px-8">
            <div className="max-w-7xl mx-auto">
                <Link
                    href="/"
                    className="flex items-center gap-2 text-zinc-500 hover:text-primary-950 mb-8 font-semibold transition-colors w-fit"
                >
                    <ArrowLeft02Icon size={20} />
                    Back to Feed
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-7 space-y-8">
                        <div className="bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-xl shadow-zinc-200/50">
                            <div className="relative aspect-[16/10] w-full">
                                <Image
                                    src={product.image_url || "/assets/images/sale-fast.png"}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                    priority
                                />
                                <div className="absolute text-primary-950 top-6 right-6 bg-white/95 backdrop-blur-md px-6 py-3 rounded-2xl font-black text-xl shadow-xl border border-white/50">
                                    ₦{parseFloat(product.price).toLocaleString()}
                                </div>
                            </div>

                            <div className="p-8 md:p-10">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="px-4 py-4 bg-zinc-100 text-zinc-600 rounded-full text-xs font-bold uppercase tracking-widest">
                                        Listed {new Date().toLocaleDateString()}
                                    </span>
                                </div>

                                <h1 className="text-4xl font-black text-zinc-900 mb-6 tracking-tight">{product.name}</h1>

                                <div className="bg-zinc-50 rounded-2xl p-6 mb-8 border border-zinc-100">
                                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-3">Description</h3>
                                    <p className="text-zinc-600 leading-relaxed font-medium">
                                        {product.description}
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-zinc-100">
                                    <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-zinc-100 shadow-sm pr-6">
                                        <Avatar name={product.seller.username} size="md" />
                                        <div>
                                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-tighter">Seller</p>
                                            <Link 
                                                href={`/vendors/${product.seller.username}`}
                                                className="font-bold text-zinc-900 leading-none hover:underline hover:text-brand-green transition-colors"
                                            >
                                                {product.seller.username}
                                            </Link>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 ml-auto">
                                        <button
                                            onClick={() => handleVote(1)}
                                            className={`h-14 px-6 gap-2 rounded-2xl flex items-center justify-center transition-all font-bold border ${
                                                product.user_vote === 1 
                                                ? "bg-green-50 text-green-600 border-green-200 shadow-sm" 
                                                : "bg-zinc-50 hover:bg-zinc-100 text-zinc-900 border-zinc-100"
                                            }`}
                                        >
                                            <ThumbsUpIcon size={20} fill={product.user_vote === 1 ? "currentColor" : "none"} />
                                            <span>{product.vote_score}</span>
                                        </button>
                                        <button
                                            onClick={() => handleVote(-1)}
                                            className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-all border ${
                                                product.user_vote === -1 
                                                ? "bg-red-50 text-red-600 border-red-200 shadow-sm" 
                                                : "bg-zinc-50 hover:bg-red-50 hover:text-red-500 text-zinc-400 border-zinc-100"
                                            }`}
                                        >
                                            <ThumbsDownIcon size={20} fill={product.user_vote === -1 ? "currentColor" : "none"} />
                                        </button>
                                        <button
                                            onClick={handleShare}
                                            disabled={isSharing}
                                            className="h-14 px-6 gap-2 bg-zinc-100 text-zinc-900 hover:bg-zinc-200 rounded-2xl flex items-center justify-center transition-all font-bold disabled:opacity-50"
                                        >
                                            {isSharing ? (
                                                <div className="w-5 h-5 border-2 border-primary-600/20 border-t-black rounded-full animate-spin"></div>
                                            ) : (
                                                <Share01Icon size={20} />
                                            )}
                                            <span>{product.share_count}</span>
                                        </button>
                                    </div>
                                </div>

                                {product.whatsapp_link && (
                                    <a
                                        href={product.whatsapp_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-8 flex items-center justify-center gap-3 w-full py-5 bg-[#008000] text-white rounded-[20px] font-black text-lg hover:scale-[1.02] transition-all shadow-xl shadow-primary-900/10"
                                    >
                                        <WhatsappIcon size={24} className="text-[#25D366]" />
                                        Purchase & Inquire
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-5 h-full">
                        <div className="bg-white rounded-[32px] border border-gray-100 shadow-xl shadow-zinc-200/50 flex flex-col max-h-[800px]">
                            <div className="p-8 border-b border-zinc-50">
                                <h2 className="text-2xl font-black text-zinc-900 flex items-center gap-3">
                                    <Message02Icon size={28} />
                                    Discussion
                                </h2>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-6">
                                {product.comments.map((comment) => (
                                    <div key={comment.id} className="flex gap-4 group">
                                        <Avatar name={comment.user.username} size="sm" />
                                        <div className="flex-1 bg-zinc-50 rounded-2xl p-4 border border-zinc-100">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-black text-zinc-900 text-sm">{comment.user.username}</span>
                                            </div>
                                            <p className="text-sm text-zinc-600 font-medium">{comment.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-8 border-t border-zinc-100">
                                <form onSubmit={handleCommentSubmit} className="relative">
                                    <textarea
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        placeholder="Add a comment..."
                                        rows={2}
                                        className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:border-primary-600 transition-all font-medium text-sm"
                                    />
                                    <button
                                        type="submit"
                                        disabled={isSubmittingComment || !commentText.trim()}
                                        className="absolute right-4 bottom-4 w-10 h-10 bg-[#008000] text-white rounded-xl flex items-center justify-center"
                                    >
                                        <SentIcon size={20} />
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
