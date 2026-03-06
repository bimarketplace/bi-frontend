"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, use } from "react";
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
    product_type: string;
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data: session } = useSession();
    const router = useRouter();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState("");
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [isSharing, setIsSharing] = useState(false);

    useEffect(() => {
        const getProduct = async () => {
            try {
                const data = await fetchProductById(parseInt(id));
                setProduct(data);
            } catch (error) {
                console.error("Fetch error:", error);
                toast.error("Failed to load product details");
                router.push("/");
            } finally {
                setLoading(false);
            }
        };

        if (id) getProduct();
    }, [id, router]);

    const handleVote = async (value: number) => {
        if (!session?.access_token) {
            toast.error("Please sign in to vote");
            return;
        }
        try {
            await castVote(product!.id, value, (session as any).access_token);
            const updatedProduct = await fetchProductById(product!.id);
            setProduct(updatedProduct);
            toast.success(value > 0 ? "Upvoted!" : "Downvoted!");
        } catch (error) {
            toast.error("Failed to cast vote");
        }
    };

    const handleShare = async () => {
        setIsSharing(true);
        const toastId = toast.loading("Preparing share image...");
        try {
            // FIRE AND FORGET: Do not await this, or Mobile OS gesture timeout will expire!
            shareProduct(product!.id).catch(console.error);

            let file: File | null = null;

            try {
                if (product!.image_url) {
                    // FORCE HTTPS to prevent 'Mixed Content' network block errors in production
                    const secureImageUrl = product!.image_url.replace(/^http:\/\//i, 'https://');

                    // Fetch the original image directly with a strict 800ms timeout
                    // Mobile browsers (Safari/Chrome) revoke the Share gesture if we wait too long
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 800);

                    const response = await fetch(secureImageUrl, {
                        mode: 'cors',
                        signal: controller.signal
                    });
                    clearTimeout(timeoutId);

                    const blob = await response.blob();

                    const contentType = response.headers.get('content-type') || 'image/jpeg';
                    let extension = contentType.split('/')[1] || 'jpeg';
                    if (extension === 'svg+xml') extension = 'svg';

                    file = new File([blob], `product-${product!.id}.${extension}`, { type: contentType });
                }
            } catch (imageError) {
                console.warn("Could not download product image (or took too long). Falling back to text only.");
            }

            const currentUrl = window.location.href;
            const fullText = `${product!.name}\n${product!.description}\n\nCheck it out on BIMARKETPLACE: ${currentUrl}`;

            const shareData: any = {
                title: product!.name,
            };

            if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
                shareData.files = [file];
                shareData.text = fullText;
                // CRITICAL FOR WHATSAPP: Do NOT include `url` when passing `files`. 
                // If `url` is present, WhatsApp prioritizes it as a Link preview and silently discards the Image file.
            } else {
                shareData.text = fullText;
                shareData.url = currentUrl;
            }

            if (navigator.share) {
                try {
                    await navigator.share(shareData);
                    toast.success("Shared successfully!", { id: toastId });
                } catch (shareErr: any) {
                    // Fallback to clipboard if share drops out
                    throw shareErr;
                }
            } else {
                await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
                if (file) {
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(file);
                    link.download = `product-${product!.id}.jpeg`;
                    link.click();
                    URL.revokeObjectURL(link.href);
                    toast.success("Link copied & image downloaded!", { id: toastId });
                } else {
                    toast.success("Link copied to clipboard!", { id: toastId });
                }
            }

            // Update UI state asynchronously to avoid blocking the OS Share dialog
            fetchProductById(product!.id).then(setProduct).catch(console.error);
        } catch (error: any) {
            console.error("Share error:", error);
            if (error.name !== "AbortError") {
                toast.error("Failed to share", { id: toastId });
            } else {
                toast.dismiss(toastId);
            }
        } finally {
            setIsSharing(false);
        }
    };

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session?.access_token) {
            toast.error("Please sign in to comment");
            return;
        }
        if (!commentText.trim()) return;

        setIsSubmittingComment(true);
        try {
            await addComment(product!.id, commentText, (session as any).access_token);
            setCommentText("");
            const updatedProduct = await fetchProductById(product!.id);
            setProduct(updatedProduct);
            toast.success("Comment added!");
        } catch (error) {
            toast.error("Failed to add comment");
        } finally {
            setIsSubmittingComment(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50">
                <div className="w-12 h-12 border-4 border-zinc-200 border-t-black rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!product) return null;

    return (
        <div className="min-h-screen bg-[#FAFAFA] pt-32 pb-20 px-4 sm:px-8">
            <div className="max-w-7xl mx-auto">
                <Link
                    href="/"
                    className="flex items-center gap-2 text-zinc-500 hover:text-black mb-8 font-semibold transition-colors w-fit"
                >
                    <ArrowLeft02Icon size={20} />
                    Back to Feed
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Side: Product Detail */}
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
                                    loading="eager"
                                />
                                <div className="absolute text-black top-6 right-6 bg-white/95 backdrop-blur-md px-6 py-3 rounded-2xl font-black text-xl shadow-xl border border-white/50">
                                    ₦{parseFloat(product.price).toLocaleString()}
                                </div>
                            </div>

                            <div className="p-8 md:p-10">
                                <div className="flex items-center gap-3 mb-6">
                                    {/* <span className="px-4 py-1.5 bg-zinc-100 text-zinc-600 rounded-full text-xs font-bold uppercase tracking-widest">
                                        {product.product_type === 'service' ? 'Service / Freelance' : 'Physical Product'}
                                    </span> */}
                                    {/* <span className="text-zinc-300">•</span> */}
                                    <span className="px-4 py-4 bg-zinc-100 text-zinc-600 rounded-full text-xs font-bold uppercase tracking-widest">Listed {new Date().toLocaleDateString()}</span>
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
                                            <p className="font-bold text-zinc-900 leading-none">{product.seller.username}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 ml-auto">
                                        <button
                                            onClick={() => handleVote(1)}
                                            className="h-14 px-6 gap-2 bg-zinc-50 hover:bg-zinc-100 text-zinc-900 rounded-2xl flex items-center justify-center transition-all font-bold border border-zinc-100"
                                        >
                                            <ThumbsUpIcon size={20} />
                                            <span>{product.vote_score}</span>
                                        </button>
                                        <button
                                            onClick={() => handleVote(-1)}
                                            className="h-14 w-14 bg-zinc-50 hover:bg-red-50 hover:text-red-500 text-zinc-400 rounded-2xl flex items-center justify-center transition-all border border-zinc-100"
                                        >
                                            <ThumbsDownIcon size={20} />
                                        </button>
                                        <button
                                            onClick={handleShare}
                                            disabled={isSharing}
                                            className="h-14 px-6 gap-2 bg-zinc-100 text-zinc-900 hover:bg-zinc-200 rounded-2xl flex items-center justify-center transition-all font-bold disabled:opacity-50"
                                        >
                                            {isSharing ? (
                                                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                                            ) : (
                                                <Share01Icon size={20} />
                                            )}
                                            <span>{product.share_count}</span>
                                        </button>
                                    </div>
                                </div>

                                {product.whatsapp_link && (
                                    <a
                                        href={`${product.whatsapp_link}${encodeURIComponent(`\n\nProduct Link: ${typeof window !== 'undefined' ? window.location.href : ''}`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-8 flex items-center justify-center gap-3 w-full py-5 bg-black text-white rounded-[20px] font-black text-lg hover:scale-[1.02] transition-all shadow-xl shadow-black/10"
                                    >
                                        <WhatsappIcon size={24} className="text-[#25D366]" />
                                        Purchase & Inquire
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Comments */}
                    <div className="lg:col-span-5 h-full">
                        <div className="bg-white rounded-[32px] border border-gray-100 shadow-xl shadow-zinc-200/50 flex flex-col max-h-[800px]">
                            <div className="p-8 border-b border-zinc-50">
                                <h2 className="text-2xl font-black text-zinc-900 flex items-center gap-3">
                                    <Message02Icon size={28} />
                                    Discussion
                                    <span className="text-sm font-bold bg-zinc-100 text-zinc-500 px-3 py-1 rounded-full ml-2">
                                        {product.comments.length}
                                    </span>
                                </h2>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-6">
                                {product.comments.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4 border border-zinc-100">
                                            <Message01Icon size={32} className="text-zinc-200" />
                                        </div>
                                        <h4 className="font-bold text-zinc-900 mb-1">No comments yet</h4>
                                        <p className="text-sm text-zinc-400 font-medium">Be the first to share your thoughts!</p>
                                    </div>
                                ) : (
                                    product.comments.map((comment) => (
                                        <div key={comment.id} className="flex gap-4 group">
                                            <Avatar name={comment.user.username} size="sm" />
                                            <div className="flex-1 bg-zinc-50 rounded-2xl p-4 border border-zinc-100 group-hover:bg-white group-hover:shadow-md transition-all">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-black text-zinc-900 text-sm">{comment.user.username}</span>
                                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                                        {new Date(comment.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-zinc-600 font-medium leading-relaxed">
                                                    {comment.text}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="p-8 bg-zinc-50/50 border-t border-zinc-100">
                                <form onSubmit={handleCommentSubmit} className="relative">
                                    <textarea
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        placeholder="Add a comment..."
                                        rows={2}
                                        className="w-full pl-6 pr-20 py-4 bg-white border border-zinc-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-black/5 focus:border-black transition-all font-medium text-sm resize-none shadow-sm"
                                    />
                                    <button
                                        type="submit"
                                        disabled={isSubmittingComment || !commentText.trim()}
                                        className="absolute right-4 bottom-4 w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center hover:bg-zinc-800 transition-all disabled:opacity-30 shadow-md"
                                    >
                                        {isSubmittingComment ? (
                                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            <SentIcon size={20} />
                                        )}
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
