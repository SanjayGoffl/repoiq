'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

export default function CodeEditor() {
    const [code, setCode] = useState('// Write simple code here and hit Run!\nconsole.log("Hello, RepoIQ!");');
    const [output, setOutput] = useState('');
    const [loading, setLoading] = useState(false);

    const runCode = async () => {
        setLoading(true);
        setOutput('Running...');
        try {
            const res = await fetch('/api/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    language: 'javascript', // Hardcode JS for simplicity, could be dynamic
                    version: '18.15.0',
                    code
                })
            });
            const data = await res.json();
            if (data.run?.stderr) {
                setOutput(data.run.stderr);
            } else {
                setOutput(data.run?.stdout || 'No output');
            }
        } catch (e: any) {
            setOutput(e.message || 'Error running code');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm">
                <Editor
                    height="40vh"
                    defaultLanguage="javascript"
                    theme="vs-dark"
                    value={code}
                    onChange={(val) => setCode(val || '')}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        padding: { top: 16 },
                    }}
                />
            </div>
            <div className="flex justify-between items-center">
                <button
                    onClick={runCode}
                    disabled={loading}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition flex items-center gap-2"
                >
                    {loading ? 'Running...' : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                            Run Code
                        </>
                    )}
                </button>
            </div>
            <div className="p-4 bg-black/90 text-green-400 font-mono text-sm rounded-lg min-h-[100px] whitespace-pre-wrap shadow-inner border border-gray-800">
                {output || '> Output will appear here'}
            </div>
        </div>
    );
}
