// Block NodeView for `field_block_token` (array/dynamicTable/signature-style
// fields that don't fit inline). Same click-to-select behavior as the inline
// field_token chip, styled as a full-width card.

import type { Node } from 'prosemirror-model';
import type { EditorView, NodeView } from 'prosemirror-view';
import { NodeSelection } from 'prosemirror-state';
import type { FieldDraft } from '../../types';

export function fieldBlockTokenView(getFields: () => FieldDraft[]) {
  return (node: Node, view: EditorView, getPos: () => number | undefined): NodeView => {
    const dom = document.createElement('div');
    dom.className =
      'my-2 flex items-center gap-2 rounded-md border border-dashed border-blue-300 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-800 cursor-pointer';

    function render(n: Node) {
      const field = getFields().find((f) => f.key === n.attrs['fieldKey']);
      dom.textContent = '';
      const label = document.createElement('span');
      label.textContent = field?.title ?? n.attrs['fieldKey'];
      const badge = document.createElement('span');
      badge.className = 'text-[10px] uppercase text-blue-500';
      badge.textContent = field?.kind ?? '?';
      dom.append(label, badge);
    }
    render(node);

    dom.addEventListener('mousedown', (e) => {
      e.preventDefault();
      const pos = getPos();
      if (pos === undefined) return;
      view.dispatch(view.state.tr.setSelection(NodeSelection.create(view.state.doc, pos)));
    });

    return {
      dom,
      update(updated) {
        if (updated.type !== node.type) return false;
        render(updated);
        return true;
      },
      ignoreMutation: () => true,
    };
  };
}
