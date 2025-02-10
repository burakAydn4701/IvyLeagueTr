import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
    content: string;
    author: mongoose.Types.ObjectId;
    post: mongoose.Types.ObjectId;
    parentComment?: mongoose.Types.ObjectId;  // For nested replies
    replies?: mongoose.Types.ObjectId[];  // Add this field
    upvotes: number;
    upvotedBy: mongoose.Types.ObjectId[];  // Add this to track who upvoted
    createdAt: Date;
    isDeleted: boolean;
}

const commentSchema = new Schema<IComment>({
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    parentComment: { type: Schema.Types.ObjectId, ref: 'Comment' },  // Optional parent comment
    replies: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],  // Add this field
    upvotes: { type: Number, default: 0 },
    upvotedBy: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }], // Add default empty array
    createdAt: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false },
});

const Comment = mongoose.models.Comment || mongoose.model<IComment>('Comment', commentSchema);
export default Comment; 