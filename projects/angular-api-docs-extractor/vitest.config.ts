/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    root: fileURLToPath(new URL('.', import.meta.url)),
    include: ['**/*.spec.ts'],
    exclude: ['dist/**', 'fixtures/**', 'node_modules/**'],
    environment: 'node',
    testTimeout: 60000
  }
});
