import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/mongodb";
import MessageModel from "@/models/Message";

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const { fromUserId, toUserId, postId, text } = await req.json();

    // 1) Validate all incoming IDs:
    if (
      !mongoose.Types.ObjectId.isValid(fromUserId) ||
      !mongoose.Types.ObjectId.isValid(toUserId) ||
      (postId !== undefined &&
        postId !== null &&
        !mongoose.Types.ObjectId.isValid(postId))
    ) {
      return NextResponse.json(
        { message: "Invalid ID format" },
        { status: 400 }
      );
    }

    // 2) Build the new message object.
    //    - Must set `receiver` because this is a one‐to‐one share.
    //    - Either `text` or `post` (or both) must be provided; the schema will validate.
    const msgObj: Partial<{
      sender: mongoose.Types.ObjectId;
      receiver: mongoose.Types.ObjectId;
      content?: string;
      post?: mongoose.Types.ObjectId;
      createdAt: Date;
    }> = {
      sender: new mongoose.Types.ObjectId(fromUserId),
      receiver: new mongoose.Types.ObjectId(toUserId),
      createdAt: new Date(),
    };

    if (typeof text === "string" && text.trim().length > 0) {
      msgObj.content = text.trim();
    }
    if (postId) {
      msgObj.post = new mongoose.Types.ObjectId(postId);
    }

    const newMessage = await MessageModel.create(msgObj as any);

    return NextResponse.json(
      { message: "Message sent", messageId: newMessage._id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
