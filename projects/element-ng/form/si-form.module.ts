/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { ModuleWithProviders, NgModule } from '@angular/core';

import { SiFormFieldsetComponent } from './form-fieldset/si-form-fieldset.component';
import { SiFormContainerComponent } from './si-form-container/si-form-container.component';
import { SiFormItemControlInputDirective } from './si-form-item-control-input.directive';
import { SiFormItemComponent } from './si-form-item/si-form-item.component';
import { SiFormValidationErrorMapper } from './si-form-validation-error.model';
import { provideFormValidationErrorMapper } from './si-form-validation-error.provider';

@NgModule({
  imports: [
    SiFormContainerComponent,
    SiFormFieldsetComponent,
    SiFormItemComponent,
    SiFormItemControlInputDirective
  ],
  exports: [
    SiFormContainerComponent,
    SiFormFieldsetComponent,
    SiFormItemComponent,
    SiFormItemControlInputDirective
  ]
})
export class SiFormModule {
  /**
   * Overrides the default configuration of the form module.
   *
   * @param errorMapper - The error mappers is used to resolve angular validation errors.
   * It will be merged with already existing error mappers.
   */
  // We have the errorMapper wrapped in an object, to allow the addition of more configuration fields without breaking the API.
  static withConfiguration({
    validationErrorMapper
  }: {
    validationErrorMapper: SiFormValidationErrorMapper;
  }): ModuleWithProviders<SiFormModule> {
    return {
      ngModule: SiFormModule,
      providers: [provideFormValidationErrorMapper(validationErrorMapper)]
    };
  }
}
