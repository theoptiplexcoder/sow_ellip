import { Avatar, AvatarFallback, Badge, cn } from '@sow-platform/ui';
import type { ReactNode } from 'react';

export function ActivityTimeline<T>({
  items,
  getKey,
  getActor,
  getAction,
  getEntityName,
  getTimestamp,
  getEntityType,
  className,
}: {
  items: T[];
  getKey: (item: T) => string;
  getActor: (item: T) => string;
  getAction: (item: T) => ReactNode;
  getEntityName?: (item: T) => ReactNode;
  getTimestamp: (item: T) => string;
  getEntityType?: (item: T) => string;
  className?: string;
}) {
  return (
    <ul
      className={cn(
        'relative flex flex-col gap-4 border-l border-border pl-6',
        className,
      )}
    >
      {items.map((item) => {
        const actor = getActor(item);
        const initials = actor
          .split(' ')
          .map((p) => p[0])
          .join('');

        return (
          <li key={getKey(item)} className="relative flex items-start gap-3">
            <span className="absolute top-1 -left-[29px] size-2.5 rounded-full border-2 border-background bg-muted-foreground" />
            <Avatar className="size-8 shrink-0">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 text-sm">
              <span className="font-medium">{actor}</span>{' '}
              <span className="text-muted-foreground">{getAction(item)}</span>
              {getEntityName && (
                <>
                  {' '}
                  <span className="font-medium">{getEntityName(item)}</span>
                </>
              )}
              <div className="mt-1 flex flex-wrap items-center gap-2">
                {getEntityType && (
                  <Badge variant="outline" className="text-[10px]">
                    {getEntityType(item)}
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  {getTimestamp(item)}
                </span>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
