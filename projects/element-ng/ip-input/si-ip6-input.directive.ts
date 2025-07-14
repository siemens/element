/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { computed, Directive } from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator
} from '@angular/forms';

import { splitIpV6Sections } from './address-utils';
import { ipV6Validator } from './address-validators';
import { AddrInputEvent, SiIpInputDirective } from './si-ip-input.directive';

@Directive({
  selector: 'input[siIpV6]',
  exportAs: 'siIpV6',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: SiIp6InputDirective,
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: SiIp6InputDirective,
      multi: true
    }
  ]
})
export class SiIp6InputDirective
  extends SiIpInputDirective
  implements ControlValueAccessor, Validator
{
  readonly validatorFn = computed(() =>
    ipV6Validator({ zeroCompression: true, cidr: this.cidr() })
  );

  validate(control: AbstractControl): ValidationErrors | null {
    return this.validatorFn()(control);
  }

  maskInput(e: AddrInputEvent): void {
    const { value, pos, type } = e;
    if (!value) {
      this.renderer.setProperty(this.inputEl, 'value', '');
      return;
    }

    // TODO: Restore cursor position
    const sections = splitIpV6Sections({
      type,
      input: value,
      pos,
      zeroCompression: true,
      cidr: this.cidr()
    });
    this.renderer.setProperty(
      this.inputEl,
      'value',
      sections
        .splice(0, this.cidr() ? 17 : 15)
        .map(s => s.value)
        .join('')
    );
  }
}
