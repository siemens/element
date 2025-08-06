/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { NgClass } from '@angular/common';
import { Component, computed } from '@angular/core';
import { addIcons, elementRight2, SiIconNextComponent } from '@siemens/element-ng/icon';
import { Link, SiLinkDirective } from '@siemens/element-ng/link';
import { SiTranslateModule, TranslatableString } from '@siemens/element-translate-ng/translate';

import { SiWidgetBaseComponent } from '../si-widget-base.component';

/**
 * Interface for objects to configure the the list widget.
 */
export interface SiListWidgetItem {
  /** Label is either a translatable string or a link. */
  label: TranslatableString | Link;
  /** Optional translatable description. */
  description?: TranslatableString;
  /** Optional translatable string to be displayed in a badge. */
  badge?: TranslatableString;
  /**
   * Defines the badge color. Must be one of the element `bg-<color>` CSS classes,
   * like `bg-primary`, `bg-secondary`, 'bg-caution'. Use only the name without `bg`.
   */
  badgeColor?: string;
  /** Optional translatable text that is display to the right. */
  text?: TranslatableString;
  /** Optional right aligned action. */
  action?: Link;
  /** The action icon. */
  actionIcon?: string;
}

/**
 * The `<si-link-widget>` supports an easy composition of links and actions
 * with support for skeleton loading indicator.
 */
@Component({
  selector: 'si-list-widget-item',
  imports: [NgClass, SiIconNextComponent, SiLinkDirective, SiTranslateModule],
  templateUrl: './si-list-widget-item.component.html',
  host: {
    class: 'list-group-item d-flex align-items-center',
    role: 'listitem'
  }
})
export class SiListWidgetItemComponent extends SiWidgetBaseComponent<SiListWidgetItem> {
  protected readonly isLink = computed(() => {
    return typeof this.value()?.label === 'object';
  });
  protected readonly badgeColor = computed(() => {
    return this.value()?.badgeColor ? 'bg-' + this.value()?.badgeColor : 'bg-default';
  });
  protected readonly link = computed(() => {
    return this.value()?.label as Link;
  });
  protected readonly label = computed(() => {
    return this.value()?.label as string;
  });
  protected readonly icons = addIcons({ elementRight2 });
}
