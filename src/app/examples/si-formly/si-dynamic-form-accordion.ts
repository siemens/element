/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormRecord } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { SiFormModule } from '@spike-rabbit/element-ng/form';
import { SiFormlyModule } from '@spike-rabbit/element-ng/formly';

@Component({
  selector: 'app-sample',
  imports: [SiFormModule, SiFormlyModule],
  templateUrl: './si-dynamic-form-accordion.html',
  styleUrl: './si-dynamic-form-tabs.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {
  form = new FormRecord({});
  model = {
    firstname: 'John',
    lastname: 'Doe',
    email: 'john.d@example.org',
    businessAddr: 'Sample address',
    privateAddr: 'Sample private address of John Doe'
  };
  fields: FormlyFieldConfig[] = [
    {
      type: 'accordion',
      fieldGroup: [
        {
          props: {
            label: 'Personal'
          },
          fieldGroup: [
            {
              key: 'firstname',
              type: 'input',
              props: {
                label: 'First name'
              }
            },
            {
              key: 'lastname',
              type: 'input',
              props: {
                label: 'Last name'
              }
            },
            {
              key: 'email',
              type: 'input',
              props: {
                label: 'Email'
              }
            }
          ]
        },
        {
          props: {
            label: 'Address'
          },
          fieldGroup: [
            {
              key: 'privateAddr',
              type: 'textarea',
              props: {
                autoGrow: true,
                label: 'Private'
              }
            },
            {
              key: 'businessAddr',
              type: 'textarea',
              props: {
                autoGrow: true,
                label: 'Business'
              }
            }
          ]
        },
        {
          props: {
            label: 'Travel information'
          },
          fieldGroup: [
            {
              key: 'startDate',
              type: 'date',
              props: {
                label: 'Date of departure'
              }
            },
            {
              key: 'endDate',
              type: 'date',
              props: {
                label: 'Date of Arrival'
              }
            }
          ]
        }
      ]
    }
  ];
}
