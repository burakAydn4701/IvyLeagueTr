import { NextResponse } from 'next/server';
import connectDb from '@/lib/db';
import User from '@/lib/models/user';

export async function GET() {
    try {
        await connectDb();
        const user = await User.findOne({ email: 'aydn64burak@gmail.com' });
        return NextResponse.json({
            found: !!user,
            isAdmin: user?.isAdmin,
            email: user?.email
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
} 