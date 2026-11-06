/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { fixtureName, initializerVersion } from '../config';
import { runCommand, safeEnvironment } from '../utils';

const runNpm = async (
  args: string[],
  directory: string,
  log: string,
  environment = safeEnvironment()
): Promise<void> => {
  const result = await runCommand('npm', args, directory, log, environment);
  if (!result.check.pass) {
    throw new Error(`npm ${args.join(' ')} failed: ${result.output}`);
  }
};

export const prepareFixture = async (root: string): Promise<string> => {
  const directory = path.join(root, fixtureName);
  await runNpm(
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
    path.join(root, 'scaffold.log')
  );
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
    await runNpm(
      ['install', '--no-audit', '--no-fund'],
      directory,
      path.join(root, 'install.log'),
      environment
    );
  } finally {
    await rm(userConfig, { force: true });
  }
  await runNpm(
    ['exec', '--no', '--', 'playwright', 'install', 'chromium'],
    directory,
    path.join(root, 'browsers.log')
  );
  await runNpm(['run', 'format'], directory, path.join(root, 'format.log'));
  return directory;
};
