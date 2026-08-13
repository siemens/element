/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { type Node, type Parent, type Root, type Text } from 'mdast';
import { type Transformer } from 'unified';

import {
  ExtendedRootContent,
  type Citation,
  type Citations,
  type SiMarkdownCitation
} from '../../si-markdown.types';

const positionKey = (start: number, end: number): string => `${start}:${end}`;

const createCitation = (
  citationIndex: number,
  text?: string,
  position?: Citation['position']
): Citation => ({
  type: 'citation',
  citationIndex,
  ...(text ? { text } : {}),
  ...(position ? { position } : {})
});

const getText = (node: Node): string => {
  if ('value' in node && typeof node.value === 'string') {
    return node.value;
  }
  if ('children' in node) {
    return (node as Parent).children.map(child => getText(child)).join('');
  }
  return '';
};

/** Converts configured citation references in a markdown AST into citation nodes. */
export const siMarkdownCitationsTransformer = (
  citations?: readonly SiMarkdownCitation[]
): Transformer<Root> => {
  if (!citations?.length) {
    return tree => tree;
  }

  const citationsByIdentifier = new Map<string, number>();
  const citationsByPosition = new Map<string, number>();
  const citationsByStartIndex = new Map<number, number>();

  for (let index = 0; index < citations.length; index++) {
    const citation = citations[index];

    if (citation.identifier) {
      citationsByIdentifier.set(citation.identifier, index);
    } else if (citation.position) {
      const startIndex = citation.position?.startIndex;
      const endIndex = citation.position?.endIndex;
      citationsByPosition.set(positionKey(startIndex, endIndex), index);
      citationsByStartIndex.set(startIndex, index);
    }
  }

  if (!citationsByIdentifier.size && !citationsByPosition.size) {
    return tree => tree;
  }

  const replaceTextCitations = (text: Text): (Text | Citation)[] | undefined => {
    const startOffset = text.position?.start.offset;
    if (startOffset === undefined) {
      return undefined;
    }

    const nodes: (Text | Citation)[] = [];
    const identifierPattern = /\[([^\]\r\n]+)\]/y;
    let cursor = 0;
    let textStart = 0;
    let hasCitation = false;

    const addText = (end: number): void => {
      if (end > textStart) {
        nodes.push({ type: 'text', value: text.value.slice(textStart, end) });
      }
    };

    while (cursor < text.value.length) {
      const positionCitation = citationsByStartIndex.get(startOffset + cursor);
      identifierPattern.lastIndex = cursor;
      const identifierMatch = identifierPattern.exec(text.value);
      const identifierCitation = identifierMatch
        ? citationsByIdentifier.get(identifierMatch[1])
        : undefined;

      const positionCitationEnd =
        positionCitation === undefined
          ? undefined
          : citations[positionCitation]?.position?.endIndex;

      if (
        positionCitation !== undefined &&
        positionCitationEnd !== undefined &&
        positionCitationEnd <= startOffset + text.value.length
      ) {
        addText(cursor);
        const citationText = text.value.slice(cursor, positionCitationEnd - startOffset);
        nodes.push(createCitation(positionCitation, citationText));
        cursor = positionCitationEnd - startOffset;
        textStart = cursor;
        hasCitation = true;
      } else if (identifierCitation !== undefined && identifierMatch) {
        addText(cursor);
        nodes.push(createCitation(identifierCitation));
        cursor += identifierMatch[0].length;
        textStart = cursor;
        hasCitation = true;
      } else {
        cursor++;
      }
    }

    addText(text.value.length);
    return hasCitation ? nodes : undefined;
  };

  const replaceCitations = (parent: Parent): void => {
    const children = parent.children as (ExtendedRootContent | Citation)[];

    for (let index = 0; index < children.length; index++) {
      const child = children[index];
      const startOffset = child.position?.start.offset;
      const endOffset = child.position?.end.offset;
      const citationIndex =
        startOffset !== undefined && endOffset !== undefined
          ? citationsByPosition.get(positionKey(startOffset, endOffset))
          : undefined;

      if (citationIndex !== undefined) {
        children.splice(index, 1, createCitation(citationIndex, getText(child), child.position));
        continue;
      }

      if (child.type === 'text') {
        const replacement = replaceTextCitations(child);
        if (replacement) {
          children.splice(index, 1, ...replacement);
          index += replacement.length - 1;
        }
        continue;
      }

      if ('children' in child) {
        replaceCitations(child as Parent);
      }

      // special case: link with citation as link text: replace link with citations
      if (child.type === 'link') {
        const linkChildren = (child as Parent).children as ExtendedRootContent[];
        if (linkChildren.length === 1 && linkChildren[0].type === 'citations') {
          children.splice(index, 1, linkChildren[0]);
        }
      }
    }

    for (let index = 0; index < children.length; index++) {
      if (children[index].type !== 'citation') {
        continue;
      }

      const citationList: Citation[] = [];
      while (children[index]?.type === 'citation') {
        citationList.push(children[index] as Citation);
        children.splice(index, 1);
      }

      const container: Citations = { type: 'citations', children: citationList };
      children.splice(index, 0, container);
    }
  };

  return tree => replaceCitations(tree);
};
