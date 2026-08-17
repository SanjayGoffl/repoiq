import './globals.css';
import Topbar from '../components/Topbar';

export const metadata = {
    title: 'RepoIQ V2 - Learn any Github Repo',
    description: 'Understand any codebase instantly using AI.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="min-h-screen pt-16 selection:bg-blue-200 selection:text-blue-900">
                <div className="fixed inset-0 -z-10 h-full w-full dark:bg-slate-950 bg-slate-50">
                    <div className="absolute bottom-0 left-[-20%] right-0 top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.15),rgba(255,255,255,0))]"></div>
                    <div className="absolute bottom-0 right-[-20%] top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(0,182,255,.15),rgba(255,255,255,0))]"></div>
                </div>
                <Topbar />
                <main className="container mx-auto px-4 py-8 h-[calc(100vh-64px)] overflow-auto">
                    {children}
                </main>
            </body>
        </html>
    );
}
