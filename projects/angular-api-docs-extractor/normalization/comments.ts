/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  DocBlock,
  DocExcerpt,
  DocInlineTagBase,
  TSDocConfiguration,
  TSDocParser,
  TSDocTagDefinition,
  TSDocTagSyntaxKind,
  type DocBlockTag,
  type DocNode
} from '@microsoft/tsdoc';

import type { ApiJsDocTag } from '../extraction/model.ts';

interface ParsedComment {
  description: string;
  jsdocTags: ApiJsDocTag[];
  inheritsDoc: boolean;
}

/** Destination scheme of Markdown links produced from `{@link}` tags. */
export const inlineLinkScheme = 'tsdoc-link:';

const defaultParser = new TSDocParser();
const tagNameCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789-';
const markdownPunctuation = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';

export const isFence = (line: string): boolean => {
  const content = line.trimStart();
  return content.startsWith('```') || content.startsWith('~~~');
};

/**
 * Prepares block tags at the start of lines for TSDoc: hyphenated names such as `@docs-private`
 * become `@docsPrivate`, and tags TSDoc does not know, such as `@since`, are registered.
 */
function prepare(raw: string): { source: string; parser: TSDocParser; names: Map<string, string> } {
  const names = new Map<string, string>();
  const unknown = new Set<string>();
  let fenced = false;
  const source = raw
    .split('\n')
    .map(line => {
      let content = line.trimStart();
      if (content.startsWith('/**')) content = content.slice(3);
      else if (content.startsWith('*')) content = content.slice(1);
      content = content.trimStart();
      if (isFence(content)) fenced = !fenced;
      let end = 1;
      while (end < content.length && tagNameCharacters.includes(content[end].toLowerCase())) end++;
      const [first, ...rest] = content.slice(1, end).split('-');
      const next = content[end] ?? ' ';
      if (
        fenced ||
        !content.startsWith('@') ||
        !first ||
        first[0] <= '9' ||
        rest.some(part => !part) ||
        (next.trim() && next !== '*')
      )
        return line;
      const tag = first + rest.map(part => part[0].toUpperCase() + part.slice(1)).join('');
      if (!defaultParser.configuration.tryGetTagDefinition('@' + tag)) unknown.add(tag);
      if (!rest.length) return line;
      names.set(tag.toLowerCase(), content.slice(1, end));
      return line.slice(0, line.length - content.length) + '@' + tag + content.slice(end);
    })
    .join('\n');
  if (!unknown.size) return { source, parser: defaultParser, names };
  const configuration = new TSDocConfiguration();
  configuration.addTagDefinitions(
    [...unknown].map(
      tag =>
        new TSDocTagDefinition({
          tagName: '@' + tag,
          syntaxKind: TSDocTagSyntaxKind.BlockTag,
          allowMultiple: true
        })
    )
  );
  return { source, parser: new TSDocParser(configuration), names };
}

const escapeMarkdown = (text: string): string =>
  [...text].map(char => (markdownPunctuation.includes(char) ? '\\' + char : char)).join('');

/** `{@link target | label}` as a Markdown link, keeping malformed tags as text. */
function linkMarkdown(tag: DocInlineTagBase): string {
  const source = render(tag, false);
  const content = source.slice(tag.tagName.length + 1, -1).trim();
  const end = [...content].findIndex(char => char === '|' || !char.trim());
  const target = end < 0 ? content : content.slice(0, end);
  let label = content.slice(target.length).trim();
  if (label.startsWith('|')) label = label.slice(1).trim();
  if (!target) return source;
  return `[${escapeMarkdown(label || target)}](<${inlineLinkScheme}${escapeMarkdown(target)}>)`;
}

/**
 * Source text of a node, keeping escapes, indentation and Markdown as written.
 * With `links`, `{@link}` tags become Markdown links and `{@label}` tags are dropped.
 */
function render(node: DocNode, links = true): string {
  if (node instanceof DocExcerpt) return node.content.toString();
  if (links && node instanceof DocInlineTagBase) {
    const name = node.tagName.toLowerCase();
    if (name === '@label') return '';
    if (name.startsWith('@link')) return linkMarkdown(node);
  }
  return node
    .getChildNodes()
    .map(child => render(child, links))
    .join('');
}

const position = (node: DocNode): number =>
  node instanceof DocExcerpt
    ? (node.content.tokens[0]?.range.pos ?? Infinity)
    : Math.min(Infinity, ...node.getChildNodes().map(position));

function parseDocComment(raw: string): ParsedComment {
  const { source, parser, names } = prepare(raw);
  const comment = parser.parseString(source).docComment;
  const name = (tag: DocBlockTag): string =>
    names.get(tag.tagName.slice(1).toLowerCase()) ?? tag.tagName.slice(1);
  const tags = [
    comment.remarksBlock,
    comment.privateRemarks,
    comment.deprecatedBlock,
    ...comment.params.blocks,
    ...comment.typeParams.blocks,
    comment.returnsBlock,
    ...comment.customBlocks,
    ...comment.seeBlocks,
    ...comment.modifierTagSet.nodes
  ]
    .filter(tag => tag !== undefined)
    .sort((a, b) => position(a) - position(b));
  return {
    description: render(comment.summarySection).trim(),
    jsdocTags: tags.map(tag => {
      if (!(tag instanceof DocBlock)) return { name: name(tag), comment: '' };
      const tagName = name(tag.blockTag);
      const links = tagName.toLowerCase() !== 'example';
      return { name: tagName, comment: render(tag.content, links).trim() };
    }),
    inheritsDoc: comment.inheritDocTag !== undefined
  };
}

/** Parses raw doc comments, which are joined by newlines, preserving each section's Markdown. */
export function parseRawComment(raw: string): ParsedComment {
  const comments = raw
    .split('*/')
    .map(part => part.trimStart())
    .filter(part => part.startsWith('/**'))
    .map(part => parseDocComment(part + '*/'));
  return {
    description: comments
      .map(comment => comment.description)
      .filter(Boolean)
      .join('\n\n'),
    jsdocTags: comments.flatMap(comment => comment.jsdocTags),
    inheritsDoc: comments.some(comment => comment.inheritsDoc)
  };
}

/** Converts inline TSDoc tags in already extracted comment text to Markdown. */
export function inlineTagsToMarkdown(text: string): string {
  if (!text.includes('{@')) return text;
  const comment = '/**\n * ' + text.split('\n').join('\n * ') + '\n */';
  return render(defaultParser.parseString(comment).docComment).trim();
}
