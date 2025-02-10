import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDb from '@/lib/db';
import User from '@/lib/models/user';

export async function POST(request: Request) {
    try {
        await connectDb();

        const { username, email, password } = await request.json();

        // Validate input
        if (!username || !email || !password) {
            return NextResponse.json(
                { message: 'All fields are required' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return NextResponse.json(
                { message: 'Username or email already exists' },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            username,
            email,
            password: hashedPassword
        });

        // Don't send password in response
        const { password: _, ...userWithoutPassword } = user.toObject();

        return NextResponse.json(userWithoutPassword, { status: 201 });
    } catch (error: any) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { message: 'Error creating user' },
            { status: 500 }
        );
    }
} 