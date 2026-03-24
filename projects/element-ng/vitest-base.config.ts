/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { defineConfig } from 'vitest/config';

// Set the timezone for the Node.js process before Playwright launches Chromium.
// Chromium inherits the timezone from the parent process environment.
// The timezone is necessary to ensure consistent date handling in tests that rely on specific date values e.g. SiDatepickerDirective.
process.env.TZ = 'UTC';

export default defineConfig({
  test: {
    env: {
      TZ: 'UTC'
    },
    isolate: true
  },
  resolve: {
    dedupe: ['@angular/core', '@angular/common', '@angular/platform-browser']
  }
});
