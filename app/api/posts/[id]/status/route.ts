import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/mongodb";
import Post from "@/models/Post";

export async function GET(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  await dbConnect();

  const postId = params.postId;
  const userId = req.nextUrl.searchParams.get("userId");

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return NextResponse.json({ message: "Invalid user ID" }, { status: 400 });
  }

  if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
    return NextResponse.json({ message: "Invalid post ID" }, { status: 400 });
  }

  try {
    // Find the post by ID, selecting only 'likes' and 'savedBy' arrays
    const post = await Post.findById(postId).select("likes savedBy").lean();

    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Check if userId exists in likes array
    const likedByMe = post.likes.some((id: mongoose.Types.ObjectId) =>
      id.equals(userObjectId)
    );

    // Check if userId exists in savedBy array
    const savedByMe = post.savedBy.some((id: mongoose.Types.ObjectId) =>
      id.equals(userObjectId)
    );

    return NextResponse.json({ likedByMe, savedByMe });
  } catch (error) {
    console.error("Error checking post status:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
