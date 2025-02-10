import { NextResponse } from 'next/server';
import connectDb from '@/lib/db';
import User from '@/lib/models/user';

export async function GET() {
    try {
        await connectDb();
        await User.deleteMany({});
        return NextResponse.json({ message: 'All users deleted' });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
} 