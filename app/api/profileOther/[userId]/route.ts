import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import UserProfileModel from "@/models/userProfile";
import User from "@/models/User";

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  await dbConnect();

  try {
    // Await the params before destructuring
    const { userId } = await params;
    
    // Fetch user profile from UserProfileModel (assuming it uses a reference to the user)
    const userProfile = await UserProfileModel.findOne({ userId });
    // Fetch the user document from User model
    const user = await User.findOne({ _id: userId });

    if (!userProfile) {
      return NextResponse.json(
        { message: "User profile not found" },
        { status: 404 }
      );
    }

    // Return both userProfile and user data
    return NextResponse.json({ userProfile, user }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
