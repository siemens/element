/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { Attribute } from '@angular/compiler';

import { discoverSourceFiles, findClassDecorators, findElement, getTemplate } from '../utils';

interface Replacement {
  file: string;
  start: number;
  source: string;
  replacement: string;
}

const SIZE_ATTRIBUTES = ['size', '[size]'];
const CLASS_ATTRIBUTES_1 = ['color', '[color]', ...SIZE_ATTRIBUTES];

export const iconMigrationRule = (): Rule => {
  return (tree: Tree, context: SchematicContext) => {
    const rules: Rule[] = [];
    context.logger.info('📦 Migrating icon templates...');
    const sourceFiles = discoverSourceFiles(tree, context);

    const replacements: Replacement[] = [];
    for (const decorator of findClassDecorators(sourceFiles, 'Component', tree)) {
      const template = getTemplate(tree, decorator);

      if (template) {
        const elements = findElement(template.text, n => {
          return n.name === 'si-icon';
        });

        for (const element of elements) {
          const attributes = new Map<string, string>();
          for (const attr of element.attrs) {
            attributes.set(attr.name, attr.value);
          }

          // Save control flow attributes like *ngIf and *ngSwitchCase to reapply them at the beginning
          const controlFlowAttributes = buildControlFlowAttributes(element.attrs);
          // Separate attributes without value (like disabled)
          const emptyAttributes = buildPureAttributes(element.attrs);
          // Gather all other attributes except the known ones to reapply them at the end
          const additionalAttributes = buildAdditionalAttributes(element.attrs);
          // Gather icon attribute (can be a binding [icon])
          const iconAttribute = element.attrs
            .filter(a => a.name === 'icon' || a.name === '[icon]')
            .map(a => `${a.name}="${a.value}"`)
            .join('');
          // Gather stackedIcon attribute (can be a binding [stackedIcon])
          const stackedIconAttribute = element.attrs
            .filter(a => a.name === 'stackedIcon' || a.name === '[stackedIcon]')
            .map(a => `${a.name.replace('stackedIcon', 'icon')}="${a.value}"`)
            .join('');

          let replacement: string | null = null;
          if (stackedIconAttribute || attributes.get('stackedColor')) {
            const iconClasses = [
              `${attributes.get('class') ?? ''}`,
              `${attributes.get('size') ?? 'icon'}`
            ].filter(i => i.length > 0);
            replacement = [
              `<span ${controlFlowAttributes}${emptyAttributes}class="${iconClasses.join(' ')} icon-stack"${additionalAttributes}>`,
              `  <si-icon class="${attributes.get('color')}" ${iconAttribute} />`,
              `  <si-icon class="${attributes.get('stackedColor') ?? ''}" ${stackedIconAttribute} />`,
              `</span>`
            ].join('\n');
          } else if (
            element.attrs.some(a => CLASS_ATTRIBUTES_1.includes(a.name)) ||
            !element.attrs.some(a => SIZE_ATTRIBUTES.includes(a.name))
          ) {
            // Scenario: Either the si-icon contain at least one of the removed attributes or it used the default size
            const mergeAttributes = element.attrs.filter(a => CLASS_ATTRIBUTES_1.includes(a.name));
            const classAttribute = buildClassAttribute(
              mergeAttributes,
              element.attrs.find(a => a.name === 'class' || a.name === '[class]')
            );

            replacement = `<si-icon ${controlFlowAttributes}${emptyAttributes}${classAttribute} ${iconAttribute}${additionalAttributes} />`;
          }

          if (replacement) {
            replacements.push({
              file: template.filePath,
              start: template?.offset + element.startSourceSpan.start.offset,
              source: element.sourceSpan.toString(),
              replacement
            });
          }
        }
      }
    }
    for (const replacement of replacements) {
      rules.push(applyReplacement(replacement));
    }
    return chain([...rules]);
  };
};

const applyReplacement = (replacement: Replacement): Rule => {
  return (tree: Tree): Tree => {
    const recorder = tree.beginUpdate(replacement.file);
    const content = tree.readText(replacement.file);
    if (content) {
      recorder.remove(replacement.start, replacement.source.length);
      recorder.insertLeft(replacement.start, replacement.replacement);
    }
    tree.commitUpdate(recorder);
    return tree;
  };
};

/**
 * Build a string with all attributes which are not processed by the migration to reapply them at the end of the element.
 */
const buildAdditionalAttributes = (attributes: Attribute[]): string => {
  const additionalAttributes = attributes
    .filter(a => isAdditionalAttribute(a))
    .map(a => `${a.name}="${a.value}"`)
    .join(' ');

  return additionalAttributes.length > 0 ? ` ${additionalAttributes}` : '';
};

/**
 * Build the class attribute value by merging existing class attribute with the attributes which should be move to the class.
 * If no size is specified, the default size 'icon' is added.
 * If any of the merged attributes is a binding, the whole class attribute is converted to a binding.
 */
const buildClassAttribute = (mergeAttributes: Attribute[], classAttribute?: Attribute): string => {
  let classes = [...(classAttribute?.value.split(' ') ?? [])];
  let requireClassBinding = false;
  let requireDefaultSize = true;
  for (const attribute of mergeAttributes) {
    if (isAttributeBinding(attribute)) {
      classes.push(`\${${attribute.value}}`);
      requireClassBinding = true;
    } else {
      classes.push(attribute.value);
    }
    if (['size', '[size]'].includes(attribute.name)) {
      requireDefaultSize = false;
    }
  }
  if (requireDefaultSize) {
    classes = ['icon', ...classes];
  }
  return requireClassBinding
    ? `[class]="\`${classes.join(' ')}\`"`
    : `class="${classes.join(' ')}"`;
};

/**
 * Build a string with all control flow attributes (like *ngIf and *ngSwitchCase) to reapply them at the beginning of the element.
 */
const buildControlFlowAttributes = (attributes: Attribute[]): string => {
  const controlFlowAttributes = attributes
    .filter(attribute => isControlFlowAttribute(attribute))
    .map(a => `${a.name}="${a.value}"`)
    .join(' ');
  return controlFlowAttributes.length > 0 ? `${controlFlowAttributes} ` : '';
};

/**
 * Build a string with all attributes which do not have a value (like disabled) to reapply them after the control flow attributes.
 */
const buildPureAttributes = (attributes: Attribute[]): string => {
  const emptyAttributes = attributes
    .filter(attribute => isPureAttribute(attribute))
    .map(a => a.name)
    .join(' ');
  return emptyAttributes.length > 0 ? `${emptyAttributes} ` : '';
};

const isAttributeBinding = (attribute: Attribute): boolean =>
  attribute.name.startsWith('[') && attribute.name.endsWith(']');

const isControlFlowAttribute = (attribute: Attribute): boolean => attribute.name.startsWith('*');

const isPureAttribute = (attribute: Attribute): boolean => !attribute.valueSpan;

const isAdditionalAttribute = (attribute: Attribute): boolean =>
  !isControlFlowAttribute(attribute) &&
  !isPureAttribute(attribute) &&
  ![
    'class',
    'color',
    '[color]',
    'icon',
    '[icon]',
    'size',
    '[size]',
    'stackedIcon',
    '[stackedIcon]',
    'stackedColor',
    '[stackedColor]'
  ].includes(attribute.name);
