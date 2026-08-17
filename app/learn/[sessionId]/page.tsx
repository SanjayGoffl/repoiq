import { notFound } from 'next/navigation';
import { getSessionById } from '../../../lib/db';
import LearnClient from './LearnClient';

export default async function LearnPage({ params }: { params: { sessionId: string } }) {
    const session = await getSessionById(params.sessionId);

    if (!session) {
        notFound();
    }

    // Wait until analysis is complete. In a real app we'd show a loading state on the client.
    // For v2 simplicity, the landing page POST request waits until it's done before redirecting.

    return (
        <div className="w-full max-w-6xl mx-auto animate-fade-in">
            <div className="mb-8">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-500">
                    Learning: {session.repo_name}
                </h1>
                <p className="text-gray-500 mt-2 flex gap-4 text-sm">
                    <span><span className="font-semibold text-gray-700 dark:text-gray-300">Files:</span> {session.file_count}</span>
                    <span><span className="font-semibold text-gray-700 dark:text-gray-300">Languages:</span> {session.languages.join(', ')}</span>
                </p>
            </div>

            <LearnClient session={session} />
        </div>
    );
}
