// /app/api/opportunities/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Opportunity from '@/models/Opportunity';

export async function POST(req: NextRequest) {
  try {
    // 1. Connect to the DB
    await dbConnect();

    // 2. Parse the JSON body
    const body = await req.json();
    const { userId, title, description, location, date, requirements } = body;

    // 3. Validate required fields
    if (!userId || !title || !description || !location || !date) {
      return NextResponse.json(
        { error: 'Missing one or more required fields.' },
        { status: 400 }
      );
    }

    // 4. Create a new opportunity
    const newOpportunity = await Opportunity.create({
      title,
      description,
      location,
      date: new Date(date),
      requirements: requirements || '',
      createdBy: userId,
    });

    return NextResponse.json({ opportunity: newOpportunity }, { status: 201 });
    
  } catch (err: any) {
    console.error('Error in /api/opportunities:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
