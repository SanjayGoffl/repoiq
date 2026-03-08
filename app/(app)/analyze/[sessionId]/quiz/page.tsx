'use client';

import { useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, XCircle, Trophy, ArrowLeft, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ROUTES } from '@/lib/constants';

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export default function QuizPage() {
  const params = useParams<{ sessionId: string }>();
  const router = useRouter();
  const sessionId = params.sessionId;

  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const startTime = useRef<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      });
      const data = await res.json();
      setQuestions(data.questions ?? []);
      setCurrentQ(0);
      setScore(0);
      setFinished(false);
      setSelected(null);
      setAnswered(false);
      setAnswers([]);
      startTime.current = Date.now();
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (idx: number) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    setAnswers((prev) => [...prev, idx]);
    if (questions && idx === questions[currentQ]?.correct) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (!questions) return;
    if (currentQ + 1 >= questions.length) {
      setFinished(true);
      setElapsedSeconds(Math.round((Date.now() - startTime.current) / 1000));
    } else {
      setCurrentQ((q) => q + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  // Start screen
  if (!questions) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-20">
        <Trophy className="h-16 w-16 text-yellow-400" />
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Quiz Mode</h1>
          <p className="mt-2 text-sm text-muted">
            Test your understanding of the codebase with AI-generated questions
          </p>
        </div>
        <Button onClick={handleGenerate} disabled={loading} size="lg" className="gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {loading ? 'Generating Quiz...' : 'Start Quiz'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(ROUTES.sessionReport(sessionId))}
          className="gap-1.5 text-muted"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Report
        </Button>
      </div>
    );
  }

  // Finished screen
  if (finished) {
    const percentage = Math.round((score / questions.length) * 100);
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;
    return (
      <div className="mx-auto max-w-2xl py-8">
        <div className="flex flex-col items-center gap-6">
          <div className={`flex h-28 w-28 items-center justify-center rounded-full border-4 ${
            percentage >= 80 ? 'border-emerald-500 text-emerald-400' :
            percentage >= 60 ? 'border-yellow-500 text-yellow-400' :
            'border-red-500 text-red-400'
          }`}>
            <span className="text-4xl font-bold">{percentage}%</span>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-white">
              {percentage >= 80 ? 'Excellent!' : percentage >= 60 ? 'Good effort!' : 'Keep learning!'}
            </h2>
            <div className="mt-2 flex items-center justify-center gap-4 text-sm text-muted">
              <span className="flex items-center gap-1">
                <Zap className="h-3.5 w-3.5 text-yellow-400" />
                {score}/{questions.length} correct
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-blue-400" />
                {minutes}m {seconds}s
              </span>
            </div>
          </div>
        </div>

        {/* Answer review */}
        <div className="mt-8 flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-white">Review Answers</h3>
          {questions.map((q, i) => {
            const userAnswer = answers[i];
            const isCorrect = userAnswer === q.correct;
            return (
              <Card key={i}>
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    {isCorrect ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    ) : (
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                    )}
                    <div className="flex-1">
                      <p className="text-xs text-white">{q.question}</p>
                      {!isCorrect && (
                        <p className="mt-1 text-xs text-muted">
                          Correct: <span className="text-emerald-400">{q.options[q.correct]}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={handleGenerate} variant="outline">
            Try Again
          </Button>
          <Button onClick={() => router.push(ROUTES.sessionReport(sessionId))}>
            Back to Report
          </Button>
        </div>
      </div>
    );
  }

  // Quiz question
  const q = questions[currentQ];
  if (!q) return null;

  return (
    <div className="mx-auto max-w-2xl py-8">
      {/* Progress */}
      <div className="mb-6 flex items-center justify-between text-sm text-muted">
        <span>Question {currentQ + 1} of {questions.length}</span>
        <span>Score: {score}/{currentQ + (answered ? 1 : 0)}</span>
      </div>

      {/* Question */}
      <Card>
        <CardContent className="p-6">
          <h3 className="mb-4 text-lg font-medium text-white">{q.question}</h3>

          <div className="flex flex-col gap-2">
            {q.options.map((option, idx) => {
              let style = 'border-border bg-navy hover:border-green/50';
              if (answered) {
                if (idx === q.correct) {
                  style = 'border-emerald-500 bg-emerald-500/10';
                } else if (idx === selected) {
                  style = 'border-red-500 bg-red-500/10';
                } else {
                  style = 'border-border bg-navy opacity-50';
                }
              } else if (idx === selected) {
                style = 'border-green bg-green/10';
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAnswer(idx)}
                  disabled={answered}
                  className={`flex items-center gap-3 rounded-lg border p-3 text-left text-sm transition-colors ${style}`}
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border text-xs font-medium">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-white">{option}</span>
                  {answered && idx === q.correct && (
                    <CheckCircle2 className="ml-auto h-4 w-4 text-emerald-400" />
                  )}
                  {answered && idx === selected && idx !== q.correct && (
                    <XCircle className="ml-auto h-4 w-4 text-red-400" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {answered && (
            <div className="mt-4 rounded-lg bg-navy p-3">
              <p className="text-xs text-muted">{q.explanation}</p>
            </div>
          )}

          {/* Next button */}
          {answered && (
            <Button onClick={handleNext} className="mt-4 w-full">
              {currentQ + 1 >= questions.length ? 'See Results' : 'Next Question'}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
