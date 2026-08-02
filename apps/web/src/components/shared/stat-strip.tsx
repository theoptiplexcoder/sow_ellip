/** Inline metric row — replaces a grid of stat cards with a single scannable strip. */
export function StatStrip({
  items,
}: {
  items: { label: string; value: string | number; icon: React.ElementType }[];
}) {
  return (
    <div className="mb-5 flex flex-wrap gap-x-8 gap-y-3 rounded-lg border border-border bg-muted/30 px-4 py-3">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2.5">
          <item.icon className="size-4 text-muted-foreground" />
          <div className="leading-tight">
            <div className="font-display text-lg font-semibold tabular-nums">
              {item.value}
            </div>
            <div className="text-[11px] text-muted-foreground">
              {item.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
