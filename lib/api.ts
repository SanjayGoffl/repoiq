import type {
  AnalyzeRequest,
  AnalyzeResponse,
  ChatRequest,
  ChatResponse,
  FixRequest,
  FixSuggestion,
  Gap,
  QuotaResponse,
  Session,
} from '@/lib/types';
import { API } from '@/lib/constants';

function getGuestId(): string {
  if (typeof window === 'undefined') return 'guest';
  return localStorage.getItem('repoiq_guest_id') ?? 'guest';
}

// ---- Base fetch wrapper ----
async function apiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'x-guest-id': getGuestId(),
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new ApiError(res.status, errorBody.error ?? 'Request failed', errorBody);
  }

  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ---- API client ----
export const api = {
  // Analyze
  analyzeRepo: (data: AnalyzeRequest) =>
    apiFetch<AnalyzeResponse>(API.ANALYZE, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Session
  getSession: (sessionId: string) =>
    apiFetch<Session>(API.session(sessionId)),

  getSessionGaps: (sessionId: string) =>
    apiFetch<Gap[]>(API.sessionGaps(sessionId)),

  // Chat
  sendMessage: (data: ChatRequest) =>
    apiFetch<ChatResponse>(API.CHAT, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Gaps
  markGapUnderstood: (gapId: string) =>
    apiFetch<Gap>(API.gap(gapId), {
      method: 'PATCH',
      body: JSON.stringify({ understood: true }),
    }),

  // Quota
  getQuota: () =>
    apiFetch<QuotaResponse>(API.USER_QUOTA),

  // Fix suggestions
  getFixSuggestion: (data: FixRequest) =>
    apiFetch<FixSuggestion>(API.FIX, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Architecture diagram
  generateDiagram: (sessionId: string, diagramType = 'architecture') =>
    apiFetch<{ mermaid_code: string; diagram_type: string }>(API.DIAGRAM, {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId, diagram_type: diagramType }),
    }),
};
