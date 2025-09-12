/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { CdkMenuTrigger } from '@angular/cdk/menu';
import { Component, computed, input, output } from '@angular/core';
import { SiIconComponent } from '@siemens/element-ng/icon';
import { SiLoadingSpinnerComponent } from '@siemens/element-ng/loading-spinner';
import { SiMenuDirective, SiMenuItemComponent } from '@siemens/element-ng/menu';
import { SiResponsiveContainerDirective } from '@siemens/element-ng/resize-observer';
import { SiTranslatePipe, TranslatableString, t } from '@siemens/element-translate-ng/translate';

import { SiMarkdownContentComponent } from './si-markdown-content.component';

export interface AiMessageAction {
  /** Unique identifier for the action */
  id: string;
  /** Label for accessibility */
  label: TranslatableString;
  /** Icon name for the action button */
  icon: string;
  /** Whether the action is disabled */
  disabled?: boolean;
  /** Function called when action is triggered */
  action: (messageId?: string) => void;
}

@Component({
  selector: 'si-ai-message',
  imports: [
    SiIconComponent,
    SiLoadingSpinnerComponent,
    SiMenuDirective,
    SiMenuItemComponent,
    CdkMenuTrigger,
    SiResponsiveContainerDirective,
    SiTranslatePipe,
    SiMarkdownContentComponent
  ],
  templateUrl: './si-ai-message.component.html',
  styleUrl: './si-ai-message.component.scss',
  host: {
    class: 'si-ai-message',
    '[class.si-ai-message--loading]': 'loading()',
    '[class.si-ai-message--has-actions]': 'hasActions()'
  }
})
export class SiAiMessageComponent {
  /**
   * Unique identifier for this message
   */
  readonly messageId = input<string>();

  /**
   * The AI-generated message content
   * @defaultValue ''
   */
  readonly content = input<string>('');

  /**
   * Whether the message is currently being generated
   * @defaultValue false
   */
  readonly loading = input(false);

  /**
   * Primary actions available for this message (thumbs up/down, copy, retry, etc.)
   * All actions displayed inline
   * @defaultValue []
   */
  readonly actions = input<AiMessageAction[]>([]);

  /**
   * Secondary actions available in dropdown menu
   * @defaultValue []
   */
  readonly secondaryActions = input<AiMessageAction[]>([]);

  /**
   * Whether to show the AI icon
   * @defaultValue true
   */
  readonly showIcon = input(true);

  /**
   * Custom AI icon name
   * @defaultValue 'element-ai'
   */
  readonly aiIcon = input('element-ai');

  /**
   * Alt text for AI icon
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_AI_MESSAGE.AI_ASSISTANT:AI Assistant`)
   * ```
   */
  readonly aiIconAltText = input(t(() => $localize`:@@SI_AI_MESSAGE.AI_ASSISTANT:AI Assistant`));

  /**
   * Additional CSS classes for the message container
   * @defaultValue ''
   */
  readonly messageClass = input<string>('');

  /**
   * Loading indicator aria label text
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_AI_MESSAGE.LOADING:Loading`)
   * ```
   */
  readonly loadingAriaLabel = input(t(() => $localize`:@@SI_AI_MESSAGE.LOADING:Loading`));

  /**
   * Loading status text shown to user
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_AI_MESSAGE.AI_THINKING:AI is thinking...`)
   * ```
   */
  readonly loadingText = input(t(() => $localize`:@@SI_AI_MESSAGE.AI_THINKING:AI is thinking...`));

  /**
   * More actions button aria label
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_AI_MESSAGE.MORE_ACTIONS:More actions`)
   * ```
   */
  readonly moreActionsLabel = input(t(() => $localize`:@@SI_AI_MESSAGE.MORE_ACTIONS:More actions`));

  /**
   * Emitted when an action is clicked
   */
  readonly actionClick = output<AiMessageAction>();

  protected readonly hasActions = computed(() => this.actions().length > 0);

  protected readonly hasSecondaryActions = computed(() => this.secondaryActions().length > 0);

  protected onActionClick(action: AiMessageAction): void {
    if (!action.disabled) {
      action.action(this.messageId());
      this.actionClick.emit(action);
    }
  }
}
