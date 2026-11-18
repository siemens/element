/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

import type { ExternalUrlResolver, ResolvedApiDocsConfig } from '../configuration.ts';
import type { ApiOrigin, ApiSource } from '../extraction/model.ts';
import type { PresentationContext } from './context.ts';
import { resolvePlatformUrl } from './platform-links.ts';

const npmUrl = (packageName: string): string => 'https://www.npmjs.com/package/' + packageName;

const utilityTypeFragments: Readonly<Record<string, string>> = {
  Pick: 'picktype-keys',
  NonNullable: 'nonnullabletype',
  Exclude: 'excludeuniontype-excludedmembers',
  Readonly: 'readonlytype',
  Required: 'requiredtype'
};

/** Resolve standard-library symbols after contextual resolution. Null marks ambiguous names. */
export function resolveStandardTypeUrl(name: string): string | null | undefined {
  const fragment = Object.hasOwn(utilityTypeFragments, name)
    ? utilityTypeFragments[name]
    : undefined;
  if (fragment)
    return 'https://www.typescriptlang.org/docs/handbook/utility-types.html#' + fragment;
  if (name === 'PromiseLike' || name === 'ArrayLike')
    return (
      'https://github.com/microsoft/TypeScript/tree/main/src/lib/es5.d.ts#:~:text=interface%20' +
      name
    );
  return resolvePlatformUrl(name);
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

function configuredExternalUrl(
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

function angularDocumentationUrl(
  module: string,
  name: string,
  declaration = ''
): string | undefined {
  const apiPath = /^@angular\/([a-z][\w-]*(?:\/[a-z][\w-]*)*)$/.exec(module)?.[1];
  if (!apiPath || /^__/.test(name) || !/^[\w$]+$/.test(name)) return undefined;
  const [packageName, entrypoint] = apiPath.split('/');
  if (packageName !== 'cdk' && packageName !== 'material')
    return `https://angular.dev/api/${apiPath}/${name}`;

  // Extracted metadata can identify the owning feature even without the public import path.
  const feature =
    entrypoint ??
    /^types\/_([a-z][\w-]*)-module-chunk\.d\.ts$/.exec(declaration)?.[1] ??
    /^([a-z][\w-]*)\/index\.d\.ts$/.exec(declaration)?.[1];
  if (!feature) return undefined;
  return `https://material.angular.dev/${packageName === 'cdk' ? 'cdk' : 'components'}/${feature}/api#${name}`;
}

export const qualifiedDocumentationUrl = (
  links: Links,
  module: string,
  name: string
): string | undefined =>
  configuredExternalUrl(links, { module, name }) ?? angularDocumentationUrl(module, name);

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
  const declaration = declarationPath(origin);
  if (!declaration && !origin.source.packageName) return undefined;
  const packageName = origin.source.packageName ?? origin.packageName;
  const module = origin.importPath ?? packageName;
  const configured = configuredExternalUrl(context.config.links, {
    name: origin.name,
    module,
    sourceFile: origin.source.filePath,
    packageName
  });
  if (configured !== undefined) return configured;
  if (!packageName.startsWith('@angular/'))
    return packageName === 'rxjs'
      ? 'https://rxjs.dev/api/index/class/' + origin.name
      : packageHomepage(packageName, context);
  const entrypoint = module.startsWith(`${packageName}/`) ? module : packageName;
  return angularDocumentationUrl(entrypoint, origin.name, declaration);
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
