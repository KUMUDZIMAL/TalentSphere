// app/api/savePortfolio/route.ts
import { NextResponse } from 'next/server';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { dbConnect } from '../../../lib/mongodb';
import Portfolio from '@/models/Portfolio';
import User from '@/models/User';

export async function POST(request: Request) {
  // Extract token from cookies
  const token = request.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.json({ error: "No token found" }, { status: 401 });
  }

  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
  } catch (error) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  if (!decoded || !decoded.id) {
    return NextResponse.json({ error: "Invalid token payload" }, { status: 401 });
  }

  try {
    // Connect to the database
    await dbConnect();

    // Verify that the user exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Parse the portfolio data from the request body
    const { elements } = await request.json();
    if (!elements) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Find the existing portfolio for this user, or create a new one
    let portfolio = await Portfolio.findOne({ userId: decoded.id });
    if (portfolio) {
      portfolio.elements = elements;
      await portfolio.save();
    } else {
      portfolio = await Portfolio.create({ userId: decoded.id, elements });
    }

    return NextResponse.json(
      { message: "Portfolio saved successfully", portfolio },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : error },
      { status: 500 }
    );
  }
}
