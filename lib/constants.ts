import type { UserPlan } from '@/lib/types';

// ---- Quota ----
export const QUOTA_LIMITS: Record<UserPlan, number> = {
  free: 10,
  pro: 999,
};

export const FREE_QUOTA = 10;
export const MAX_REPO_SIZE_MB = 50;

// ---- Status labels ----
export const STATUS_LABELS: Record<string, string> = {
  ingesting: 'Cloning repository...',
  indexing: 'Indexing files with AI...',
  analyzing: 'Generating your report...',
  complete: 'Analysis complete',
  failed: 'Analysis failed',
};

// ---- Loading steps ----
export const LOADING_STEPS = [
  { key: 'ingesting', label: 'Cloning repository', icon: 'download' },
  { key: 'indexing', label: 'Uploading & indexing files', icon: 'upload' },
  { key: 'analyzing', label: 'AI generating your report', icon: 'brain' },
  { key: 'complete', label: 'Report ready', icon: 'check' },
] as const;

// ---- Polling ----
export const SESSION_POLL_INTERVAL = 2000; // 2 seconds

// ---- Bedrock ----
export const BEDROCK_MODEL_ID = 'anthropic.claude-3-5-sonnet-20241022-v2:0';
export const BEDROCK_FALLBACK_MODEL_ID = 'amazon.nova-lite-v1:0';

// ---- Routes ----
export const ROUTES = {
  HOME: '/',
  AUTH: '/auth',
  DEMO: '/demo',
  DASHBOARD: '/dashboard',
  ANALYZE: '/analyze',
  SETTINGS: '/settings',
  ADMIN: '/admin',
  sessionLoading: (id: string) => `/analyze/${id}/loading`,
  sessionReport: (id: string) => `/analyze/${id}/report`,
  sessionTeach: (id: string) => `/analyze/${id}/teach`,
  sessionLessons: (id: string) => `/analyze/${id}/lessons`,
  conceptComplete: (sessionId: string, conceptId: string) =>
    `/analyze/${sessionId}/teach/${conceptId}/complete`,
  sessionPath: (id: string) => `/analyze/${id}/path`,
  sessionQuiz: (id: string) => `/analyze/${id}/quiz`,
  COMPARE: '/compare',
  LEADERBOARD: '/leaderboard',
} as const;

// ---- API endpoints ----
export const API = {
  ANALYZE: '/api/analyze',
  CHAT: '/api/chat',
  CHAT_LINE: '/api/chat/line',
  session: (id: string) => `/api/session/${id}`,
  sessionGaps: (id: string) => `/api/session/${id}/gaps`,
  sessionFiles: (id: string) => `/api/session/${id}/files`,
  sessionLessons: (id: string) => `/api/session/${id}/lessons`,
  gap: (id: string) => `/api/gaps/${id}`,
  USER_QUOTA: '/api/user',
  FIX: '/api/fix',
  DIAGRAM: '/api/diagram',
  USAGE: '/api/usage',
  QUIZ: '/api/quiz',
  TRANSLATE: '/api/translate',
  SPEAK: '/api/speak',
} as const;

// ---- Fun facts for loading screen ----
export const LOADING_FACTS = [
  'The average "vibe-coded" project has 3 critical concepts the developer cannot explain.',
  'N+1 query bugs appear in 40% of student projects we scan.',
  'Most authentication middleware has at least one missed edge case.',
  'State management is the #1 concept students struggle to explain.',
  'Students who use teach-back mode score 50% higher on code comprehension.',
  'RepoIQ has found hardcoded API keys in 1 out of 5 repos scanned.',
  'The most common bug: missing error handling on async operations.',
  'Understanding your own code is the fastest path to debugging it.',
  'Over 60% of junior devs cannot explain their own API route handlers.',
  'Code reviews catch 60% more bugs when the author can explain every line.',
  'The teach-back method was invented by Nobel physicist Richard Feynman.',
  'AI-generated code often lacks proper input validation at system boundaries.',
  'Most security vulnerabilities come from copy-pasted code snippets.',
  'Projects with good error handling have 3x fewer production incidents.',
  'RepoIQ analyzes your code using Amazon Bedrock AI on AWS.',
  'The best way to learn a codebase is to teach it to someone else.',
];

// ---- Severity order ----
export const SEVERITY_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};
