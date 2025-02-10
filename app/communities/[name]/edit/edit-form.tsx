'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface EditFormProps {
    communityName: string;
}

interface Community {
    name: string;
    description: string;
    banner: string;
    profilePicture: string;
}

export default function EditForm({ communityName }: EditFormProps) {
    const router = useRouter();
    const [formData, setFormData] = useState<Community>({
        name: '',
        description: '',
        banner: '',
        profilePicture: ''
    });
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [error, setError] = useState('');
    const [imagePreview, setImagePreview] = useState({
        profilePicture: '',
        banner: ''
    });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        const fetchCommunity = async () => {
            try {
                const response = await fetch(`/api/comms/${communityName}`);
                if (!response.ok) throw new Error('Failed to fetch community');
                const data = await response.json();
                setFormData(data);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCommunity();
    }, [communityName]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'profilePicture' | 'banner') => {
        const file = e.target.files?.[0];
        if (file) {
            // Create URL for preview
            const url = URL.createObjectURL(file);
            setImagePreview(prev => ({
                ...prev,
                [type]: url
            }));

            // Store file in formData
            setFormData(prev => ({
                ...prev,
                [type]: file
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setError('');
        
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('description', formData.description);
            
            if (formData.profilePicture instanceof File) {
                formDataToSend.append('profilePicture', formData.profilePicture);
            }
            
            if (formData.banner instanceof File) {
                formDataToSend.append('banner', formData.banner);
            }

            const response = await fetch(`/api/comms/${communityName}`, {
                method: 'PATCH',
                body: formDataToSend,
            });

            const data = await response.json();
            console.log('Update response:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update community');
            }

            setStatus('success');
            
            setTimeout(() => {
                router.refresh();
                router.push(`/communities/${communityName}`);
            }, 1000);
            
        } catch (error: any) {
            console.error('Error updating community:', error);
            setStatus('error');
            setError(error.message);
        }
    };

    const handleDelete = async () => {
        try {
            const response = await fetch(`/api/comms/${communityName}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete community');
            }

            router.push('/'); // Redirect to home page after deletion
        } catch (error) {
            console.error('Error:', error);
            setError('Failed to delete community');
        }
    };

    // Clean up preview URLs when component unmounts
    useEffect(() => {
        return () => {
            if (imagePreview.profilePicture) {
                URL.revokeObjectURL(imagePreview.profilePicture);
            }
            if (imagePreview.banner) {
                URL.revokeObjectURL(imagePreview.banner);
            }
        };
    }, [imagePreview]);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="pt-16">
            <div className="max-w-2xl mx-auto p-6">
                <h1 className="text-3xl font-bold mb-6">Edit Community</h1>
                
                {status === 'error' && (
                    <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                {status === 'success' && (
                    <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                        Changes saved successfully!
                    </div>
                )}

                <div className="bg-stone-100 rounded-lg p-6 space-y-6">
                    <div>
                        <h2 className="text-xl font-semibold mb-4">General Settings</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Community Name
                                    <span className="text-gray-500 text-xs ml-2">(Cannot be changed)</span>
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 bg-gray-100 border rounded-md text-gray-600 cursor-not-allowed"
                                    value={formData.name}
                                    disabled
                                    title="Community names cannot be changed to maintain consistent URLs"
                                />
                                <p className="mt-1 text-sm text-gray-500">
                                    Community names are permanent to ensure stable URLs and references.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-500"
                                    rows={4}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Community Banner
                                </label>
                                {imagePreview.banner && (
                                    <div className="mb-2 relative h-32 w-full">
                                        <Image
                                            src={imagePreview.banner}
                                            alt="Banner preview"
                                            fill
                                            className="object-cover rounded"
                                            sizes="100vw"
                                        />
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="w-full"
                                    onChange={(e) => handleImageChange(e, 'banner')}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Community Icon
                                </label>
                                {imagePreview.profilePicture && (
                                    <div className="mb-2 relative w-20 h-20">
                                        <div className="w-full h-full relative rounded-full">
                                            <Image
                                                src={imagePreview.profilePicture}
                                                alt="Profile picture preview"
                                                fill
                                                className="rounded-full object-cover"
                                                sizes="80px"
                                            />
                                        </div>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="w-full"
                                    onChange={(e) => handleImageChange(e, 'profilePicture')}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className={`w-full ${
                                    status === 'loading' 
                                        ? 'bg-gray-400' 
                                        : 'bg-green-600 hover:bg-green-700'
                                } text-white py-2 px-4 rounded-md transition`}
                            >
                                {status === 'loading' ? 'Saving...' : 'Save Changes'}
                            </button>
                        </form>
                    </div>

                    <div className="pt-6 border-t">
                        <h2 className="text-xl font-semibold text-red-600 mb-4">Danger Zone</h2>
                        {!showDeleteConfirm ? (
                            <button
                                type="button"
                                className="bg-red-100 text-red-600 py-2 px-4 rounded-md hover:bg-red-200 transition"
                                onClick={() => setShowDeleteConfirm(true)}
                            >
                                Delete Community
                            </button>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-gray-700">
                                    Are you sure you want to delete this community? This action cannot be undone.
                                </p>
                                <div className="flex space-x-4">
                                    <button
                                        type="button"
                                        className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition"
                                        onClick={handleDelete}
                                    >
                                        Yes, Delete Community
                                    </button>
                                    <button
                                        type="button"
                                        className="bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition"
                                        onClick={() => setShowDeleteConfirm(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
} 