/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { CdkMenuTrigger } from '@angular/cdk/menu';
import { NgClass } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { SiIconComponent } from '@siemens/element-ng/icon';
import { SiMenuDirective, SiMenuItemComponent } from '@siemens/element-ng/menu';
import { SiResponsiveContainerDirective } from '@siemens/element-ng/resize-observer';
import { SiTranslatePipe, TranslatableString, t } from '@siemens/element-translate-ng/translate';

import { SiAttachmentListComponent, AttachmentItem } from './si-attachment-list.component';
import { SiMarkdownContentComponent } from './si-markdown-content.component';

export interface UserMessageAction {
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

export interface UserMessageAttachment {
  /** Unique identifier for the attachment */
  id: string;
  /** File name */
  name: string;
  /** File size in bytes */
  size?: number;
  /** MIME type */
  type?: string;
  /** Preview URL for images */
  previewUrl?: string;
  /** Whether there was an error with this attachment */
  hasError?: boolean;
  /** Error message if there was an error */
  errorMessage?: TranslatableString;
}

@Component({
  selector: 'si-user-message',
  imports: [
    NgClass,
    SiIconComponent,
    SiMenuDirective,
    SiMenuItemComponent,
    CdkMenuTrigger,
    SiResponsiveContainerDirective,
    SiTranslatePipe,
    SiMarkdownContentComponent,
    SiAttachmentListComponent
  ],
  templateUrl: './si-user-message.component.html',
  styleUrl: './si-user-message.component.scss',
  host: {
    class: 'si-user-message',
    '[class]': 'messageClass()'
  }
})
export class SiUserMessageComponent {
  /**
   * Unique identifier for this message
   */
  readonly messageId = input<string>();

  /**
   * The user message content
   * @defaultValue ''
   */
  readonly content = input<string>('');

  /**
   * List of attachments included with this message
   * @defaultValue []
   */
  readonly attachments = input<UserMessageAttachment[]>([]);

  /**
   * Actions available for this message (edit, delete, copy, etc.)
   * Actions are revealed on hover for desktop users, always visible on mobile
   * @defaultValue []
   */
  readonly actions = input<UserMessageAction[]>([]);

  /**
   * Additional CSS classes for the message container
   * @defaultValue ''
   */
  readonly messageClass = input<string>('');

  /**
   * Whether to show user avatar
   * @defaultValue false
   */
  readonly showAvatar = input(false);

  /**
   * User initials or name for avatar
   * @defaultValue 'U'
   */
  readonly userInitials = input('U');

  /**
   * Alt text for user avatar
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_USER_MESSAGE.USER_AVATAR:User`)
   * ```
   */
  readonly userAvatarAltText = input(t(() => $localize`:@@SI_USER_MESSAGE.USER_AVATAR:User`));

  /**
   * Aria label for message actions button
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_USER_MESSAGE.MESSAGE_ACTIONS:Message actions`)
   * ```
   */
  readonly messageActionsLabel = input(
    t(() => $localize`:@@SI_USER_MESSAGE.MESSAGE_ACTIONS:Message actions`)
  );

  /**
   * Maximum actions to show inline before overflow
   * @defaultValue 2
   */
  readonly maxInlineActions = input(2);

  /**
   * Emitted when an action is clicked
   */
  readonly actionClick = output<UserMessageAction>();

  /**
   * Emitted when an attachment is clicked
   */
  readonly attachmentClick = output<UserMessageAttachment>();

  protected readonly hasActions = computed(() => this.actions().length > 0);

  protected readonly hasAttachments = computed(() => this.attachments().length > 0);

  protected readonly mappedAttachments = computed(() =>
    this.attachments().map(
      (attachment): AttachmentItem => ({
        id: attachment.id,
        name: attachment.name,
        size: attachment.size,
        type: attachment.type,
        previewUrl: attachment.previewUrl
      })
    )
  );

  protected onActionClick(action: UserMessageAction): void {
    if (!action.disabled) {
      action.action(this.messageId());
      this.actionClick.emit(action);
    }
  }
}
