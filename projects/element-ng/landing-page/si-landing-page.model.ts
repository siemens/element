/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { TranslatableString } from '@siemens/element-translate-ng/translate';

export interface LandingPageWarning {
  title: TranslatableString;
  content: TranslatableString;
}

export interface UsernamePassword {
  username: string | null | undefined;
  password: string | null | undefined;
}

export interface ChangePassword {
  newPassword: string | null | undefined;
  confirmPassword: string | null | undefined;
}

export type UsernameValidationPayload = Pick<UsernamePassword, 'username'> & {
  validate: (isValid: boolean) => void;
};
