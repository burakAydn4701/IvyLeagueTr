import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDb from '@/lib/db';
import Message from '@/lib/models/message';

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
        const { receiverId, content } = await request.json();

        await connectDb();

        const message = await Message.create({
            sender: decoded.userId,
            receiver: receiverId,
            content
        });

        const populatedMessage = await Message.findById(message._id)
            .populate('sender', 'username profilePicture')
            .populate('receiver', 'username profilePicture');

        // Socket event will be handled by the client
        return NextResponse.json(populatedMessage);
    } catch (error) {
        console.error('Send message error:', error);
        return NextResponse.json(
            { error: 'Failed to send message' },
            { status: 500 }
        );
    }
} 