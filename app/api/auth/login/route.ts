import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectDb from '@/lib/db';
import User from '@/lib/models/user';

export async function POST(request: Request) {
    try {
        await connectDb();
        
        const { email, password } = await request.json();
        console.log('Login attempt:', { email, passwordLength: password?.length });

        const user = await User.findOne({ email });
        
        if (!user) {
            console.log('No user found with email:', email);
            return NextResponse.json(
                { message: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Test password comparison
        const testCompare = await bcrypt.compare(password, user.password);
        console.log('Password check:', {
            inputPassword: password,
            storedHash: user.password,
            matches: testCompare
        });

        if (!testCompare) {
            return NextResponse.json(
                { message: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Create JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET!,
            { expiresIn: '7d' }
        );

        // Create response
        const response = NextResponse.json({ 
            message: 'Login successful',
            user: {
                email: user.email,
                username: user.username
            }
        });

        // Set cookie
        response.cookies.set({
            name: 'token',
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7 // 7 days
        });

        return response;

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { message: 'Server error during login' },
            { status: 500 }
        );
    }
} 