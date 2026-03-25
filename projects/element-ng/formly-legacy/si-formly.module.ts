/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { CommonModule } from '@angular/common';
import { inject, ModuleWithProviders, NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';
import {
  ConfigOption,
  FORMLY_CONFIG,
  FormlyConfig,
  FormlyFormBuilder,
  FormlyModule
} from '@ngx-formly/core';
import { SiFormModule } from '@siemens/element-ng/form';
import { dynamicUiConfig } from '@siemens/element-ng/formly';

import { SiFormlyComponent } from './si-formly.component';

/**
 * @deprecated This module is based on Angular Formly v6 and will be removed in a
 * future release. Migrate to the standalone `SiFormlyComponent` from
 * `@siemens/element-ng/formly` (Formly v7.1) instead.
 */
@NgModule({
  imports: [CommonModule, FormlyBootstrapModule, FormlyModule, ReactiveFormsModule, SiFormModule],
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
