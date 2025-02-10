'use client';

import { use } from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PostCard from '@/app/components/post-card';
import CommentCard from '@/app/components/comment-card';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ContentContainer from '@/app/components/content-container';
import { useSession } from 'next-auth/react';

interface Comment {
    _id: string;
    content: string;
    author: {
        _id: string;
        username: string;
        profilePicture?: string;
    };
    post: string;
    upvotes: number;
    createdAt: string;
    parentComment?: string;
}

interface Post {
    _id: string;
    title: string;
    content: string;
    author: {
        _id: string;
        username: string;
        profilePicture?: string;
    };
    image?: string;
    upvotes: number;
    createdAt: string;
}

// Add this at the top of the file after imports
const preventScroll = `
  html {
    scroll-behavior: auto !important;
  }
`;

export default function CommentDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [comment, setComment] = useState<Comment | null>(null);
    const [originalPost, setOriginalPost] = useState<Post | null>(null);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [replies, setReplies] = useState<Comment[]>([]);
    const router = useRouter();
    const { data: session, status } = useSession();

    useEffect(() => {
        console.log('Session status:', status);
        console.log('Session data:', session);
        console.log('Current user ID:', session?.user?.id);
    }, [session, status]);

    useEffect(() => {
        const fetchCommentAndPost = async () => {
            try {
                const commentRes = await fetch(`/api/comments/${id}`);
                if (!commentRes.ok) throw new Error('Comment not found');
                const commentData = await commentRes.json();
                setComment(commentData);

                const postRes = await fetch(`/api/posts/${commentData.post}`);
                if (!postRes.ok) throw new Error('Post not found');
                const postData = await postRes.json();
                setOriginalPost(postData);
            } catch (error) {
                console.error('Error:', error);
                router.push('/');
            } finally {
                setLoading(false);
            }
        };

        fetchCommentAndPost();
    }, [id, router]);

    useEffect(() => {
        const fetchReplies = async () => {
            try {
                const res = await fetch(`/api/comments/${id}/replies`);
                if (res.ok) {
                    const data = await res.json();
                    setReplies(data.replies);
                }
            } catch (error) {
                console.error('Error fetching replies:', error);
            }
        };

        if (comment) {
            fetchReplies();
        }
    }, [id, comment]);

    // Separate useEffect for scrolling after content is rendered
    useEffect(() => {
        if (!loading && comment) {
            const commentElement = document.getElementById(`comment-${id}`);
            if (commentElement) {
                requestAnimationFrame(() => {
                    const rect = commentElement.getBoundingClientRect();
                    window.scrollTo(0, rect.top - 84);
                });
            }
        }
    }, [loading, comment, id]);

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setSubmitting(true);
        try {
            const response = await fetch(`/api/comments/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newComment })
            });

            if (response.ok) {
                setNewComment('');
                router.refresh();
            }
        } catch (error) {
            console.error('Error posting comment:', error);
        } finally {
            setSubmitting(false);
        }
    };

    // Add new handler for CommentCard's onReply
    const handleReply = async (commentId: string, content: string) => {
        try {
            const response = await fetch(`/api/posts/${originalPost?._id}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    content,
                    parentComment: commentId
                })
            });

            if (response.ok) {
                router.refresh();
            }
        } catch (error) {
            console.error('Error posting reply:', error);
        }
    };

    if (loading) return <div className="p-4">Loading...</div>;
    if (!comment || !originalPost) return <div className="p-4">Not found</div>;

    return (
        <>
            <style jsx global>{preventScroll}</style>
            
            <div className="min-h-[150vh] flex flex-col">
                {/* Original Post (Above viewport) */}
                <div className="w-full">
                    <ContentContainer>
                        <div className="py-4">
                            <Link 
                                href={`/posts/${originalPost._id}`}
                                className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to original post
                            </Link>
                            <div className="opacity-75 hover:opacity-100 transition">
                                <PostCard 
                                    post={originalPost} 
                                    isUpvoted={false} 
                                    currentUserId={session?.user?.id || null}
                                />
                            </div>
                        </div>
                    </ContentContainer>
                </div>

                {/* Main Content (Starting at viewport top) */}
                <div className="flex-1 w-full">
                    <ContentContainer>
                        <div className="py-4 space-y-6">
                            {/* Focused Comment */}
                            <div id={`comment-${id}`}>
                                <CommentCard
                                    comment={comment}
                                    onReply={handleReply}
                                    currentUserId={session?.user?.id || null}
                                />
                                
                                {/* Reply Input Bar */}
                                <div className="mt-2 pl-8 border-l-2 border-gray-200">
                                    <form onSubmit={handleSubmitComment} className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder="Reply to this comment..."
                                            className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-500"
                                            disabled={submitting}
                                        />
                                        <button
                                            type="submit"
                                            disabled={submitting || !newComment.trim()}
                                            className={`px-4 py-2 rounded-full text-white ${
                                                submitting || !newComment.trim()
                                                    ? 'bg-gray-400 cursor-not-allowed'
                                                    : 'bg-green-600 hover:bg-green-700'
                                            } transition duration-200`}
                                        >
                                            {submitting ? '...' : 'Reply'}
                                        </button>
                                    </form>
                                </div>

                                {/* Replies Section */}
                                <div className="mt-4 pl-8 space-y-4">
                                    {replies.map(reply => (
                                        <CommentCard
                                            key={reply._id}
                                            comment={reply}
                                            onReply={handleReply}
                                            currentUserId={session?.user?.id || null}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </ContentContainer>
                </div>

                {/* Reduced bottom padding */}
                <div className="h-[50vh]" />
            </div>
        </>
    );
} 