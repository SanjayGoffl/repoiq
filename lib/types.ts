// ============================================================
// RepoIQ — All TypeScript types live here
// NEVER define types inline in components
// ============================================================

// ---- Enums / Literals ----
export type SessionStatus =
  | 'ingesting'
  | 'indexing'
  | 'analyzing'
  | 'complete'
  | 'failed';

export type UserPlan = 'free' | 'pro';
export type UserRole = 'student' | 'admin';
export type BugSeverity = 'critical' | 'high' | 'medium' | 'low';
export type MessageRole = 'user' | 'assistant';

// ---- Domain Models ----
export interface Concept {
  concept: string;
  file: string;
  lines: number[];
  why_critical: string;
  first_question: string;
}

export interface Bug {
  file: string;
  line: number;
  issue: string;
  severity: BugSeverity;
}

export interface LearningPathItem {
  week: number;
  focus: string;
  reason: string;
}

// ---- Enhanced Analysis Types ----
export interface StackInfo {
  frameworks: string[];
  libraries: string[];
  databases: string[];
  tools: string[];
}

export interface LinesOfCode {
  total: number;
  by_language: Record<string, number>;
}

export interface Dependency {
  name: string;
  version: string;
  type: 'production' | 'dev';
  source_file: string;
}

export interface RuntimeRequirements {
  ram_estimate_mb: number;
  ram_reasoning: string;
  runtime_versions: { name: string; version: string }[];
  system_requirements: string[];
}

export interface FileImportance {
  path: string;
  score: number;
  reason: string;
  category: 'critical' | 'important' | 'normal';
}

export interface Lesson {
  lesson_id: string;
  session_id: string;
  order_index: number;
  title: string;
  description: string;
  files_covered: string[];
  concepts_covered: string[];
  complexity_level: 'beginner' | 'intermediate' | 'advanced';
}

export interface UserMemory {
  user_id: string;
  memory_md: string;
  last_updated: string;
  version: number;
}

export interface Report {
  architecture_summary: string;
  top_5_concepts: Concept[];
  bugs_found: Bug[];
  learning_path: LearningPathItem[];
  // Enhanced analysis (optional for backward compat)
  stack_info?: StackInfo;
  lines_of_code?: LinesOfCode;
  dependencies?: Dependency[];
  runtime_requirements?: RuntimeRequirements;
  file_importance?: FileImportance[];
  lessons?: Lesson[];
}

export interface Session {
  session_id: string;
  user_id: string;
  repo_url: string;
  repo_name: string;
  status: SessionStatus;
  s3_prefix: string;
  kb_data_source_id: string | null;
  report: Report | null;
  file_count: number;
  languages: string[];
  teach_mode_started: boolean;
  teach_mode_completed: boolean;
  created_at: string;
  completed_at: string | null;
  files_data?: { path: string; content: string }[];
}

export interface Gap {
  gap_id: string;
  session_id: string;
  user_id: string;
  concept_name: string;
  concept_file: string;
  concept_lines: number[];
  order_index: number;
  understood: boolean;
  score: number | null;
  attempts: number;
  started_at: string | null;
  completed_at: string | null;
}

export interface User {
  user_id: string;
  email: string;
  name: string;
  plan: UserPlan;
  quota_used: number;
  quota_limit: number;
  role: UserRole;
  streak_days: number;
  created_at: string;
  last_active: string;
}

export interface Message {
  message_id: string;
  session_id: string;
  created_at: string;
  user_id: string;
  concept_id: string;
  role: MessageRole;
  content: string;
  code_reference: CodeReference | null;
  is_hint: boolean;
}

export interface CodeReference {
  file: string;
  lines: number[];
}

// ---- API Request / Response Types ----
export interface AnalyzeRequest {
  repo_url: string;
  language_filter?: string[];
}

export interface AnalyzeResponse {
  session_id: string;
  status: SessionStatus;
  estimated_seconds: number;
}

export interface ChatRequest {
  session_id: string;
  concept_id: string;
  message: string;
  is_hint?: boolean;
}

export interface ChatResponse {
  response: string;
  code_reference?: CodeReference;
  concept_understood?: boolean;
}

export interface QuotaResponse {
  quota_used: number;
  quota_limit: number;
  plan: UserPlan;
}

export interface QuotaExceededError {
  error: 'quota_exceeded';
  quota_used: number;
  quota_limit: number;
  upgrade_url: string;
}

// ---- Analytics ----
export type AnalyticsEventType =
  | 'repo_submitted'
  | 'report_viewed'
  | 'teach_started'
  | 'concept_complete'
  | 'upgrade_clicked'
  | 'bug_viewed';

export interface AnalyticsEvent {
  event_id: string;
  event_type: AnalyticsEventType;
  created_at: string;
  user_id: string | null;
  session_id: string | null;
  metadata: Record<string, string>;
}

// ---- Line Chat Types ----
export interface LineChatRequest {
  session_id: string;
  file_path: string;
  line_number: number;
  code_line: string;
  question?: string;
}

export interface LineChatResponse {
  explanation: string;
  references: { name: string; type: 'library' | 'variable' | 'function' | 'type'; doc_url?: string }[];
  follow_up_suggestion: string;
}

export type ChatContextType = 'concept' | 'line' | 'lesson';

// ---- Fix Suggestion Types ----
export interface FixSuggestion {
  before: string;
  after: string;
  explanation: string;
}

export interface FixRequest {
  session_id: string;
  file_path: string;
  line: number;
  issue: string;
  severity: string;
}

// ---- UI State ----
export interface LoadingStep {
  label: string;
  status: 'pending' | 'active' | 'complete' | 'error';
}
