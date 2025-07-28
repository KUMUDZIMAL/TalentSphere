import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Post from '@/models/Post';
import mongoose from 'mongoose';
import { moderateContent } from '@/lib/moderation';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { userId, content, media, titles } = await req.json();
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !content ||
      typeof content !== 'string'
    ) {
      return NextResponse.json({ error: 'Invalid data.' }, { status: 400 });
    }

    // Moderate content
    const moderation = moderateContent(content);
    if (moderation.isFlagged) {
      return NextResponse.json({
        error: 'Content flagged by moderation.',
        reasons: moderation.reasons,
      }, { status: 403 });
    }

    const post = new Post({
      author: new mongoose.Types.ObjectId(userId),
      content: content.trim(),
      media: media || [],
      titles: titles || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await post.save();

    return NextResponse.json({
      post: {
        _id: post._id,
        author: post.author,
        content: post.content,
        media: post.media,
        titles: post.titles,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      },
    }, { status: 201 });
  } catch (err) {
    console.error('Error creating post:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
} 