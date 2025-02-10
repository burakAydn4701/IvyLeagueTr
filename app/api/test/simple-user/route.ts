import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDb from '@/lib/db';
import User from '@/lib/models/user';

export async function GET() {
    try {
        await connectDb();
        
        // First, delete any existing test user
        await User.deleteOne({ email: 'simple@test.com' });
        
        // Create a simple password hash
        const plainPassword = 'test123';
        const hashedPassword = await bcrypt.hash(plainPassword, 10);
        
        // Test the hash immediately
        const testCompare = await bcrypt.compare(plainPassword, hashedPassword);
        
        // Create user
        const user = await User.create({
            username: 'simpletest',
            email: 'simple@test.com',
            password: hashedPassword
        });

        return NextResponse.json({
            message: 'Simple test user created',
            email: 'simple@test.com',
            password: 'test123',
            hashWorks: testCompare,
            storedHash: user.password
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
} 