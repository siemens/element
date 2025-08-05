/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { devices, type PlaywrightTestConfig } from '@playwright/test';

const isContainer = !!process.env.PLAYWRIGHT_CONTAINER;
const port = process.env.PORT ?? '4200';
const dashboardsPort = process.env.DASHBOARDS_PORT ?? '4201';
const localAddress = process.env.LOCAL_ADDRESS ?? 'localhost';
const onDifferentLocalAddress = localAddress !== 'localhost';
const isCI = !!process.env.CI;
const webServerCommand = 'npx http-server dist/element-examples -s -p 4200 -a 127.0.0.1';
const dashboardsServerCommand = 'npx http-server dist/dashboards-demo -s -p 4201 -a 127.0.0.1';
let isA11y =
  !!process.env.PLAYWRIGHT_isa11y && process.env.PLAYWRIGHT_isa11y.toLocaleLowerCase() !== 'false';
let isVrt =
  !!process.env.PLAYWRIGHT_isvrt && process.env.PLAYWRIGHT_isvrt.toLocaleLowerCase() !== 'false';
// Per default do both A11y and VRT
if (!isA11y && !isVrt) {
  isA11y = true;
  isVrt = true;
}
// List of all projects, which will be used to automatically start the web server if necessary.
let projectsToRun = [
  `element-examples/chromium/light`,
  `element-examples/chromium/dark`,
  `dashboards-demo/chromium/light`,
  `dashboards-demo/chromium/dark`
];

// Check if only one is run using the command-line arguments. Do not use for any other reason because this won't be set for runner subprocesses.
const onlySelectProjects = process.argv.find(val => val.startsWith('--project='));
if (onlySelectProjects) {
  let projectsGlob = onlySelectProjects.split('=')[1];
  if (projectsGlob.endsWith('/*')) {
    projectsGlob = projectsGlob.replace(/(\/\*)+$/, '');
    projectsToRun = projectsToRun.filter(project => project.startsWith(projectsGlob));
  } else {
    projectsToRun = [projectsGlob];
  }
}

/* Use the same default viewport as cypress */
const baseViewport = {
  width: 1000,
  height: 660
};

const chromeLaunchOptions = {
  args: [
    '--disable-skia-runtime-opts',
    '--force-color-profile=srgb',
    '--disable-low-res-tiling',
    '--disable-oop-rasterization',
    '--disable-composited-antialiasing',
    '--disable-smooth-scrolling'
  ]
};

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig = {
  snapshotDir: './playwright/snapshots',
  outputDir: './playwright/results/tests',
  /* Maximum time one test can run for. */
  timeout: 30 * 1000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 5000,
    toHaveScreenshot: { maxDiffPixels: 0, threshold: 0.05 }
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: isCI,
  /* Retry on CI only */
  retries: isCI ? 1 : 0,
  /* Use fixed number of workers. */
  workers: 4,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: isCI
    ? [['dot'], ['blob']]
    : [
        ['line'],
        [
          'html',
          {
            open: isContainer ? 'never' : 'on-failure',
            outputFolder: './playwright/results/preview'
          }
        ],
        [
          'junit',
          {
            outputFile: `./playwright/results/reports/report-${
              isA11y && isVrt ? 'e2e' : isA11y ? 'a11y' : 'vrt'
            }.xml`,
            includeProjectInTestName: true
          }
        ],
        [
          './playwright/reporters/playwright-axe-reporter.ts',
          {
            outputFile: './playwright/results/a11y/accessibility-report.json',
            htmlOutputDir: './playwright/results/a11y/tests',
            isA11y
          }
        ]
      ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    ...devices['Desktop Chrome'],
    launchOptions: chromeLaunchOptions,

    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 0,
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: `http://${localAddress}:${port}`,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: isCI ? 'on-first-retry' : 'retain-on-failure',

    viewport: baseViewport,

    /* Screenshot on failure */
    screenshot: 'only-on-failure',

    video: isCI ? 'on-first-retry' : 'retain-on-failure'
  },

  /* Configure projects for major browsers, webkit is currently flaky */
  projects: [
    {
      name: `element-examples/chromium/light`,
      metadata: { livePreviewer: true, theme: 'light' },
      testDir: './playwright/e2e/element-examples'
    },
    {
      name: `element-examples/chromium/dark`,
      metadata: { livePreviewer: true, theme: 'dark', skipAriaSnapshot: true },
      testDir: './playwright/e2e/element-examples'
    },
    {
      name: `dashboards-demo/chromium/light`,
      metadata: { theme: 'light' },
      use: {
        baseURL: `http://${localAddress}:${dashboardsPort}`
      },
      testDir: './playwright/e2e/dashboards-demo'
    },
    {
      name: `dashboards-demo/chromium/dark`,
      metadata: { theme: 'dark', skipAriaSnapshot: true },
      use: {
        baseURL: `http://${localAddress}:${dashboardsPort}`
      },
      testDir: './playwright/e2e/dashboards-demo'
    }
  ],
  webServer: !onDifferentLocalAddress
    ? [
        ...(projectsToRun.find(project => project.startsWith('element-examples/chromium'))
          ? [
              {
                command: webServerCommand,
                url: `http://${localAddress}:${port}`,
                reuseExistingServer: !isCI
              }
            ]
          : []),
        ...(projectsToRun.find(project => project.startsWith('dashboards-demo/chromium'))
          ? [
              {
                command: dashboardsServerCommand,
                url: `http://${localAddress}:${dashboardsPort}`,
                reuseExistingServer: !isCI
              }
            ]
          : [])
      ]
    : undefined
};

export default config;
