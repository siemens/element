/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const ipv4Regex =
  /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

const ipv4CIDRRegex =
  /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\/([1-9]|1[0-9]|2[0-9]|3[0-2]))$/;

const ipV6Regex =
  /^((?:[0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4}|(?:[0-9A-Fa-f]{1,4}:){1,7}:|:(?::[0-9A-Fa-f]{1,4}){1,7}|(?:[0-9A-Fa-f]{1,4}:){1,6}:[0-9A-Fa-f]{1,4}|(?:[0-9A-Fa-f]{1,4}:){1,5}(?::[0-9A-Fa-f]{1,4}){1,2}|(?:[0-9A-Fa-f]{1,4}:){1,4}(?::[0-9A-Fa-f]{1,4}){1,3}|(?:[0-9A-Fa-f]{1,4}:){1,3}(?::[0-9A-Fa-f]{1,4}){1,4}|(?:[0-9A-Fa-f]{1,4}:){1,2}(?::[0-9A-Fa-f]{1,4}){1,5}|[0-9A-Fa-f]{1,4}:(?:(?::[0-9A-Fa-f]{1,4}){1,6})|:(?:(?::[0-9A-Fa-f]{1,4}){1,6}))$/;
/**
 * Validator factory for a IPV6 address.
 */
export const ipV6Validator = (options: {
  zeroCompression?: boolean;
  cidr?: boolean;
}): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) {
      return null;
    }
    const parts = value.split('/');
    const error = { ipv6Address: true };
    if (options.cidr) {
      if (parts.length < 2 || !validateSubnet(parts[1])) {
        return error;
      }
    } else {
      if (parts.length > 1) {
        return error;
      }
    }
    if (parts[0].split('::').length > (options.zeroCompression ? 2 : 1)) {
      return error;
    }
    if (!matchIpV6(parts[0])) {
      return error;
    }

    return null;
  };
};

/**
 * Validates a IPV4 address.
 */
export const ipV4Validator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const v = control.value;
  const valid = v === '' || v?.toString().match(ipv4Regex);
  return valid ? null : { ipv4Address: true };
};

/**
 * Validates a IPV4 address including CIDR.
 */
export const ipV4CIDRValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const v = control.value;
  const valid = v === '' || v?.toString().match(ipv4CIDRRegex);
  return valid ? null : { ipv4Address: true };
};

const validateSubnet = (cidr: string): boolean => {
  const subnet = parseInt(cidr, 10);
  return subnet > 0 && subnet <= 128;
};

const matchIpV6 = (ip: string): boolean => !!ip.match(ipV6Regex) && !!URL.parse(`http://[${ip}]`);
