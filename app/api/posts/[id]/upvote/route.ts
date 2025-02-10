import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDb from '@/lib/db';
import Post from '@/lib/models/post';
import mongoose from 'mongoose';

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        await connectDb();

        const userId = new mongoose.Types.ObjectId(session.user.id);
        const postId = new mongoose.Types.ObjectId(params.id);

        const post = await Post.findById(postId);
        
        if (!post) {
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            );
        }

        const hasUpvoted = post.upvotedBy?.some(id => id.equals(userId)) || false;

        if (hasUpvoted) {
            // Remove upvote
            await Post.updateOne(
                { _id: postId },
                { 
                    $pull: { upvotedBy: userId },
                    $inc: { upvotes: -1 }
                }
            );
        } else {
            // Add upvote
            await Post.updateOne(
                { _id: postId },
                { 
                    $addToSet: { upvotedBy: userId },
                    $inc: { upvotes: 1 }
                }
            );
        }

        const updatedPost = await Post.findById(postId);

        return NextResponse.json({
            success: true
        });

    } catch (error) {
        console.error('Upvote error:', error);
        return NextResponse.json(
            { error: 'Failed to upvote post' },
            { status: 500 }
        );
    }
} 