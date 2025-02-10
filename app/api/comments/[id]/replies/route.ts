import { NextResponse } from 'next/server';
import connectDb from '@/lib/db';
import Comment from '@/lib/models/comment';

type Context = {
    params: { id: string };
    searchParams: { [key: string]: string | string[] | undefined };
};

export async function GET(
    _request: Request,
    context: Context
) {
    try {
        await connectDb();
        
        const replies = await Comment.find({ parentComment: context.params.id })
            .populate('author', 'username profilePicture')
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ replies });
    } catch (error) {
        console.error('Error fetching replies:', error);
        return NextResponse.json(
            { error: 'Failed to fetch replies' },
            { status: 500 }
        );
    }
}
