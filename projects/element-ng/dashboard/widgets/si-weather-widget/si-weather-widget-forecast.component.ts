/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SiIconComponent } from '@siemens/element-ng/icon';
import { SiTranslatePipe, TranslatableString } from '@siemens/element-translate-ng/translate';

import { SiWeatherWidgetIllustrationComponent } from './si-weather-widget-illustration.component';
import { SiWeatherWidgetForecast, SiWeatherWidgetForecastColumn } from './si-weather-widget.types';

type ForecastLayout = 'vertical' | 'horizontal';

/**
 * Forecast block of the weather widget. Renders either a vertical grid (with
 * optional extra data columns) or a horizontal day strip depending on
 * {@link layout}. Not exported from the public entry point.
 *
 * @internal
 */
@Component({
  selector: 'si-weather-widget-forecast',
  imports: [SiIconComponent, SiTranslatePipe, SiWeatherWidgetIllustrationComponent],
  templateUrl: './si-weather-widget-forecast.component.html',
  styleUrl: './si-weather-widget-forecast.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiWeatherWidgetForecastComponent {
  readonly forecast = input.required<SiWeatherWidgetForecast>();
  /** @defaultValue 'vertical' */
  readonly layout = input<ForecastLayout>('vertical');
  readonly forecastLabel = input<TranslatableString>();

  protected readonly columns = computed(() => {
    const cols = this.forecast().columns;
    if (!cols) {
      return [] as readonly SiWeatherWidgetForecastColumn[];
    }
    // Hard cap at 5 extra columns; matches the breakpoint set declared in
    // the stylesheet. Authors should pass at most 5 columns and pick the most
    // important ones — the row will become unreadable beyond that.
    return cols.slice(0, 5);
  });

  protected columnValue(
    column: SiWeatherWidgetForecastColumn,
    index: number
  ): string | number | undefined {
    return column.values?.[index];
  }
}
