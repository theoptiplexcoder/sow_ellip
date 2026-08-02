import type { AiProvider } from '@/lib/data/ai-settings';

export interface ActiveAiSettings {
  provider: AiProvider;
  model: string;
  apiKey: string;
  temperature: number;
  maxTokens: number;
  toolCallingEnabled: boolean;
  streamingEnabled: boolean;
}

export interface ChatToolCall {
  id: string;
  type: 'function';
  function: { name: string; arguments: string };
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  tool_calls?: ChatToolCall[];
  tool_call_id?: string;
  name?: string;
}

export const TEXT_FIELDS = [
  'objectives',
  'scope',
  'periodStart',
  'periodEnd',
  'acceptanceCriteria',
  'dependencies',
  'risks',
  'assumptions',
  'notes',
] as const;

export const LIST_FIELDS = ['deliverables', 'milestones', 'pricing'] as const;

export const SOW_EDIT_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'update_text_field',
      description:
        'Replace the full text value of a single free-text SOW field.',
      parameters: {
        type: 'object',
        properties: {
          field: { type: 'string', enum: TEXT_FIELDS as unknown as string[] },
          value: { type: 'string' },
        },
        required: ['field', 'value'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'set_list_field',
      description:
        'Replace a list-shaped SOW field. "deliverables" takes an array of plain strings. ' +
        '"milestones" takes an array of {name, dueDate} objects. "pricing" takes an array of {item, amount} objects.',
      parameters: {
        type: 'object',
        properties: {
          field: { type: 'string', enum: LIST_FIELDS as unknown as string[] },
          items: { type: 'array', items: { type: 'object' } },
        },
        required: ['field', 'items'],
      },
    },
  },
];

function endpointFor(provider: AiProvider) {
  return provider === 'openrouter'
    ? 'https://openrouter.ai/api/v1/chat/completions'
    : 'https://router.huggingface.co/v1/chat/completions';
}

export async function runAgentTurn({
  settings,
  messages,
}: {
  settings: ActiveAiSettings;
  messages: ChatMessage[];
}): Promise<ChatMessage> {
  const res = await fetch(endpointFor(settings.provider), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${settings.apiKey}`,
      ...(settings.provider === 'openrouter'
        ? {
            'HTTP-Referer':
              typeof window !== 'undefined' ? window.location.origin : '',
            'X-Title': 'SOW Platform',
          }
        : {}),
    },
    body: JSON.stringify({
      model: settings.model,
      messages,
      tools: settings.toolCallingEnabled ? SOW_EDIT_TOOLS : undefined,
      tool_choice: settings.toolCallingEnabled ? 'auto' : undefined,
      temperature: settings.temperature,
      max_tokens: settings.maxTokens,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`AI provider request failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  const message = data.choices?.[0]?.message;
  if (!message) throw new Error('AI provider returned no message');
  return message as ChatMessage;
}
