/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { defineConfig } from 'eslint/config';

import { strictLinterOptions, templateConfig, tsConfig } from '../../eslint.config.js';

export default defineConfig(
  {
    extends: [...tsConfig],
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: ['projects/docs-chat/tsconfig.app.json']
      }
    }
  },
  ...templateConfig,
  ...strictLinterOptions
);
