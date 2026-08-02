'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Bot, Sparkles } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ScrollArea,
  Textarea,
} from '@sow-platform/ui';
import { currentUsers } from '@/lib/data/current-user';
import { getActiveProviderSettings } from '@/lib/data/ai-settings';
import { getSow, updateSow, type Sow } from '@/lib/data/sows';
import { addAuditLog } from '@/lib/data/audit-logs';
import {
  type ActiveAiSettings,
  type ChatMessage,
  runAgentTurn,
} from '@/lib/ai/agent';

const MAX_TURNS = 5;

function coerceListValue(field: string, items: unknown): unknown {
  if (field === 'deliverables') {
    return Array.isArray(items) ? items.map((i) => String(i)) : [];
  }
  return Array.isArray(items) ? items : [];
}

function executeToolCall(
  sow: Sow,
  settings: ActiveAiSettings,
  name: string,
  args: Record<string, unknown>,
) {
  const current = getSow(sow.id) ?? sow;
  if (name === 'update_text_field') {
    const field = String(args.field);
    const value = String(args.value ?? '');
    updateSow(sow.id, { sections: { ...current.sections, [field]: value } });
    addAuditLog({
      actor: currentUsers.participant.name,
      entityType: 'SOW',
      entityName: sow.number,
      action: 'agent-initiated field edit',
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
      metadata: { field, provider: settings.provider, model: settings.model },
    });
    return { ok: true, field };
  }
  if (name === 'set_list_field') {
    const field = String(args.field);
    const items = coerceListValue(field, args.items);
    updateSow(sow.id, { sections: { ...current.sections, [field]: items } });
    addAuditLog({
      actor: currentUsers.participant.name,
      entityType: 'SOW',
      entityName: sow.number,
      action: 'agent-initiated field edit',
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
      metadata: { field, provider: settings.provider, model: settings.model },
    });
    return { ok: true, field };
  }
  return { ok: false, error: `Unknown tool: ${name}` };
}

const SYSTEM_PROMPT: ChatMessage = {
  role: 'system',
  content:
    'You are an editing assistant for a Statement of Work (SOW) draft. ' +
    'Use the provided tools to make the edits the user asks for — do not just describe them. ' +
    'Only edit fields the user actually asked about. Keep field values concise and professional.',
};

export function SowAiAgentPanel({ sow }: { sow: Sow }) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);

  const settings = getActiveProviderSettings();
  const hasKey = settings.apiKey.trim() !== '';

  async function send() {
    const text = input.trim();
    if (!text || pending) return;
    setInput('');
    setPending(true);

    let convo: ChatMessage[] = [
      SYSTEM_PROMPT,
      ...messages,
      { role: 'user', content: text },
    ];
    setMessages((prev) => [...prev, { role: 'user', content: text }]);

    try {
      let editedAnyField = false;
      for (let turn = 0; turn < MAX_TURNS; turn++) {
        const reply = await runAgentTurn({
          settings,
          messages: convo,
        });
        convo = [...convo, reply];

        if (reply.tool_calls?.length) {
          for (const call of reply.tool_calls) {
            let args: Record<string, unknown> = {};
            try {
              args = JSON.parse(call.function.arguments || '{}');
            } catch {
              // malformed args — surface the failure to the model, don't crash the panel
            }
            const result = executeToolCall(
              sow,
              settings,
              call.function.name,
              args,
            );
            if (result.ok) editedAnyField = true;
            convo = [
              ...convo,
              {
                role: 'tool',
                tool_call_id: call.id,
                content: JSON.stringify(result),
              },
            ];
          }
          continue;
        }

        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: reply.content ?? '' },
        ]);
        break;
      }

      if (editedAnyField) {
        toast.success('SOW fields updated by agent');
        router.refresh();
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'AI agent request failed',
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Bot className="size-4" /> AI Agent
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Describe an edit and the agent will update this draft's fields.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {!hasKey ? (
          <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
            No AI provider is configured for this tenant yet. Ask a Tenant Admin
            to add a provider &amp; API key under Settings.
          </p>
        ) : (
          <>
            <Badge variant="outline" className="w-fit gap-1">
              <Sparkles className="size-3" />
              {settings.provider} · {settings.model}
            </Badge>
            <ScrollArea className="h-64 rounded-md border p-3">
              {messages.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Try: &quot;Tighten the Objectives section&quot; or &quot;Add a
                  deliverable for QA sign-off&quot;.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {messages.map((m, i) => (
                    <div key={i} className="text-sm">
                      <span className="font-medium">
                        {m.role === 'user' ? 'You' : 'Agent'}:{' '}
                      </span>
                      <span className="whitespace-pre-wrap">{m.content}</span>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            <Textarea
              placeholder="Tell the agent what to change…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              className="min-h-20"
            />
            <Button onClick={send} disabled={pending || !input.trim()}>
              {pending ? 'Thinking…' : 'Send'}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
