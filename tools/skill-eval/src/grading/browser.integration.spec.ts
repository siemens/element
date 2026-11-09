/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { expect as expectPage } from '@playwright/test';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { type EvaluationCase } from '../../cases/types';
import { createTemporaryDirectory } from '../utils';
import { verifyBrowser } from './browser';

let project: string;
let logs: string;

const page = (body: string): string =>
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Test</title></head><body>${body}</body></html>`;

const build = async (html: string, script?: string): Promise<void> => {
  const browser = path.join(project, 'dist/app/browser');
  await mkdir(browser, { recursive: true });
  await writeFile(path.join(browser, 'index.html'), html);
  if (script !== undefined) {
    await writeFile(path.join(browser, 'main.js'), script);
  }
};

const task = (verifyPage: EvaluationCase['verifyPage']): EvaluationCase => ({
  id: 'integration',
  route: '/',
  prompt: '',
  verifyPage
});

const outcomes = (checks: { name: string; pass: boolean }[]): Record<string, boolean> =>
  Object.fromEntries(checks.map(check => [check.name, check.pass]));

beforeEach(async () => {
  project = await createTemporaryDirectory();
  logs = path.join(project, 'logs');
  await mkdir(logs);
});

afterEach(async () => {
  await rm(project, { recursive: true, force: true });
});

describe('browser verification in a real browser', () => {
  it('serves the build to an accessible page that behaves as required and keeps the evidence', async () => {
    await build(
      page(
        '<main><h1>Devices</h1><button type="button" id="add">Add</button><p role="status" id="out"></p></main><script type="module" src="main.js"></script>'
      ),
      "document.getElementById('add').addEventListener('click', () => { document.getElementById('out').textContent = 'Added'; });"
    );

    const checks = await verifyBrowser(
      project,
      task(async browserPage => {
        await browserPage.getByRole('button', { name: 'Add', exact: true }).click();
        await browserPage.getByText('Added', { exact: true }).waitFor();
      }),
      logs
    );

    expect(outcomes(checks)).toEqual({
      Behavior: true,
      'Accessibility 1280px': true,
      'Layout 1280px': true,
      'Accessibility 375px': true,
      'Layout 375px': true
    });
    expect((await readdir(logs)).sort()).toEqual([
      'axe-1280.json',
      'axe-375.json',
      'page-1280.png',
      'page-375.png'
    ]);
  });

  it('fails the accessibility check when axe finds violations', async () => {
    await build(
      page('<main><h1>Devices</h1><img src="data:image/gif;base64,R0lGODlhAQABAAAAACw="></main>')
    );

    const checks = await verifyBrowser(
      project,
      task(async () => undefined),
      logs
    );

    expect(outcomes(checks)).toMatchObject({
      Behavior: true,
      'Accessibility 1280px': false,
      'Accessibility 375px': false
    });
    expect(await readdir(logs)).toContain('trace.zip');
  });

  it('captures behavior failure evidence before checking the other viewports', async () => {
    await build(
      page(
        '<main><h1>Devices</h1><button type="button" id="add">Add</button><p role="alert" id="out"></p></main><script type="module" src="main.js"></script>'
      ),
      `document.getElementById('add').addEventListener('click', () => {
        document.getElementById('out').textContent = 'Device added';
      });
      window.addEventListener('resize', () => {
        if (window.innerWidth === 375) {
          document.getElementById('out').textContent = 'Mobile layout';
        }
      });`
    );

    const checks = await verifyBrowser(
      project,
      task(async browserPage => {
        await browserPage.getByRole('button', { name: 'Add', exact: true }).click();
        await expectPage(
          browserPage.getByRole('status'),
          '\u001b[31mSuccess message after adding a device\u001b[39m'
        ).toContainText('Device added', { timeout: 100 });
      }),
      logs
    );

    const behavior = checks.find(check => check.name === 'Behavior');
    expect(behavior).toMatchObject({ pass: false, artifact: 'behavior.png' });
    expect(outcomes(checks)).toMatchObject({ 'Layout 375px': true });
    expect(behavior?.reason).toContain('Success message after adding a device');
    expect(behavior?.reason).toContain("getByRole('status')");
    expect(behavior?.reason).toContain('Page: http://localhost/#/');
    expect(behavior?.reason).toContain('alert: Device added');
    expect(behavior?.reason).toContain(
      'Artifacts: behavior.png, behavior.aria.yml, behavior.html, trace.zip'
    );
    expect(behavior?.reason).not.toContain('\u001b');
    const snapshot = await readFile(path.join(logs, 'behavior.aria.yml'), 'utf8');
    expect(snapshot).toContain('alert: Device added');
    expect(snapshot).not.toContain('Mobile layout');
    expect(await readFile(path.join(logs, 'behavior.html'), 'utf8')).toContain(
      '<p role="alert" id="out">Device added</p>'
    );
    const screenshot = await readFile(path.join(logs, 'behavior.png'));
    expect(screenshot.subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    const trace = await readFile(path.join(logs, 'trace.zip'));
    expect(trace.subarray(0, 2)).toEqual(Buffer.from('PK'));
  });

  it('bounds the inline ARIA excerpt while keeping the complete snapshot', async () => {
    const detail = 'Device details '.repeat(200);
    await build(page(`<main><h1>Devices</h1><p>${detail}End of details</p></main>`));

    const checks = await verifyBrowser(
      project,
      task(async browserPage => {
        await expectPage(browserPage.getByRole('status')).toBeVisible({ timeout: 100 });
      }),
      logs
    );

    const behavior = checks.find(check => check.name === 'Behavior');
    expect(behavior?.reason).toContain('... (see behavior.aria.yml)');
    expect(behavior?.reason).not.toContain('End of details');
    expect(await readFile(path.join(logs, 'behavior.aria.yml'), 'utf8')).toContain(
      `${detail}End of details`
    );
  });
});
