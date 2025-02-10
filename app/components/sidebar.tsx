'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Home, PlusCircle, Users } from 'lucide-react';

interface Community {
    name: string;
    description: string;
}

export const Sidebar = () => {
    const [communities, setCommunities] = useState<Community[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCommunities = async () => {
            try {
                const response = await fetch('/api/comms');
                if (!response.ok) throw new Error('Failed to fetch communities');
                const data = await response.json();
                console.log('Fetched communities:', data);
                setCommunities(data);
            } catch (error) {
                console.error('Error fetching communities:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCommunities();
    }, []);

    return (
        <div className="w-64 bg-stone-100 h-[calc(100vh-64px)] fixed left-0 top-[64px] shadow-md p-4 overflow-y-auto">
            <div className="space-y-4">
                {/* Home Button */}
                <Link 
                    href="/" 
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-stone-200 text-gray-700 hover:text-green-600"
                >
                    <Home className="w-5 h-5" />
                    <span>Home</span>
                </Link>

                {/* Create Community Button */}
                <Link 
                    href="/communities/create" 
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-stone-200 text-gray-700 hover:text-green-600"
                >
                    <PlusCircle className="w-5 h-5" />
                    <span>Create Community</span>
                </Link>

                {/* Communities Section */}
                <div className="pt-4">
                    <div className="flex items-center space-x-2 px-3 mb-2 text-gray-500">
                        <Users className="w-4 h-4" />
                        <span className="text-sm font-semibold">Communities</span>
                    </div>
                    
                    {loading ? (
                        <div className="text-gray-500 text-sm p-3">Loading...</div>
                    ) : (
                        <div className="space-y-1">
                            {communities.map((community) => (
                                <Link
                                    key={community.name}
                                    href={`/communities/${community.name}`}
                                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-stone-200 text-gray-700 hover:text-gray-900 text-sm"
                                >
                                    <span>{community.name}</span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Sidebar; 