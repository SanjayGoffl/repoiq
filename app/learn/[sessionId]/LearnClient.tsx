'use client';

import { useState } from 'react';
import type { Session, Concept } from '../../../lib/types';
import Mermaid from '../../../components/Mermaid';
import CodeEditor from '../../../components/CodeEditor';

export default function LearnClient({ session }: { session: Session }) {
    const [activeTab, setActiveTab] = useState<'stack' | 'structure' | 'architecture' | 'code' | 'chat'>('stack');
    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState<{ role: string, content: string }[]>([
        { role: 'assistant', content: 'Hi! I am your Socratic AI Tutor. Ask me anything about this repository!' }
    ]);
    const [chatLoading, setChatLoading] = useState(false);

    const report = session.report;

    if (!report) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <svg className="animate-spin h-8 w-8 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p>Analysis in progress. Please refresh in a moment...</p>
            </div>
        );
    }

    const handleChat = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        const newMsg = chatInput;
        setChatInput('');
        setChatHistory(prev => [...prev, { role: 'user', content: newMsg }]);
        setChatLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId: session.session_id, message: newMsg }),
            });
            const data = await res.json();
            setChatHistory(prev => [...prev, { role: 'assistant', content: data.content }]);
        } catch (e) {
            setChatHistory(prev => [...prev, { role: 'assistant', content: 'Error communicating with tutor.' }]);
        } finally {
            setChatLoading(false);
        }
    };

    const TabButton = ({ id, label, icon }: { id: any, label: string, icon: React.ReactNode }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium transition-colors ${activeTab === id
                ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
        >
            {icon}
            {label}
        </button>
    );

    return (
        <div className="glass rounded-2xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60">
            <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                <TabButton id="stack" label="Tech Stack" icon={
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
                } />
                <TabButton id="structure" label="Structure" icon={
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
                } />
                <TabButton id="architecture" label="Architecture" icon={
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                } />
                <TabButton id="code" label="Key Concepts" icon={
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
                } />
                <TabButton id="chat" label="Socratic Tutor" icon={
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                } />
            </div>

            <div className="p-8 min-h-[60vh]">
                {activeTab === 'stack' && (
                    <div className="space-y-6 animate-fade-in">
                        <h2 className="text-2xl font-semibold">Project Architecture Summary</h2>
                        <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                            {report.architecture_summary}
                        </p>
                        <div className="mt-8">
                            <h3 className="text-lg font-medium mb-4 text-gray-500 uppercase tracking-wider text-sm">Detected Languages</h3>
                            <div className="flex flex-wrap gap-3">
                                {session.languages.map(l => (
                                    <span key={l} className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-medium shadow-sm">
                                        {l}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="mt-8 p-6 glass rounded-xl">
                            <h3 className="text-xl font-medium mb-4">Recommended Learning Path</h3>
                            <div className="space-y-4">
                                {report.learning_path?.map(lp => (
                                    <div key={lp.week} className="flex gap-4 items-start">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 font-bold">
                                            {lp.week}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-lg">{lp.focus}</h4>
                                            <p className="text-gray-600 dark:text-gray-400">{lp.reason}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'structure' && (
                    <div className="animate-fade-in flex flex-col items-center">
                        <h2 className="text-2xl font-semibold mb-6 w-full">Repository Structure</h2>
                        <div className="w-full bg-gray-50 dark:bg-gray-900 rounded-xl p-8 overflow-auto border border-gray-200 dark:border-gray-800">
                            <Mermaid chart={report.project_structure_mermaid} />
                        </div>
                    </div>
                )}

                {activeTab === 'architecture' && (
                    <div className="animate-fade-in flex flex-col items-center">
                        <h2 className="text-2xl font-semibold mb-6 w-full">System Flow & Architecture</h2>
                        <p className="text-gray-500 mb-6 w-full">This diagram shows how different parts of the application talk to each other.</p>
                        <div className="w-full bg-gray-50 dark:bg-gray-900 rounded-xl p-8 overflow-auto border border-gray-200 dark:border-gray-800 min-h-[400px] flex items-center">
                            <Mermaid chart={report.architecture_mermaid} />
                        </div>
                    </div>
                )}

                {activeTab === 'code' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
                        <div>
                            <h2 className="text-2xl font-semibold mb-6">Top 5 Concepts to Learn</h2>
                            <div className="space-y-6">
                                {report.top_5_concepts?.map((c, i) => (
                                    <div key={i} className="p-5 glass rounded-xl border border-gray-200 dark:border-gray-800 hover:shadow-md transition">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400">{c.concept}</h3>
                                            <span className="text-xs bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded text-gray-600 dark:text-gray-300 font-mono">
                                                {c.file}
                                            </span>
                                        </div>
                                        <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm leading-relaxed">{c.why_critical}</p>
                                        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800/50">
                                            <p className="text-sm font-medium text-indigo-800 dark:text-indigo-300 italic">"{c.first_question}"</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h2 className="text-2xl font-semibold mb-6">Interactive Scratchpad</h2>
                            <p className="text-gray-500 mb-4 text-sm">Test out Javascript logic here to understand how things work under the hood. Powered by Piston Engine.</p>
                            <CodeEditor />
                        </div>
                    </div>
                )}

                {activeTab === 'chat' && (
                    <div className="animate-fade-in flex flex-col h-[60vh]">
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50 rounded-t-xl border border-b-0 border-gray-200 dark:border-gray-800">
                            {chatHistory.map((m, i) => (
                                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[75%] p-4 rounded-2xl ${m.role === 'user'
                                            ? 'bg-blue-600 text-white rounded-br-none'
                                            : 'glass border border-gray-200 dark:border-gray-700 rounded-bl-none'
                                        }`}>
                                        {m.content}
                                    </div>
                                </div>
                            ))}
                            {chatLoading && (
                                <div className="flex justify-start">
                                    <div className="glass p-4 rounded-2xl rounded-bl-none flex items-center gap-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <form onSubmit={handleChat} className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-b-xl flex gap-2">
                            <input
                                type="text"
                                value={chatInput}
                                onChange={e => setChatInput(e.target.value)}
                                placeholder="Ask your tutor to explain a concept..."
                                className="flex-1 bg-transparent border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <button
                                type="submit"
                                disabled={chatLoading || !chatInput.trim()}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium disabled:opacity-50 transition"
                            >
                                Send
                            </button>
                        </form>
                    </div>
                )
                }
            </div >
        </div >
    );
}
