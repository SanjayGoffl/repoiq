'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, X } from 'lucide-react';
import type { LineChatResponse } from '@/lib/types';

interface LineChatProps {
  sessionId: string;
  filePath: string;
  lineNumber: number;
  codeLine: string;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  references?: LineChatResponse['references'];
}

export function LineChat({
  sessionId,
  filePath,
  lineNumber,
  codeLine,
  onClose,
}: LineChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch initial explanation
  useEffect(() => {
    if (initialLoaded) return;
    setInitialLoaded(true);

    async function fetchExplanation() {
      setIsLoading(true);
      try {
        const guestId = localStorage.getItem('repoiq_guest_id') ?? 'guest';
        const res = await fetch('/api/chat/line', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-guest-id': guestId,
          },
          body: JSON.stringify({
            session_id: sessionId,
            file_path: filePath,
            line_number: lineNumber,
            code_line: codeLine,
          }),
        });

        if (res.ok) {
          const data = (await res.json()) as LineChatResponse;
          setMessages([
            {
              id: crypto.randomUUID(),
              role: 'assistant',
              content: data.explanation,
              references: data.references,
            },
          ]);
        }
      } catch (err) {
        console.error('[LineChat] Failed:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchExplanation();
  }, [sessionId, filePath, lineNumber, codeLine, initialLoaded]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const guestId = localStorage.getItem('repoiq_guest_id') ?? 'guest';
      const res = await fetch('/api/chat/line', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-guest-id': guestId,
        },
        body: JSON.stringify({
          session_id: sessionId,
          file_path: filePath,
          line_number: lineNumber,
          code_line: codeLine,
          question: input.trim(),
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as LineChatResponse;
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: data.explanation,
            references: data.references,
          },
        ]);
      }
    } catch (err) {
      console.error('[LineChat] Follow-up failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col rounded-lg border border-border bg-navy-light">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <Sparkles className="h-4 w-4 text-green" />
        <span className="text-xs font-medium text-white">
          Line {lineNumber}
        </span>
        <code className="ml-1 max-w-[200px] truncate text-[10px] text-muted">
          {codeLine.trim()}
        </code>
        <button
          type="button"
          onClick={onClose}
          className="ml-auto rounded p-1 text-muted hover:bg-navy hover:text-white"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-auto p-3" style={{ maxHeight: '300px' }}>
        {isLoading && messages.length === 0 && (
          <div className="flex items-center gap-2 text-xs text-muted">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green" />
            Analyzing...
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className="space-y-1">
            <div
              className={`rounded-lg px-3 py-2 text-xs ${
                msg.role === 'user'
                  ? 'ml-8 bg-green/10 text-white'
                  : 'mr-4 bg-navy text-muted'
              }`}
            >
              {msg.content}
            </div>

            {msg.references && msg.references.length > 0 && (
              <div className="flex flex-wrap gap-1 pl-1">
                {msg.references.map((ref) => (
                  <span
                    key={ref.name}
                    className="rounded bg-navy px-1.5 py-0.5 text-[10px] text-muted"
                    title={ref.doc_url}
                  >
                    {ref.type === 'library' ? '📦' : ref.type === 'function' ? 'fn' : '📌'}{' '}
                    {ref.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}

        {isLoading && messages.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-muted">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green" />
            Thinking...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-2">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask a follow-up question..."
            className="flex-1 rounded bg-navy px-3 py-1.5 text-xs text-white placeholder:text-muted/50 outline-none"
          />
          <button
            type="button"
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="rounded bg-green p-1.5 text-black disabled:opacity-50"
          >
            <Send className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
