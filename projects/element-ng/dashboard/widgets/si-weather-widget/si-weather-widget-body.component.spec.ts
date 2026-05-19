/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { inputBinding, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiWeatherIconResolution, SiWeatherIconResolver } from './si-weather-icon.resolver';
import { SiWeatherWidgetBodyComponent } from './si-weather-widget-body.component';
import {
  SiWeatherIcon,
  SiWeatherWidgetCurrent,
  SiWeatherWidgetData,
  SiWeatherWidgetForecast,
  SiWeatherWidgetLayout,
  SiWeatherWidgetMetric
} from './si-weather-widget.types';

class StubResolver extends SiWeatherIconResolver {
  lastIcon: SiWeatherIcon | null = null;
  resolution: SiWeatherIconResolution | null = {
    src: 'assets/weather-icons/sunny.svg',
    alt: 'RESOLVED_ALT'
  };

  override resolve(icon: SiWeatherIcon): SiWeatherIconResolution | null {
    this.lastIcon = icon;
    return this.resolution;
  }
}

const createCurrent = (
  overrides: Partial<SiWeatherWidgetCurrent> = {}
): SiWeatherWidgetCurrent => ({
  temperature: '24°',
  condition: 'Sunny',
  minTemperature: '18°',
  maxTemperature: '27°',
  ...overrides
});

const createForecast = (): SiWeatherWidgetForecast => ({
  days: [
    {
      label: 'Mon',
      minTemperature: '17°',
      maxTemperature: '25°',
      illustration: { condition: 'clear' }
    },
    {
      label: 'Tue',
      minTemperature: '19°',
      maxTemperature: '28°',
      illustration: 'assets/weather-icons/cloudy.svg'
    },
    {
      label: 'Wed',
      minTemperature: '20°',
      maxTemperature: '30°',
      illustration: 'https://example.com/cloudy.png?v=2'
    }
  ],
  columns: [
    { label: 'Wind', icon: 'element-wind', values: ['7 km/h', '9 km/h', '11 km/h'] },
    { label: 'Humidity', icon: 'element-humidity', values: ['60%', '55%', '50%'] }
  ]
});

describe('SiWeatherWidgetBodyComponent', () => {
  let fixture: ComponentFixture<SiWeatherWidgetBodyComponent>;
  let element: HTMLElement;
  let layout: WritableSignal<SiWeatherWidgetLayout>;
  let location: WritableSignal<string | undefined>;
  let value: WritableSignal<SiWeatherWidgetData | undefined>;
  let current: WritableSignal<SiWeatherWidgetCurrent | undefined>;
  let metrics: WritableSignal<readonly SiWeatherWidgetMetric[] | undefined>;
  let forecast: WritableSignal<SiWeatherWidgetForecast | undefined>;
  let showLoadingIndicator: WritableSignal<boolean>;
  let disableAutoLoadingIndicator: WritableSignal<boolean>;
  let resolver: StubResolver | null;

  const create = (withResolver: boolean = false): void => {
    resolver = withResolver ? new StubResolver() : null;
    if (withResolver) {
      TestBed.configureTestingModule({
        providers: [{ provide: SiWeatherIconResolver, useValue: resolver }]
      });
    }
    fixture = TestBed.createComponent(SiWeatherWidgetBodyComponent, {
      bindings: [
        inputBinding('layout', layout),
        inputBinding('location', location),
        inputBinding('value', value),
        inputBinding('current', current),
        inputBinding('metrics', metrics),
        inputBinding('forecast', forecast),
        inputBinding('showLoadingIndicator', showLoadingIndicator),
        inputBinding('disableAutoLoadingIndicator', disableAutoLoadingIndicator)
      ]
    });
    element = fixture.nativeElement;
  };

  beforeEach(() => {
    layout = signal<SiWeatherWidgetLayout>('vertical');
    location = signal<string | undefined>(undefined);
    value = signal<SiWeatherWidgetData | undefined>(undefined);
    current = signal<SiWeatherWidgetCurrent | undefined>(undefined);
    metrics = signal<readonly SiWeatherWidgetMetric[] | undefined>(undefined);
    forecast = signal<SiWeatherWidgetForecast | undefined>(undefined);
    showLoadingIndicator = signal(false);
    // Disable auto-loading so an empty state does not render the skeleton in
    // tests where we never set any value.
    disableAutoLoadingIndicator = signal(true);
    resolver = null;
  });

  it('applies a layout-specific host class', async () => {
    create();
    current.set(createCurrent());
    await fixture.whenStable();
    expect(element.classList).toContain('si-weather-widget-vertical');

    layout.set('horizontal');
    await fixture.whenStable();
    expect(element.classList).toContain('si-weather-widget-horizontal');
    expect(element.classList).not.toContain('si-weather-widget-vertical');

    layout.set('compact');
    await fixture.whenStable();
    expect(element.classList).toContain('si-weather-widget-compact');
  });

  it('renders the today block from the granular current input', async () => {
    create();
    current.set(createCurrent({ temperature: '21°', condition: 'Cloudy' }));
    await fixture.whenStable();

    expect(element.querySelector('.si-weather-widget-temperature')!.textContent).toContain('21°');
    expect(element.querySelector('.si-weather-widget-condition')!.textContent).toContain('Cloudy');
    expect(element.querySelector('.si-weather-widget-range-min')!.textContent).toContain('18°');
    expect(element.querySelector('.si-weather-widget-range-max')!.textContent).toContain('27°');
  });

  it('prefers granular inputs over the composite value payload', async () => {
    create();
    value.set({ current: createCurrent({ temperature: 'FROM_VALUE' }) });
    current.set(createCurrent({ temperature: 'FROM_CURRENT' }));
    await fixture.whenStable();

    expect(element.querySelector('.si-weather-widget-temperature')!.textContent).toContain(
      'FROM_CURRENT'
    );
  });

  it('falls back to the composite value payload when granular inputs are unset', async () => {
    create();
    value.set({
      current: createCurrent({ temperature: 'FROM_VALUE' }),
      metrics: [{ label: 'Wind', value: '7 km/h' }]
    });
    await fixture.whenStable();

    expect(element.querySelector('.si-weather-widget-temperature')!.textContent).toContain(
      'FROM_VALUE'
    );
    expect(element.querySelectorAll('.si-weather-widget-metric')).toHaveLength(1);
  });

  it('renders metrics with label and value', async () => {
    create();
    current.set(createCurrent());
    metrics.set([
      { label: 'Wind', value: '7 km/h' },
      { label: 'Humidity', value: '55%' }
    ]);
    await fixture.whenStable();

    const items = element.querySelectorAll('.si-weather-widget-metric');
    expect(items).toHaveLength(2);
    expect(items.item(0).textContent).toContain('Wind');
    expect(items.item(0).textContent).toContain('7 km/h');
  });

  describe('compact layout', () => {
    beforeEach(() => {
      layout.set('compact');
    });

    it('renders the location instead of the condition label', async () => {
      create();
      location.set('Berlin');
      current.set(createCurrent());
      await fixture.whenStable();

      expect(element.querySelector('.si-weather-widget-location')!.textContent).toContain('Berlin');
      // condition is suppressed in the compact layout
      expect(element.querySelector('.si-weather-widget-condition')).toBeNull();
    });

    it('does not render a forecast section', async () => {
      create();
      current.set(createCurrent());
      forecast.set(createForecast());
      await fixture.whenStable();

      expect(element.querySelector('.si-weather-widget-forecast')).toBeNull();
    });
  });

  describe('forecast', () => {
    beforeEach(() => {
      current.set(createCurrent());
      forecast.set(createForecast());
    });

    it('renders all days in the vertical layout', async () => {
      create();
      await fixture.whenStable();

      const rows = element.querySelectorAll('.si-weather-widget-forecast-row');
      expect(rows).toHaveLength(3);
      expect(rows.item(0).textContent).toContain('Mon');
      expect(rows.item(2).textContent).toContain('Wed');
    });

    it('renders all forecast columns and aligns values by day index', async () => {
      create();
      await fixture.whenStable();

      const firstRow = element.querySelectorAll('.si-weather-widget-forecast-row').item(0);
      const extras = firstRow.querySelectorAll('.si-weather-widget-forecast-extra');
      expect(extras).toHaveLength(2);
      expect(extras.item(0).getAttribute('aria-label')).toBe('Wind: 7 km/h');
      expect(extras.item(1).getAttribute('aria-label')).toBe('Humidity: 60%');
    });

    it('exposes the extra-column count as a CSS custom property', async () => {
      create();
      await fixture.whenStable();

      const list = element.querySelector<HTMLElement>('.si-weather-widget-forecast-list')!;
      expect(list.style.getPropertyValue('--si-weather-forecast-extras')).toBe('2');
    });

    it('hard-caps extra columns at five', async () => {
      create();
      const overflowing = {
        ...createForecast(),
        columns: Array.from({ length: 7 }, (_, i) => ({
          label: `C${i}`,
          values: ['', '', '']
        }))
      };
      forecast.set(overflowing);
      await fixture.whenStable();

      const firstRow = element.querySelectorAll('.si-weather-widget-forecast-row').item(0);
      expect(firstRow.querySelectorAll('.si-weather-widget-forecast-extra')).toHaveLength(5);
    });

    it('renders the horizontal forecast strip without extra columns', async () => {
      create();
      layout.set('horizontal');
      await fixture.whenStable();

      expect(element.querySelectorAll('.si-weather-widget-forecast-day')).toHaveLength(3);
      // horizontal layout does not render the vertical list / extra columns
      expect(element.querySelector('.si-weather-widget-forecast-list')).toBeNull();
      expect(element.querySelector('.si-weather-widget-forecast-extra')).toBeNull();
    });
  });

  describe('illustration rendering', () => {
    it('renders an SVG source via a masked span using --si-weather-mask-image', async () => {
      create();
      current.set(createCurrent({ illustration: 'assets/weather-icons/sunny.svg' }));
      await fixture.whenStable();

      const mask = element.querySelector<HTMLElement>('.si-weather-widget-illustration-mask');
      expect(mask).not.toBeNull();
      expect(mask!.getAttribute('role')).toBe('img');
      expect(mask!.style.getPropertyValue('--si-weather-mask-image')).toContain(
        "url('assets/weather-icons/sunny.svg')"
      );
      // SVG path goes through the masked branch — no <img> for the today slot.
      expect(element.querySelector('img.si-weather-widget-illustration')).toBeNull();
    });

    it('detects SVG sources even when a query string or fragment is appended', async () => {
      create();
      current.set(createCurrent({ illustration: 'assets/weather-icons/sunny.svg?v=2#tag' }));
      await fixture.whenStable();

      expect(element.querySelector('.si-weather-widget-illustration-mask')).not.toBeNull();
    });

    it('renders raster sources as a plain <img> element', async () => {
      create();
      current.set(createCurrent({ illustration: 'https://example.com/sunny.png' }));
      await fixture.whenStable();

      const img = element.querySelector<HTMLImageElement>('img.si-weather-widget-illustration');
      expect(img).not.toBeNull();
      expect(img!.getAttribute('src')).toBe('https://example.com/sunny.png');
      expect(element.querySelector('.si-weather-widget-illustration-mask')).toBeNull();
    });

    it('uses the icon alt text on the rendered element', async () => {
      create();
      current.set(
        createCurrent({
          illustration: { src: 'https://example.com/sunny.png', alt: 'ALT_TEXT' }
        })
      );
      await fixture.whenStable();

      const img = element.querySelector<HTMLImageElement>('img.si-weather-widget-illustration')!;
      expect(img.getAttribute('alt')).toBe('ALT_TEXT');
    });

    it('falls back to the condition label as alt text when none is provided', async () => {
      create();
      current.set(
        createCurrent({
          condition: 'Cloudy',
          illustration: { src: 'https://example.com/cloudy.png' }
        })
      );
      await fixture.whenStable();

      expect(element.querySelector('img.si-weather-widget-illustration')!.getAttribute('alt')).toBe(
        'Cloudy'
      );
    });

    it('delegates condition-based illustrations to the registered resolver', async () => {
      create(true);
      current.set(createCurrent({ illustration: { condition: 'clouds', daytime: 'night' } }));
      await fixture.whenStable();

      expect(resolver!.lastIcon).toMatchObject({
        condition: 'clouds',
        daytime: 'night'
      });
      const mask = element.querySelector<HTMLElement>('.si-weather-widget-illustration-mask')!;
      expect(mask.style.getPropertyValue('--si-weather-mask-image')).toContain(
        "url('assets/weather-icons/sunny.svg')"
      );
      expect(mask.getAttribute('aria-label')).toBe('RESOLVED_ALT');
    });

    it('skips the illustration when no resolver is registered and no src is given', async () => {
      create();
      current.set(createCurrent({ illustration: { condition: 'rain' } }));
      await fixture.whenStable();

      expect(element.querySelector('.si-weather-widget-illustration-mask')).toBeNull();
      expect(element.querySelector('img.si-weather-widget-illustration')).toBeNull();
    });

    it('skips the illustration when the resolver returns null', async () => {
      create(true);
      resolver!.resolution = null;
      current.set(createCurrent({ illustration: { condition: 'unknown' } }));
      await fixture.whenStable();

      expect(element.querySelector('.si-weather-widget-illustration-mask')).toBeNull();
    });
  });

  describe('accessibility', () => {
    it('labels the metrics list', async () => {
      create();
      current.set(createCurrent());
      metrics.set([{ label: 'Wind', value: '7 km/h' }]);
      await fixture.whenStable();

      const list = element.querySelector('.si-weather-widget-metrics')!;
      expect(list.getAttribute('aria-label')).toBe('Additional weather data');
    });

    it('labels the forecast region', async () => {
      create();
      current.set(createCurrent());
      forecast.set(createForecast());
      await fixture.whenStable();

      const region = element.querySelector('.si-weather-widget-forecast')!;
      expect(region.getAttribute('aria-label')).toBe('Weather forecast');
    });
  });

  describe('loading state', () => {
    it('renders the skeleton instead of the body when showLoadingIndicator is true', async () => {
      create();
      current.set(createCurrent());
      showLoadingIndicator.set(true);
      await fixture.whenStable();

      expect(element.querySelector('.si-weather-widget-skeleton')).not.toBeNull();
      expect(element.querySelector('.si-weather-widget-today')).toBeNull();
    });
  });
});
