/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { NgClass } from '@angular/common';
import { booleanAttribute, Component, input } from '@angular/core';
import { StatusType } from '@spike-rabbit/element-ng/common';
import { SiStatusIconComponent } from '@spike-rabbit/element-ng/icon';
import { Link, SiLinkDirective } from '@spike-rabbit/element-ng/link';
import { SiTranslatePipe } from '@spike-rabbit/element-translate-ng/translate';

@Component({
  selector: 'si-inline-notification',
  imports: [NgClass, SiLinkDirective, SiTranslatePipe, SiStatusIconComponent],
  templateUrl: './si-inline-notification.component.html',
  styleUrl: './si-inline-notification.component.scss'
})
export class SiInlineNotificationComponent {
  /**
   * Status of inline notification.
   */
  readonly severity = input.required<StatusType>();

  /**
   * Heading of the message.
   */
  readonly heading = input<string>();

  /**
   * Main message of this inline notification.
   */
  readonly message = input.required<string>();

  /**
   * Optional link action for inline notification events.
   */
  readonly action = input<Link>();

  /**
   * Params passed to the translation pipe
   *
   * @defaultValue
   * ```
   * {}
   * ```
   */
  readonly translationParams = input<{ [key: string]: any } | undefined>({});

  /**
   * Displays in embedded style, w/o radius and indicator bar
   *
   * @defaultValue false
   */
  readonly embedded = input(false, { transform: booleanAttribute });
}
