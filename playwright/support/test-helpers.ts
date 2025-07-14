/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import AxeBuilder from '@axe-core/playwright';
import {
  test as baseTest,
  type ElementHandle,
  expect,
  type Page,
  type TestInfo,
  Locator
} from '@playwright/test';
import axe from 'axe-core';

import { expectNoA11yViolations } from '../reporters/playwright-axe-reporter';

export { expect } from '@playwright/test';

const SI_EXAMPLE_NAME_ID = 'siExampleName';

const detectTestTypes = (): { isA11y: boolean; isVrt: boolean } => {
  let isA11y =
    !!process.env.PLAYWRIGHT_isa11y &&
    process.env.PLAYWRIGHT_isa11y.toLocaleLowerCase() !== 'false';

  let isVrt =
    !!process.env.PLAYWRIGHT_isvrt && process.env.PLAYWRIGHT_isvrt.toLocaleLowerCase() !== 'false';

  // Per default do both A11y and VRT
  if (!isA11y && !isVrt) {
    isA11y = true;
    isVrt = true;
  }

  return { isA11y, isVrt };
};

const { isA11y, isVrt } = detectTestTypes();

const staticTest = process.env.PLAYWRIGHT_staticTest
  ? new Set(process.env.PLAYWRIGHT_staticTest.split(':'))
  : undefined;

export const VIEWPORTS = [
  { name: 'default', width: 0, height: 0 }, // Default, 0 will skip resizing and use the default value
  { name: 'tablet-portrait', width: 768, height: 1024 },
  { name: 'tablet-landscape', width: 1024, height: 768 }
];
export type Viewport = (typeof VIEWPORTS)[number];

export type StaticTestOptions = {
  delay?: number;
  maxDiffPixels?: number;
  disabledA11yRules?: string[];
  viewports?: (Viewport | string)[];
  waitCallback?: (page: Page) => Promise<void>;
  skipAutoScaleViewport?: boolean;
  skipAriaSnapshot?: boolean;
};

// Playwright since 1.48 has the mouse cursor at 0/0 causing any element at this coordinate to be
// in hover state. This leads to unexpected state in snapshots. To work around this, simply
// move the mouse outside the viewport. Since this is executed before any test code runs,
// tests using the mouse are not affected.
const hoverFix = async (page: Page): Promise<void> => page.mouse.move(-10, -10);

class SiTestHelpers {
  private disableAnimationsTag: ElementHandle<Node> | undefined;
  private showHideTag: ElementHandle<Node> | undefined;

  constructor(
    private page: Page,
    private testInfo: TestInfo
  ) {}

  /**
   * Gets example name from test name and statically runs visual and a11y tests.
   */
  public async static(options?: StaticTestOptions): Promise<void> {
    const exampleName = this.testInfo.title;
    if (!staticTest || staticTest.has(exampleName)) {
      const viewports = (options?.viewports?.length ? options.viewports : ['default'])
        .map(viewport =>
          typeof viewport !== 'string' ? viewport : VIEWPORTS.find(v => v.name === viewport)
        )
        .filter(viewport => !!viewport)
        .sort((a, b) => a.width * a.height - a.height * b.height); // This ensures the default viewport is first.

      for (const viewport of viewports) {
        const isDefaultViewport = viewport.height === 0 && viewport.width === 0;
        const specifyViewport = !isDefaultViewport || viewports.length > 1;
        const step = specifyViewport ? viewport.name : undefined;
        if (!isDefaultViewport) {
          await this.page.setViewportSize({ width: viewport.width, height: viewport.height });
        }
        await this.visitExample(exampleName, !options?.skipAutoScaleViewport);
        if (options?.waitCallback) {
          await options?.waitCallback(this.page);
        }
        if (options?.delay) {
          await this.page.waitForTimeout(options?.delay);
        }
        await this.runVisualAndA11yTests(step, {
          axeRulesSet: options?.disabledA11yRules?.map(item => ({ id: item, enabled: false })),
          maxDiffPixels: options?.maxDiffPixels,
          skipAriaSnapshot: options?.skipAriaSnapshot
        });
      }
    }
  }

  public async visitExample(name: string, autoScaleViewport = true): Promise<void> {
    await test.step(
      'visitExample: ' + name,
      async () => {
        this.testInfo.annotations.push({ type: SI_EXAMPLE_NAME_ID, description: name });
        const livePreviewer = !!this.testInfo.project.metadata.livePreviewer;
        const theme = this.testInfo.project.metadata.theme;
        const mode = this.testInfo.project.metadata.mode;
        const urlParams = [];
        if (theme) {
          urlParams.push(`theme=${theme}`);
        }
        if (mode) {
          urlParams.push(`mode=${mode}`);
        }
        if (livePreviewer) {
          urlParams.push(`e=${encodeURIComponent(name)}`);
        }
        const urlParamsString = urlParams.length ? '?' + urlParams.join('&') : '';
        const newHash = livePreviewer
          ? `#/viewer/viewer${urlParamsString}`
          : `#/${name}${urlParamsString}`;
        await this.page.goto(newHash);

        await this.page.evaluate(() => document.fonts.ready);

        if (livePreviewer) {
          await expect(
            this.page.locator(`si-live-preview-renderer[data-example*="${name}"]`)
          ).toBeVisible();
          await expect(this.page.locator('.live-preview-done')).toBeVisible();
        }

        if (autoScaleViewport) {
          const height = await this.page.evaluate(() => document.body.scrollHeight);
          const width = await this.page.evaluate(() => document.body.scrollWidth);
          const viewportSize = this.page.viewportSize();
          if (!viewportSize || viewportSize.height < height || viewportSize.width < width) {
            await this.page.setViewportSize({
              height: Math.max(height, viewportSize?.height ?? 0),
              width: Math.max(width, viewportSize?.width ?? 0)
            });
          }
        }
      },
      { box: true }
    );
  }

  public async runVisualAndA11yTests(
    step?: string,
    options?: {
      axeRulesSet?: (string | { id: string; enabled: boolean })[];
      skipAriaSnapshot?: boolean;
      maxDiffPixels?: number;
      snapshotDelay?: number;
    }
  ): Promise<void> {
    const example = this.getExampleName() ?? this.testInfo.title;
    const testName = this.makeTestName(example, step);
    let axeRulesSet = options?.axeRulesSet ?? [];
    await test.step(
      'runVisualAndA11yTests: ' + testName,
      async () => {
        if (isA11y) {
          await this.enableDisableAnimations(this.page, false);
          const rules = (options?.axeRulesSet ?? [])
            .filter(
              item =>
                typeof item === 'string' || (typeof item === 'object' && item?.enabled === true)
            )
            .map(item => (typeof item === 'object' ? item.id : item));

          if (
            !!process.env.PLAYWRIGHT_a11y_all &&
            process.env.PLAYWRIGHT_a11y_all.toLocaleLowerCase() !== 'false'
          ) {
            // Only use global disabled rules.
            axeRulesSet = [];
          }

          const disabledRules = [
            'landmark-one-main',
            'page-has-heading-one',
            'region',
            ...axeRulesSet
              .filter(item => typeof item === 'object' && item?.enabled === false)
              .map(item => (typeof item === 'object' ? item.id : item))
          ];
          let axeResults: axe.AxeResults;
          try {
            if (rules.length) {
              axeResults = (await new AxeBuilder({ page: this.page })
                // Excluding .header-logo is a temporary workaround as axe does not accept alt text in content style
                .exclude(
                  '.e2e-ignore-a11y, .cdk-focus-trap-anchor, .header-logo, .landing-page-logo'
                )
                .withRules(rules)
                .disableRules(disabledRules)
                .analyze()) as axe.AxeResults;
            } else {
              axeResults = (await new AxeBuilder({ page: this.page })
                // Excluding .header-logo is a temporary workaround as axe does not accept alt text in content style
                .exclude(
                  '.e2e-ignore-a11y, .cdk-focus-trap-anchor, .header-logo, .landing-page-logo'
                )
                .disableRules(disabledRules)
                .analyze()) as axe.AxeResults;
            }
          } finally {
            await this.enableDisableAnimations(this.page, true);
          }
          await expectNoA11yViolations(this.testInfo, axeResults.violations, testName);
        }
        if (isVrt) {
          try {
            await this.showHideIgnores(this.page, false, options?.snapshotDelay);
            await expect(this.page).toHaveScreenshot(testName + '.png', {
              maxDiffPixels: options?.maxDiffPixels
            });
          } finally {
            await this.showHideIgnores(this.page, true);
          }

          if (!options?.skipAriaSnapshot && !this.testInfo.project.metadata.skipAriaSnapshot) {
            await expect(this.page.locator('body')).toMatchAriaSnapshot({
              name: testName + '.yaml'
            });
          }
        }
      },
      { box: true }
    );
  }

  public async waitForAllAnimationsToComplete(threshold = 0): Promise<void> {
    await this.page.waitForFunction(
      count => window.document.getAnimations().length <= count,
      threshold
    );
  }
  /**
   * Get the example name set by `visitExample`.
   */
  public getExampleName(): string | undefined {
    return this.testInfo.annotations.find(result => result.type === SI_EXAMPLE_NAME_ID)
      ?.description;
  }

  public async getDescription(locator: Locator): Promise<Locator> {
    const describedBy = await locator.getAttribute('aria-describedby');
    return this.page.locator(`#${describedBy}`);
  }

  private async enableDisableAnimations(page: Page, show: boolean): Promise<void> {
    await this.disableAnimationsTag?.evaluate(element => element.parentNode?.removeChild(element));
    await this.disableAnimationsTag?.dispose();
    this.disableAnimationsTag = undefined;
    if (!show) {
      this.disableAnimationsTag = await page.addStyleTag({
        content: `*, *:before, *:after {
  transition-property: none !important;
  animation: none !important;
}`
      });
    }
  }

  private async showHideIgnores(page: Page, show: boolean, delay?: number): Promise<void> {
    await this.showHideTag?.evaluate(element => element.parentNode?.removeChild(element));
    await this.showHideTag?.dispose();
    this.showHideTag = undefined;
    if (!show) {
      this.showHideTag = await page.addStyleTag({
        content: `.e2e-ignore { display: none; }`
      });
      if (delay) {
        await page.waitForTimeout(delay);
      }
    }
  }

  private makeTestName(example: string, step?: string): string {
    // this is so that we have filenames that make sense
    let testName = example.replace(/\//g, '--');
    if (step) {
      testName += `--${step}`;
    }
    return testName;
  }
}

export const test = baseTest.extend<{
  si: SiTestHelpers;
}>({
  si: [
    async ({ page }, use, testInfo) => {
      await hoverFix(page);
      await use(new SiTestHelpers(page, testInfo));
    },
    { box: true }
  ]
});
