'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
    const [repoUrl, setRepoUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!repoUrl) return;

        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ repoUrl }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to analyze repository');
            }

            router.push(`/learn/${data.sessionId}`);
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
            <div className="text-center max-w-3xl mb-12 animate-fade-in-up">
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 drop-shadow-sm">
                    Understand any codebase,<br /> instantly.
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 font-light leading-relaxed">
                    Paste a GitHub link. RepoIQ's AI reads the code, maps the architecture, and teaches it to you like you're five.
                </p>
            </div>

            <div className="w-full max-w-2xl animate-fade-in-up delay-150 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl blur-xl opacity-20 transform -translate-y-2 translate-x-2"></div>
                <form onSubmit={handleAnalyze} className="relative glass rounded-2xl p-4 flex flex-col sm:flex-row gap-3 shadow-2xl transition-all duration-300 hover:shadow-blue-500/10 hover:border-blue-400/50">
                    <input
                        type="url"
                        name="repo"
                        id="repo"
                        required
                        placeholder="https://github.com/owner/repository"
                        className="flex-1 bg-transparent border-0 px-4 py-3 text-lg focus:ring-0 focus:outline-none placeholder-gray-400 dark:text-white"
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={loading || !repoUrl}
                        className={`
              px-8 py-3 rounded-xl font-semibold text-white text-lg transition-all duration-300
              ${loading
                                ? 'bg-blue-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0'
                            }
            `}
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Analyzing...
                            </span>
                        ) : 'Learn Repo'}
                    </button>
                </form>
                {error && (
                    <div className="absolute -bottom-16 left-0 right-0text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-100/80 dark:bg-red-900/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 backdrop-blur-md shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                            {error}
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-20 flex gap-12 text-center text-sm font-medium text-gray-400 animate-fade-in-up delay-300">
                <div className="flex flex-col items-center gap-2">
                    <div className="h-12 w-12 rounded-full glass flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
                    </div>
                    <span>Visual Architecture</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <div className="h-12 w-12 rounded-full glass flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
                    </div>
                    <span>Interactive Code Editor</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <div className="h-12 w-12 rounded-full glass flex items-center justify-center bg-purple-50 dark:bg-purple-900/20 text-purple-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    </div>
                    <span>Socratic AI Tutor</span>
                </div>
            </div>
        </div>
    );
}
