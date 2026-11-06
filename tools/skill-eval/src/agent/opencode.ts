/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  OpenCode,
  type OpenCodeClient,
  type PermissionRuleset,
  type SessionTransferData
} from '@opencode/client';
import { type ChildProcessByStdio, spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { type WriteStream, createWriteStream } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { type Readable } from 'node:stream';

import { documentationOrigin, maxAgentSteps, skillId, timeouts } from '../config';
import { redact, safeEnvironment, writeJson } from '../utils';

const agentName = 'evaluation';

// OpenCode applies the last matching rule, so narrowing denials follow the allowances.
const evaluationPermissions = (dependencies: string): PermissionRuleset => [
  { action: '*', resource: '*', effect: 'deny' },
  { action: 'read', resource: '*', effect: 'allow' },
  { action: 'glob', resource: '*', effect: 'allow' },
  { action: 'grep', resource: '*', effect: 'allow' },
  { action: 'external_directory', resource: `${dependencies}/*`, effect: 'allow' },
  { action: 'webfetch', resource: `${documentationOrigin}/*`, effect: 'allow' },
  { action: 'skill', resource: skillId, effect: 'allow' },
  { action: 'edit', resource: 'src/*', effect: 'allow' },
  { action: 'edit', resource: '*.spec.ts', effect: 'deny' },
  { action: 'read', resource: '.npmrc', effect: 'deny' },
  { action: 'read', resource: '*.env*', effect: 'deny' }
];

export interface OpenCodeOptions {
  directory: string;
  home: string;
  log: string;
  provider: string;
  model: string;
  baseUrl?: string;
  dependencies: string;
  skillDirectory?: string;
}

export interface OpenCodeServer {
  client: OpenCodeClient;
  close: () => Promise<void>;
}

type ServerProcess = ChildProcessByStdio<null, Readable, Readable>;

export const createOpenCodeConfiguration = (options: OpenCodeOptions) =>
  ({
    $schema: 'https://opencode.ai/config.json',
    model: `${options.provider}/${options.model}`,
    update: 'disable',
    snapshots: false,
    formatter: false,
    providers: {
      [options.provider]: {
        settings: {
          apiKey: '{env:SKILL_EVAL_API_KEY}',
          ...(options.baseUrl ? { baseURL: options.baseUrl } : {})
        }
      }
    },
    ...(options.skillDirectory ? { skills: [options.skillDirectory] } : {}),
    agents: {
      [agentName]: {
        mode: 'primary',
        steps: maxAgentSteps,
        permissions: evaluationPermissions(options.dependencies)
      }
    }
  }) as const;

const writeConfiguration = async (options: OpenCodeOptions): Promise<void> => {
  const configDirectory = path.join(options.home, 'config/opencode');
  await mkdir(configDirectory, { recursive: true });
  await writeJson(
    path.join(configDirectory, 'opencode.json'),
    createOpenCodeConfiguration(options)
  );
};

const waitForAddress = (
  child: ServerProcess,
  log: WriteStream,
  password: string
): Promise<string> =>
  new Promise<string>((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error('OpenCode startup timed out')),
      timeouts.serverStart
    );
    const collect = (chunk: Buffer): void => {
      const text = chunk.toString();
      log.write(redact(text.replaceAll(password, '[REDACTED]')));
      const address = text.match(/http:\/\/127\.0\.0\.1:\d+/)?.[0];
      if (address) {
        clearTimeout(timeout);
        resolve(address);
      }
    };
    child.stdout.on('data', collect);
    child.stderr.on('data', collect);
    child.once('error', error => {
      clearTimeout(timeout);
      reject(error);
    });
    child.once('exit', code => {
      clearTimeout(timeout);
      reject(new Error(`OpenCode exited (${code}); see opencode.log`));
    });
  });

export const startOpenCode = async (options: OpenCodeOptions): Promise<OpenCodeServer> => {
  await writeConfiguration(options);
  const password = randomBytes(32).toString('hex');
  const environment = {
    ...safeEnvironment(options.home),
    XDG_CONFIG_HOME: path.join(options.home, 'config'),
    XDG_DATA_HOME: path.join(options.home, 'data'),
    XDG_STATE_HOME: path.join(options.home, 'state'),
    XDG_CACHE_HOME: path.join(options.home, 'cache'),
    SKILL_EVAL_API_KEY: process.env.SKILL_EVAL_API_KEY,
    OPENCODE_PASSWORD: password
  };
  const log = createWriteStream(options.log);
  const child = spawn('opencode', ['serve', '--hostname', '127.0.0.1', '--port', '0'], {
    cwd: options.directory,
    env: environment,
    stdio: ['ignore', 'pipe', 'pipe']
  });
  const exited = new Promise<void>(resolve => child.once('close', () => resolve()));
  const close = async (): Promise<void> => {
    child.kill('SIGTERM');
    const force = setTimeout(() => child.kill('SIGKILL'), timeouts.serverStop);
    force.unref();
    await exited;
    clearTimeout(force);
    log.end();
  };
  try {
    const url = await waitForAddress(child, log, password);
    const client = OpenCode.make({
      baseUrl: url,
      headers: { authorization: `Basic ${Buffer.from(`opencode:${password}`).toString('base64')}` }
    });
    if (options.skillDirectory !== undefined) {
      const started = Date.now();
      let skillLoaded = false;
      while (!skillLoaded && Date.now() - started < timeouts.serverStart) {
        const skills = await client.skill.list(
          { location: { directory: options.directory } },
          { signal: AbortSignal.timeout(timeouts.serverRequest) }
        );
        skillLoaded = skills.data.some(skill => skill.id === skillId);
        if (!skillLoaded) {
          await new Promise<void>(resolve => setTimeout(resolve, 100));
        }
      }
      if (!skillLoaded) {
        throw new Error(
          `OpenCode did not register the configured ${skillId} skill; see opencode.log`
        );
      }
    }
    return { client, close };
  } catch (error) {
    await close();
    throw error;
  }
};

export const runSession = async (
  client: OpenCodeClient,
  prompt: string,
  options: { directory: string; provider: string; model: string; timeout: number }
): Promise<{ transcript: SessionTransferData; error?: string }> => {
  const signal = AbortSignal.timeout(options.timeout);
  const session = await client.session.create(
    {
      title: 'Element skill evaluation',
      agent: agentName,
      location: { directory: options.directory },
      model: { providerID: options.provider, id: options.model }
    },
    { signal }
  );
  let error: string | undefined;
  try {
    await client.session.prompt({ sessionID: session.id, text: prompt }, { signal });
    await client.experimental.session.wait({ sessionID: session.id }, { signal });
  } catch (failure) {
    error = redact(String(failure));
    await client.session.interrupt(
      { sessionID: session.id },
      { signal: AbortSignal.timeout(timeouts.serverRequest) }
    );
  }
  const transcript = await client.experimental.session.export(
    { sessionID: session.id },
    { signal: AbortSignal.timeout(timeouts.serverRequest) }
  );
  if (transcript.info.outcome !== 'succeeded') {
    error ??= `OpenCode session ${transcript.info.outcome ?? 'did not complete'}`;
  }
  return { transcript, error };
};
