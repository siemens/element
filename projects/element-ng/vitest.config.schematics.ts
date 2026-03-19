/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    root: path.dirname(fileURLToPath(import.meta.url)),
    include: ['schematics/**/*.spec.ts'],
    exclude: ['schematics/*/files/**/*'],
    globals: true,
    setupFiles: ['schematics/vitest-setup.ts'],
    testTimeout: 60000
  }
});
