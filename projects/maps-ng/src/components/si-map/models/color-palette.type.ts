/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
/** */
export type ColorPalette = 'status' | 'element';

export type ColorPalettes = {
  [key in ColorPalette]: string[];
};
