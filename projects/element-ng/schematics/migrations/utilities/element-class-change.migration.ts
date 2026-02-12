/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { Tree, UpdateRecorder } from '@angular-devkit/schematics';
import { dirname, join } from 'path/posix';
import ts from 'typescript';

import { findElement, getInlineTemplates, getTemplateUrl } from '../../utils/index.js';
import { ElementClassChangeInstruction } from '../data/index.js';
import { MigrationContext } from './migration.interface.js';

export const applyElementClassMigration = (
  context: MigrationContext,
  changes: ElementClassChangeInstruction[]
): void => {
  const { tree, discoveredSourceFile, recorder } = context;

  if (!changes?.length) {
    return;
  }

  const { sourceFile, path: filePath } = discoveredSourceFile;

  migrateElementClasses({
    tree,
    recorder,
    sourceFile,
    filePath,
    changes
  });
};

const migrateElementClasses = ({
  tree,
  filePath,
  sourceFile,
  recorder,
  changes
}: {
  tree: Tree;
  filePath: string;
  sourceFile: ts.SourceFile;
  recorder: UpdateRecorder;
  changes: ElementClassChangeInstruction[];
}): void => {
  // Process inline templates
  getInlineTemplates(sourceFile).forEach(template =>
    processElementClassesInTemplate({
      template: sourceFile.text.substring(template.getStart() + 1, template.getEnd() - 1),
      offset: template.getStart() + 1,
      recorder,
      changes
    })
  );

  // Process external templates
  getTemplateUrl(sourceFile).forEach(templateUrl => {
    const templatePath = join(dirname(filePath), templateUrl);
    const templateBuffer = tree.read(templatePath);
    if (templateBuffer) {
      const templateRecorder = tree.beginUpdate(templatePath);
      const templateContent = templateBuffer.toString('utf-8');
      processElementClassesInTemplate({
        template: templateContent,
        offset: 0,
        recorder: templateRecorder,
        changes
      });
      tree.commitUpdate(templateRecorder);
    }
  });
};

const processElementClassesInTemplate = ({
  template,
  offset,
  recorder,
  changes
}: {
  template: string;
  offset: number;
  recorder: UpdateRecorder;
  changes: ElementClassChangeInstruction[];
}): void => {
  findElement(template, () => true).forEach(el => {
    const classAttr = el.attrs.find(attr => attr.name === 'class');
    if (!classAttr) {
      return;
    }

    const originalClasses = classAttr.value.split(/\s+/).filter(Boolean);
    const removeSet = new Set<string>();
    const addList: string[] = [];

    changes.forEach(change => {
      const { addClasses, removeClasses, requiredClasses, excludedClasses } = change;

      const hasAllRequiredClasses = requiredClasses.every(reqClass =>
        originalClasses.includes(reqClass)
      );
      if (!hasAllRequiredClasses) {
        return;
      }

      if (excludedClasses?.length) {
        const hasExcludedClass = excludedClasses.some(excludedClass =>
          originalClasses.includes(excludedClass)
        );
        if (hasExcludedClass) {
          return;
        }
      }

      removeClasses.forEach(cls => removeSet.add(cls));
      addClasses.forEach(cls => {
        if (!addList.includes(cls)) {
          addList.push(cls);
        }
      });
    });

    if (!removeSet.size && !addList.length) {
      return;
    }

    const updatedClasses = originalClasses.filter(cls => !removeSet.has(cls));
    addList.forEach(newClass => {
      if (!updatedClasses.includes(newClass)) {
        updatedClasses.push(newClass);
      }
    });

    const originalClassString = originalClasses.join(' ');
    const newClassString = updatedClasses.join(' ');

    if (originalClassString !== newClassString) {
      const valueStart = classAttr.valueSpan?.start.offset;
      const valueEnd = classAttr.valueSpan?.end.offset;

      if (valueStart === undefined || valueEnd === undefined) {
        return;
      }

      const length = valueEnd - valueStart;
      recorder.remove(valueStart + offset, length);
      recorder.insertLeft(valueStart + offset, newClassString);
    }
  });
};
