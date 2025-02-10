'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';
import { use } from 'react';

interface CreatePostProps {
    params: Promise<{
        name: string;
    }>;
}

export default function CreatePost({ params }: CreatePostProps) {
    const { name } = use(params);  // Unwrap params using React.use()
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: '',
        content: ''
    });
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setImage(null);
        setImagePreview('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const postData = new FormData();
            postData.append('title', formData.title);
            postData.append('content', formData.content);
            if (image) {
                postData.append('image', image);
            }

            const response = await fetch(`/api/comms/${name}/posts`, {  // Use unwrapped name
                method: 'POST',
                body: postData
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to create post');
            }

            router.push(`/communities/${name}`);  // Use unwrapped name
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Create a Post</h1>

            {error && (
                <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title
                    </label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-500 text-gray-900"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Content
                    </label>
                    <textarea
                        value={formData.content}
                        onChange={(e) => setFormData({...formData, content: e.target.value})}
                        className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-500 text-gray-900"
                        rows={6}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Image (optional)
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        {imagePreview ? (
                            <div className="relative">
                                <Image
                                    src={imagePreview}
                                    alt="Preview"
                                    width={300}
                                    height={200}
                                    className="object-cover rounded"
                                />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-1 text-center">
                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="flex text-sm text-gray-600">
                                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500">
                                        <span>Upload an image</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="sr-only"
                                            onChange={handleImageChange}
                                        />
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2 px-4 rounded-md text-white ${
                        loading 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-green-600 hover:bg-green-700'
                    } transition`}
                >
                    {loading ? 'Creating...' : 'Create Post'}
                </button>
            </form>
        </div>
    );
} 