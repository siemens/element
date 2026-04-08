/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, effect, inject, input, ElementRef } from '@angular/core';

import { type MarkdownRenderer } from './markdown-renderer';

/**
 * Component to display markdown text using a provided {@link MarkdownRenderer}.
 *
 * Pass a renderer created via {@link injectMarkdownRenderer} or injected via {@link SI_MARKDOWN_RENDERER}
 * through the `renderer` input. When no renderer is provided, falls back to displaying the raw unrendered text.
 *
 * @example
 * ```typescript
 * protected renderer = injectMarkdownRenderer();
 * ```
 * ```html
 * <si-markdown-renderer [text]="markdownText()" [renderer]="renderer" />
 * ```
 *
 * @experimental
 */
@Component({
  selector: 'si-markdown-renderer',
  template: ``
})
export class SiMarkdownRendererComponent {
  private hostElement = inject(ElementRef<HTMLElement>);

  /**
   * The markdown text to transform and display.
   * @defaultValue undefined
   */
  readonly text = input<string | undefined>();

  /**
   * The markdown renderer function to use for rendering.
   * Create one via {@link injectMarkdownRenderer} or inject via {@link SI_MARKDOWN_RENDERER}.
   * When not provided, the raw text is displayed without rendering.
   * @defaultValue undefined
   */
  readonly renderer = input<MarkdownRenderer | undefined>(undefined);

  constructor() {
    effect(() => {
      const contentValue = this.text();
      const renderer = this.renderer();
      const containerEl = this.hostElement.nativeElement;

      if (containerEl) {
        if (renderer) {
          const formattedNode = renderer(contentValue ?? '');
          containerEl.innerHTML = '';
          containerEl.appendChild(formattedNode);
        } else {
          containerEl.textContent = contentValue ?? '';
        }
      }
    });
  }
}
