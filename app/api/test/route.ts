import { NextResponse } from 'next/server';
import connectDb from '@/lib/db';
import Community from '@/lib/models/community';

export async function GET() {
    try {
        await connectDb();
        
        // Get all communities
        const communities = await Community.find().lean();
        
        console.log('All communities:', JSON.stringify(communities, null, 2));
        
        return NextResponse.json(communities);
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(
            { message: 'Error fetching communities' },
            { status: 500 }
        );
    }
} 