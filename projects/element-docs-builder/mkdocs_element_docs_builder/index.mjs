// Call the parent package's docs-composer entrypoint

import { dirname, join, relative } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const currentDir = dirname(fileURLToPath(import.meta.url));
const cwd = process.cwd();
let relativeCwd = relative(currentDir, cwd);
let nodeModulesPath = join(currentDir, relativeCwd, 'node_modules');
let maxLevels = 10;
while (!fs.existsSync(join(currentDir, nodeModulesPath))) {
  nodeModulesPath = join('..', nodeModulesPath);
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
    ? relativeCwd
    : join(nodeModulesPath, '@simpl', 'docs-composer');
if (!fs.existsSync(join(currentDir, packagePath))) {
  throw new Error(
    `Package path '${packagePath}' does not exist, please ensure you have installed the '@simpl/docs-composer' package.`
  );
}
const entrypointPath = join(packagePath, 'dist', 'index.js');

export default import(entrypointPath);
