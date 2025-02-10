'use client';

import { use } from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PostCard from '@/app/components/post-card';
import CommentCard from '@/app/components/comment-card';

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
    const [post, setPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

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
            } catch (error) {
                console.error('Error:', error);
                router.push('/');
            } finally {
                setLoading(false);
            }
        };

        fetchPostAndComments();
    }, [id, router]);

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

    if (loading) {
        return <div className="p-4">Loading...</div>;
    }

    if (!post) {
        return <div className="p-4">Post not found</div>;
    }

    return (
        <div className="max-w-3xl mx-auto p-4 space-y-4">
            <PostCard post={post} isUpvoted={false} />
            
            <div className="mt-8 space-y-4">
                <h2 className="text-xl font-bold text-gray-900">Comments</h2>
                {comments.map(comment => (
                    <CommentCard
                        key={comment._id}
                        comment={comment}
                        onReply={handleReply}
                    />
                ))}
            </div>
        </div>
    );
}