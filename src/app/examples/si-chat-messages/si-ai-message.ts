/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, inject, NgZone } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MessageAction, SiAiMessageComponent } from '@siemens/element-ng/chat-messages';
import { getMarkdownRenderer } from '@siemens/element-ng/markdown-renderer';
import { MenuItemAction } from '@siemens/element-ng/menu';
import { LOG_EVENT } from '@siemens/live-preview';
import hljs from 'highlight.js';
import { injectSiTranslateService } from 'projects/element-translate-ng/translate';

@Component({
  selector: 'app-sample',
  imports: [SiAiMessageComponent],
  templateUrl: './si-ai-message.html'
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);
  private sanitizer = inject(DomSanitizer);
  private translate = injectSiTranslateService();
  private readonly zone = inject(NgZone);

  protected markdownRenderer = getMarkdownRenderer(this.sanitizer, {
    copyCodeButton: 'Copy',
    downloadTableButton: 'Download CSV',
    translateSync: this.translate.translateSync.bind(this.translate),
    syntaxHighlighter: (code: string, language?: string): string => {
      // Optional: Syntax highlighting with highlight.js
      // This function returns classes for the code element. Libraries like highlight.js
      // can then be used to apply syntax highlighting based on these classes.
      // Call hljs.highlightAll() after rendering to activate highlighting.
      // Element provides a built-in theme that adapts to light/dark mode.
      // Alternatively, you can import a highlight.js theme in your global styles, e.g.:
      // @import 'highlight.js/styles/github-dark.css';
      if (language && hljs.getLanguage(language)) {
        this.zone.runOutsideAngular(() => setTimeout(() => hljs.highlightAll()));
        return `class="hljs language-${language}"`;
      }
      return 'class="hljs"';
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
