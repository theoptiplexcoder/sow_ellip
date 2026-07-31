'use client';

import type { Editor } from '@tiptap/react';
import { useEffect, useState } from 'react';
import { cn } from '../../../../lib/cn';

type OutlineItem = { level: number; text: string; pos: number };

function collectHeadings(editor: Editor): OutlineItem[] {
  const items: OutlineItem[] = [];
  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === 'heading') {
      items.push({ level: node.attrs['level'] as number, text: node.textContent || 'Untitled', pos });
    }
  });
  return items;
}

export function DocumentOutline({ editor }: { editor: Editor }) {
  const [items, setItems] = useState<OutlineItem[]>([]);

  useEffect(() => {
    const update = () => setItems(collectHeadings(editor));
    update();
    editor.on('update', update);
    return () => {
      editor.off('update', update);
    };
  }, [editor]);

  if (items.length === 0) {
    return <p className="p-3 text-xs text-muted-foreground">Headings you add will show up here.</p>;
  }

  return (
    <nav aria-label="Document outline" className="flex flex-col gap-0.5 p-2">
      {items.map((item) => (
        <button
          key={item.pos}
          type="button"
          onClick={() => {
            editor.chain().focus().setTextSelection(item.pos).scrollIntoView().run();
          }}
          className={cn(
            'truncate rounded px-2 py-1 text-left text-xs text-muted-foreground hover:bg-accent/60 hover:text-foreground',
            item.level === 1 && 'font-medium text-foreground',
          )}
          style={{ paddingLeft: `${0.5 + (item.level - 1) * 0.75}rem` }}
        >
          {item.text}
        </button>
      ))}
    </nav>
  );
}
