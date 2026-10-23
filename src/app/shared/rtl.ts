/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { DestroyRef, inject, Signal, signal } from '@angular/core';
import { isRTL } from '@siemens/element-ng/common';

/**
 * Returns the current text direction as a signal, updated whenever `dir` changes.
 */
export const injectIsRtl = (): Signal<boolean> => {
  const rtl = signal(isRTL());
  const observer = new MutationObserver(() => rtl.set(isRTL()));
  observer.observe(document.documentElement, { attributeFilter: ['dir'] });
  inject(DestroyRef).onDestroy(() => observer.disconnect());
  return rtl.asReadonly();
};
