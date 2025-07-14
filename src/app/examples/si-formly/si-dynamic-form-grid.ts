/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormRecord } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { SiFormModule } from '@siemens/element-ng/form';
import { SiFormlyModule } from '@siemens/element-ng/formly';

@Component({
  selector: 'app-sample',
  imports: [SiFormModule, SiFormlyModule],
  templateUrl: './si-dynamic-form-grid.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {
  form = new FormRecord({});
  model = {
    firstname1: 'John',
    lastname1: 'Doe',
    email1: 'john.doe@example.org',
    firstname2: 'Johann Georg',
    lastname2: 'Halske',
    email2: 'j.g.halske@example.org',
    businessAddr: 'Sample address of John Doe',
    privateAddr: 'Private address of John Doe, Johann Georg Halske and their families'
  };
  fields: FormlyFieldConfig[] = [
    {
      type: 'object-grid',
      props: {
        // Config for a simple bootstrap grid
        gridConfig: [
          {
            //classes: [], // custom grid classes
            columns: [
              { fieldCount: 4 /*, classes: [] */ }, // custom classes instead of bootstrap grid
              { fieldCount: 4 }
            ]
          },
          {
            columns: [{ fieldCount: 1 }]
          },
          {
            columns: [
              { fieldCount: -1 } // -1 catches all remaining fields
            ]
          }
        ]
      },
      fieldGroup: [
        { template: '<b>Person 1<b/>' },
        {
          key: 'firstname1',
          type: 'input',
          props: {
            label: 'First name'
          }
        },
        {
          key: 'lastname1',
          type: 'input',
          props: {
            label: 'Last name'
          }
        },
        {
          key: 'email1',
          type: 'input',
          props: {
            label: 'Email'
          }
        },
        { template: '<b>Person 2<b/>' },
        {
          key: 'firstname2',
          type: 'input',
          props: {
            label: 'First name'
          }
        },
        {
          key: 'lastname2',
          type: 'input',
          props: {
            label: 'Last name'
          }
        },
        {
          key: 'email2',
          type: 'input',
          props: {
            label: 'Email'
          }
        },
        {
          key: 'privateAddr',
          type: 'textarea',
          props: {
            label: 'Private Address'
          }
        },
        {
          key: 'businessAddr',
          type: 'textarea',
          props: {
            label: 'Business Address'
          }
        }
      ]
    }
  ];
}
