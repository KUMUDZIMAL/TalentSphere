// File: /app/api/posts/following/route.ts

import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import UserProfileModel from "@/models/userProfile";
import PostModel from "@/models/Post";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  await dbConnect();

  try {
    // 1) Get the current user ID from query params
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ message: "Invalid user ID" }, { status: 400 });
    }

    // 2) Look up the UserProfile document to find who they’re following
    const userProfile = await UserProfileModel.findOne({ userId })
      .select("following")
      .lean();
    if (!userProfile) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    if (!userProfile.following || userProfile.following.length === 0) {
      return NextResponse.json({ message: "User not following anyone", posts: [] }, { status: 200 });
    }

    // Convert each “following” ID into ObjectId
    const followingIds = userProfile.following.map((id) => new mongoose.Types.ObjectId(id));

    // 3) Fetch posts where author is in the “following” list
    const rawPosts = await PostModel.find({ author: { $in: followingIds } })
      .sort({ createdAt: -1 })
      .populate("author", "username profilePicture") // bring in author details
      .populate("comments.author", "username profilePicture") // populate comment authors
      .lean();

    // 4) Transform each post to include counts and “by me” flags
    const transformed = rawPosts.map((p) => {
      // Safe‐cast author because .populate turned it into an object
      const author = p.author as { _id: mongoose.Types.ObjectId; username: string; profilePicture?: string };
      // Defensive: ensure likes and savedBy are arrays
      const likesArr = Array.isArray(p.likes) ? p.likes : [];
      const savedByArr = Array.isArray(p.savedBy) ? p.savedBy : [];
      // Determine if the current user has liked or saved this post
      const uid = new mongoose.Types.ObjectId(userId);
      const likedByMe = likesArr.some((u: mongoose.Types.ObjectId) => u.equals(uid));
      const savedByMe = savedByArr.some((u: mongoose.Types.ObjectId) => u.equals(uid));
      // Comments with author info
      const comments = (p.comments || []).map((c: any) => ({
        _id: c._id,
        text: c.text,
        createdAt: c.createdAt,
        author: c.author && typeof c.author === 'object' ? {
          _id: c.author._id,
          username: c.author.username,
          profilePicture: c.author.profilePicture || "",
        } : { _id: c.author, username: "Unknown", profilePicture: "" },
      }));
      return {
        _id: p._id,
        titles: p.titles || [],
        content: p.content,
        caption: p.caption,
        media: p.media || [],
        author: {
          _id: author._id,
          username: author.username,
          profilePicture: author.profilePicture || "",
        },
        likeCount: likesArr.length,
        commentCount: Array.isArray(p.comments) ? p.comments.length : 0,
        likedByMe: !!likedByMe,
        savedByMe: !!savedByMe,
        comments, // include all comments with author info
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      };
    });

    return NextResponse.json({ posts: transformed }, { status: 200 });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
