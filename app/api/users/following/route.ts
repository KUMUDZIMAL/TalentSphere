import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/mongodb";
import UserProfileModel from "@/models/userProfile";

export async function GET(req: NextRequest) {
  await dbConnect();

  // 1) Read and validate userId from query string
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return NextResponse.json(
      { message: "Invalid or missing userId" },
      { status: 400 }
    );
  }

  try {
    // 2) Look up the UserProfile document, selecting only the "following" array
    const profile = await UserProfileModel.findOne(
      { userId: new mongoose.Types.ObjectId(userId) },
      { following: 1 }
    )
      .lean()
      .exec();

    if (!profile) {
      return NextResponse.json(
        { message: "UserProfile not found" },
        { status: 404 }
      );
    }

    const followingIds: mongoose.Types.ObjectId[] =
      (profile.following || []).map((id: any) =>
        new mongoose.Types.ObjectId(id)
      );

    if (followingIds.length === 0) {
      // Return an empty array if they follow nobody
      return NextResponse.json({ following: [] });
    }

    // 3) Fetch each followed user's basic info from UserProfileModel
    //    (adjust the fields to match your schema—here we assume
    //     userId, username, profilePicture are stored in UserProfileModel)
    const users = await UserProfileModel.find(
      { userId: { $in: followingIds } },
      { userId: 1, username: 1, profilePicture: 1 }
    )
      .lean()
      .exec();

    // 4) Transform into a simpler return shape
    const simplified = users.map((u) => ({
      _id: (u.userId as mongoose.Types.ObjectId).toString(),
      username: u.username,
      profilePicture: u.profilePicture || "",
    }));

    return NextResponse.json({ following: simplified });
  } catch (err) {
    console.error("Error in GET /api/users/following:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
