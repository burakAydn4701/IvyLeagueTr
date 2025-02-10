import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDb from '@/lib/db';
import User from '@/lib/models/user';

export async function GET() {
    try {
        await connectDb();

        const adminUsers = [
            {
                username: 'Myrza',
                email: 'aydn64burak@gmail.com',
                password: 'ivyadmin1',
                isAdmin: true
            },
            {
                username: 'Melin',
                email: 'nehirnehirali@gmail.com',
                password: 'ivyadmin2',
                isAdmin: true
            }
        ];

        for (const admin of adminUsers) {
            // Update or create admin users
            const existingUser = await User.findOne({ email: admin.email });
            if (existingUser) {
                // Update existing user
                await User.findByIdAndUpdate(existingUser._id, {
                    isAdmin: true
                });
            } else {
                // Create new admin user
                const hashedPassword = await bcrypt.hash(admin.password, 10);
                await User.create({
                    ...admin,
                    password: hashedPassword
                });
            }
        }

        return NextResponse.json({ message: 'Admin users updated successfully' });
    } catch (error) {
        console.error('Error updating admin users:', error);
        return NextResponse.json({ error: 'Failed to update admin users' }, { status: 500 });
    }
} 