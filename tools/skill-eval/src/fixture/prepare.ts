/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

import { fixtureName, initializerVersion } from '../config';
import { disableEslintRules, runCommand, safeEnvironment } from '../utils';

export const prepareFixture = async (root: string): Promise<string> => {
  const directory = path.join(root, fixtureName);
  await runCommand(
    'npm',
    [
      'init',
      '--yes',
      `siemens-web@${initializerVersion}`,
      fixtureName,
      '--',
      '--template',
      'element-starter',
      '--no-interactive',
      '--no-immediate'
    ],
    root,
    path.join(root, 'scaffold.log'),
    { throwOnFailure: true }
  );
  // Disable some rules that are not relevant for the fixture and would cause linter errors.
  await disableEslintRules(directory, [
    '@angular-eslint/template/attributes-order',
    '@angular-eslint/sort-keys-in-type-decorator'
  ]);
  const environment = safeEnvironment();
  const userConfig = path.join(root, 'registry.npmrc');
  if (process.env.SIEMENS_NPM_TOKEN) {
    await writeFile(userConfig, '//code.siemens.com/:_authToken=${SIEMENS_NPM_TOKEN}\n', {
      mode: 0o600
    });
    environment.npm_config_userconfig = userConfig;
    environment.SIEMENS_NPM_TOKEN = process.env.SIEMENS_NPM_TOKEN;
  }
  try {
    await runCommand(
      'npm',
      ['install', '--no-audit', '--no-fund'],
      directory,
      path.join(root, 'install.log'),
      { environment, throwOnFailure: true }
    );
  } finally {
    await rm(userConfig, { force: true });
  }
  // Install the browser revision required by Vitest's own Playwright dependency.
  // Resolving its CLI directly avoids the project's potentially different E2E version.
  const fixtureRequire = createRequire(path.join(directory, 'package.json'));
  const provider = fixtureRequire.resolve('@vitest/browser-playwright');
  const playwright = createRequire(provider).resolve('playwright/package.json');
  await runCommand(
    process.execPath,
    [path.join(path.dirname(playwright), 'cli.js'), 'install', 'chromium'],
    directory,
    path.join(root, 'browsers.log'),
    { throwOnFailure: true }
  );
  await runCommand('npm', ['run', 'format'], directory, path.join(root, 'format.log'), {
    throwOnFailure: true
  });
  return directory;
};
