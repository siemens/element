// Call the parent package's docs-composer entrypoint

import { dirname, join, relative } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const currentDir = dirname(fileURLToPath(import.meta.url));
const cwd = process.cwd();

const nodeModulesDirName = 'node_modules';
let basePath = cwd;
let maxLevels = 10;
while (!fs.existsSync(join(basePath, nodeModulesDirName))) {
  basePath = dirname(basePath);
  maxLevels -= 1;
  if (maxLevels <= 0) {
    throw new Error(
      'Node modules path does not exist, please ensure you are running this plugin in a valid MkDocs project with node modules installed.'
    );
  }
}
const packagePath =
  process.env.DOCS_COMPOSER_DEV &&
  ['true', '1', 'yes', 'y'].includes(process.env.DOCS_COMPOSER_DEV.toLowerCase())
    ? cwd
    : join(basePath, nodeModulesDirName, '@simpl', 'docs-composer');
if (!fs.existsSync(packagePath)) {
  throw new Error(
    `Package path '${packagePath}' does not exist, please ensure you have installed the '@simpl/docs-composer' package.`
  );
}
const relativePackagePath = relative(currentDir, packagePath);
const entrypointPath = join(relativePackagePath, 'dist', 'index.js').replace(
  /(?<!\\)\\(?!\\)/g,
  '/'
); // Convert unescaped backslashes.

export default import(entrypointPath);
