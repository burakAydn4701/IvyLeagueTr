import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDb from '@/lib/db';
import User from '@/lib/models/user';

export async function GET() {
    try {
        await connectDb();
        
        // Simple test user
        const hashedPassword = await bcrypt.hash('test123', 10);
        
        const user = await User.create({
            username: 'test',
            email: 'test@test.com',
            password: hashedPassword
        });

        return NextResponse.json({
            message: 'Test user created',
            email: 'test@test.com',
            password: 'test123' // The password to use
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
} 