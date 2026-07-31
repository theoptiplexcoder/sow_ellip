// Markdown typing shortcuts for the authoring canvas: "# ", "**bold**",
// "- ", "1. ", "> ", "```", "---", "`code`", "~~strike~~", "[text](url)"
// auto-format as you type, producing the same node/mark structure a
// toolbar button would. The doc is still ProseMirror JSON — this is purely
// a convenient input method, not a markdown storage format.

import { InputRule, inputRules, textblockTypeInputRule, wrappingInputRule } from 'prosemirror-inputrules';
import type { MarkType } from 'prosemirror-model';
import { docSchema } from './schema';

function markInputRule(regexp: RegExp, markType: MarkType) {
  return new InputRule(regexp, (state, match, start, end) => {
    const { tr } = state;
    const inner = match[1];
    if (inner) {
      const textStart = start + match[0].indexOf(inner);
      const textEnd = textStart + inner.length;
      if (textEnd < end) tr.delete(textEnd, end);
      if (textStart > start) tr.delete(start, textStart);
      end = start + inner.length;
    }
    tr.addMark(start, end, markType.create());
    tr.removeStoredMark(markType);
    return tr;
  });
}

const horizontalRuleInputRule = new InputRule(/^(?:---|\*\*\*|___)$/, (state, _match, start, end) => {
  const { tr } = state;
  tr.replaceRangeWith(start, end, docSchema.nodes['horizontal_rule'].create());
  return tr;
});

const linkInputRule = new InputRule(
  /\[([^\]]+)\]\(([^)\s]+)\)$/,
  (state, match, start, end) => {
    const { tr } = state;
    const [, text, href] = match;
    const textStart = start + match[0].indexOf('[');
    tr.replaceWith(textStart, end, docSchema.text(text, [docSchema.marks['link'].create({ href })]));
    return tr;
  },
);

export const markdownInputRulesPlugin = inputRules({
  rules: [
    textblockTypeInputRule(/^(#{1,6})\s$/, docSchema.nodes['heading'], (match) => ({
      level: match[1].length,
    })),
    textblockTypeInputRule(/^```$/, docSchema.nodes['code_block']),
    wrappingInputRule(/^\s*>\s$/, docSchema.nodes['blockquote']),
    wrappingInputRule(/^\s*([-+*])\s$/, docSchema.nodes['bullet_list']),
    wrappingInputRule(
      /^(\d+)\.\s$/,
      docSchema.nodes['ordered_list'],
      (match) => ({ order: +match[1] }),
      (match, node) => node.childCount + (node.attrs['order'] as number) === +match[1],
    ),
    horizontalRuleInputRule,
    linkInputRule,
    markInputRule(/(?:^|[^*])\*\*([^*]+)\*\*$/, docSchema.marks['strong']),
    markInputRule(/(?:^|[^*_])[*_]([^*_]+)[*_]$/, docSchema.marks['em']),
    markInputRule(/(?:^|[^~])~~([^~]+)~~$/, docSchema.marks['strike']),
    markInputRule(/(?:^|[^`])`([^`]+)`$/, docSchema.marks['code']),
  ],
});
