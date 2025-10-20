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

/**
 * Directive for IPv6 address input fields.
 *
 * Usage:
 *
 * ```ts
 * import { SiFormItemComponent } from '@siemens/element-ng/form';
 * import { SiIp6InputDirective } from '@siemens/element-ng/ip-input';
 *
 * @Component({
 *   template: `
 *     <si-form-item label="IPv6 address">
 *       <input type="text" class="form-control" siIpV6 />
 *     </si-form-item>
 *   `,
 *   imports: [SiFormItemComponent, SiIp6InputDirective, ...]
 * })
 * ```
 */
@Directive({
  selector: 'input[siIpV6]',
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
  ],
  exportAs: 'siIpV6'
})
export class SiIp6InputDirective
  extends SiIpInputDirective
  implements ControlValueAccessor, Validator
{
  protected readonly validatorFn = computed(() =>
    ipV6Validator({ zeroCompression: true, cidr: this.cidr() })
  );

  validate(control: AbstractControl): ValidationErrors | null {
    return this.validatorFn()(control);
  }

  protected maskInput(e: AddrInputEvent): void {
    const { value, pos, type } = e;
    if (!value) {
      this.renderer.setProperty(this.inputEl, 'value', '');
      return;
    }

    // TODO: Restore cursor position
    const ipv6 = splitIpV6Sections({
      type,
      input: value,
      pos,
      zeroCompression: true,
      cidr: this.cidr()
    });
    this.renderer.setProperty(this.inputEl, 'value', ipv6.value);
  }
}
