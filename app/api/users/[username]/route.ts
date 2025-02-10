import { NextResponse } from 'next/server';
import connectDb from '@/lib/db';
import User from '@/lib/models/user';
import Community from '@/lib/models/community';
import Post from '@/lib/models/post';

export async function GET(
    request: Request,
    { params }: { params: { username: string } }
) {
    try {
        await connectDb();

        const user = await User.findOne({ username: params.username })
            .select('username profilePicture')
            .lean();

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Get user's communities
        const communities = await Community.find({
            members: user._id
        })
        .select('name description profilePicture')
        .lean();

        // Get user's posts
        const posts = await Post.find({
            author: user._id
        })
        .sort({ createdAt: -1 })
        .select('title content createdAt')
        .lean();

        return NextResponse.json({
            user: {
                ...user,
                communities,
                posts
            }
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user' },
            { status: 500 }
        );
    }
} 