import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDb from '@/lib/db';
import Message from '@/lib/models/message';
import User from '@/lib/models/user';

export async function POST(request: Request) {
    try {
        const cookieStore = cookies();
        const token = cookieStore.get('token');

        if (!token) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        const decoded = jwt.verify(token.value, process.env.JWT_SECRET!) as { userId: string };
        const { receiverId } = await request.json();

        await connectDb();

        // Check if users exist
        const [sender, receiver] = await Promise.all([
            User.findById(decoded.userId),
            User.findById(receiverId)
        ]);

        if (!sender || !receiver) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Just check if conversation exists, don't create any message
        const existingMessage = await Message.findOne({
            $or: [
                { sender: decoded.userId, receiver: receiverId },
                { sender: receiverId, receiver: decoded.userId }
            ]
        });

        // Return success regardless of whether conversation exists
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Create conversation error:', error);
        return NextResponse.json(
            { error: 'Failed to create conversation' },
            { status: 500 }
        );
    }
} 