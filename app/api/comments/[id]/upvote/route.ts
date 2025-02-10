import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDb from '@/lib/db';
import Comment from '@/lib/models/comment';
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

        const comment = await Comment.findById(params.id);
        if (!comment) {
            return NextResponse.json(
                { error: 'Comment not found' },
                { status: 404 }
            );
        }

        // Ensure upvotedBy is initialized
        if (!Array.isArray(comment.upvotedBy)) {
            comment.upvotedBy = [];
        }

        const userId = new mongoose.Types.ObjectId(session.user.id);
        const hasUpvoted = comment.upvotedBy.some(id => id.toString() === session.user.id);

        if (hasUpvoted) {
            // Remove upvote
            comment.upvotes = Math.max(0, comment.upvotes - 1);
            comment.upvotedBy = comment.upvotedBy.filter(id => id.toString() !== session.user.id);
        } else {
            // Add upvote
            comment.upvotes = (comment.upvotes || 0) + 1;
            comment.upvotedBy.push(userId);
        }

        await comment.save();

        return NextResponse.json({
            upvotes: comment.upvotes,
            hasUpvoted: !hasUpvoted // Toggle the state
        });
    } catch (error) {
        console.error('Upvote error:', error);
        return NextResponse.json(
            { error: 'Failed to upvote comment', details: error.message },
            { status: 500 }
        );
    }
} 