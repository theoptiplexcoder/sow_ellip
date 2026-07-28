'use client';

import { useCallback, useRef, useState } from 'react';

export function useResizableWidth(initial: number, min = 320, max = 720) {
  const [width, setWidth] = useState(initial);
  const dragState = useRef<{ startX: number; startWidth: number } | null>(null);

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      if (!dragState.current) return;
      const delta = dragState.current.startX - e.clientX;
      const next = Math.min(max, Math.max(min, dragState.current.startWidth + delta));
      setWidth(next);
    },
    [min, max],
  );

  const onPointerUp = useCallback(() => {
    dragState.current = null;
    document.body.style.removeProperty('cursor');
    document.body.style.removeProperty('user-select');
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
  }, [onPointerMove]);

  const startResize = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      dragState.current = { startX: e.clientX, startWidth: width };
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
    },
    [width, onPointerMove, onPointerUp],
  );

  return { width, startResize };
}
