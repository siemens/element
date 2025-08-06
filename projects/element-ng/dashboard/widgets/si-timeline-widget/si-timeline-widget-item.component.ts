/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { A11yModule } from '@angular/cdk/a11y';
import { CdkMenuTrigger } from '@angular/cdk/menu';
import { NgClass } from '@angular/common';
import { Component, inject, input, OnChanges, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, RouterLink } from '@angular/router';
import { SiIconNextComponent } from '@spike-rabbit/element-ng/icon';
import { MenuItem, SiMenuModule } from '@spike-rabbit/element-ng/menu';
import {
  SiTranslateModule,
  TranslatableString
} from '@spike-rabbit/element-translate-ng/translate';

import { SiWidgetBaseComponent } from '../si-widget-base.component';

/** Base for action items in the timeline widget. */
export interface TimelineWidgetActionBase {
  /** Label that is shown to the user. */
  label: string;
  /** The web font icon class name (e.g. element-settings-outline). */
  icon?: string;
  /** Defines if only the icon is shown in the default navigation bar. */
  iconOnly?: boolean;
}

/** Interface representing an action item in the timeline widget. */
export interface TimelineWidgetActionButton extends TimelineWidgetActionBase {
  type: 'action';
  /** The class name to define the button style */
  customClass?: string;
  /** Action that called when the item action is triggered. */
  action: (source: this) => void;
}

/** Interface representing a router link item in the timeline widget. */
export interface TimeLineWidgetRouterLink extends TimelineWidgetActionBase {
  type: 'router-link';
  /** Link for the angular router. Accepts the same values as {@link RouterLink}. */
  routerLink: string | any[];
  /** Navigation extras that are passed to the {@link RouterLink}. */
  extras?: NavigationExtras;
}

/** Interface representing a link item in the timeline widget. */
export interface TimeLineWidgetLink extends TimelineWidgetActionBase {
  type: 'link';
  /** The href property of the anchor. */
  href: string;
  /** The target property of the anchor. */
  target?: string;
}

/** Interface representing a menu item in the timeline widget. */
export interface TimelineWidgetMenu {
  type: 'menu';
  menuItems: MenuItem[];
}

/** Union type for all possible action items in the timeline widget. */
export type TimelineWidgetItemAction =
  | TimelineWidgetActionButton
  | TimeLineWidgetLink
  | TimeLineWidgetRouterLink
  | TimelineWidgetMenu;

/**
 * Represents an item in the timeline widget.
 * Each item may contain a timestamp, a title, an icon, an optional description and optional action elements.
 * Actions can be buttons, links, router links, or menus.
 */
export interface SiTimelineWidgetItem {
  /**
   * The timestamp of the item.
   */
  timeStamp: TranslatableString;
  /**
   * The title of the item.
   */
  title: TranslatableString;
  /**
   * Optional translatable description.
   */
  description?: TranslatableString;
  /**
   * The icon of the item.
   */
  icon: string;
  /**
   * The color of the icon.
   */
  iconColor?: string;
  /**
   * The stacked icon of the item.
   */
  stackedIcon?: string;
  /**
   * The color of the stacked icon.
   */
  stackedIconColor?: string;
  /**
   * The alt text of the icon
   */
  iconAlt?: TranslatableString;
  /**
   * The related action of the item
   */
  action?: TimelineWidgetItemAction;
}

/**
 * The items of the `<si-timeline-widget>`.
 */
@Component({
  selector: 'si-timeline-widget-item',
  imports: [
    SiIconNextComponent,
    SiTranslateModule,
    NgClass,
    A11yModule,
    RouterLink,
    SiMenuModule,
    CdkMenuTrigger
  ],
  templateUrl: './si-timeline-widget-item.component.html',
  host: {
    role: 'listitem'
  }
})
export class SiTimelineWidgetItemComponent
  extends SiWidgetBaseComponent<SiTimelineWidgetItem>
  implements OnInit, OnChanges
{
  /**
   * Whether to show or hide the description row during skeleton progress indication.
   *
   * @defaultValue `true`
   */
  readonly showDescription = input(true);

  protected readonly activatedRoute = inject(ActivatedRoute, { optional: true });
}
