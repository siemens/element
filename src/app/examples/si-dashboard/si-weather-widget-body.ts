/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  SiWeatherIconResolver,
  SiWeatherWidgetBodyComponent,
  SiWeatherWidgetData
} from '@siemens/element-ng/dashboard';

import { SiXweatherIconResolver } from './si-xweather-icon.resolver';

@Component({
  selector: 'app-sample',
  imports: [SiWeatherWidgetBodyComponent],
  templateUrl: './si-weather-widget-body.html',
  providers: [{ provide: SiWeatherIconResolver, useClass: SiXweatherIconResolver }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'p-5' }
})
export class SampleComponent {
  protected readonly data: SiWeatherWidgetData = {
    current: {
      temperature: '26°',
      condition: 'Sunny',
      illustration: { condition: 'sunny' },
      minTemperature: '20°',
      maxTemperature: '28°'
    },
    metrics: [
      { label: 'Wind', value: '7km/h' },
      { label: 'Humidity', value: '55%' },
      { label: 'UVI', value: '1 low' }
    ],
    forecast: {
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
        }
      ]
    }
  };
}
