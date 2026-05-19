/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SiWeatherWidgetComponent, SiWeatherWidgetData } from '@siemens/element-ng/dashboard';
import { LOG_EVENT } from '@siemens/live-preview';

@Component({
  selector: 'app-sample',
  imports: [SiWeatherWidgetComponent],
  templateUrl: './si-weather-widget.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'p-5' }
})
export class SampleComponent {
  logEvent = inject(LOG_EVENT);

  // 1. Zug, Switzerland — full payload (current + metrics + 5-day forecast with extras).
  protected readonly zugFullData: SiWeatherWidgetData = {
    current: {
      temperature: '26°',
      condition: 'Sunny',
      illustration: { condition: 'clear' },
      minTemperature: '20°',
      maxTemperature: '28°'
    },
    metrics: [
      { label: 'Wind', value: '7 km/h' },
      { label: 'Cloud cover', value: '90%' },
      { label: 'Precipitation', value: '8 mm' },
      { label: 'UVI', value: '1 low' }
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

  // 2. Oslo, Norway — rain, current + forecast (no metrics).
  protected readonly osloRainData: SiWeatherWidgetData = {
    current: {
      temperature: '9°',
      condition: 'Rain',
      illustration: { condition: 'rain' },
      minTemperature: '6°',
      maxTemperature: '11°'
    },
    forecast: {
      days: [
        {
          label: 'Mon',
          illustration: { condition: 'rain' },
          minTemperature: '6°',
          maxTemperature: '10°'
        },
        {
          label: 'Tue',
          illustration: { condition: 'rain' },
          minTemperature: '5°',
          maxTemperature: '9°'
        },
        {
          label: 'Wed',
          illustration: { condition: 'clouds' },
          minTemperature: '7°',
          maxTemperature: '12°'
        },
        {
          label: 'Thu',
          illustration: { condition: 'clouds' },
          minTemperature: '8°',
          maxTemperature: '13°'
        },
        {
          label: 'Fri',
          illustration: { condition: 'rain' },
          minTemperature: '6°',
          maxTemperature: '10°'
        }
      ]
    }
  };

  // 3. Madrid, Spain — clear hot, current only.
  protected readonly madridSunData: SiWeatherWidgetData = {
    current: {
      temperature: '34°',
      condition: 'Clear',
      illustration: { condition: 'clear' },
      minTemperature: '24°',
      maxTemperature: '36°'
    }
  };

  // 4. Tokyo, Japan — clouds, full payload with distinct metrics.
  protected readonly tokyoFullData: SiWeatherWidgetData = {
    current: {
      temperature: '19°',
      condition: 'Cloudy',
      illustration: { condition: 'clouds' },
      minTemperature: '16°',
      maxTemperature: '22°'
    },
    metrics: [
      { label: 'Visibility', value: '10 km' },
      { label: 'Pressure', value: '1014 hPa' },
      { label: 'Humidity', value: '72%' }
    ],
    forecast: {
      days: [
        {
          label: 'Mon',
          illustration: { condition: 'clouds' },
          minTemperature: '16°',
          maxTemperature: '22°'
        },
        {
          label: 'Tue',
          illustration: { condition: 'rain' },
          minTemperature: '15°',
          maxTemperature: '19°'
        },
        {
          label: 'Wed',
          illustration: { condition: 'clear' },
          minTemperature: '18°',
          maxTemperature: '25°'
        },
        {
          label: 'Thu',
          illustration: { condition: 'clouds' },
          minTemperature: '17°',
          maxTemperature: '23°'
        },
        {
          label: 'Fri',
          illustration: { condition: 'wind' },
          minTemperature: '16°',
          maxTemperature: '21°'
        }
      ]
    }
  };

  // 5. Singapore — storm, current + forecast.
  protected readonly singaporeStormData: SiWeatherWidgetData = {
    current: {
      temperature: '28°',
      condition: 'Thunderstorm',
      illustration: { condition: 'storm' },
      minTemperature: '26°',
      maxTemperature: '31°'
    },
    forecast: {
      days: [
        {
          label: 'Mon',
          illustration: { condition: 'storm' },
          minTemperature: '26°',
          maxTemperature: '30°'
        },
        {
          label: 'Tue',
          illustration: { condition: 'rain' },
          minTemperature: '26°',
          maxTemperature: '29°'
        },
        {
          label: 'Wed',
          illustration: { condition: 'storm' },
          minTemperature: '26°',
          maxTemperature: '31°'
        },
        {
          label: 'Thu',
          illustration: { condition: 'rain' },
          minTemperature: '25°',
          maxTemperature: '29°'
        },
        {
          label: 'Fri',
          illustration: { condition: 'clouds' },
          minTemperature: '26°',
          maxTemperature: '30°'
        }
      ]
    }
  };

  // 6. Dubai, UAE — clear, current only.
  protected readonly dubaiSunData: SiWeatherWidgetData = {
    current: {
      temperature: '41°',
      condition: 'Sunny',
      illustration: { condition: 'clear' },
      minTemperature: '30°',
      maxTemperature: '43°'
    }
  };

  // 7. Zürich — compact with min/max range.
  protected readonly zurichCompactData: SiWeatherWidgetData = {
    current: {
      temperature: '22°',
      illustration: { condition: 'clear' },
      minTemperature: '17°',
      maxTemperature: '24°'
    }
  };

  // 8. Vienna — compact, temperature only.
  protected readonly viennaCompactData: SiWeatherWidgetData = {
    current: {
      temperature: '14°',
      illustration: { condition: 'clouds' }
    }
  };

  // 10. Palekastro, Crete — clear beach day with side image, full payload.
  protected readonly palekastroFullData: SiWeatherWidgetData = {
    current: {
      temperature: '29°',
      condition: 'Sunny',
      illustration: { condition: 'clear' },
      minTemperature: '23°',
      maxTemperature: '31°'
    },
    metrics: [
      { label: 'Wind', value: '23 knots' },
      { label: 'Humidity', value: '28%' },
      { label: 'UVI', value: '9 high' }
    ],
    forecast: {
      days: [
        {
          label: 'Mon',
          illustration: { condition: 'wind' },
          minTemperature: '23°',
          maxTemperature: '30°'
        },
        {
          label: 'Tue',
          illustration: { condition: 'clear' },
          minTemperature: '24°',
          maxTemperature: '32°'
        },
        {
          label: 'Wed',
          illustration: { condition: 'wind' },
          minTemperature: '22°',
          maxTemperature: '29°'
        },
        {
          label: 'Thu',
          illustration: { condition: 'wind' },
          minTemperature: '23°',
          maxTemperature: '30°'
        },
        {
          label: 'Fri',
          illustration: { condition: 'wind' },
          minTemperature: '22°',
          maxTemperature: '28°'
        }
      ]
    }
  };
}
