'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { EditorState, NodeSelection } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { baseKeymap, toggleMark } from 'prosemirror-commands';
import { keymap } from 'prosemirror-keymap';
import { history, undo, redo } from 'prosemirror-history';
import { dropCursor } from 'prosemirror-dropcursor';
import { gapCursor } from 'prosemirror-gapcursor';
import { splitListItem, liftListItem, sinkListItem } from 'prosemirror-schema-list';
import { docSchema } from './schema';
import { docToBody, fieldsAndBodyToDoc, type DocJSON } from './docConvert';
import { docToMarkdown, markdownToDoc } from './markdown';
import { markdownInputRulesPlugin } from './markdownInputRules';
import { fieldTokenView } from './nodeviews/fieldTokenView';
import { fieldBlockTokenView } from './nodeviews/fieldBlockTokenView';
import { EditorToolbar } from './EditorToolbar';
import type { FieldDraft } from '../types';

export type PMCanvasHandle = {
  insertFieldToken: (fieldKey: string) => void;
  insertFieldBlockToken: (fieldKey: string) => void;
};

type PMCanvasProps = {
  body: DocJSON;
  fields: FieldDraft[];
  onBodyChange: (body: DocJSON) => void;
  onSelectField: (fieldKey: string | null) => void;
};

export const PMCanvas = forwardRef<PMCanvasHandle, PMCanvasProps>(function PMCanvas(
  { body, fields, onBodyChange, onSelectField },
  ref,
) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const fieldsRef = useRef(fields);
  fieldsRef.current = fields;

  const [stateVersion, setStateVersion] = useState(0);
  const [mode, setMode] = useState<'rich' | 'markdown'>('rich');
  const [markdownText, setMarkdownText] = useState('');

  useEffect(() => {
    if (!hostRef.current) return;

    const state = EditorState.create({
      doc: fieldsAndBodyToDoc(fieldsRef.current, body),
      plugins: [
        markdownInputRulesPlugin,
        history(),
        keymap({ 'Mod-z': undo, 'Mod-y': redo, 'Mod-Shift-z': redo }),
        keymap({
          'Mod-b': toggleMark(docSchema.marks['strong']),
          'Mod-i': toggleMark(docSchema.marks['em']),
          Enter: splitListItem(docSchema.nodes['list_item']),
          'Shift-Tab': liftListItem(docSchema.nodes['list_item']),
          Tab: sinkListItem(docSchema.nodes['list_item']),
        }),
        keymap(baseKeymap),
        dropCursor(),
        gapCursor(),
      ],
    });

    const view = new EditorView(hostRef.current, {
      state,
      nodeViews: {
        field_token: fieldTokenView(() => fieldsRef.current),
        field_block_token: fieldBlockTokenView(() => fieldsRef.current),
      },
      dispatchTransaction(tr) {
        const nextState = view.state.apply(tr);
        view.updateState(nextState);
        setStateVersion((v) => v + 1);
        if (tr.docChanged) onBodyChange(docToBody(nextState.doc));
        if (tr.selectionSet) {
          const sel = nextState.selection;
          if (
            sel instanceof NodeSelection &&
            (sel.node.type.name === 'field_token' || sel.node.type.name === 'field_block_token')
          ) {
            onSelectField(sel.node.attrs['fieldKey'] as string);
          } else {
            onSelectField(null);
          }
        }
      },
    });

    viewRef.current = view;
    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useImperativeHandle(ref, () => ({
    insertFieldToken(fieldKey) {
      const view = viewRef.current;
      if (!view) return;
      const node = docSchema.nodes['field_token'].create({ fieldKey });
      view.dispatch(view.state.tr.replaceSelectionWith(node, false));
      view.focus();
    },
    insertFieldBlockToken(fieldKey) {
      const view = viewRef.current;
      if (!view) return;
      const node = docSchema.nodes['field_block_token'].create({ fieldKey });
      view.dispatch(view.state.tr.insert(view.state.doc.content.size, node));
      view.focus();
    },
  }));

  function toggleMode() {
    const view = viewRef.current;
    if (!view) return;

    if (mode === 'rich') {
      setMarkdownText(docToMarkdown(view.state.doc));
      setMode('markdown');
      return;
    }

    const parsedDoc = markdownToDoc(markdownText);
    const sanitizedDoc = fieldsAndBodyToDoc(fieldsRef.current, docToBody(parsedDoc));
    view.updateState(EditorState.create({ schema: docSchema, doc: sanitizedDoc, plugins: view.state.plugins }));
    setStateVersion((v) => v + 1);
    onBodyChange(docToBody(sanitizedDoc));
    setMode('rich');
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-md border border-border bg-background focus-within:ring-1 focus-within:ring-ring">
      <EditorToolbar view={viewRef.current} stateVersion={stateVersion} mode={mode} onToggleMode={toggleMode} />
      <div
        ref={hostRef}
        hidden={mode !== 'rich'}
        className="prose min-h-[500px] max-w-none p-6 [&_.ProseMirror]:outline-none"
      />
      {mode === 'markdown' && (
        <textarea
          value={markdownText}
          onChange={(e) => setMarkdownText(e.target.value)}
          className="min-h-[500px] w-full resize-none bg-background p-6 font-mono text-sm outline-none"
          spellCheck={false}
        />
      )}
    </div>
  );
});
