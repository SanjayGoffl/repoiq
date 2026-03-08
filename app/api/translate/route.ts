import { NextRequest, NextResponse } from 'next/server';
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

const MODEL_ID = process.env.BEDROCK_MODEL_ID || 'us.amazon.nova-pro-v1:0';
const FALLBACK_MODEL_ID = process.env.BEDROCK_FALLBACK_MODEL_ID || 'amazon.nova-lite-v1:0';
const FALLBACK_MODEL_ID_2 = process.env.BEDROCK_FALLBACK_MODEL_ID_2 || 'amazon.nova-micro-v1:0';

const SUPPORTED_LANGUAGES: Record<string, string> = {
  hi: 'Hindi',
  ta: 'Tamil',
  te: 'Telugu',
  kn: 'Kannada',
  ml: 'Malayalam',
  bn: 'Bengali',
  mr: 'Marathi',
  gu: 'Gujarati',
  pa: 'Punjabi',
  en: 'English',
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { text, target_lang } = (await request.json()) as {
      text?: string;
      target_lang?: string;
    };

    if (!text || !target_lang) {
      return NextResponse.json(
        { error: 'text and target_lang are required' },
        { status: 400 },
      );
    }

    if (target_lang === 'en') {
      return NextResponse.json({ translated_text: text });
    }

    const langName = SUPPORTED_LANGUAGES[target_lang] ?? target_lang;

    const prompt = `Translate the following technical text to ${langName}. Keep code terms, file names, and technical keywords in English. Only translate the explanatory text.

Text to translate:
${text}

Respond with ONLY the translated text, nothing else.`;

    const body = JSON.stringify({
      messages: [{ role: 'user', content: [{ text: prompt }] }],
      inferenceConfig: { maxTokens: 4096, temperature: 0.2 },
    });

    const modelsToTry = [MODEL_ID, FALLBACK_MODEL_ID, FALLBACK_MODEL_ID_2];
    let lastError: unknown;

    for (const modelId of modelsToTry) {
      try {
        const command = new InvokeModelCommand({
          modelId,
          contentType: 'application/json',
          accept: 'application/json',
          body: new TextEncoder().encode(body),
        });
        const response = await bedrockClient.send(command);
        const responseBody = JSON.parse(new TextDecoder().decode(response.body as Uint8Array)) as {
          output?: { message?: { content?: { text: string }[] } };
        };
        const translated = responseBody?.output?.message?.content?.[0]?.text?.trim() ?? text;
        return NextResponse.json({ translated_text: translated });
      } catch (err) {
        lastError = err;
        console.error(`[Translate] Model ${modelId} failed:`, err);
      }
    }

    console.error('[Translate] All models failed:', lastError);
    return NextResponse.json({ translated_text: text }); // Fallback to original
  } catch (error) {
    console.error('[POST /api/translate] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
