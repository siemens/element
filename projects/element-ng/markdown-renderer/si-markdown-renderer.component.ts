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
   * Optional LaTeX renderer function for math expressions.
   * Receives LaTeX content and display mode boolean, returns an HTML content string or undefined to use default rendering.
   * The returned HTML is sanitized before insertion.
   * Make sure that the required styles/scripts for the LaTeX renderer (e.g., KaTeX) are included in your application.
   * @defaultValue undefined
   */
  readonly latexRenderer = input<
    ((latex: string, displayMode: boolean) => string | undefined) | undefined
  >(undefined);

  private readonly markdownRenderer = computed(() => {
    const latexRendererFn = this.latexRenderer();

    const options: MarkdownRendererOptions = {
      latexRenderer: latexRendererFn
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
