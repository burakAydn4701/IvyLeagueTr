import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDb from '@/lib/db';
import Community, { ICommunity } from '@/lib/models/community';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { mkdir } from 'fs/promises';
import { processImage, cleanupOldUploads } from '@/lib/utils/image-handler';
import User from '@/lib/models/user';

export async function GET(
    request: Request,
    { params }: { params: { name: string } }
) {
    try {
        console.log('Attempting to fetch community:', params.name);
        await connectDb();
        
        const community = await Community.findOne({ name: params.name }).lean();
        console.log('Found community with data:', community);
        
        if (!community) {
            console.log('Community not found');
            return NextResponse.json(
                { error: 'Community not found' },
                { status: 404 }
            );
        }

        // Check if user is logged in
        const cookieStore = cookies();
        const token = cookieStore.get('token');
        let isMember = false;

        if (token) {
            try {
                const decoded = jwt.verify(token.value, process.env.JWT_SECRET!) as { userId: string };
                const user = await User.findById(decoded.userId);
                if (user) {
                    isMember = community.members.some(id => id.toString() === user._id.toString());
                }
            } catch (error) {
                console.error('Auth error:', error);
            }
        }

        return NextResponse.json({
            ...community,
            isMember
        });
    } catch (error) {
        console.error('Community fetch error:', error);
        return NextResponse.json(
            { error: 'Server error' },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: { name: string } }
) {
    try {
        await connectDb();
        
        // Run cleanup of old files
        await cleanupOldUploads();
        
        const formData = await request.formData();
        console.log('Received form data:', {
            description: formData.get('description'),
            hasProfilePicture: formData.has('profilePicture'),
            hasBanner: formData.has('banner')
        });

        const description = formData.get('description') as string;
        const profilePicture = formData.get('profilePicture') as File;
        const banner = formData.get('banner') as File;

        let updateData: Partial<ICommunity> = { description };

        if (profilePicture) {
            console.log('Processing profile picture:', {
                name: profilePicture.name,
                type: profilePicture.type,
                size: profilePicture.size
            });

            const bytes = await profilePicture.arrayBuffer();
            const buffer = Buffer.from(bytes);
            
            // Process the image
            const processedBuffer = await processImage(buffer, 'profile');
            
            const uploadDir = join('public', 'uploads');
            try {
                await mkdir(uploadDir, { recursive: true });
            } catch (err) {
                console.error('Error creating uploads directory:', err);
            }
            
            const fileName = `${Date.now()}-${profilePicture.name}`;
            const path = join('public', 'uploads', fileName);
            
            console.log('Saving file to:', path);
            await writeFile(path, processedBuffer);
            
            updateData.profilePicture = `/uploads/${fileName}`;
            console.log('Setting profile picture path:', updateData.profilePicture);
        }

        // Handle banner upload
        if (banner) {
            const bytes = await banner.arrayBuffer();
            const buffer = Buffer.from(bytes);
            
            // Process the banner
            const processedBuffer = await processImage(buffer, 'banner');
            
            const fileName = `${Date.now()}-${banner.name}`;
            const path = join('public', 'uploads', fileName);
            
            await writeFile(path, processedBuffer);
            updateData.banner = `/uploads/${fileName}`;
        }

        console.log('Full update data:', JSON.stringify(updateData, null, 2));

        // Find the community first
        const existingCommunity = await Community.findOne({ name: params.name });
        console.log('Found existing community:', JSON.stringify(existingCommunity, null, 2));

        if (!existingCommunity) {
            return NextResponse.json(
                { message: 'Community not found' },
                { status: 404 }
            );
        }

        // Update with strict typing
        const updatedCommunity = await Community.findOneAndUpdate(
            { name: params.name },
            { $set: updateData },
            { 
                new: true,
                runValidators: true
            }
        ).lean();

        console.log('Updated community result:', JSON.stringify(updatedCommunity, null, 2));
        return NextResponse.json(updatedCommunity);
    } catch (error) {
        console.error('Detailed error:', error);
        return NextResponse.json(
            { message: `Error updating community: ${error.message}` },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { name: string } }
) {
    try {
        await connectDb();
        
        const deletedCommunity = await Community.findOneAndDelete({ name: params.name });
        
        if (!deletedCommunity) {
            return NextResponse.json(
                { message: 'Community not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: 'Community deleted successfully' });
    } catch (error) {
        console.error('Error deleting community:', error);
        return NextResponse.json(
            { message: 'Error deleting community' },
            { status: 500 }
        );
    }
} 