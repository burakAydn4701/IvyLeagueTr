'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ArrowBigUp, MessageCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import MoreOptionsMenu from './more-options-menu';
import { useSession } from 'next-auth/react';

interface CommentProps {
    comment: {
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
        isDeleted?: boolean;
    };
    isUpvoted?: boolean;
    onReply: (commentId: string, content: string) => Promise<void>;
    currentUserId: string | null;
}

export default function CommentCard({ comment, isUpvoted = false, onReply, currentUserId }: CommentProps) {
    const router = useRouter();
    const _searchParams = useSearchParams();
    const { data: session } = useSession();
    const [upvoteCount, setUpvoteCount] = useState(comment.upvotes || 0);
    const [hasUpvoted, setHasUpvoted] = useState(isUpvoted);
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [replyCount, setReplyCount] = useState(0);

    useEffect(() => {
        const fetchReplies = async () => {
            try {
                const res = await fetch(`/api/comments/${comment._id}/replies`);
                if (res.ok) {
                    const data = await res.json();
                    setReplyCount(data.replies.length);
                }
            } catch (error) {
                console.error('Error fetching replies:', error);
            }
        };

        fetchReplies();
    }, [comment._id]);

    useEffect(() => {
        console.log('Comment author:', comment.author._id);
        console.log('Current user:', currentUserId);
    }, [comment.author._id, currentUserId]);

    const _handleCommentClick = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('button') || 
            (e.target as HTMLElement).closest('a')) {
            return;
        }
        router.push(`/comments/${comment._id}`);
    };

    const handleUpvote = async (e: React.MouseEvent) => {
        e.stopPropagation();
        
        if (!session?.user) {
            router.push('/login');
            return;
        }

        try {
            setLoading(true);
            const newCount = hasUpvoted ? upvoteCount - 1 : upvoteCount + 1;
            setUpvoteCount(newCount);
            setHasUpvoted(!hasUpvoted);

            const response = await fetch(`/api/comments/${comment._id}/upvote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                // Revert changes if request fails
                setUpvoteCount(upvoteCount);
                setHasUpvoted(hasUpvoted);
                throw new Error(data.error || data.details || 'Failed to upvote');
            }

            setUpvoteCount(data.upvotes);
            setHasUpvoted(data.hasUpvoted);
        } catch (error) {
            console.error('Error upvoting:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyContent.trim()) return;

        setLoading(true);
        try {
            await onReply(comment._id, replyContent);
            setReplyContent('');
            setShowReplyForm(false);
        } catch (error) {
            console.error('Error posting reply:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(`/api/comments/${comment._id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to delete comment');
            // Optionally refresh the page or update the UI
            window.location.reload();
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    return (
        <div className="rounded-lg p-4 hover:bg-opacity-90 transition cursor-pointer">
            {comment.isDeleted ? (
                <div className="text-gray-500 italic">This comment has been deleted</div>
            ) : (
                <>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                            <Link href={`/users/${comment.author.username}`} className="flex items-center">
                                <div className="w-8 h-8 relative rounded-full overflow-hidden">
                                    <Image
                                        src={comment.author.profilePicture || '/default-avatar.jpg'}
                                        alt={comment.author.username}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <span className="ml-2 font-medium text-gray-700">{comment.author.username}</span>
                            </Link>
                            <span className="text-gray-500 text-sm">
                                {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        {currentUserId === comment.author._id && (
                            <MoreOptionsMenu 
                                onDelete={handleDelete}
                                isAuthor={true}
                            />
                        )}
                    </div>

                    <p className="text-gray-700 mb-4">{comment.content}</p>

                    <div className="flex items-center space-x-4 border-t border-stone-200 pt-3">
                        <button
                            onClick={handleUpvote}
                            disabled={loading}
                            className="flex items-center gap-1"
                        >
                            <ArrowBigUp 
                                className={`w-6 h-6 ${
                                    hasUpvoted 
                                        ? 'fill-green-600 stroke-green-600' 
                                        : 'fill-green-600/0 stroke-gray-700 hover:stroke-green-600'
                                } ${loading ? 'opacity-50' : ''}`}
                            />
                            <span className={`text-sm font-medium ${
                                hasUpvoted ? 'text-green-600' : 'text-gray-700'
                            }`}>
                                {upvoteCount || 0}
                            </span>
                        </button>
                        <button
                            onClick={() => setShowReplyForm(!showReplyForm)}
                            className="flex items-center space-x-1 text-gray-600 hover:text-gray-700"
                        >
                            <MessageCircle className="w-5 h-5" />
                            <span>{replyCount}</span>
                        </button>
                    </div>

                    {showReplyForm && (
                        <form onSubmit={handleReply} className="mt-4 flex space-x-2">
                            <input
                                type="text"
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder="Write a reply..."
                                className="flex-1 px-4 py-2 border border-stone-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
                                disabled={loading}
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:bg-gray-400"
                            >
                                {loading ? 'Posting...' : 'Reply'}
                            </button>
                        </form>
                    )}
                </>
            )}
        </div>
    );
} 