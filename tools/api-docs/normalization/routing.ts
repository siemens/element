/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

import type { ExternalUrlResolver, ResolvedApiDocsConfig } from '../configuration.js';
import type { ApiOrigin, ApiSource } from '../extraction/model.js';
import type { PresentationContext } from './context.js';

const npmUrl = (packageName: string): string => 'https://www.npmjs.com/package/' + packageName;

const utilityTypeFragments: Readonly<Record<string, string>> = {
  Pick: 'picktype-keys',
  NonNullable: 'nonnullabletype',
  Exclude: 'excludeuniontype-excludedmembers',
  Readonly: 'readonlytype',
  Required: 'requiredtype'
};

/** Resolve standard-library types only after local/contextual symbol resolution. */
export function resolveStandardTypeUrl(name: string): string | undefined {
  const fragment = Object.hasOwn(utilityTypeFragments, name)
    ? utilityTypeFragments[name]
    : undefined;
  if (fragment)
    return 'https://www.typescriptlang.org/docs/handbook/utility-types.html#' + fragment;
  if (name === 'Object' || name === 'Error')
    return (
      'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/' + name
    );
  if (name === 'PromiseLike' || name === 'ArrayLike')
    return (
      'https://github.com/microsoft/TypeScript/tree/main/src/lib/es5.d.ts#:~:text=interface%20' +
      name
    );
  return undefined;
}

/** Package-relative declaration path, independent of pnpm's physical store path. */
function declarationPath(origin: ApiOrigin): string | undefined {
  const file = origin.source.filePath.replaceAll('\\', '/');
  const marker = 'node_modules/' + (origin.source.packageName ?? origin.packageName) + '/';
  const index = file.lastIndexOf(marker);
  return index < 0 ? undefined : file.slice(index + marker.length);
}

function packageHomepage(packageName: string, context: PresentationContext): string {
  const cached = context.homepages.get(packageName);
  if (cached !== undefined) return cached;
  let homepage = npmUrl(packageName);
  const { root } = context.config;
  const candidates = [path.join(root, 'node_modules', packageName, 'package.json')];
  try {
    candidates.push(
      createRequire(path.join(root, 'package.json')).resolve(packageName + '/package.json')
    );
  } catch {
    // Dependencies which do not export their manifest still have a direct package path.
  }
  for (const candidate of candidates) {
    try {
      const metadata: unknown = JSON.parse(readFileSync(candidate, 'utf8'));
      if (
        metadata &&
        typeof metadata === 'object' &&
        'homepage' in metadata &&
        typeof metadata.homepage === 'string' &&
        /^https?:\/\//.test(metadata.homepage)
      ) {
        homepage = metadata.homepage;
        break;
      }
    } catch {
      // Missing optional metadata must not prevent preparing the API page.
    }
  }
  context.homepages.set(packageName, homepage);
  return homepage;
}

/** Must accept no more than the artifact writer's URL validation, which rejects the whole publication. */
export const safeHref = (href: string): string | null =>
  href &&
  !/[\u0000-\u0020\u007f\\]/.test(href) &&
  !href.startsWith('//') &&
  (/^https?:/i.test(href)
    ? /^https?:\/\/[^/]+/i.test(href) && URL.canParse(href)
    : /^mailto:/i.test(href) || !/^[^/?#]*:/.test(href))
    ? href
    : null;

type Links = ResolvedApiDocsConfig['links'];

export const fixedDocumentationUrl = (links: Links, key: string): string | undefined =>
  Object.hasOwn(links.documentationUrls, key) ? links.documentationUrls[key] : undefined;

export function configuredExternalUrl(
  links: Links,
  ref: Parameters<ExternalUrlResolver>[0]
): string | undefined {
  const fixed = fixedDocumentationUrl(links, `${ref.module}#${ref.name}`);
  if (fixed !== undefined) return fixed;
  for (const resolve of links.resolvers) {
    const url = resolve(ref);
    if (url !== undefined) return url;
  }
  return undefined;
}

export const externalTypeUrl = (
  context: PresentationContext,
  name: string,
  origins: readonly ApiOrigin[]
): string | undefined => {
  const matching = origins.filter(origin => origin.name === (origins[0]?.name ?? name));
  const identities = new Set(
    matching.map(
      origin =>
        (origin.source.packageName ?? origin.packageName) +
        ':' +
        origin.source.filePath.replaceAll('\\', '/')
    )
  );
  if (identities.size !== 1) return undefined;
  const origin = matching[0];
  if (!origin) return undefined;
  if (!declarationPath(origin) && !origin.source.packageName) return undefined;
  const packageName = origin.source.packageName ?? origin.packageName;
  const configured = configuredExternalUrl(context.config.links, {
    name: origin.name,
    module: origin.importPath ?? packageName,
    sourceFile: origin.source.filePath,
    packageName
  });
  if (configured !== undefined) return configured;
  if (!packageName.startsWith('@angular/'))
    return packageName === 'rxjs'
      ? 'https://rxjs.dev/api/index/class/' + origin.name
      : packageHomepage(packageName, context);
  const symbolName = origin.name;
  if (/^(?:ɵ|__)/.test(symbolName) || !/^[\w$]+$/.test(symbolName)) return undefined;
  const packageSuffix = packageName.slice('@angular/'.length).split('/')[0];
  if (['cdk', 'material'].includes(packageSuffix)) {
    const importPath = origin.importPath ?? origin.packageName;
    const importedEntrypoint = importPath.startsWith(`@angular/${packageSuffix}/`)
      ? importPath.split('/')[2]
      : undefined;
    const file = origin.source.filePath.replaceAll('\\', '/');
    const marker = `node_modules/@angular/${packageSuffix}/`;
    const declaration = file.includes(marker)
      ? file.slice(file.lastIndexOf(marker) + marker.length)
      : '';
    const sourceEntrypoint =
      /^types\/_([a-z][\w-]*)-module-chunk\.d\.ts$/.exec(declaration)?.[1] ??
      /^([a-z][\w-]*)\/index\.d\.ts$/.exec(declaration)?.[1];
    const entrypoint = importedEntrypoint ?? sourceEntrypoint;
    // Private generated chunks do not have a public API documentation section.
    if (!entrypoint || !/^[a-z][\w-]*$/.test(entrypoint)) return undefined;
    return `https://material.angular.dev/${packageSuffix === 'cdk' ? 'cdk' : 'components'}/${entrypoint}/api#${symbolName}`;
  }
  const importPath = origin.importPath;
  const entrypoint =
    importPath === packageName || importPath?.startsWith(packageName + '/')
      ? importPath
      : packageName;
  return `https://angular.dev/api/${entrypoint.slice('@angular/'.length)}/${symbolName}`;
};

export const sourceUrl = (sourceBase: string | null, source?: ApiSource): string | null => {
  if (
    !sourceBase ||
    !source?.filePath ||
    source.packageName ||
    source.filePath.includes('node_modules/')
  )
    return null;
  const relative = source.filePath;
  if (relative.startsWith('..')) return null;
  return (
    sourceBase +
    relative.replaceAll('\\', '/').split('/').map(encodeURIComponent).join('/') +
    `#L${source.startLine}-L${source.endLine}`
  );
};
