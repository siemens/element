/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { NgTemplateOutlet } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { withFormlyBootstrap } from '@ngx-formly/bootstrap';
import { FORMLY_CONFIG, FormlyForm, provideFormlyConfig } from '@ngx-formly/core';
import { SiFormContainerComponent } from '@siemens/element-ng/form';
import { dynamicUiConfig, SiFormlyComponent } from '@siemens/element-ng/formly';

@Component({
  selector: 'si-formly',
  imports: [ReactiveFormsModule, FormlyForm, SiFormContainerComponent, NgTemplateOutlet],
  templateUrl: './si-formly-next.component.html',
  providers: [
    provideFormlyConfig(withFormlyBootstrap()),
    { provide: FORMLY_CONFIG, multi: true, useFactory: dynamicUiConfig }
  ]
})
export class SiFormlyNextComponent<
  TControl extends { [K in keyof TControl]: AbstractControl }
> extends SiFormlyComponent<TControl> {}
