/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { WidgetConfig, WidgetInstance } from '@siemens/dashboards-ng';
import { SiWeatherWidgetBodyComponent, SiWeatherWidgetData } from '@siemens/element-ng/dashboard';

import {
  DEFAULT_WEATHER_PAYLOAD,
  SAMPLE_FORECAST,
  SAMPLE_METRICS,
  WeatherWidgetPayload
} from './weather-widget.mocks';

@Component({
  selector: 'app-weather-widget',
  imports: [SiWeatherWidgetBodyComponent],
  template: `
    <si-weather-widget-body
      [layout]="payload().layout"
      [location]="payload().location"
      [value]="weatherValue()"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'h-100 w-100 d-block' }
})
export class WeatherWidgetComponent implements WidgetInstance {
  readonly config = input.required<WidgetConfig>();

  protected readonly payload = computed<WeatherWidgetPayload>(() => {
    const raw = (this.config().payload ?? {}) as Partial<WeatherWidgetPayload>;
    return { ...DEFAULT_WEATHER_PAYLOAD, ...raw };
  });

  protected readonly weatherValue = computed<SiWeatherWidgetData>(() => {
    const p = this.payload();
    const data: SiWeatherWidgetData = {
      current: {
        temperature: p.temperature,
        condition: p.conditionLabel || undefined,
        illustration: {
          condition: p.condition
        },
        minTemperature: p.minTemperature || undefined,
        maxTemperature: p.maxTemperature || undefined
      }
    };
    if (p.showMetrics) {
      data.metrics = SAMPLE_METRICS;
    }
    if (p.showForecast) {
      const count = Math.max(0, Math.min(5, p.forecastColumnCount ?? 0));
      const columns = (SAMPLE_FORECAST.columns ?? []).slice(0, count);
      data.forecast = {
        days: SAMPLE_FORECAST.days,
        columns: columns.length ? columns : undefined
      };
    }
    return data;
  });
}
