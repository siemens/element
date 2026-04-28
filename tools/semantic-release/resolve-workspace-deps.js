/**
 * Semantic-release prepare plugin that resolves `workspace:*` references in
 * dist package.json files to the concrete release version.
 *
 * Background: ng-packagr copies peerDependencies from the source package.json
 * into the build output verbatim, so `workspace:*` ends up in every dist
 * package.json. pnpm only replaces the workspace protocol for packages that
 * are workspace members; the dist directories are not registered as workspace
 * members, so `pnpm publish dist/@siemens/element-ng` would fail with
 * ERR_PNPM_CANNOT_RESOLVE_WORKSPACE_PROTOCOL.
 *
 * This plugin runs its `prepare` step after all `@anolilab/semantic-release-pnpm`
 * prepare steps have bumped every package version. At that point
 * `context.nextRelease.version` holds the new version (e.g. 49.7.0), and we
 * replace every `workspace:*` value in the dist package.json files with that
 * exact version string so that the subsequent `pnpm publish` calls succeed.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { glob } from 'node:fs/promises';
import { join } from 'node:path';

const DEP_TYPES = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];

/**
 * @param {object} _pluginConfig
 * @param {{ nextRelease: { version: string }, logger: { log: Function }, cwd: string }} context
 */
export async function prepare(_pluginConfig, context) {
  const {
    nextRelease: { version },
    logger,
    cwd
  } = context;

  logger.log(`Resolving workspace:* references in dist packages to version ${version}`);

  for await (const pkgJsonPath of glob(join(cwd, 'dist/@siemens/*/package.json'))) {
    const content = JSON.parse(readFileSync(pkgJsonPath, 'utf8'));
    let updated = false;

    for (const depType of DEP_TYPES) {
      for (const name of Object.keys(content[depType] ?? {})) {
        const value = content[depType][name];
        if (typeof value === 'string' && value.startsWith('workspace:')) {
          content[depType][name] = version;
          updated = true;
        }
      }
    }

    if (updated) {
      writeFileSync(pkgJsonPath, JSON.stringify(content, null, 2) + '\n');
      logger.log(`  Updated ${pkgJsonPath}`);
    }
  }
}
