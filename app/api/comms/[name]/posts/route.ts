import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDb from '@/lib/db';
import Post from '@/lib/models/post';
import Community from '@/lib/models/community';
import { processImage } from '@/lib/utils/image-handler';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { mkdir } from 'fs/promises';

export async function POST(
    request: Request,
    { params }: { params: { name: string } }
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

        // Find community
        const community = await Community.findOne({ name: params.name });
        if (!community) {
            return NextResponse.json(
                { error: 'Community not found' },
                { status: 404 }
            );
        }

        const formData = await request.formData();
        const title = formData.get('title') as string;
        const content = formData.get('content') as string;
        const image = formData.get('image') as File;

        let imageUrl = '';
        if (image) {
            const bytes = await image.arrayBuffer();
            const buffer = Buffer.from(bytes);
            
            // Process the image
            const processedBuffer = await processImage(buffer, 'post');
            
            // Create uploads directory if it doesn't exist
            const uploadDir = join('public', 'uploads');
            await mkdir(uploadDir, { recursive: true });
            
            const fileName = `${Date.now()}-${image.name}`;
            const path = join('public', 'uploads', fileName);
            
            await writeFile(path, processedBuffer);
            imageUrl = `/uploads/${fileName}`;
        }

        // Create post
        const post = await Post.create({
            title,
            content,
            author: decoded.userId,
            community: community._id,
            image: imageUrl || undefined
        });

        return NextResponse.json(post, { status: 201 });
    } catch (error) {
        console.error('Create post error:', error);
        return NextResponse.json(
            { error: 'Failed to create post' },
            { status: 500 }
        );
    }
}

export async function GET(
    request: Request,
    { params }: { params: { name: string } }
) {
    try {
        await connectDb();
        
        const community = await Community.findOne({ name: params.name });
        if (!community) {
            return NextResponse.json(
                { error: 'Community not found' },
                { status: 404 }
            );
        }

        const posts = await Post.find({ community: community._id })
            .populate('author', 'username profilePicture')
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ posts });
    } catch (error) {
        console.error('Fetch posts error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch posts' },
            { status: 500 }
        );
    }
} 