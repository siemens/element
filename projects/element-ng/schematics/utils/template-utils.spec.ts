/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */

import ts from 'typescript';

import { getComponentTemplates, getInlineTemplates, getTemplateUrl } from './template-utils.js';

describe('component template discovery', () => {
  it('associates inline and external templates with their owning classes', () => {
    const source = ts.createSourceFile(
      'components.ts',
      `@Component({ template: '<first />' })
class First {}
@Component({ templateUrl: './second.html' })
class Second {}
@Component({ template: \`<third />\` })
class Third {}`,
      ts.ScriptTarget.Latest,
      true
    );
    const components = source.statements.filter(ts.isClassDeclaration);
    const templates = getComponentTemplates(source);

    expect(templates).toHaveLength(3);
    expect(templates[0].component).toBe(components[0]);
    expect(templates[1]).toMatchObject({
      component: components[1],
      kind: 'external',
      url: './second.html'
    });
    expect(templates[2].component).toBe(components[2]);
    expect(getInlineTemplates(source).map(node => node.text)).toEqual(['<first />', '<third />']);
    expect(getTemplateUrl(source)).toEqual(['./second.html']);
  });

  it('retains both owners of a shared external template', () => {
    const source = ts.createSourceFile(
      'shared.ts',
      `@Component({ templateUrl: './shared.html' })
class First {}
@Component({ templateUrl: './shared.html' })
class Second {}`,
      ts.ScriptTarget.Latest,
      true
    );

    const templates = getComponentTemplates(source);

    expect(templates.map(template => template.component.name?.text)).toEqual(['First', 'Second']);
    expect(getTemplateUrl(source)).toEqual(['./shared.html', './shared.html']);
  });

  it('ignores other decorators and non-literal or missing metadata', () => {
    const source = ts.createSourceFile(
      'ignored.ts',
      `@Directive({ template: '<ignored />' })
class DirectiveClass {}
@Component()
class MissingMetadata {}
@Component(metadata)
class DynamicMetadata {}
@Component({ template: template, templateUrl: url })
class DynamicTemplate {}`,
      ts.ScriptTarget.Latest,
      true
    );

    expect(getComponentTemplates(source)).toEqual([]);
  });
});
