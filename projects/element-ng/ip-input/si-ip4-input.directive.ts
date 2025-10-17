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

/**
 * Directive for IPv4 address input fields.
 *
 * Usage:
 *
 * ```ts
 * import { SiFormItemComponent } from '@siemens/element-ng/form';
 * import { SiIp4InputDirective } from '@siemens/element-ng/ip-input';
 *
 * @Component({
 *   template: `
 *     <si-form-item label="IPv4 address">
 *       <input type="text" class="form-control" siIpV4 />
 *     </si-form-item>
 *   `,
 *   imports: [SiFormItemComponent, SiIp4InputDirective, ...]
 * })
 * ```
 */
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

  protected maskInput(e: AddrInputEvent): void {
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
