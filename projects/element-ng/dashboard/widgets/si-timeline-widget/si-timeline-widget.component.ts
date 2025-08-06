/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { NgClass } from '@angular/common';
import { Component, computed, input, OnChanges } from '@angular/core';
import { SiCardComponent } from '@spike-rabbit/element-ng/card';
import { AccentLineType, MenuItem as MenuItemLegacy } from '@spike-rabbit/element-ng/common';
import { ContentActionBarMainItem } from '@spike-rabbit/element-ng/content-action-bar';
import { Link, SiLinkDirective } from '@spike-rabbit/element-ng/link';
import { MenuItem } from '@spike-rabbit/element-ng/menu';
import {
  SiTranslateModule,
  TranslatableString
} from '@spike-rabbit/element-translate-ng/translate';

import { SiWidgetBaseComponent } from '../si-widget-base.component';
import { SiTimelineWidgetBodyComponent } from './si-timeline-widget-body.component';
import { SiTimelineWidgetItem } from './si-timeline-widget-item.component';

@Component({
  selector: 'si-timeline-widget',
  imports: [
    NgClass,
    SiLinkDirective,
    SiCardComponent,
    SiTranslateModule,
    SiTimelineWidgetBodyComponent
  ],
  templateUrl: './si-timeline-widget.component.html'
})
export class SiTimelineWidgetComponent
  extends SiWidgetBaseComponent<SiTimelineWidgetItem[]>
  implements OnChanges
{
  /**
   * Timeline widget header text.
   */
  readonly heading = input<TranslatableString>();
  /**
   * Input list of primary action items. Supports up to **4** actions and omits additional ones.
   *
   * @defaultValue []
   */
  readonly primaryActions = input<(MenuItemLegacy | ContentActionBarMainItem)[]>([]);
  /**
   * Input list of secondary action items.
   *
   * @defaultValue []
   */
  readonly secondaryActions = input<(MenuItemLegacy | MenuItem)[]>([]);
  /**
   * Link that leads the user to more information
   * or triggers and action. The `link.title` is displayed.
   * The title will be translated.
   */
  readonly link = input<Link>();

  /**
   * Number of skeleton progress indication items.
   *
   * @defaultValue 4
   */
  readonly numberOfItems = input(4);

  /**
   * Whether to show or hide the description row during skeleton progress indication.
   *
   * @defaultValue `true`
   */
  readonly showDescription = input(true);
  /**
   * Optional accent line
   */
  readonly accentLine = input<AccentLineType>();

  protected readonly accentClass = computed(() => {
    const accentLine = this.accentLine();
    return accentLine ? 'accent-' + accentLine : '';
  });
}
