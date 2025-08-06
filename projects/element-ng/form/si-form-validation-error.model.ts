/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { TranslatableString } from '@spike-rabbit/element-translate-ng/translate';

/**
 * Interface for form error mapper.
 * It resolves a key to either a translatable string or function
 * which is called with the validation error for its key and should return a translatable string.
 */
export interface SiFormValidationErrorMapper {
  required?: TranslatableString | ((error: { required: boolean }) => TranslatableString);
  requiredTrue?: TranslatableString | ((error: { required: boolean }) => TranslatableString);
  email?: TranslatableString | ((error: { email: boolean }) => TranslatableString);
  min?: TranslatableString | ((error: { min: number; actual: number }) => TranslatableString);
  max?: TranslatableString | ((error: { max: number; actual: number }) => TranslatableString);
  minLength?:
    | TranslatableString
    | ((error: { requiredLength: number; actualLength: number }) => TranslatableString);
  maxLength?:
    | TranslatableString
    | ((error: { requiredLength: number; actualLength: number }) => TranslatableString);
  pattern?: TranslatableString | ((error: { pattern: string | RegExp }) => TranslatableString);
  numberFormat?: TranslatableString | ((error: { numberFormat: boolean }) => TranslatableString);
  dateFormat?: TranslatableString | ((error: { format: string }) => TranslatableString);
  maxDate?: TranslatableString | ((error: { max: Date; actual: Date }) => TranslatableString);
  minDate?: TranslatableString | ((error: { min: Date; actual: Date }) => TranslatableString);

  [key: string]: undefined | string | ((error: any) => string);
}
