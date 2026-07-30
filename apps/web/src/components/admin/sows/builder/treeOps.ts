// Immutable helpers for editing the field tree by path (a path is a list of
// child indices from the root, e.g. [1, 0] = second field's first child).

import type { FieldDraft } from './types';

export function getNodeAtPath(fields: FieldDraft[], path: number[]): FieldDraft | undefined {
  let list = fields;
  let node: FieldDraft | undefined;
  for (const i of path) {
    node = list[i];
    if (!node) return undefined;
    list = node.children ?? [];
  }
  return node;
}

function splitPath(path: number[]): { parentPath: number[]; index: number } {
  return { parentPath: path.slice(0, -1), index: path[path.length - 1] };
}

function updateListAtPath(
  fields: FieldDraft[],
  parentPath: number[],
  updater: (list: FieldDraft[]) => FieldDraft[],
): FieldDraft[] {
  if (parentPath.length === 0) return updater(fields);
  const [head, ...rest] = parentPath;
  return fields.map((f, i) => (i === head ? { ...f, children: updateListAtPath(f.children ?? [], rest, updater) } : f));
}

export function updateNodeAtPath(fields: FieldDraft[], path: number[], patch: Partial<FieldDraft>): FieldDraft[] {
  const { parentPath, index } = splitPath(path);
  return updateListAtPath(fields, parentPath, (list) => list.map((f, i) => (i === index ? { ...f, ...patch } : f)));
}

export function removeNodeAtPath(fields: FieldDraft[], path: number[]): FieldDraft[] {
  const { parentPath, index } = splitPath(path);
  return updateListAtPath(fields, parentPath, (list) => list.filter((_, i) => i !== index));
}

export function insertNodeAtParentPath(
  fields: FieldDraft[],
  parentPath: number[],
  index: number,
  node: FieldDraft,
): FieldDraft[] {
  return updateListAtPath(fields, parentPath, (list) => {
    const next = [...list];
    next.splice(index, 0, node);
    return next;
  });
}

export function moveNodeWithinParent(fields: FieldDraft[], parentPath: number[], from: number, to: number): FieldDraft[] {
  return updateListAtPath(fields, parentPath, (list) => {
    if (to < 0 || to >= list.length) return list;
    const next = [...list];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    return next;
  });
}

function uniqueKey(base: string, existing: string[]): string {
  let key = `${base}_copy`;
  let i = 2;
  while (existing.includes(key)) {
    key = `${base}_copy${i}`;
    i += 1;
  }
  return key;
}

export function duplicateNodeAtPath(fields: FieldDraft[], path: number[], existingKeys: string[]): FieldDraft[] {
  const node = getNodeAtPath(fields, path);
  if (!node) return fields;
  const clone: FieldDraft = { ...node, key: uniqueKey(node.key, existingKeys), title: `${node.title} (copy)` };
  const { parentPath, index } = splitPath(path);
  return insertNodeAtParentPath(fields, parentPath, index + 1, clone);
}

export function pathsEqual(a: number[] | null, b: number[] | null): boolean {
  if (!a || !b) return a === b;
  return a.length === b.length && a.every((v, i) => v === b[i]);
}
