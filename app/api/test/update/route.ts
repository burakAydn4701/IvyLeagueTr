import { NextResponse } from 'next/server';
import connectDb from '@/lib/db';
import Community from '@/lib/models/community';

export async function GET() {
    try {
        await connectDb();
        
        // Force update BOUN community with default values
        const updatedCommunity = await Community.findOneAndUpdate(
            { name: 'BOUN' },
            { 
                $set: {
                    profilePicture: '/default-community.png',
                    banner: ''
                }
            },
            { 
                new: true,
                upsert: false,
                runValidators: true
            }
        ).lean();
        
        console.log('Updated community:', JSON.stringify(updatedCommunity, null, 2));
        
        return NextResponse.json(updatedCommunity);
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(
            { message: 'Error updating community' },
            { status: 500 }
        );
    }
} 