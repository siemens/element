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
  SiWeatherWidgetLayout
} from './si-weather-widget.types';

class StubResolver extends SiWeatherIconResolver {
  lastIcon: SiWeatherIcon | null = null;
  resolution: SiWeatherIconResolution | null = {
    icon: 'element-sun',
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
        inputBinding('showLoadingIndicator', showLoadingIndicator),
        inputBinding('disableAutoLoadingIndicator', disableAutoLoadingIndicator)
      ]
    });
    element = fixture.nativeElement;
  };

  const setValue = (overrides: Partial<SiWeatherWidgetData> = {}): void => {
    value.set({ current: createCurrent(), ...overrides });
  };

  beforeEach(() => {
    layout = signal<SiWeatherWidgetLayout>('vertical');
    location = signal<string | undefined>(undefined);
    value = signal<SiWeatherWidgetData | undefined>(undefined);
    showLoadingIndicator = signal(false);
    // Disable auto-loading so an empty state does not render the skeleton in
    // tests where we never set any value.
    disableAutoLoadingIndicator = signal(true);
    resolver = null;
  });

  it('applies a layout-specific host class', async () => {
    create();
    setValue();
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

  it('renders the today block from the value payload', async () => {
    create();
    value.set({ current: createCurrent({ temperature: '21°', condition: 'Cloudy' }) });
    await fixture.whenStable();

    expect(element.querySelector('.si-weather-widget-temperature')!.textContent).toContain('21°');
    expect(element.querySelector('.si-weather-widget-condition')!.textContent).toContain('Cloudy');
    expect(element.querySelector('.si-weather-widget-range-min')!.textContent).toContain('18°');
    expect(element.querySelector('.si-weather-widget-range-max')!.textContent).toContain('27°');
  });

  it('renders metrics with label and value', async () => {
    create();
    value.set({
      current: createCurrent(),
      metrics: [
        { label: 'Wind', value: '7 km/h' },
        { label: 'Humidity', value: '55%' }
      ]
    });
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
      setValue();
      await fixture.whenStable();

      expect(element.querySelector('.si-weather-widget-location')!.textContent).toContain('Berlin');
      // condition is suppressed in the compact layout
      expect(element.querySelector('.si-weather-widget-condition')).toBeNull();
    });

    it('does not render a forecast section', async () => {
      create();
      setValue({ forecast: createForecast() });
      await fixture.whenStable();

      expect(element.querySelector('.si-weather-widget-forecast')).toBeNull();
    });
  });

  describe('illustration rendering', () => {
    it('renders a direct src as a plain <img>', async () => {
      create();
      value.set({
        current: createCurrent({ illustration: 'https://example.com/sunny.png' })
      });
      await fixture.whenStable();

      const img = element.querySelector<HTMLImageElement>('img.si-weather-widget-illustration');
      expect(img).not.toBeNull();
      expect(img!.getAttribute('src')).toBe('https://example.com/sunny.png');
    });

    it('renders raster sources as a plain <img> element', async () => {
      create();
      value.set({
        current: createCurrent({ illustration: 'https://example.com/sunny.png' })
      });
      await fixture.whenStable();

      const img = element.querySelector<HTMLImageElement>('img.si-weather-widget-illustration');
      expect(img).not.toBeNull();
      expect(img!.getAttribute('src')).toBe('https://example.com/sunny.png');
      expect(element.querySelector('si-icon.si-weather-widget-illustration')).toBeNull();
    });

    it('uses the icon alt text on the rendered element', async () => {
      create();
      value.set({
        current: createCurrent({
          illustration: { src: 'https://example.com/sunny.png', alt: 'ALT_TEXT' }
        })
      });
      await fixture.whenStable();

      const img = element.querySelector<HTMLImageElement>('img.si-weather-widget-illustration')!;
      expect(img.getAttribute('alt')).toBe('ALT_TEXT');
    });

    it('falls back to the condition label as alt text when none is provided', async () => {
      create();
      value.set({
        current: createCurrent({
          condition: 'Cloudy',
          illustration: { src: 'https://example.com/cloudy.png' }
        })
      });
      await fixture.whenStable();

      expect(element.querySelector('img.si-weather-widget-illustration')!.getAttribute('alt')).toBe(
        'Cloudy'
      );
    });

    it('renders the default condition mapping via <si-icon>', async () => {
      create();
      value.set({ current: createCurrent({ illustration: { condition: 'clear' } }) });
      await fixture.whenStable();

      const icon = element.querySelector<HTMLElement>('si-icon.si-weather-widget-illustration');
      expect(icon).not.toBeNull();
      expect(icon!.getAttribute('data-icon')).toBe('element-sun');
      expect(element.querySelector('img.si-weather-widget-illustration')).toBeNull();
    });

    it('delegates condition-based illustrations to a registered custom resolver', async () => {
      create(true);
      resolver!.resolution = { icon: 'element-cloudy', alt: 'RESOLVED_ALT' };
      value.set({ current: createCurrent({ illustration: { condition: 'clouds' } }) });
      await fixture.whenStable();

      expect(resolver!.lastIcon).toMatchObject({
        condition: 'clouds'
      });
      const icon = element.querySelector<HTMLElement>('si-icon.si-weather-widget-illustration')!;
      expect(icon.getAttribute('data-icon')).toBe('element-cloudy');
      expect(icon.getAttribute('aria-label')).toBe('RESOLVED_ALT');
    });

    it('skips the illustration when the resolver returns null', async () => {
      create();
      // 'unknown' maps to null in the default resolver
      value.set({ current: createCurrent({ illustration: { condition: 'unknown' } }) });
      await fixture.whenStable();

      expect(element.querySelector('si-icon.si-weather-widget-illustration')).toBeNull();
      expect(element.querySelector('img.si-weather-widget-illustration')).toBeNull();
    });

    it('skips the illustration when a custom resolver returns null', async () => {
      create(true);
      resolver!.resolution = null;
      value.set({ current: createCurrent({ illustration: { condition: 'clouds' } }) });
      await fixture.whenStable();

      expect(element.querySelector('si-icon.si-weather-widget-illustration')).toBeNull();
      expect(element.querySelector('img.si-weather-widget-illustration')).toBeNull();
    });
  });

  describe('accessibility', () => {
    it('labels the metrics list', async () => {
      create();
      value.set({
        current: createCurrent(),
        metrics: [{ label: 'Wind', value: '7 km/h' }]
      });
      await fixture.whenStable();

      const list = element.querySelector('.si-weather-widget-metrics')!;
      expect(list.getAttribute('aria-label')).toBe('Additional weather data');
    });
  });

  describe('loading state', () => {
    it('renders the skeleton instead of the body when showLoadingIndicator is true', async () => {
      create();
      setValue();
      showLoadingIndicator.set(true);
      await fixture.whenStable();

      expect(element.querySelector('si-weather-widget-skeleton')).not.toBeNull();
      expect(element.querySelector('.si-weather-widget-today')).toBeNull();
    });
  });
});
