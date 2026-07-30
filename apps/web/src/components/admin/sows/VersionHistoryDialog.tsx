import { Dialog, DialogContent } from '../../ui/dialog';
import type { SowVersionEntry } from './sowVersionHistory';

function FieldDiff({ change }: { change: SowVersionEntry['changes'][number] }) {
  return (
    <div className="mb-3 overflow-hidden rounded-md border border-border font-mono text-xs">
      <div className="border-b border-border bg-muted/40 px-2 py-1 font-sans text-xs font-medium text-foreground">
        {change.fieldLabel}
      </div>
      <div className="bg-red-50 px-2 py-1 text-red-700">
        --- {change.oldValue ?? '(empty)'}
      </div>
      <div className="bg-green-50 px-2 py-1 text-green-700">
        +++ {change.newValue ?? '(empty)'}
      </div>
    </div>
  );
}

function VersionEntry({ entry }: { entry: SowVersionEntry }) {
  return (
    <div className="border-b border-border pb-4 last:border-0 last:pb-0">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">Version {entry.version}</span>
        <span className="text-xs text-muted-foreground">
          {entry.updatedBy} &middot; {entry.updatedAt}
        </span>
      </div>
      {entry.changes.length === 0 ? (
        <p className="text-sm text-muted-foreground">Initial version created.</p>
      ) : (
        entry.changes.map((change, i) => <FieldDiff key={i} change={change} />)
      )}
    </div>
  );
}

export function VersionHistoryDialog({
  open,
  onOpenChange,
  sowNumber,
  entries,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sowNumber: string;
  entries: SowVersionEntry[];
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title="Version history"
        description={sowNumber}
        className="max-w-xl"
      >
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No version history for this SOW.</p>
        ) : (
          <div className="max-h-[60vh] space-y-4 overflow-y-auto">
            {entries.map((entry) => (
              <VersionEntry key={entry.version} entry={entry} />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
