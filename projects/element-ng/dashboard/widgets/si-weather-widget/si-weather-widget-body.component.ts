/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, Directive, input } from '@angular/core';
import { SiTranslatePipe, t, TranslatableString } from '@siemens/element-translate-ng/translate';

import { SiWidgetBaseDirective } from '../si-widget-base.directive';
import { SiWeatherWidgetForecastComponent } from './si-weather-widget-forecast.component';
import { SiWeatherWidgetIllustrationComponent } from './si-weather-widget-illustration.component';
import { SiWeatherWidgetSkeletonComponent } from './si-weather-widget-skeleton.component';
import {
  SiWeatherWidgetCurrent,
  SiWeatherWidgetData,
  SiWeatherWidgetLayout
} from './si-weather-widget.types';

const LAYOUT_CLASS: Record<SiWeatherWidgetLayout, string> = {
  vertical: 'si-weather-widget-vertical',
  horizontal: 'si-weather-widget-horizontal',
  compact: 'si-weather-widget-compact'
};

/**
 * Marker directive that types the `let-` context of the shared range
 * `<ng-template>` so its body gets full type checking instead of `any`.
 *
 *  @internal
 */
@Directive({ selector: '[siWeatherRangeDef]' })
export class SiWeatherRangeDefDirective {
  static ngTemplateContextGuard(
    _dir: SiWeatherRangeDefDirective,
    ctx: unknown
  ): ctx is { $implicit: SiWeatherWidgetCurrent } {
    return true;
  }
}

/**
 * Body of the `<si-weather-widget>`. Useful for compositions that do not need
 * the surrounding `<si-card>` chrome (e.g. embedding the weather inside a
 * custom container).
 *
 * Data is supplied as a composite {@link value} payload of type
 * {@link SiWeatherWidgetData}.
 *
 * The body delegates illustration resolution to the injected
 * {@link SiWeatherIconResolver}. The library ships a default resolver that
 * maps the built-in {@link SiWeatherCondition} vocabulary to Element icons.
 *
 * In the `vertical` layout the forecast list responsively hides additional
 * data columns (wind, humidity, …) via pure CSS container queries when the
 * widget becomes too narrow. See `si-weather-widget-body.component.scss` for
 * the thresholds.
 */
@Component({
  selector: 'si-weather-widget-body',
  imports: [
    NgTemplateOutlet,
    SiTranslatePipe,
    SiWeatherRangeDefDirective,
    SiWeatherWidgetForecastComponent,
    SiWeatherWidgetIllustrationComponent,
    SiWeatherWidgetSkeletonComponent
  ],
  templateUrl: './si-weather-widget-body.component.html',
  styleUrl: './si-weather-widget-body.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'layoutClass()' }
})
export class SiWeatherWidgetBodyComponent extends SiWidgetBaseDirective<SiWeatherWidgetData> {
  /**
   * Visual layout. {@link SiWeatherWidgetLayout}.
   *
   * @defaultValue 'vertical'
   */
  readonly layout = input<SiWeatherWidgetLayout>('vertical');
  /**
   * Optional location label, shown inside the body in the compact layout only.
   * The non-compact layouts render the location via the `<si-card>` heading
   * managed by `SiWeatherWidgetComponent`.
   */
  readonly location = input<TranslatableString>();
  /**
   * Accessible label for the additional data list.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_WEATHER_WIDGET.METRICS_LABEL:Additional weather data`)
   * ```
   */
  readonly metricsLabel = input<TranslatableString>(
    t(() => $localize`:@@SI_WEATHER_WIDGET.METRICS_LABEL:Additional weather data`)
  );
  /**
   * Accessible label for the forecast section.
   *
   * @defaultValue
   * ```
   * t(() => $localize`:@@SI_WEATHER_WIDGET.FORECAST_LABEL:Weather forecast`)
   * ```
   */
  readonly forecastLabel = input<TranslatableString>(
    t(() => $localize`:@@SI_WEATHER_WIDGET.FORECAST_LABEL:Weather forecast`)
  );

  protected readonly layoutClass = computed(() => LAYOUT_CLASS[this.layout()]);

  protected readonly isCompact = computed(() => this.layout() === 'compact');
}
