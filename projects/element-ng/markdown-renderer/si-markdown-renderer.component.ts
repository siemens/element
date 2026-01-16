/**
 * Copyright (c) Siemens 2016 - 2025
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
  readonly text = input<string>('');

  /**
   * Do not display the copy code button.
   * @defaultValue false
   */
  readonly disableCopyButton = input<boolean>(false);

  /**
   * Do not display the download CSV button for tables.
   * @defaultValue false
   */
  readonly disableDownloadButton = input<boolean>(false);

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

  /**
   * Label for the copy button.
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_MARKDOWN_RENDERER.COPY_CODE:Copy code`)
   * ```
   */
  readonly copyButtonLabel = input(t(() => $localize`:@@SI_MARKDOWN_RENDERER.COPY_CODE:Copy code`));

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
    const highlighterFn = this.syntaxHighlighter();
    const latexRendererFn = this.latexRenderer();

    const options: MarkdownRendererOptions | undefined = {
      copyCodeButton: !this.disableCopyButton() ? this.copyButtonLabel() : undefined,
      downloadTableButton: !this.disableDownloadButton() ? this.downloadButtonLabel() : undefined,
      syntaxHighlighter: highlighterFn,
      latexRenderer: latexRendererFn,
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
        const formattedNode = renderer(contentValue);
        containerEl.innerHTML = '';
        containerEl.appendChild(formattedNode);
      }
    });
  }
}
