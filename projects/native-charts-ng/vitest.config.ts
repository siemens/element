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
    passWithNoTests: true,
    setupFiles: ['projects/native-charts-ng/vitest-setup.ts'],
    reporters: isCI ? ['default', 'junit'] : ['default'],
    outputFile: {
      junit: './dist/reports/native-charts-ng/junit.xml'
    },
    coverage: {
      provider: 'v8',
      reporter: ['html', 'cobertura', 'text-summary'],
      reportsDirectory: './dist/coverage/native-charts-ng',
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/*.spec.ts',
        '**/*.module.ts',
        '**/testing/**/*.ts'
      ],
      thresholds: {
        lines: 90
      }
    },
    include: ['projects/native-charts-ng/**/*.spec.ts']
  },
  css: {
    preprocessorOptions: {
      scss: {
        includePaths: ['node_modules/']
      }
    }
  }
});
