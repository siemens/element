/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { readFile, writeFile } from 'node:fs/promises';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { documentation, entry, member, method, parameter } from '../fixtures/builders.ts';
import { fixtureConfig } from '../fixtures/test-setup.ts';
import { prepareApiPresentation } from '../normalization/index.ts';
import type { ApiPresentation } from '../normalization/model.ts';
import { prepareReferencePlan, type ReferencePlan } from '../normalization/reference-plan.ts';
import { SCHEMA_VERSION } from '../schema.ts';
import { writePreparedArtifacts } from './artifacts.ts';

vi.mock('node:fs/promises', async importOriginal => {
  const fs = await importOriginal<typeof import('node:fs/promises')>();
  const files = new Map<string, string>();
  return {
    ...fs,
    mkdir: vi.fn(),
    writeFile: vi.fn(async (file: string, content: string) => void files.set(file, content)),
    rename: vi.fn(async (source: string, target: string) => {
      files.set(target, files.get(source)!);
      files.delete(source);
    }),
    readFile: vi.fn(async (file: string) => files.get(file))
  };
});
beforeEach(() => vi.clearAllMocks());

type Page = ReferencePlan['pages'][number];
type Nav = ReferencePlan['navigation'];
type Mutation = (p: ApiPresentation, r: ReferencePlan) => void;

const config = fixtureConfig({ packages: ['library'] });
const base = (() => {
  const packageName = '@fixture/library';
  const members = [member('value'), method('run', [{ parameters: [parameter('input')] }])];
  const data = documentation(
    entry('Example', { packageName, members }),
    entry('Other', { packageName })
  );
  const references = prepareReferencePlan(data, config);
  return {
    references,
    presentation: prepareApiPresentation(data, references.referencePaths, config)
  };
})();

const page = <K extends Page['kind']>(r: ReferencePlan, kind: K) =>
  r.pages.find(p => p.kind === kind) as Page & { kind: K };
const cat = (r: ReferencePlan) => page(r, 'category');
const root = (r: ReferencePlan) => page(r, 'root');
const id = '@fixture/library#Example';
const run = (p: ApiPresentation) => p.symbols[0].type.groups[1].rows[0];
const selection = (p: ApiPresentation) => Object.values(p.members)[0];
const link = (p: ApiPresentation, props: object) =>
  void (run(p).type = [{ kind: 'link', text: 'x', targetId: null, href: null, ...props }]);
const library = (r: ReferencePlan) => (r.navigation[1] as Record<string, Nav>)['@fixture/library'];

const cases: [string, Mutation][] = [
  ['Invalid generated documentation path', (_, r) => void (r.pages[0].path = '../x.md')],
  ['must be beneath api/', (_, r) => void (r.pages[0].path = 'docs/x.md')],
  ['Duplicate generated reference path', (_, r) => void (r.pages[1].path = r.pages[0].path)],
  ['requires the api/index.md root', (_, r) => void r.pages.pop()],
  ['overview descriptor', (_, r) => void (cat(r).groups[0].entries[0].label = ' ')],
  ['category groups', (_, r) => void (cat(r).groups[0].letter = 'Z')],
  ['category label', (_, r) => void (cat(r).groups[1].entries[0].label = 'Example')],
  ['entry href', (_, r) => void (root(r).entries[0].href = './nope.md')],
  [
    'missing or incompatible page',
    (_, r) => Object.assign(root(r).entries[0], { path: 'api/missing.md', href: './missing.md' })
  ],
  ['overview entry', (_, r) => void (r.pages[0] = { ...r.pages[0], name: 'Renamed' } as Page)],
  ['missing symbol page', (_, r) => void (r.referencePaths[id] = 'api/index.md')],
  ['Duplicate API presentation symbol', p => void p.symbols.push(p.symbols[0])],
  ['canonical reference path', p => void (p.symbols[0].referencePath = null)],
  ['canonical symbol descriptor', p => void (p.symbols[0].importPath = 'other')],
  [
    'catalog contains an unknown symbol',
    (_, r) => void (r.referencePaths['x#Y'] = r.pages[0].path)
  ],
  [
    'page contains an unknown symbol',
    (_, r) =>
      void r.pages.push({ ...r.pages[0], path: 'api/z.md', name: 'Z', importPath: 'z' } as Page)
  ],
  ['symbol index', p => void (p.index.Example = [id, id])],
  ['member index', p => void p.memberIndex['Example.run'].push(Object.keys(p.members)[1])],
  ['presentation target', p => void (p.targets[id].anchor = '')],
  ['Missing canonical API target: ' + id, p => void delete p.targets[id]],
  [
    'Missing canonical API target: ' + id + '/member/run',
    p => void (p.targets[run(p).id].symbolId = p.symbols[1].id)
  ],
  ['exactly one targetId or href', p => link(p, {})],
  ['Unsafe API documentation URL: javascript', p => link(p, { href: 'javascript:alert(1)' })],
  ['API documentation URL has no host: https://', p => link(p, { href: 'https://' })],
  ['Unknown logical', p => link(p, { targetId: 'nope' })],
  ['Plain fragment', p => link(p, { kind: 'code', href: '/x' })],
  ['Unsafe API documentation URL: //evil.test', p => void (run(p).sourceUrl = '//evil.test')],
  ['related type ID', p => void (p.symbols[0].type.relatedTypeIds = ['nope'])],
  ['member owner', p => void (selection(p).symbolId = 'nope')],
  [
    'member selection view',
    p => void selection(p).view.documentation.push({ kind: 'paragraph', parts: [] })
  ],
  ['entry count', (_, r) => void r.navigation.pop()],
  ['navigation entry', (_, r) => void (r.navigation[1] = { a: [], b: [] })],
  ['label or order', (_, r) => void (r.navigation[1] = { Wrong: [] })],
  ['navigation subtree', (_, r) => void (r.navigation[1] = { '@fixture/library': 'api/x.md' })],
  [
    'Unknown reference navigation page',
    (_, r) => void ((library(r)[1] as Record<string, Nav>).Types[1] = { Other: 'api/x.md' })
  ]
];

describe('prepared JSON artifact boundary', () => {
  it('round-trips both artifacts without the internal routing map', async () => {
    const { presentation, references } = structuredClone(base);
    const paths = await writePreparedArtifacts(presentation, references, config);
    const catalog = JSON.parse((await readFile(paths.catalogPath, 'utf8'))!);
    expect(catalog).toEqual({
      schemaVersion: SCHEMA_VERSION,
      referencePages: { pages: references.pages, navigation: references.navigation }
    });
    const artifact = JSON.parse((await readFile(paths.artifactPath, 'utf8'))!);
    expect(artifact).toEqual(presentation);
    expect(Object.keys(artifact.members)).toHaveLength(2);
  });

  it.each(cases)('rejects: %s', async (message, mutate) => {
    const { presentation, references } = structuredClone(base);
    mutate(presentation, references);
    await expect(writePreparedArtifacts(presentation, references, config)).rejects.toThrow(message);
    expect(writeFile).not.toHaveBeenCalled();
  });
});
