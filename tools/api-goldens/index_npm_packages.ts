/* eslint-disable headers/header-format, @typescript-eslint/explicit-function-return-type, tsdoc/syntax, @typescript-eslint/naming-convention, prefer-arrow/prefer-arrow-functions */
/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { readFileSync } from 'fs';
import * as fs from 'fs';
import * as path from 'path';
import { Piscina } from 'piscina';
import { fileURLToPath } from 'url';

import { findEntryPointsWithinNpmPackage } from './find_entry_points.js';
import { normalizePathToPosix } from './path-normalize.js';
import { testApiGolden } from './test_api_report.js';

/** Interface describing contents of a `package.json`. */
export interface PackageJson {
  name: string;
  exports?: Record<string, { types?: string }>;
  types?: string;
  typings?: string;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Entry point for the `api_golden_test_npm_package` Bazel rule. This function determines
 * all types within the specified NPM package and builds API reports that will be compared
 * against golden files within the given golden directory.
 */
export async function main(
  goldenDir: string,
  npmPackageDir: string,
  approveGolden: boolean,
  stripExportPattern: RegExp,
  typeNames: string[]
) {
  const packageJsonPath = path.join(npmPackageDir, 'package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as PackageJson;
  const entryPoints = findEntryPointsWithinNpmPackage(npmPackageDir, packageJson);
  const worker = new Piscina<Parameters<typeof testApiGolden>, string>({
    filename: path.resolve(__dirname, './test_api_report.ts')
  });

  const processEntryPoint = async (subpath: string, typesEntryPointPath: string) => {
    // API extractor generates API reports as markdown files. For each types
    // entry-point we maintain a separate golden file. These golden files are
    // based on the name of the defining NodeJS exports subpath in the NPM package,
    // See: https://api-extractor.com/pages/overview/demo_api_report/.
    const goldenName = path.join(subpath, 'index.api.md');
    const goldenFilePath = path.join(goldenDir, goldenName);
    const moduleName = normalizePathToPosix(path.join(packageJson.name, subpath));

    // Run API extractor in child processes. This is because API extractor is very
    // synchronous. This allows us to significantly speed up golden testing.
    const actual = await worker.run([
      typesEntryPointPath,
      stripExportPattern,
      typeNames,
      packageJsonPath,
      moduleName
    ]);

    if (actual === null) {
      console.error(`Could not generate API golden for subpath: "${subpath}". See errors above.`);
      process.exit(1);
    }

    if (approveGolden) {
      await fs.promises.mkdir(path.dirname(goldenFilePath), { recursive: true });
      await fs.promises.writeFile(goldenFilePath, actual, 'utf8');
    } else {
      const expected = await fs.promises.readFile(goldenFilePath, 'utf8');
      if (actual !== expected) {
        // Keep track of outdated goldens for error message.
        outdatedGoldens.push(goldenName);
        return false;
      }
    }

    return true;
  };

  const outdatedGoldens: string[] = [];
  const tasks: Promise<boolean>[] = [];
  // Process in batches. Otherwise we risk out of memory errors.
  const batchSize = 10;

  for (let i = 0; i < entryPoints.length; i += batchSize) {
    const batchEntryPoints = entryPoints.slice(i, i + batchSize);

    for (const { subpath, typesEntryPointPath } of batchEntryPoints) {
      tasks.push(processEntryPoint(subpath, typesEntryPointPath));
    }

    // Wait for new batch.
    await Promise.all(tasks);
  }

  // Wait for final batch/retrieve all results.
  await Promise.all(tasks);

  return outdatedGoldens;
}
