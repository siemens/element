/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { PlaywrightTestConfig } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig = {
  testDir: './playwright/e2e/element',
  snapshotDir: './playwright/snapshots',
  outputDir: './playwright/results/tests',
  reporter: [
    ['github'],
    [
      'html',
      {
        open: 'on-failure',
        outputFolder: './playwright/results/preview'
      }
    ],
    [
      'junit',
      {
        outputFile: `./playwright/results/reports/report-e2e.xml`,
        includeProjectInTestName: true
      }
    ],
    [
      './playwright/reporters/playwright-axe-reporter.ts',
      {
        outputFile: './playwright/results/a11y/accessibility-report.json',
        htmlOutputDir: './playwright/results/a11y/tests'
      }
    ]
  ]
};

export default config;
