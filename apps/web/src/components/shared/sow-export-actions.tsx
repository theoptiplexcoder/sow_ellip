'use client';

import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  CheckCircle2,
  CircleDashed,
  FileDown,
  Loader2,
  Printer,
} from 'lucide-react';
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Progress,
} from '@sow-platform/ui';

const pipelineSteps = [
  'Extract',
  'Populate',
  'Generate DOCX',
  'Convert to PDF',
  'Audit log',
] as const;

export function SowExportActions({ sowId }: { sowId: string }) {
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(-1);

  function runPipeline() {
    setStepIndex(0);
    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      setStepIndex(i);
      if (i >= pipelineSteps.length) {
        clearInterval(interval);
        toast.success('DOCX/PDF generated (prototype only)');
      }
    }, 700);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="outline"
        nativeButton={false}
        render={<Link href={`/sows/${sowId}/print`} target="_blank" />}
      >
        <Printer className="size-4" />
        Export via Print View
      </Button>

      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (v) runPipeline();
          else setStepIndex(-1);
        }}
      >
        <DialogTrigger render={<Button />}>
          <FileDown className="size-4" />
          Generate DOCX/PDF
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Document Generation Pipeline</DialogTitle>
            <DialogDescription>
              Inngest-orchestrated: each step is independently retryable. A
              failure at Convert to PDF does not require re-running
              Extract/Populate/Generate DOCX.
            </DialogDescription>
          </DialogHeader>

          <Progress
            value={Math.max(0, (stepIndex / pipelineSteps.length) * 100)}
          />

          <ul className="mt-2 flex flex-col gap-2">
            {pipelineSteps.map((step, i) => {
              const done = i < stepIndex;
              const running = i === stepIndex;
              return (
                <li key={step} className="flex items-center gap-2 text-sm">
                  {done ? (
                    <CheckCircle2 className="size-4 text-emerald-600" />
                  ) : running ? (
                    <Loader2 className="size-4 animate-spin text-amber-600" />
                  ) : (
                    <CircleDashed className="size-4 text-muted-foreground/50" />
                  )}
                  <span
                    className={
                      done || running ? 'font-medium' : 'text-muted-foreground'
                    }
                  >
                    {step}
                  </span>
                  {done && (
                    <Badge
                      variant="outline"
                      className="ml-auto text-emerald-700"
                    >
                      Succeeded
                    </Badge>
                  )}
                  {running && (
                    <Badge variant="outline" className="ml-auto text-amber-700">
                      Running
                    </Badge>
                  )}
                </li>
              );
            })}
          </ul>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
            <Button
              disabled={stepIndex < pipelineSteps.length}
              onClick={() => toast.success('Downloaded (prototype)')}
            >
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
