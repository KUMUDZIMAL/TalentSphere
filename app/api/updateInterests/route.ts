import { NextResponse } from 'next/server';
import mongoose, { Types } from 'mongoose';
import userProfile from '@/models/userProfile'; // Adjust the import path as needed

// Connect to MongoDB (ensure this is done only once in your application)
if (!mongoose.connection.readyState) {
  mongoose.connect(process.env.MONGODB_URI!);
}

// POST handler
export async function POST(request: Request) {
  try {
    const { userId, interests } = await request.json();

    if (!userId || !interests) {
      return NextResponse.json(
        { message: 'userId and interests are required' },
        { status: 400 }
      );
    }

    // Check if userId is a valid ObjectId string
    if (!Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { message: 'Invalid userId format' },
        { status: 400 }
      );
    }

    // Convert userId to ObjectId
    const userIdObjectId = new Types.ObjectId(userId);

    // Find the user profile and update the interests array
    const updatedProfile = await userProfile.findOneAndUpdate(
      { userId: userIdObjectId }, // Use the converted ObjectId
      { $addToSet: { interests: { $each: interests } } }, // Use $addToSet to avoid duplicates
      { new: true } // Return the updated document
    );

    if (!updatedProfile) {
      return NextResponse.json(
        { message: 'User profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Interests updated successfully', updatedProfile },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating interests:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}