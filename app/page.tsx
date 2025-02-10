'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import ContentContainer from '@/app/components/content-container';
import PostCard from './components/post-card';

interface Post {
    _id: string;
    title: string;
    content: string;
    author: {
        _id: string;
        username: string;
        profilePicture?: string;
    };
    upvotes: number;
    createdAt: string;
}

export default function Home() {
    const { data: session } = useSession();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('Session:', session);
    }, [session]);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await fetch('/api/posts');
                if (res.ok) {
                    const data = await res.json();
                    setPosts(data.posts);
                }
            } catch (error) {
                console.error('Error fetching posts:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <ContentContainer>
            <div className="space-y-4">
                {posts.map(post => (
                    <PostCard 
                        key={post._id} 
                        post={post} 
                        currentUserId={session?.user?.id || null}
                    />
                ))}
            </div>
        </ContentContainer>
    );
}
