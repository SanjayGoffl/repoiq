import { NextRequest, NextResponse } from 'next/server';
import { getSessionById } from '@/lib/dynamodb';
import { raceBedrockAndOpenRouter, parseJsonResponse } from '@/lib/openrouter';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { session_id, question_count = 5, topic } = (await request.json()) as {
      session_id?: string;
      question_count?: number;
      topic?: string;
    };

    if (!session_id) {
      return NextResponse.json({ error: 'session_id is required' }, { status: 400 });
    }

    const session = await getSessionById(session_id);
    if (!session?.report) {
      return NextResponse.json({ error: 'Session or report not found' }, { status: 404 });
    }

    const report = session.report;
    const count = Math.min(Math.max(question_count, 1), 20); // Clamp 1-20

    // Build context based on topic
    let topicContext = '';
    let topicInstruction = '';

    switch (topic) {
      case 'architecture':
        topicContext = `Architecture: ${report.architecture_summary}\nStack: ${JSON.stringify(report.stack_info)}`;
        topicInstruction = 'Focus questions on system architecture, design patterns, component relationships, and tech stack choices.';
        break;
      case 'bugs':
        topicContext = `Bugs found:\n${report.bugs_found.map((b) => `- ${b.file}:${b.line} — ${b.issue} (${b.severity})`).join('\n')}`;
        topicInstruction = 'Focus questions on identifying bugs, code smells, error handling, and code quality best practices.';
        break;
      case 'security': {
        const secFindings = (report as unknown as Record<string, unknown>).security;
        topicContext = secFindings ? `Security: ${JSON.stringify(secFindings)}` : `Bugs: ${report.bugs_found.map((b) => b.issue).join(', ')}`;
        topicInstruction = 'Focus questions on security vulnerabilities, OWASP Top 10, authentication, authorization, and data protection.';
        break;
      }
      case 'concepts':
        topicContext = `Key concepts:\n${report.top_5_concepts.map((c) => `- ${c.concept} (${c.file}): ${c.why_critical}`).join('\n')}`;
        topicInstruction = 'Focus questions on the core concepts, algorithms, and patterns the student needs to understand.';
        break;
      case 'dependencies':
        topicContext = `Dependencies: ${report.dependencies?.map((d) => `${d.name}@${d.version}`).join(', ') ?? 'unknown'}\nStack: ${JSON.stringify(report.stack_info)}`;
        topicInstruction = 'Focus questions on dependencies, package management, framework APIs, and library usage patterns.';
        break;
      default: {
        const concepts = report.top_5_concepts
          .map((c) => `${c.concept} (file: ${c.file}, why: ${c.why_critical})`)
          .join('\n');
        topicContext = `Key concepts:\n${concepts}\nArchitecture: ${report.architecture_summary}`;
        topicInstruction = 'Cover a mix of architecture, concepts, bugs, and dependencies.';
      }
    }

    const prompt = `Generate a quiz with exactly ${count} multiple-choice questions to test a student's understanding of a codebase called "${session.repo_name}".

${topicContext}

${topicInstruction}

Respond with ONLY valid JSON (no markdown, no backticks):
{
  "questions": [
    {
      "question": "The question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "explanation": "Brief explanation of why this is correct"
    }
  ]
}

Rules:
- Exactly ${count} questions, each with exactly 4 options
- "correct" is the 0-based index of the right answer
- Questions should test understanding, not memorization
- Reference actual files and code from the codebase
- Mix difficulty: ${Math.ceil(count * 0.3)} easy, ${Math.ceil(count * 0.4)} medium, ${Math.max(1, count - Math.ceil(count * 0.3) - Math.ceil(count * 0.4))} hard`;

    try {
      const text = await raceBedrockAndOpenRouter(prompt, { maxTokens: 8192, temperature: 0.4 });
      const quiz = parseJsonResponse(text);
      return NextResponse.json(quiz);
    } catch (err) {
      console.error('[Quiz] All models failed:', err);
      return NextResponse.json({ error: 'Failed to generate quiz' }, { status: 500 });
    }
  } catch (error) {
    console.error('[POST /api/quiz] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
