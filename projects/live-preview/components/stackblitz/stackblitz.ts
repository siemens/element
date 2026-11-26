/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import sdk from '@stackblitz/sdk';

import { AssetProject, Project } from './stackblitz.model';

export interface LoadStackblitzProjectOptions {
  /** Project template to create the Stackblitz project from. */
  template: AssetProject | Project;
  /** Example name to load. */
  example: string;
  /** Base URL for fetching example files. */
  baseUrl: string;
  /** Base URL to resolve a relative template `assetUrl` against. */
  assetBaseUrl: string;
  /** Abort signal for example-specific requests. */
  signal?: AbortSignal;
}

export interface StackblitzProject {
  title: string;
  files: Record<string, string>;
  /** File to open in the Stackblitz editor. */
  openFile: string;
}

export const isAssetProject = (item: AssetProject | Project): item is AssetProject => {
  return 'assetUrl' in item;
};

const folder = (path: string): string => path.substring(0, path.lastIndexOf('/') + 1);

const absolute = (base: string, relative: string): string => {
  if (relative.startsWith('./')) {
    return `${base}${relative.substring(2)}`;
  }
  while (relative.startsWith('../')) {
    base = base.split('/').slice(0, -2).join('/') + '/';
    relative = relative.substring(3);
  }
  return `${base}${relative}`;
};

const fileName = (path: string): string => path.substring(path.lastIndexOf('/') + 1);

/** Get the base folder for the example files */
const getBaseFolder = (files: Record<string, string>): string => {
  for (const path of Object.keys(files)) {
    const file = path.split('/').at(-1);
    if (file?.includes('example')) {
      return folder(path);
    }
  }
  return '';
};

const updateExampleImport = (files: Record<string, string>, example: string): string => {
  const templateExamplePath = Object.keys(files).find(path =>
    path.split('/').at(-1)?.includes('example')
  )!;

  delete files[templateExamplePath];
  const file = fileName(templateExamplePath);
  const toReplace = file.substring(0, file.length - 3);
  for (const path of Object.keys(files)) {
    files[path] = files[path].replace(toReplace, example);
  }
  return '';
};

const getRelativeImports = (ts: string): string[] => {
  const imports: string[] = [];
  // Regex to match relative import statements
  const relativeImportRegex = /^import\s+[^'"]*\s+from\s+['"](\.\/|\.\.\/)[^'"]+['"];?/gm;
  let match: RegExpExecArray | null;
  while ((match = relativeImportRegex.exec(ts)) !== null) {
    const importPath = match[0].match(/from\s+['"]([^'"]+)['"]/);
    if (importPath?.[1]) {
      imports.push(importPath[1]);
    }
  }
  return imports;
};

const getStyleUrls = (ts: string): string[] => {
  const styleUrls = [];

  const singleMatch = ts.match(/styleUrl:\s*['"]([^'"]+)['"]/);
  if (singleMatch?.[1]) {
    styleUrls.push(singleMatch[1]);
  }

  const pluralMatch = ts.match(/styleUrls:\s*\[([^\]]+)\]/);
  if (pluralMatch?.[1]) {
    const urls = pluralMatch[1].matchAll(/['"]([^'"]+)['"]/g);
    for (const url of urls) {
      if (url[1] && !styleUrls.includes(url[1])) {
        styleUrls.push(url[1]);
      }
    }
  }

  return styleUrls;
};

const fetchText = async (url: string, signal?: AbortSignal): Promise<string> => {
  const response = await fetch(url, { priority: 'low', signal });
  if (!response.ok) {
    throw new Error(`Failed to load ${url}: ${response.status}`);
  }
  return response.text();
};

const fetchOptionalText = async (
  url: string,
  signal?: AbortSignal
): Promise<string | undefined> => {
  const response = await fetch(url, { priority: 'low', signal });
  return response.ok ? response.text() : undefined;
};

// Template files are identical for all examples, so they are only requested once.
const templateFilesCache = new WeakMap<AssetProject, Promise<Record<string, string>>>();

const loadTemplateFiles = (
  template: AssetProject | Project,
  assetBaseUrl: string
): Promise<Readonly<Record<string, string>>> => {
  if (!isAssetProject(template)) {
    return Promise.resolve(template.files);
  }
  let files = templateFilesCache.get(template);
  if (!files) {
    files = Promise.all(
      template.files.map(
        async file =>
          [
            file,
            await fetchText(new URL(`${template.assetUrl}/${file}`, assetBaseUrl).href)
          ] as const
      )
    ).then(entries => Object.fromEntries(entries));
    // Allow a later attempt to retry failed requests.
    files.catch(() => templateFilesCache.delete(template));
    templateFilesCache.set(template, files);
  }
  return files;
};

/**
 * Prefetch all files of the Stackblitz project for an example.
 * Returns `undefined` when the example cannot be opened in Stackblitz.
 */
export const loadStackblitzProject = async ({
  template,
  example,
  baseUrl,
  assetBaseUrl,
  signal
}: LoadStackblitzProjectOptions): Promise<StackblitzProject | undefined> => {
  const exampleTs = await fetchOptionalText(`${baseUrl}${example}.ts`, signal);
  if (!exampleTs?.includes("selector: 'app-sample'")) {
    return undefined;
  }

  const exampleFolder = folder(example);
  const exampleUrl = `${baseUrl}${exampleFolder}`;

  const [templateFiles, html, styles, imports] = await Promise.all([
    loadTemplateFiles(template, assetBaseUrl),
    fetchOptionalText(`${baseUrl}${example}.html`, signal),
    Promise.all(
      getStyleUrls(exampleTs).map(
        async styleUrl =>
          [styleUrl, await fetchOptionalText(absolute(exampleUrl, styleUrl), signal)] as const
      )
    ),
    Promise.all(
      getRelativeImports(exampleTs).map(
        async item =>
          [item, await fetchOptionalText(absolute(exampleUrl, `${item}.ts`), signal)] as const
      )
    )
  ]);

  const files = { ...templateFiles };
  const baseFolder = getBaseFolder(files);
  const exampleBaseFolder = `${baseFolder}${exampleFolder}`;
  updateExampleImport(files, example);

  if (html !== undefined) {
    files[`${baseFolder}${example}.html`] = html;
  }

  const tsPath = `${baseFolder}${example}.ts`;
  files[tsPath] = exampleTs;

  for (const [styleUrl, style] of styles) {
    if (style !== undefined) {
      files[absolute(exampleBaseFolder, styleUrl)] = style;
    }
  }

  for (const [item, ts] of imports) {
    if (ts !== undefined) {
      files[absolute(exampleBaseFolder, `${item}.ts`)] = ts;
    }
  }

  return {
    title: `Element ${template.name} ${example} example`,
    files,
    openFile: tsPath
  };
};

/**
 * Open a prefetched project in a new Stackblitz tab. Must be called synchronously from a user
 * interaction so the browser's popup blocker allows the new tab.
 */
export const openStackblitz = ({ title, files, openFile }: StackblitzProject): void => {
  sdk.openProject(
    {
      title,
      template: 'node',
      description: 'Blank starter project for building ES6 apps.',
      files: { ...files }
    },
    {
      openFile
    }
  );
};
