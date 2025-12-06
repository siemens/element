/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
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
  templateUrl: './si-user-message.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);
  private sanitizer = inject(DomSanitizer);
  private translate = injectSiTranslateService();

  protected markdownRenderer = getMarkdownRenderer(this.sanitizer, {
    copyCodeButton: 'SI_MARKDOWN_RENDERER.COPY',
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
