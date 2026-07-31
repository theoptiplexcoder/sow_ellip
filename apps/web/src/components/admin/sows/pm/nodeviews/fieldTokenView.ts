// Inline chip NodeView for `field_token`: renders a small label + kind badge
// in the authoring canvas and is click-to-select (selecting the token as a
// NodeSelection, so PropertyPanel can show its FieldDraft).

import type { Node } from 'prosemirror-model';
import type { EditorView, NodeView } from 'prosemirror-view';
import { NodeSelection } from 'prosemirror-state';
import type { FieldDraft } from '../../types';

export function fieldTokenView(getFields: () => FieldDraft[]) {
  return (node: Node, view: EditorView, getPos: () => number | undefined): NodeView => {
    const dom = document.createElement('span');
    dom.className =
      'inline-flex items-center gap-1 rounded border border-blue-300 bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-blue-800 cursor-pointer align-baseline';

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
