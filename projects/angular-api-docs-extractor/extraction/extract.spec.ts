/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { NgtscProgram, type DocEntry } from '@angular/compiler-cli';
import path from 'node:path';
import { cpSync, mkdirSync, mkdtempSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { extractApiDocumentation } from './extract.ts';
import type { ApiDocsConfig } from '../configuration.ts';
import {
  extractFixtures,
  fixtureConfig,
  fixtureExternalApis,
  fixturesRoot,
  stable
} from '../fixtures/test-setup.ts';
import type { ApiEntry } from './model.ts';

const documentation = await extractFixtures();
const isCdk = (entry: ApiEntry): boolean => entry.source.packageName === '@angular/cdk';
const entries = documentation.entries.filter(entry => !isCdk(entry));
const declaration = (name: string) => entries.find(entry => entry.name === name)!;
const member = (owner: string, name: string) =>
  declaration(owner).members.find(entry => entry.name === name);
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

  it('discovers declarations, aliases, and documentation-only types', async () => {
    const inventory = entries.map(e => {
      const flags = [
        e.docsVisible ? 'visible' : 'hidden',
        e.internal && 'internal',
        e.related && 'related',
        e.documentationOnly && 'docs-only',
        e.typeOnlyExport && 'type-only',
        e.aliasOf && `alias of ${e.aliasOf}`
      ].filter(Boolean);
      return `${e.id} | ${e.angularKind ?? e.kind} | ${flags.join(', ')} | ${e.source.filePath}`;
    });
    await expect(inventory.join('\n')).toMatchFileSnapshot('__snapshots__/declarations.txt');
    expect(declaration('DocumentedAlias')).toMatchObject({
      description: 'Alias declaration summary.',
      jsdocTags: expect.arrayContaining([{ name: 'deprecated', comment: 'Alias deprecation.' }])
    });
    expect(declaration('FacetedValue').declarationVariants).toMatchObject([
      { kind: 'constant', type: 'typeof RuntimeTarget' },
      { kind: 'type_alias', type: 'RuntimeTarget' }
    ]);
  });

  it('extracts Angular metadata and differentiates real signal bindings from lookalikes', () => {
    expect(declaration('FixtureService').providedInRoot).toBe(true);
    expect(declaration('UnprovidedService').providedInRoot).toBe(false);
    expect(declaration('FixtureComponent')).toMatchObject({
      selector: 'fixture-component',
      exportAs: ['fixture'],
      generics: ['T extends string = string'],
      extends: ['BaseDirective'],
      description: 'A signal-backed component.'
    });
    expect(member('FixtureComponent', 'value')).toMatchObject({
      inputAlias: 'current',
      outputAlias: 'currentChange',
      signalReadType: 'number',
      sourceDefaultValue: '3'
    });
    expect(member('FixtureComponent', 'title')).toMatchObject({
      inputAlias: 'heading',
      required: true
    });
    expect(member('SignalMetadata', 'requiredConverted')).toMatchObject({
      required: true,
      signalReadType: 'number',
      signalTransformType: 'number'
    });
    expect(member('SignalMetadata', 'optionalCount')?.signalReadType).toBe('number | undefined');
    expect(member('SignalMetadata', 'namespaceInput')?.inputAlias).toBe('namespaceInput');
    expect(member('SignalMetadata', 'aliasInput')?.inputAlias).toBe('aliasInput');
    expect(member('SignalMetadata', 'customInput')).toMatchObject({
      inputAlias: undefined,
      sourceDefaultValue: 'fakeInput(3)'
    });
  });

  it('extracts source visibility and instantiated heritage', () => {
    expect(member('FixtureComponent', 'explicit')?.explicitPublic).toBe(true);
    expect(member('FixtureComponent', 'protectedMember')?.visibility).toBe('protected');
    expect(declaration('AccessorMetadata').members.filter(m => m.name === 'value')).toMatchObject([
      { kind: 'getter' },
      { kind: 'setter' }
    ]);
    expect(member('MetadataGrandchild', 'value')).toMatchObject({
      type: 'string[]',
      inherited: true,
      inheritedFrom: { name: 'GenericParent', type: 'GenericParent<string[]>' },
      implementedFrom: { name: 'Contract', type: 'Contract<string[]>' }
    });
    expect(member('SelectionOverride', 'selectedRows')).toMatchObject({
      inherited: false,
      implementedFrom: { name: 'SelectionContract', type: 'SelectionContract<string>' }
    });
    expect(declaration('BuiltinInherited').members.map(m => m.name)).toEqual(
      expect.arrayContaining(['fromCharCode', '[Symbol.iterator]'])
    );
    expect(member('FixtureStatePipe', 'transform')?.implementedFrom).toMatchObject({
      name: 'PipeTransform',
      importPath: '@angular/core'
    });
    expect(member('IndexedRecord', '[name: string]')?.kind).toBe('index_signature');
  });

  it('distinguishes overloads from implementations and extracts constructor parameters', () => {
    expect(member('MetadataOverloads', 'convert')?.signatures).toMatchObject([
      {
        implementation: false,
        returnType: 'string',
        parameters: [{ name: 'value', type: 'string' }]
      },
      {
        implementation: false,
        returnType: 'number',
        parameters: [{ name: 'value', type: 'number' }]
      },
      { implementation: true, returnType: 'string | number' }
    ]);
    expect(member('ExplicitConstructorService', 'constructor')?.signatures).toMatchObject([
      {
        parameters: [
          { name: 'name', optional: true, sourceDefaultValue: "'world'" },
          { name: 'labels', rest: true, type: 'string[]' }
        ]
      }
    ]);
    expect(member('ProtectedConstructorService', 'constructor')?.visibility).toBe('protected');
    expect(member('PrivateConstructorService', 'constructor')).toBeUndefined();
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
