import { NextResponse } from 'next/server';
import { chatWithBedrock } from '../../../lib/aws';
import { createMessage, getMessagesBySessionId } from '../../../lib/db';

export async function POST(req: Request) {
    try {
        const { sessionId, message } = await req.json();

        if (!sessionId || !message) {
            return NextResponse.json({ error: 'sessionId and message are required' }, { status: 400 });
        }

        // Save user message
        await createMessage({
            message_id: crypto.randomUUID(),
            session_id: sessionId,
            created_at: new Date().toISOString(),
            role: 'user',
            content: message,
        });

        // Get message history
        const history = await getMessagesBySessionId(sessionId);

        // Format for Bedrock
        const bedrockMessages = history.map((m) => ({
            role: m.role,
            content: m.content,
        }));

        const systemPrompt = `You are a helpful programming tutor. You are teaching a beginner student about their code.
Keep your answers brief, clear, and highly encouraging. Use Socratic questioning to guide them to answers. Never just give the answer upfront. Explain concepts simply.`;

        const assistantReply = await chatWithBedrock(bedrockMessages, systemPrompt);

        // Save assistant message
        const assistantMsg = await createMessage({
            message_id: crypto.randomUUID(),
            session_id: sessionId,
            created_at: new Date().toISOString(),
            role: 'assistant',
            content: assistantReply,
        });

        return NextResponse.json(assistantMsg);
    } catch (error: any) {
        console.error('Chat Error:', error);
        return NextResponse.json({ error: error.message || 'Chat failed' }, { status: 500 });
    }
}
