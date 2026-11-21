/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const referenceCategories = ['components', 'directives', 'injectables', 'pipes', 'types'] as const;
export type ReferenceCategory = (typeof referenceCategories)[number];

export interface ExternalApi {
  importPath: string;
  names: string[];
}

export type ExternalUrlResolver = (ref: {
  name: string;
  module: string;
  sourceFile?: string;
  packageName?: string;
}) => string | undefined;

export interface ApiDocsConfig {
  root?: string;
  packages: readonly string[];
  project?: { tsconfig?: string; skipEntryPoints?: readonly string[] };
  externalApis?: readonly ExternalApi[];
  output?: { dir?: string };
  reference?: { dir?: string; categories?: readonly ReferenceCategory[] };
  /**
   * `unwrapWrapperFunctionTypes`: show defaults like `t(() => value)` as `value` when the
   * displayed type of the member or parameter is one of these type names.
   */
  defaultValues?: { unwrapWrapperFunctionTypes?: readonly string[] };
  links?: {
    sourceBase?: string | null;
    documentationUrls?: Readonly<Record<string, string>>;
    resolvers?: readonly ExternalUrlResolver[];
  };
}

export interface ResolvedApiDocsConfig {
  readonly root: string;
  readonly packages: readonly string[];
  readonly project: { readonly tsconfig: string; readonly skipEntryPoints: readonly string[] };
  readonly externalApis: readonly ExternalApi[];
  readonly output: { readonly dir: string };
  readonly reference: { readonly dir: string; readonly categories: readonly ReferenceCategory[] };
  readonly defaultValues: { readonly unwrapWrapperFunctionTypes: readonly string[] };
  readonly links: {
    readonly sourceBase: string | null;
    readonly documentationUrls: Readonly<Record<string, string>>;
    readonly resolvers: readonly ExternalUrlResolver[];
  };
}

export function defineConfig(config: ApiDocsConfig): ApiDocsConfig {
  return config;
}

/** Resolve filesystem paths once. The tsconfig and reference directory remain relative to their package and docs directory, respectively. */
export function resolveConfig(config: ApiDocsConfig, configFile?: string): ResolvedApiDocsConfig {
  const base = configFile === undefined ? process.cwd() : path.dirname(path.resolve(configFile));
  const root = path.resolve(base, config.root ?? '.');
  const referenceDir = (config.reference?.dir ?? 'api').replaceAll('\\', '/');
  if (
    /^[a-z]:/i.test(referenceDir) ||
    referenceDir.split('/').some(segment => !segment || segment === '.' || segment === '..')
  )
    throw new Error(
      `Invalid reference directory (expected a path relative to docs_dir): ${referenceDir}`
    );
  const categories = [...(config.reference?.categories ?? referenceCategories)];
  if (
    categories.some(category => !referenceCategories.includes(category)) ||
    new Set(categories).size !== categories.length
  )
    throw new Error('Reference categories must be an ordered subset of the built-in categories.');
  const sourceBase = config.links?.sourceBase ?? null;
  return {
    root,
    packages: config.packages.map(directory => path.resolve(root, directory)),
    project: {
      tsconfig: config.project?.tsconfig ?? 'tsconfig.lib.json',
      skipEntryPoints: [...(config.project?.skipEntryPoints ?? ['internal', 'testing'])]
    },
    externalApis: (config.externalApis ?? []).map(api => ({ ...api, names: [...api.names] })),
    output: { dir: path.resolve(root, config.output?.dir ?? 'dist/api-docs') },
    reference: { dir: referenceDir, categories },
    defaultValues: {
      unwrapWrapperFunctionTypes: [...(config.defaultValues?.unwrapWrapperFunctionTypes ?? [])]
    },
    links: {
      sourceBase: sourceBase && !sourceBase.endsWith('/') ? `${sourceBase}/` : sourceBase,
      documentationUrls: { ...config.links?.documentationUrls },
      resolvers: [...(config.links?.resolvers ?? [])]
    }
  };
}

const configNames = ['api-docs.config.ts', 'api-docs.config.mjs', 'api-docs.config.js'];

async function findConfig(): Promise<string> {
  for (const name of configNames) {
    const file = path.resolve(name);
    try {
      await stat(file);
      return file;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
  }
  throw new Error(`No API docs config found. Expected ${configNames.join(', ')} or --config.`);
}

/** Load the default export, resolving its paths relative to the config file. */
export async function loadConfig(file?: string): Promise<ResolvedApiDocsConfig> {
  const configFile = file === undefined ? await findConfig() : path.resolve(file);
  const { default: config }: { default?: unknown } = await import(pathToFileURL(configFile).href);
  if (
    !config ||
    typeof config !== 'object' ||
    !('packages' in config) ||
    !Array.isArray(config.packages) ||
    !config.packages.every((entry: unknown) => typeof entry === 'string')
  ) {
    throw new Error(`${configFile} must default-export a config with a packages array of paths.`);
  }
  return resolveConfig(config as ApiDocsConfig, configFile);
}
