// File: /models/Post.ts

import mongoose, { Document, Schema } from "mongoose";

// Interface for a single Comment subdocument
export interface IComment {
  author: mongoose.Types.ObjectId; // reference to User who commented
  text: string;                    // the comment text
  createdAt: Date;                 // timestamp
}

// Extend your original Post interface to include likes, savedBy, comments:
export interface IPost extends Document {
  titles: string[];                   // your existing “titles/tags” array
  content: string;                    // post content/body
  caption: string;                    // post caption
  author: mongoose.Types.ObjectId;    // reference to User model
  media: string[];                    // array of media URLs/paths
  likes: mongoose.Types.ObjectId[];   // array of User IDs who liked this post
  savedBy: mongoose.Types.ObjectId[]; // array of User IDs who saved/bookmarked
  comments: IComment[];               // array of comment sub‐docs
  createdAt: Date;                    // auto timestamps
  updatedAt: Date;                    // auto timestamps
}

const CommentSchema: Schema<IComment> = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const PostSchema: Schema = new Schema(
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
      default: "",
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    media: [
      {
        type: String, // URL or path to media file
        trim: true,
        required: false,
      },
    ],
    // ────────────────────────────────────────────────────────────
    // Added fields below:
    // ────────────────────────────────────────────────────────────

    // 1) Users who have liked this post
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // 2) Users who have saved/bookmarked this post
    savedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // 3) Comment sub-documents
    comments: {
      type: [CommentSchema],
      default: [],
    },
  },
  {
    timestamps: true, // automatically adds createdAt & updatedAt
  }
);

// If the model already exists (from a previous compilation), reuse it:
const Post: mongoose.Model<IPost> =
  mongoose.models.Post || mongoose.model<IPost>("Post", PostSchema);

export default Post;
