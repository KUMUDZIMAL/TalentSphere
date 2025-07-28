import { NextResponse } from "next/server";
import mongoose from "mongoose";
import PostModel from "@/models/Post";
import User from "@/models/User";
import UserProfileModel from "@/models/userProfile";
import { dbConnect } from "@/lib/mongodb";

type RawPost = {
  _id: mongoose.Types.ObjectId;
  content: string;
  media?: string[];
  titles?: string[];
  author: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

type SharedPostResponse = {
  _id: string;
  content: string;
  media?: string[];
  titles?: string[];
  author: {
    username: string;
    profilePicture?: string;
  };
};

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const { searchParams } = new URL(request.url);
  const populateParam = searchParams.get('populate');

  // Ensure we have an id param
  if (!id) {
    return NextResponse.json(
      { error: "Missing or invalid post ID" },
      { status: 400 }
    );
  }

  // 1) Connect to MongoDB
  try {
    await dbConnect();
  } catch (err) {
    console.error("Error connecting to database:", err);
    return NextResponse.json(
      { error: "Database connection error" },
      { status: 500 }
    );
  }

  // 2) Fetch the raw post document
  let postDoc;
  try {
    postDoc = await PostModel.findById(id)
      .select("-__v")
      .lean()
      .exec();
  } catch (err) {
    console.error("Error fetching post:", err);
    return NextResponse.json(
      { error: "Error fetching post" },
      { status: 500 }
    );
  }

  if (!postDoc) {
    return NextResponse.json(
      { error: "Post not found" },
      { status: 404 }
    );
  }

  // 3) If ?populate=author, join with User & UserProfile
  if (populateParam === "author") {
    try {
      // a) Fetch the User document to get username
      const userDoc = await User.findById(postDoc.author);

      if (!userDoc) {
        return NextResponse.json(
          { error: "Author user not found" },
          { status: 404 }
        );
      }

      // b) Fetch the UserProfile to get profilePicture
      const userProfileDoc = await UserProfileModel.findOne({
        userId: postDoc.author,
      });

      const sharedPost: SharedPostResponse = {
        _id: postDoc._id.toString(),
        content: postDoc.content,
        media: postDoc.media,
        titles: postDoc.titles,
        author: {
          username: userDoc.username,
          profilePicture: userProfileDoc?.profilePicture
        },
      };

      return NextResponse.json(sharedPost);
    } catch (err) {
      console.error("Error populating author info:", err);
      return NextResponse.json(
        { error: "Error populating author data" },
        { status: 500 }
      );
    }
  }

  // 4) Otherwise, return the raw post (no population)
  return NextResponse.json(postDoc);
} 