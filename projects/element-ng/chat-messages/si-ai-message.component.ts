/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { CdkMenuTrigger } from '@angular/cdk/menu';
import { booleanAttribute, Component, input, output } from '@angular/core';
import { elementOptionsVertical } from '@siemens/element-icons';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { MenuItem, SiMenuFactoryComponent } from '@siemens/element-ng/menu';
import { SourceReference, SiSourceChipComponent } from '@siemens/element-ng/source-chip';
import { SiTranslatePipe, t } from '@siemens/element-translate-ng/translate';

import { MessageAction } from './message-action.model';
import { SiChatMessageActionDirective } from './si-chat-message-action.directive';
import { SiChatMessageComponent } from './si-chat-message.component';

/**
 * AI message component for displaying AI-generated responses in conversational interfaces.
 *
 * The AI message component renders AI-generated content in chat interfaces,
 * supporting text, loading states, and contextual actions.
 * It appears as text (no bubble) aligned to the left side without any avatar/icon slot.
 * Can be used within {@link SiChatContainerComponent}.
 *
 * The component automatically handles:
 * - Styling for AI messages distinct from user or generic chat messages
 * - Showing loading states with skeleton UI during generation
 * - Displaying primary and secondary actions
 *
 * @see {@link SiChatMessageComponent} for the base message wrapper component
 * @see {@link SiUserMessageComponent} for the user message component
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
    SiTranslatePipe,
    SiSourceChipComponent
  ],
  templateUrl: './si-ai-message.component.html',
  styleUrl: './si-ai-message.component.scss'
})
export class SiAiMessageComponent {
  protected readonly icons = addIcons({ elementOptionsVertical });

  /**
   * The AI-generated message content
   * @defaultValue ''
   */
  readonly content = input<string>('');

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

  /** Source references */
  readonly sources = input<SourceReference[]>();

  /**
   * More actions button aria label
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_AI_MESSAGE.SECONDARY_ACTIONS:Additional actions`)
   * ```
   */
  readonly secondaryActionsLabel = input(
    t(() => $localize`:@@SI_AI_MESSAGE.SECONDARY_ACTIONS:Additional actions`)
  );

  /** Emitted when a source has been clicked. */
  readonly sourceClicked = output<SourceReference>();
}
