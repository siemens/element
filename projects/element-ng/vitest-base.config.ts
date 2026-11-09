/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { fileURLToPath } from 'node:url';
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
    isolate: false,
    // The specs mostly wait on real browser interactions, so more pages than cores keep the CPU busy.
    maxWorkers: 6,
    // Opt-in diagnostic that reports state leaking between tests: LEAK_CHECK=1 CI=true pnpm lib:test
    setupFiles: [
      fileURLToPath(new URL('./vitest-browser.setup.ts', import.meta.url)),
      ...(process.env.LEAK_CHECK
        ? [fileURLToPath(new URL('./vitest-leak-check.setup.ts', import.meta.url))]
        : [])
    ]
  },
  resolve: {
    dedupe: ['@angular/core', '@angular/common', '@angular/platform-browser']
  }
});
