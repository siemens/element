/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Component, effect, inject, input, ElementRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { injectSiTranslateService, t } from '@siemens/element-translate-ng/translate';

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
  private translateService = injectSiTranslateService();

  /**
   * The markdown text to transform and display
   * @defaultValue ''
   */
  readonly text = input<string>('');

  /**
   * Do not display the copy code button.
   * @defaultValue false
   */
  readonly disableCopyButton = input<boolean>(false);

  /**
   * Label for the copy button.
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_MARKDOWN_RENDERER.COPY:Copy`)
   * ```
   */
  readonly copyButtonLabel = input(t(() => $localize`:@@SI_MARKDOWN_RENDERER.COPY:Copy`));

  constructor() {
    effect(() => {
      const contentValue = this.text();
      const containerEl = this.hostElement.nativeElement;

      const options: MarkdownRendererOptions | undefined = {
        copyCodeButton: !this.disableCopyButton() ? this.copyButtonLabel() : undefined,
        translateSync: this.translateService.translateSync.bind(this.translateService)
      };

      const markdownRenderer = getMarkdownRenderer(this.sanitizer, options);

      if (containerEl) {
        const formattedNode = markdownRenderer(contentValue);
        containerEl.innerHTML = '';
        containerEl.appendChild(formattedNode);
      }
    });
  }
}
