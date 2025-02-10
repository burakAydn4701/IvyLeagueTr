import { NextRequest, NextResponse } from 'next/server';
import connectDb from '@/lib/db';
import Comment from '@/lib/models/comment';

export async function GET(request: NextRequest) {
  try {
    // Extract 'id' from the request URL
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID parameter is missing' },
        { status: 400 }
      );
    }

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
