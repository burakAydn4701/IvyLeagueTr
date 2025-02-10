import sharp from 'sharp';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { readdir } from 'fs/promises';

// Compress and resize image
export async function processImage(buffer: Buffer, type: 'profile' | 'banner' | 'post'): Promise<Buffer> {
    const image = sharp(buffer);
    
    switch (type) {
        case 'profile':
            return await image
                .resize(200, 200, {
                    fit: 'cover',
                    position: 'center'
                })
                .jpeg({ quality: 80 })
                .toBuffer();
        case 'banner':
            return await image
                .resize(1200, null, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .jpeg({ quality: 80 })
                .toBuffer();
        case 'post':
            return await image
                .resize(800, null, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .jpeg({ quality: 85 })
                .toBuffer();
    }
}

// Clean up old uploads (files older than 24 hours)
export async function cleanupOldUploads() {
    try {
        const uploadsDir = join('public', 'uploads');
        const files = await readdir(uploadsDir);
        const now = Date.now();
        const ONE_DAY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

        for (const file of files) {
            const filePath = join(uploadsDir, file);
            const fileCreationTime = parseInt(file.split('-')[0]); // Extract timestamp from filename
            
            if (now - fileCreationTime > ONE_DAY) {
                try {
                    await unlink(filePath);
                    console.log(`Deleted old file: ${file}`);
                } catch (err) {
                    console.error(`Error deleting file ${file}:`, err);
                }
            }
        }
    } catch (err) {
        console.error('Error cleaning up uploads:', err);
    }
} 