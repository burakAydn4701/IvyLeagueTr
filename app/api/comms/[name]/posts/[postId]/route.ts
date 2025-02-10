import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDb from '@/lib/db';
import Post from '@/lib/models/post';
import { unlink } from 'fs/promises';
import { join } from 'path';
import User from '@/lib/models/user';

export async function DELETE(
    request: Request,
    { params }: { params: { name: string; postId: string } }
) {
    try {
        const cookieStore = cookies();
        const token = cookieStore.get('token');

        if (!token) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        const decoded = jwt.verify(token.value, process.env.JWT_SECRET!) as { userId: string };
        await connectDb();

        // Find the post
        const post = await Post.findById(params.postId)
            .populate('author', '_id')
            .lean();

        if (!post) {
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            );
        }

        // Check if user is author or admin
        const user = await User.findById(decoded.userId).select('isAdmin').lean();
        if (!user?.isAdmin && post.author._id.toString() !== decoded.userId) {
            return NextResponse.json(
                { error: 'Not authorized' },
                { status: 403 }
            );
        }

        // Delete the post's image if it exists
        if (post.image) {
            const imagePath = join('public', post.image);
            try {
                await unlink(imagePath);
            } catch (error) {
                console.error('Error deleting image file:', error);
            }
        }

        // Delete the post
        await Post.findByIdAndDelete(params.postId);

        return NextResponse.json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Delete post error:', error);
        return NextResponse.json(
            { error: 'Failed to delete post' },
            { status: 500 }
        );
    }
} 