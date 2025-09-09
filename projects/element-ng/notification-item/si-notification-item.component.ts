/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { CdkMenuTrigger } from '@angular/cdk/menu';
import { CommonModule } from '@angular/common';
import { booleanAttribute, Component, inject, input } from '@angular/core';
import { ActivatedRoute, RouterModule, type NavigationExtras } from '@angular/router';
import { SiMenuFactoryComponent, type MenuItem } from '@siemens/element-ng/menu';
import { SiTranslatePipe, TranslatableString } from '@siemens/element-translate-ng/translate';

export interface NotificationItemRouterLink {
  type: 'router-link';
  routerLink: string | any[];
  extras?: NavigationExtras;
}

export interface NotificationItemLink {
  type: 'link';
  href: string;
  target?: string;
}

export interface NotificationItemBase {
  ariaLabel: TranslatableString;
  icon: string;
}

export interface NotificationItemActionCircleButton extends NotificationItemBase {
  type: 'action-circle-button';
  customClass?: string;
  action: (source: this) => void;
}

export interface NotificationItemRouterLinkIcon extends NotificationItemBase {
  type: 'router-link';
  routerLink: string | any[];
  extras?: NavigationExtras;
}

export interface NotificationItemLinkIcon extends NotificationItemBase {
  type: 'link';
  href: string;
  target?: string;
}

export interface NotificationItemActionButton {
  type: 'action-button';
  label: TranslatableString;
  action: (source: this) => void;
}

export interface NotificationItemMenu {
  type: 'menu';
  menuItems: MenuItem[];
}

export type NotificationItemQuickAction =
  | NotificationItemActionCircleButton
  | NotificationItemLinkIcon
  | NotificationItemRouterLinkIcon;

export type NotificationItemPrimaryAction =
  | NotificationItemActionCircleButton
  | NotificationItemLinkIcon
  | NotificationItemRouterLinkIcon
  | NotificationItemMenu
  | NotificationItemActionButton;

@Component({
  selector: 'si-notification-item',
  imports: [SiTranslatePipe, RouterModule, CommonModule, SiMenuFactoryComponent, CdkMenuTrigger],
  templateUrl: './si-notification-item.component.html',
  styleUrl: './si-notification-item.component.scss'
})
export class SiNotificationItemComponent {
  /**
   * The timestamp of the notification item.
   */
  readonly timeStamp = input.required<TranslatableString>();
  /**
   * The heading of the notification item.
   */
  readonly heading = input.required<TranslatableString>();
  /**
   * Optional translatable description.
   */
  readonly description = input<TranslatableString>();
  /**
   * Unread messages are emphasized with a bolder font.
   *
   * @defaultValue false
   */
  readonly unread = input(false, { transform: booleanAttribute });
  /**
   * Link to the source or relevant information of the notification,
   * which triggers when clicking on the notification item text area.
   */
  readonly itemLink = input<NotificationItemRouterLink | NotificationItemLink>();
  /**
   * Actions that are displayed below the text of the notification.
   */
  readonly quickActions = input<NotificationItemQuickAction[]>();
  /**
   * Action that is displayed on the right side of the notification.
   */
  readonly primaryAction = input<NotificationItemPrimaryAction>();

  protected readonly activatedRoute = inject(ActivatedRoute, { optional: true });
}
