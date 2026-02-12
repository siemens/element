/**
 * Copyright (c) Siemens 2016 - 2026
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
  /**
   * Trim leading zeros from each part of the IPv4 address
   */
  protected override leaveInput(): void {
    const trimmedValue = this.value
      ?.split('.')
      .map(part => part.replace(/^0+(\d)/, '$1'))
      .join('.');
    if (this.value !== trimmedValue) {
      this.renderer.setProperty(this.inputEl, 'value', trimmedValue);
      this.onChange(trimmedValue);
    }
  }
  /** @internal */
  protected maskInput(e: AddrInputEvent): void {
    const { value, pos, type } = e;
    const ipv4 = splitIpV4Sections({ type, input: value, pos, cidr: this.cidr() });

    this.renderer.setProperty(this.inputEl, 'value', ipv4.value);
    const el = this.elementRef.nativeElement;
    if (value?.length === pos) {
      el.setSelectionRange(ipv4.value.length, ipv4.value.length);
    } else {
      const newPos = pos + ipv4.cursorDelta;
      el.setSelectionRange(newPos, newPos);
    }
  }
}
