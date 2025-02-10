import { NextRequest, NextResponse } from 'next/server';
import connectDb from '@/lib/db';
import Comment from '@/lib/models/comment';

interface Context {
  params: {
    id: string;
  };
}

export async function GET(req: NextRequest, context: Context) {
  try {
    const { id } = context.params;
    await connectDb();

    const replies = await Comment.find({ parentComment: id })
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
