'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Upload, X } from 'lucide-react';

interface User {
    _id: string;
    username: string;
    email: string;
    profilePicture?: string;
}

export default function EditProfile() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
    });
    const [profilePicture, setProfilePicture] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch('/api/auth/check');
                if (response.ok) {
                    const data = await response.json();
                    setUser(data.user);
                    setFormData({
                        username: data.user.username,
                        email: data.user.email,
                    });
                    if (data.user.profilePicture) {
                        setImagePreview(data.user.profilePicture);
                    }
                }
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        };
        fetchUser();
    }, []);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProfilePicture(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setProfilePicture(null);
        setImagePreview('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            console.log('Submitting form data:', formData);
            
            const formDataToSend = new FormData();
            formDataToSend.append('username', formData.username);
            if (profilePicture) {
                formDataToSend.append('profilePicture', profilePicture);
            }

            const response = await fetch('/api/profile/update', {
                method: 'PATCH',
                body: formDataToSend,
            });

            const data = await response.json();
            console.log('Response:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update profile');
            }

            setSuccess('Profile updated successfully!');
            setTimeout(() => {
                router.push('/profile');
                router.refresh(); // Force a refresh of the profile page
            }, 1500);
        } catch (err: any) {
            console.error('Update error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Profile</h1>

            {error && (
                <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    {success}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Profile Picture
                    </label>
                    <div className="mt-1 flex items-center space-x-4">
                        {imagePreview ? (
                            <div className="relative">
                                <div className="w-24 h-24 relative rounded-full overflow-hidden">
                                    <Image
                                        src={imagePreview}
                                        alt="Profile preview"
                                        fill
                                        sizes="96px"
                                        className="object-cover"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center">
                                <label className="cursor-pointer">
                                    <Upload className="w-8 h-8 text-gray-400" />
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                </label>
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Username
                    </label>
                    <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-500"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                    </label>
                    <input
                        type="email"
                        value={formData.email}
                        disabled
                        className="w-full px-4 py-2 border rounded-md bg-gray-50 text-gray-500"
                    />
                    <p className="mt-1 text-sm text-gray-500">Email cannot be changed</p>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2 px-4 rounded-md text-white ${
                        loading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
                    } transition`}
                >
                    {loading ? 'Updating...' : 'Save Changes'}
                </button>
            </form>
        </div>
    );
} 