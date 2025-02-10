'use client';

import { useState, useEffect, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface User {
    _id: string;
    username: string;
    profilePicture?: string;
    communities?: {
        _id: string;
        name: string;
        description: string;
        profilePicture?: string;
    }[];
    posts?: {
        _id: string;
        title: string;
        content: string;
        createdAt: string;
    }[];
}

export default function UserProfile({ params }: { params: Promise<{ username: string }> }) {
    const { username } = use(params);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch(`/api/users/${username}`);
                if (!response.ok) throw new Error('User not found');
                const data = await response.json();
                setUser(data.user);
            } catch (error) {
                setError('Failed to load user profile');
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [username]);

    const handleMessage = async () => {
        if (!user) return;
        
        try {
            const response = await fetch('/api/messages/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    receiverId: user._id
                })
            });

            if (response.ok) {
                router.push(`/messages?userId=${user._id}&username=${user.username}`);
            }
        } catch (error) {
            console.error('Error starting conversation:', error);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (!user) return <div>User not found</div>;

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Profile Header */}
            <div className="bg-stone-100 rounded-lg p-6 shadow-sm">
                <div className="flex items-start space-x-6">
                    <div className="w-32 h-32 relative rounded-full overflow-hidden">
                        <Image
                            src={user.profilePicture || '/default-avatar.jpg'}
                            alt={user.username}
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-bold text-black">{user.username}</h1>
                            <button
                                onClick={handleMessage}
                                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition"
                            >
                                <Mail className="w-5 h-5" />
                                <span>Message</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Communities Section */}
            <div className="mt-8">
                <h2 className="text-xl font-bold text-black mb-4">Communities</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user.communities?.map((community) => (
                        <Link
                            key={community._id}
                            href={`/communities/${community.name}`}
                            className="bg-stone-100 p-4 rounded-lg hover:bg-stone-200 transition"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 relative rounded-full overflow-hidden">
                                    <Image
                                        src={community.profilePicture || '/default-community.png'}
                                        alt={community.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-black">{community.name}</h3>
                                    <p className="text-black">{community.description}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Posts Section */}
            <div className="mt-8">
                <h2 className="text-xl font-bold text-black mb-4">Posts</h2>
                <div className="space-y-4">
                    {user.posts?.map((post) => (
                        <div key={post._id} className="bg-stone-100 p-4 rounded-lg">
                            <h3 className="font-semibold text-black">{post.title}</h3>
                            <p className="text-black mt-2">{post.content}</p>
                            <p className="text-black mt-2 text-sm">
                                Posted on {new Date(post.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
} 