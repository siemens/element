/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, computed, inject, input, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { type Parent, type Literal, type Node } from 'mdast';

import { SiMarkdownExtensionComponent } from '../../si-markdown.types';

@Component({
  selector: 'si-markdown-inline-html',
  template: '',
  host: {
    '[innerHTML]': 'sanitized()'
  }
})
export class SiMarkdownInlineHtmlComponent implements SiMarkdownExtensionComponent {
  private readonly sanitizer = inject(DomSanitizer);
  readonly node = input.required<Node>();
  readonly parent = input.required<Parent>();
  readonly options = input<any>();
  private readonly html = computed(() => (this.node() as Literal).value);

  protected readonly sanitized = computed(() => {
    const html = this.html();
    // because those are very common
    if (html === '<br>' || html === '<hr>') {
      return this.sanitizer.bypassSecurityTrustHtml(html);
    }
    return this.sanitizer.sanitize(SecurityContext.HTML, html);
  });
}
