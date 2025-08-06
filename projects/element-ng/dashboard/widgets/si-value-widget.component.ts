/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { NgClass } from '@angular/common';
import { booleanAttribute, Component, computed, input } from '@angular/core';
import { SiCardComponent } from '@spike-rabbit/element-ng/card';
import {
  AccentLineType,
  EntityStatusType,
  MenuItem as MenuItemLegacy
} from '@spike-rabbit/element-ng/common';
import { ContentActionBarMainItem } from '@spike-rabbit/element-ng/content-action-bar';
import { Link, SiLinkDirective } from '@spike-rabbit/element-ng/link';
import { MenuItem } from '@spike-rabbit/element-ng/menu';
import {
  SiTranslateModule,
  TranslatableString
} from '@spike-rabbit/element-translate-ng/translate';

import { SiValueWidgetBodyComponent } from './si-value-widget-body.component';

/**
 * Is a dynamic UI component that not only displays information, but also includes
 * embedded actions which the user can interact with to perform tasks directly
 * related to the card's content. Actions might include editing settings,
 * initiating processes, or deleting resources.
 *
 * The actionable widget turns data representation into an interactive hub,
 * streamlining the user's tasks and decisions associated with the card's content.
 *
 * This component is a wrapper using the `.si-value-widget` CSS classes and the
 * `<si-card>` component. For more configuration options, use the CSS classes directly.
 */
@Component({
  selector: 'si-value-widget',
  imports: [
    NgClass,
    SiCardComponent,
    SiLinkDirective,
    SiTranslateModule,
    SiValueWidgetBodyComponent
  ],
  templateUrl: './si-value-widget.component.html'
})
export class SiValueWidgetComponent {
  /**
   * Value widget header text.
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
   * The main value to be displayed. If no value is set,
   * the skeleton indicates the loading of the value. Disable
   * the automatic loading mechanism by setting `SiValueWidgetComponent.disableAutoLoadingIndicator`.
   */
  readonly value = input<TranslatableString>();
  /**
   * The unit of the value (e.g. kWh or users). Only visible if `value` is available.
   */
  readonly unit = input<TranslatableString>();
  /**
   * The element icon name. Only visible if `value` is available.
   */
  readonly icon = input<string>();
  /**
   * Show a status icon instead of the {@link icon}.
   */
  readonly status = input<EntityStatusType>();
  /**
   * Short description of the value. A description is mandatory
   * to show an icon. Only visible if `value` is available.
   */
  readonly description = input<TranslatableString>();
  /**
   * Link that leads the user to more information
   * or triggers and action. The `link.title` is displayed.
   * The title will be translated.
   */
  readonly link = input<Link>();
  /**
   * Option to disable automatic start of skeleton loading indication.
   *
   * @defaultValue false
   */
  readonly disableAutoLoadingIndicator = input(false, { transform: booleanAttribute });
  /**
   * Input to start and stop the skeleton loading indication.
   *
   * @defaultValue false
   */
  readonly showLoadingIndicator = input(false, { transform: booleanAttribute });
  /**
   * Initial delay time in milliseconds before enabling loading indicator.
   * Only used once initially during construction.
   *
   * @defaultValue 300
   */
  readonly initialLoadingIndicatorDebounceTime = input(300);
  /**
   * Image source for the card.
   */
  readonly imgSrc = input<string>();
  /**
   * Alt text for a provided image.
   */
  readonly imgAlt = input<string>();
  /**
   * Defines if an image is placed on top or start (left) of the card.
   *
   * @defaultValue 'vertical'
   */
  readonly imgDir = input<'horizontal' | 'vertical'>('vertical');
  /**
   * Sets the image [object-fit](https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit) CSS property.
   *
   * @defaultValue 'scale-down'
   */
  readonly imgObjectFit = input<'contain' | 'cover' | 'fill' | 'none' | 'scale-down'>('scale-down');
  /**
   * Sets the image [object-position](https://developer.mozilla.org/en-US/docs/Web/CSS/object-position) CSS property.
   */
  readonly imgObjectPosition = input<string>();
  /**
   * Optional accent line
   */
  readonly accentLine = input<AccentLineType>();

  protected readonly accentClass = computed(() => {
    const accentLine = this.accentLine();
    return accentLine ? 'accent-' + accentLine : '';
  });
}
