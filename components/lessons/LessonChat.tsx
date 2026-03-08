'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, GraduationCap } from 'lucide-react';
import type { ChatResponse } from '@/lib/types';

interface LessonChatProps {
  sessionId: string;
  lessonTitle: string;
  lessonDescription: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function LessonChat({
  sessionId,
  lessonTitle,
  lessonDescription,
}: LessonChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'initial',
      role: 'assistant',
      content: `Welcome to the lesson: **${lessonTitle}**!\n\n${lessonDescription}\n\nAsk me anything about this topic, or say "teach me" to start learning!`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Reset messages when lesson changes
  useEffect(() => {
    setMessages([
      {
        id: 'initial',
        role: 'assistant',
        content: `Welcome to the lesson: **${lessonTitle}**!\n\n${lessonDescription}\n\nAsk me anything about this topic, or say "teach me" to start learning!`,
      },
    ]);
  }, [lessonTitle, lessonDescription]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
    const messageText = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      const guestId = localStorage.getItem('repoiq_guest_id') ?? 'guest';
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-guest-id': guestId,
        },
        body: JSON.stringify({
          session_id: sessionId,
          concept_id: `lesson:${lessonTitle}`,
          message: messageText,
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as ChatResponse;
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: data.response,
          },
        ]);
      }
    } catch (err) {
      console.error('[LessonChat] Failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col rounded-lg border border-border bg-navy-light">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
        <GraduationCap className="h-4 w-4 text-green" />
        <span className="text-sm font-medium text-white">Lesson Chat</span>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-auto p-4" style={{ maxHeight: '400px' }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`rounded-lg px-3 py-2 text-sm ${
              msg.role === 'user'
                ? 'ml-12 bg-green/10 text-white'
                : 'mr-8 bg-navy text-muted'
            }`}
          >
            {msg.content}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-muted">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green" />
            Thinking...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask about this lesson..."
            className="flex-1 rounded-lg bg-navy px-4 py-2 text-sm text-white placeholder:text-muted/50 outline-none"
          />
          <button
            type="button"
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="rounded-lg bg-green p-2 text-black disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
