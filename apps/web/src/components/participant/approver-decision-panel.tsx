'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Textarea,
} from '@sow-platform/ui';
import { CheckCircle2, XCircle } from 'lucide-react';
import { currentUsers } from '@/lib/data/current-user';
import type { Sow } from '@/lib/data/sows';
import { decideSow } from '@/lib/actions/sows';

export function ApproverDecisionPanel({ sow }: { sow: Sow }) {
  const router = useRouter();
  const [comment, setComment] = useState('');
  const [pendingAction, setPendingAction] = useState<'reject' | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submitDecision(kind: 'approve' | 'reject') {
    if (kind === 'reject' && comment.trim() === '') return;
    setSubmitting(true);
    try {
      await decideSow(sow.id, kind === 'approve' ? 'approved' : 'rejected', {
        actor: currentUsers.participant.name,
        comment: comment.trim() || undefined,
      });
      toast.success(kind === 'approve' ? 'SOW approved' : 'SOW rejected');
      setPendingAction(null);
      setComment('');
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="ring-1 ring-primary/20">
      <CardHeader>
        <CardTitle className="text-base">Your decision</CardTitle>
        <p className="text-sm text-muted-foreground">
          Review the document, then approve or reject this SOW.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Textarea
          placeholder="Add a comment (required for Reject)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="min-h-24"
        />
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            size="lg"
            onClick={() => submitDecision('approve')}
            disabled={submitting}
            className="flex-1"
          >
            <CheckCircle2 className="size-4" />
            Approve
          </Button>

          <AlertDialog
            open={pendingAction === 'reject'}
            onOpenChange={(v) => setPendingAction(v ? 'reject' : null)}
          >
            <Button
              size="lg"
              variant="destructive"
              className="flex-1"
              disabled={comment.trim() === '' || submitting}
              onClick={() => setPendingAction('reject')}
            >
              <XCircle className="size-4" />
              Reject
            </Button>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reject this SOW?</AlertDialogTitle>
                <AlertDialogDescription>
                  This is a destructive, workflow-altering action. The Creator
                  will be notified with your comment.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  disabled={submitting}
                  onClick={() => submitDecision('reject')}
                >
                  Confirm Reject
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <p className="text-xs text-muted-foreground">
          A comment is required before Reject.
        </p>
      </CardContent>
    </Card>
  );
}
