/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { ESLint } from 'eslint';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createTemporaryDirectory,
  disableEslintRules,
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

  it('strips ANSI formatting before redacting credentials and preserves error details', () => {
    vi.stubEnv('SKILL_EVAL_API_KEY', 'model-secret');

    expect(
      redact('\u001b[31mError\u001b[39m: model-\u001b[1msecret\u001b[22m\nExpected: visible')
    ).toBe('Error: [REDACTED]\nExpected: visible');
  });

  it('disables template and TypeScript rules after trimming their names', async () => {
    await writeFile(
      path.join(directory, 'eslint.config.mjs'),
      `export default [{
        files: ['**/*.ts', '**/*.html'],
        rules: { 'no-debugger': 'error' }
      }];\n`
    );

    await disableEslintRules(directory, [
      '@angular-eslint/template/attributes-order ',
      '@angular-eslint/sort-keys-in-type-decorator'
    ]);

    const eslint = new ESLint({ cwd: directory });
    const template = await eslint.calculateConfigForFile('src/page.html');
    const component = await eslint.calculateConfigForFile('src/page.ts');

    expect(template.rules).toMatchObject({
      '@angular-eslint/template/attributes-order': [0],
      'no-debugger': [2]
    });
    expect(component.rules).toMatchObject({
      '@angular-eslint/sort-keys-in-type-decorator': [0],
      'no-debugger': [2]
    });
    expect(component.rules).not.toHaveProperty('@angular-eslint/template/attributes-order ');
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

  it('strips ANSI formatting from command output and its log', async () => {
    const log = path.join(directory, 'command.log');

    const result = await runCommand(
      process.execPath,
      ['-e', 'console.error("\\u001b[31mfailure\\u001b[39m"); process.exitCode = 2'],
      directory,
      log
    );

    expect(result.output).toBe('failure\n');
    expect(await readFile(log, 'utf8')).toBe('failure\n');
  });

  it('throws on command failures when requested and keeps the log', async () => {
    const log = path.join(directory, 'command.log');

    await expect(
      runCommand(
        process.execPath,
        ['-e', 'console.error("failure"); process.exitCode = 2'],
        directory,
        log,
        { throwOnFailure: true }
      )
    ).rejects.toThrow('failed: failure');
    expect(await readFile(log, 'utf8')).toContain('failure');
  });

  it('refuses to mix a new run into earlier results', async () => {
    await mkdir(path.join(directory, 'earlier-run'));

    await expect(prepareOutputDirectory(directory)).rejects.toThrow('must be empty');
  });
});
