/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
export interface LandingPageWarning {
  title: string;
  content: string;
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
