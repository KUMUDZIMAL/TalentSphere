import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import UserProfileModel from "@/models/userProfile";
import PostModel from "@/models/Post";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  await dbConnect();

  try {
    const userId = req.nextUrl.searchParams.get("userId");

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ message: "Invalid user ID" }, { status: 400 });
    }

    const user = await UserProfileModel.findOne({ userId }).select("following");

    if (!user || !user.following.length) {
      return NextResponse.json({ message: "User not following anyone" }, { status: 404 });
    }

    console.log("Following users:", user.following);

    // Ensure following IDs are ObjectId type
    const followingIds = user.following.map(id => new mongoose.Types.ObjectId(id));

    // Debug: Fetch all posts first
    const debugPosts = await PostModel.find({}).limit(5).lean();
    console.log("All posts:", debugPosts);

    // Fetch posts from followed users
    const posts = await PostModel.find({ author: { $in: followingIds } })
      .sort({ createdAt: -1 })
      .lean();

    console.log("Fetched Posts:", posts);

    return NextResponse.json({ posts ,user}, { status: 200 });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

