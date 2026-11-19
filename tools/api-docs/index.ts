/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { fileURLToPath } from 'node:url';

import elementConfig from './config.js';
import { resolveConfig } from './configuration.js';
import { main } from './pipeline/cli.js';

main(resolveConfig(elementConfig, fileURLToPath(new URL('./config.ts', import.meta.url)))).catch(
  (error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  }
);
