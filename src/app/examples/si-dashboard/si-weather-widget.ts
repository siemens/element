/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  SiWeatherIconResolver,
  SiWeatherWidgetComponent,
  SiWeatherWidgetCurrent,
  SiWeatherWidgetData,
  SiWeatherWidgetForecast,
  SiWeatherWidgetMetric
} from '@siemens/element-ng/dashboard';
import { LOG_EVENT } from '@siemens/live-preview';

import { SiXweatherIconResolver } from './si-xweather-icon.resolver';

@Component({
  selector: 'app-sample',
  imports: [SiWeatherWidgetComponent],
  templateUrl: './si-weather-widget.html',
  providers: [{ provide: SiWeatherIconResolver, useClass: SiXweatherIconResolver }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'p-5' }
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);

  protected readonly current: SiWeatherWidgetCurrent = {
    temperature: '26°',
    condition: 'Sunny',
    illustration: { condition: 'sunny', daytime: 'day' },
    minTemperature: '20°',
    maxTemperature: '28°'
  };
  protected readonly metrics: SiWeatherWidgetMetric[] = [
    { label: 'Wind', value: '7km/h' },
    { label: 'Cloud cover', value: '90%' },
    { label: 'Precipitation', value: '8mm' },
    { label: 'UVI', value: '1 low' }
  ];

  protected readonly forecast: SiWeatherWidgetForecast = {
    days: [
      {
        label: 'Mon',
        illustration: { condition: 'sunny' },
        minTemperature: '18°',
        maxTemperature: '26°'
      },
      {
        label: 'Tue',
        illustration: { condition: 'partly-cloudy' },
        minTemperature: '17°',
        maxTemperature: '24°'
      },
      {
        label: 'Wed',
        illustration: { condition: 'rain' },
        minTemperature: '15°',
        maxTemperature: '21°'
      },
      {
        label: 'Thu',
        illustration: { condition: 'thunderstorm' },
        minTemperature: '14°',
        maxTemperature: '20°'
      },
      {
        label: 'Fri',
        illustration: { condition: 'cloudy' },
        minTemperature: '16°',
        maxTemperature: '22°'
      }
    ],
    columns: [
      {
        label: 'Wind',
        icon: 'element-wind',
        values: ['7km/h', '6km/h', '12km/h', '14km/h', '9km/h']
      },
      {
        label: 'Precipitation',
        icon: 'element-water',
        values: ['0mm', '1mm', '8mm', '12mm', '2mm']
      }
    ]
  };

  protected readonly verticalData: SiWeatherWidgetData = {
    current: this.current,
    metrics: this.metrics,
    forecast: this.forecast
  };

  protected readonly verticalDataMinimal: SiWeatherWidgetData = {
    current: {
      temperature: '14°',
      condition: 'Cloudy',
      illustration: { condition: 'mostly-cloudy' }
    }
  };

  protected readonly horizontalData: SiWeatherWidgetData = {
    current: {
      temperature: '26°',
      condition: 'Sunny',
      illustration: { condition: 'sunny' },
      minTemperature: '20°',
      maxTemperature: '28°'
    },
    metrics: this.metrics.slice(0, 3),
    forecast: {
      days: this.forecast.days
    }
  };

  protected readonly compactData: SiWeatherWidgetData = {
    current: {
      temperature: '26°',
      illustration: { condition: 'sunny' },
      minTemperature: '20°',
      maxTemperature: '28°'
    }
  };

  protected readonly nightData: SiWeatherWidgetData = {
    current: {
      temperature: '11°',
      condition: 'Clear night',
      illustration: { condition: 'clear', daytime: 'night' },
      minTemperature: '9°',
      maxTemperature: '15°'
    },
    metrics: [
      { label: 'Wind', value: '3km/h' },
      { label: 'Humidity', value: '78%' }
    ]
  };
}
