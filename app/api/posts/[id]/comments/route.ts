import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDb from '@/lib/db';
import Comment from '@/lib/models/comment';
import Post from '@/lib/models/post';

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token');

        if (!token) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        const decoded = jwt.verify(token.value, process.env.JWT_SECRET!) as { userId: string };
        const { content } = await request.json();

        await connectDb();

        const comment = await Comment.create({
            content,
            author: decoded.userId,
            post: params.id
        });

        const populatedComment = await Comment.findById(comment._id)
            .populate('author', 'username profilePicture')
            .lean();

        return NextResponse.json(populatedComment, { status: 201 });
    } catch (error) {
        console.error('Comment error:', error);
        return NextResponse.json(
            { error: 'Failed to create comment' },
            { status: 500 }
        );
    }
}

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await connectDb();
        
        const comments = await Comment.find({ 
            post: params.id,
            isDeleted: { $ne: true }  // Only return non-deleted comments
        })
            .populate('author', 'username profilePicture')
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ comments });
    } catch (error) {
        console.error('Error fetching comments:', error);
        return NextResponse.json(
            { error: 'Failed to fetch comments' },
            { status: 500 }
        );
    }
} 