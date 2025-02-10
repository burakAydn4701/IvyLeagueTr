import type { NextApiRequest, NextApiResponse } from 'next';
import connectDb from '../../../lib/db';
import Community from '../../../lib/models/community';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        await connectDb();
        
        const { name, description } = req.body;
        
        // Basic validation
        if (!name || !description) {
            return res.status(400).json({ message: 'Name and description are required' });
        }

        // Create new community
        const community = await Community.create({
            name,
            description,
            members: [], // Initially empty
        });

        return res.status(201).json(community);
    } catch (error: any) {
        if (error.code === 11000) { // MongoDB duplicate key error
            return res.status(400).json({ message: 'Community name already exists' });
        }
        return res.status(500).json({ message: 'Error creating community' });
    }
} 