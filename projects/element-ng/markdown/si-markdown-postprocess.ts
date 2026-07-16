/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  type Definition,
  type FootnoteReference,
  type FootnoteDefinition,
  type Parent,
  type Root
} from 'mdast';
import { type Transformer } from 'unified';

import { type SiMarkdownRoot } from './si-markdown.types';

/** Moves footnote definitions into a single root-level container. */
export const siMarkdownPostprocess = (): Transformer<Root, SiMarkdownRoot> => tree => {
  const footnoteReferences: FootnoteReference[] = [];
  const footnoteDefinitions: FootnoteDefinition[] = [];
  const footnoteDefinitionsMap = new Map<string, FootnoteDefinition>();
  const definitionsMap = new Map<string, Definition>();

  const collect = (parent: Parent): void => {
    for (let index = 0; index < parent.children.length; index++) {
      const child = parent.children[index];

      if (child.type === 'footnoteReference') {
        footnoteReferences.push(child);
      } else if (child.type === 'footnoteDefinition') {
        footnoteDefinitions.push(child);
        footnoteDefinitionsMap.set(child.identifier, child);

        parent.children.splice(index, 1);
        index--;
        continue;
      } else if (child.type === 'definition') {
        definitionsMap.set(child.identifier, child);

        parent.children.splice(index, 1);
        index--;
      }

      if ('children' in child) {
        collect(child as Parent);
      }
    }
  };

  collect(tree);

  // Footnotes are always numbered
  for (let index = 0; index < footnoteDefinitions.length; index++) {
    const footnoteDefinition = footnoteDefinitions[index];
    footnoteDefinition.label = `${index + 1}`;
  }

  // updated all references
  for (const reference of footnoteReferences) {
    const footnoteDefinition = footnoteDefinitionsMap.get(reference.identifier);
    if (footnoteDefinition) {
      reference.label = footnoteDefinition.label;
    }
  }

  const root: SiMarkdownRoot = {
    ...tree,
    references: {
      footnoteDefinitions: footnoteDefinitionsMap,
      definitions: definitionsMap
    }
  };

  if (footnoteDefinitions.length) {
    root.children.push({ type: 'footnotes', children: footnoteDefinitions });
  }
  return root;
};
