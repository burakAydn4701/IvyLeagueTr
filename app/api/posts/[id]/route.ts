import { NextResponse } from 'next/server';
import connectDb from '@/lib/db';
import Post from '@/lib/models/post';
import mongoose from 'mongoose';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await connectDb();

        if (!mongoose.Types.ObjectId.isValid(params.id)) {
            return NextResponse.json(
                { error: 'Invalid post ID' },
                { status: 400 }
            );
        }

        const post = await Post.findById(params.id)
            .populate('author', 'username profilePicture')
            .lean();

        if (!post) {
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(post);
    } catch (error) {
        console.error('Error fetching post:', error);
        return NextResponse.json(
            { error: 'Failed to fetch post' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await connectDb();
        
        // Mark post as deleted instead of actually deleting it
        await Post.findByIdAndUpdate(params.id, { isDeleted: true });

        return NextResponse.json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        return NextResponse.json(
            { error: 'Failed to delete post' },
            { status: 500 }
        );
    }
} 