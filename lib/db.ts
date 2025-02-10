import mongoose from 'mongoose';

const connectDb = async () => {
    try {
        if (mongoose.connections[0].readyState) return;

        await mongoose.connect(process.env.MONGODB_URI as string, {
            bufferCommands: false, // Disable buffering
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        });

        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
};

export default connectDb;
