'use client';

import { use } from 'react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PostCard from '@/app/components/post-card';
import CommentCard from '@/app/components/comment-card';
import ContentContainer from '@/app/components/content-container';
import { useSession } from 'next-auth/react';

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

interface Comment {
    _id: string;
    content: string;
    author: {
        _id: string;
        username: string;
        profilePicture?: string;
    };
    upvotes: number;
    createdAt: string;
    parentComment?: string;
}

export default function PostDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const searchParams = useSearchParams();
    const focusedCommentId = searchParams.get('comment');
    const [post, setPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();
    const { data: session } = useSession();

    useEffect(() => {
        const fetchPostAndComments = async () => {
            try {
                const [postRes, commentsRes] = await Promise.all([
                    fetch(`/api/posts/${id}`),
                    fetch(`/api/posts/${id}/comments`)
                ]);

                if (!postRes.ok) {
                    throw new Error('Post not found');
                }

                const postData = await postRes.json();
                const commentsData = await commentsRes.json();

                setPost(postData);
                setComments(commentsData.comments);

                // If there's a focused comment, scroll to it
                if (focusedCommentId) {
                    setTimeout(() => {
                        const element = document.getElementById(`comment-${focusedCommentId}`);
                        if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    }, 100);
                }
            } catch (error) {
                console.error('Error:', error);
                router.push('/');
            } finally {
                setLoading(false);
            }
        };

        fetchPostAndComments();
    }, [id, router, focusedCommentId]);

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setSubmitting(true);
        try {
            const response = await fetch(`/api/posts/${id}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newComment })
            });

            if (response.ok) {
                const comment = await response.json();
                setComments(prev => [comment, ...prev]);
                setNewComment('');
            }
        } catch (error) {
            console.error('Error posting comment:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleReply = async (commentId: string, content: string) => {
        try {
            const response = await fetch(`/api/posts/${id}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    content,
                    parentComment: commentId
                })
            });

            if (response.ok) {
                const newComment = await response.json();
                setComments(prev => [newComment, ...prev]);
            }
        } catch (error) {
            console.error('Error posting reply:', error);
        }
    };

    const renderComments = (comments: Comment[]) => {
        // Only render direct comments in the post page
        return comments
            .filter(comment => !comment.parentComment)
            .map(comment => (
                <div key={comment._id} id={`comment-${comment._id}`} className="space-y-4">
                    <CommentCard
                        comment={comment}
                        onReply={handleReply}
                        isFocused={comment._id === focusedCommentId}
                        currentUserId={session?.user?.id}
                    />
                </div>
            ));
    };

    if (loading) {
        return <div className="p-4">Loading...</div>;
    }

    if (!post) {
        return <div className="p-4">Post not found</div>;
    }

    return (
        <ContentContainer>
            <div className="max-w-3xl mx-auto p-4 space-y-6">
                <PostCard post={post} isUpvoted={false} />
                
                {/* Comment Input Section */}
                <div className="bg-stone-100 rounded-lg p-4 shadow-sm">
                    <h2 className="text-sm font-medium text-gray-700 mb-2">
                        Comment as {post.author.username}
                    </h2>
                    <form onSubmit={handleSubmitComment}>
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="What are your thoughts?"
                            className="w-full min-h-[120px] p-4 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
                            disabled={submitting}
                        />
                        <div className="flex justify-end mt-2">
                            <button
                                type="submit"
                                disabled={submitting || !newComment.trim()}
                                className={`px-4 py-2 rounded-full text-white ${
                                    submitting || !newComment.trim()
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-green-600 hover:bg-green-700'
                                } transition duration-200`}
                            >
                                {submitting ? 'Commenting...' : 'Comment'}
                            </button>
                        </div>
                    </form>
                </div>
                
                {/* Comments Section */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900">Comments</h2>
                    {comments.length > 0 ? (
                        <div className="space-y-4">
                            {renderComments(comments)}
                        </div>
                    ) : (
                        <div className="text-gray-500 text-center py-8">
                            No comments yet. Be the first to comment!
                        </div>
                    )}
                </div>
            </div>
        </ContentContainer>
    );
} 