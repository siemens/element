/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { type Node, type Parent, type Root } from 'mdast';
import type { SiSource } from '@siemens/element-ng/common';

import { SiMarkdownExtension } from '../../si-markdown.types';
import { SiMarkdownSourceCitationComponent } from './si-markdown-source-citation.component';

/** A source that can be referenced in AI-generated markdown. */
export interface SiMarkdownCitation extends SiSource {
  /** Numeric reference emitted in markdown, for example `1` for `[1]`. */
  reference: string;
}

/** Configuration for {@link siMarkdownSourceCitations}. */
export interface SiMarkdownSourceCitationsOptions {
  /** Sources available to the markdown message. */
  citations: readonly SiMarkdownCitation[];
  /** Called when a source is selected in the popover. */
  onSourceOpen?: (citation: SiMarkdownCitation) => void;
}

/** Markdown AST node rendered as a source chip. */
export interface SiMarkdownSourceCitationNode extends Parent {
  type: 'sourceCitation';
  citations: SiMarkdownCitation[];
}

type MarkdownParent = Node & { children?: Node[] };
type MarkdownText = Node & { type: 'text'; value: string };

const citationMarker = /\[(\d+)]/g;

/**
 * Adds support for LLM-style numeric source citations such as `[1]`.
 *
 * Known citations are collected per paragraph and rendered as one summary chip at the end of
 * that paragraph. Unknown citation markers stay unchanged in the rendered markdown.
 *
 * @param options - Sources available to the rendered markdown and an optional selection handler.
 * @returns extension for {@link SiMarkdownOptions.installExtension}.
 */
export const siMarkdownSourceCitations = (
  options: SiMarkdownSourceCitationsOptions
): SiMarkdownExtension => {
  return {
    plugins: [{ plugin: sourceCitationPlugin, options }],
    types: [
      {
        type: 'sourceCitation',
        component: SiMarkdownSourceCitationComponent,
        options
      }
    ]
  };
};

const sourceCitationPlugin = (options: SiMarkdownSourceCitationsOptions) => {
  const citationsByReference = new Map(
    options.citations.map(citation => [citation.reference, citation])
  );

  return (tree: Root) => transformTree(tree, citationsByReference);
};

const transformTree = (node: MarkdownParent, citationsByReference: Map<string, SiMarkdownCitation>): void => {
  if (node.type === 'paragraph') {
    transformParagraph(node, citationsByReference);
  }

  for (const child of node.children ?? []) {
    transformTree(child as MarkdownParent, citationsByReference);
  }
};

const transformParagraph = (
  paragraph: MarkdownParent,
  citationsByReference: Map<string, SiMarkdownCitation>
): void => {
  const citations: SiMarkdownCitation[] = [];
  const references = new Set<string>();

  replaceCitationMarkers(paragraph, citationsByReference, citations, references);

  if (citations.length > 0) {
    (paragraph.children ??= []).push({
      type: 'sourceCitation',
      citations
    } as SiMarkdownSourceCitationNode);
  }
};

const replaceCitationMarkers = (
  parent: MarkdownParent,
  citationsByReference: Map<string, SiMarkdownCitation>,
  citations: SiMarkdownCitation[],
  references: Set<string>
): void => {
  if (!parent.children) {
    return;
  }

  parent.children = parent.children.flatMap(child => {
    if (child.type === 'text') {
      return splitTextNode(child as MarkdownText, citationsByReference, citations, references);
    }

    if (!isCitationExcluded(child)) {
      replaceCitationMarkers(child as MarkdownParent, citationsByReference, citations, references);
    }

    return child;
  });
};

const splitTextNode = (
  textNode: MarkdownText,
  citationsByReference: Map<string, SiMarkdownCitation>,
  citations: SiMarkdownCitation[],
  references: Set<string>
): Node[] => {
  const nodes: MarkdownText[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  citationMarker.lastIndex = 0;
  while ((match = citationMarker.exec(textNode.value))) {
    const citation = citationsByReference.get(match[1]);
    if (!citation) {
      continue;
    }

    if (match.index > lastIndex) {
      nodes.push({ type: 'text', value: textNode.value.slice(lastIndex, match.index) } as MarkdownText);
    }

    if (!references.has(citation.reference)) {
      citations.push(citation);
      references.add(citation.reference);
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex === 0) {
    return [textNode];
  }

  if (lastIndex < textNode.value.length) {
    nodes.push({ type: 'text', value: textNode.value.slice(lastIndex) } as MarkdownText);
  }

  return nodes;
};

const isCitationExcluded = (node: Node): boolean =>
  node.type === 'inlineCode' ||
  node.type === 'link' ||
  node.type === 'linkReference' ||
  node.type === 'html';