/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Component, effect, inject, input, ElementRef, PLATFORM_ID } from '@angular/core';
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
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private doc = inject(DOCUMENT);

  /**
   * The markdown text to transform and display
   * @defaultValue ''
   */
  readonly text = input<string | undefined>();

  private markdownRenderer = getMarkdownRenderer(
    this.sanitizer,
    undefined,
    this.doc,
    this.isBrowser
  );

  constructor() {
    effect(() => {
      const contentValue = this.text();
      const containerEl = this.hostElement.nativeElement;

      if (containerEl) {
        const formattedNode = this.markdownRenderer(contentValue ?? '');
        containerEl.innerHTML = '';
        containerEl.appendChild(formattedNode);
      }
    });
  }
}
