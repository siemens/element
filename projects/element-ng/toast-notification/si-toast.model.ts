/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { StatusType } from '@siemens/element-ng/common';
import { Link } from '@siemens/element-ng/link';
import { TranslatableString } from '@siemens/element-translate-ng/translate';
import { Subject } from 'rxjs';

export interface SiToast {
  state: ToastStateName;
  title: TranslatableString;
  message: TranslatableString;
  disableManualClose?: boolean;
  disableAutoClose?: boolean;
  timeout?: number;
  action?: Link;
  close?: () => void;
  translationParams?: { [key: string]: any };
  hidden?: Subject<void>;
  closeAriaLabel?: TranslatableString;
}

export type ToastStateName = StatusType | 'connection';

export const SI_TOAST_AUTO_HIDE_DELAY = 6000;
