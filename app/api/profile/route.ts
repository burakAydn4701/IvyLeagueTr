import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDb from '@/lib/db';
import User from '@/lib/models/user';
import Community from '@/lib/models/community';
import Post from '@/lib/models/post';

interface DecodedToken {
    userId: string;
    iat: number;
    exp: number;
}

export async function GET() {
    try {
        const cookieStore = cookies();
        const token = cookieStore.get('token');

        if (!token) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const decoded = jwt.verify(token.value, process.env.JWT_SECRET!) as DecodedToken;
        await connectDb();
        
        console.log('Fetching user profile for ID:', decoded.userId);

        // First get the user without population
        const user = await User.findById(decoded.userId)
            .select('-password')
            .lean();

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Then get communities separately
        const communities = user.communities ? 
            await Community.find({
                '_id': { $in: user.communities }
            })
            .select('name description profilePicture')
            .lean() : [];

        // And posts separately
        const posts = user.posts ? 
            await Post.find({
                '_id': { $in: user.posts }
            })
            .sort({ createdAt: -1 })
            .lean() : [];

        console.log('Found data:', {
            userId: user._id,
            communitiesCount: communities.length,
            postsCount: posts.length
        });

        return NextResponse.json({ 
            user: {
                ...user,
                communities,
                posts
            }
        });

    } catch (error) {
        console.error('Profile error:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        return NextResponse.json({ 
            error: 'Server error',
            details: error.message,
            name: error.name
        }, { status: 500 });
    }
} 