import mongoose, { Document, Schema } from 'mongoose';

// Define the Post interface
export interface IPost extends Document {
  titles: string[]; // Array of titles/tags
  content: string;
  caption: string; // Caption for the post
  author: mongoose.Types.ObjectId; // Reference to the User model
  createdAt: Date;
  updatedAt: Date;
}

// Define the Post schema
const postSchema: Schema = new Schema(
  {
    titles: [
      {
        type: String,
        trim: true,
        required: true,
      },
    ],
    content: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
      trim: true,
      default: '', // Default to an empty string if no caption is provided
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Reference to the User model
      required: true,
    },
  },
  {
    timestamps: true, // Automatically add `createdAt` and `updatedAt` fields
  }
);

// Create the Post model
const Post = mongoose.models.Post || mongoose.model<IPost>('Post', postSchema);

export default Post;