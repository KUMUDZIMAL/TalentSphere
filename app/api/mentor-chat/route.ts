require('dotenv').config();
import { NextRequest, NextResponse } from 'next/server';
import { getRelevantChunks } from '@/lib/ragUtils';

const GROQ_API_KEY = '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'
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama3-70b-8192';
console.log("GROQ_API_KEY:", GROQ_API_KEY);


const SYSTEM_PROMPT = `You are a virtual mentor specializing in the entertainment, film, and music industries. Give career advice, portfolio feedback, and industry insights. Be supportive, insightful, and practical.`;

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Invalid message.' }, { status: 400 });
    }
    if (!GROQ_API_KEY) {
      return NextResponse.json({ error: 'Missing GROQ_API_KEY.' }, { status: 500 });
    }

    let relevantChunks, context;
    try {
      // RAG: Retrieve top 3 relevant PDF chunks
      relevantChunks = await getRelevantChunks(message, 3);
      context = relevantChunks.map((c, i) => `PDF Context [${i+1}]:\n${c}`).join('\n\n');
    } catch (ragErr) {
      console.error('Error in getRelevantChunks:', ragErr);
      return NextResponse.json({ error: 'RAG error', details: typeof ragErr === 'object' && ragErr !== null && 'message' in ragErr ? (ragErr as any).message : String(ragErr) }, { status: 500 });
    }

    let groqRes;
    try {
      groqRes = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'system', content: `Relevant information from Film and TV Entertainment Career Guide:\n${context}` },
            { role: 'user', content: message },
          ],
          max_tokens: 512,
          temperature: 0.7,
        }),
      });
    } catch (fetchErr) {
      console.error('Error calling Groq API:', fetchErr);
      return NextResponse.json({ error: 'Groq API fetch error', details: typeof fetchErr === 'object' && fetchErr !== null && 'message' in fetchErr ? (fetchErr as any).message : String(fetchErr) }, { status: 500 });
    }

    if (!groqRes.ok) {
      const error = await groqRes.text();
      console.error('Groq API error response:', error);
      return NextResponse.json({ error: 'Groq API error', details: error }, { status: 500 });
    }
    let data;
    try {
      data = await groqRes.json();
    } catch (jsonErr) {
      console.error('Error parsing Groq API response:', jsonErr);
      return NextResponse.json({ error: 'Groq API response parse error', details: typeof jsonErr === 'object' && jsonErr !== null && 'message' in jsonErr ? (jsonErr as any).message : String(jsonErr) }, { status: 500 });
    }
    const aiMessage = data.choices?.[0]?.message?.content || 'No response.';
    // Clean up markdown: remove **, convert numbered and bulleted lists to plain text
    let cleaned = aiMessage
      .replace(/\*\*/g, '') // Remove all bold markdown
      .replace(/\n\s*\d+\.\s*/g, (match: string) => '\n' + match.trim()) // Keep numbered lists
      .replace(/\n\s*[-•]\s*/g, '\n- ') // Normalize bullet points
      .replace(/\n\s*\*\s*/g, '\n- '); // Convert asterisk bullets to dash
    return NextResponse.json({ reply: cleaned });
  } catch (err) {
    console.error('Mentor chat error:', err);
    return NextResponse.json({ error: 'Server error.', details: typeof err === 'object' && err !== null && 'message' in err ? (err as any).message : String(err) }, { status: 500 });
  }
} 