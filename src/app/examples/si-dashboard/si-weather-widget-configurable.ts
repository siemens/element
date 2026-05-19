/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  SiWeatherCondition,
  SiWeatherIconModifier,
  SiWeatherIconResolver,
  SiWeatherWidgetComponent,
  SiWeatherWidgetData,
  SiWeatherWidgetForecast,
  SiWeatherWidgetLayout,
  SiWeatherWidgetMetric
} from '@siemens/element-ng/dashboard';

import {
  aggregateForecast,
  mapOpenWeatherCondition,
  mapOpenWeatherDaytime,
  OpenWeatherCitySuggestion,
  OpenWeatherService,
  OpenWeatherSnapshot
} from './open-weather.service';
import { SiXweatherIconResolver } from './si-xweather-icon.resolver';

const ALL_CONDITIONS: SiWeatherCondition[] = [
  'clear',
  'sunny',
  'fair',
  'partly-cloudy',
  'mostly-cloudy',
  'cloudy',
  'rain',
  'drizzle',
  'heavy-rain',
  'showers',
  'thunderstorm',
  'snow',
  'flurries',
  'sleet',
  'blizzard',
  'fog',
  'haze',
  'windy',
  'hot',
  'cold',
  'unknown'
];

const SAMPLE_FORECAST: SiWeatherWidgetForecast = {
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
    },
    {
      label: 'Humidity',
      icon: 'element-humidity',
      values: ['60%', '65%', '85%', '90%', '70%']
    },
    {
      label: 'Cloud cover',
      icon: 'element-cloud',
      values: ['20%', '40%', '90%', '95%', '60%']
    },
    {
      label: 'UV',
      icon: 'element-sun',
      values: ['7', '5', '2', '1', '4']
    }
  ]
};

const SAMPLE_METRICS: SiWeatherWidgetMetric[] = [
  { label: 'Wind', value: '7km/h' },
  { label: 'Cloud cover', value: '90%' },
  { label: 'Precipitation', value: '8mm' },
  { label: 'UVI', value: '1 low' }
];

const API_KEY_STORAGE = 'si-weather-widget-demo.openweather-api-key';
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const ALL_MODIFIERS: SiWeatherIconModifier[] = [
  'windy',
  'freezing',
  'rain',
  'snow',
  'thunder'
];

@Component({
  selector: 'app-sample',
  imports: [FormsModule, SiWeatherWidgetComponent],
  templateUrl: './si-weather-widget-configurable.html',
  providers: [{ provide: SiWeatherIconResolver, useClass: SiXweatherIconResolver }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'p-5' }
})
export class SampleComponent {
  protected readonly conditions = ALL_CONDITIONS;
  protected readonly allModifiers = ALL_MODIFIERS;

  protected readonly layout = signal<SiWeatherWidgetLayout>('vertical');
  protected readonly location = signal<string>('Zug, Switzerland');
  protected readonly temperature = signal<string>('26°');
  protected readonly minTemperature = signal<string>('20°');
  protected readonly maxTemperature = signal<string>('28°');
  protected readonly condition = signal<SiWeatherCondition>('sunny');
  protected readonly conditionLabel = signal<string>('Sunny');
  protected readonly daytime = signal<'day' | 'night'>('day');
  protected readonly modifiers = signal<ReadonlySet<SiWeatherIconModifier>>(new Set());

  protected hasModifier(modifier: SiWeatherIconModifier): boolean {
    return this.modifiers().has(modifier);
  }

  protected toggleModifier(modifier: SiWeatherIconModifier, enabled: boolean): void {
    const next = new Set(this.modifiers());
    if (enabled) {
      next.add(modifier);
    } else {
      next.delete(modifier);
    }
    this.modifiers.set(next);
  }
  protected readonly showMetrics = signal(true);
  protected readonly showForecast = signal(true);
  protected readonly showForecastColumns = signal(true);
  /** Number of extra forecast columns (0–5). */
  protected readonly extrasCount = signal<number>(2);
  protected readonly accentLine = signal<
    'primary' | 'success' | 'warning' | 'caution' | 'danger' | undefined
  >(undefined);

  // OpenWeather mode -----------------------------------------------------
  private readonly openWeather = inject(OpenWeatherService);
  protected readonly mode = signal<'manual' | 'openweather'>('manual');
  protected readonly apiKey = signal<string>(
    typeof localStorage !== 'undefined' ? (localStorage.getItem(API_KEY_STORAGE) ?? '') : ''
  );
  protected readonly suggestions = signal<OpenWeatherCitySuggestion[]>([]);
  protected readonly selectedCity = signal<OpenWeatherCitySuggestion | null>(null);
  protected readonly units = signal<'metric' | 'imperial'>('metric');
  protected readonly fetching = signal(false);
  protected readonly fetchError = signal<string | null>(null);
  private readonly snapshot = signal<OpenWeatherSnapshot | null>(null);

  private readonly manualValue = computed<SiWeatherWidgetData>(() => {
    const activeModifiers = ALL_MODIFIERS.filter(m => this.modifiers().has(m));
    const data: SiWeatherWidgetData = {
      current: {
        temperature: this.temperature(),
        condition: this.conditionLabel() || undefined,
        illustration: {
          condition: this.condition(),
          daytime: this.daytime(),
          modifiers: activeModifiers.length ? activeModifiers : undefined
        },
        minTemperature: this.minTemperature() || undefined,
        maxTemperature: this.maxTemperature() || undefined
      }
    };
    if (this.showMetrics()) {
      data.metrics = SAMPLE_METRICS;
    }
    if (this.showForecast()) {
      const baseColumns = SAMPLE_FORECAST.columns ?? [];
      const columns = this.showForecastColumns()
        ? baseColumns.slice(0, this.extrasCount())
        : undefined;
      data.forecast = { days: SAMPLE_FORECAST.days, columns };
    }
    return data;
  });

  private readonly openWeatherValue = computed<SiWeatherWidgetData | undefined>(() => {
    const snap = this.snapshot();
    if (!snap) {
      return undefined;
    }
    return this.snapshotToData(snap);
  });

  protected readonly value = computed<SiWeatherWidgetData | undefined>(() => {
    return this.mode() === 'openweather' ? this.openWeatherValue() : this.manualValue();
  });

  protected readonly effectiveHeading = computed(() => this.location());

  protected readonly effectiveLocation = computed(() => {
    const value = this.location();
    return value.split(',')[0]?.trim() || value;
  });

  protected readonly effectiveLoading = computed(
    () => this.mode() === 'openweather' && this.fetching()
  );

  protected async onSearch(): Promise<void> {
    this.fetchError.set(null);
    const key = this.apiKey().trim();
    if (!key) {
      this.fetchError.set('Enter an OpenWeather API key first.');
      return;
    }
    try {
      const results = await this.openWeather.searchCities(this.location(), key);
      this.suggestions.set(results);
      if (!results.length) {
        this.fetchError.set('No matching city found.');
      }
    } catch (err) {
      this.fetchError.set(this.errorMessage(err));
    }
  }

  protected async onSelectCity(city: OpenWeatherCitySuggestion): Promise<void> {
    this.selectedCity.set(city);
    this.location.set(city.label);
    this.suggestions.set([]);
    await this.fetch(city);
  }

  protected async onReload(): Promise<void> {
    const city = this.selectedCity();
    if (city) {
      await this.fetch(city);
    }
  }

  protected onApiKeyChange(value: string): void {
    this.apiKey.set(value);
    if (typeof localStorage !== 'undefined') {
      if (value) {
        localStorage.setItem(API_KEY_STORAGE, value);
      } else {
        localStorage.removeItem(API_KEY_STORAGE);
      }
    }
  }

  private async fetch(city: OpenWeatherCitySuggestion): Promise<void> {
    const key = this.apiKey().trim();
    if (!key) {
      return;
    }
    this.fetching.set(true);
    this.fetchError.set(null);
    try {
      const snap = await this.openWeather.load(city.lat, city.lon, key, this.units());
      this.snapshot.set(snap);
    } catch (err) {
      this.fetchError.set(this.errorMessage(err));
    } finally {
      this.fetching.set(false);
    }
  }

  private snapshotToData(snap: OpenWeatherSnapshot): SiWeatherWidgetData {
    const tempUnit = this.units() === 'metric' ? '°C' : '°F';
    const windUnit = this.units() === 'metric' ? 'm/s' : 'mph';
    const w = snap.current.weather[0];
    const data: SiWeatherWidgetData = {
      current: {
        temperature: `${Math.round(snap.current.main.temp)}${tempUnit}`,
        condition: w?.description?.replace(/^./, c => c.toUpperCase()),
        illustration: {
          condition: mapOpenWeatherCondition(w?.id ?? 0),
          daytime: mapOpenWeatherDaytime(w?.icon ?? '01d')
        },
        minTemperature: `${Math.round(snap.current.main.temp_min)}${tempUnit}`,
        maxTemperature: `${Math.round(snap.current.main.temp_max)}${tempUnit}`
      },
    };
    if (this.showMetrics()) {
      data.metrics = [
        { label: 'Wind', value: `${snap.current.wind.speed.toFixed(1)}${windUnit}` },
        { label: 'Humidity', value: `${snap.current.main.humidity}%` },
        { label: 'Cloud cover', value: `${snap.current.clouds.all}%` },
        {
          label: 'Precipitation',
          value: `${(snap.current.rain?.['1h'] ?? snap.current.rain?.['3h'] ?? 0).toFixed(1)}mm`
        }
      ];
    }
    if (this.showForecast()) {
      const days = aggregateForecast(snap.forecast, 5).map(d => ({
        label: DAY_LABELS[d.date.getDay()],
        illustration: {
          condition: mapOpenWeatherCondition(d.weather.id),
          daytime: mapOpenWeatherDaytime(d.weather.icon)
        },
        minTemperature: `${Math.round(d.min)}${tempUnit}`,
        maxTemperature: `${Math.round(d.max)}${tempUnit}`
      }));
      data.forecast = { days };
    }
    return data;
  }

  private errorMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const body = err.error as { message?: string } | string | null | undefined;
      const apiMessage = typeof body === 'string' ? body : (body?.message ?? '');
      if (err.status === 401) {
        return `HTTP 401 Unauthorized — ${apiMessage || 'invalid or not-yet-activated API key.'} New OpenWeather keys can take up to a couple of hours to activate.`;
      }
      if (err.status === 404) {
        return `HTTP 404 — ${apiMessage || 'city not found.'}`;
      }
      if (err.status === 429) {
        return `HTTP 429 — rate limit exceeded. ${apiMessage}`;
      }
      if (err.status === 0) {
        return 'Network error — could not reach api.openweathermap.org. Check your connection or CORS settings.';
      }
      return `HTTP ${err.status} — ${apiMessage || 'request failed.'}`;
    }
    if (err && typeof err === 'object' && 'message' in err) {
      return String((err as { message: unknown }).message);
    }
    return 'Request failed.';
  }
}
