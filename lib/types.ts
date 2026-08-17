export type SessionStatus = 'ingesting' | 'indexing' | 'analyzing' | 'complete' | 'failed';

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
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export interface LearningPathItem {
  week: number;
  focus: string;
  reason: string;
}

export interface Report {
  architecture_summary: string;
  project_structure_mermaid: string;
  architecture_mermaid: string;
  top_5_concepts: Concept[];
  bugs_found: Bug[];
  learning_path: LearningPathItem[];
}

export interface Session {
  session_id: string;
  user_id: string; // "guest"
  repo_url: string;
  repo_name: string;
  status: SessionStatus;
  report: Report | null;
  file_count: number;
  languages: string[];
  created_at: string;
  completed_at: string | null;
}

export interface Message {
  message_id: string;
  session_id: string;
  created_at: string;
  role: 'user' | 'assistant';
  content: string;
}
