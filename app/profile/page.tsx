'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Edit2, Calendar } from 'lucide-react';
import Link from 'next/link';

interface Community {
    _id: string;
    name: string;
    description: string;
    profilePicture?: string;
}

interface Post {
    _id: string;
    title: string;
    content: string;
    createdAt: string;
}

interface User {
    username: string;
    email: string;
    bio: string;
    profilePicture?: string;
    createdAt: string;
    posts: Post[];
    communities: Community[];
    isAdmin: boolean;
}

export default function Profile() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'posts' | 'communities'>('posts');
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch('/api/profile');
                if (!response.ok) throw new Error('Failed to fetch profile');
                const data = await response.json();
                setUser(data.user);
            } catch (err) {
                setError('Failed to load profile');
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (!user) return <div>Please log in to view your profile</div>;

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Profile Header */}
            <div className="bg-stone-100 rounded-lg shadow-md p-6 mb-6">
                <div className="flex items-start space-x-6">
                    <div className="relative">
                        <div className="w-32 h-32 relative rounded-full overflow-hidden">
                            <Image
                                src={user?.profilePicture || '/default-avatar.jpg'}
                                alt={user?.username || 'Profile'}
                                fill
                                sizes="128px"
                                className="object-cover"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = '/default-avatar.jpg';
                                }}
                            />
                        </div>
                        <Link
                            href="/profile/edit"
                            className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md hover:bg-stone-100 transition"
                        >
                            <Edit2 className="w-4 h-4 text-gray-600" />
                        </Link>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-700">
                            {user.username}
                            {user.isAdmin && (
                                <span className="ml-2 px-2 py-1 text-sm bg-green-100 text-green-800 rounded-full">
                                    Admin
                                </span>
                            )}
                        </h1>
                        <p className="text-gray-600 mt-1">{user.email}</p>
                        <div className="flex items-center mt-4 text-sm text-gray-500">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs and Content */}
            <div className="bg-stone-100 rounded-lg shadow-md p-6">
                <div className="flex space-x-4 mb-6">
                    <button
                        onClick={() => setActiveTab('posts')}
                        className={`px-4 py-2 rounded-md ${
                            activeTab === 'posts'
                                ? 'bg-green-600 text-white'
                                : 'text-gray-600 hover:bg-stone-200'
                        }`}
                    >
                        Posts
                    </button>
                    <button
                        onClick={() => setActiveTab('communities')}
                        className={`px-4 py-2 rounded-md ${
                            activeTab === 'communities'
                                ? 'bg-green-600 text-white'
                                : 'text-gray-600 hover:bg-stone-200'
                        }`}
                    >
                        Communities
                    </button>
                </div>

                {/* Content */}
                <div>
                    {activeTab === 'posts' ? (
                        user?.posts?.length > 0 ? (
                            user.posts.map((post) => (
                                <div key={post._id} className="bg-stone-100 rounded-lg p-4">
                                    <h3 className="text-lg font-medium text-gray-700">{post.title}</h3>
                                    <p className="text-gray-600 mt-1">{post.content}</p>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-500 py-8">No posts yet</div>
                        )
                    ) : (
                        user?.communities?.length > 0 ? (
                            user.communities.map((community) => (
                                <div key={community._id} className="bg-stone-100 rounded-lg p-4">
                                    <Link href={`/communities/${community.name}`} className="flex items-center space-x-4">
                                        <div className="w-12 h-12 relative">
                                            <Image
                                                src={community.profilePicture || '/default-avatar.jpg'}
                                                alt={community.name}
                                                fill
                                                sizes="48px"
                                                className="rounded-full object-cover"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = '/default-avatar.jpg';
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-700">{community.name}</h3>
                                            <p className="text-gray-600 mt-1">{community.description}</p>
                                        </div>
                                    </Link>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-500 py-8">No communities joined yet</div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
} 