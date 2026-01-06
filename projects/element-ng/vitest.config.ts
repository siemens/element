/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { defineConfig } from 'vitest/config';

const isCI = !!process.env.CI;

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['projects/element-ng/vitest-setup.ts'],
    reporters: isCI ? ['default', 'junit'] : ['default'],
    outputFile: {
      junit: './dist/reports/element-ng/junit.xml'
    },
    coverage: {
      provider: 'v8',
      reporter: ['html', 'cobertura', 'text-summary'],
      reportsDirectory: './dist/coverage/element-ng',
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/*.spec.ts',
        '**/schematics/**',
        '**/*.module.ts',
        '**/testing/**/*.ts'
      ],
      thresholds: {
        lines: 90
      }
    },
    include: ['projects/element-ng/**/*.spec.ts'],
    exclude: ['projects/element-ng/schematics/**']
  },
  css: {
    preprocessorOptions: {
      scss: {
        includePaths: ['node_modules/']
      }
    }
  }
});
