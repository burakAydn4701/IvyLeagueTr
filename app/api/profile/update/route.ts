import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDb from '@/lib/db';
import User from '@/lib/models/user';
import { processImage } from '@/lib/utils/image-handler';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { mkdir } from 'fs/promises';

export async function PATCH(request: Request) {
    try {
        const cookieStore = cookies();
        const token = cookieStore.get('token');

        console.log('Starting profile update...');

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

        const formData = await request.formData();
        const username = formData.get('username') as string;
        const profilePicture = formData.get('profilePicture') as File;

        console.log('Update data:', { username, hasProfilePicture: !!profilePicture });

        // Check if username is taken by another user
        const existingUser = await User.findOne({
            username,
            _id: { $ne: decoded.userId }
        });

        if (existingUser) {
            return NextResponse.json(
                { message: 'Username is already taken' },
                { status: 400 }
            );
        }

        const updateData: any = { username };

        if (profilePicture) {
            const bytes = await profilePicture.arrayBuffer();
            const buffer = Buffer.from(bytes);
            
            // Process the image
            const processedBuffer = await processImage(buffer, 'profile');
            
            const uploadDir = join('public', 'uploads');
            await mkdir(uploadDir, { recursive: true });
            
            const fileName = `${Date.now()}-${profilePicture.name}`;
            const path = join('public', 'uploads', fileName);
            
            await writeFile(path, processedBuffer);
            updateData.profilePicture = `/uploads/${fileName}`;
        }

        const updatedUser = await User.findByIdAndUpdate(
            decoded.userId,
            { $set: updateData },
            { new: true }
        ).select('-password');

        console.log('Updated user:', updatedUser);
        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json(
            { message: 'Failed to update profile' },
            { status: 500 }
        );
    }
} 