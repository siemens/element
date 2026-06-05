/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  model,
  OnInit,
  output
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { WidgetConfig, WidgetConfigStatus, WidgetInstanceEditor } from '@siemens/dashboards-ng';
import { SiDashboardCardComponent } from '@siemens/element-ng/dashboard';
import { SiFormContainerComponent, SiFormItemComponent } from '@siemens/element-ng/form';
import {
  SelectOption,
  SiSelectComponent,
  SiSelectSimpleOptionsDirective,
  SiSelectSingleValueDirective
} from '@siemens/element-ng/select';

import { WeatherWidgetComponent } from './weather-widget.component';
import {
  ALL_CONDITIONS,
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

  private readonly destroyRef = inject(DestroyRef);

  protected form = new FormGroup<WeatherFormShape>({
    location: new FormControl<string>('Zug', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(1)]
    }),
    layout: new FormControl<WeatherWidgetPayload['layout']>('vertical', { nonNullable: true }),
    temperature: new FormControl<string>('26°', { nonNullable: true }),
    minTemperature: new FormControl<string>('20°', { nonNullable: true }),
    maxTemperature: new FormControl<string>('28°', { nonNullable: true }),
    condition: new FormControl<WeatherWidgetPayload['condition']>('clear', { nonNullable: true }),
    conditionLabel: new FormControl<string>('Sunny', { nonNullable: true }),
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
    return this.form.controls.layout.value === 'compact' ? '' : this.form.controls.location.value;
  }

  ngOnInit(): void {
    const current = this.config();
    const payload = {
      ...DEFAULT_WEATHER_PAYLOAD,
      ...((current.payload ?? {}) as Partial<WeatherWidgetPayload>)
    };
    this.form.reset({
      location: payload.location ?? current.heading ?? 'Zug',
      layout: payload.layout,
      temperature: payload.temperature,
      minTemperature: payload.minTemperature,
      maxTemperature: payload.maxTemperature,
      condition: payload.condition,
      conditionLabel: payload.conditionLabel,
      showMetrics: payload.showMetrics,
      showForecast: payload.showForecast,
      forecastColumnCount: payload.forecastColumnCount
    });

    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      const value = this.form.getRawValue();
      const next = this.config();
      const nextPayload: WeatherWidgetPayload = {
        layout: value.layout,
        location: value.location,
        temperature: value.temperature,
        minTemperature: value.minTemperature,
        maxTemperature: value.maxTemperature,
        condition: value.condition,
        conditionLabel: value.conditionLabel,
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
