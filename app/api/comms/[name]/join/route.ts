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

        console.log('Attempting to join community:', params.name);
        console.log('User ID:', decoded.userId);

        const [user, community] = await Promise.all([
            User.findById(decoded.userId),
            Community.findOne({ name: params.name })
        ]);

        console.log('Found user:', user?._id);
        console.log('Found community:', community?.name);

        if (!user || !community) {
            console.log('Missing user or community:', { user: !!user, community: !!community });
            return NextResponse.json(
                { error: 'User or community not found' },
                { status: 404 }
            );
        }

        // Check if user is already a member
        const isMember = community.members.some(id => id.toString() === user._id.toString());
        console.log('Is already member:', isMember);

        if (isMember) {
            return NextResponse.json({ message: 'Already a member' });
        }

        // Add user to community members
        community.members.push(user._id);
        await community.save();
        console.log('Added to community members');

        // Add community to user's communities
        if (!user.communities) {
            user.communities = [];
        }
        user.communities.push(community._id);
        await user.save();
        console.log('Added to user communities');

        return NextResponse.json({ message: 'Joined successfully' });
    } catch (error) {
        console.error('Join error:', error);
        return NextResponse.json(
            { error: 'Server error', details: error.message },
            { status: 500 }
        );
    }
} 