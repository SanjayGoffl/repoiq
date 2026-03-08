/**
 * OpenRouter client for fast, free model inference.
 * Used for lighter tasks: fix suggestions, diagrams, quizzes, translations, line chat.
 * Falls back to Bedrock if OpenRouter fails.
 */

const OPENROUTER_API_KEY = process.env.openrouter_api_key ?? '';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Free models ordered by quality — tries best first, falls back
const FREE_MODELS = [
  'google/gemma-3-12b-it:free',
  'google/gemma-3-4b-it:free',
  'google/gemma-3n-e4b-it:free',
];

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterOptions {
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

/**
 * Call OpenRouter with automatic model fallback.
 * Returns the text response or throws if all models fail.
 */
export async function callOpenRouter(
  userMessage: string,
  options: OpenRouterOptions = {},
): Promise<string> {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key not configured');
  }

  const messages: OpenRouterMessage[] = [];

  if (options.systemPrompt) {
    messages.push({ role: 'system', content: options.systemPrompt });
  }
  messages.push({ role: 'user', content: userMessage });

  let lastError: unknown;

  for (const model of FREE_MODELS) {
    try {
      const response = await fetch(OPENROUTER_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://repoiq-puce.vercel.app',
          'X-Title': 'RepoIQ',
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: options.maxTokens ?? 4096,
          temperature: options.temperature ?? 0.3,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`[OpenRouter] ${model} HTTP ${response.status}: ${errText}`);
        lastError = new Error(`HTTP ${response.status}`);
        continue;
      }

      const data = (await response.json()) as {
        choices?: { message?: { content?: string } }[];
        error?: { message?: string };
      };

      if (data.error) {
        console.warn(`[OpenRouter] ${model} error: ${data.error.message}`);
        lastError = new Error(data.error.message);
        continue;
      }

      const text = data.choices?.[0]?.message?.content?.trim();
      if (!text) {
        lastError = new Error('Empty response');
        continue;
      }

      console.log(`[OpenRouter] Success with ${model}`);
      return text;
    } catch (err) {
      lastError = err;
      console.warn(`[OpenRouter] ${model} failed:`, err);
    }
  }

  throw lastError ?? new Error('All OpenRouter models failed');
}

/**
 * Parse JSON from a model response, handling markdown code blocks.
 */
export function parseJsonResponse<T>(text: string): T {
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```json?\n?/, '').replace(/\n?```$/, '');
  }
  return JSON.parse(cleaned) as T;
}

/**
 * Race AWS Bedrock and OpenRouter — returns whichever responds first.
 * AWS is the primary; OpenRouter is the speed boost.
 * If one fails, the other's result is still used.
 */
export async function raceBedrockAndOpenRouter(
  prompt: string,
  options: OpenRouterOptions & { bedrockModelIds?: string[] } = {},
): Promise<string> {
  const bedrockModels = options.bedrockModelIds ?? [
    process.env.BEDROCK_MODEL_ID || 'us.amazon.nova-pro-v1:0',
    process.env.BEDROCK_FALLBACK_MODEL_ID || 'amazon.nova-lite-v1:0',
  ];

  // Create Bedrock promise
  const bedrockPromise = (async () => {
    const { BedrockRuntimeClient, InvokeModelCommand } = await import('@aws-sdk/client-bedrock-runtime');
    const client = new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'us-east-1' });

    for (const modelId of bedrockModels) {
      try {
        const command = new InvokeModelCommand({
          modelId,
          contentType: 'application/json',
          accept: 'application/json',
          body: new TextEncoder().encode(JSON.stringify({
            messages: [{ role: 'user', content: [{ text: prompt }] }],
            ...(options.systemPrompt ? { system: [{ text: options.systemPrompt }] } : {}),
            inferenceConfig: {
              maxTokens: options.maxTokens ?? 4096,
              temperature: options.temperature ?? 0.3,
            },
          })),
        });
        const response = await client.send(command);
        const responseBody = JSON.parse(new TextDecoder().decode(response.body as Uint8Array)) as {
          output?: { message?: { content?: { text: string }[] } };
        };
        const text = responseBody?.output?.message?.content?.[0]?.text?.trim();
        if (text) {
          console.log(`[Race] Bedrock ${modelId} won`);
          return text;
        }
      } catch (err) {
        console.warn(`[Race] Bedrock ${modelId} failed:`, err);
      }
    }
    throw new Error('All Bedrock models failed');
  })();

  // Create OpenRouter promise
  const openRouterPromise = callOpenRouter(prompt, options).then((text) => {
    console.log('[Race] OpenRouter won');
    return text;
  });

  // Race them — first successful response wins
  try {
    return await Promise.any([bedrockPromise, openRouterPromise]);
  } catch {
    // Both failed — try to get at least one error
    throw new Error('Both Bedrock and OpenRouter failed');
  }
}
