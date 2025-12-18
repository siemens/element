/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, effect, inject, input, ElementRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { getMarkdownRenderer } from './markdown-renderer';

/**
 * Component to display markdown text, uses the {@link getMarkdownRenderer} function internally, relies on `markdown-content` theme class.
 * @experimental
 */
@Component({
  selector: 'si-markdown-renderer',
  template: ``
})
export class SiMarkdownRendererComponent {
  private sanitizer = inject(DomSanitizer);
  private hostElement = inject(ElementRef<HTMLElement>);
  private markdownRenderer = getMarkdownRenderer(this.sanitizer);

  /**
   * The markdown text to transform and display
   * @defaultValue ''
   */
  readonly text = input<string>('');

  constructor() {
    effect(() => {
      const contentValue = this.text();
      const containerEl = this.hostElement.nativeElement;

      if (containerEl) {
        const formattedNode = this.markdownRenderer(contentValue);
        containerEl.innerHTML = '';
        containerEl.appendChild(formattedNode);
      }
    });
  }
}
