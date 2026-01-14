/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MessageAction, SiAiMessageComponent } from '@siemens/element-ng/chat-messages';
import { getMarkdownRenderer } from '@siemens/element-ng/markdown-renderer';
import { MenuItemAction } from '@siemens/element-ng/menu';
import { injectSiTranslateService } from '@siemens/element-translate-ng/translate';
import { LOG_EVENT } from '@siemens/live-preview';
import hljs from 'highlight.js';
import katex from 'katex';

@Component({
  selector: 'app-sample',
  imports: [SiAiMessageComponent],
  templateUrl: './si-ai-message.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);
  private sanitizer = inject(DomSanitizer);
  private translate = injectSiTranslateService();

  protected markdownRenderer = getMarkdownRenderer(this.sanitizer, {
    copyCodeButton: 'SI_MARKDOWN_RENDERER.COPY_CODE',
    downloadTableButton: 'SI_MARKDOWN_RENDERER.DOWNLOAD',
    translateSync: this.translate.translateSync.bind(this.translate),
    // Optional: Syntax highlighting with highlight.js
    // This function returns highlighted HTML markup for the code content.
    // The returned HTML is sanitized before insertion.
    // Element provides a built-in highlight.js theme that adapts to light/dark mode.
    // Make sure to include highlight.js as a dependency.
    syntaxHighlighter: (code: string, language?: string): string | undefined => {
      if (language && hljs.getLanguage(language)) {
        try {
          return hljs.highlight(code, { language }).value;
        } catch {
          // If highlighting fails, fall back to no highlighting
        }
      }
      return undefined;
    },
    // Optional: LaTeX rendering with KaTeX
    // This function returns rendered HTML for LaTeX math expressions.
    // The returned HTML is sanitized before insertion.
    // Make sure to include KaTeX styles in your application.
    // Add to styles in angular.json: "node_modules/katex/dist/katex.min.css"
    latexRenderer: (latex: string, displayMode: boolean): string | undefined => {
      try {
        return katex.renderToString(latex, {
          displayMode,
          throwOnError: false,
          output: 'html'
        });
      } catch {
        return undefined;
      }
    }
  });

  content = `Here's a **simple response** with basic formatting.

You can use \`inline code\` and create lists:

- First item
- Second item`;

  actions: MessageAction[] = [
    {
      label: 'Good response',
      icon: 'element-plus',
      action: (messageId: string) => this.logEvent(`Thumbs up for message ${messageId}`)
    },
    {
      label: 'Copy response',
      icon: 'element-export',
      action: (messageId: string) => this.logEvent(`Copy message ${messageId}`)
    },
    {
      label: 'Retry response',
      icon: 'element-refresh',
      action: (messageId: string) => this.logEvent(`Retry message ${messageId}`)
    }
  ];

  secondaryActions: MenuItemAction[] = [
    {
      type: 'action',
      label: 'Bookmark',
      icon: 'element-bookmark',
      action: (messageId: string) => this.logEvent(`Bookmark message ${messageId}`)
    },
    {
      type: 'action',
      label: 'Share',
      icon: 'element-share',
      action: (messageId: string) => this.logEvent(`Share message ${messageId}`)
    }
  ];
}
