// File: /app/api/posts/[id]/like/route.ts

import { NextRequest, NextResponse } from "next/server";
import { dbConnect }from "@/lib/mongodb";
import Post from "@/models/Post";
import mongoose from "mongoose";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    await dbConnect();
    const { userId } = await req.json();
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Invalid ID." }, { status: 400 });
    }

    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    const uid = new mongoose.Types.ObjectId(userId);
    console.log("[LIKE API] userId:", userId, "uid:", uid.toString());
    console.log("[LIKE API] likes before:", post.likes.map(u => u.toString()));
    const alreadyLiked = post.likes.some((u) => u.equals(uid));
    if (alreadyLiked) {
      post.likes = post.likes.filter((u) => !u.equals(uid)); // unlike
    } else {
      post.likes.push(uid); // like
    }
    await post.save();
    console.log("[LIKE API] likes after:", post.likes.map(u => u.toString()));
    return NextResponse.json(
      { likeCount: post.likes.length, likedByMe: !alreadyLiked },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error toggling like:", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
