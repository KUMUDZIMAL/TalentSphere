import { NextResponse } from "next/server";
import mongoose from "mongoose";
import UserProfileModel from "@/models/userProfile";

// Connect to MongoDB (ensure this runs only once)
if (!mongoose.connection.readyState) {
  mongoose.connect(process.env.MONGODB_URI!, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as mongoose.ConnectOptions);
}

// POST - Create or Update User Profile
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, professions, skills, experiences, about } = body;

    console.log("Incoming data:", body); // Debug log

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { message: "userId is required" },
        { status: 400 }
      );
    }

    // Check if the profile already exists
    let profile = await UserProfileModel.findOne({ userId });

    if (profile) {
      // Update existing profile
      profile.professions = professions || profile.professions;
      profile.skills = skills || profile.skills;
      profile.experiences = experiences || profile.experiences;
      profile.about = about || profile.about;
    } else {
      // Create new profile
      profile = new UserProfileModel({
        userId,
        professions,
        skills,
        experiences,
        about,
      });
    }

    // Save the profile
    await profile.save();

    return NextResponse.json(
      { message: "Profile saved successfully", profile },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving profile:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET - Fetch User Profile by userId
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { message: "userId is required" },
        { status: 400 }
      );
    }

    // Find the profile by userId
    const profile = await UserProfileModel.findOne({ userId });

    if (!profile) {
      return NextResponse.json(
        { message: "Profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ profile }, { status: 200 });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}