/** Small-caps section label with a trailing rule — replaces boxed card headers. */
export function SectionEyebrow({
  icon: Icon,
  tint,
  label,
  description,
}: {
  icon: React.ElementType;
  tint: string;
  label: string;
  description: string;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div className="flex items-center gap-3">
        <span
          className="flex size-8 items-center justify-center rounded-md"
          style={{
            backgroundColor: `color-mix(in oklab, ${tint} 14%, transparent)`,
            color: tint,
          }}
        >
          <Icon className="size-4" />
        </span>
        <div>
          <h2 className="font-display text-base font-semibold tracking-tight">
            {label}
          </h2>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div
        className="hidden h-px flex-1 sm:block"
        style={{ backgroundColor: 'var(--border)' }}
      />
    </div>
  );
}
