/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */

import { UpdateRecorder } from '@angular-devkit/schematics';
import { Element } from '@angular/compiler';
import { dirname, join } from 'path/posix';

import { findElement, getInlineTemplates, getTemplateUrl } from '../../utils/index.js';
import { ComponentPropertyToChildInstruction } from '../data/index.js';
import { MigrationContext } from './migration.interface.js';

export const applyComponentPropertyToChildMigration = (
  context: MigrationContext,
  changes: ComponentPropertyToChildInstruction[]
): void => {
  const { tree, discoveredSourceFile, recorder } = context;
  const { path, sourceFile } = discoveredSourceFile;

  for (const template of getInlineTemplates(sourceFile)) {
    migrateTemplate(
      sourceFile.text.substring(template.getStart() + 1, template.getEnd() - 1),
      template.getStart() + 1,
      recorder,
      changes
    );
  }

  for (const templateUrl of getTemplateUrl(sourceFile)) {
    const templatePath = join(dirname(path), templateUrl);
    if (!tree.exists(templatePath)) {
      continue;
    }

    const templateRecorder = tree.beginUpdate(templatePath);
    migrateTemplate(tree.read(templatePath)!.toString(), 0, templateRecorder, changes);
    tree.commitUpdate(templateRecorder);
  }
};

const migrateTemplate = (
  template: string,
  offset: number,
  recorder: UpdateRecorder,
  changes: ComponentPropertyToChildInstruction[]
): void => {
  for (const change of changes) {
    for (const parent of findElement(
      template,
      element => element.name === change.parentElementSelector
    )) {
      const property = parent.attrs.find(attribute =>
        [change.propertyName, `[${change.propertyName}]`, `bind-${change.propertyName}`].includes(
          attribute.name
        )
      );
      if (!property) {
        continue;
      }

      const propertyText = property.sourceSpan.toString();
      const child = parent.children.find(
        (node): node is Element =>
          node instanceof Element && node.name === change.childElementSelector
      );

      if (child) {
        const childHasProperty = child.attrs.some(attribute =>
          [change.propertyName, `[${change.propertyName}]`, `bind-${change.propertyName}`].includes(
            attribute.name
          )
        );
        if (!childHasProperty) {
          insertAttribute(template, child, propertyText, offset, recorder);
        }
        removeAttribute(
          template,
          property.sourceSpan.start.offset,
          property.sourceSpan.end.offset,
          offset,
          recorder
        );
      } else if (parent.startSourceSpan.toString().endsWith('/>')) {
        expandSelfClosingParent(template, parent, property, propertyText, offset, recorder, change);
      } else {
        removeAttribute(
          template,
          property.sourceSpan.start.offset,
          property.sourceSpan.end.offset,
          offset,
          recorder
        );
        recorder.insertLeft(
          parent.startSourceSpan.end.offset + offset,
          `<${change.childElementSelector} ${propertyText}></${change.childElementSelector}>`
        );
      }
    }
  }
};

const insertAttribute = (
  template: string,
  element: Element,
  attribute: string,
  offset: number,
  recorder: UpdateRecorder
): void => {
  const selfClosing = element.startSourceSpan.toString().endsWith('/>');
  const insertOffset = element.startSourceSpan.end.offset - (selfClosing ? 2 : 1);
  const prefix = /\s/.test(template[insertOffset - 1]) ? '' : ' ';
  recorder.insertLeft(insertOffset + offset, `${prefix}${attribute}${selfClosing ? ' ' : ''}`);
};

const removeAttribute = (
  template: string,
  start: number,
  end: number,
  offset: number,
  recorder: UpdateRecorder
): void => {
  const removeStart = start > 0 && /\s/.test(template[start - 1]) ? start - 1 : start;
  recorder.remove(removeStart + offset, end - removeStart);
};

const expandSelfClosingParent = (
  template: string,
  parent: Element,
  property: { sourceSpan: { start: { offset: number }; end: { offset: number } } },
  propertyText: string,
  offset: number,
  recorder: UpdateRecorder,
  change: ComponentPropertyToChildInstruction
): void => {
  const start = parent.startSourceSpan.start.offset;
  const end = parent.startSourceSpan.end.offset;
  const propertyStart =
    property.sourceSpan.start.offset > start &&
    /\s/.test(template[property.sourceSpan.start.offset - 1])
      ? property.sourceSpan.start.offset - 1
      : property.sourceSpan.start.offset;
  const startTag = template.substring(start, end);
  const withoutProperty =
    startTag.substring(0, propertyStart - start) +
    startTag.substring(property.sourceSpan.end.offset - start);
  const replacement = withoutProperty.replace(
    /\s*\/>$/,
    `><${change.childElementSelector} ${propertyText}></${change.childElementSelector}></${change.parentElementSelector}>`
  );

  recorder.remove(start + offset, end - start);
  recorder.insertLeft(start + offset, replacement);
};
