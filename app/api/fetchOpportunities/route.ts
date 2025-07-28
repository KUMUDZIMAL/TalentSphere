// File: /app/api/opportunities/route.ts

import { NextResponse } from "next/server";
import { dbConnect } from '@/lib/mongodb';
import Opportunity from "@/models/Opportunity";

export async function GET() {
  try {
    // 1. Establish a connection to MongoDB
    await dbConnect();

    // 2. Retrieve all opportunities, sorted by most recent first
    const opportunities = await Opportunity.find()
      .sort({ createdAt: -1 })
      .lean();

    // 3. Return the list as JSON
    return NextResponse.json({ opportunities }, { status: 200 });
  } catch (error) {
    console.error("Error fetching opportunities:", error);
    return NextResponse.json(
      { error: "Failed to fetch opportunities." },
      { status: 500 }
    );
  }
}

  