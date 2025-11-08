/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import sdk from '@stackblitz/sdk';

import { AssetProject, Project, ProjectTemplates } from './stackblitz.model';

export interface OpenStackblitzOptions {
  /** Framework to use for the Stackblitz project. */
  framework: string;
  /** Project templates configuration. */
  templates: ProjectTemplates;
  /** Example name to load. */
  example: string;
  /** Base URL for fetching example files. */
  baseUrl: string;
}

export const isProject = (item: AssetProject | Project): item is Project => {
  return !Array.isArray((item as Project).files);
};

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

const addRelativeImports = async (
  files: Record<string, string>,
  baseUrl: string,
  baseFolder: string,
  path: string
): Promise<void> => {
  const ts = files[path];
  const pending: string[] = [];
  for (const item of getRelativeImports(ts)) {
    //const exampleDir = folder(example);
    const response = await fetch(`${baseUrl}${item}.ts`);
    files[absolute(baseFolder, `${item}.ts`)] = await response.text();
  }
  for (const importFile of pending) {
    await addRelativeImports(files, baseUrl, baseFolder, importFile);
  }
};

export const openStackblitz = async (options: OpenStackblitzOptions): Promise<void> => {
  const { framework, templates, example, baseUrl } = options;
  const template = templates.find(item => item.name === framework);
  if (!template) {
    return;
  }

  // Get template project files
  let files: Record<string, string> = {};
  if (isAssetProject(template)) {
    for (const file of template.files) {
      const response = await fetch(`${template.assetUrl}/${file}`);
      files[file] = await response.text();
    }
  } else if (isProject(template)) {
    files = { ...template.files };
  }

  const baseFolder = getBaseFolder(files);
  const exampleFolder = folder(example);
  updateExampleImport(files, example);

  // Add example HTML file
  const html = await (await fetch(`${baseUrl}${example}.html`)).text();
  files[`${baseFolder}${example}.html`] = html;

  // Add example TS file
  const ts = await (await fetch(`${baseUrl}${example}.ts`)).text();
  const tsPath = `${baseFolder}${example}.ts`;
  files[tsPath] = ts;

  // Get relative imports files
  await addRelativeImports(
    files,
    `${baseUrl}${exampleFolder}`,
    `${baseFolder}${exampleFolder}`,
    tsPath
  );

  sdk.openProject(
    {
      title: `Element ${framework} ${example} example`,
      template: 'node',
      description: 'Blank starter project for building ES6 apps.',
      files: { ...files }
    },
    {
      openFile: tsPath
    }
  );
};
