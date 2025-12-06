/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, inject, NgZone } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import {
  SiUserMessageComponent,
  Attachment,
  MessageAction
} from '@siemens/element-ng/chat-messages';
import { getMarkdownRenderer } from '@siemens/element-ng/markdown-renderer';
import { injectSiTranslateService } from '@siemens/element-translate-ng/translate';
import { LOG_EVENT } from '@siemens/live-preview';
import hljs from 'highlight.js';

@Component({
  selector: 'app-sample',
  imports: [SiUserMessageComponent],
  templateUrl: './si-user-message.html'
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

  content = `Can you help me with this **code snippet**?

\`console.log('Hello World')\`

I'm getting an error when I run it.`;

  attachments: Attachment[] = [
    {
      name: 'error-log.txt'
    },
    {
      name: 'screenshot.png'
    }
  ];

  actions: MessageAction[] = [
    {
      label: 'Edit message',
      icon: 'element-edit',
      action: (messageId: string) => this.logEvent(`Edit message ${messageId}`)
    },
    {
      label: 'Copy message',
      icon: 'element-export',
      action: (messageId: string) => this.logEvent(`Copy message ${messageId}`)
    },
    {
      label: 'Delete message',
      icon: 'element-delete',
      action: (messageId: string) => this.logEvent(`Delete message ${messageId}`)
    }
  ];
}
