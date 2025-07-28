// /app/api/posts/[id]/comment/route.ts
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Post from "@/models/Post";
import mongoose from "mongoose";
import { moderateContent } from "@/lib/moderation";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    await dbConnect();
    const { userId, text } = await req.json();
    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(userId) ||
      !text ||
      typeof text !== "string"
    ) {
      return NextResponse.json({ error: "Invalid data." }, { status: 400 });
    }

    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    // Moderate comment text
    const moderation = moderateContent(text);
    if (moderation.isFlagged) {
      return NextResponse.json({
        error: "Comment flagged by moderation.",
        reasons: moderation.reasons,
      }, { status: 403 });
    }

    const comment = {
      author: new mongoose.Types.ObjectId(userId),
      text: text.trim(),
      createdAt: new Date(),
    };
    post.comments.push(comment);
    await post.save();

    return NextResponse.json(
      {
        comment: {
          _id: post.comments[post.comments.length - 1]._id,
          author: comment.author,
          text: comment.text,
          createdAt: comment.createdAt,
        },
        commentCount: post.comments.length,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error adding comment:", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
