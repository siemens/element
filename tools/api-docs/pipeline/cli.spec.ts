/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { beforeEach, describe, expect, it, onTestFinished, vi } from 'vitest';

import { resolveConfig, type ResolvedApiDocsConfig } from '../configuration.js';
import { extractApiDocumentation } from '../extraction/extract.js';
import { documentation } from '../fixtures/builders.js';
import { prepareApiPresentation } from '../normalization/index.js';
import type { ApiPresentation } from '../normalization/model.js';
import { prepareReferencePlan, type ReferencePlan } from '../normalization/reference-plan.js';
import { SCHEMA_VERSION } from '../schema.js';
import { main } from './cli.js';
vi.mock('../extraction/extract.js', () => ({ extractApiDocumentation: vi.fn() }));
vi.mock('../normalization/index.js', () => ({ prepareApiPresentation: vi.fn() }));
vi.mock('../normalization/reference-plan.js', () => ({ prepareReferencePlan: vi.fn() }));

const doc: ApiPresentation = {
  schemaVersion: SCHEMA_VERSION,
  symbols: [],
  index: {},
  memberIndex: {},
  members: {},
  targets: {}
};
const extracted = documentation();
const plan = (path = 'api/index.md'): ReferencePlan => ({
  navigation: [{ Overview: 'api/index.md' }],
  pages: [{ kind: 'root', path, title: 'Root', entries: [], readme: '' }],
  referencePaths: {}
});
let config: ResolvedApiDocsConfig;
beforeEach(async () => {
  vi.resetAllMocks();
  const root = await mkdtemp(path.join(tmpdir(), 'element-docs-json-'));
  config = resolveConfig({ root, packages: ['library'] });
  onTestFinished(() => rm(root, { recursive: true, force: true }));
  vi.mocked(extractApiDocumentation).mockResolvedValue(extracted);
  vi.mocked(prepareApiPresentation).mockReturnValue(doc);
  vi.mocked(prepareReferencePlan).mockReturnValue(plan());
});
const read = async (dir = config.output.dir) =>
  Promise.all((await readdir(dir)).sort().map(f => readFile(path.join(dir, f), 'utf8')));
describe('JSON-only API CLI', () => {
  it.each([['prepare'], ['--generate', '--', '--verbose']])(
    'rejects unsupported arguments %j before extraction',
    async (...args) => {
      await expect(main(config, args)).rejects.toThrow('Usage: tsx tools/api-docs/index.ts');
      expect(extractApiDocumentation).not.toHaveBeenCalled();
    }
  );
  it.each([
    ['extraction', () => vi.mocked(extractApiDocumentation).mockRejectedValue(new Error('x'))],
    [
      'normalization',
      () => vi.mocked(prepareApiPresentation).mockImplementation(() => JSON.parse('{'))
    ],
    ['catalog', () => vi.mocked(prepareReferencePlan).mockReturnValue(plan('../bad.md'))]
  ])('preserves prior artifacts on %s failure', async (_name, fail) => {
    await main(config, []);
    const before = await read();
    fail();
    await expect(main(config, [])).rejects.toThrow();
    expect(await read()).toEqual(before);
  });
});
