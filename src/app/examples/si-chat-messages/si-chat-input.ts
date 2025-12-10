/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  SiChatInputComponent,
  MessageAction,
  ChatInputAttachment
} from '@siemens/element-ng/chat-messages';
import { FileUploadError } from '@siemens/element-ng/file-uploader';
import { SiIconComponent } from '@siemens/element-ng/icon';
import { MenuItemAction } from '@siemens/element-ng/menu';
import { SiToastNotificationService } from '@siemens/element-ng/toast-notification';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  imports: [SiChatInputComponent, SiIconComponent],
  templateUrl: './si-chat-input.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);
  private readonly toastService = inject(SiToastNotificationService);

  readonly inputValue = signal('');
  readonly sending = signal(false);
  readonly disabled = signal(false);
  readonly interruptible = signal(false);

  actions: MessageAction[] = [
    {
      label: 'Take photo',
      icon: 'element-camera',
      action: () => this.logEvent('Camera clicked')
    },
    {
      label: 'Text formatting',
      icon: 'element-brush',
      action: () => this.logEvent('Text formatting clicked')
    }
  ];

  secondaryActions: MenuItemAction[] = [
    {
      type: 'action',
      label: 'Schedule message',
      icon: 'element-clock',
      action: () => this.logEvent('Schedule clicked')
    },
    {
      type: 'action',
      label: 'Save as draft',
      icon: 'element-save',
      action: () => this.logEvent('Save draft clicked')
    }
  ];

  preAttachedFiles: ChatInputAttachment[] = [
    {
      name: 'project-spec.pdf',
      size: 1234567,
      type: 'application/pdf',
      file: new File([''], 'project-spec.pdf', { type: 'application/pdf' })
    },
    {
      name: 'mockup.png',
      size: 987654,
      type: 'image/png',
      file: new File([''], 'mockup.png', { type: 'image/png' })
    }
  ];

  onMessageSent(event: { content: string; attachments: ChatInputAttachment[] }): void {
    this.logEvent(`Message sent: "${event.content}" with ${event.attachments.length} attachments`);

    this.sending.set(true);
    setTimeout(() => {
      this.sending.set(false);
    }, 2000);
  }

  onFileError(error: FileUploadError): void {
    this.logEvent(`File error: ${error.errorText} - ${error.fileName}`);
    this.toastService.queueToastNotification('danger', error.errorText, error.fileName);
  }

  onInterrupt(): void {
    this.logEvent('Interrupt clicked');
    this.sending.set(false);
  }

  toggleDisabled(): void {
    this.disabled.update(current => !current);
  }

  toggleSending(): void {
    this.sending.update(current => !current);
  }

  setInputValue(value: string): void {
    this.inputValue.set(value);
  }

  toggleInterruptible(): void {
    this.interruptible.update(current => !current);
  }
}
