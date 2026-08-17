import Link from 'next/link';

export default function Topbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-opacity-10 shadow-sm h-16 flex items-center px-6">
            <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">RepoIQ</span>
            </Link>
            <div className="flex-1" />
            <div className="text-sm font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full shadow-inner">
                V2 Demo
            </div>
        </nav>
    );
}
