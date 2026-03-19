/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    isolate: true
  },
  resolve: {
    dedupe: ['@angular/core', '@angular/common', '@angular/platform-browser']
  }
});
