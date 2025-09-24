#!/usr/bin/env node
import cpy from 'cpy';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile, writeFile } from 'node:fs';
import { promisify } from 'node:util';
const writeFileAsync = promisify(writeFile);
const readFileAsync = promisify(readFile);

const baseDir = process.cwd();
const currentDir = dirname(fileURLToPath(import.meta.url));
const destination = `${baseDir}/dist/@siemens/element-ng/schematics`;

await cpy(['**/*.json', '!package.json', '!tsconfig.json'], destination, {
  cwd: currentDir
});
// The actual shipped bundle requires the .cjs extension
const collectionJson = `${destination}/collection.json`;
const migrationJson = `${destination}/migration.json`;

for (const file of [collectionJson, migrationJson]) {
  const content = await readFileAsync(file, 'utf8');
  const updatedContent = content.replace(/index#/gi, 'index.cjs#');
  await writeFileAsync(file, updatedContent);
}
