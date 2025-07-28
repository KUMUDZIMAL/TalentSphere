import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { writeFile } from 'fs/promises';
import mongoose from 'mongoose';

// Import your models
import Post from '@/models/Post';
import User from '@/models/User';
import { moderateContent } from '@/lib/moderation';

// MongoDB Connection
if (!mongoose.connection.readyState) {
  mongoose.connect(process.env.MONGODB_URI!);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const userId = formData.get('userId') as string;
    const content = formData.get('content') as string;
    const caption = formData.get('caption') as string;
    const files = formData.getAll('media');

    console.log('Received userId:', userId);

    if (!userId || userId === 'undefined') {
      console.error('Invalid or missing userId:', userId);
      return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Moderate post content
    const moderation = moderateContent(content);
    if (moderation.isFlagged) {
      return NextResponse.json({
        error: 'Content flagged by moderation.',
        reasons: moderation.reasons,
      }, { status: 403 });
    }

    // Handle file uploads
    const mediaUrls: string[] = [];
    for (const file of files) {
      if (file instanceof Blob) {
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const fileName = `${Date.now()}-${file.name}`;
        const filePath = path.join(process.cwd(), 'public/uploads', fileName);
        await writeFile(filePath, fileBuffer);
        mediaUrls.push(`/uploads/${fileName}`);
      }
    }

    // Create and save the post
    const newPost = new Post({
      titles: [], // You can modify this as needed
      content,
      caption,
      author: user._id,
      media: mediaUrls,
    });

    await newPost.save();

    return NextResponse.json({ message: 'Post created successfully', post: newPost });
  } catch (error) {
    console.error('Unexpected Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
