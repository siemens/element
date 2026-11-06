/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { spawn } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import { mkdir, mkdtemp, readdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

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

export const runCommand = async (
  command: string,
  args: string[],
  directory: string,
  logFile: string,
  environment = safeEnvironment()
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
  return {
    check: {
      name: [command, ...args].join(' '),
      pass: code === 0,
      reason: code === 0 ? 'Passed' : `Failed; see ${path.basename(logFile)}`
    },
    output
  };
};
