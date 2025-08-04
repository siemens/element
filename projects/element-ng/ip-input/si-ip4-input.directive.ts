/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Directive } from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator
} from '@angular/forms';

import { splitIpV4Sections } from './address-utils';
import { ipV4CIDRValidator, ipV4Validator } from './address-validators';
import { AddrInputEvent, SiIpInputDirective } from './si-ip-input.directive';

@Directive({
  selector: 'input[siIpV4]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: SiIp4InputDirective,
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: SiIp4InputDirective,
      multi: true
    }
  ],
  exportAs: 'siIpV4'
})
export class SiIp4InputDirective
  extends SiIpInputDirective
  implements ControlValueAccessor, Validator
{
  validate(control: AbstractControl): ValidationErrors | null {
    return this.cidr() ? ipV4CIDRValidator(control) : ipV4Validator(control);
  }

  maskInput(e: AddrInputEvent): void {
    const { value, pos, type } = e;
    const sections = splitIpV4Sections({ type, input: value, pos, cidr: this.cidr() });

    this.renderer.setProperty(
      this.inputEl,
      'value',
      sections
        .splice(0, this.cidr() ? 9 : 7)
        .map(s => s.value)
        .join('')
    );
  }
}
