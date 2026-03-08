import { NextRequest, NextResponse } from 'next/server';

// Use browser-based speech synthesis instead of AWS Polly to avoid extra SDK dependency.
// This endpoint returns the text for the client to speak using Web Speech API.
// If AWS Polly is needed, swap this with @aws-sdk/client-polly.

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { text } = (await request.json()) as { text?: string };

    if (!text) {
      return NextResponse.json({ error: 'text is required' }, { status: 400 });
    }

    // Return text for browser-side TTS (Web Speech API)
    // Max 3000 chars to keep speech manageable
    const truncated = text.length > 3000 ? text.slice(0, 3000) + '...' : text;

    return NextResponse.json({ text: truncated, engine: 'browser' });
  } catch (error) {
    console.error('[POST /api/speak] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
