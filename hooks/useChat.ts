'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Message, ChatResponse, CodeReference } from '@/lib/types';
import { create } from 'zustand';

// ---- Zustand store for chat messages (keyed by conceptId) ----
interface ChatStore {
  messagesByConceptId: Record<string, Message[]>;
  addMessage: (conceptId: string, message: Message) => void;
  clearMessages: (conceptId: string) => void;
  getMessages: (conceptId: string) => Message[];
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messagesByConceptId: {},
  addMessage: (conceptId, message) =>
    set((state) => ({
      messagesByConceptId: {
        ...state.messagesByConceptId,
        [conceptId]: [
          ...(state.messagesByConceptId[conceptId] ?? []),
          message,
        ],
      },
    })),
  clearMessages: (conceptId) =>
    set((state) => ({
      messagesByConceptId: {
        ...state.messagesByConceptId,
        [conceptId]: [],
      },
    })),
  getMessages: (conceptId) => get().messagesByConceptId[conceptId] ?? [],
}));

// ---- Hook ----
interface UseChatReturn {
  messages: Message[];
  sendMessage: (content: string) => void;
  sendHint: () => void;
  isLoading: boolean;
  conceptUnderstood: boolean;
  codeReference: CodeReference | null;
}

export function useChat(
  sessionId: string,
  conceptId: string,
  userId: string,
  initialQuestion?: string,
): UseChatReturn {
  const { messagesByConceptId, addMessage, getMessages } = useChatStore();
  const messages = messagesByConceptId[conceptId] ?? [];
  const [conceptUnderstood, setConceptUnderstood] = useState(false);
  const [codeReference, setCodeReference] = useState<CodeReference | null>(null);
  const seededRef = useRef<Set<string>>(new Set());

  // Seed the initial Socratic question when concept changes
  useEffect(() => {
    if (!conceptId || !initialQuestion) return;
    if (seededRef.current.has(conceptId)) return;

    const existing = getMessages(conceptId);
    if (existing.length > 0) return; // Already has messages

    seededRef.current.add(conceptId);
    const seedMessage: Message = {
      message_id: `seed-${conceptId}`,
      session_id: sessionId,
      created_at: new Date().toISOString(),
      user_id: 'system',
      concept_id: conceptId,
      role: 'assistant',
      content: initialQuestion,
      code_reference: null,
      is_hint: false,
    };
    addMessage(conceptId, seedMessage);
  }, [conceptId, initialQuestion, sessionId, addMessage, getMessages]);

  // Reset understood state when concept changes
  useEffect(() => {
    setConceptUnderstood(false);
    setCodeReference(null);
  }, [conceptId]);

  const chatMutation = useMutation<
    ChatResponse,
    Error,
    { message: string; is_hint?: boolean }
  >({
    mutationFn: (data) =>
      api.sendMessage({
        session_id: sessionId,
        concept_id: conceptId,
        message: data.message,
        is_hint: data.is_hint,
      }),
    onMutate: (variables) => {
      // Optimistic: add user message immediately
      const userMessage: Message = {
        message_id: crypto.randomUUID(),
        session_id: sessionId,
        created_at: new Date().toISOString(),
        user_id: userId,
        concept_id: conceptId,
        role: 'user',
        content: variables.message,
        code_reference: null,
        is_hint: variables.is_hint ?? false,
      };
      addMessage(conceptId, userMessage);
    },
    onSuccess: (data) => {
      // Add AI response
      const aiMessage: Message = {
        message_id: crypto.randomUUID(),
        session_id: sessionId,
        created_at: new Date().toISOString(),
        user_id: 'system',
        concept_id: conceptId,
        role: 'assistant',
        content: data.response,
        code_reference: data.code_reference ?? null,
        is_hint: false,
      };
      addMessage(conceptId, aiMessage);

      if (data.code_reference) {
        setCodeReference(data.code_reference);
      }
      if (data.concept_understood) {
        setConceptUnderstood(true);
      }
    },
  });

  const sendMessage = useCallback(
    (content: string) => {
      chatMutation.mutate({ message: content });
    },
    [chatMutation],
  );

  const sendHint = useCallback(() => {
    chatMutation.mutate({
      message: 'I need a hint.',
      is_hint: true,
    });
  }, [chatMutation]);

  return {
    messages,
    sendMessage,
    sendHint,
    isLoading: chatMutation.isPending,
    conceptUnderstood,
    codeReference,
  };
}
