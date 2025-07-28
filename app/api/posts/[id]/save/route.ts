// /app/api/posts/[id]/save/route.ts
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
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
    const alreadySaved = post.savedBy.some((u) => u.equals(uid));
    if (alreadySaved) {
      // Unsave
      post.savedBy = post.savedBy.filter((u) => !u.equals(uid));
    } else {
      // Save
      post.savedBy.push(uid);
    }

    await post.save();
    return NextResponse.json(
      { savedByMe: !alreadySaved },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error saving/unsaving post:", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
