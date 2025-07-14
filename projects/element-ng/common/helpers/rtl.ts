/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
export const isRTL = (elem?: HTMLElement): boolean =>
  getComputedStyle(elem ?? document.documentElement).direction === 'rtl';

export const correctKeyRTL = (key: string): string => {
  if (!isRTL()) {
    return key;
  }
  return key === 'ArrowLeft' ? 'ArrowRight' : key === 'ArrowRight' ? 'ArrowLeft' : key;
};
