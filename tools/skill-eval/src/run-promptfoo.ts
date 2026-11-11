/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { spawnSync } from 'node:child_process';
import { readFile, rm } from 'node:fs/promises';
import path from 'node:path';

import { environmentValue, outputDirectory, packageDirectory, requireTarget } from './config';
import { prepareFixture } from './fixture/prepare';
import { createTemporaryDirectory, prepareOutputDirectory } from './utils';

requireTarget();
const output = outputDirectory();
await prepareOutputDirectory(output);

let fixtureRoot: string | undefined;
try {
  if (!environmentValue('SKILL_EVAL_FIXTURE')) {
    fixtureRoot = await createTemporaryDirectory();
    process.env.SKILL_EVAL_FIXTURE = await prepareFixture(fixtureRoot);
  }
  const result = spawnSync(
    'promptfoo',
    ['eval', '-c', 'promptfooconfig.ts', ...process.argv.slice(2)],
    {
      cwd: packageDirectory,
      env: {
        ...process.env,
        PROMPTFOO_DISABLE_TELEMETRY: '1',
        PROMPTFOO_DISABLE_UPDATE: '1',
        PROMPTFOO_FAILED_TEST_EXIT_CODE: '0'
      },
      stdio: 'inherit'
    }
  );
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    process.exitCode = result.status ?? 1;
  } else {
    const report = path.join(output, 'promptfoo.json');
    const { results } = JSON.parse(await readFile(report, 'utf8')) as {
      results: { stats: { errors: number } };
    };
    if (results.stats.errors > 0) {
      process.stderr.write(
        `Promptfoo recorded ${results.stats.errors} provider or verifier errors; see ${report}\n`
      );
      process.exitCode = 1;
    }
  }
} finally {
  if (fixtureRoot) {
    await rm(fixtureRoot, { recursive: true, force: true });
  }
}
