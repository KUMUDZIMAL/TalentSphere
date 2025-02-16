import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import UserProfileModel from "@/models/userProfile";
import mongoose from "mongoose";

export async function PATCH(req: NextRequest) {
  await dbConnect();

  try {
    const { followerId, followingId } = await req.json();

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(followerId) || !mongoose.Types.ObjectId.isValid(followingId)) {
      return NextResponse.json({ message: "Invalid user ID format" }, { status: 400 });
    }

    // Convert string IDs to ObjectId
    const followerObjectId = new mongoose.Types.ObjectId(followerId);
    const followingObjectId = new mongoose.Types.ObjectId(followingId);

    // Update the follower's following list
    await UserProfileModel.findOneAndUpdate(
      { userId: followerObjectId },
      { $addToSet: { following: followingObjectId } },
      { new: true }
    );

    // Update the following user's followers list
    await UserProfileModel.findOneAndUpdate(
      { userId: followingObjectId },
      { $addToSet: { followers: followerObjectId } },
      { new: true }
    );

    return NextResponse.json({ message: "Followed successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error following user:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
