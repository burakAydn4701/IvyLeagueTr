import mongoose, { Document, Schema } from 'mongoose';
import { ICommunity } from './community';
import { IUser } from './user';

export interface IPost extends Document {
    title: string;
    content: string;
    author: mongoose.Types.ObjectId;
    community: mongoose.Types.ObjectId;
    image?: string;
    upvotes: number;
    upvotedBy: mongoose.Types.ObjectId[];
    createdAt: Date;
    isDeleted: boolean;
}

const postSchema = new Schema<IPost>({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    community: { type: Schema.Types.ObjectId, ref: 'Community', required: true },
    image: { type: String },
    upvotes: { type: Number, default: 0 },
    upvotedBy: [{ 
        type: Schema.Types.ObjectId, 
        ref: 'User'
    }],
    createdAt: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: false });

// Add index to prevent duplicate upvotes
postSchema.index({ upvotedBy: 1 });

const Post = mongoose.models.Post || mongoose.model<IPost>('Post', postSchema);
export default Post;
