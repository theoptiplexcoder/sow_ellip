'use client';

import { useState } from 'react';
import { ChevronRight, Workflow } from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  Badge,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@sow-platform/ui';
import { StatusPill } from '@/components/shared/status-badge';
import { getUser } from '@/lib/data/users';
import {
  workflowTemplates,
  type WorkflowTemplate,
} from '@/lib/data/workflow-templates';

export function WorkflowsSidebarSection() {
  const [selected, setSelected] = useState<WorkflowTemplate | null>(null);
  const activeTemplates = workflowTemplates.filter(
    (wf) => wf.status === 'active',
  );

  if (activeTemplates.length === 0) return null;

  return (
    <div className="mt-4 border-t border-sidebar-border pt-3">
      <div className="px-3 pb-1.5 text-[11px] font-semibold tracking-wide text-sidebar-foreground/45 uppercase">
        Workflows
      </div>
      <ul className="flex flex-col gap-0.5">
        {activeTemplates.map((wf) => (
          <li key={wf.id}>
            <button
              type="button"
              onClick={() => setSelected(wf)}
              className="group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-sidebar-foreground/65 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-transparent transition-colors group-hover:bg-sidebar-foreground/5">
                <Workflow className="size-4 text-sidebar-foreground/50 group-hover:text-sidebar-accent-foreground" />
              </span>
              <span className="min-w-0 flex-1 truncate">{wf.name}</span>
              <ChevronRight className="size-4 shrink-0 text-sidebar-foreground/40" />
            </button>
          </li>
        ))}
      </ul>

      <Sheet
        open={selected !== null}
        onOpenChange={(open: boolean) => {
          if (!open) setSelected(null);
        }}
      >
        <SheetContent side="right">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle>{selected.name}</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 p-4 text-sm">
                <div className="flex items-center gap-2">
                  <StatusPill active={selected.status === 'active'} />
                  <span className="text-xs text-muted-foreground">
                    Updated {selected.updatedAt}
                  </span>
                </div>

                <div>
                  <div className="mb-2 font-medium text-muted-foreground">
                    Approval steps
                  </div>
                  {selected.steps.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No steps configured.
                    </p>
                  ) : (
                    <ol className="flex flex-col gap-3">
                      {selected.steps
                        .slice()
                        .sort((a, b) => a.order - b.order)
                        .map((step) => (
                          <li
                            key={step.id}
                            className="rounded-md border bg-muted/40 p-3"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-medium">
                                {step.order}. {step.name}
                              </span>
                              <Badge variant="outline">
                                {step.approvalLogic === 'ALL'
                                  ? 'All must approve'
                                  : 'Any can approve'}
                              </Badge>
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              {step.approverUserIds.map((userId) => {
                                const approver = getUser(userId);
                                return (
                                  <div
                                    key={userId}
                                    className="flex items-center gap-1.5 text-xs text-muted-foreground"
                                  >
                                    <Avatar className="size-5">
                                      <AvatarFallback className="text-[10px]">
                                        {approver?.avatarInitials ?? '?'}
                                      </AvatarFallback>
                                    </Avatar>
                                    {approver?.name ?? userId}
                                  </div>
                                );
                              })}
                            </div>
                          </li>
                        ))}
                    </ol>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
