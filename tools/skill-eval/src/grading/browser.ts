/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import AxeBuilder from '@axe-core/playwright';
import { chromium, expect, type Page, type Route } from '@playwright/test';
import { existsSync, statSync } from 'node:fs';
import { readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { type EvaluationCase } from '../../cases/types';
import { axeTags, timeouts, viewportWidths } from '../config';
import { type Check, redact, writeJson } from '../utils';

const appOrigin = 'http://localhost';
const maxSnapshotExcerptLength = 2000;

const findBuildOutput = async (directory: string): Promise<string> => {
  const dist = path.join(directory, 'dist');
  const outputs = (await readdir(dist, { withFileTypes: true }))
    .filter(entry => entry.isDirectory())
    .map(entry => path.join(dist, entry.name, 'browser'))
    .filter(output => existsSync(path.join(output, 'index.html')));
  if (outputs.length !== 1) {
    throw new Error(`Expected exactly one browser build in ${dist}, found ${outputs.length}`);
  }
  return outputs[0];
};

// URL parsing resolves dot segments, so the joined path stays inside the build output.
const serveFile = (route: Route, root: string): Promise<void> => {
  const { pathname } = new URL(route.request().url());
  const file = path.join(root, pathname === '/' ? 'index.html' : pathname);
  return statSync(file, { throwIfNoEntry: false })?.isFile()
    ? route.fulfill({ path: file })
    : route.fulfill({ status: 404 });
};

const checkBehavior = async (
  page: Page,
  test: EvaluationCase,
  url: string,
  logs: string
): Promise<Check> => {
  try {
    const expectedUrls = [url, `${appOrigin}/#/main${test.route}`];
    await expect(
      page,
      `The ${test.route} page must remain accessible within the application shell`
    ).toHaveURL(actual => expectedUrls.includes(actual.href));
    await test.verifyPage(page);
    return {
      name: 'Behavior',
      pass: true,
      reason: 'Rendered behavior matches the task',
      artifact: `page-${viewportWidths[0]}.png`
    };
  } catch (error) {
    const [aria, html] = await Promise.all([page.ariaSnapshot(), page.content()]);
    const snapshot = redact(aria);
    await Promise.all([
      page.screenshot({ path: path.join(logs, 'behavior.png'), fullPage: true }),
      writeFile(path.join(logs, 'behavior.aria.yml'), `${snapshot}\n`),
      writeFile(path.join(logs, 'behavior.html'), redact(html))
    ]);
    const excerpt =
      snapshot.length > maxSnapshotExcerptLength
        ? `${snapshot.slice(0, maxSnapshotExcerptLength)}\n... (see behavior.aria.yml)`
        : snapshot;
    return {
      name: 'Behavior',
      pass: false,
      reason: [
        redact(String(error)),
        `Page: ${redact(page.url())}`,
        `ARIA snapshot:\n${excerpt}`,
        'Artifacts: behavior.png, behavior.aria.yml, behavior.html, trace.zip'
      ].join('\n\n'),
      artifact: 'behavior.png'
    };
  }
};

const checkViewport = async (page: Page, width: number, logs: string): Promise<Check[]> => {
  await page.setViewportSize({ width, height: 900 });
  const accessibility = await new AxeBuilder({ page }).withTags(axeTags).analyze();
  await writeJson(path.join(logs, `axe-${width}.json`), accessibility);
  const fits = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
  await page.screenshot({ path: path.join(logs, `page-${width}.png`), fullPage: true });
  return [
    {
      name: `Accessibility ${width}px`,
      pass: accessibility.violations.length === 0,
      reason: `${accessibility.violations.length} axe violations`,
      artifact: `axe-${width}.json`
    },
    {
      name: `Layout ${width}px`,
      pass: fits,
      reason: fits ? 'No horizontal page overflow' : 'Page overflows horizontally',
      artifact: `page-${width}.png`
    }
  ];
};

export const verifyBrowser = async (
  directory: string,
  test: EvaluationCase,
  logs: string
): Promise<Check[]> => {
  const root = await findBuildOutput(directory);
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({
      viewport: { width: viewportWidths[0], height: 900 }
    });
    await context.tracing.start({
      screenshots: true,
      snapshots: true,
      sources: true,
      title: test.id
    });
    let passed = false;
    try {
      const page = await context.newPage();
      page.setDefaultTimeout(timeouts.page);
      await page.route(`${appOrigin}/**`, route => serveFile(route, root));
      const url = `${appOrigin}/#${test.route}`;
      await page.goto(url);
      const checks: Check[] = [await checkBehavior(page, test, url, logs)];
      for (const width of viewportWidths) {
        checks.push(...(await checkViewport(page, width, logs)));
      }
      passed = checks.every(check => check.pass);
      return checks;
    } finally {
      await context.tracing.stop(passed ? undefined : { path: path.join(logs, 'trace.zip') });
    }
  } finally {
    await browser.close();
  }
};
