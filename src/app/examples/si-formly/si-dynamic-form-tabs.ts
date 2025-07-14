/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormRecord } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { SiFormModule } from '@siemens/element-ng/form';
import { SiFormlyModule } from '@siemens/element-ng/formly';

@Component({
  selector: 'app-sample',
  imports: [SiFormModule, SiFormlyModule],
  templateUrl: './si-dynamic-form-tabs.html',
  styleUrl: './si-dynamic-form-tabs.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {
  form = new FormRecord({});
  model = {
    firstname: 'John Doe',
    lastname: 'Smith',
    email: 'john.doe@example.org',
    businessAddr: 'Sample address of John Doe',
    privateAddr: 'Sample private address of John Doe'
  };
  options: FormlyFormOptions = {
    formState: {
      // select the second tab as active by default
      selectedTabIndex: 1
    }
  };
  fields: FormlyFieldConfig[] = [
    {
      type: 'tabset',
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
                label: 'Private'
              }
            },
            {
              key: 'businessAddr',
              type: 'textarea',
              props: {
                label: 'Business'
              }
            }
          ]
        }
      ]
    }
  ];
}
