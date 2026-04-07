/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { InjectionToken, Signal } from '@angular/core';

import { SiToast } from './si-toast.model';

export interface ToastToken {
  toasts: Signal<SiToast[]>;
  pause: (toast: SiToast) => void;
  resume: (toast: SiToast) => void;
}

export const SI_TOAST_TOKEN = new InjectionToken<ToastToken>('SI_TOAST_TOKEN');
