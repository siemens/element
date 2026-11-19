/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { readFileSync } from 'node:fs';

import { describe, expect, it, vi } from 'vitest';

import { resolveConfig } from '../configuration.js';
import type { ApiOrigin } from '../extraction/model.js';
import { documentation, source as baseSource } from '../fixtures/builders.js';
import { writePreparedArtifacts } from '../pipeline/artifacts.js';
import { SCHEMA_VERSION } from '../schema.js';
import { createPresentationContext } from './resolver.js';
import { externalTypeUrl, resolveStandardTypeUrl, safeHref } from './routing.js';

vi.mock('node:fs', async importOriginal => {
  const fs = await importOriginal<typeof import('node:fs')>();
  return { ...fs, readFileSync: vi.fn(fs.readFileSync) };
});
vi.mock('node:fs/promises', async importOriginal => ({
  ...(await importOriginal<typeof import('node:fs/promises')>()),
  mkdir: vi.fn(),
  writeFile: vi.fn(),
  rename: vi.fn()
}));

const config = resolveConfig({ packages: [] });
const context = () => createPresentationContext(documentation(), config);
const origin = (packageName: string, filePath: string, importPath = packageName): ApiOrigin => ({
  name: 'X',
  packageName,
  importPath,
  source: { ...baseSource, filePath: `node_modules/${packageName}/${filePath}`, packageName }
});
const url = (...origins: ApiOrigin[]) => externalTypeUrl(context(), 'X', origins);

describe('externalTypeUrl', () => {
  it('routes to public documentation', async () => {
    const rows: [string, string, string?][] = [
      ['@angular/core', 'types/_chrome-chunk.d.ts'],
      ['@angular/common', 'types/_chunk.d.ts', '@angular/common/http'],
      ['@angular/core', 'types/core.d.ts', '@siemens/element-ng'],
      ['@angular/core', '../.pnpm/a@1/node_modules/x.d.ts'],
      ['@angular/core', 'types\\core.d.ts'],
      ['@angular/cdk', 'types/_a11y-module-chunk.d.ts'],
      ['@angular/cdk', 'types/_portal-chunk.d.ts', '@angular/cdk/portal'],
      ['@angular/cdk', 'types/_portal-chunk.d.ts'],
      ['@angular/material', 'button/index.d.ts'],
      ['rxjs', 'dist/types/internal/X.d.ts']
    ];
    const lines = rows.map(row => `${row.join(' ')} -> ${url(origin(...row))}`);
    await expect(lines.join('\n')).toMatchFileSnapshot('__snapshots__/routing/external.txt');
  });

  it('deduplicates facade origins and leaves missing, local and colliding provenance unresolved', () => {
    const a11y = origin('@angular/cdk', 'types/_a11y-module-chunk.d.ts');
    expect(url(a11y, { ...a11y, packageName: '@siemens/element-ng' })).toBe(
      'https://material.angular.dev/cdk/a11y/api#X'
    );
    expect(url()).toBeUndefined();
    expect(url({ name: 'X', packageName: '@fixture/local', source: baseSource })).toBeUndefined();
    expect(url(a11y, origin('ol', 'Overlay.d.ts'))).toBeUndefined();
  });
});

describe('package homepage fallback', () => {
  const reference = origin('@fixture/homepage', 'index.d.ts');
  const manifest = (homepage?: string) =>
    vi.mocked(readFileSync).mockReturnValueOnce(JSON.stringify({ homepage }));

  it('reads the homepage once per presentation', () => {
    const current = context();
    manifest('https://first.example/');
    const urls = [current, current].map(c => externalTypeUrl(c, 'A', [reference]));
    manifest('https://changed.example/');
    urls.push(externalTypeUrl(context(), 'A', [reference])!);
    expect(urls).toEqual([...Array(2).fill('https://first.example/'), 'https://changed.example/']);
  });

  it.each([undefined, 'javascript:alert(1)'])('falls back to npm for homepage %s', homepage => {
    manifest(homepage);
    expect(url(reference)).toBe('https://www.npmjs.com/package/@fixture/homepage');
  });
});

describe('resolveStandardTypeUrl', () => {
  it('links standard names without matching inherited object properties', async () => {
    const names = ['Pick', 'Error', 'PromiseLike', 'CustomType', 'constructor', '__proto__'];
    await expect(
      names.map(n => `${n} ${resolveStandardTypeUrl(n)}`).join('\n')
    ).toMatchFileSnapshot('__snapshots__/routing/standard.txt');
  });
});

describe('safeHref', () => {
  it('accepts exactly what the artifact validator accepts', async () => {
    const list =
      'https://a.test/x|mailto:x@y|#frag|rel/page.md|//evil.test|https://|javascript:alert(1)|data:x|a\u007fb|a b|\\x|http://[bad|';
    const hrefs = list.split('|');
    const keys = 'documentation declaration groups signatures relatedTypeIds'.split(' ');
    const view = Object.fromEntries(keys.map(key => [key, []]));
    const root = { kind: 'root', path: 'api/index.md', title: 'x', entries: [], readme: '' };
    const plan = { navigation: [{ Overview: root.path }], referencePaths: {}, pages: [root] };
    const publish = (sourceUrl: string) =>
      writePreparedArtifacts(
        {
          schemaVersion: SCHEMA_VERSION,
          symbols: [
            { id: 'f#S', sourceUrl, metadata: [], referencePath: null, api: view, type: view }
          ],
          ...{ index: {}, memberIndex: {}, members: {} },
          targets: { 'f#S': { symbolId: 'f#S', anchor: 's' } }
        } as never,
        plan as never,
        config
      )
        .then(() => true)
        .catch(() => false);
    const accepted = await Promise.all(hrefs.map(publish));
    expect(accepted.filter(Boolean)).toHaveLength(4);
    expect(hrefs.map(href => safeHref(href) !== null)).toEqual(accepted);
  });
});
