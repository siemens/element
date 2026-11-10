/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { fileURLToPath } from 'node:url';

import { resolveConfig, type ApiDocsConfig, type ExternalApi } from '../configuration.js';
import { extractApiDocumentation } from '../extraction/extract.js';
import type { ApiDocumentation } from '../extraction/model.js';

/** Root containing `README.md` and the fixture packages. */
export const fixturesRoot = fileURLToPath(new URL('.', import.meta.url));

/** External APIs reached through the `library` fixture. */
export const fixtureExternalApis: ExternalApi[] = [
  { importPath: '@angular/cdk/drag-drop', names: ['CdkDrag', 'CdkDropList'] }
];

// Keep the source URLs in the existing fixture snapshots stable.
export const fixtureSourceBase = 'https://github.com/siemens/element/blob/main/';
export const fixtureConfig = (overrides: Partial<ApiDocsConfig> = {}) =>
  resolveConfig({
    root: fixturesRoot,
    packages: ['library', 'dependency'],
    links: { sourceBase: fixtureSourceBase },
    ...overrides
  });

let fixtureDocumentation: Promise<ApiDocumentation> | undefined;

/** One shared extraction of `library` + `dependency`; treat the result as read-only. */
export function extractFixtures(): Promise<ApiDocumentation> {
  fixtureDocumentation ??= extractApiDocumentation(
    fixtureConfig({ externalApis: fixtureExternalApis })
  );
  return fixtureDocumentation;
}

/**
 * Snapshot projection: drops `undefined` and replaces dependency-version details
 * (node_modules line numbers and bundler chunk names) with stable package paths.
 */
export function stable<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_key, item: unknown) => {
      if (
        item &&
        typeof item === 'object' &&
        'filePath' in item &&
        typeof item.filePath === 'string' &&
        'packageName' in item
      ) {
        return {
          packageName: item.packageName,
          filePath: item.filePath.replace(/[^/]*-chunk\.d\.ts$/, '<chunk>.d.ts')
        };
      }
      return item;
    })
  ) as T;
}
