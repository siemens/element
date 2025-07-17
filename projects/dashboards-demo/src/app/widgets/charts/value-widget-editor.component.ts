/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Component, model, OnInit, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  ObjectFit,
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

import { ValueWidgetComponent } from './value-widget.component';

@Component({
  selector: 'app-value-widget-editor',
  imports: [
    ReactiveFormsModule,
    SiDashboardCardComponent,
    SiFormContainerComponent,
    SiFormFieldsetComponent,
    SiFormItemComponent,
    SiSelectComponent,
    SiSelectSimpleOptionsDirective,
    SiSelectSingleValueDirective,
    ValueWidgetComponent
  ],
  template: `
    <div class="d-flex">
      <div class="col-6 pe-4">
        <si-dashboard-card
          class="h-100"
          [heading]="widgetConfig.heading"
          [enableExpandInteraction]="widgetConfig.expandable"
          [imgAlt]="widgetConfig.image?.alt"
          [imgDir]="widgetConfig.image?.dir"
          [imgObjectFit]="widgetConfig.image?.objectFit"
          [imgObjectPosition]="widgetConfig.image?.objectPosition"
          [imgSrc]="widgetConfig.image?.src"
        >
          <div class="card-body overflow-auto" body>
            <app-value-widget [config]="widgetConfig" />
          </div>
        </si-dashboard-card>
      </div>
      <div class="col-6 ps-4">
        <form class="d-flex h-100" [formGroup]="form" (ngSubmit)="save()">
          <si-form-container
            #formContainer
            disableContainerBreakpoints
            labelWidth="140px"
            [form]="form"
          >
            <div si-form-container-content>
              <si-form-item label="Heading" [disableErrorPrinting]="false">
                <input
                  type="text"
                  id="name"
                  class="form-control"
                  formControlName="heading"
                  required
                  minlength="3"
                />
              </si-form-item>
              <div formGroupName="image">
                <si-form-item label="Source URL">
                  <input type="text" id="src" class="form-control" formControlName="src" />
                </si-form-item>
                <si-form-item label="Alt">
                  <input type="text" id="alt" class="form-control" formControlName="alt" />
                </si-form-item>
                <si-form-fieldset label="Direction" inline>
                  <si-form-item label="Horizontal" class="form-check form-check-inline">
                    <input
                      type="radio"
                      formControlName="dir"
                      value="horizontal"
                      id="dir-horizontal"
                      class="form-check-input"
                    />
                  </si-form-item>
                  <si-form-item label="Vertical" class="form-check form-check-inline">
                    <input
                      type="radio"
                      formControlName="dir"
                      value="vertical"
                      id="dir-vertical"
                      class="form-check-input"
                    />
                  </si-form-item>
                </si-form-fieldset>
                <si-form-item label="Object Fit">
                  <si-select
                    class="form-control"
                    formControlName="objectFit"
                    id="objectFit"
                    [options]="optionsList"
                  />
                </si-form-item>
                <si-form-item label="Object Position">
                  <input
                    type="text"
                    id="objectPosition"
                    class="form-control"
                    formControlName="objectPosition"
                  />
                </si-form-item>
              </div>
            </div>
          </si-form-container>
        </form>
      </div>
    </div>
  `
})
export class ValueWidgetEditorComponent implements WidgetInstanceEditor, OnInit {
  readonly config = model.required<WidgetConfig | Omit<WidgetConfig, 'id'>>();

  readonly statusChanges = output<Partial<WidgetConfigStatus>>();

  protected form = new FormGroup({
    heading: new FormControl<string>(''),
    image: new FormGroup({
      src: new FormControl<string>(''),
      alt: new FormControl<string>(''),
      dir: new FormControl<'horizontal' | 'vertical'>('horizontal'),
      objectFit: new FormControl<ObjectFit>('scale-down'),
      objectPosition: new FormControl<string | undefined>(undefined)
    })
  });

  protected optionsList: SelectOption<ObjectFit>[] = [
    { type: 'option', value: 'contain', label: 'contain' },
    { type: 'option', value: 'cover', label: 'cover' },
    { type: 'option', value: 'fill', label: 'fill' },
    { type: 'option', value: 'none', label: 'none' },
    { type: 'option', value: 'scale-down', label: 'scale-down' }
  ];

  protected get widgetConfig(): WidgetConfig {
    return this.config() as WidgetConfig;
  }

  ngOnInit(): void {
    this.form.reset(this.config());
    this.form.valueChanges.subscribe(value => {
      const config = this.config();
      Object.assign(config, value);
      this.statusChanges.emit({
        invalid: this.form.invalid
      });
      this.config.set(config);
    });
  }

  save(): void {
    this.config.set({
      ...this.config(),
      heading: this.form.value.heading!
    });
  }
}
