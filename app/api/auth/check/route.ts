import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt, { JwtPayload } from 'jsonwebtoken';
import connectDb from '@/lib/db';
import User from '@/lib/models/user';

interface DecodedToken extends JwtPayload {
    userId: string;
}

export async function GET() {
    try {
        const cookieStore = await cookies();
        const tokenCookie = cookieStore.get('token');

        console.log('Auth check - token:', tokenCookie?.value ? 'exists' : 'none');

        if (!tokenCookie) {
            return NextResponse.json({ user: null });
        }

        const decoded = jwt.verify(tokenCookie.value, process.env.JWT_SECRET!) as DecodedToken;
        
        await connectDb();
        const user = await User.findById(decoded.userId)
            .select('email username profilePicture isAdmin')
            .lean();

        console.log('Found user with data:', user);

        if (!user) {
            return NextResponse.json({ user: null });
        }

        return NextResponse.json({ user });
    } catch (error) {
        console.error('Auth check error:', error);
        return NextResponse.json({ user: null });
    }
} 