/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { CommonModule } from '@angular/common';
import { inject, ModuleWithProviders, NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';
import { FormlyFieldMultiCheckbox } from '@ngx-formly/bootstrap/multicheckbox';
import { FormlyFieldRadio } from '@ngx-formly/bootstrap/radio';
import {
  ConfigOption,
  FORMLY_CONFIG,
  FormlyConfig,
  FormlyFormBuilder,
  FormlyModule
} from '@ngx-formly/core';
import { SiFormModule } from '@siemens/element-ng/form';

import { SiFormlyButtonComponent } from './fields/button/si-formly-button.component';
import { SiFormlyDateRangeComponent } from './fields/date-range/si-formly-date-range.component';
import { SiFormlyDateTimeComponent } from './fields/datetime/si-formly-datetime.component';
import { SiFormlyEmailComponent } from './fields/email/si-formly-email.component';
import { SiFormlyIpInputComponent } from './fields/ip-input/si-formly-ip-input.component';
import { SiFormlyNumberComponent } from './fields/number/si-formly-number.component';
import { SiFormlyPasswordComponent } from './fields/password/si-formly-password.component';
import { SiFormlySelectComponent } from './fields/select/si-formly-select.component';
import { SiFormlyTextDisplayComponent } from './fields/text/si-formly-text-display.component';
import { SiFormlyTextareaComponent } from './fields/textarea/si-formly-textarea.component';
import { SiFormlyTimeComponent } from './fields/time/si-formly-time.component';
import { SiFormlyTranslateExtension } from './si-formly-translate.extension';
import { SiFormlyComponent } from './si-formly.component';
import { SiFormlyAccordionComponent } from './structural/si-formly-accordion/si-formly-accordion.component';
import { SiFormlyArrayComponent } from './structural/si-formly-array/si-formly-array.component';
import { SiFormlyObjectGridComponent } from './structural/si-formly-object-grid/si-formly-object-grid.component';
import { SiFormlyObjectPlainComponent } from './structural/si-formly-object-plain/si-formly-object-plain.component';
import { SiFormlyObjectComponent } from './structural/si-formly-object/si-formly-object.component';
import { SiFormlyObjectTabsetComponent } from './structural/si-formly-tabset/si-formly-object-tabset.component';
import { SiFormlyFieldsetComponent } from './wrapper/si-formly-fieldset.component';
import { SiFormlyHorizontalWrapperComponent } from './wrapper/si-formly-horizontal-wrapper.component';
import { SiFormlyIconWrapperComponent } from './wrapper/si-formly-icon-wrapper.component';
import { SiFormlyWrapperComponent } from './wrapper/si-formly-wrapper.component';

const dynamicUiConfig = (): ConfigOption => {
  return {
    types: [
      { name: 'string', extends: 'input' },
      {
        name: 'integer',
        extends: 'input',
        defaultOptions: {
          props: {
            type: 'number'
          }
        }
      },
      {
        name: 'checkbox',
        defaultOptions: {
          props: {
            formCheck: 'form-check'
          }
        }
      },
      { name: 'boolean', extends: 'checkbox' },
      { name: 'multicheckbox', component: FormlyFieldMultiCheckbox, wrappers: ['form-fieldset'] },
      { name: 'radio', component: FormlyFieldRadio, wrappers: ['form-fieldset'] },
      { name: 'enum', extends: 'select' },
      { name: 'array', component: SiFormlyArrayComponent },
      { name: 'object', component: SiFormlyObjectComponent },
      { name: 'object-plain', component: SiFormlyObjectPlainComponent },
      { name: 'object-grid', component: SiFormlyObjectGridComponent },
      { name: 'tabset', component: SiFormlyObjectTabsetComponent },
      { name: 'accordion', component: SiFormlyAccordionComponent },
      { name: 'textdisplay', component: SiFormlyTextDisplayComponent },
      { name: 'email', component: SiFormlyEmailComponent, wrappers: ['form-field'] },
      { name: 'date', component: SiFormlyDateTimeComponent, wrappers: ['form-field'] },
      { name: 'datetime', extends: 'date' },
      { name: 'ipv4', component: SiFormlyIpInputComponent, wrappers: ['form-field'] },
      {
        name: 'ipv6',
        extends: 'ipv4'
      },
      { name: 'date-range', component: SiFormlyDateRangeComponent, wrappers: ['form-field'] },
      { name: 'password', component: SiFormlyPasswordComponent, wrappers: ['form-field'] },
      { name: 'number', component: SiFormlyNumberComponent, wrappers: ['form-field'] },
      { name: 'textarea', component: SiFormlyTextareaComponent, wrappers: ['form-field'] },
      { name: 'button', component: SiFormlyButtonComponent },
      {
        name: 'si-select',
        component: SiFormlySelectComponent,
        wrappers: ['form-field'],
        defaultOptions: { props: { useAriaLabel: true } }
      },
      {
        name: 'time',
        component: SiFormlyTimeComponent,
        wrappers: ['form-field'],
        defaultOptions: { props: { useAriaLabel: true } }
      }
    ],
    wrappers: [
      // { name: 'form-field-original', component: FormlyWrapperFormField }, // Overrides the default
      { name: 'form-field', component: SiFormlyWrapperComponent }, // Overrides the default
      { name: 'form-fieldset', component: SiFormlyFieldsetComponent },
      { name: 'form-field-no-icon', component: SiFormlyWrapperComponent },
      { name: 'form-field-horizontal', component: SiFormlyHorizontalWrapperComponent },
      { name: 'icon-wrapper', component: SiFormlyIconWrapperComponent }
    ],
    extensions: [
      {
        name: 'translate',
        extension: new SiFormlyTranslateExtension()
      }
    ]
  };
};

@NgModule({
  imports: [
    CommonModule,
    FormlyBootstrapModule,
    FormlyModule,
    ReactiveFormsModule,
    SiFormlyIpInputComponent,
    SiFormlyAccordionComponent,
    SiFormlyArrayComponent,
    SiFormlyButtonComponent,
    SiFormlyDateTimeComponent,
    SiFormlyEmailComponent,
    SiFormlyHorizontalWrapperComponent,
    SiFormlyIconWrapperComponent,
    SiFormlyObjectComponent,
    SiFormlyObjectGridComponent,
    SiFormlyObjectPlainComponent,
    SiFormlyObjectTabsetComponent,
    SiFormlyPasswordComponent,
    SiFormlySelectComponent,
    SiFormlyTextareaComponent,
    SiFormlyTextDisplayComponent,
    SiFormlyWrapperComponent,
    SiFormModule
  ],
  declarations: [SiFormlyComponent],
  providers: [
    {
      provide: FORMLY_CONFIG,
      multi: true,
      useFactory: dynamicUiConfig
    }
  ],
  exports: [SiFormlyComponent]
})
export class SiFormlyModule {
  private config = inject(FormlyConfig);
  private configs = inject(FORMLY_CONFIG, { optional: true });

  static forRoot(formlyConfig: ConfigOption = {}): ModuleWithProviders<SiFormlyModule> {
    return {
      ngModule: SiFormlyModule,
      providers: [
        { provide: FORMLY_CONFIG, useValue: formlyConfig, multi: true },
        FormlyConfig,
        FormlyFormBuilder
      ]
    };
  }

  constructor() {
    if (!this.configs) {
      return;
    }

    this.configs.forEach(configuration => {
      this.config.addConfig(configuration);
    });
  }
}
