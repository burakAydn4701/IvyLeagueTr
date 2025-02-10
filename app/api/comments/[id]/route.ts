import { NextRequest, NextResponse } from 'next/server';
import connectDb from '@/lib/db';
import Comment from '@/lib/models/comment';

export async function GET(request: NextRequest, context: { params: { id: string } }) {
    try {
        await connectDb();

        const comment = await Comment.findById(context.params.id)
            .populate('author', 'username profilePicture')
            .lean();

        if (!comment) {
            return NextResponse.json(
                { error: 'Comment not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(comment);
    } catch (error) {
        console.error('Error fetching comment:', error);
        return NextResponse.json(
            { error: 'Failed to fetch comment' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest, context: { params: { id: string } }) {
    try {
        await connectDb();
        const { content } = await request.json();

        const parentComment = await Comment.findById(context.params.id);
        if (!parentComment) {
            return NextResponse.json(
                { error: 'Parent comment not found' },
                { status: 404 }
            );
        }

        const newComment = await Comment.create({
            content,
            author: parentComment.author,
            post: parentComment.post,
            parentComment: context.params.id
        });

        // Update parent comment's replies array
        await Comment.findByIdAndUpdate(context.params.id, {
            $push: { replies: newComment._id }
        });

        return NextResponse.json(newComment);
    } catch (error) {
        console.error('Error posting reply:', error);
        return NextResponse.json(
            { error: 'Failed to post reply' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
    try {
        await connectDb();
        
        // Mark comment as deleted instead of actually deleting it
        await Comment.findByIdAndUpdate(context.params.id, { isDeleted: true });

        return NextResponse.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        return NextResponse.json(
            { error: 'Failed to delete comment' },
            { status: 500 }
        );
    }
}
