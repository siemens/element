/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { parseArgs } from 'node:util';

import { loadConfig } from '../configuration.ts';

const usage = 'Usage: angular-api-docs extract [--config <file>]';

export async function main([command, ...args] = process.argv.slice(2)): Promise<number> {
  if (command === '--help' && !args.length) {
    console.log(usage);
    return 0;
  }

  if (command !== 'extract') {
    throw new Error(command ? `Unknown command: ${command}\n${usage}` : usage);
  }

  const { values } = parseArgs({ args, options: { config: { type: 'string' } } });
  const config = await loadConfig(values.config);
  const { prepare } = await import('./prepare.ts');
  const { artifactPath, catalogPath } = await prepare(config);
  console.log(`Prepared API JSON: ${artifactPath}\nReference catalog: ${catalogPath}`);
  return 0;
}
