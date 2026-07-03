/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { inputBinding, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiWeatherWidgetForecastComponent } from './si-weather-widget-forecast.component';
import { SiWeatherWidgetForecast } from './si-weather-widget.types';

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

describe('SiWeatherWidgetForecastComponent', () => {
  let fixture: ComponentFixture<SiWeatherWidgetForecastComponent>;
  let element: HTMLElement;
  let forecast: WritableSignal<SiWeatherWidgetForecast>;
  let layout: WritableSignal<'vertical' | 'horizontal'>;
  let forecastLabel: WritableSignal<string | undefined>;

  const create = (): void => {
    fixture = TestBed.createComponent(SiWeatherWidgetForecastComponent, {
      bindings: [
        inputBinding('forecast', forecast),
        inputBinding('layout', layout),
        inputBinding('forecastLabel', forecastLabel)
      ]
    });
    element = fixture.nativeElement;
  };

  beforeEach(() => {
    forecast = signal(createForecast());
    layout = signal<'vertical' | 'horizontal'>('vertical');
    forecastLabel = signal<string | undefined>('Weather forecast');
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
    forecast.set({
      ...createForecast(),
      columns: Array.from({ length: 7 }, (_, i) => ({
        label: `C${i}`,
        values: ['', '', '']
      }))
    });
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

  it('labels the forecast region with the provided forecastLabel', async () => {
    create();
    await fixture.whenStable();

    const region = element.querySelector('.si-weather-widget-forecast')!;
    expect(region.getAttribute('aria-label')).toBe('Weather forecast');
  });
});
