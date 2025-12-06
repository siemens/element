/**
 * Copyright (c) Siemens 2016 - 2026
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
    copyCodeButton: 'SI_MARKDOWN_RENDERER.COPY',
    downloadTableButton: 'SI_MARKDOWN_RENDERER.DOWNLOAD',
    translateSync: this.translate.translateSync.bind(this.translate)
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
