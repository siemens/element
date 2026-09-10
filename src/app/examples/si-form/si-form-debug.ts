/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { JsonPipe } from '@angular/common';
import { Component, input, model } from '@angular/core';
import { form, FormField, FormRoot } from '@angular/forms/signals';
import { SiCardComponent } from '@siemens/element-ng/card';
import {
  provideSiFormFieldConfig,
  SiFormFieldComponent,
  SiFormFieldsetComponent,
  SiFormItemComponent
} from '@siemens/element-ng/form';

export interface FormDebugState {
  disabled: boolean;
  readonly: boolean;
}

@Component({
  selector: 'app-form-debug',
  imports: [
    FormField,
    FormRoot,
    JsonPipe,
    SiCardComponent,
    SiFormFieldComponent,
    SiFormFieldsetComponent,
    SiFormItemComponent
  ],
  template: `
    <si-card heading="Debugging">
      <div class="card-body" body>
        <form class="form-col-layout" style="--si-form-label-width: 140px" [formRoot]="form">
          <si-form-fieldset label="Actions" inline>
            <si-form-field class="form-switch mb-2" label="Disable form">
              <input type="checkbox" class="form-check-input" [formField]="form.disabled" />
            </si-form-field>
            <si-form-field class="form-switch mb-2" label="Readonly form">
              <input type="checkbox" class="form-check-input" [formField]="form.readonly" />
            </si-form-field>
          </si-form-fieldset>
          <si-form-item label="Validation Status">{{ validationStatus() }}</si-form-item>
          <table class="table">
            <thead>
              <tr>
                <th scope="col">Form Data</th>
                <th scope="col">Submitted</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="white-space: pre-wrap">{{ formData() | json }}</td>
                <td style="white-space: pre-wrap">{{ (submitted() | json) ?? 'undefined' }}</td>
              </tr>
            </tbody>
          </table>
        </form>
      </div>
    </si-card>
  `,
  providers: [provideSiFormFieldConfig()],
  host: { class: 'col-12 col-md e2e-ignore' }
})
export class SiFormDebugComponent {
  readonly state = model<FormDebugState>({ disabled: false, readonly: false });
  readonly formData = input.required<unknown>();
  readonly submitted = input<unknown>();
  readonly validationStatus = input.required<string | null>();

  protected readonly form = form(this.state);
}
