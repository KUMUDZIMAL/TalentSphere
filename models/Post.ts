import mongoose, { Document, Schema } from 'mongoose';

// Define the Post interface
export interface IPost extends Document {
  titles: string[]; // Array of titles/tags
  content: string;
  caption: string; // Caption for the post
  author: mongoose.Types.ObjectId; // Reference to the User model
  media: string[]; // Array of media URLs or file paths
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
      default: '',
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    media: [
      {
        type: String, // URL or path to the media file
        trim: true,
        required:false,
      },
    ], // Add media field
  },
  {
    timestamps: true,
  }
);


// Create the Post model
const Post = mongoose.models.Post || mongoose.model<IPost>('Post', postSchema);

export default Post;