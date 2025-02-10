import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDb from '@/lib/db';
import Message from '@/lib/models/message';

export async function GET(
    request: Request,
    { params }: { params: { userId: string } }
) {
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
        await connectDb();

        // Add console logs for debugging
        console.log('Fetching messages between:', {
            currentUser: decoded.userId,
            otherUser: params.userId
        });

        // Get messages between the two users
        const messages = await Message.find({
            $or: [
                { sender: decoded.userId, receiver: params.userId },
                { sender: params.userId, receiver: decoded.userId }
            ]
        })
        .sort({ createdAt: 1 })
        .populate('sender', 'username profilePicture _id')
        .populate('receiver', 'username profilePicture _id')
        .lean();

        console.log('Found messages:', messages);

        // Mark received messages as read
        await Message.updateMany(
            {
                sender: params.userId,
                receiver: decoded.userId,
                read: false
            },
            { read: true }
        );

        return NextResponse.json({ messages });
    } catch (error) {
        console.error('Fetch messages error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch messages' },
            { status: 500 }
        );
    }
} 