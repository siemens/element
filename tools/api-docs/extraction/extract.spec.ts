/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { NgtscProgram, type DocEntry } from '@angular/compiler-cli';
import path from 'node:path';
import { cpSync, mkdirSync, mkdtempSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { extractApiDocumentation } from './extract.js';
import type { ApiDocsConfig } from '../configuration.js';
import {
  extractFixtures,
  fixtureConfig,
  fixtureExternalApis,
  fixturesRoot,
  stable
} from '../fixtures/test-setup.js';
import type { ApiEntry } from './model.js';

const documentation = await extractFixtures();
const isCdk = (entry: ApiEntry): boolean => entry.source.packageName === '@angular/cdk';
const entries = documentation.entries.filter(entry => !isCdk(entry));
const fileName = (id: string): string => id.replace(/[^\w.@-]+/g, '_');
const cleanups: string[] = [];

afterEach(() => {
  vi.restoreAllMocks();
  for (const directory of cleanups.splice(0)) rmSync(directory, { recursive: true, force: true });
});

/** Temp checkout with a `project` copy of a fixture (default: dependency) plus extra files. */
function tempProject(
  files: Record<string, string> = {},
  options: { base?: string; nested?: string[]; ngPackage?: boolean } = {}
): { root: string } {
  const temporary = mkdtempSync(path.join(tmpdir(), 'api-docs-'));
  cleanups.push(temporary);
  const root = path.join(temporary, ...(options.nested ?? []));
  const project = path.join(root, 'project');
  cpSync(path.join(fixturesRoot, options.base ?? 'dependency'), project, { recursive: true });
  cpSync(
    path.join(fixturesRoot, 'library/tsconfig.lib.json'),
    path.join(project, 'tsconfig.lib.json')
  );
  if (options.ngPackage === false) rmSync(path.join(project, 'ng-package.json'));
  for (const [file, content] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    writeFileSync(path.join(root, file), content);
  }
  return { root };
}

const project = (entry: ApiEntry) => ({
  id: entry.id,
  docsVisible: entry.docsVisible,
  filePath: entry.source.filePath
});

describe('Angular compiler API extraction', () => {
  it('discovers entry points', () => {
    expect(documentation.entryPoints).toMatchSnapshot();
  });

  it.each(entries.map(entry => [entry.id, entry] as const))('extracts %s', async (id, entry) => {
    let value = stable(entry);
    if (entry.name === 'BuiltinInherited') {
      const keep = ['fromCharCode', '[Symbol.iterator]'];
      value = {
        ...value,
        members: value.members.filter(member => keep.includes(member.name)),
        typeMembers: value.typeMembers?.filter(member => keep.includes(member.name))
      };
    }
    await expect(JSON.stringify(value, null, 2)).toMatchFileSnapshot(
      `__snapshots__/entries/${fileName(id)}.json`
    );
  });

  it('extracts only configured external declarations', () => {
    expect(
      documentation.entries.filter(isCdk).map(e => ({
        id: e.id,
        kind: e.angularKind,
        package: e.source.packageName,
        only: e.documentationOnly
      }))
    ).toMatchSnapshot();
    expect(documentation.entries.some(entry => entry.name === 'CdkDragHandle')).toBe(false);
  });

  it.each<[string, object, Record<string, string>]>([
    ['ancestors named test/internal', { nested: ['test', 'internal'] }, {}],
    ['every public narrow-library export', { base: 'narrow-library' }, {}],
    [
      'ignored docs barrel and tsconfig.docs.json',
      { base: 'narrow-library' },
      {
        'project/docs.ts': 'invalid',
        'project/tsconfig.docs.json': 'not a tsconfig',
        'project/ignored/ng-package.json': 'not a package config'
      }
    ]
  ])('extracts temp checkout: %s', async (_name, options, files) => {
    const { root } = tempProject(files, options);
    const tsconfig = 'tsconfig.build.json';
    renameSync(path.join(root, 'project/tsconfig.lib.json'), path.join(root, 'project', tsconfig));
    const extracted = await extractApiDocumentation(
      fixtureConfig({
        root,
        packages: ['project'],
        project: { tsconfig, skipEntryPoints: ['ignored'] }
      })
    );
    expect(extracted.entries.map(project)).toMatchSnapshot();
  });

  describe('errors', () => {
    const bad =
      (files: Record<string, string>, options = {}) =>
      () => ({
        root: tempProject(files, options).root,
        packages: ['project']
      });
    const failures: [string, () => ApiDocsConfig & { root: string }][] = [
      ['no packages', () => ({ root: fixturesRoot, packages: [] })],
      ['missing tsconfig.lib.json', () => ({ root: fixturesRoot, packages: ['external'] })],
      ['missing ng-package.json', bad({}, { ngPackage: false })],
      ['package.json not an object', bad({ 'project/package.json': '[]' })],
      ['missing package name', bad({ 'project/package.json': '{}' })],
      ['invalid entryFile', bad({ 'project/ng-package.json': '{"lib":{}}' })],
      ['missing entrypoint', bad({ 'project/ng-package.json': '{"lib":{"entryFile":"x.ts"}}' })],
      [
        'unknown external',
        () => ({
          root: fixturesRoot,
          packages: ['library', 'dependency'],
          externalApis: [{ importPath: '@angular/cdk/drag-drop', names: ['NotAnExport'] }]
        })
      ],
      [
        'external module not loaded by any package',
        () => ({
          root: fixturesRoot,
          packages: ['library', 'dependency'],
          externalApis: [{ importPath: '@angular/cdk/menu', names: ['CdkMenuTrigger'] }]
        })
      ]
    ];

    it.each(failures)('%s', async (_name, setup) => {
      const options = setup();
      const failure = (await extractApiDocumentation(fixtureConfig(options)).catch(
        (e: unknown) => e
      )) as Error;
      expect(failure.message.split(options.root).join('<root>')).toMatchSnapshot();
    });
  });

  it('fails when Angular does not document a public class', async () => {
    const original = NgtscProgram.prototype.getApiDocumentation;
    vi.spyOn(NgtscProgram.prototype, 'getApiDocumentation').mockImplementation(function (
      this: NgtscProgram,
      ...args
    ) {
      const result = original.apply(this, args);
      return { ...result, entries: result.entries.filter(e => e.name !== 'FixtureComponent') };
    });
    await expect(extractApiDocumentation(fixtureConfig())).rejects.toThrow(
      'Angular did not document the public export @fixture/library/secondary#FixtureComponent'
    );
  });

  it('does not mutate compiler records nor leak raw data', async () => {
    const original = NgtscProgram.prototype.getApiDocumentation;
    const records: DocEntry[] = [];
    const copies: DocEntry[] = [];
    vi.spyOn(NgtscProgram.prototype, 'getApiDocumentation').mockImplementation(function (
      this: NgtscProgram,
      ...args
    ) {
      const result = original.apply(this, args);
      records.push(...result.entries);
      copies.push(...structuredClone(result.entries));
      return result;
    });
    const first = await extractApiDocumentation(
      fixtureConfig({ externalApis: fixtureExternalApis })
    );
    expect(records).toEqual(copies);
    expect(JSON.stringify(first)).not.toMatch(/"raw":/);
    expect(stable(first)).toEqual(stable(documentation));
  });
});
