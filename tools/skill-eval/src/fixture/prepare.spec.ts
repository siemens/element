/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { mkdir, realpath, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { fixtureName } from '../config';
import * as utils from '../utils';
import { prepareFixture } from './prepare';

let root: string;
let directory: string;
let playwright: string;

beforeEach(async () => {
  root = await realpath(await utils.createTemporaryDirectory());
  directory = path.join(root, fixtureName);
  const provider = path.join(directory, 'node_modules/@vitest/browser-playwright');
  playwright = path.join(provider, 'node_modules/playwright');
  await mkdir(playwright, { recursive: true });
  await utils.writeJson(path.join(provider, 'package.json'), {
    name: '@vitest/browser-playwright',
    main: 'index.js'
  });
  await writeFile(path.join(provider, 'index.js'), '');
  await utils.writeJson(path.join(playwright, 'package.json'), {
    name: 'playwright',
    version: '1.65.0'
  });
  const projectPlaywright = path.join(directory, 'node_modules/playwright');
  await mkdir(projectPlaywright);
  await utils.writeJson(path.join(projectPlaywright, 'package.json'), {
    name: 'playwright',
    version: '1.64.0'
  });
  await writeFile(path.join(directory, 'eslint.config.mjs'), 'export default [];\n');
  vi.stubEnv('SIEMENS_NPM_TOKEN', '');
  vi.spyOn(utils, 'runCommand').mockResolvedValue({
    check: { name: 'Prepare fixture', pass: true, reason: 'Passed' },
    output: ''
  });
});

afterEach(async () => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  await rm(root, { recursive: true, force: true });
});

describe('fixture preparation', () => {
  it('installs browsers using the Playwright dependency resolved by Vitest', async () => {
    expect(await prepareFixture(root)).toBe(directory);

    expect(utils.runCommand).toHaveBeenCalledWith(
      process.execPath,
      [path.join(playwright, 'cli.js'), 'install', 'chromium'],
      directory,
      path.join(root, 'browsers.log'),
      { throwOnFailure: true }
    );
  });

  it('fails preparation when the Vitest browser installation fails', async () => {
    vi.mocked(utils.runCommand).mockImplementation(async command => {
      if (command === process.execPath) {
        throw new Error('Browser download failed');
      }
      return {
        check: { name: command, pass: true, reason: 'Passed' },
        output: ''
      };
    });

    await expect(prepareFixture(root)).rejects.toThrow('Browser download failed');
  });
});
