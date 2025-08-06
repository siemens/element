/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
type $localize = (strings: TemplateStringsArray, ...expressions: string[]) => string;

declare global {
  let $localize: $localize;

  interface Window {
    $localize: $localize;
  }
}

// This is needed to make TypeScript recognize this file as a module.
export {};
