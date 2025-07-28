// File: /app/api/opportunities/[id]/route.ts
import { NextResponse } from "next/server";
import {dbConnect}from "@/lib/mongodb";
import Opportunity from "@/models/Opportunity";
import mongoose from "mongoose";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const { id } = params;

    // Validate that `id` is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid opportunity ID." },
        { status: 400 }
      );
    }

    // Find one opportunity by its _id
    const opportunity = await Opportunity.findById(id).lean();
    if (!opportunity) {
      return NextResponse.json(
        { error: "Opportunity not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ opportunity }, { status: 200 });
  } catch (error) {
    console.error("Error fetching single opportunity:", error);
    return NextResponse.json(
      { error: "Failed to fetch opportunity." },
      { status: 500 }
    );
  }
}
