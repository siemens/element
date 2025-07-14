/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Provider } from '@angular/core';
import { TranslatableString } from '@siemens/element-translate-ng/translate';

import { SiFormValidationErrorMapper } from './si-form-validation-error.model';
import { buildDefaults, SiFormValidationErrorService } from './si-form-validation-error.service';

/**
 * The error mapper is used to resolve an angular validation error to a {@link TranslatableString}.
 * It will be merged with already existing error mappers.
 */
export const provideFormValidationErrorMapper = (
  mapper: SiFormValidationErrorMapper
): Provider => ({
  provide: SiFormValidationErrorService,
  // defaults must always be provided in case this is called in app.config
  useFactory: () => new SiFormValidationErrorService({ ...buildDefaults(), ...mapper })
});
