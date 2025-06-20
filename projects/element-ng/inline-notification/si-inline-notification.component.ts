/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { NgClass } from '@angular/common';
import { booleanAttribute, Component, input } from '@angular/core';
import { StatusType } from '@siemens/element-ng/common';
import { SiStatusIconComponent } from '@siemens/element-ng/icon';
import { Link, SiLinkDirective } from '@siemens/element-ng/link';
import { SiTranslateModule } from '@siemens/element-translate-ng/translate';

@Component({
  selector: 'si-inline-notification',
  templateUrl: './si-inline-notification.component.html',
  styleUrl: './si-inline-notification.component.scss',
  imports: [NgClass, SiLinkDirective, SiTranslateModule, SiStatusIconComponent]
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
