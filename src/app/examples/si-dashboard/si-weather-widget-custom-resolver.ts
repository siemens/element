/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  SiWeatherIconResolver,
  SiWeatherWidgetComponent,
  SiWeatherWidgetData
} from '@siemens/element-ng/dashboard';

import { SiWeatherWidgetMeteoconsIconResolver } from './si-weather-widget-meteocons-icon.resolver';

@Component({
  selector: 'app-sample',
  imports: [SiWeatherWidgetComponent],
  templateUrl: './si-weather-widget-custom-resolver.html',
  providers: [{ provide: SiWeatherIconResolver, useClass: SiWeatherWidgetMeteoconsIconResolver }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'p-5' }
})
export class SampleComponent {
  protected readonly data: SiWeatherWidgetData = {
    current: {
      temperature: '26°',
      condition: 'Sunny',
      illustration: { condition: 'clear' },
      minTemperature: '20°',
      maxTemperature: '28°'
    },
    metrics: [
      { label: 'Wind', value: '7 km/h' },
      { label: 'Humidity', value: '54%' },
      { label: 'Cloud cover', value: '12%' },
      { label: 'Precipitation', value: '0 mm' },
      { label: 'UV index', value: '6 high' },
      { label: 'Pressure', value: '1018 hPa' }
    ],
    forecast: {
      days: [
        {
          label: 'Mon',
          illustration: { condition: 'clear' },
          minTemperature: '18°',
          maxTemperature: '26°'
        },
        {
          label: 'Tue',
          illustration: { condition: 'clouds' },
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
          illustration: { condition: 'storm' },
          minTemperature: '14°',
          maxTemperature: '20°'
        },
        {
          label: 'Fri',
          illustration: { condition: 'wind' },
          minTemperature: '16°',
          maxTemperature: '22°'
        }
      ],
      columns: [
        {
          label: 'Wind',
          icon: 'element-wind',
          values: ['7 km/h', '6 km/h', '12 km/h', '14 km/h', '9 km/h']
        },
        {
          label: 'Precipitation',
          icon: 'element-water',
          values: ['0 mm', '1 mm', '8 mm', '12 mm', '2 mm']
        }
      ]
    }
  };
}
