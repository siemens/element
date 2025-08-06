/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { inject, Injectable } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { t } from '@siemens/element-translate-ng/translate';

import { SiFormError } from './si-form-item/si-form-item.component';
import { SiFormValidationErrorMapper } from './si-form-validation-error.model';

/**
 * Creates the map of default error resolver.
 * This is a function as $localize requires an injection context.
 *
 * @internal
 */
export const buildDefaults = (): SiFormValidationErrorMapper => ({
  min: t(() => $localize`:@@SI_FORM_CONTAINER.ERROR.MIN:The value is too small`),
  max: t(() => $localize`:@@SI_FORM_CONTAINER.ERROR.MAX:The value is too large.`),
  required: t(() => $localize`:@@SI_FORM_CONTAINER.ERROR.REQUIRED:A value is required.`),
  requiredTrue: t(
    () => $localize`:@@SI_FORM_CONTAINER.ERROR.REQUIRED_TRUE:The value should be true.`
  ),
  email: t(() => $localize`:@@SI_FORM_CONTAINER.ERROR.EMAIL:The email is not valid.`),
  minlength: t(
    () =>
      $localize`:@@SI_FORM_CONTAINER.ERROR.MIN_LENGTH:The minimum number of characters is not met.`
  ),
  maxlength: t(
    () =>
      $localize`:@@SI_FORM_CONTAINER.ERROR.MAX_LENGTH:A maximum number of characters is exceeded.`
  ),
  ipv4Address: t(() => $localize`:@@SI_FORM_CONTAINER.ERROR.IPV4:Invalid IPv4 address.`),
  ipv6Address: t(() => $localize`:@@SI_FORM_CONTAINER.ERROR.IPV6:Invalid IPv6 address.`),
  pattern: t(
    () =>
      $localize`:@@SI_FORM_CONTAINER.ERROR.PATTERN:The value does not match the predefined pattern.`
  ),
  numberFormat: t(
    () => $localize`:@@SI_FORM_CONTAINER.ERROR.NUMBER_FORMAT:The value is not a valid number.`
  ),
  dateFormat: t(() => $localize`:@@SI_FORM_CONTAINER.ERROR.DATE_FORMAT:Invalid date format.`),
  maxDate: t(
    () => $localize`:@@SI_FORM_CONTAINER.ERROR.MAX_DATE:The date is too far in the future.`
  ),
  minDate: t(() => $localize`:@@SI_FORM_CONTAINER.ERROR.MIN_DATE:The date is too far in the past.`)
});

/**
 * A service to resolve the validation error of an Angular control to a message or translation key.
 *
 * It can be provided using {@link provideFormValidationErrorMapper}.
 * If not provided, there will be a default instance in the root injector using only the default keys.
 *
 * There can be multiple instances to support providing in a lazy loaded module.
 * If the service cannot find a message, it will try to resolve it using a parent service if available.
 *
 * @internal
 */
@Injectable({
  providedIn: 'root',
  useFactory: () => new SiFormValidationErrorService(buildDefaults())
})
export class SiFormValidationErrorService {
  private readonly parent = inject(SiFormValidationErrorService, {
    optional: true,
    skipSelf: true
  });

  // eslint-disable-next-line @angular-eslint/prefer-inject
  constructor(private errorMapper: SiFormValidationErrorMapper) {}

  /**
   * Resolves the provided form errors to a list of {@link SiFormError}.
   * To resolution order is:
   * 1. componentMapper
   * 2. containerMapper using the controlName
   * 3. containerMapper without controlName
   * 4. errorMapper of the service using the controlName
   * 5. errorMapper of the service
   * 6: parent service
   */
  resolveErrors(
    controlName: string | number | null | undefined,
    errors: ValidationErrors | null,
    componentMapper?: SiFormValidationErrorMapper,
    containerMapper?: SiFormValidationErrorMapper
  ): SiFormError[] {
    if (!errors) {
      return [];
    }
    /*
     * Converts the angular error object (like: {required: true, minLength: {actualLength: 1, requiredLength: 3}})
     * to SiFormError[].
     * Therefore, the error key is look up in the error mappers.
     * If it can be resolved, the error will be printed using the resolved text.
     */
    return Object.entries(errors).map(([key, params]) =>
      this.resolveError(key, controlName, params, componentMapper, containerMapper)
    );
  }

  private resolveError(
    key: string,
    controlName: string | number | null | undefined,
    params: any,
    componentMapper?: SiFormValidationErrorMapper,
    containerMapper?: SiFormValidationErrorMapper
  ): SiFormError {
    return (
      this.resolveMessage(key, controlName, params, componentMapper) ??
      this.resolveMessage(key, controlName, params, containerMapper) ??
      this.resolveMessage(key, controlName, params, this.errorMapper) ??
      this.parent?.resolveError(key, controlName, params) ?? { key, params }
    );
  }

  private resolveMessage(
    key: string,
    controlName: string | number | null | undefined,
    params: any,
    mapper?: SiFormValidationErrorMapper
  ): SiFormError | undefined {
    if (!mapper) {
      return undefined;
    }

    const resolver = mapper[`${controlName}.${key}`] ?? mapper[key];

    if (resolver) {
      const message = typeof resolver === 'function' ? resolver(params) : resolver;
      return message ? { key, message, params } : undefined;
    }
    return undefined;
  }
}
