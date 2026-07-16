/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Directive, TemplateRef, inject, input } from '@angular/core';

/** Directive used to mark a template as a node type for rendering. */
@Directive({
  selector: '[siMarkdownTemplate]'
})
export class SiMarkdownTemplateDirective {
  readonly template = inject<TemplateRef<any>>(TemplateRef);
  // this should be required, but in some transitional state in the templates computed, this fails
  /** @defaultValue '#dummy' */
  readonly nodeType = input<string>('#dummy', { alias: 'siMarkdownTemplate' });
}
