/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { mkdir, readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createTemporaryDirectory,
  prepareOutputDirectory,
  redact,
  runCommand,
  safeEnvironment
} from './utils';

let directory: string;

beforeEach(async () => {
  directory = await createTemporaryDirectory();
});

afterEach(async () => {
  vi.unstubAllEnvs();
  await rm(directory, { recursive: true, force: true });
});

describe('utilities', () => {
  it('passes only safe variables to subprocesses', () => {
    vi.stubEnv('SIEMENS_NPM_TOKEN', 'registry-secret');
    vi.stubEnv('NODE_OPTIONS', '--require=untrusted.cjs');
    vi.stubEnv('PATH', '/usr/bin');

    const environment = safeEnvironment('/isolated');

    expect(environment).toMatchObject({ HOME: '/isolated', PATH: '/usr/bin' });
    expect(environment).not.toHaveProperty('SIEMENS_NPM_TOKEN');
    expect(environment).not.toHaveProperty('NODE_OPTIONS');
  });

  it('redacts credentials and leaves other values alone', () => {
    vi.stubEnv('SKILL_EVAL_API_KEY', 'model-secret');
    vi.stubEnv('SKILL_EVAL_OUTPUT', '/results');

    expect(redact('model-secret in /results')).toBe('[REDACTED] in /results');
  });

  it('records failed commands in their log', async () => {
    const log = path.join(directory, 'command.log');

    const result = await runCommand(
      process.execPath,
      ['-e', 'console.error("failure"); process.exitCode = 2'],
      directory,
      log
    );

    expect(result.check).toMatchObject({ pass: false, reason: 'Failed; see command.log' });
    expect(await readFile(log, 'utf8')).toContain('failure');
  });

  it('refuses to mix a new run into earlier results', async () => {
    await mkdir(path.join(directory, 'earlier-run'));

    await expect(prepareOutputDirectory(directory)).rejects.toThrow('must be empty');
  });
});
