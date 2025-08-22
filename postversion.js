import { glob } from 'node:fs/promises';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { major, parse, satisfies } from 'semver';

/**
 * This assumes that we currently either have a fixed version or only a major version.
 * @param currentVersionOrRange Either a fixed version (e.g. `1.2.3`) or a major version (e.g. `2`)
 * @param newVersion
 * @return {string} The new version or range
 */
function getNewVersionOrRange(currentVersionOrRange, newVersion) {
  const parsed = parse(currentVersionOrRange);
  if (parsed) {
    return newVersion;
  } else {
    if (!satisfies(newVersion, currentVersionOrRange)) {
      // set the new version
      return `${major(newVersion)}`;
    }
  }
}

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
          if (versions.has(name)) {
            content[dependencyType][name] = getNewVersionOrRange(
              content[dependencyType][name],
              versions.get(name)
            );
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
