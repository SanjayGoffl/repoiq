import './globals.css';
import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'RepoIQ — AI-Powered Repository Intelligence',
  description:
    'RepoIQ scans your GitHub repo, surfaces the concepts you skipped and bugs you missed, then teaches you through Socratic dialogue until the code is truly yours.',
  keywords: ['AI', 'code learning', 'GitHub', 'repository analysis', 'developer education'],
  openGraph: {
    title: 'RepoIQ — AI-Powered Repository Intelligence',
    description:
      'Turn your vibe-coded project into deep technical mastery with AI-driven Socratic teaching.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="min-h-screen antialiased scrollbar-thin"
        style={{
          background: '#131313',
          color: '#e5e2e1',
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
      >
        <Providers>{children}</Providers>
        <Toaster
          theme="dark"
          position="top-right"
          richColors
          toastOptions={{
            style: {
              background: '#353534',
              border: '1px solid rgba(66,71,84,0.3)',
              color: '#e5e2e1',
            },
          }}
        />
      </body>
    </html>
  );
}
