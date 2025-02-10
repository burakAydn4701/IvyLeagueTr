'use client';  // Add this at the top since we're using state

import { useState } from 'react';
import { useRouter } from 'next/navigation';  // Change this to next/navigation

export default function CreateCommunity() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        profilePicture: '/default-community.png',  // Default value
        banner: '/default-banner.jpg'              // Default value
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/comms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message);
            }

            const community = await response.json();
            router.push(`/communities/${community.name}`);
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 rounded-lg shadow-sm">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Create a New Community</h1>
            
            {error && (
                <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">
                        Community Name
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                        placeholder="Enter community name"
                        required
                    />
                </div>

                <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">
                        Description
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                        rows={6}
                        placeholder="Describe your community..."
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                    Create Community
                </button>
            </form>
        </div>
    );
} 