import mongoose, { Document, Schema } from 'mongoose';

// Define the User interface
export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    isAdmin: boolean;
    createdAt: Date;
    profilePicture: string;
    bio: string;
    posts: mongoose.Types.ObjectId[];
    communities: mongoose.Types.ObjectId[];
    upvotedPosts: mongoose.Types.ObjectId[];
}

const userSchema = new Schema<IUser>({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: {
        type: Boolean,
        default: false
    },
    createdAt: { type: Date, default: Date.now },
    profilePicture: { type: String, default: '/default-avatar.jpg' },
    bio: { type: String, maxlength: 160, default: '' },
    posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
    communities: [{ type: Schema.Types.ObjectId, ref: 'Community' }],
    upvotedPosts: [{ type: Schema.Types.ObjectId, ref: 'Post' }]
}, { timestamps: false });

// Create and export the model
const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
export default User;
