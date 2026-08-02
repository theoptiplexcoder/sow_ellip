import { Card, CardContent, cn } from '@sow-platform/ui';
import type { ReactNode } from 'react';

export function Surface({
  className,
  contentClassName,
  children,
}: {
  className?: string;
  contentClassName?: string;
  children: ReactNode;
}) {
  return (
    <Card
      className={cn(
        'border-border/80 shadow-[0_1px_2px_rgb(15_23_42/0.04)]',
        className,
      )}
    >
      <CardContent className={cn('p-0', contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}
