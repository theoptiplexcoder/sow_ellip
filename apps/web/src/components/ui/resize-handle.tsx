export function ResizeHandle({
  onPointerDown,
  className = '',
}: {
  onPointerDown: (e: React.PointerEvent) => void;
  className?: string;
}) {
  return (
    <div
      onPointerDown={onPointerDown}
      role="separator"
      aria-orientation="vertical"
      className={`group absolute inset-y-0 left-0 z-10 w-1.5 -translate-x-1/2 cursor-col-resize touch-none ${className}`}
    >
      <div className="h-full w-px bg-transparent transition-colors group-hover:bg-primary/50 group-active:bg-primary" />
    </div>
  );
}
