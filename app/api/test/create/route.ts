import { NextResponse } from 'next/server';
import connectDb from '@/lib/db';
import Community from '@/lib/models/community';

export async function GET() {
    try {
        await connectDb();
        
        const newCommunity = await Community.create({
            name: 'Test Community',
            description: 'Test Description',
            profilePicture: '/default-community.png',
            banner: '',
            members: []
        });
        
        console.log('Created community:', JSON.stringify(newCommunity, null, 2));
        
        return NextResponse.json(newCommunity);
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(
            { message: `Error creating community: ${error.message}` },
            { status: 500 }
        );
    }
} 