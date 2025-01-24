import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { writeFile } from 'fs/promises';
import mongoose from 'mongoose';

// Import your models
import User from '@/models/User'; // Your main User model
import UserProfile from '@/models/userProfile'; // Your UserProfile model

// MongoDB Connection
if (!mongoose.connection.readyState) {
  mongoose.connect(process.env.MONGODB_URI!);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Get file and userId from form data
    const file = formData.get('dp') as File;
    const userId = formData.get('userId') as string;

    if (!file || !userId) {
      return NextResponse.json(
        { error: 'Missing file or user ID' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.name);
    const filename = `dp-${uniqueSuffix}${ext}`;
    const filePath = path.join(process.cwd(), 'public/uploads', filename);

    // Save file to filesystem
    await writeFile(filePath, buffer);

    // First verify the user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update or create user profile
    const updatedProfile = await UserProfile.findOneAndUpdate(
      { userId: userId }, // Search condition
      { profilePicture: `/uploads/${filename}` }, // Update
      { 
        new: true,
        upsert: true // Create if doesn't exist
      }
    );

    return NextResponse.json({
      filePath: `/uploads/${filename}`,
      profile: updatedProfile
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}