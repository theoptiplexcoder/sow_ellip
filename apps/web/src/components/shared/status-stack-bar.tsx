import type { SowStatus } from '@/lib/data/sows';
import { sowStatusTint } from '@/components/shared/status-badge';

/** Single stacked bar summarizing a status breakdown — denser and more distinctive than a bar chart. */
export function StatusStackBar({
  data,
  total,
}: {
  data: { key: SowStatus; status: string; count: number }[];
  total: number;
}) {
  const nonZero = data.filter((d) => d.count > 0);
  return (
    <div>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
        {nonZero.map((d) => (
          <div
            key={d.key}
            style={{
              width: `${(d.count / total) * 100}%`,
              backgroundColor: sowStatusTint[d.key],
            }}
            className="h-full first:rounded-l-full last:rounded-r-full"
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
        {data.map((d) => (
          <div key={d.key} className="flex items-center gap-1.5 text-xs">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: sowStatusTint[d.key] }}
            />
            <span className="text-muted-foreground">{d.status}</span>
            <span className="font-medium tabular-nums">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
