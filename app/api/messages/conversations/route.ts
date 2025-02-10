import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDb from '@/lib/db';
import Message from '@/lib/models/message';
import User from '@/lib/models/user';
import mongoose from 'mongoose';

export async function GET() {
    try {
        const cookieStore = cookies();
        const token = cookieStore.get('token');

        if (!token) {
            console.log('No token found');
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        const decoded = jwt.verify(token.value, process.env.JWT_SECRET!) as { userId: string };
        console.log('User ID:', decoded.userId);
        
        await connectDb();

        // Find all conversations with latest message
        const conversations = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { sender: new mongoose.Types.ObjectId(decoded.userId) },
                        { receiver: new mongoose.Types.ObjectId(decoded.userId) }
                    ]
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $group: {
                    _id: {
                        $cond: {
                            if: { $eq: ['$sender', new mongoose.Types.ObjectId(decoded.userId)] },
                            then: '$receiver',
                            else: '$sender'
                        }
                    },
                    lastMessage: { $first: '$$ROOT' },
                    createdAt: { $first: '$createdAt' }
                }
            },
            {
                $sort: { createdAt: -1 }
            }
        ]);

        console.log('Found conversations:', conversations);

        // Get user details for each conversation
        const userIds = conversations.map(conv => conv._id);
        const users = await User.find(
            { _id: { $in: userIds } },
            'username profilePicture'
        ).lean();

        console.log('Found users:', users);

        // Map conversations to users (keeping the sort order)
        const conversationsWithUsers = conversations.map(conv => {
            const user = users.find(u => u._id.toString() === conv._id.toString());
            if (!user) return null;
            return {
                ...user,
                lastMessage: conv.lastMessage,
                createdAt: conv.createdAt  // Keep the timestamp
            };
        }).filter(Boolean);  // Remove any null values

        console.log('Final conversations data:', conversationsWithUsers);

        return NextResponse.json({ conversations: conversationsWithUsers });
    } catch (error) {
        console.error('Fetch conversations error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch conversations' },
            { status: 500 }
        );
    }
} 