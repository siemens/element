/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input
} from '@angular/core';
import { SiCardComponent } from '@siemens/element-ng/card';
import { AccentLineType } from '@siemens/element-ng/common';
import { ContentActionBarMainItem } from '@siemens/element-ng/content-action-bar';
import { MenuItem } from '@siemens/element-ng/menu';
import { TranslatableString } from '@siemens/element-translate-ng/translate';

import { SiWeatherWidgetBodyComponent } from './si-weather-widget-body.component';
import { SiWeatherWidgetData, SiWeatherWidgetLayout } from './si-weather-widget.types';

/**
 * Dashboard widget for current weather conditions, additional metrics and an
 * optional multi-day forecast.
 *
 * The widget supports three layouts (see {@link SiWeatherWidgetLayout}):
 *
 * - `vertical` (default): full vertical card with `<si-card>` heading,
 *   illustration, today block, optional additional data and an optional
 *   forecast table with up to five extra columns.
 * - `horizontal`: wider card with the today block laid out side by side and a
 *   horizontal forecast strip below. The forecast SHOULD contain at least three
 *   days for a visually balanced layout.
 * - `compact`: condensed variant without a card header. The {@link location} is
 *   rendered next to the illustration. The forecast is not shown.
 *
 * Data is supplied as a composite {@link value} payload of type
 * {@link SiWeatherWidgetData}.
 *
 * Weather illustrations are resolved by an optional `SiWeatherIconResolver`
 * that application developers register. Without a resolver the widget only
 * renders illustrations when callers pass a direct `illustration.src`.
 */
@Component({
  selector: 'si-weather-widget',
  imports: [SiCardComponent, SiWeatherWidgetBodyComponent],
  templateUrl: './si-weather-widget.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'si-weather-widget' }
})
export class SiWeatherWidgetComponent {
  /**
   * Card heading text. Used as the card header in `vertical` and `horizontal`
   * layouts. In the `compact` layout, the location is rendered inside the body
   * instead and this input is ignored.
   */
  readonly heading = input<TranslatableString>();
  /**
   * Location displayed next to the illustration in the `compact` layout. Has
   * no effect in `vertical` or `horizontal` layouts; use {@link heading} there.
   */
  readonly location = input<TranslatableString>();
  /**
   * Visual layout. {@link SiWeatherWidgetLayout}.
   *
   * @defaultValue 'vertical'
   */
  readonly layout = input<SiWeatherWidgetLayout>('vertical');
  /**
   * Composite weather payload of type {@link SiWeatherWidgetData}.
   */
  readonly value = input<SiWeatherWidgetData>();
  /**
   * Input list of primary action items. Supports up to **4** actions and omits additional ones.
   *
   * @defaultValue []
   */
  readonly primaryActions = input<ContentActionBarMainItem[]>([]);
  /**
   * Input list of secondary action items.
   *
   * @defaultValue []
   */
  readonly secondaryActions = input<MenuItem[]>([]);
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
  readonly imgAlt = input<TranslatableString>();
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
   * Optional accent line.
   */
  readonly accentLine = input<AccentLineType>();

  protected readonly accentClass = computed(() => {
    const accentLine = this.accentLine();
    return accentLine ? 'accent-' + accentLine : '';
  });

  protected readonly cardHeading = computed(() =>
    this.layout() === 'compact' ? undefined : this.heading()
  );

  protected readonly bodyLocation = computed(() =>
    this.layout() === 'compact' ? this.location() : undefined
  );
}
