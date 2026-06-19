/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Component, computed, effect, inject, input, ElementRef, PLATFORM_ID } from '@angular/core';
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
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private doc = inject(DOCUMENT);

  /**
   * The markdown text to transform and display
   * @defaultValue ''
   */
  readonly text = input<string | undefined>();

  /**
   * Do not display the download CSV button for tables.
   * @defaultValue false
   */
  readonly disableDownloadButton = input<boolean>(false);

  /**
   * Label for the download CSV button.
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_MARKDOWN_RENDERER.DOWNLOAD:Download CSV`)
   * ```
   */
  readonly downloadButtonLabel = input(
    t(() => $localize`:@@SI_MARKDOWN_RENDERER.DOWNLOAD:Download CSV`)
  );

  private readonly markdownRenderer = computed(() => {
    const options: MarkdownRendererOptions = {
      downloadTableButton: !this.disableDownloadButton() ? this.downloadButtonLabel() : undefined,
      translateSync: this.translateService.translateSync.bind(this.translateService)
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
