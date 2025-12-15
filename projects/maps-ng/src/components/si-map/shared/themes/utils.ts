/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { DestroyRef, inject, Signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { fromEvent, map } from 'rxjs';

/** Indicate the current theme is dark otherwise light. */
export const observeDarkTheme = (destroyRef?: DestroyRef): Signal<boolean> => {
  destroyRef ??= inject(DestroyRef);
  return toSignal(
    fromEvent<CustomEvent>(window, 'theme-switch').pipe(
      takeUntilDestroyed(destroyRef),
      map(e => e.detail.dark)
    ),
    { initialValue: document.documentElement.classList.contains('app--dark') }
  );
};
