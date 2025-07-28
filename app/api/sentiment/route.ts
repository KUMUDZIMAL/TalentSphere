// app/api/sentiment/route.ts
import { NextResponse } from "next/server";
import Sentiment from "sentiment";

const sentiment = new Sentiment();

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }
    const result = sentiment.analyze(text);
    // result includes properties like score and comparative (score normalized by word count)
    return NextResponse.json({ score: result.score, comparative: result.comparative });
  } catch (error: any) {
    console.error("Sentiment analysis error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
