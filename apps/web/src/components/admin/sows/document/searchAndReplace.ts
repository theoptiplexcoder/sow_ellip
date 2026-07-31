// Minimal find/replace: highlights matches of a search term and lets you
// step through or replace them. No official Tiptap v3 extension for this yet.

import { Extension } from '@tiptap/core';
import { Plugin, PluginKey, TextSelection, type EditorState } from '@tiptap/pm/state';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export interface SearchAndReplaceStorage {
  searchTerm: string;
  matches: { from: number; to: number }[];
  activeIndex: number;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    searchAndReplace: {
      setSearchTerm: (term: string) => ReturnType;
      goToMatch: (direction: 1 | -1) => ReturnType;
      replaceActiveMatch: (replacement: string) => ReturnType;
      replaceAllMatches: (replacement: string) => ReturnType;
    };
  }
  interface Storage {
    searchAndReplace: SearchAndReplaceStorage;
  }
}

const searchPluginKey = new PluginKey('searchAndReplace');

function findMatches(doc: ProseMirrorNode, term: string) {
  const matches: { from: number; to: number }[] = [];
  if (!term) return matches;
  const lower = term.toLowerCase();
  doc.descendants((node: ProseMirrorNode, pos: number) => {
    if (!node.isText) return;
    const text = node.text?.toLowerCase() ?? '';
    let index = text.indexOf(lower);
    while (index !== -1) {
      matches.push({ from: pos + index, to: pos + index + term.length });
      index = text.indexOf(lower, index + 1);
    }
  });
  return matches;
}

export const SearchAndReplace = Extension.create<Record<string, never>, SearchAndReplaceStorage>({
  name: 'searchAndReplace',

  addStorage() {
    return { searchTerm: '', matches: [], activeIndex: 0 };
  },

  addCommands() {
    return {
      setSearchTerm:
        (term: string) =>
        ({ editor, dispatch, tr }) => {
          const matches = findMatches(editor.state.doc, term);
          editor.storage.searchAndReplace.searchTerm = term;
          editor.storage.searchAndReplace.matches = matches;
          editor.storage.searchAndReplace.activeIndex = 0;
          if (dispatch) dispatch(tr.setMeta(searchPluginKey, true));
          return true;
        },
      goToMatch:
        (direction: 1 | -1) =>
        ({ editor, dispatch, tr }) => {
          const storage = editor.storage.searchAndReplace as SearchAndReplaceStorage;
          if (storage.matches.length === 0) return false;
          storage.activeIndex = (storage.activeIndex + direction + storage.matches.length) % storage.matches.length;
          const match = storage.matches[storage.activeIndex];
          if (dispatch) {
            tr.setMeta(searchPluginKey, true);
            tr.setSelection(TextSelection.near(tr.doc.resolve(match.to)));
            dispatch(tr);
          }
          return true;
        },
      replaceActiveMatch:
        (replacement: string) =>
        ({ editor, dispatch, tr }) => {
          const storage = editor.storage.searchAndReplace as SearchAndReplaceStorage;
          const match = storage.matches[storage.activeIndex];
          if (!match) return false;
          if (dispatch) {
            tr.insertText(replacement, match.from, match.to);
            tr.setMeta(searchPluginKey, true);
            dispatch(tr);
          }
          editor.commands.setSearchTerm(storage.searchTerm);
          return true;
        },
      replaceAllMatches:
        (replacement: string) =>
        ({ editor, dispatch, tr }) => {
          const storage = editor.storage.searchAndReplace as SearchAndReplaceStorage;
          if (storage.matches.length === 0) return false;
          if (dispatch) {
            [...storage.matches].reverse().forEach((match) => {
              tr.insertText(replacement, match.from, match.to);
            });
            tr.setMeta(searchPluginKey, true);
            dispatch(tr);
          }
          editor.commands.setSearchTerm('');
          return true;
        },
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: searchPluginKey,
        props: {
          decorations: (state: EditorState) => {
            const storage = this.storage;
            if (!storage.matches.length) return DecorationSet.empty;
            const decorations = storage.matches.map((match, i) =>
              Decoration.inline(match.from, match.to, {
                class: i === storage.activeIndex ? 'search-match search-match-active' : 'search-match',
              }),
            );
            return DecorationSet.create(state.doc, decorations);
          },
        },
      }),
    ];
  },
});
