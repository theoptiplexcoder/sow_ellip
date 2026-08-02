import { Card, CardContent } from '@sow-platform/ui';

/** Inline metric row — replaces a grid of stat cards with a single scannable strip. */
export function StatStrip({
  items,
}: {
  items: { label: string; value: string | number; icon: React.ElementType }[];
}) {
  return (
    <Card className="mb-5 border-border/80 bg-card shadow-[0_1px_2px_rgb(15_23_42/0.04)]">
      <CardContent className="grid grid-cols-2 divide-x-0 divide-border sm:grid-cols-4 sm:divide-x">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 px-4 py-3 first:pl-0 sm:first:pl-4"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
              <item.icon className="size-4" />
            </span>
            <div className="leading-tight">
              <div className="font-display text-xl font-semibold tabular-nums">
                {item.value}
              </div>
              <div className="text-[11px] text-muted-foreground">
                {item.label}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
