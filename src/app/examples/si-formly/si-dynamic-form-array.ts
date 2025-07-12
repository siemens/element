/**
 * Copyright Siemens 2016 - 2025.
 * SPDX-License-Identifier: MIT
 */
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormRecord } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { SiFormModule } from '@siemens/element-ng/form';
import { SiFormlyModule } from '@siemens/element-ng/formly';

@Component({
  selector: 'app-sample',
  imports: [CommonModule, SiFormModule, SiFormlyModule],
  templateUrl: './si-dynamic-form-array.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {
  form = new FormRecord({});
  model = {
    readonly: false,
    noAdd: false,
    norRmove: false,
    arr: [
      {
        first: 'Joe',
        last: 'Smith'
      },
      {
        first: 'Jane',
        last: 'Smith'
      },
      {
        first: 'Max',
        last: 'Lewis'
      },
      {
        first: 'Maxine',
        last: 'Miller'
      }
    ]
  };
  fields: FormlyFieldConfig[] = [
    {
      key: 'readonly',
      type: 'checkbox',
      props: {
        label: 'readonly'
      }
    },
    {
      key: 'noAdd',
      type: 'checkbox',
      props: {
        label: 'No add'
      }
    },
    {
      key: 'noRemove',
      type: 'checkbox',
      props: {
        label: 'No remove'
      }
    },
    {
      key: 'arr',
      type: 'array',
      props: {
        label: 'Array',
        addText: 'Add', // Text is translated. If not set a '+' as is used as caption
        removeText: 'Remove' // Text is translated. If not set a '-' as is used as caption
      },
      expressionProperties: {
        'props.readonly': (model: any, formState: any, field?: FormlyFieldConfig) => {
          formState.readonly = field!.parent?.model?.readonly; // hack to reach the array fields...
          // In a real world example use formState and not this hack!
          return formState.readonly;
        },
        'props.noAdd': (model: any, formState: any, field?: FormlyFieldConfig) =>
          field!.parent?.model?.noAdd,
        'props.noRemove': (model: any, formState: any, field?: FormlyFieldConfig) =>
          field!.parent?.model?.noRemove
      },
      fieldArray: {
        fieldGroup: [
          {
            key: 'first',
            type: 'input',
            props: {
              label: 'Firstname'
            },
            expressionProperties: {
              'props.readonly': 'formState.readonly'
            }
          },
          {
            key: 'last',
            type: 'input',
            props: {
              label: 'Lastname'
            },
            expressionProperties: {
              'props.readonly': 'formState.readonly'
            }
          },
          {
            template: '<hr>'
          }
        ]
      }
    }
  ];
}
