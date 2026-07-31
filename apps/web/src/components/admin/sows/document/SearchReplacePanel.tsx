'use client';

import type { Editor } from '@tiptap/react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { useState } from 'react';

export function SearchReplacePanel({ editor, onClose }: { editor: Editor; onClose: () => void }) {
  const [term, setTerm] = useState('');
  const [replacement, setReplacement] = useState('');

  const matchCount = editor.storage.searchAndReplace.matches.length;
  const activeIndex = editor.storage.searchAndReplace.activeIndex;

  function handleSearch(value: string) {
    setTerm(value);
    editor.commands.setSearchTerm(value);
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 border-b border-border bg-muted/40 px-2 py-1.5">
      <input
        aria-label="Search"
        placeholder="Find"
        value={term}
        onChange={(e) => handleSearch(e.target.value)}
        className="h-7 w-36 rounded border border-border bg-background px-1.5 text-xs"
      />
      <span className="text-xs text-muted-foreground">{matchCount > 0 ? `${activeIndex + 1}/${matchCount}` : '0/0'}</span>
      <button
        type="button"
        aria-label="Previous match"
        disabled={matchCount === 0}
        onClick={() => editor.commands.goToMatch(-1)}
        className="inline-flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-accent/60 hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronUp size={15} />
      </button>
      <button
        type="button"
        aria-label="Next match"
        disabled={matchCount === 0}
        onClick={() => editor.commands.goToMatch(1)}
        className="inline-flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-accent/60 hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronDown size={15} />
      </button>

      <input
        aria-label="Replace with"
        placeholder="Replace"
        value={replacement}
        onChange={(e) => setReplacement(e.target.value)}
        className="h-7 w-36 rounded border border-border bg-background px-1.5 text-xs"
      />
      <button
        type="button"
        disabled={matchCount === 0}
        onClick={() => editor.commands.replaceActiveMatch(replacement)}
        className="h-7 rounded border border-border px-2 text-xs text-foreground hover:bg-accent/60 disabled:pointer-events-none disabled:opacity-40"
      >
        Replace
      </button>
      <button
        type="button"
        disabled={matchCount === 0}
        onClick={() => editor.commands.replaceAllMatches(replacement)}
        className="h-7 rounded border border-border px-2 text-xs text-foreground hover:bg-accent/60 disabled:pointer-events-none disabled:opacity-40"
      >
        Replace all
      </button>

      <button
        type="button"
        aria-label="Close find and replace"
        onClick={() => {
          editor.commands.setSearchTerm('');
          onClose();
        }}
        className="ml-auto inline-flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-accent/60 hover:text-foreground"
      >
        <X size={15} />
      </button>
    </div>
  );
}
