import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function GET() {
    try {
        // Test password
        const password = 'test123';
        
        // Create hash
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        
        // Immediate verification
        const verify1 = await bcrypt.compare(password, hash);
        
        // Create a new hash and verify again
        const hash2 = await bcrypt.hash(password, 10);
        const verify2 = await bcrypt.compare(password, hash2);
        
        return NextResponse.json({
            password,
            hash1: hash,
            hash2: hash2,
            verify1,
            verify2,
            saltRounds: 10
        });

    } catch (error: any) {
        return NextResponse.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
} 