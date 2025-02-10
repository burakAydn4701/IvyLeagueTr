import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDb from '@/lib/db';
import User from '@/lib/models/user';
import Community from '@/lib/models/community';

export async function POST(
    request: Request,
    { params }: { params: { name: string } }
) {
    try {
        const cookieStore = cookies();
        const token = cookieStore.get('token');

        if (!token) {
            return NextResponse.json(
                { error: 'Not authenticated' }, 
                { status: 401 }
            );
        }

        const decoded = jwt.verify(token.value, process.env.JWT_SECRET!) as { userId: string };
        await connectDb();

        const [user, community] = await Promise.all([
            User.findById(decoded.userId),
            Community.findOne({ name: params.name })
        ]);

        if (!user || !community) {
            return NextResponse.json(
                { error: 'User or community not found' },
                { status: 404 }
            );
        }

        // Remove user from community members
        community.members = community.members.filter(id => !id.equals(user._id));
        await community.save();

        // Remove community from user's communities
        user.communities = user.communities.filter(id => !id.equals(community._id));
        await user.save();

        return NextResponse.json({ message: 'Left successfully' });
    } catch (error) {
        console.error('Leave error:', error);
        return NextResponse.json(
            { error: 'Server error' },
            { status: 500 }
        );
    }
} 