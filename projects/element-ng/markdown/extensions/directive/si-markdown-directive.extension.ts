/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { type TypeHandler, type SiMarkdownExtension } from '../../si-markdown.types';
import { SiMarkdownDirectiveComponent } from './si-markdown-directive.component';

const directiveNodeTypes = ['containerDirective', 'leafDirective', 'textDirective'] as const;

/** Installs component rendering for directives parsed by `remark-directive`. */
export const siMarkdownDirective = (
  directives: ReadonlyMap<string, TypeHandler>
): SiMarkdownExtension => ({
  types: directiveNodeTypes.map(type => ({
    type,
    component: SiMarkdownDirectiveComponent,
    options: directives
  }))
});
