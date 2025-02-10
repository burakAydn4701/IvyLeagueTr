import mongoose, { Document, Schema } from 'mongoose';

export interface ICommunity extends Document {
    name: string;
    description: string;
    members: mongoose.Types.ObjectId[];
    createdAt: Date;
    profilePicture: string;
    banner: string;
}

const communitySchema = new Schema<ICommunity>({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    members: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    profilePicture: {
        type: String,
        default: '/default-avatar.jpg'
    },
    banner: {
        type: String,
        default: ''
    }
});

const Community = mongoose.models.Community || mongoose.model<ICommunity>('Community', communitySchema);
export default Community;
