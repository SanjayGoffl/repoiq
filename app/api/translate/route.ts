import { NextRequest, NextResponse } from 'next/server';
import { raceBedrockAndOpenRouter } from '@/lib/openrouter';

const SUPPORTED_LANGUAGES: Record<string, string> = {
  hi: 'Hindi', ta: 'Tamil', te: 'Telugu', kn: 'Kannada',
  ml: 'Malayalam', bn: 'Bengali', mr: 'Marathi', gu: 'Gujarati',
  pa: 'Punjabi', en: 'English',
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { text, target_lang } = (await request.json()) as {
      text?: string;
      target_lang?: string;
    };

    if (!text || !target_lang) {
      return NextResponse.json({ error: 'text and target_lang are required' }, { status: 400 });
    }

    if (target_lang === 'en') {
      return NextResponse.json({ translated_text: text });
    }

    const langName = SUPPORTED_LANGUAGES[target_lang] ?? target_lang;

    const prompt = `Translate the following technical text to ${langName}. Keep code terms, file names, and technical keywords in English. Only translate the explanatory text.

Text to translate:
${text}

Respond with ONLY the translated text, nothing else.`;

    try {
      const translated = await raceBedrockAndOpenRouter(prompt, { maxTokens: 4096, temperature: 0.2 });
      return NextResponse.json({ translated_text: translated });
    } catch {
      return NextResponse.json({ translated_text: text }); // Fallback to original
    }
  } catch (error) {
    console.error('[POST /api/translate] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
