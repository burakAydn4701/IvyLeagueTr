'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Settings, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PostCard from '@/app/components/post-card';
import { useSession } from 'next-auth/react';

interface Community {
    name: string;
    description: string;
    members: string[];
    createdAt: string;
    profilePicture: string;
    banner: string;
    posts?: Post[];
}

interface User {
    _id: string;
    email: string;
    username: string;
    profilePicture?: string;
    isAdmin: boolean;
}

interface Post {
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
    createdAt: string;
}

interface CommunityContentProps {
    communityName: string;
}

export default function CommunityContent({ communityName }: CommunityContentProps) {
    const [community, setCommunity] = useState<Community | null>(null);
    const [loading, setLoading] = useState(true);
    const [isMember, setIsMember] = useState(false);
    const [joinLoading, setJoinLoading] = useState(false);
    const router = useRouter();
    const [posts, setPosts] = useState<Post[]>([]);
    const { data: session } = useSession();

    const fetchCommunity = async () => {
        try {
            const response = await fetch(`/api/comms/${communityName}`);
            if (!response.ok) throw new Error('Community not found');
            const data = await response.json();
            setCommunity(data);
            setIsMember(data.isMember);
        } catch (error) {
            console.error('Error fetching community:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPosts = async () => {
        try {
            const response = await fetch(`/api/comms/${communityName}/posts`);
            if (!response.ok) throw new Error('Failed to fetch posts');
            const data = await response.json();
            setPosts(data.posts);
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            await Promise.all([
                fetchCommunity(),
                fetchPosts()
            ]);
        };
        loadData();
    }, [communityName]);

    const handleJoinToggle = async () => {
        if (!session) {
            router.push('/login');
            return;
        }

        try {
            setJoinLoading(true);
            const response = await fetch(`/api/comms/${communityName}/${isMember ? 'leave' : 'join'}`, {
                method: 'POST'
            });
            
            if (!response.ok) throw new Error('Failed to toggle membership');
            
            setIsMember(!isMember);
            router.refresh();
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setJoinLoading(false);
        }
    };

    const handleDeletePost = async (postId: string) => {
        if (!confirm('Are you sure you want to delete this post?')) return;

        try {
            const response = await fetch(`/api/comms/${communityName}/posts/${postId}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Failed to delete post');
            
            fetchPosts();
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!community) return <div>Community not found</div>;

    return (
        <div className="pt-16">
            {/* Banner */}
            <div className="h-32 bg-green-600 relative">
                {community.banner && (
                    <Image
                        src={community.banner}
                        alt="Community Banner"
                        fill
                        className="object-cover opacity-50"
                        sizes="100vw"
                    />
                )}
            </div>

            {/* Community Info Section */}
            <div className="max-w-5xl mx-auto px-4">
                <div className="relative bg-stone-100 rounded-lg shadow-lg -mt-8 p-6">
                    {/* Community Icon */}
                    <div className="absolute -top-6 left-6">
                        <div className="w-20 h-20 bg-white rounded-full border-4 border-white overflow-hidden relative">
                            <Image
                                src={community.profilePicture || '/default-community.png'}
                                alt={community.name}
                                fill
                                className="object-cover"
                                sizes="80px"
                                priority
                                style={{ width: '100%', height: '100%' }}
                                onError={(e) => {
                                    console.error('Image load error:', e);
                                    e.currentTarget.src = '/default-community.png';
                                }}
                            />
                        </div>
                    </div>

                    {/* Community Details */}
                    <div className="ml-24">
                        <h1 className="text-3xl font-bold text-black">{community.name}</h1>
                        <p className="text-black mt-2">{community.description}</p>
                        <div className="flex items-center mt-4 text-sm text-black">
                            <span>{community.members?.length || 0} members</span>
                            <span className="mx-2">•</span>
                            <span>Created {new Date(community.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="absolute top-6 right-6 flex items-center space-x-3">
                        {(isMember || session?.user?.isAdmin) && (
                            <Link
                                href={`/communities/${community.name}/edit`}
                                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-green-600 transition"
                            >
                                <Settings className="w-5 h-5" />
                                <span>Edit</span>
                            </Link>
                        )}
                        
                        <button 
                            onClick={handleJoinToggle}
                            disabled={joinLoading}
                            className={`px-8 py-2 rounded-full transition ${
                                isMember 
                                    ? 'bg-stone-200 text-gray-700 hover:bg-stone-300'
                                    : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                        >
                            {joinLoading ? 'Loading...' : (isMember ? 'Leave' : 'Join Community')}
                        </button>
                    </div>
                </div>

                {/* Create Post Button */}
                {(isMember || session?.user?.isAdmin) && (
                    <div className="mt-6 mb-4">
                        <Link 
                            href={`/communities/${community.name}/create-post`}
                            className="inline-flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Create Post</span>
                        </Link>
                    </div>
                )}

                {/* Posts Section */}
                <div className="mt-6 space-y-4">
                    {posts.length > 0 ? (
                        posts.map((post) => (
                            <PostCard 
                                key={post._id} 
                                post={post}
                                isUpvoted={false}
                                currentUserId={session?.user?.id || null}
                            />
                        ))
                    ) : (
                        <div className="text-center text-black py-8">
                            {(isMember || session?.user?.isAdmin) ? (
                                'No posts yet. Be the first to post in this community!'
                            ) : (
                                'Join the community to create posts!'
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}