import { NextResponse } from 'next/server';
import { fetchRepoFiles, detectLanguages, analyzeWithBedrock } from '../../../lib/aws';
import { createSession, updateSessionReport } from '../../../lib/db';

export async function POST(req: Request) {
    try {
        const { repoUrl } = await req.json();

        if (!repoUrl) {
            return NextResponse.json({ error: 'repoUrl is required' }, { status: 400 });
        }

        const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (!match) {
            return NextResponse.json({ error: 'Invalid GitHub URL' }, { status: 400 });
        }

        const owner = match[1];
        const repo = match[2];

        // 1. Create a session in DB first
        const session = await createSession(repoUrl, repo);

        // Run the rest asynchronously or block? The user expects simple. Let's just block to keep it simple, or return session_id and have client poll?
        // In V1, it probably blocked for simple small repos or returned session_id, but here let's do synchronous for simplicity.
        // Wait, the instructions say: POST: GitHub URL -> fetch files -> Nova analysis -> save session -> return structured data
        // That means it waits!

        const files = await fetchRepoFiles(owner, repo);
        if (files.length === 0) {
            return NextResponse.json({ error: 'No readable files found in repo' }, { status: 400 });
        }

        const languages = detectLanguages(files);

        const report = await analyzeWithBedrock(files, repo);

        await updateSessionReport(session.session_id, report, files.length, languages);

        return NextResponse.json({
            sessionId: session.session_id,
            report,
            languages,
            fileCount: files.length,
        });
    } catch (error: any) {
        console.error('Analyze Error:', error);
        return NextResponse.json({ error: error.message || 'Analysis failed' }, { status: 500 });
    }
}
