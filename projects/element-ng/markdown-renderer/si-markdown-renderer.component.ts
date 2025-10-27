/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, ElementRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { getMarkdownRenderer } from './markdown-renderer';

/**
 * Component to display markdown text, uses the {@link getMarkdownRenderer} function internally, relies on theme .markdown-renderer styles.
 * @experimental
 */
@Component({
  selector: 'si-markdown-renderer',
  imports: [CommonModule],
  template: ``
})
export class SiMarkdownRendererComponent {
  private sanitizer = inject(DomSanitizer);
  private hostElement = inject(ElementRef<HTMLElement>);
  private markdownFormatter = getMarkdownRenderer(this.sanitizer);

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
        const formattedNode = this.markdownFormatter(contentValue);
        containerEl.innerHTML = '';
        containerEl.appendChild(formattedNode);
      }
    });
  }
}
