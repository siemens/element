/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Component, computed, effect, inject, input, ElementRef, PLATFORM_ID } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { getMarkdownRenderer, type MarkdownRendererOptions } from './markdown-renderer';

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

  /**
   * Optional syntax highlighter function for code blocks.
   * Receives code content and optional language, returns an HTML content string to display inside of the code block or undefined to use default rendering.
   * The returned code is sanitized before insertion.
   * Make sure that the required styles/scripts for the syntax highlighter are included in your application.
   * @defaultValue undefined
   */
  readonly syntaxHighlighter = input<
    ((code: string, language?: string) => string | undefined) | undefined
  >(undefined);

  private readonly markdownRenderer = computed(() => {
    const highlighterFn = this.syntaxHighlighter();

    const options: MarkdownRendererOptions = {
      syntaxHighlighter: highlighterFn
    };

    return getMarkdownRenderer(this.sanitizer, options, this.doc, this.isBrowser);
  });

  constructor() {
    effect(() => {
      const contentValue = this.text();
      const containerEl = this.hostElement.nativeElement;
      const renderer = this.markdownRenderer();

      if (containerEl) {
        const formattedNode = renderer(contentValue ?? '');
        containerEl.innerHTML = '';
        containerEl.appendChild(formattedNode);
      }
    });
  }
}
