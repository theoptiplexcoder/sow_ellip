'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Badge, Button, Card, CardContent, Textarea } from '@sow-platform/ui';
import { addAuditLog } from '@/lib/data/audit-logs';
import { addSowComment, getCommentsForSow } from '@/lib/data/sow-comments';

export function SowCommentsPanel({
  sowId,
  currentAuthor,
  canComment,
}: {
  sowId: string;
  currentAuthor: { id: string; name: string; type: 'participant' | 'client' };
  canComment: boolean;
}) {
  const router = useRouter();
  const [body, setBody] = useState('');
  const comments = getCommentsForSow(sowId);

  function submit() {
    const text = body.trim();
    if (!text) return;
    addSowComment(sowId, {
      authorId: currentAuthor.id,
      authorName: currentAuthor.name,
      authorType: currentAuthor.type,
      body: text,
    });
    addAuditLog({
      actor: currentAuthor.name,
      entityType: 'SOW',
      entityName: sowId,
      action:
        currentAuthor.type === 'client'
          ? 'Client comment added'
          : 'comment added',
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
    });
    setBody('');
    toast.success('Comment added');
    router.refresh();
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 pt-6">
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No comments yet.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {comments.map((c) => (
              <li key={c.id} className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{c.authorName}</span>
                  <Badge
                    variant={c.authorType === 'client' ? 'default' : 'outline'}
                  >
                    {c.authorType === 'client' ? 'Client' : 'Internal'}
                  </Badge>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {c.createdAt}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{c.body}</p>
              </li>
            ))}
          </ul>
        )}

        {canComment && (
          <div className="flex flex-col gap-2 border-t pt-4">
            <Textarea
              placeholder="Add a comment…"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="min-h-20"
            />
            <Button
              size="sm"
              className="self-end"
              onClick={submit}
              disabled={!body.trim()}
            >
              Add comment
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
