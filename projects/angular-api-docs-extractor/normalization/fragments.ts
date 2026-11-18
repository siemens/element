/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import type { RootContent } from 'mdast';
import { gfmAutolinkLiteralFromMarkdown } from 'mdast-util-gfm-autolink-literal';
import { gfmAutolinkLiteral } from 'micromark-extension-gfm-autolink-literal';
import remarkParse from 'remark-parse';
import ts from 'typescript';
import { unified } from 'unified';

import { inlineLinkScheme, inlineTagsToMarkdown, isFence, parseRawComment } from './comments.ts';
import { resolveKeywordTypeUrl } from './platform-links.ts';
import type { PresentationBlock, PresentationFragment } from './model.ts';
import {
  fragment,
  hiddenTags,
  tagName,
  type Comment,
  type PresentationContext,
  type Scope
} from './context.ts';
import { originsFor, resolveDocumentationTarget, resolveSymbol } from './resolver.ts';
import {
  externalTypeUrl,
  fixedDocumentationUrl,
  qualifiedDocumentationUrl,
  safeHref,
  resolveStandardTypeUrl
} from './routing.ts';

const urlFragment = (text: string, url: string): PresentationFragment => {
  const href = safeHref(url);
  return fragment(href ? 'link' : 'text', text, null, href);
};

/** Only rendered type fragments collect dependencies, never prose or provenance. */
export const referenceFragment = (
  context: PresentationContext,
  text: string,
  name: string,
  scope: Scope,
  purpose: 'type' | 'documentation' | 'origin'
): PresentationFragment => {
  const documentationLink = purpose === 'documentation';
  const targetId =
    documentationLink || name.includes('.')
      ? resolveDocumentationTarget(context, name, scope)
      : resolveSymbol(context, name, scope)?.id;
  if (targetId) {
    const owner = context.result.targets[targetId].symbolId;
    if (purpose === 'type' && owner !== scope.entry.id) scope.relatedTypeIds.add(owner);
    return fragment(
      'link',
      purpose === 'type' && targetId === owner ? context.byId.get(owner)!.name : text,
      targetId
    );
  }
  const origins = originsFor(context, name, scope);
  const standardUrl = resolveStandardTypeUrl(name);
  const shadowed =
    origins.length ||
    (scope.member?.references ?? scope.entry.references ?? []).some(
      id => id.endsWith('#' + name) && !context.byId.has(id)
    ) ||
    ((documentationLink || standardUrl !== undefined) &&
      context.documentation.entries.some(entry => entry.name === name || entry.aliasOf === name));
  let documentationUrl: string | undefined;
  if (documentationLink && !shadowed) {
    const links = context.config.links;
    const qualified = /^([^#]+)#([\w$]+)$/.exec(name);
    documentationUrl = qualified
      ? qualifiedDocumentationUrl(links, qualified[1], qualified[2])
      : fixedDocumentationUrl(links, name);
  }
  const href =
    documentationUrl ??
    externalTypeUrl(context, name, origins) ??
    (shadowed ? undefined : standardUrl);
  if (href) return urlFragment(text, href);
  return fragment(documentationLink ? 'text' : 'code', text);
};

export const typeFragments = (
  context: PresentationContext,
  source: string,
  scope: Scope,
  optional = false
): PresentationFragment[] => {
  if (!source) return [];
  const prefix = `type __Presentation${scope.generics?.length ? '<' + scope.generics.join(', ') + '>' : ''} = `;
  const file = ts.createSourceFile(
    'presentation-type.ts',
    prefix + source + ';',
    ts.ScriptTarget.Latest,
    true
  );
  const statement = file.statements[0];
  if (!statement || !ts.isTypeAliasDeclaration(statement)) return [fragment('code', source)];
  // Optional rows already carry a '?' marker or badge. Strip only their outer
  // union's undefined, never callback return types or nested generic arguments.
  if (optional) {
    let type = statement.type;
    while (ts.isParenthesizedTypeNode(type)) type = type.type;
    if (ts.isUnionTypeNode(type)) {
      const defined = type.types.filter(part => part.kind !== ts.SyntaxKind.UndefinedKeyword);
      if (defined.length && defined.length < type.types.length)
        return typeFragments(context, defined.map(part => part.getText(file)).join(' | '), scope);
    }
  }
  const positions: { start: number; end: number; name: string; url?: string }[] = [];
  const bound = new Set(
    (scope.generics ?? []).map(generic => /^\s*([\w$]+)/.exec(generic)?.[1]).filter(Boolean)
  );
  const visit = (node: ts.Node, locals: Set<string | undefined>): void => {
    const nested = new Set(locals);
    if ('typeParameters' in node) {
      for (const parameter of (node as ts.SignatureDeclaration).typeParameters ?? [])
        nested.add(parameter.name.text);
    }
    if (ts.isMappedTypeNode(node)) nested.add(node.typeParameter.name.text);
    if (ts.isInferTypeNode(node)) nested.add(node.typeParameter.name.text);
    const nameNode = ts.isTypeReferenceNode(node)
      ? node.typeName
      : ts.isTypeQueryNode(node)
        ? node.exprName
        : ts.isImportTypeNode(node)
          ? node.qualifier
          : undefined;
    if (nameNode && !nested.has(nameNode.getText(file).split('.')[0])) {
      const start = nameNode.getStart(file) - prefix.length;
      if (start >= 0)
        positions.push({
          start,
          end: nameNode.end - prefix.length,
          name: nameNode.getText(file)
        });
    }
    const keywordUrl = resolveKeywordTypeUrl(node);
    if (keywordUrl) {
      const start = node.getStart(file) - prefix.length;
      if (start >= 0)
        positions.push({
          start,
          end: node.end - prefix.length,
          name: node.getText(file),
          url: keywordUrl
        });
    }
    if (ts.isConditionalTypeNode(node)) {
      visit(node.checkType, nested);
      visit(node.extendsType, nested);
      const inferred = new Set(nested);
      const collectInfer = (child: ts.Node): void => {
        if (ts.isInferTypeNode(child)) inferred.add(child.typeParameter.name.text);
        ts.forEachChild(child, collectInfer);
      };
      collectInfer(node.extendsType);
      visit(node.trueType, inferred);
      visit(node.falseType, nested);
    } else ts.forEachChild(node, child => visit(child, nested));
  };
  visit(statement.type, bound);
  const parts: PresentationFragment[] = [];
  let offset = 0;
  for (const position of positions.sort((a, b) => a.start - b.start)) {
    if (position.start < offset || position.end > source.length) continue;
    if (position.start > offset) parts.push(fragment('code', source.slice(offset, position.start)));
    parts.push(
      position.url
        ? urlFragment(source.slice(position.start, position.end), position.url)
        : referenceFragment(
            context,
            source.slice(position.start, position.end),
            position.name,
            scope,
            'type'
          )
    );
    offset = position.end;
  }
  if (offset < source.length) parts.push(fragment('code', source.slice(offset)));
  return parts;
};

export const genericFragments = (
  context: PresentationContext,
  generics: string[],
  scope: Scope
): PresentationFragment[] => {
  if (!generics.length) return [];
  const file = ts.createSourceFile(
    'presentation-generics.ts',
    `type X<${generics.join(', ')}> = unknown;`,
    ts.ScriptTarget.Latest,
    true
  );
  const declaration = file.statements[0];
  if (!declaration || !ts.isTypeAliasDeclaration(declaration))
    return [fragment('code', '<' + generics.join(', ') + '>')];
  const parts = [fragment('code', '<')];
  declaration.typeParameters?.forEach((parameter, index) => {
    if (index) parts.push(fragment('code', ', '));
    parts.push(fragment('code', parameter.name.text));
    if (parameter.constraint)
      parts.push(
        fragment('code', ' extends '),
        ...typeFragments(context, parameter.constraint.getText(file), scope)
      );
    if (parameter.default)
      parts.push(
        fragment('code', ' = '),
        ...typeFragments(context, parameter.default.getText(file), scope)
      );
  });
  parts.push(fragment('code', '>'));
  return parts;
};

const referenceKey = (identifier: string): string =>
  identifier.trim().replace(/\s+/g, ' ').toLowerCase();
const markdownLink = (
  context: PresentationContext,
  label: string,
  url: string,
  scope: Scope
): PresentationFragment => {
  if (url.startsWith(inlineLinkScheme)) {
    const target = url.slice(inlineLinkScheme.length);
    return /^(?:[a-z][\w+.-]*:|\/|\.\.?\/)/i.test(target)
      ? urlFragment(label, target)
      : referenceFragment(context, label, target, scope, 'documentation');
  }
  const target = resolveDocumentationTarget(context, url, scope);
  if (target) return referenceFragment(context, label, url, scope, 'documentation');
  const logical =
    url.startsWith('#') ||
    fixedDocumentationUrl(context.config.links, url) !== undefined ||
    resolveStandardTypeUrl(url) !== undefined ||
    (/^(?:@[^\s]+#|[A-Z_$][\w$]*(?:[.#][\w$]+)*$)/.test(url) && !/\.(?:md|html)$/i.test(url)) ||
    context.documentation.entries.some(
      entry =>
        url === entry.name ||
        url === entry.id ||
        url.startsWith(entry.name + '.') ||
        url.startsWith(entry.name + '#') ||
        url.startsWith(entry.id + '.')
    );
  if (logical) return referenceFragment(context, label, url, scope, 'documentation');
  return urlFragment(label, url);
};
const inline = (
  context: PresentationContext,
  nodes: RootContent[],
  scope: Scope,
  definitions: ReadonlyMap<string, string>
): PresentationFragment[] =>
  nodes.flatMap(node => {
    if (node.type === 'text') return [fragment('text', node.value)];
    if (node.type === 'inlineCode') return [fragment('code', node.value)];
    if (node.type === 'strong') {
      return inline(context, node.children, scope, definitions).map(part => ({
        ...part,
        strong: true
      }));
    }
    if (node.type === 'link' || node.type === 'linkReference') {
      const label = inline(context, node.children, scope, definitions)
        .map(part => part.text)
        .join('');
      const url = node.type === 'link' ? node.url : definitions.get(referenceKey(node.identifier));
      if (url !== undefined) return [markdownLink(context, label, url, scope)];
      return [fragment('text', label)];
    }
    if (node.type === 'image' || node.type === 'imageReference') {
      const url = node.type === 'image' ? node.url : definitions.get(referenceKey(node.identifier));
      const label =
        node.alt ||
        (node.type === 'imageReference' ? (node.label ?? node.identifier) : node.title) ||
        url ||
        'Image';
      if (url !== undefined) return [urlFragment(label, url)];
      return [fragment('text', label)];
    }
    if (node.type === 'definition') return [];
    if (node.type === 'break') return [fragment('text', '\n')];
    if (node.type === 'html') {
      // Normalize formatting-only markup, never raw HTML or code examples.
      const value = node.value.replace(/<\/?(?:b|em|i|s|small|strong|sub|sup|u)\s*>/gi, '');
      return value ? [fragment('text', value)] : [];
    }
    if ('children' in node) return inline(context, node.children, scope, definitions);
    if ('value' in node) return [fragment('text', String(node.value))];
    return [];
  });
const markdownParser = unified()
  .use(remarkParse)
  .data('micromarkExtensions', [gfmAutolinkLiteral()])
  .data('fromMarkdownExtensions', [gfmAutolinkLiteralFromMarkdown()]);
const markdown = (
  context: PresentationContext,
  source: string,
  scope: Scope
): PresentationBlock[] => {
  const tree = markdownParser.parse(source);
  const definitions = new Map<string, string>();
  const collectDefinitions = (nodes: RootContent[]): void => {
    for (const node of nodes) {
      if (node.type === 'definition') {
        const key = referenceKey(node.identifier);
        if (!definitions.has(key)) definitions.set(key, node.url);
      } else if ('children' in node) collectDefinitions(node.children);
    }
  };
  collectDefinitions(tree.children);
  const blocks = (nodes: RootContent[]): PresentationBlock[] =>
    nodes.flatMap(node => {
      if (node.type === 'definition') return [];
      if (node.type === 'code')
        return [
          {
            kind: 'code' as const,
            ...(node.lang ? { language: node.lang } : {}),
            parts: [fragment('code', node.value)]
          }
        ];
      if (node.type === 'list')
        return node.children.flatMap((item, index) =>
          blocks(item.children).map((block, blockIndex) =>
            blockIndex === 0 && block.kind === 'paragraph'
              ? {
                  ...block,
                  parts: [
                    fragment('text', node.ordered ? `${(node.start ?? 1) + index}. ` : '• '),
                    ...block.parts
                  ]
                }
              : block
          )
        );
      if (node.type === 'blockquote') return blocks(node.children);
      const parts = inline(
        context,
        'children' in node ? node.children : [node],
        scope,
        definitions
      );
      return parts.length ? [{ kind: 'paragraph' as const, parts }] : [];
    });
  return blocks(tree.children);
};
export const commentBlocks = (
  context: PresentationContext,
  item: Comment,
  scope: Scope
): PresentationBlock[] => {
  const parsed = item.rawComment ? parseRawComment(item.rawComment) : undefined;
  const comment =
    parsed && !parsed.inheritsDoc
      ? parsed
      : {
          description: inlineTagsToMarkdown(item.description),
          jsdocTags: item.jsdocTags.map(tag =>
            tagName(tag.name) === 'example'
              ? tag
              : { ...tag, comment: inlineTagsToMarkdown(tag.comment) }
          )
        };
  const output = markdown(
    context,
    comment.description || inlineTagsToMarkdown(item.description),
    scope
  );
  for (const tag of comment.jsdocTags) {
    const name = tagName(tag.name);
    if (hiddenTags.has(name)) continue;
    if (name === 'example') {
      output.push(
        { kind: 'paragraph', parts: [fragment('text', 'Example:')] },
        ...markdown(
          context,
          tag.comment.split('\n').some(isFence) ? tag.comment : '```\n' + tag.comment + '\n```',
          scope
        )
      );
    } else {
      const label =
        (
          {
            deprecated: 'Deprecated',
            returns: 'Returns',
            return: 'Returns',
            see: 'See',
            throws: 'Throws'
          } as Record<string, string>
        )[name] ?? '@' + tag.name;
      output.push(...markdown(context, label + (tag.comment ? ': ' + tag.comment : ''), scope));
    }
  }
  return output;
};
