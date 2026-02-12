/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { CdkMenuTrigger } from '@angular/cdk/menu';
import { CommonModule } from '@angular/common';
import { booleanAttribute, Component, inject, input } from '@angular/core';
import { ActivatedRoute, RouterModule, type NavigationExtras } from '@angular/router';
import { elementOptionsVertical } from '@siemens/element-icons';
import { addIcons, SiIconComponent } from '@siemens/element-ng/icon';
import { SiMenuFactoryComponent, type MenuItem } from '@siemens/element-ng/menu';
import { SiTranslatePipe, TranslatableString } from '@siemens/element-translate-ng/translate';

/**
 * Interface for a router link in a notification item.
 * @param type - The type of the link, always 'router-link'.
 * @param routerLink - The router link to navigate to.
 * @param extras - Optional navigation extras for the router.
 */
export interface NotificationItemRouterLink {
  type: 'router-link';
  routerLink: string | any[];
  extras?: NavigationExtras;
}

/**
 * Interface for a standard link in a notification item.
 * @param type - The type of the link, always 'link'.
 * @param href - The URL to navigate to.
 * @param target - Optional target attribute for the link.
 */
export interface NotificationItemLink {
  type: 'link';
  href: string;
  target?: string;
}

/**
 * Base interface for notification item actions.
 * @param ariaLabel - The ARIA label for accessibility.
 * @param icon - The icon to display for the action.
 */
export interface NotificationItemBase {
  ariaLabel: TranslatableString;
  icon: string;
}

/**
 * Interface for an action circle button in a notification item.
 * @param type - The type of the action, always 'action-circle-button'.
 * @param customClass - Optional custom CSS class for styling.
 * @param action - The action to perform when the button is clicked.
 * @deprecated Use NotificationItemActionIconButton instead. This will be removed in a future release.
 */
export interface NotificationItemActionCircleButton extends NotificationItemBase {
  type: 'action-circle-button';
  customClass?: string;
  action: (source: this) => void;
}

/**
 * Interface for an action icon button in a notification item.
 * @param type - The type of the action, always 'action-icon-button'.
 * @param customClass - Optional custom CSS class for styling.
 * @param action - The action to perform when the button is clicked.
 */
export interface NotificationItemActionIconButton extends NotificationItemBase {
  type: 'action-icon-button';
  customClass?: string;
  action: (source: this) => void;
}

/**
 * Interface for a router link with an icon in a notification item.
 * @param type - The type of the link, always 'router-link'.
 * @param routerLink - The router link to navigate to.
 * @param extras - Optional navigation extras for the router.
 */
export interface NotificationItemRouterLinkIcon extends NotificationItemBase {
  type: 'router-link';
  routerLink: string | any[];
  extras?: NavigationExtras;
}

/**
 * Interface for a standard link with an icon in a notification item.
 * @param type - The type of the link, always 'link'.
 * @param href - The URL to navigate to.
 * @param target - Optional target attribute for the link.
 */
export interface NotificationItemLinkIcon extends NotificationItemBase {
  type: 'link';
  href: string;
  target?: string;
}

/**
 * Interface for an action button in a notification item.
 * @param type - The type of the action, always 'action-button'.
 * @param label - The label to display on the button.
 * @param action - The action to perform when the button is clicked.
 */
export interface NotificationItemActionButton {
  type: 'action-button';
  label: TranslatableString;
  action: (source: this) => void;
}

/**
 * Interface for a menu in a notification item.
 * @param type - The type of the action, always 'menu'.
 * @param menuItems - The menu items to display in the menu.
 */
export interface NotificationItemMenu {
  type: 'menu';
  menuItems: MenuItem[];
}

/**
 * Union type for quick actions in a notification item.
 */
export type NotificationItemQuickAction =
  | NotificationItemActionCircleButton
  | NotificationItemActionIconButton
  | NotificationItemLinkIcon
  | NotificationItemRouterLinkIcon;

/**
 * Union type for primary actions in a notification item.
 */
export type NotificationItemPrimaryAction =
  | NotificationItemActionCircleButton
  | NotificationItemActionIconButton
  | NotificationItemLinkIcon
  | NotificationItemRouterLinkIcon
  | NotificationItemMenu
  | NotificationItemActionButton;

/**
 * This component represents a single notification that can be used within notification
 * centers, popovers, or other containers. It supports various action types including
 * router links, standard links, action buttons, and menus.
 */
@Component({
  selector: 'si-notification-item',
  imports: [
    SiTranslatePipe,
    RouterModule,
    CommonModule,
    SiMenuFactoryComponent,
    CdkMenuTrigger,
    SiIconComponent
  ],
  templateUrl: './si-notification-item.component.html',
  styleUrl: './si-notification-item.component.scss'
})
export class SiNotificationItemComponent {
  protected readonly icons = addIcons({ elementOptionsVertical });

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
