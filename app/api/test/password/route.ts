import { NextResponse } from 'next/server';
import connectDb from '@/lib/db';
import User from '@/lib/models/user';

export async function GET() {
    try {
        await connectDb();
        
        // Find all users
        const users = await User.find({}, 'email username password');
        
        if (!users.length) {
            return NextResponse.json({ message: 'No users found' }, { status: 404 });
        }

        // Return all users info for debugging
        return NextResponse.json(users.map(user => ({
            email: user.email,
            username: user.username,
            hashedPassword: user.password,
            passwordLength: user.password?.length
        })));

    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(
            { message: 'Error checking users' },
            { status: 500 }
        );
    }
} 