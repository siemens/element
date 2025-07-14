/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormRecord } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { SiFormModule } from '@siemens/element-ng/form';
import { SiFormlyModule } from '@siemens/element-ng/formly';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-sample',
  imports: [CommonModule, SiFormModule, SiFormlyModule],
  templateUrl: './si-dynamic-form-expressions.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleComponent {
  form = new FormRecord({});
  model = {
    readonly: true,
    required: true,
    hidden: false,
    textexpression: 'by text',
    methodExpression: 'by method',
    hiddenfield: 'by hidden',
    observableExpression: 'by observable'
  };
  options: FormlyFormOptions = {
    formState: {
      permissions: {
        someUserspecificPermission: true
      }
    }
  };
  observableStateReadonly = this.model.readonly;
  observableStateRequired = false;
  readonlySubject = new Subject<boolean>();
  requiredSubject = new Subject<boolean>();
  fields: FormlyFieldConfig[] = [
    {
      key: 'readonly',
      type: 'checkbox',
      wrappers: [],
      props: {
        label: 'Readonly'
      }
    },
    {
      key: 'required',
      type: 'checkbox',
      wrappers: [],
      props: {
        label: 'Required'
      }
    },
    {
      key: 'hidden',
      type: 'checkbox',
      wrappers: [],
      props: {
        label: 'Hidden'
      }
    },
    {
      template: `<hr>
      Every field property can be managed by an expression
      <hr>`
    },
    {
      key: 'textexpression',
      type: 'input',
      props: {
        label: 'Text expression'
      },
      expressionProperties: {
        'props.readonly': 'model.readonly',
        'props.required': 'model.required'
      }
    },
    {
      key: 'methodExpression',
      type: 'input',
      props: {
        label: 'Disabled by method expression'
      },
      expressionProperties: {
        'props.disabled': (model: any) => model.readonly,
        'props.required': (model: any) => model.required
      }
    },
    {
      key: 'observableExpression',
      type: 'input',
      props: {
        label: 'Readonly by observable observable',
        readonly: this.observableStateReadonly
      },
      expressionProperties: {
        'props.readonly': this.readonlySubject.asObservable(),
        'props.required': this.requiredSubject.asObservable()
      }
    },
    {
      key: 'hiddenfield',
      type: 'input',
      expressions: {
        hide: 'model.hidden' // Also method or observable
      },
      props: {
        label: 'Hidden by expression'
      }
    },
    {
      key: 'usingFormstate',
      type: 'input',
      props: {},
      expressionProperties: {
        'props.label': (_model: any, formState: any) => {
          if (formState.permissions.someUserspecificPermission) {
            return 'Permitted';
          }
          return 'Prohibited';
        },
        'props.readonly': '!formState.permissions.someUserspecificPermission || model.readonly'
      }
    }
  ];

  toggleObservableStateReadonly(): void {
    this.observableStateReadonly = !this.observableStateReadonly;
    this.readonlySubject.next(this.observableStateReadonly);
  }

  toggleObservableStateRequired(): void {
    this.observableStateRequired = !this.observableStateRequired;
    this.requiredSubject.next(this.observableStateRequired);
  }

  toggleFormStatePermission(): void {
    this.options.formState.permissions.someUserspecificPermission =
      !this.options.formState.permissions.someUserspecificPermission;
  }
}
