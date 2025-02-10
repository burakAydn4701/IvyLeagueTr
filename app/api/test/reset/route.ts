import { NextResponse } from 'next/server';
import connectDb from '@/lib/db';
import Community from '@/lib/models/community';

export async function GET() {
    try {
        await connectDb();
        
        // Drop the existing collection
        await Community.collection.drop();
        console.log('Dropped collection');
        
        // Create test communities with proper UTF-8 encoding
        const communities = await Community.create([
            {
                name: 'BOUN',
                description: 'Boğaziçi Ortak Salon',
                profilePicture: '/default-community.png',
                banner: '',
                members: []
            },
            {
                name: 'YTU',
                description: 'Yıldız Teknik Ortak Salon',
                profilePicture: '/default-community.png',
                banner: '',
                members: []
            }
        ]);
        
        console.log('Created communities:', JSON.stringify(communities, null, 2));
        
        return NextResponse.json(communities, {
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            }
        });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(
            { message: `Error resetting communities: ${error.message}` },
            { status: 500 }
        );
    }
} 