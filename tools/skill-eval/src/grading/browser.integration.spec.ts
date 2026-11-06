/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
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
  });
});
