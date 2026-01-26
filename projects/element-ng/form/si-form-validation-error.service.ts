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
  // Phone number specific
  notSupportedPhoneNumberCountry: t(
    () => $localize`:@@SI_FORM_CONTAINER.ERROR.PHONE_COUNTRY:Unsupported country/region code`
  ),
  invalidPhoneNumberFormat: t(
    () => $localize`:@@SI_FORM_CONTAINER.ERROR.INVALID_PHONE:Invalid phone number`
  ),
  // IP address specific
  ipv4Address: t(() => $localize`:@@SI_FORM_CONTAINER.ERROR.IPV4:Invalid IPv4 address`),
  ipv6Address: t(() => $localize`:@@SI_FORM_CONTAINER.ERROR.IPV6:Invalid IPv6 address`),
  // Min / max
  max: t(() => $localize`:@@SI_FORM_CONTAINER.ERROR.MAX:Max. {{max}}`),
  min: t(() => $localize`:@@SI_FORM_CONTAINER.ERROR.MIN:Min. {{min}}`),
  maxlength: t(
    () => $localize`:@@SI_FORM_CONTAINER.ERROR.MAX_LENGTH:Max. {{requiredLength}} characters`
  ),
  minlength: t(
    () => $localize`:@@SI_FORM_CONTAINER.ERROR.MIN_LENGTH:Min. {{requiredLength}} characters`
  ),
  // Date specific
  dateFormat: t(() => $localize`:@@SI_FORM_CONTAINER.ERROR.DATE_FORMAT:Invalid date`),
  endBeforeStart: t(
    () => $localize`:@@SI_FORM_CONTAINER.ERROR.END_BEFORE_START:End date before start date`
  ),
  invalidEndDateFormat: t(
    () => $localize`:@@SI_FORM_CONTAINER.ERROR.DATE_FORMAT_END:Invalid end date`
  ),
  invalidStartDateFormat: t(
    () => $localize`:@@SI_FORM_CONTAINER.ERROR.DATE_FORMAT_START:Invalid start date`
  ),
  maxDate: t(
    () => $localize`:@@SI_FORM_CONTAINER.ERROR.MAX_DATE:Date prior to {{maxString}} required`
  ),
  minDate: t(
    () => $localize`:@@SI_FORM_CONTAINER.ERROR.MIN_DATE:Date after {{minString}} required`
  ),
  maxTime: t(
    () => $localize`:@@SI_FORM_CONTAINER.ERROR.MAX_TIME:Time prior to {{maxString}} required`
  ),
  minTime: t(
    () => $localize`:@@SI_FORM_CONTAINER.ERROR.MIN_TIME:Time after {{minString}} required`
  ),
  rangeAfterMaxDate: t(
    () =>
      $localize`:@@SI_FORM_CONTAINER.ERROR.RANGE_AFTER_MAX_DATE:Period prior to {{maxString}} required`
  ),
  rangeBeforeMinDate: t(
    () =>
      $localize`:@@SI_FORM_CONTAINER.ERROR.RANGE_BEFORE_MIN_DATE:Period after {{minString}} required`
  ),
  // Time units
  hours: t(
    () => $localize`:@@SI_FORM_CONTAINER.ERROR.HOURS:Integer between 0 and {{max}} required`
  ),
  minutes: t(() => $localize`:@@SI_FORM_CONTAINER.ERROR.MINUTES:Integer between 0 and 59 required`),
  seconds: t(() => $localize`:@@SI_FORM_CONTAINER.ERROR.SECONDS:Integer between 0 and 59 required`),
  milliseconds: t(
    () => $localize`:@@SI_FORM_CONTAINER.ERROR.MILLISECONDS:Integer between 0 and 999 required`
  ),
  // Various
  email: t(() => $localize`:@@SI_FORM_CONTAINER.ERROR.EMAIL:Invalid email address`),
  numberFormat: t(() => $localize`:@@SI_FORM_CONTAINER.ERROR.NUMBER_FORMAT:Number required`),
  pattern: t(
    () =>
      $localize`:@@SI_FORM_CONTAINER.ERROR.PATTERN:The value does not match the predefined pattern.`
  ),
  required: t(() => $localize`:@@SI_FORM_CONTAINER.ERROR.REQUIRED:Required`),
  requiredTrue: t(() => $localize`:@@SI_FORM_CONTAINER.ERROR.REQUIRED_TRUE:Required`)
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
