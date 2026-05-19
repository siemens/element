/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { inputBinding, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiWeatherWidgetComponent } from './si-weather-widget.component';
import { SiWeatherWidgetData, SiWeatherWidgetLayout } from './si-weather-widget.types';

describe('SiWeatherWidgetComponent', () => {
  let fixture: ComponentFixture<SiWeatherWidgetComponent>;
  let element: HTMLElement;
  let heading: WritableSignal<string | undefined>;
  let location: WritableSignal<string | undefined>;
  let layout: WritableSignal<SiWeatherWidgetLayout>;
  let value: WritableSignal<SiWeatherWidgetData | undefined>;

  beforeEach(() => {
    heading = signal<string | undefined>(undefined);
    location = signal<string | undefined>(undefined);
    layout = signal<SiWeatherWidgetLayout>('vertical');
    value = signal<SiWeatherWidgetData | undefined>({
      current: {
        temperature: '24°',
        condition: 'Sunny',
        minTemperature: '18°',
        maxTemperature: '27°'
      }
    });

    fixture = TestBed.createComponent(SiWeatherWidgetComponent, {
      bindings: [
        inputBinding('heading', heading),
        inputBinding('location', location),
        inputBinding('layout', layout),
        inputBinding('value', value),
        // Disable auto-loading so the widget renders the today block in tests
        // even though `value` is not provided.
        inputBinding('disableAutoLoadingIndicator', signal(true))
      ]
    });
    element = fixture.nativeElement;
  });

  it('renders the heading in the card header for non-compact layouts', async () => {
    heading.set('Munich');
    await fixture.whenStable();

    expect(element.querySelector('.card-header')!.textContent).toContain('Munich');
  });

  it('hides the card header in the compact layout and renders the location in the body', async () => {
    heading.set('Munich');
    location.set('Berlin');
    layout.set('compact');
    await fixture.whenStable();

    expect(element.querySelector('.card-header')).toBeNull();
    expect(element.querySelector('.si-weather-widget-location')!.textContent).toContain('Berlin');
  });

  it('ignores the location input in non-compact layouts', async () => {
    layout.set('vertical');
    location.set('Berlin');
    await fixture.whenStable();

    expect(element.querySelector('.si-weather-widget-location')).toBeNull();
  });

  it('forwards the current input to the body component', async () => {
    await fixture.whenStable();

    expect(element.querySelector('.si-weather-widget-temperature')!.textContent).toContain('24°');
    expect(element.querySelector('.si-weather-widget-condition')!.textContent).toContain('Sunny');
  });

  it('applies the host class', () => {
    expect(element.classList).toContain('si-weather-widget');
  });
});
