/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createTemporaryDirectory } from '../utils';
import { type OpenCodeServer, startOpenCode } from './opencode';

let temporary: string;
let project: string;
let skillDirectory: string;
const servers: OpenCodeServer[] = [];

beforeEach(async () => {
  temporary = await createTemporaryDirectory();
  project = path.join(temporary, 'project');
  skillDirectory = path.join(temporary, 'skills');
  await mkdir(path.join(project, 'node_modules'), { recursive: true });
  await mkdir(path.join(skillDirectory, 'element'), { recursive: true });
  await writeFile(
    path.join(skillDirectory, 'element/SKILL.md'),
    '---\nname: element\ndescription: Integration test skill source.\n---\nSkill body for integration test.'
  );
  vi.stubEnv('SKILL_EVAL_API_KEY', 'integration-test-key');
});

afterEach(async () => {
  await Promise.all(servers.splice(0).map(server => server.close()));
  await rm(temporary, { recursive: true, force: true });
  vi.unstubAllEnvs();
});

const start = async (name: string): Promise<OpenCodeServer> => {
  const root = path.join(temporary, name);
  await mkdir(root, { recursive: true });
  const server = await startOpenCode({
    directory: project,
    home: path.join(root, 'home'),
    log: path.join(root, 'opencode.log'),
    provider: 'openai',
    model: 'test-model',
    dependencies: path.join(project, 'node_modules'),
    skillDirectory
  });
  servers.push(server);
  return server;
};

describe('OpenCode skill source configuration', () => {
  it('loads the configured skill source', async () => {
    const enabled = await start('enabled');
    const listed = await enabled.client.skill.list({ location: { directory: project } });
    expect(listed.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'element', content: expect.stringContaining('Skill body') })
      ])
    );
  });
});
