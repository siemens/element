/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { spawn } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import { mkdir, mkdtemp, readdir, rename, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { stripVTControlCharacters } from 'node:util';

import { maxLoggedOutput, timeouts } from './config';

export interface Check {
  name: string;
  pass: boolean;
  reason: string;
  artifact?: string;
}

const inheritedKeys = [
  'PATH',
  'TMPDIR',
  'TMP',
  'TEMP',
  'LANG',
  'LC_ALL',
  'PLAYWRIGHT_BROWSERS_PATH'
];

export const safeEnvironment = (home = process.env.HOME): NodeJS.ProcessEnv => ({
  ...Object.fromEntries(
    inheritedKeys.flatMap(key => (process.env[key] ? [[key, process.env[key]]] : []))
  ),
  HOME: home,
  CI: 'true',
  NG_CLI_ANALYTICS: 'false',
  NO_COLOR: '1'
});

export const redact = (value: string): string => {
  value = stripVTControlCharacters(value);
  for (const [key, secret] of Object.entries(process.env)) {
    if (/(?:TOKEN|API_KEY|PASSWORD)$/.test(key) && secret) {
      value = value.replaceAll(secret, '[REDACTED]');
    }
  }
  return value;
};

export const writeJson = async (file: string, value: unknown): Promise<void> => {
  await writeFile(file, `${JSON.stringify(value, undefined, 2)}\n`);
};

export const createTemporaryDirectory = (): Promise<string> =>
  mkdtemp(path.join(tmpdir(), 'element-skill-eval-'));

export const prepareOutputDirectory = async (directory: string): Promise<void> => {
  await mkdir(directory, { recursive: true });
  if ((await readdir(directory)).length > 0) {
    throw new Error(`Output directory must be empty: ${directory}`);
  }
};

export const disableEslintRules = async (directory: string, rules: string[]): Promise<void> => {
  if (rules.length === 0) {
    return;
  }
  const configFile = path.join(directory, 'eslint.config.mjs');
  const baseConfigFile = path.join(directory, 'eslint.base.config.mjs');
  const disabledRules = [...new Set(rules.map(rule => rule.trim()))]
    .map(rule => `      ${JSON.stringify(rule)}: 'off'`)
    .join(',\n');
  await rename(configFile, baseConfigFile);
  await writeFile(
    configFile,
    [
      `import baseConfig from './eslint.base.config.mjs';`,
      '',
      'export default [',
      '  ...(Array.isArray(baseConfig) ? baseConfig : [baseConfig]),',
      '  {',
      '    rules: {',
      disabledRules,
      '    }',
      '  }',
      '];',
      ''
    ].join('\n')
  );
};

export const runCommand = async (
  command: string,
  args: string[],
  directory: string,
  logFile: string,
  {
    environment = safeEnvironment(),
    throwOnFailure = false
  }: { environment?: NodeJS.ProcessEnv; throwOnFailure?: boolean } = {}
): Promise<{ check: Check; output: string }> => {
  const log = createWriteStream(logFile);
  const child = spawn(command, args, {
    cwd: directory,
    env: environment,
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: timeouts.command,
    killSignal: 'SIGKILL'
  });
  let output = '';
  const collect = (chunk: Buffer): void => {
    const text = redact(chunk.toString());
    log.write(text);
    output = (output + text).slice(-maxLoggedOutput);
  };
  child.stdout.on('data', collect);
  child.stderr.on('data', collect);
  const code = await new Promise<number | undefined>((resolve, reject) => {
    child.once('error', reject);
    child.once('close', (exitCode, signal) => {
      log.end(() => resolve(signal ? undefined : (exitCode ?? undefined)));
    });
    log.once('error', reject);
  });
  if (code !== 0 && throwOnFailure) {
    throw new Error(`${command} ${args.join(' ')} failed: ${output}`);
  }
  return {
    check: {
      name: [command, ...args].join(' '),
      pass: code === 0,
      reason: code === 0 ? 'Passed' : `Failed; see ${path.basename(logFile)}`
    },
    output
  };
};
