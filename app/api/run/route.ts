import { NextResponse } from 'next/server';

const PISTON_URL = 'https://emkc.org/api/v2/piston/execute';

export async function POST(req: Request) {
    try {
        const { language, version, code } = await req.json();

        if (!language || !version || !code) {
            return NextResponse.json({ error: 'language, version, and code are required' }, { status: 400 });
        }

        const response = await fetch(PISTON_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                language,
                version,
                files: [
                    {
                        content: code,
                    },
                ],
            }),
        });

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to execute code' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Run Error:', error);
        return NextResponse.json({ error: error.message || 'Execution failed' }, { status: 500 });
    }
}
