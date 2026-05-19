/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component, model, OnInit, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  WidgetConfig,
  WidgetConfigStatus,
  WidgetInstanceEditor
} from '@siemens/dashboards-ng';
import { SiDashboardCardComponent } from '@siemens/element-ng/dashboard';
import {
  SiFormContainerComponent,
  SiFormFieldsetComponent,
  SiFormItemComponent
} from '@siemens/element-ng/form';
import {
  SelectOption,
  SiSelectComponent,
  SiSelectSimpleOptionsDirective,
  SiSelectSingleValueDirective
} from '@siemens/element-ng/select';

import { WeatherWidgetComponent } from './weather-widget.component';
import {
  ALL_CONDITIONS,
  ALL_MODIFIERS,
  DEFAULT_WEATHER_PAYLOAD,
  WeatherWidgetPayload
} from './weather-widget.mocks';

interface WeatherFormShape {
  location: FormControl<string>;
  layout: FormControl<WeatherWidgetPayload['layout']>;
  temperature: FormControl<string>;
  minTemperature: FormControl<string>;
  maxTemperature: FormControl<string>;
  condition: FormControl<WeatherWidgetPayload['condition']>;
  conditionLabel: FormControl<string>;
  daytime: FormControl<WeatherWidgetPayload['daytime']>;
  modWindy: FormControl<boolean>;
  modFreezing: FormControl<boolean>;
  modRain: FormControl<boolean>;
  modSnow: FormControl<boolean>;
  modThunder: FormControl<boolean>;
  showMetrics: FormControl<boolean>;
  showForecast: FormControl<boolean>;
  forecastColumnCount: FormControl<number>;
}

@Component({
  selector: 'app-weather-widget-editor',
  imports: [
    ReactiveFormsModule,
    SiDashboardCardComponent,
    SiFormContainerComponent,
    SiFormFieldsetComponent,
    SiFormItemComponent,
    SiSelectComponent,
    SiSelectSimpleOptionsDirective,
    SiSelectSingleValueDirective,
    WeatherWidgetComponent
  ],
  template: `
    <div class="d-flex">
      <div class="col-6 pe-4">
        <si-dashboard-card
          class="h-100"
          [heading]="previewHeading()"
          [enableExpandInteraction]="widgetConfig.expandable"
        >
          <div class="card-body overflow-auto" body>
            <app-weather-widget [config]="previewConfig" />
          </div>
        </si-dashboard-card>
      </div>
      <div class="col-6 ps-4">
        <form class="d-flex h-100" [formGroup]="form">
          <si-form-container disableContainerBreakpoints labelWidth="160px" [form]="form">
            <div si-form-container-content>
              <si-form-item label="Location">
                <input
                  type="text"
                  id="location"
                  class="form-control"
                  formControlName="location"
                  required
                  minlength="1"
                />
              </si-form-item>
              <si-form-item label="Layout">
                <si-select
                  class="form-control"
                  id="layout"
                  formControlName="layout"
                  [options]="layoutOptions"
                />
              </si-form-item>
              <si-form-item label="Temperature">
                <input
                  type="text"
                  id="temperature"
                  class="form-control"
                  formControlName="temperature"
                />
              </si-form-item>
              <si-form-item label="Min temperature">
                <input
                  type="text"
                  id="minTemperature"
                  class="form-control"
                  formControlName="minTemperature"
                />
              </si-form-item>
              <si-form-item label="Max temperature">
                <input
                  type="text"
                  id="maxTemperature"
                  class="form-control"
                  formControlName="maxTemperature"
                />
              </si-form-item>
              <si-form-item label="Condition">
                <si-select
                  class="form-control"
                  id="condition"
                  formControlName="condition"
                  [options]="conditionOptions"
                />
              </si-form-item>
              <si-form-item label="Condition label">
                <input
                  type="text"
                  id="conditionLabel"
                  class="form-control"
                  formControlName="conditionLabel"
                />
              </si-form-item>
              <si-form-fieldset label="Daytime" inline>
                <si-form-item label="Day" class="form-check form-check-inline">
                  <input
                    type="radio"
                    formControlName="daytime"
                    value="day"
                    id="daytime-day"
                    class="form-check-input"
                  />
                </si-form-item>
                <si-form-item label="Night" class="form-check form-check-inline">
                  <input
                    type="radio"
                    formControlName="daytime"
                    value="night"
                    id="daytime-night"
                    class="form-check-input"
                  />
                </si-form-item>
              </si-form-fieldset>
              <si-form-fieldset label="Modifiers" inline>
                <si-form-item label="Windy" class="form-check form-check-inline">
                  <input
                    type="checkbox"
                    formControlName="modWindy"
                    id="mod-windy"
                    class="form-check-input"
                  />
                </si-form-item>
                <si-form-item label="Freezing" class="form-check form-check-inline">
                  <input
                    type="checkbox"
                    formControlName="modFreezing"
                    id="mod-freezing"
                    class="form-check-input"
                  />
                </si-form-item>
                <si-form-item label="Rain" class="form-check form-check-inline">
                  <input
                    type="checkbox"
                    formControlName="modRain"
                    id="mod-rain"
                    class="form-check-input"
                  />
                </si-form-item>
                <si-form-item label="Snow" class="form-check form-check-inline">
                  <input
                    type="checkbox"
                    formControlName="modSnow"
                    id="mod-snow"
                    class="form-check-input"
                  />
                </si-form-item>
                <si-form-item label="Thunder" class="form-check form-check-inline">
                  <input
                    type="checkbox"
                    formControlName="modThunder"
                    id="mod-thunder"
                    class="form-check-input"
                  />
                </si-form-item>
              </si-form-fieldset>
              <si-form-item label="Show metrics" class="form-check">
                <input
                  type="checkbox"
                  formControlName="showMetrics"
                  id="showMetrics"
                  class="form-check-input"
                />
              </si-form-item>
              <si-form-item label="Show forecast" class="form-check">
                <input
                  type="checkbox"
                  formControlName="showForecast"
                  id="showForecast"
                  class="form-check-input"
                />
              </si-form-item>
              <si-form-item label="Forecast columns">
                <input
                  type="number"
                  id="forecastColumnCount"
                  class="form-control"
                  min="0"
                  max="5"
                  step="1"
                  formControlName="forecastColumnCount"
                />
              </si-form-item>
            </div>
          </si-form-container>
        </form>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WeatherWidgetEditorComponent implements WidgetInstanceEditor, OnInit {
  readonly config = model.required<WidgetConfig | Omit<WidgetConfig, 'id'>>();
  readonly statusChanges = output<Partial<WidgetConfigStatus>>();

  protected form = new FormGroup<WeatherFormShape>({
    location: new FormControl<string>('Zug', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(1)]
    }),
    layout: new FormControl<WeatherWidgetPayload['layout']>('vertical', { nonNullable: true }),
    temperature: new FormControl<string>('26°', { nonNullable: true }),
    minTemperature: new FormControl<string>('20°', { nonNullable: true }),
    maxTemperature: new FormControl<string>('28°', { nonNullable: true }),
    condition: new FormControl<WeatherWidgetPayload['condition']>('sunny', { nonNullable: true }),
    conditionLabel: new FormControl<string>('Sunny', { nonNullable: true }),
    daytime: new FormControl<WeatherWidgetPayload['daytime']>('day', { nonNullable: true }),
    modWindy: new FormControl<boolean>(false, { nonNullable: true }),
    modFreezing: new FormControl<boolean>(false, { nonNullable: true }),
    modRain: new FormControl<boolean>(false, { nonNullable: true }),
    modSnow: new FormControl<boolean>(false, { nonNullable: true }),
    modThunder: new FormControl<boolean>(false, { nonNullable: true }),
    showMetrics: new FormControl<boolean>(true, { nonNullable: true }),
    showForecast: new FormControl<boolean>(true, { nonNullable: true }),
    forecastColumnCount: new FormControl<number>(2, { nonNullable: true })
  });

  protected readonly layoutOptions: SelectOption<WeatherWidgetPayload['layout']>[] = [
    { type: 'option', value: 'vertical', label: 'vertical' },
    { type: 'option', value: 'horizontal', label: 'horizontal' },
    { type: 'option', value: 'compact', label: 'compact' }
  ];

  protected readonly conditionOptions: SelectOption<WeatherWidgetPayload['condition']>[] =
    ALL_CONDITIONS.map(c => ({ type: 'option', value: c, label: c }));

  protected get widgetConfig(): WidgetConfig {
    return this.config() as WidgetConfig;
  }

  protected get previewConfig(): WidgetConfig {
    return this.config() as WidgetConfig;
  }

  protected previewHeading(): string {
    return this.form.controls.layout.value === 'compact'
      ? ''
      : this.form.controls.location.value;
  }

  ngOnInit(): void {
    const current = this.config();
    const payload = { ...DEFAULT_WEATHER_PAYLOAD, ...((current.payload ?? {}) as Partial<WeatherWidgetPayload>) };
    this.form.reset({
      location: payload.location ?? current.heading ?? 'Zug',
      layout: payload.layout,
      temperature: payload.temperature,
      minTemperature: payload.minTemperature,
      maxTemperature: payload.maxTemperature,
      condition: payload.condition,
      conditionLabel: payload.conditionLabel,
      daytime: payload.daytime,
      modWindy: payload.modifiers.includes('windy'),
      modFreezing: payload.modifiers.includes('freezing'),
      modRain: payload.modifiers.includes('rain'),
      modSnow: payload.modifiers.includes('snow'),
      modThunder: payload.modifiers.includes('thunder'),
      showMetrics: payload.showMetrics,
      showForecast: payload.showForecast,
      forecastColumnCount: payload.forecastColumnCount
    });

    this.form.valueChanges.subscribe(() => {
      const value = this.form.getRawValue();
      const next = this.config();
      const modifiers = ALL_MODIFIERS.filter(m => {
        switch (m) {
          case 'windy':
            return value.modWindy;
          case 'freezing':
            return value.modFreezing;
          case 'rain':
            return value.modRain;
          case 'snow':
            return value.modSnow;
          case 'thunder':
            return value.modThunder;
          default:
            return false;
        }
      });
      const nextPayload: WeatherWidgetPayload = {
        layout: value.layout,
        location: value.location,
        temperature: value.temperature,
        minTemperature: value.minTemperature,
        maxTemperature: value.maxTemperature,
        condition: value.condition,
        conditionLabel: value.conditionLabel,
        daytime: value.daytime,
        modifiers,
        showMetrics: value.showMetrics,
        showForecast: value.showForecast,
        forecastColumnCount: clamp(Number(value.forecastColumnCount) || 0, 0, 5)
      };
      next.heading = value.layout === 'compact' ? '' : value.location;
      next.payload = nextPayload;
      this.statusChanges.emit({ invalid: this.form.invalid });
      this.config.set({ ...next });
    });
  }
}

const clamp = (v: number, min: number, max: number): number => Math.max(min, Math.min(max, v));
