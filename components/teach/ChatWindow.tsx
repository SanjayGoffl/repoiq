'use client';

import * as React from 'react';
import type { Message } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
}

export function ChatWindow({ messages, isLoading }: ChatWindowProps) {
  const bottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-center text-sm text-muted">
          Your AI teacher will ask you questions about your code
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto p-4">
      <div className="flex flex-1 flex-col gap-3">
        {messages.map((message) => {
          const isUser = message.role === 'user';

          return (
            <div
              key={message.message_id}
              className={cn(
                'flex',
                isUser ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'max-w-[80%] rounded-lg px-4 py-2.5 text-sm',
                  isUser
                    ? 'bg-navy-light text-white'
                    : 'bg-green/15 text-white'
                )}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>

                {message.code_reference && (
                  <p className="mt-1.5 text-xs text-muted">
                    {message.code_reference.file}
                    {message.code_reference.lines.length > 0 && (
                      <>
                        :L{message.code_reference.lines[0]}
                        {message.code_reference.lines.length > 1 && (
                          <>
                            -
                            {
                              message.code_reference.lines[
                                message.code_reference.lines.length - 1
                              ]
                            }
                          </>
                        )}
                      </>
                    )}
                  </p>
                )}

                {message.is_hint && (
                  <span className="mt-1 inline-block text-xs text-muted">
                    Hint
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1.5 rounded-lg bg-green/15 px-4 py-3">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
