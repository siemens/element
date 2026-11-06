/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { appendFile } from 'node:fs/promises';

import { prepareFixture } from './fixture/prepare';
import { createTemporaryDirectory } from './utils';

const directory = await prepareFixture(await createTemporaryDirectory());
if (process.env.GITHUB_OUTPUT) {
  await appendFile(process.env.GITHUB_OUTPUT, `directory=${directory}\n`);
}
process.stdout.write(`Prepared ${directory}\n`);
