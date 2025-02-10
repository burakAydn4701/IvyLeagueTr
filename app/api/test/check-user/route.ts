import { NextResponse } from 'next/server';
import connectDb from '@/lib/db';
import User from '@/lib/models/user';

export async function GET() {
    try {
        await connectDb();
        
        const user = await User.findOne({ email: 'test@test.com' });
        
        if (!user) {
            return NextResponse.json({ message: 'User not found' });
        }

        return NextResponse.json({
            found: true,
            user: {
                email: user.email,
                username: user.username,
                hashedPassword: user.password,
                passwordLength: user.password?.length
            }
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
} 