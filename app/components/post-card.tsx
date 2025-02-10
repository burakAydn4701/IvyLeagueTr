'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ArrowBigUp, MessageCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import MoreOptionsMenu from './more-options-menu';
import { useSession } from 'next-auth/react';

interface Comment {
    _id: string;
    content: string;
    author: {
        username: string;
        profilePicture?: string;
    };
    createdAt: string;
}

interface PostCardProps {
    post: {
        _id: string;
        title: string;
        content: string;
        image?: string;
        author: {
            _id: string;
            username: string;
            profilePicture?: string;
        };
        upvotes: number;
        upvotedBy: string[];
        createdAt: string;
        isDeleted?: boolean;
    };
    currentUserId: string | null;
}

export default function PostCard({ post, currentUserId }: PostCardProps) {
    const { data: session } = useSession();
    const [upvoteCount, setUpvoteCount] = useState(post.upvotes);
    const [hasUpvoted, setHasUpvoted] = useState(
        Array.isArray(post.upvotedBy) && currentUserId 
            ? post.upvotedBy.includes(currentUserId)
            : false
    );
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const res = await fetch(`/api/posts/${post._id}/comments`);
                if (res.ok) {
                    const data = await res.json();
                    // Only count direct comments (ones without parentComment)
                    const directComments = data.comments.filter((c: any) => !c.parentComment);
                    setComments(directComments);
                }
            } catch (error) {
                console.error('Error fetching comments:', error);
            }
        };

        fetchComments();
    }, [post._id]);

    useEffect(() => {
        console.log('Post author:', post.author._id);
        console.log('Current user:', currentUserId);
    }, [post.author._id, currentUserId]);

    const handleUpvote = async (e: React.MouseEvent) => {
        e.stopPropagation();
        
        if (!session?.user) {
            router.push('/login');
            return;
        }

        try {
            setLoading(true);
            
            // Optimistically update UI
            const newHasUpvoted = !hasUpvoted;
            const newCount = hasUpvoted ? upvoteCount - 1 : upvoteCount + 1;
            setHasUpvoted(newHasUpvoted);
            setUpvoteCount(newCount);

            const response = await fetch(`/api/posts/${post._id}/upvote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                // Revert on error
                setHasUpvoted(hasUpvoted);
                setUpvoteCount(upvoteCount);
                throw new Error(data.error || 'Failed to upvote');
            }

        } catch (error) {
            console.error('Error upvoting:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/posts/${post._id}/comments`, {
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
            setLoading(false);
        }
    };

    const handlePostClick = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('button') || 
            (e.target as HTMLElement).closest('a')) {
            return;
        }
        router.push(`/posts/${post._id}`);
    };

    const handleCommentClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        router.push(`/posts/${post._id}`);
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this post?')) return;

        try {
            const response = await fetch(`/api/posts/${post._id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                router.refresh();
            }
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    };

    return (
        <div 
            className="bg-stone-100 rounded-lg p-4 shadow-sm cursor-pointer hover:bg-stone-50 transition"
            onClick={handlePostClick}
        >
            {post.isDeleted ? (
                <div className="text-gray-500 italic">This post has been deleted</div>
            ) : (
                <>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                            <Link href={`/users/${post.author.username}`} className="flex items-center">
                                <div className="w-8 h-8 relative rounded-full overflow-hidden">
                                    <Image
                                        src={post.author.profilePicture || '/default-avatar.jpg'}
                                        alt={post.author.username}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <span className="ml-2 font-medium text-gray-700">{post.author.username}</span>
                            </Link>
                            <span className="text-gray-500 text-sm">
                                {new Date(post.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        <MoreOptionsMenu
                            onDelete={handleDelete}
                            isAuthor={currentUserId === post.author._id}
                        />
                    </div>

                    {/* Post Content */}
                    <h3 className="text-xl font-semibold mb-2 text-gray-900">{post.title}</h3>
                    <p className="text-gray-700 mb-4">{post.content}</p>
                    {post.image && (
                        <div className="mb-4 rounded-lg overflow-hidden">
                            <Image
                                src={post.image}
                                alt={post.title}
                                width={800}
                                height={400}
                                className="w-auto h-auto"
                            />
                        </div>
                    )}

                    {/* Actions */}
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
                            onClick={handleCommentClick}
                            className="flex items-center space-x-1 text-gray-600 hover:text-gray-700"
                        >
                            <MessageCircle className="w-5 h-5" />
                            <span>{comments.length}</span>
                        </button>
                    </div>

                    {/* Comments Section */}
                    {showComments && (
                        <div className="mt-4 space-y-4 text-gray-900">
                            <form onSubmit={handleComment} className="flex space-x-2">
                                <input
                                    type="text"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Write a comment..."
                                    className="flex-1 px-4 py-2 border border-stone-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
                                    disabled={loading}
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:bg-gray-400"
                                >
                                    {loading ? 'Posting...' : 'Post'}
                                </button>
                            </form>

                            <div className="space-y-3 mt-4">
                                {comments.map(comment => (
                                    <div key={comment._id} className="flex space-x-2">
                                        <div className="w-8 h-8 relative rounded-full overflow-hidden flex-shrink-0">
                                            <Image
                                                src={comment.author.profilePicture || '/default-avatar.jpg'}
                                                alt={comment.author.username}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 bg-stone-200 rounded-lg p-3">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-medium text-gray-700">
                                                    {comment.author.username}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(comment.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-gray-700">{comment.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
} 