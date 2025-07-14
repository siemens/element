/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { computed, Directive, input, output } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

const RE_UPPER_CASE = /[A-Z]/;
const RE_LOWER_CASE = /[a-z]/;
const RE_DIGITS = /[0-9]/;
const RE_SPECIAL_CHARS = /[\x21-\x2F|\x3A-\x40|\x5B-\x60]/;
const RE_WHITESPACES = /\s/;

export interface PasswordPolicy {
  /**
   * Define minimal number of characters.
   */
  minLength: number;
  /**
   * Define if uppercase characters are required in password.
   */
  uppercase: boolean;
  /**
   * Define if lowercase characters are required in password.
   */
  lowercase: boolean;
  /**
   * Define if digits are required in password.
   */
  digits: boolean;
  /**
   * Define if special characters are required in password.
   */
  special: boolean;
  /**
   * Whether to allow whitespaces. By default whitespaces are not allowed.
   */
  allowWhitespace?: boolean;
  /**
   * Minimum required policies for valid password. When set to a number greater than 0,
   * defines the number of policies that must be met for the password to be valid.
   * E.g. when set to 3 and the policies uppercase/lowercase/digits/special are all set
   * and the password contains 3 out of these four, the password will be valid.
   */
  minRequiredPolicies?: number;
}

interface StrengthCheck {
  length: boolean;
  strength: number;
}

@Directive({
  selector: '[siPasswordStrength]',
  providers: [{ provide: NG_VALIDATORS, useExisting: SiPasswordStrengthDirective, multi: true }],
  host: {
    '[class.no-validation]': 'noValidation'
  }
})
export class SiPasswordStrengthDirective implements Validator {
  private readonly maxStrength = computed(() => {
    const strength = this.siPasswordStrength();
    return (
      1 +
      (strength.uppercase ? 1 : 0) +
      (strength.lowercase ? 1 : 0) +
      (strength.digits ? 1 : 0) +
      (strength.special ? 1 : 0)
    );
  });

  protected noValidation = false;

  /**
   * Define Siemens password strength.
   *
   * @defaultValue
   * ```
   * {
   *     minLength: 8,
   *     uppercase: true,
   *     lowercase: true,
   *     digits: true,
   *     special: true
   *   }
   * ```
   */
  readonly siPasswordStrength = input<PasswordPolicy>({
    minLength: 8,
    uppercase: true,
    lowercase: true,
    digits: true,
    special: true
  });

  /**
   * Output callback event called when the password changes. The number
   * indicated the number of rules which still can be met. (`-2` --\> 2 rules are
   * still unmet, `0` --\> all met)
   */
  readonly passwordStrengthChanged = output<number | void>();

  /** @internal */
  validate(control: AbstractControl): ValidationErrors {
    const strength = this.getStrength(control.value);
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const requiredStrength = this.siPasswordStrength().minRequiredPolicies || this.maxStrength();
    if (strength.length && strength.strength >= requiredStrength) {
      return {};
    }
    return { siPasswordStrength: true };
  }

  private getStrength(password: string): StrengthCheck {
    const policy = this.siPasswordStrength();
    if (!password) {
      this.noValidation = false;
      this.passwordStrengthChanged.emit();
      return { length: false, strength: 0 };
    }

    let strength = 0;
    // Strength check
    const length = password.length >= policy.minLength;
    strength += length ? 1 : 0;
    strength += policy.uppercase && password.match(RE_UPPER_CASE) ? 1 : 0;
    strength += policy.lowercase && password.match(RE_LOWER_CASE) ? 1 : 0;
    strength += policy.digits && password.match(RE_DIGITS) ? 1 : 0;
    strength += policy.special && password.match(RE_SPECIAL_CHARS) ? 1 : 0;
    if (policy.allowWhitespace !== true) {
      strength = password.match(RE_WHITESPACES) ? 0 : strength;
    }
    this.noValidation = true;
    // Notify listeners
    this.passwordStrengthChanged.emit(strength - this.maxStrength());
    return { length, strength };
  }
}
