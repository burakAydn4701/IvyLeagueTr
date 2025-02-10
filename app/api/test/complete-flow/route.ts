import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDb from '@/lib/db';
import User from '@/lib/models/user';

export async function GET() {
    try {
        await connectDb();
        
        // 1. Clear any existing test user
        await User.deleteOne({ email: 'flow@test.com' });
        
        // 2. Create password hash
        const password = 'test123';
        const hash = await bcrypt.hash(password, 10);
        
        // 3. Verify hash works immediately
        const initialVerify = await bcrypt.compare(password, hash);
        
        // 4. Create user
        const user = await User.create({
            username: 'flowtest',
            email: 'flow@test.com',
            password: hash
        });
        
        // 5. Find user and verify password
        const foundUser = await User.findOne({ email: 'flow@test.com' });
        const loginVerify = await bcrypt.compare(password, foundUser.password);

        return NextResponse.json({
            flow: {
                initialHash: hash,
                initialVerifyWorks: initialVerify,
                storedHash: foundUser.password,
                loginVerifyWorks: loginVerify,
                hashesMatch: hash === foundUser.password
            }
        });

    } catch (error: any) {
        return NextResponse.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
} 