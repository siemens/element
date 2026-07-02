/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { CdkMenuTrigger } from '@angular/cdk/menu';
import {
  booleanAttribute,
  Component,
  effect,
  input,
  viewChild,
  ElementRef,
  signal,
  ChangeDetectionStrategy
} from '@angular/core';
import { elementOptionsVertical } from '@siemens/element-icons';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { MenuItem, SiMenuFactoryComponent } from '@siemens/element-ng/menu';
import { SiTranslatePipe, t } from '@siemens/element-translate-ng/translate';

import { MessageAction } from './message-action.model';
import { SiChatMessageActionDirective } from './si-chat-message-action.directive';
import { SiChatMessageComponent } from './si-chat-message.component';

/**
 * AI message component for displaying AI-generated responses in conversational interfaces.
 *
 * The AI message component renders AI-generated content in chat interfaces,
 * supporting text formatting, markdown, loading states, and contextual actions.
 * It appears as text (no bubble) aligned to the left side without any avatar/icon slot.
 * Can be used within {@link SiChatContainerComponent}.
 *
 * The component automatically handles:
 * - Styling for AI messages distinct from user or generic chat messages
 * - Option to render markdown content, provide via `contentFormatter` input with a markdown renderer function (e.g., from {@link getMarkdownRenderer})
 * - Showing loading states with skeleton UI during generation
 * - Displaying primary and secondary actions
 *
 * @see {@link SiChatMessageComponent} for the base message wrapper component
 * @see {@link SiUserMessageComponent} for the user message component
 * @see {@link getMarkdownRenderer} for markdown formatting support
 * @see {@link SiChatContainerComponent} for the chat container to use this within
 *
 * @experimental
 */
@Component({
  selector: 'si-ai-message',
  imports: [
    CdkMenuTrigger,
    SiChatMessageComponent,
    SiIconComponent,
    SiMenuFactoryComponent,
    SiChatMessageActionDirective,
    SiTranslatePipe
  ],
  templateUrl: './si-ai-message.component.html',
  styleUrl: './si-ai-message.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiAiMessageComponent {
  protected readonly formattedContent = viewChild<ElementRef<HTMLDivElement>>('formattedContent');
  protected readonly inlineContent = viewChild<ElementRef<HTMLElement>>('inlineContent');
  protected readonly icons = addIcons({ elementOptionsVertical });

  private inlineNodes: Node[] = [];
  private chipSpacer: HTMLElement | null = null;

  /**
   * The AI-generated message content
   * @defaultValue ''
   */
  readonly content = input<string>('');

  /**
   * Optional formatter function to transform content before display.
   * - Returns string: Content will be sanitized using Angular's DomSanitizer
   * - Returns Node: DOM node will be inserted directly without sanitization
   *
   * **Note:** If using a markdown renderer, make sure to apply the `markdown-content` class
   * to the root element to ensure proper styling using the Element theme (e.g., `div.className = 'markdown-content'`).
   * The function returned by {@link getMarkdownRenderer} does this automatically.
   *
   * **Warning:** When returning a Node, ensure the content is safe to prevent XSS attacks
   * @defaultValue undefined
   */
  readonly contentFormatter = input<((text: string) => string | Node) | undefined>(undefined);

  protected readonly textContent = signal<string | undefined>(undefined);

  constructor() {
    effect(() => {
      const formatter = this.contentFormatter();
      const contentValue = this.content();
      const container = this.formattedContent()?.nativeElement;
      const inlineEl = this.inlineContent()?.nativeElement;

      // Move inline chips back to their staging span before any innerHTML clear,
      // so they survive the DOM reset regardless of where they currently live.
      if (inlineEl && this.inlineNodes.length > 0) {
        this.chipSpacer?.remove();
        this.inlineNodes.forEach(node => {
          if (node.parentNode !== inlineEl) {
            inlineEl.appendChild(node);
          }
        });
      }

      if (container && contentValue) {
        if (formatter) {
          const formatted = formatter(contentValue);

          if (typeof formatted === 'string') {
            this.textContent.set(formatted);
          } else if (formatted instanceof Node) {
            this.textContent.set(undefined);
            container.innerHTML = '';
            container.appendChild(formatted);

            if (inlineEl) {
              // Collect projected element nodes on the first Node render.
              if (this.inlineNodes.length === 0) {
                this.inlineNodes = Array.from(inlineEl.childNodes).filter(
                  n => n.nodeType === Node.ELEMENT_NODE
                );
              }
              // Move chips to the end of the last paragraph in the rendered content.
              if (this.inlineNodes.length > 0) {
                const allPs = container.querySelectorAll('p');
                const target = allPs.length > 0 ? allPs[allPs.length - 1] : container;
                // Prepend a 6px inline-block spacer. Because it is a separate DOM node it
                // stays on the previous line when the chip wraps, so the chip starts at
                // position 0 rather than carrying a 6px indent onto the new line.
                if (!this.chipSpacer) {
                  const spacer = document.createElement('span');
                  spacer.style.cssText = 'display:inline-block;width:6px';
                  spacer.setAttribute('aria-hidden', 'true');
                  this.chipSpacer = spacer;
                }
                target.appendChild(this.chipSpacer);
                this.inlineNodes.forEach(node => target.appendChild(node));
              }
            }
          }
        } else {
          this.textContent.set(contentValue);
        }
      }
    });
  }

  /**
   * Whether the message is currently being generated (shows skeleton)
   * @defaultValue false
   */
  readonly loading = input(false, { transform: booleanAttribute });

  /**
   * Primary actions available for this message (thumbs up/down, copy, retry, etc.)
   * All actions displayed inline
   * @defaultValue []
   */
  readonly actions = input<MessageAction[]>([]);

  /**
   * Secondary actions available in dropdown menu, first use primary actions and only add secondary actions additionally
   * @defaultValue []
   */
  readonly secondaryActions = input<MenuItem[]>([]);

  /** Parameter to pass to action handlers */
  readonly actionParam = input();

  /**
   * More actions button aria label
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_AI_MESSAGE.SECONDARY_ACTIONS:More actions`)
   * ```
   */
  readonly secondaryActionsLabel = input(
    t(() => $localize`:@@SI_AI_MESSAGE.SECONDARY_ACTIONS:More actions`)
  );
}
