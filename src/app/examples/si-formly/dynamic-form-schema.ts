/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormRecord } from '@angular/forms';
import { SiFormModule } from '@spike-rabbit/element-ng/form';
import { SiFormlyModule } from '@spike-rabbit/element-ng/formly';
import { JSONSchema7 } from 'json-schema';

export interface Person {
  firstName: string;
  lastName: string;
  age: number;
}

@Component({
  selector: 'app-sample',
  imports: [SiFormModule, SiFormlyModule],
  templateUrl: './dynamic-form-schema.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {
  formGroup = new FormRecord({});
  schema = {
    'title': 'Registration form',
    'description': 'A simple form to register a person',
    'type': 'object',
    'required': ['firstName', 'lastName'],
    'properties': {
      'firstName': {
        'type': 'string',
        'title': 'First name',
        'minLength': 2
      },
      'lastName': {
        'type': 'string',
        'title': 'Last name',
        'minLength': 2
      },
      'age': {
        'type': 'integer',
        'title': 'Age'
      },
      'bio': {
        'type': 'string',
        'title': 'Bio'
      },
      'password': {
        'type': 'string',
        'title': 'Password',
        'minLength': 3
      },
      'telephone': {
        'type': 'string',
        'title': 'Telephone',
        'minLength': 10
      },
      'confirmed': {
        'type': 'boolean',
        'title': 'Confirmed',
        'widget': {
          'formlyConfig': {
            'props': {
              'labelWidth': 12
            }
          }
        }
      }
    }
  } as JSONSchema7;
  model: Person = {
    firstName: 'John',
    lastName: 'Doe',
    age: 23
  };
}
