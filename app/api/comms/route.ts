import { NextResponse } from 'next/server';
import connectDb from '@/lib/db';
import Community from '@/lib/models/community';

export async function GET() {
    try {
        await connectDb();
        const communities = await Community.find()
            .select('name description')
            .lean();

        return NextResponse.json(communities);
    } catch (error) {
        console.error('Error fetching communities:', error);
        return NextResponse.json(
            { error: 'Failed to fetch communities' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const { name, description } = await request.json();
        
        // Log the connection attempt
        console.log('Attempting to connect to database...');
        await connectDb();
        console.log('Connected to database successfully');

        // Log the data we're trying to save
        console.log('Attempting to create community with:', { name, description });

        // Basic validation
        if (!name || !description) {
            return NextResponse.json(
                { message: 'Name and description are required' }, 
                { status: 400 }
            );
        }

        // Check for duplicate community name
        const existingCommunity = await Community.findOne({ name });
        if (existingCommunity) {
            return NextResponse.json(
                { message: 'Community name already exists' }, 
                { status: 400 }
            );
        }

        const newCommunity = new Community({
            name,
            description,
            members: [],
        });

        const savedCommunity = await newCommunity.save();
        console.log('Community created successfully:', savedCommunity);
        
        return NextResponse.json(savedCommunity, { status: 201 });
    } catch (error: any) {
        // Detailed error logging
        console.error('Failed to create community:', {
            error: error.toString(),
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        
        if (error.name === 'MongooseError') {
            return NextResponse.json(
                { message: 'Database connection error' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { message: `Error creating community: ${error.message}` },
            { status: 500 }
        );
    }
} 