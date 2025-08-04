import { glob } from 'node:fs/promises';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

async function updatePeerDependencies() {
  const rootDir = new URL('.', import.meta.url).pathname;

  const versions = new Map();
  for await (const file of glob([
    join(rootDir, 'package.json'),
    join(rootDir, 'projects/**/package.json')
  ])) {
    const content = JSON.parse(await readFile(file, { encoding: 'utf8' }));
    versions.set(content.name, content.version);
  }

  for await (const file of glob([
    join(rootDir, 'package.json'),
    join(rootDir, 'projects/**/package.json'),
    join(rootDir, 'dist/**/package.json')
  ])) {
    let updated = false;
    const content = JSON.parse(await readFile(file, { encoding: 'utf8' }));
    if (content.peerDependencies) {
      for (const dependencyType of [
        'dependencies',
        'devDependencies',
        'peerDependencies',
        'optionalDependencies'
      ]) {
        for (const name of Object.keys(content[dependencyType] ?? [])) {
          const version = versions.get(name);
          if (versions.has(name)) {
            content[dependencyType][name] = version;
            updated = true;
          }
        }
      }
    }

    if (updated) {
      await writeFile(file, JSON.stringify(content, null, 2));
    }
  }
}

updatePeerDependencies();
