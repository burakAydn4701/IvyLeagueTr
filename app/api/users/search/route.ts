import { NextResponse } from 'next/server';
import connectDb from '@/lib/db';
import User from '@/lib/models/user';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');

        if (!query) {
            return NextResponse.json({ users: [] });
        }

        await connectDb();

        const users = await User.find({
            username: { $regex: query, $options: 'i' }
        })
        .select('username profilePicture')
        .limit(10)
        .lean();

        return NextResponse.json({ users });
    } catch (error) {
        console.error('User search error:', error);
        return NextResponse.json(
            { error: 'Failed to search users' },
            { status: 500 }
        );
    }
} 