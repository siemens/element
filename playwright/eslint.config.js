import defaultValuePlugin from '@siemens/eslint-plugin-defaultvalue';
import { defineConfig } from 'eslint/config';

import { tsConfig } from '../eslint.config.js';

export default defineConfig({
  extends: [...tsConfig],
  plugins: {
    defaultValue: defaultValuePlugin
  },
  files: ['**/*.ts'],
  ignores: ['**/test-helpers/*.ts'],
  rules: {
    '@typescript-eslint/no-floating-promises': ['error']
  },
  languageOptions: {
    parserOptions: {
      project: ['playwright/tsconfig.json']
    }
  }
});
